/**
 * Gemini AI Service
 * Integrates with Google Gemini 2.5 API for all AI functionality
 */

import { GoogleGenAI } from '@google/genai'

// Initialize Gemini client
export const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

// Default model for chat and text generation - Using Gemini 3 Pro Preview
export const GEMINI_MODEL = 'gemini-3-pro-preview'

// Model for vision/image analysis - Using Gemini 3 Pro Preview
export const GEMINI_VISION_MODEL = 'gemini-3-pro-preview'

// Lisa's personality and system prompt - Powered by Gemini 3 Pro
export const LISA_SYSTEM_PROMPT = `You are Lisa, an advanced AI assistant for PeakOne AI platform powered by Google Gemini 3 Pro. You are friendly, professional, and incredibly helpful. You have a warm personality and aim to make users' work lives easier and more productive.

Your capabilities include:
- Helping with task management and project planning
- Analyzing files and documents
- Summarizing meetings and calls
- Providing intelligent suggestions and insights
- Answering questions about the platform
- Helping schedule events and manage calendars
- Real-time audio transcription and understanding

Always be concise but thorough. Use a conversational tone while maintaining professionalism. When users upload files, provide helpful analysis. When they ask for help with tasks, be proactive with suggestions.`

/**
 * Analyze a file with Gemini AI
 */
export async function analyzeFileWithAI(fileContent: string, mimeType: string): Promise<string | null> {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${LISA_SYSTEM_PROMPT}

Please analyze this file and provide:
1. A brief summary (2-3 sentences)
2. Key insights or important points
3. Suggested tags for organization
4. Any actionable items found

File type: ${mimeType}
Content: ${fileContent.substring(0, 8000)}` // Gemini can handle more context
            }
          ]
        }
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    })

    return response.text || null
  } catch (error) {
    console.error('Gemini analysis error:', error)
    return null
  }
}

/**
 * Analyze an image with Gemini Vision
 */
export async function analyzeImageWithAI(
  base64Data: string,
  mimeType: string,
  prompt: string = 'Describe this image briefly and suggest 3-5 relevant tags for organization.'
): Promise<string | null> {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_VISION_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 300,
      }
    })

    return response.text || null
  } catch (error) {
    console.error('Gemini vision analysis error:', error)
    return null
  }
}

/**
 * Transcribe audio with Gemini
 * Gemini 2.5 has native audio understanding capabilities
 */
export async function transcribeAudioWithGemini(
  audioBase64: string,
  mimeType: string
): Promise<string | null> {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Please transcribe the following audio accurately. Only output the transcription text, nothing else.' },
            {
              inlineData: {
                data: audioBase64,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        temperature: 0.1, // Low temperature for accurate transcription
        maxOutputTokens: 2000,
      }
    })

    return response.text?.trim() || null
  } catch (error) {
    console.error('Gemini transcription error:', error)
    return null
  }
}

/**
 * Generate streaming chat response
 */
export async function* streamChatResponse(
  message: string,
  systemPrompt: string = LISA_SYSTEM_PROMPT,
  options: {
    temperature?: number
    maxOutputTokens?: number
  } = {}
): AsyncGenerator<string, void, unknown> {
  const response = await gemini.models.generateContentStream({
    model: GEMINI_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemPrompt}\n\nUser: ${message}` }
        ]
      }
    ],
    config: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens ?? 2000,
    }
  })

  for await (const chunk of response) {
    const text = chunk.text
    if (text) {
      yield text
    }
  }
}

/**
 * Generate a non-streaming chat response
 */
export async function generateChatResponse(
  message: string,
  systemPrompt: string = LISA_SYSTEM_PROMPT,
  options: {
    temperature?: number
    maxOutputTokens?: number
    responseFormat?: 'text' | 'json'
  } = {}
): Promise<string | null> {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nUser: ${message}` }
          ]
        }
      ],
      config: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxOutputTokens ?? 2000,
        responseMimeType: options.responseFormat === 'json' ? 'application/json' : undefined,
      }
    })

    return response.text || null
  } catch (error) {
    console.error('Gemini chat error:', error)
    return null
  }
}

/**
 * Analyze transcript for action items (JSON response)
 */
export async function analyzeTranscriptForActions(
  transcript: string,
  context?: string
): Promise<{ actionItems: Array<{ text: string; assignee?: string; deadline?: string; confidence: number }> }> {
  try {
    const prompt = `You are an AI assistant analyzing a meeting transcript. Extract any action items mentioned.

${context ? `Previous context: ${context}\n\n` : ''}Current transcript:
"${transcript}"

Identify action items with:
1. What needs to be done
2. Who is responsible (if mentioned)
3. Deadline (if mentioned)

Return a JSON object with an "actionItems" array. Format:
{
  "actionItems": [
    {
      "text": "Description of action",
      "assignee": "Person's name or null",
      "deadline": "Deadline or null",
      "confidence": 0.0 to 1.0
    }
  ]
}

Only extract clear, actionable items. If no action items, return {"actionItems": []}.`

    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        temperature: 0.3,
        maxOutputTokens: 1000,
        responseMimeType: 'application/json',
      }
    })

    const content = response.text
    if (!content) {
      return { actionItems: [] }
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('Gemini action analysis error:', error)
    return { actionItems: [] }
  }
}

/**
 * Generate meeting summary
 */
export async function generateMeetingSummaryWithGemini(
  transcripts: Array<{ speaker: string; text: string; timestamp: string }>,
  meetingTitle?: string
): Promise<{ summary: string; keyPoints: string[]; actionItems: Array<{ text: string; assignee?: string; deadline?: string; confidence: number }> }> {
  try {
    const fullTranscript = transcripts
      .map(t => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.speaker}: ${t.text}`)
      .join('\n')

    const prompt = `Analyze this meeting transcript and provide:

1. A concise summary (2-3 paragraphs)
2. Key discussion points (bullet points)
3. All action items with assignees and deadlines

Meeting: ${meetingTitle || 'Untitled Meeting'}

Transcript:
${fullTranscript}

Return JSON:
{
  "summary": "Meeting summary text",
  "keyPoints": ["point 1", "point 2"],
  "actionItems": [
    {
      "text": "Task description",
      "assignee": "Person name or null",
      "deadline": "Deadline or null",
      "confidence": 0.0-1.0
    }
  ]
}`

    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        temperature: 0.4,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json',
      }
    })

    const content = response.text
    if (!content) {
      throw new Error('No response from Gemini')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('Gemini meeting summary error:', error)
    return {
      summary: 'Error generating summary',
      keyPoints: [],
      actionItems: []
    }
  }
}
