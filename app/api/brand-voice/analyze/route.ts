import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { analyzeText, quickForbiddenTermCheck } from '@/lib/brand-voice/text-analyzer'
import type { AnalysisResult, EnforcementLevel, ExtractedGuidelines, FieldType } from '@/lib/brand-voice/types'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      text,
      workspaceId,
      guidelineId,
      enforcementLevel = 2,
      fieldType = 'other'
    } = body as {
      text: string
      workspaceId: string
      guidelineId?: string
      enforcementLevel?: EnforcementLevel
      fieldType?: FieldType
    }

    if (!text || !workspaceId) {
      return NextResponse.json(
        { error: 'Missing required fields: text, workspaceId' },
        { status: 400 }
      )
    }

    // Security: Verify user has access to this workspace
    const user = await prisma.user.findFirst({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let resolvedWorkspaceId = workspaceId

    if (workspaceId === 'default-workspace') {
      const slug = `default-workspace-${user.id}`
      let workspace
      try {
        workspace = await prisma.workspace.findUnique({
          where: { slug },
        })
        if (!workspace) {
          workspace = await prisma.workspace.create({
            data: {
              name: 'Default Workspace',
              slug,
              clerkOrgId: slug,
            },
          })
        }
      } catch (e) {
        workspace = await prisma.workspace.findUnique({
          where: { slug },
        })
        if (!workspace) throw e
      }

      try {
        const mappingExists = await prisma.userWorkspace.findFirst({
          where: { userId: user.id, workspaceId: workspace.id },
        })
        if (!mappingExists) {
          await prisma.userWorkspace.create({
            data: {
              userId: user.id,
              workspaceId: workspace.id,
              role: 'OWNER',
            },
          })
        }
      } catch (e) {
        // Ignore concurrent inserts
      }

      resolvedWorkspaceId = workspace.id
    }

    // Verify workspace membership unconditionally
    const workspaceMembership = await prisma.userWorkspace.findFirst({
      where: {
        userId: user.id,
        workspaceId: resolvedWorkspaceId
      }
    })

    if (!workspaceMembership) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this workspace' },
        { status: 403 }
      )
    }

    // Get the brand guideline
    let guideline = null

    if (guidelineId) {
      guideline = await prisma.brandGuideline.findFirst({
        where: {
          id: guidelineId,
          workspaceId: resolvedWorkspaceId,
          isActive: true
        },
        include: {
          approvedTerms: true,
          forbiddenTerms: true,
          messagingRules: true
        }
      })
    } else {
      // Get default guideline for workspace
      guideline = await prisma.brandGuideline.findFirst({
        where: {
          workspaceId: resolvedWorkspaceId,
          isActive: true,
          isDefault: true
        },
        include: {
          approvedTerms: true,
          forbiddenTerms: true,
          messagingRules: true
        }
      })
    }

    let guidelines: ExtractedGuidelines

    if (!guideline) {
      const selectedTone = (body as any).selectedTone || (body as any).tone
      const defaultTone = (selectedTone || 'professional').toLowerCase()
      guidelines = {
        voiceTone: defaultTone as ExtractedGuidelines['voiceTone'],
        personality: ['clear', 'helpful', 'concise'],
        approvedTerms: [],
        forbiddenTerms: [],
        messagingRules: [],
        values: []
      }
    } else {
      // Build guidelines object for analyzer
      guidelines = {
        voiceTone: guideline.voiceTone as ExtractedGuidelines['voiceTone'],
        personality: guideline.personality,
        approvedTerms: guideline.approvedTerms.map(t => ({
          term: t.term,
          context: t.context || undefined,
          category: t.category || undefined,
          alternatives: t.alternatives
        })),
        forbiddenTerms: guideline.forbiddenTerms.map(t => ({
          term: t.term,
          reason: t.reason || undefined,
          replacement: t.replacement || undefined,
          severity: t.severity as 'info' | 'warning' | 'error'
        })),
        messagingRules: guideline.messagingRules.map(r => ({
          name: r.name,
          description: r.description,
          category: r.category,
          pattern: r.pattern || undefined,
          template: r.template || undefined,
          examples: r.examples as { good: string[]; bad: string[] } | undefined
        })),
        values: (guideline.extractedRules as { values?: string[] } | null)?.values || []
      }
    }

    // Quick forbidden term check (fast, no AI)
    const quickSuggestions = quickForbiddenTermCheck(text, guidelines.forbiddenTerms)

    // Full AI analysis if enforcement level > 1 or we need more than word checks
    let result: AnalysisResult

    if (enforcementLevel === 1) {
      // Level 1: Only basic checks (could integrate with a spell checker)
      result = {
        suggestions: quickSuggestions,
        overallScore: quickSuggestions.length > 0 ? 80 : 100,
        toneAnalysis: {
          detected: guidelines.voiceTone,
          target: guidelines.voiceTone,
          alignment: 100
        },
        stats: {
          totalIssues: quickSuggestions.length,
          spellingErrors: 0,
          grammarErrors: 0,
          toneIssues: 0,
          wordIssues: quickSuggestions.length,
          structureIssues: 0
        }
      }
    } else {
      // Levels 2-4: Full AI analysis
      result = await analyzeText(text, guidelines, enforcementLevel, fieldType)

      // Merge quick suggestions with AI suggestions (avoid duplicates)
      const aiSuggestionTexts = new Set(result.suggestions.map(s => s.originalText.toLowerCase()))
      const uniqueQuickSuggestions = quickSuggestions.filter(
        s => !aiSuggestionTexts.has(s.originalText.toLowerCase())
      )
      result.suggestions = [...uniqueQuickSuggestions, ...result.suggestions]
      result.stats.totalIssues = result.suggestions.length
      result.stats.wordIssues += uniqueQuickSuggestions.length
    }

    return NextResponse.json({
      ...result,
      hasGuidelines: !!guideline,
      guidelineId: guideline?.id || null,
      guidelineName: guideline?.name || 'Default Tone fallback'
    })

  } catch (error) {
    console.error('Brand voice analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    )
  }
}
