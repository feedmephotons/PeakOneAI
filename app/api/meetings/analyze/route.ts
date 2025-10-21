import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { analyzeTranscriptChunk, mightContainActionItem } from '@/lib/meeting-analyzer'

/**
 * API Endpoint: Analyze Meeting Transcript for Action Items
 * POST /api/meetings/analyze
 *
 * Body: {
 *   transcript: string,
 *   context?: string (previous context for better analysis)
 * }
 */
export async function POST(request: Request) {
  try {
    const { transcript, context, meetingId } = await request.json()

    // Allow demo meetings without authentication
    const isDemoMode = meetingId === 'client-demo' || meetingId?.startsWith('demo-')

    // Multi-tenant authentication (optional for demo mode)
    let userId: string | null = null
    try {
      const authResult = await auth()
      userId = authResult.userId
    } catch (authError) {
      console.log('[Analyze] Auth unavailable, checking demo mode')
    }

    if (!userId && !isDemoMode) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      )
    }

    console.log('[Analyze] Analyzing transcript:', transcript.substring(0, 100) + '...')

    // Quick check if it might contain action items (saves API calls)
    if (!mightContainActionItem(transcript)) {
      console.log('[Analyze] No action item patterns detected, skipping AI analysis')
      return NextResponse.json({
        actionItems: []
      })
    }

    // Use GPT-4 to extract action items
    const actionItems = await analyzeTranscriptChunk(transcript, context)

    console.log('[Analyze] Found', actionItems.length, 'action items')

    return NextResponse.json({
      actionItems
    })

  } catch (error) {
    console.error('[Analyze] Error:', error)

    return NextResponse.json(
      {
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
