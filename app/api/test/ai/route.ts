import { gemini, GEMINI_MODEL } from '@/lib/gemini'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    // Test Gemini API with a simple request
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: `You are Lisa, a helpful AI assistant for PeakOne AI. Keep responses brief for testing.\n\nUser: ${message}` }
          ]
        }
      ],
      config: {
        maxOutputTokens: 50,
        temperature: 0.7
      }
    })

    const responseText = response.text

    return NextResponse.json({
      success: true,
      message: 'Gemini AI integration working',
      response: responseText
    })
  } catch (error) {
    console.error('AI test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'AI test failed'
    }, { status: 500 })
  }
}
