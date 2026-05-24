import { gemini, GEMINI_MODEL, GEMINI_VISION_MODEL, LISA_SYSTEM_PROMPT } from '@/lib/gemini'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { geminiRAG } from '@/lib/rag/gemini-rag-service'

// Helper to strip the data URL prefix from base64 string
function getBase64DataOnly(base64Str: string): string {
  const commaIdx = base64Str.indexOf(',')
  return commaIdx !== -1 ? base64Str.substring(commaIdx + 1) : base64Str
}

// Helper to decode base64 back into plain text string
function decodeBase64ToString(base64Str: string): string {
  const dataOnly = getBase64DataOnly(base64Str)
  return Buffer.from(dataOnly, 'base64').toString('utf-8')
}

function isBinaryBuffer(buffer: Buffer): boolean {
  let controlChars = 0;
  const checkLength = Math.min(buffer.length, 512);
  for (let i = 0; i < checkLength; i++) {
    const byte = buffer[i];
    if (byte === 0) return true; // Null byte is binary
    if (byte < 7 || (byte > 14 && byte < 32)) {
      controlChars++;
    }
  }
  return checkLength > 0 && (controlChars / checkLength) > 0.1;
}

// Keyword-based simulated AI responses (matching client getAIResponse)
function getMockResponseText(input: string): string {
  const lowerInput = input.toLowerCase()

  if (lowerInput.includes('task') || lowerInput.includes('todo') || lowerInput.includes('organize')) {
    return `I can help you organize your tasks! Here's what I suggest:

📋 **Current Priority Tasks:**
1. Review pending pull requests
2. Update project documentation
3. Prepare for tomorrow's standup meeting
4. Complete code review for the authentication module

Would you like me to:
- Create a new task list
- Set priorities for existing tasks
- Schedule reminders for deadlines
- Analyze your productivity patterns?`
  }

  if (lowerInput.includes('document') || lowerInput.includes('analyze') || lowerInput.includes('file')) {
    return `I can analyze documents and files for you!

📄 **Document Analysis Capabilities:**
- Extract key information and summaries
- Identify important dates and deadlines
- Find patterns and insights
- Generate reports and visualizations

To analyze a document, simply upload it using the paperclip icon. I support:
- PDF files
- Word documents (.doc, .docx)
- Text files
- Spreadsheets
- Images with text

What type of document would you like to analyze?`
  }

  if (lowerInput.includes('meeting') || lowerInput.includes('schedule') || lowerInput.includes('calendar')) {
    return `Let me help you with scheduling! 📅

**Your Upcoming Schedule:**
- 10:00 AM - Team standup (in 2 hours)
- 2:00 PM - Client presentation
- 3:30 PM - Code review session
- Tomorrow 9:00 AM - Sprint planning

**Available time slots today:**
- 11:00 AM - 12:00 PM
- 12:30 PM - 1:30 PM
- 4:00 PM - 5:30 PM

Would you like to:
- Schedule a new meeting
- Send calendar invites
- Find common availability
- Set up recurring meetings?`
  }

  if (lowerInput.includes('activity') || lowerInput.includes('recent') || lowerInput.includes('summary')) {
    return `Here's your activity summary: 📊

**Today's Activity:**
- 12 tasks completed ✅
- 8 files uploaded
- 23 messages sent
- 3 meetings attended

**Weekly Stats:**
- Productivity: Up 15% from last week
- Most active: Tuesday (45 tasks)
- Focus time: 28 hours
- Collaboration: 15 team interactions

**Trending Topics in Your Work:**
1. Authentication implementation
2. Database optimization
3. UI/UX improvements
4. Testing coverage

Need more detailed analytics?`
  }

  if (lowerInput.includes('code') || lowerInput.includes('debug') || lowerInput.includes('error') || lowerInput.includes('implement')) {
    return `I can help with your development tasks! 💻

**Development Assistance:**
- Code review and optimization
- Bug identification and fixes
- Implementation suggestions
- Best practices and patterns

**Recent Code Activities:**
- Fixed authentication bug in login flow
- Optimized database queries (40% faster)
- Added unit tests (coverage: 78%)
- Refactored payment module

What specific coding task do you need help with?`
  }

  if (lowerInput.includes('help') || lowerInput === '?' || lowerInput.includes('what can you do')) {
    return `I'm Lisa, your AI assistant! Here's how I can help you: 🚀

**My Capabilities:**
📋 **Task Management** - Organize, prioritize, and track tasks
📄 **Document Analysis** - Extract insights from files
📅 **Smart Scheduling** - Manage calendars and meetings
📊 **Analytics** - Track productivity and patterns
💻 **Code Assistant** - Help with development tasks
💬 **Communication** - Draft emails and messages
🔍 **Smart Search** - Find information quickly
🎯 **Project Planning** - Roadmaps and timelines

Just ask me anything or click on a quick action to get started!`
  }

  if (lowerInput.includes('email') || lowerInput.includes('message') || lowerInput.includes('draft')) {
    return `I'll help you with your communications! ✉️

**Draft Templates Ready:**
1. Project update email
2. Meeting follow-up
3. Client proposal
4. Team announcement

**Recent Communications:**
- Sent: 5 emails today
- Received: 12 new messages
- Pending: 3 draft responses

Would you like me to:
- Draft a new email
- Summarize unread messages
- Schedule email send
- Create email templates?`
  }

  if (lowerInput.includes('data') || lowerInput.includes('analytics') || lowerInput.includes('report')) {
    return `Let me generate analytics for you! 📈

**Performance Metrics:**
- Project completion: 87% on track
- Team velocity: 42 story points/sprint
- Code quality: A- (improved from B+)
- Customer satisfaction: 4.6/5.0

**Key Insights:**
- Productivity peaks on Tuesdays
- 30% faster task completion this month
- Meeting efficiency improved by 25%
- Suggestion: Batch similar tasks for better focus

What specific metrics would you like to explore?`
  }

  return `I understand you're asking about "${input}". Let me help you with that!

Based on your request, I can:
- Search for relevant information
- Create action items
- Provide recommendations
- Connect you with the right resources

How would you like me to assist you specifically with this?`
}

