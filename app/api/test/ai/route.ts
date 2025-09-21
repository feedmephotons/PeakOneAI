import { openai } from '@/lib/openai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    // Test OpenAI API with a simple request
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Using 3.5 for testing to save costs
      messages: [
        {
          role: 'system',
          content: 'You are Lisa, a helpful AI assistant for SaasX. Keep responses brief for testing.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 50,
      temperature: 0.7
    })

    const response = completion.choices[0]?.message?.content

    return NextResponse.json({
      success: true,
      message: 'AI integration working',
      response
    })
  } catch (error) {
    console.error('AI test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'AI test failed'
    }, { status: 500 })
  }
}