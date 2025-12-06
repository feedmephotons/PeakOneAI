import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { sessionManager } from '@/lib/agent/session-manager'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get session details and live state
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get session from database
    const session = await prisma.agentSession.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { order: 'asc' }
        },
        screenshots: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get live state if session is active
    let liveState = null
    if (['executing', 'planning', 'paused'].includes(session.status)) {
      liveState = await sessionManager.getLiveViewState(id)
    }

    // Get messages
    const messages = sessionManager.getMessages(id)

    return NextResponse.json({
      session,
      liveState,
      messages
    })
  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

// POST - Session control actions (start, pause, resume, cancel, message)
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, message } = body as {
      action: 'start' | 'pause' | 'resume' | 'cancel' | 'message'
      message?: string
    }

    // Verify session exists
    const session = await prisma.agentSession.findUnique({
      where: { id }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    switch (action) {
      case 'start':
        // Start session in background (don't await to prevent timeout)
        sessionManager.startSession(id).catch(err => {
          console.error('Session start error:', err)
        })
        return NextResponse.json({
          success: true,
          message: 'Session starting'
        })

      case 'pause':
        await sessionManager.pauseSession(id)
        return NextResponse.json({
          success: true,
          message: 'Session paused'
        })

      case 'resume':
        // Resume in background
        sessionManager.resumeSession(id).catch(err => {
          console.error('Session resume error:', err)
        })
        return NextResponse.json({
          success: true,
          message: 'Session resuming'
        })

      case 'cancel':
        await sessionManager.cancelSession(id)
        return NextResponse.json({
          success: true,
          message: 'Session cancelled'
        })

      case 'message':
        if (!message) {
          return NextResponse.json(
            { error: 'Message is required' },
            { status: 400 }
          )
        }
        await sessionManager.sendUserInstruction(id, message)
        return NextResponse.json({
          success: true,
          message: 'Instruction sent'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Session action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}

// DELETE - Close and cleanup session
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Close session
    await sessionManager.closeSession(id)

    return NextResponse.json({
      success: true,
      message: 'Session closed'
    })
  } catch (error) {
    console.error('Close session error:', error)
    return NextResponse.json(
      { error: 'Failed to close session' },
      { status: 500 }
    )
  }
}
