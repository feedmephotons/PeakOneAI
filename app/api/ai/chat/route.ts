import { openai, LISA_SYSTEM_PROMPT } from '@/lib/openai'
import { NextResponse } from 'next/server'
// import { auth } from '@clerk/nextjs' // TODO: Uncomment when Clerk is installed
import { geminiRAG } from '@/lib/rag/gemini-rag-service'

// Mock auth for now - TODO: Replace with Clerk
function auth() {
  return {
    userId: 'user_demo',
    orgId: 'org_demo'
  }
}

export async function POST(request: Request) {
  try {
    // Multi-tenant authentication with Clerk
    const { userId, orgId } = auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request with RAG options
    const { message, useRAG = true, conversationId } = await request.json()

    // Check if message mentions attached files (for image analysis)
    const isImageAnalysisRequest = message.includes('[Attached files:') && message.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)/i)

    // Use GPT-4o for vision if images are mentioned, otherwise use regular GPT-4
    const model = isImageAnalysisRequest ? 'gpt-4o' : 'gpt-4'

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

    // Build messages with appropriate context
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

    const messages = [
      { role: 'system' as const, content: systemMessage },
      {
        role: 'user' as const,
        content: ragContext ? message + ragContext : message
      },
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
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || ''

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