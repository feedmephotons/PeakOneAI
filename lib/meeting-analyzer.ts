/**
 * Meeting Analyzer Utility
 * Uses GPT-4 to extract action items from meeting transcripts
 */

import { openai } from './openai'

export interface ActionItem {
  id: string
  text: string
  assignee?: string
  deadline?: string
  confidence: number
}

export interface AnalysisResult {
  actionItems: ActionItem[]
  summary?: string
}

/**
 * Analyze a chunk of transcript to extract action items
 */
export async function analyzeTranscriptChunk(
  transcript: string,
  context?: string
): Promise<ActionItem[]> {
  try {
    const prompt = `You are an AI assistant analyzing a meeting transcript. Extract any action items mentioned.

${context ? `Previous context: ${context}\n\n` : ''}Current transcript:
"${transcript}"

Identify action items with:
1. What needs to be done
2. Who is responsible (if mentioned)
3. Deadline (if mentioned)

Return JSON array of action items. Format:
[
  {
    "text": "Description of action",
    "assignee": "Person's name or null",
    "deadline": "Deadline or null",
    "confidence": 0.0 to 1.0
  }
]

Only extract clear, actionable items. If no action items, return [].`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing meeting transcripts and identifying action items. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent extraction
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0].message.content
    if (!content) {
      return []
    }

    // Parse the JSON response
    const parsed = JSON.parse(content)

    // Handle both array and object with array
    const actionItems = Array.isArray(parsed) ? parsed : (parsed.actionItems || [])

    // Add IDs and validate
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return actionItems.map((item: any) => ({
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: item.text || '',
      assignee: item.assignee || undefined,
      deadline: item.deadline || undefined,
      confidence: typeof item.confidence === 'number' ? item.confidence : 0.7
    })).filter((item: ActionItem) => item.text.length > 0)

  } catch (error) {
    console.error('[MeetingAnalyzer] Error analyzing transcript:', error)
    return []
  }
}

/**
 * Generate a full meeting summary from complete transcript
 */
export async function generateMeetingSummary(
  transcripts: Array<{ speaker: string; text: string; timestamp: string }>,
  meetingTitle?: string
): Promise<{ summary: string; keyPoints: string[]; actionItems: ActionItem[] }> {
  try {
    // Combine all transcripts into one text
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
  "keyPoints": ["point 1", "point 2", ...],
  "actionItems": [
    {
      "text": "Task description",
      "assignee": "Person name or null",
      "deadline": "Deadline or null",
      "confidence": 0.0-1.0
    }
  ]
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert meeting analyst. Provide clear, actionable summaries. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const parsed = JSON.parse(content)

    // Add IDs to action items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actionItems = (parsed.actionItems || []).map((item: any) => ({
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: item.text || '',
      assignee: item.assignee || undefined,
      deadline: item.deadline || undefined,
      confidence: typeof item.confidence === 'number' ? item.confidence : 0.7
    }))

    return {
      summary: parsed.summary || 'No summary available',
      keyPoints: parsed.keyPoints || [],
      actionItems
    }

  } catch (error) {
    console.error('[MeetingAnalyzer] Error generating summary:', error)
    return {
      summary: 'Error generating summary',
      keyPoints: [],
      actionItems: []
    }
  }
}

/**
 * Check if a transcript segment contains an action item
 * Quick check without full AI analysis
 */
export function mightContainActionItem(text: string): boolean {
  const actionPatterns = [
    /\b(will|should|need to|have to|must|going to)\b/i,
    /\b(by|before|due|deadline)\b/i,
    /\b(task|action item|todo|follow up)\b/i,
    /\b(responsible for|assigned to|in charge of)\b/i
  ]

  return actionPatterns.some(pattern => pattern.test(text))
}
