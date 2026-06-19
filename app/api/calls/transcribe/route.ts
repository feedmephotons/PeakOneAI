import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateChatResponse } from '@/lib/gemini'

// POST: Get/generate a transcription for a call ID
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
    }

    const { callId } = body

    if (!callId) {
      return NextResponse.json({ success: false, error: 'Call ID is required' }, { status: 400 })
    }

    const call = await prisma.call.findUnique({
      where: { id: callId },
    })

    if (!call) {
      return NextResponse.json({ success: false, error: 'Call not found' }, { status: 404 })
    }

    // If already transcribed, return it
    if (call.transcription) {
      return NextResponse.json({ success: true, transcript: call.transcription })
    }

    const contactName = call.contactName || 'Valued Customer'

    // Mock-generate transcription using Gemini generateChatResponse
    const promptMessage = `Generate a realistic phone call dialogue transcript between Sarah Chen (Peak One representative) and the contact "${contactName}".
The dialogue should contain 4 to 6 alternating turns.
It must include 1 or 2 clear action items, such as adjusting a start date, scheduling a sync, or updating a document.
Keep the dialogue natural, professional, and write ONLY the dialogue formatted as speaker names followed by colons, like:
Sarah Chen: [dialogue]
${contactName}: [dialogue]

Do not include any headers, introductory text, or markdown code blocks. Just the dialogue lines.`;

    let transcript = null
    try {
      transcript = await generateChatResponse(promptMessage)
    } catch (err) {
      console.error('Gemini transcription generation failed, using fallback:', err)
    }

    if (!transcript || transcript.trim().length === 0) {
      transcript = `Sarah Chen: Hi ${contactName}, thanks for joining. I wanted to touch base on the timeline.
${contactName}: Hi Sarah, yes, we reviewed the onboarding steps.
Sarah Chen: Excellent. Are there any modifications needed on the schedule?
${contactName}: We'd like to push back the project kickoff by one week. Can you update the project plan?
Sarah Chen: I can absolutely do that. I'll send you the updated plan by tomorrow.
${contactName}: Great. And we should schedule a kickoff call with the rest of the team for next Thursday.
Sarah Chen: Perfect. I'll send out the invite for next Thursday.
${contactName}: Thank you, Sarah. Talk soon.`
    }

    // Persist to database
    await prisma.call.update({
      where: { id: callId },
      data: { transcription: transcript },
    })

    return NextResponse.json({ success: true, transcript })
  } catch (error) {
    console.error('[Calls Transcribe API POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to transcribe call' },
      { status: 500 }
    )
  }
}
