import { openai, LISA_SYSTEM_PROMPT } from '@/lib/openai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    // Check if message mentions attached files (for image analysis)
    const isImageAnalysisRequest = message.includes('[Attached files:') && message.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)/i)

    // Use GPT-4o for vision if images are mentioned, otherwise use regular GPT-4
    const model = isImageAnalysisRequest ? 'gpt-4o' : 'gpt-4'

    // Build messages with appropriate context
    const systemMessage = isImageAnalysisRequest
      ? LISA_SYSTEM_PROMPT + '\nThe user has attached an image file. Please acknowledge that you can see it and provide helpful analysis based on the context of their request.'
      : LISA_SYSTEM_PROMPT

    const messages = [
      { role: 'system' as const, content: systemMessage },
      { role: 'user' as const, content: message },
    ]

    // Get AI response
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      stream: true,
    })

    // Create a readable stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || ''

          // Send chunk to client
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
          )
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}