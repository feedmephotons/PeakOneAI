import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { rewriteForBrandVoice } from '@/lib/brand-voice/text-analyzer'
import type { ExtractedGuidelines } from '@/lib/brand-voice/types'

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
      preserveIntent = true
    } = body as {
      text: string
      workspaceId: string
      guidelineId?: string
      preserveIntent?: boolean
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
      // Get default guideline
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
      // Build guidelines object
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

    const result = await rewriteForBrandVoice(text, guidelines, preserveIntent)

    return NextResponse.json({
      ...result,
      guidelineId: guideline?.id || null,
      guidelineName: guideline?.name || 'Default Tone fallback'
    })

  } catch (error) {
    console.error('Brand voice rewrite error:', error)
    return NextResponse.json(
      { error: 'Failed to rewrite text' },
      { status: 500 }
    )
  }
}
