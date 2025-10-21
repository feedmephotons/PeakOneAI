import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateMeetingSummary } from '@/lib/meeting-analyzer'

/**
 * API Endpoint: Generate Meeting Summary
 * POST /api/meetings/summary
 *
 * Body: {
 *   meetingId: string,
 *   meetingTitle?: string,
 *   transcripts: Array<{ speaker: string, text: string, timestamp: string }>
 * }
 */
export async function POST(request: Request) {
  try {
    // Multi-tenant authentication
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { meetingId, meetingTitle, transcripts } = await request.json()

    if (!transcripts || !Array.isArray(transcripts) || transcripts.length === 0) {
      return NextResponse.json(
        { error: 'Transcripts array is required' },
        { status: 400 }
      )
    }

    console.log('[MeetingSummary] Generating summary for meeting:', meetingId)
    console.log('[MeetingSummary] Transcript count:', transcripts.length)

    // Generate full meeting summary using GPT-4
    const result = await generateMeetingSummary(transcripts, meetingTitle)

    console.log('[MeetingSummary] Summary generated with', result.actionItems.length, 'action items')

    return NextResponse.json({
      success: true,
      meetingId,
      summary: result.summary,
      keyPoints: result.keyPoints,
      actionItems: result.actionItems,
      transcriptCount: transcripts.length
    })

  } catch (error) {
    console.error('[MeetingSummary] Error:', error)

    return NextResponse.json(
      {
        error: 'Summary generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
