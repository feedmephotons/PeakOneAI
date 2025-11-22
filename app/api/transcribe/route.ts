import { transcribeAudioWithGemini } from '@/lib/gemini'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

/**
 * Real-time Audio Transcription Endpoint
 * Uses Google Gemini 2.5 API to convert speech to text
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const meetingId = formData.get('meetingId') as string

    // Multi-tenant authentication (optional - allowing unauthenticated access during development)
    let userId: string | null = null
    try {
      const authResult = await auth()
      userId = authResult.userId
    } catch (authError) {
      console.log('[Transcribe] Auth unavailable, allowing unauthenticated access')
    }

    // TODO: Re-enable authentication requirement when Clerk is fully configured
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }
    const audioFile = formData.get('audio') as File
    const speakerName = formData.get('speakerName') as string

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    console.log(`[Transcribe] Processing audio for meeting ${meetingId}`)
    console.log(`[Transcribe] File type: ${audioFile.type}, size: ${audioFile.size}`)

    // Convert File to base64 for Gemini API
    const audioBuffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')

    // Determine MIME type - Gemini supports various audio formats
    let mimeType = audioFile.type
    if (!mimeType || mimeType === 'audio/webm') {
      // Default to webm with opus codec (common for browser recordings)
      mimeType = 'audio/webm'
    }

    // Call Gemini API for transcription
    const transcriptText = await transcribeAudioWithGemini(base64Audio, mimeType)

    if (!transcriptText) {
      console.log('[Transcribe] No transcription result')
      return NextResponse.json({
        success: true,
        transcript: '',
        speaker: speakerName,
        meetingId,
        timestamp: new Date().toISOString()
      })
    }

    // Filter out common hallucinations (phrases AI might generate during silence)
    const hallucinations = [
      'thank you for watching',
      'thanks for watching',
      'pissedconsumer.com',
      'subscribe',
      'like and subscribe',
      'hit the bell',
      'check out',
      'visit our website',
      'www.',
      'http',
      '[music]',
      '[applause]',
      '[silence]',
      '[inaudible]'
    ]

    const isHallucination = hallucinations.some(phrase =>
      transcriptText.toLowerCase().includes(phrase.toLowerCase())
    )

    // If it's too short or a hallucination, return empty
    if (transcriptText.length < 3 || isHallucination) {
      console.log(`[Transcribe] Filtered out hallucination/noise: "${transcriptText}"`)
      return NextResponse.json({
        success: true,
        transcript: '', // Return empty to skip
        speaker: speakerName,
        meetingId,
        timestamp: new Date().toISOString()
      })
    }

    console.log(`[Transcribe] Result: "${transcriptText}"`)

    return NextResponse.json({
      success: true,
      transcript: transcriptText,
      speaker: speakerName,
      meetingId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Transcribe] Error:', error)

    return NextResponse.json(
      {
        error: 'Transcription failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
