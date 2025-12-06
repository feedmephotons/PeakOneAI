import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { sessionManager } from '@/lib/agent/session-manager'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get live view state for polling
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify session exists
    const session = await prisma.agentSession.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        objective: true
      }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get live state
    const liveState = await sessionManager.getLiveViewState(id)

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
        progress: liveState.progress,
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
