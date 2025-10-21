import { openai } from '@/lib/openai'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

/**
 * Real-time Audio Transcription Endpoint
 * Uses OpenAI Whisper API to convert speech to text
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

    // Convert File to format Whisper API expects
    const audioBuffer = await audioFile.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type })

    // Create a File object that Whisper expects
    const whisperFile = new File([audioBlob], 'audio.webm', { type: audioFile.type })

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: whisperFile,
      model: 'whisper-1',
      language: 'en', // Can be auto-detected or specified
      response_format: 'text'
    })

    const transcriptText = transcription.toString().trim()

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
