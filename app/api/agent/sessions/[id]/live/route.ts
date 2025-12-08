import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { agentSessionManager } from '@/lib/agent/agent-session'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get live view state for polling
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get user from database (try supabaseId first, then email)
    let user = await prisma.user.findFirst({
      where: { supabaseId: authUser.id }
    })

    if (!user && authUser.email) {
      user = await prisma.user.findFirst({
        where: { email: authUser.email }
      })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify session exists
    const session = await prisma.agentSession.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        objective: true,
        userId: true
      }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Security: Verify session ownership
    if (session.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this session' }, { status: 403 })
    }

    // Get live state
    const liveState = await agentSessionManager.getLiveViewState(id)

    if (!liveState) {
      return NextResponse.json({
        session: {
          id: session.id,
          status: session.status,
          objective: session.objective
        },
        liveState: null,
        message: 'Session is not currently active'
      })
    }

    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        objective: session.objective
      },
      liveState: {
        screenshot: liveState.screenshot,
        url: liveState.url,
        status: liveState.status,
        currentAction: liveState.currentAction,
        modelResponse: liveState.modelResponse,
        logs: liveState.logs.slice(-20) // Last 20 logs for live view
      }
    })
  } catch (error) {
    console.error('Get live state error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch live state' },
      { status: 500 }
    )
  }
}
