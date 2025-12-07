import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { extractGuidelinesFromDocument, extractGuidelinesFromText } from '@/lib/brand-voice/guideline-extractor'

// GET - List all guidelines for a workspace
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Missing workspaceId parameter' },
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

    const guidelines = await prisma.brandGuideline.findMany({
      where: { workspaceId },
      include: {
        approvedTerms: { take: 10 },
        forbiddenTerms: { take: 10 },
        messagingRules: { take: 5 },
        _count: {
          select: {
            approvedTerms: true,
            forbiddenTerms: true,
            messagingRules: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ guidelines })
  } catch (error) {
    console.error('Get guidelines error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guidelines' },
      { status: 500 }
    )
  }
}

// POST - Create a new guideline (with optional PDF extraction)
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user from database
    const user = await prisma.user.findFirst({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      description,
      workspaceId,
      voiceTone = 'professional',
      personality = [],
      // For PDF extraction
      fileBase64,
      fileMimeType,
      // For text extraction
      guidelinesText,
      // Manual entry
      approvedTerms = [],
      forbiddenTerms = [],
      messagingRules = [],
      isDefault = false
    } = body

    if (!name || !workspaceId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, workspaceId' },
        { status: 400 }
      )
    }

    // Security: Verify user has access to this workspace (skip for default-workspace in development)
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

    // Check if name already exists
    const existing = await prisma.brandGuideline.findFirst({
      where: { workspaceId, name }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A guideline with this name already exists' },
        { status: 409 }
      )
    }

    // Extract guidelines from PDF or text if provided
    let extractedRules = null

    if (fileBase64 && fileMimeType) {
      try {
        extractedRules = await extractGuidelinesFromDocument(fileBase64, fileMimeType)
      } catch (error) {
        console.error('PDF extraction failed:', error)
        // Continue without extraction
      }
    } else if (guidelinesText) {
      try {
        extractedRules = await extractGuidelinesFromText(guidelinesText)
      } catch (error) {
        console.error('Text extraction failed:', error)
      }
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.brandGuideline.updateMany({
        where: { workspaceId, isDefault: true },
        data: { isDefault: false }
      })
    }

    // Create the guideline
    const guideline = await prisma.brandGuideline.create({
      data: {
        name,
        description,
        workspaceId,
        voiceTone: extractedRules?.voiceTone || voiceTone,
        personality: extractedRules?.personality || personality,
        extractedRules: extractedRules || undefined,
        isDefault,
        createdById: user.id,
        // Create related terms and rules
        approvedTerms: {
          create: [
            ...(extractedRules?.approvedTerms || []).map(t => ({
              term: t.term,
              context: t.context,
              category: t.category,
              alternatives: t.alternatives || []
            })),
            ...approvedTerms.map((t: { term: string; context?: string; category?: string; alternatives?: string[] }) => ({
              term: t.term,
              context: t.context,
              category: t.category,
              alternatives: t.alternatives || []
            }))
          ]
        },
        forbiddenTerms: {
          create: [
            ...(extractedRules?.forbiddenTerms || []).map(t => ({
              term: t.term,
              reason: t.reason,
              replacement: t.replacement,
              severity: t.severity || 'warning'
            })),
            ...forbiddenTerms.map((t: { term: string; reason?: string; replacement?: string; severity?: string }) => ({
              term: t.term,
              reason: t.reason,
              replacement: t.replacement,
              severity: t.severity || 'warning'
            }))
          ]
        },
        messagingRules: {
          create: [
            ...(extractedRules?.messagingRules || []).map(r => ({
              name: r.name,
              description: r.description,
              category: r.category,
              pattern: r.pattern,
              template: r.template,
              examples: r.examples || {}
            })),
            ...messagingRules.map((r: { name: string; description: string; category: string; pattern?: string; template?: string; examples?: object }) => ({
              name: r.name,
              description: r.description,
              category: r.category,
              pattern: r.pattern,
              template: r.template,
              examples: r.examples || {}
            }))
          ]
        }
      },
      include: {
        approvedTerms: true,
        forbiddenTerms: true,
        messagingRules: true
      }
    })

    return NextResponse.json({
      guideline,
      extracted: !!extractedRules
    })
  } catch (error) {
    console.error('Create guideline error:', error)
    return NextResponse.json(
      { error: 'Failed to create guideline' },
      { status: 500 }
    )
  }
}
