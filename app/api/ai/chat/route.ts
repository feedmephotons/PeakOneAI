import { gemini, GEMINI_MODEL, GEMINI_VISION_MODEL, LISA_SYSTEM_PROMPT } from '@/lib/gemini'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { geminiRAG } from '@/lib/rag/gemini-rag-service'

export async function POST(request: Request) {
  try {
    // Multi-tenant authentication with Clerk
    const { userId, orgId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request with RAG options
    const { message, useRAG = true } = await request.json()

    // Check if message mentions attached files (for image analysis)
    const isImageAnalysisRequest = message.includes('[Attached files:') && message.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)/i)

    // Use vision model for images
    const model = isImageAnalysisRequest ? GEMINI_VISION_MODEL : GEMINI_MODEL

    let ragContext = ''
    let ragSources: Array<{ title: string; type: string; id: string }> = []

    // RAG: Retrieve relevant context from organization's knowledge base
    if (useRAG && orgId && !isImageAnalysisRequest) {
      try {
        console.log(`[RAG] Querying knowledge base for org: ${orgId}`)

        const ragResult = await geminiRAG.query(message, {
          topK: 5,
          similarityThreshold: 0.7
        })

        if (ragResult.chunks.length > 0) {
          console.log(`[RAG] Found ${ragResult.chunks.length} relevant chunks`)

          // Build context from RAG results
          ragContext = '\n\n## Context from Organization Knowledge Base:\n\n' +
            ragResult.chunks.map((chunk, i) =>
              `[Source ${i + 1}: ${chunk.metadata.title || 'Unknown'}]\n${chunk.content}`
            ).join('\n\n---\n\n')

          // Track sources for response metadata
          ragSources = ragResult.sources.map(doc => ({
            title: doc.metadata.title,
            type: doc.sourceType,
            id: doc.sourceId
          }))
        } else {
          console.log('[RAG] No relevant context found')
        }
      } catch (ragError) {
        console.error('[RAG] Error querying knowledge base:', ragError)
        // Continue without RAG context
      }
    }

    // Build system message with appropriate context
    let systemMessage = isImageAnalysisRequest
      ? LISA_SYSTEM_PROMPT + '\nThe user has attached an image file. Please acknowledge that you can see it and provide helpful analysis based on the context of their request.'
      : LISA_SYSTEM_PROMPT

    // Add RAG instructions if we have context
    if (ragContext) {
      systemMessage += `

## Knowledge Base Context:
You have access to the organization's knowledge base. When answering questions:
1. Prioritize information from the provided context
2. Cite sources using [Source N] format when referencing specific information
3. If the context doesn't contain relevant information, acknowledge this and provide general guidance
4. Be specific and reference actual details from the context`
    }

    const fullPrompt = ragContext ? message + ragContext : message

    // Get AI response using streaming
    const response = await gemini.models.generateContentStream({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemMessage}\n\nUser: ${fullPrompt}` }
          ]
        }
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      }
    })

    // Create a readable stream
    const encoder = new TextEncoder()
    let isFirstChunk = true

    const stream = new ReadableStream({
      async start(controller) {
        // Send sources first if available (RAG metadata)
        if (isFirstChunk && ragSources.length > 0) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'sources',
              sources: ragSources
            })}\n\n`)
          )
          isFirstChunk = false
        }

        // Stream AI response
        for await (const chunk of response) {
          const content = chunk.text || ''

          if (content) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'content',
                content
              })}\n\n`)
            )
          }
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
