/**
 * Brand Voice Text Analyzer
 * Real-time text analysis using Gemini AI for brand voice enforcement
 */

import { gemini, GEMINI_MODEL } from '@/lib/gemini'
import type {
  AnalysisResult,
  BrandSuggestion,
  EnforcementLevel,
  ExtractedGuidelines,
  FieldType,
  RewriteResult,
  SuggestionType
} from './types'

/**
 * Generate the analysis prompt based on enforcement level
 */
function getAnalysisPrompt(
  guidelines: ExtractedGuidelines,
  text: string,
  level: EnforcementLevel,
  fieldType: FieldType
): string {
  const guidelinesJson = JSON.stringify({
    voiceTone: guidelines.voiceTone,
    personality: guidelines.personality,
    approvedTerms: guidelines.approvedTerms.slice(0, 50), // Limit for context
    forbiddenTerms: guidelines.forbiddenTerms.slice(0, 50),
    messagingRules: guidelines.messagingRules.slice(0, 20),
    values: guidelines.values
  })

  const levelDescriptions: Record<EnforcementLevel, string> = {
    1: 'Only check for spelling and grammar errors. Ignore tone and brand alignment.',
    2: 'Check spelling, grammar, AND provide gentle suggestions for brand voice alignment. Be helpful but not strict.',
    3: 'Strictly enforce brand voice. Flag all deviations from approved terminology and tone. Provide detailed explanations.',
    4: 'Maximum enforcement. Flag everything that deviates from brand guidelines. Include suggestions for complete rewrites if needed.'
  }

  return `You are a brand voice enforcement assistant analyzing written content.

BRAND GUIDELINES:
${guidelinesJson}

TARGET VOICE TONE: ${guidelines.voiceTone}
PERSONALITY TRAITS: ${guidelines.personality.join(', ')}

USER TEXT TO ANALYZE:
"${text}"

CONTEXT: This text is being written in a ${fieldType} field.
ENFORCEMENT LEVEL: ${level} - ${levelDescriptions[level]}

Analyze the text and return a JSON object with this exact structure:
{
  "suggestions": [
    {
      "id": "unique-id",
      "start": 0,
      "end": 10,
      "originalText": "the text to replace",
      "suggestedText": "the suggested replacement",
      "type": "spelling|grammar|tone|word|structure",
      "reason": "Brief explanation of why this change improves brand alignment",
      "confidence": 0.95,
      "severity": "info|warning|error"
    }
  ],
  "overallScore": 85,
  "toneAnalysis": {
    "detected": "what tone was detected",
    "target": "${guidelines.voiceTone}",
    "alignment": 85
  },
  "stats": {
    "totalIssues": 3,
    "spellingErrors": 1,
    "grammarErrors": 1,
    "toneIssues": 1,
    "wordIssues": 0,
    "structureIssues": 0
  }
}

IMPORTANT:
- "start" and "end" are character positions in the original text
- Only flag issues appropriate for enforcement level ${level}
- Confidence should be 0.0 to 1.0
- Severity: info (minor improvement), warning (should fix), error (must fix)
- If the text is already brand-aligned, return empty suggestions array with high score
- Be specific about what to replace and why
- Focus on actionable improvements, not nitpicking`
}

/**
 * Analyze text for brand voice alignment
 */
export async function analyzeText(
  text: string,
  guidelines: ExtractedGuidelines,
  level: EnforcementLevel,
  fieldType: FieldType
): Promise<AnalysisResult> {
  // Skip analysis for very short text
  if (text.trim().length < 10) {
    return {
      suggestions: [],
      overallScore: 100,
      toneAnalysis: {
        detected: guidelines.voiceTone,
        target: guidelines.voiceTone,
        alignment: 100
      },
      stats: {
        totalIssues: 0,
        spellingErrors: 0,
        grammarErrors: 0,
        toneIssues: 0,
        wordIssues: 0,
        structureIssues: 0
      }
    }
  }

  try {
    const prompt = getAnalysisPrompt(guidelines, text, level, fieldType)

    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        temperature: 0.3, // Low temperature for consistent analysis
        maxOutputTokens: 2000,
        responseMimeType: 'application/json',
      }
    })

    const content = response.text
    if (!content) {
      throw new Error('No response from Gemini')
    }

    const result = JSON.parse(content) as AnalysisResult

    // Validate and normalize suggestions
    result.suggestions = result.suggestions.map((s, i) => ({
      ...s,
      id: s.id || `suggestion-${i}-${Date.now()}`,
      start: Math.max(0, s.start || 0),
      end: Math.min(text.length, s.end || text.length),
      confidence: Math.max(0, Math.min(1, s.confidence || 0.5)),
      severity: (['info', 'warning', 'error'].includes(s.severity)
        ? s.severity
        : 'info') as 'info' | 'warning' | 'error',
      type: (['spelling', 'grammar', 'tone', 'word', 'structure'].includes(s.type)
        ? s.type
        : 'grammar') as SuggestionType
    }))

    // Filter out invalid suggestions (where original text doesn't match)
    result.suggestions = result.suggestions.filter(s => {
      const extracted = text.substring(s.start, s.end)
      return extracted.toLowerCase() === s.originalText.toLowerCase() ||
             text.toLowerCase().includes(s.originalText.toLowerCase())
    })

    return result
  } catch (error) {
    console.error('Text analysis error:', error)
    // Return empty result on error
    return {
      suggestions: [],
      overallScore: 100,
      toneAnalysis: {
        detected: 'unknown',
        target: guidelines.voiceTone,
        alignment: 0
      },
      stats: {
        totalIssues: 0,
        spellingErrors: 0,
        grammarErrors: 0,
        toneIssues: 0,
        wordIssues: 0,
        structureIssues: 0
      }
    }
  }
}

