/**
 * Brand Voice Guideline Extractor
 * Uses Gemini AI to extract brand guidelines from uploaded PDFs
 */

import { gemini, GEMINI_MODEL } from '@/lib/gemini'
import type { ExtractedGuidelines, VoiceTone } from './types'

const EXTRACTION_PROMPT = `You are an expert brand strategist analyzing a brand guidelines document.

Extract the following structured information from this document:

1. **Voice & Tone**
   - Primary voice tone: Choose one of: formal, casual, technical, friendly, professional
   - Personality traits: List 3-5 key personality traits
   - Communication style notes

2. **Approved Terms & Phrases**
   - Product/service terminology the brand uses
   - Brand-specific words and phrases
   - Preferred expressions
   - Include context for when to use each

3. **Forbidden/Discouraged Terms**
   - Words and phrases to avoid
   - Reason for each
   - Suggested replacements
   - Severity (info, warning, or error)

4. **Messaging Rules**
   - Templates for common communications
   - Structural guidelines (email openings, closings, etc.)
   - Good and bad examples
   - Categories: greeting, closing, product, support, marketing, sales

5. **Company Values & Positioning**
   - Core values that should shine through in communication
   - Mission alignment points
   - Key differentiators

Return a JSON object matching this exact schema:
{
  "voiceTone": "formal|casual|technical|friendly|professional",
  "personality": ["trait1", "trait2", "trait3"],
  "approvedTerms": [
    {
      "term": "word or phrase",
      "context": "when to use this",
      "category": "terminology|product-names|values|marketing",
      "alternatives": ["alt1", "alt2"]
    }
  ],
  "forbiddenTerms": [
    {
      "term": "word or phrase to avoid",
      "reason": "why to avoid this",
      "replacement": "what to use instead",
      "severity": "info|warning|error"
    }
  ],
  "messagingRules": [
    {
      "name": "Rule name",
      "description": "Detailed description",
      "category": "greeting|closing|product|support|marketing|sales",
      "pattern": "optional regex pattern",
      "template": "optional template text",
      "examples": {
        "good": ["good example 1", "good example 2"],
        "bad": ["bad example 1", "bad example 2"]
      }
    }
  ],
  "values": ["value1", "value2"],
  "positioning": "Brief positioning statement"
}

Be thorough but focus on actionable guidelines that can be used to evaluate and correct written content.
If certain sections are not present in the document, include empty arrays or reasonable defaults based on the overall tone.`

/**
 * Extract brand guidelines from a PDF document
 */
export async function extractGuidelinesFromDocument(
  base64Content: string,
  mimeType: string
): Promise<ExtractedGuidelines> {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: EXTRACTION_PROMPT },
            {
              inlineData: {
                data: base64Content,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        temperature: 0.3, // Low temperature for consistent extraction
        maxOutputTokens: 4000,
        responseMimeType: 'application/json',
      }
    })

    const content = response.text
    if (!content) {
      throw new Error('No response from Gemini')
    }

    const parsed = JSON.parse(content) as ExtractedGuidelines

    // Validate and normalize the response
    return normalizeGuidelines(parsed)
  } catch (error) {
    console.error('Guideline extraction error:', error)
    throw new Error('Failed to extract guidelines from document')
  }
}

/**
 * Extract guidelines from plain text (for manual entry or text documents)
 */
export async function extractGuidelinesFromText(
  text: string
): Promise<ExtractedGuidelines> {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${EXTRACTION_PROMPT}

Here is the brand guidelines text to analyze:

${text}`
            }
          ]
        }
      ],
      config: {
        temperature: 0.3,
        maxOutputTokens: 4000,
        responseMimeType: 'application/json',
      }
    })

    const content = response.text
    if (!content) {
      throw new Error('No response from Gemini')
    }

    const parsed = JSON.parse(content) as ExtractedGuidelines
    return normalizeGuidelines(parsed)
  } catch (error) {
    console.error('Guideline extraction error:', error)
    throw new Error('Failed to extract guidelines from text')
  }
}

/**
 * Normalize and validate extracted guidelines
 */
function normalizeGuidelines(raw: Partial<ExtractedGuidelines>): ExtractedGuidelines {
  const validTones: VoiceTone[] = ['formal', 'casual', 'technical', 'friendly', 'professional']

  return {
    voiceTone: validTones.includes(raw.voiceTone as VoiceTone)
      ? raw.voiceTone as VoiceTone
      : 'professional',
    personality: Array.isArray(raw.personality) ? raw.personality : [],
    approvedTerms: Array.isArray(raw.approvedTerms)
      ? raw.approvedTerms.map(t => ({
          term: t.term || '',
          context: t.context,
          category: t.category,
          alternatives: Array.isArray(t.alternatives) ? t.alternatives : []
        }))
      : [],
    forbiddenTerms: Array.isArray(raw.forbiddenTerms)
      ? raw.forbiddenTerms.map(t => ({
          term: t.term || '',
          reason: t.reason,
          replacement: t.replacement,
          severity: (['info', 'warning', 'error'].includes(t.severity)
            ? t.severity
            : 'warning') as 'info' | 'warning' | 'error'
        }))
      : [],
    messagingRules: Array.isArray(raw.messagingRules)
      ? raw.messagingRules.map(r => ({
          name: r.name || 'Unnamed Rule',
          description: r.description || '',
          category: r.category || 'other',
          pattern: r.pattern,
          template: r.template,
          examples: r.examples || { good: [], bad: [] }
        }))
      : [],
    values: Array.isArray(raw.values) ? raw.values : [],
    positioning: raw.positioning,
    rawAnalysis: raw.rawAnalysis
  }
}

/**
 * Merge multiple guideline documents
 */
export function mergeGuidelines(
  existing: ExtractedGuidelines,
  newGuidelines: ExtractedGuidelines
): ExtractedGuidelines {
  return {
    voiceTone: newGuidelines.voiceTone || existing.voiceTone,
    personality: [...new Set([...existing.personality, ...newGuidelines.personality])],
    approvedTerms: [
      ...existing.approvedTerms,
      ...newGuidelines.approvedTerms.filter(
        n => !existing.approvedTerms.some(e => e.term.toLowerCase() === n.term.toLowerCase())
      )
    ],
    forbiddenTerms: [
      ...existing.forbiddenTerms,
      ...newGuidelines.forbiddenTerms.filter(
        n => !existing.forbiddenTerms.some(e => e.term.toLowerCase() === n.term.toLowerCase())
      )
    ],
    messagingRules: [
      ...existing.messagingRules,
      ...newGuidelines.messagingRules.filter(
        n => !existing.messagingRules.some(e => e.name.toLowerCase() === n.name.toLowerCase())
      )
    ],
    values: [...new Set([...existing.values, ...newGuidelines.values])],
    positioning: newGuidelines.positioning || existing.positioning
  }
}
