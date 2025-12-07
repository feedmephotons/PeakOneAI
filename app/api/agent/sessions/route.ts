import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { sessionManager } from '@/lib/agent/session-manager'

// GET - List all agent sessions for a workspace
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

    // Get user from database
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

    // Security: Only return sessions owned by this user in the workspace
    const sessions = await prisma.agentSession.findMany({
      where: {
        workspaceId,
        userId: user.id  // Only show user's own sessions
      },
      include: {
        tasks: {
          select: {
            id: true,
            description: true,
            status: true,
            order: true
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            tasks: true,
            screenshots: true,
            logs: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Get agent sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

// POST - Create a new agent session
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      workspaceId,
      objective,
      startUrl
    } = body as {
      workspaceId: string
      objective: string
      startUrl?: string
    }

    if (!workspaceId || !objective) {
      return NextResponse.json(
        { error: 'Missing required fields: workspaceId, objective' },
        { status: 400 }
      )
    }

    // Get user from database
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

    // Create session using session manager
    const session = await sessionManager.createSession(
      workspaceId,
      user.id,
      objective,
      startUrl
    )

    return NextResponse.json({
      session: {
        id: session.id,
        objective: session.objective,
        status: session.status,
        startUrl: session.currentUrl,
        createdAt: session.startedAt
      }
    })
  } catch (error) {
    console.error('Create agent session error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
