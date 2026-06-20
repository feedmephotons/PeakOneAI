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

// Keyword-based simulated AI responses, grounded in the canonical Acme Corp /
// Sarah Chen / Launch Product X world (mirrors lib/peak/mock.ts). This is the
// default keyless demo, so it must stay on-world and consistent with /lisa,
// the Daily Brief, missions, priorities, and people.
function getMockResponseText(input: string): string {
  const lowerInput = input.toLowerCase()

  // Brian Miller / pricing / investor
  if (lowerInput.includes('brian') || lowerInput.includes('pricing') || lowerInput.includes('investor') || lowerInput.includes('summit')) {
    return `Here's where things stand with **Brian Miller** (Summit Ventures): 💬

- He has not replied to your **pricing follow-up** in 4 days.
- His open concern is **margin** — it overlaps with the Q2 campaign messaging you're about to lock.
- Good news to lead with: the **Q2 campaign is tracking 18% above target** on qualified pipeline.

**Suggested next step:** send him the pipeline result plus a one-page rationale for the **$49 anchor / annual-discount** pricing, and ask for 20 minutes before Thursday's board update. Want me to draft that email?`
  }

  // Launch Product X / mission status
  if (lowerInput.includes('launch') || lowerInput.includes('product x') || lowerInput.includes('mission') || lowerInput.includes('status')) {
    return `**Launch Product X** is **ON TRACK at 72%** (health 81). 🚀

**Objectives**
- Finalize spec & roadmap — 100% ✅
- Ship core feature set to beta — 85%
- Legal & compliance review — 45% ⚠️ (at risk)
- Q2 marketing campaign — 70%
- Onboard first 10 design partners — 60%

**The one risk to watch:** the legal/compliance review is your only **HIGH** risk with the **June 30** launch six weeks out. Tom Becker flagged contract terms that need outside counsel. Unblocking legal this week protects the date.`
  }

  // Tasks / todos
  if (lowerInput.includes('task') || lowerInput.includes('todo') || lowerInput.includes('organize') || lowerInput.includes('priorit')) {
    return `Here are your **top priorities** today: 📋

1. **Respond to Brian Miller on pricing** — URGENT, no reply in 4 days (blocking the board update).
2. **Unblock legal review for Product X** — HIGH, compliance is at 45%; engage outside counsel.
3. **Approve Q2 launch comms calendar** — Lisa Park needs sign-off to lock launch week.

On the board, the long poles are the **GA candidate sign-off** (David Kim, due the 22nd) and the **outside-counsel brief**. Want me to reprioritize or assign any of these?`
  }

  // Meetings / schedule / calendar
  if (lowerInput.includes('meeting') || lowerInput.includes('schedule') || lowerInput.includes('calendar')) {
    return `Your schedule today: 📅

- **6:00 PM** — Q2 Campaign Review with **Lisa Park** (campaign is 18% above target; decide on the launch-week sequence).
- **8:00 PM** — Launch Sync (**Eng + Legal**) — resolve the legal review timeline before the GA candidate.

The Launch Sync is the important one: it's where you can approve outside counsel and get a dated path to legal sign-off from Tom Becker. Want a quick prep brief for either meeting?`
  }

  // Documents / files
  if (lowerInput.includes('document') || lowerInput.includes('analyze') || lowerInput.includes('file')) {
    return `I can pull from your workspace documents. 📄 The ones most relevant right now:

- **Product Launch Plan.pdf** — the June 30 runbook (eng: David, comms: Lisa, legal: Tom).
- **Q2 Marketing Strategy.docx** — the campaign tracking 18% above target.
- **Competitive Pricing Research.xlsx** — the $49 anchor recommendation.

Upload a file with the paperclip and I'll summarize it and link it to the right mission. What would you like me to analyze?`
  }

  // Email / draft
  if (lowerInput.includes('email') || lowerInput.includes('message') || lowerInput.includes('draft')) {
    return `Happy to draft something. ✉️ A few that would move things forward today:

1. **Pricing follow-up to Brian Miller** — lead with the 18%-above-target pipeline and the $49 rationale.
2. **Comms-calendar sign-off to Lisa Park** — approve so she can lock launch week.
3. **Outside-counsel approval to Tom Becker** — unblock the compliance review.

Tell me which one and I'll write it in your Acme brand voice.`
  }

  // Analytics / reports
  if (lowerInput.includes('data') || lowerInput.includes('analytics') || lowerInput.includes('report') || lowerInput.includes('metric')) {
    return `Here's the Acme snapshot heading into the board update: 📈

- **Qualified pipeline:** 18% above target
- **Launch Product X:** 72% complete, health 81
- **Missions:** Launch Product X (72%, on track), Q2 Growth Engine (48%, at risk), Platform Reliability (88%, on track)
- **Open risks:** 1 HIGH (legal/compliance review)

Want me to assemble the Q2 board deck or a one-page exec summary from this?`
  }

  // Help / capabilities
  if (lowerInput.includes('help') || lowerInput === '?' || lowerInput.includes('what can you do')) {
    return `I'm **Lisa**, your AI chief of staff for Acme Corp. 🚀 I can:

📋 **Priorities & tasks** — what to do next across Launch Product X, Q2 Growth, and Reliability
🤝 **Relationships** — prep you for Brian Miller, Jenna Rivera, Tom Becker, or your team
📅 **Meetings** — brief you before, summarize after, and pull out action items
📄 **Documents** — summarize files and draft reports/decks in your brand voice
📊 **Insights** — surface risks (like the legal review) before they bite

Just ask — e.g. "prep me for Brian" or "what's at risk on the launch?"`
  }

  return `Got it — you're asking about "${input}". Here's how I'd help in the context of **Acme Corp** and the **Product X launch**:

- Tie it back to your live missions and this week's priorities (legal review, Brian's pricing reply, the comms-calendar sign-off).
- Draft any email, note, or doc in your Acme brand voice.
- Flag anything that puts the **June 30** launch date at risk.

What would you like me to do specifically?`
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
