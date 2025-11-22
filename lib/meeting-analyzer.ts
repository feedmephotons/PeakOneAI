/**
 * Meeting Analyzer Utility
 * Uses Gemini 2.5 to extract action items from meeting transcripts
 */

import { analyzeTranscriptForActions, generateMeetingSummaryWithGemini } from './gemini'

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
    const result = await analyzeTranscriptForActions(transcript, context)

    // Add IDs and validate
    return result.actionItems.map((item) => ({
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
    const result = await generateMeetingSummaryWithGemini(transcripts, meetingTitle)

    // Add IDs to action items
    const actionItems = (result.actionItems || []).map((item) => ({
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: item.text || '',
      assignee: item.assignee || undefined,
      deadline: item.deadline || undefined,
      confidence: typeof item.confidence === 'number' ? item.confidence : 0.7
    }))

    return {
      summary: result.summary || 'No summary available',
      keyPoints: result.keyPoints || [],
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
