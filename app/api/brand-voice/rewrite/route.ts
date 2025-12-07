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

    // Check workspace membership (skip for default-workspace in development)
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isDefaultWorkspace = workspaceId === 'default-workspace'

    if (!isDevelopment || !isDefaultWorkspace) {
      const workspaceMembership = await prisma.userWorkspace.findFirst({
        where: {
          userId: user.id,
          workspaceId
        }
      })

      if (!workspaceMembership) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have access to this workspace' },
          { status: 403 }
        )
      }
    }

    // Get the brand guideline
    let guideline = null

    if (guidelineId) {
      guideline = await prisma.brandGuideline.findFirst({
        where: {
          id: guidelineId,
          workspaceId,
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
          workspaceId,
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

    if (!guideline) {
      return NextResponse.json(
        { error: 'No active brand guidelines found' },
        { status: 404 }
      )
    }

    // Build guidelines object
    const guidelines: ExtractedGuidelines = {
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

    const result = await rewriteForBrandVoice(text, guidelines, preserveIntent)

    return NextResponse.json({
      ...result,
      guidelineId: guideline.id,
      guidelineName: guideline.name
    })

  } catch (error) {
    console.error('Brand voice rewrite error:', error)
    return NextResponse.json(
      { error: 'Failed to rewrite text' },
      { status: 500 }
    )
  }
}