// Helper to stream a simulated mock SSE response
function streamMockResponse(message: string, reason?: string) {
  const encoder = new TextEncoder()
  let responseText = ''

  if (reason === 'auth') {
    responseText = "Authentication required. Please sign in to use Lisa AI Assistant."
  } else if (reason === 'key') {
    responseText = "Gemini API key is not configured. Running in simulated offline mode.\n\n" + getMockResponseText(message)
  } else {
    responseText = "An error occurred while connecting to Gemini. Running in simulated fallback mode.\n\n" + getMockResponseText(message)
  }

  const words = responseText.split(' ')

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i === words.length - 1 ? '' : ' ')
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'content',
            content: word
          })}\n\n`)
        )
        // Simulate a slight streaming delay (50ms per word)
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

export async function POST(request: Request) {
  let message = ''
  let useRAG = true
  let attachments: any[] = []

  try {
    const body = await request.json()
    message = body.message || ''
    useRAG = body.useRAG !== undefined ? body.useRAG : true
    attachments = body.attachments || []
  } catch (err) {
    console.error('[Lisa Chat] Error parsing request JSON:', err)
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 })
  }

  try {
    // Authentication with Supabase / Demo Mode
    const user = await getCurrentUser()

    // 1. If auth is missing, return SSE mock stream instead of JSON error
    if (!user) {
      console.log('[Lisa Chat] User not authenticated. Streaming fallback.')
      return streamMockResponse(message, 'auth')
    }

    // 2. If GEMINI_API_KEY environment variable is missing/empty, stream mock fallback
    if (!process.env.GEMINI_API_KEY) {
      console.log('[Lisa Chat] GEMINI_API_KEY missing. Streaming fallback.')
      return streamMockResponse(message, 'key')
    }

    // Use user's email domain as org context (for RAG)
    const orgId = user.email?.split('@')[1] || 'default'

    // Check if message mentions attached files (for image analysis) or has actual attachments
    const hasAttachments = attachments && attachments.length > 0
    const isImageAnalysisRequest = hasAttachments || (message.includes('[Attached files:') && message.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)/i))

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
          similarityThreshold: 0.7,
          orgId: orgId
        } as any)

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
      ? LISA_SYSTEM_PROMPT + '\nThe user has attached a file/image. Please acknowledge that you can see it and provide helpful analysis based on the context of their request.'
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

    // Map each attachment into a Gemini part object
    const userParts: any[] = [
      { text: `${systemMessage}\n\nUser: ${fullPrompt}` }
    ]

    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        if (!att.base64) continue
        const mime = att.type.toLowerCase()
        const isImage = mime.startsWith('image/')
        const isPdf = mime === 'application/pdf'

        if (isImage || isPdf) {
          const dataOnly = getBase64DataOnly(att.base64)
          userParts.push({
            inlineData: {
              data: dataOnly,
              mimeType: att.type
            }
          })
        } else {
          // Decode text-based files and pass as text context
          const dataOnly = getBase64DataOnly(att.base64)
          const buffer = Buffer.from(dataOnly, 'base64')
          if (isBinaryBuffer(buffer)) {
            // Gracefully omit binary data to prevent sending garbage strings to Gemini
            userParts.push({
              text: `\n\n[Attached File: ${att.name} (Binary format content omitted)]\n`
            })
          } else {
            const decoded = buffer.toString('utf-8')
            userParts.push({
              text: `\n\n[Attached File Content: ${att.name}]\n${decoded}\n`
            })
          }
        }
      }
    }

    // Get AI response using streaming
    let response
    try {
      response = await gemini.models.generateContentStream({
        model,
        contents: [
          {
            role: 'user',
            parts: userParts
          }
        ],
        config: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      })
    } catch (apiError) {
      console.error('[Lisa Chat] Gemini API error, streaming fallback:', apiError)
      return streamMockResponse(message, 'api-fail')
    }

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

        try {
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
        } catch (streamError) {
          console.error('[Lisa Chat] Error during stream read, sending fallback chunk:', streamError)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'content',
              content: '\n\n[System note: Connection to Gemini was lost. Switching to offline simulation.]\n\n'
            })}\n\n`)
          )
          const mockText = getMockResponseText(message)
          const words = mockText.split(' ')
          for (const word of words) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'content',
                content: word + ' '
              })}\n\n`)
            )
            await new Promise(resolve => setTimeout(resolve, 50))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
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
    return streamMockResponse(message, 'error')
  }
}