/**
 * Quick check for forbidden terms (fast, no AI call)
 */
export function quickForbiddenTermCheck(
  text: string,
  forbiddenTerms: ExtractedGuidelines['forbiddenTerms']
): BrandSuggestion[] {
  const suggestions: BrandSuggestion[] = []
  const lowerText = text.toLowerCase()

  forbiddenTerms.forEach((term, i) => {
    const lowerTerm = term.term.toLowerCase()
    let startIndex = 0

    while ((startIndex = lowerText.indexOf(lowerTerm, startIndex)) !== -1) {
      suggestions.push({
        id: `forbidden-${i}-${startIndex}`,
        start: startIndex,
        end: startIndex + term.term.length,
        originalText: text.substring(startIndex, startIndex + term.term.length),
        suggestedText: term.replacement || '',
        type: 'word',
        reason: term.reason || `"${term.term}" is not allowed per brand guidelines`,
        confidence: 1.0,
        severity: term.severity
      })
      startIndex += term.term.length
    }
  })

  return suggestions
}

/**
 * Rewrite text to match brand voice (Level 4 enforcement)
 */
export async function rewriteForBrandVoice(
  text: string,
  guidelines: ExtractedGuidelines,
  preserveIntent: boolean = true
): Promise<RewriteResult> {
  try {
    const prompt = `You are a brand voice specialist. Rewrite the following text to perfectly match the brand guidelines.

BRAND GUIDELINES:
- Voice Tone: ${guidelines.voiceTone}
- Personality: ${guidelines.personality.join(', ')}
- Values: ${guidelines.values.join(', ')}
- Approved Terms: ${guidelines.approvedTerms.slice(0, 20).map(t => t.term).join(', ')}
- Forbidden Terms: ${guidelines.forbiddenTerms.slice(0, 20).map(t => `${t.term} → ${t.replacement || 'avoid'}`).join(', ')}

ORIGINAL TEXT:
"${text}"

${preserveIntent ? 'IMPORTANT: Preserve the original intent and meaning while adjusting tone and word choice.' : 'You may restructure completely to match brand voice.'}

Return a JSON object:
{
  "rewrittenText": "The rewritten text matching brand voice",
  "changes": [
    {
      "original": "original phrase",
      "replacement": "replacement phrase",
      "reason": "why this change was made"
    }
  ],
  "improvementScore": 85
}

The improvementScore should indicate how much better the rewritten version aligns with brand guidelines (0-100).`

    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        temperature: 0.7, // Higher temperature for creative rewriting
        maxOutputTokens: 2000,
        responseMimeType: 'application/json',
      }
    })

    const content = response.text
    if (!content) {
      throw new Error('No response from Gemini')
    }

    return JSON.parse(content) as RewriteResult
  } catch (error) {
    console.error('Rewrite error:', error)
    return {
      rewrittenText: text,
      changes: [],
      improvementScore: 0
    }
  }
}

/**
 * Generate a brand-voice compliant version of a template
 */
export async function generateBrandTemplate(
  templateType: string,
  context: string,
  guidelines: ExtractedGuidelines
): Promise<string> {
  try {
    const prompt = `You are a brand voice specialist. Generate a ${templateType} template that perfectly matches these brand guidelines.

BRAND GUIDELINES:
- Voice Tone: ${guidelines.voiceTone}
- Personality: ${guidelines.personality.join(', ')}
- Values: ${guidelines.values.join(', ')}

CONTEXT: ${context}

Generate only the template text, ready to use. Use placeholders like [NAME], [COMPANY], [DATE] where appropriate.`

    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    })

    return response.text || ''
  } catch (error) {
    console.error('Template generation error:', error)
    return ''
  }
}
