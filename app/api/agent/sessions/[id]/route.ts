import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { sessionManager } from '@/lib/agent/session-manager'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Helper to get user from auth
async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return { authUser: null, dbUser: null }
  }

  // Get user from database (try supabaseId first, then email)
  let dbUser = await prisma.user.findFirst({
    where: { supabaseId: authUser.id }
  })

  if (!dbUser && authUser.email) {
    dbUser = await prisma.user.findFirst({
      where: { email: authUser.email }
    })
  }

  return { authUser, dbUser }
}

// GET - Get session details and live state
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { authUser, dbUser } = await getAuthUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
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

    // Security: Verify session ownership
    if (session.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this session' }, { status: 403 })
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
    const { authUser, dbUser } = await getAuthUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
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

    // Security: Verify session ownership
    if (session.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this session' }, { status: 403 })
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
    const { authUser, dbUser } = await getAuthUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id } = await params

    // Verify session exists and check ownership
    const session = await prisma.agentSession.findUnique({
      where: { id }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Security: Verify session ownership
    if (session.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this session' }, { status: 403 })
    }

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
