/**
 * Brand Voice Intelligence System - Type Definitions
 */

// Voice tone options
export type VoiceTone = 'formal' | 'casual' | 'technical' | 'friendly' | 'professional'

// Enforcement levels
export type EnforcementLevel = 1 | 2 | 3 | 4
// 1 = Basic spell/grammar only
// 2 = Suggestions for brand alignment (non-blocking)
// 3 = Strong recommendations with explanations
// 4 = Auto-rewrite to match brand voice completely

// Suggestion severity
export type SuggestionSeverity = 'info' | 'warning' | 'error'

// Suggestion types
export type SuggestionType = 'spelling' | 'grammar' | 'tone' | 'word' | 'structure'

// Field types for context
export type FieldType = 'email' | 'message' | 'document' | 'task' | 'comment' | 'other'

// Brand guideline structure extracted from PDF
export interface ExtractedGuidelines {
  voiceTone: VoiceTone
  personality: string[]
  approvedTerms: Array<{
    term: string
    context?: string
    category?: string
    alternatives?: string[]
  }>
  forbiddenTerms: Array<{
    term: string
    reason?: string
    replacement?: string
    severity: SuggestionSeverity
  }>
  messagingRules: Array<{
    name: string
    description: string
    category: string
    pattern?: string
    template?: string
    examples?: {
      good: string[]
      bad: string[]
    }
  }>
  values: string[]
  positioning?: string
  rawAnalysis?: string
}

// Suggestion returned by the analyzer
export interface BrandSuggestion {
  id: string
  start: number
  end: number
  originalText: string
  suggestedText: string
  type: SuggestionType
  reason: string
  confidence: number
  severity: SuggestionSeverity
}

// Analysis result from the text analyzer
export interface AnalysisResult {
  suggestions: BrandSuggestion[]
  overallScore: number // 0-100 brand alignment score
  toneAnalysis: {
    detected: string
    target: string
    alignment: number // 0-100
  }
  stats: {
    totalIssues: number
    spellingErrors: number
    grammarErrors: number
    toneIssues: number
    wordIssues: number
    structureIssues: number
  }
}

// Rewrite result
export interface RewriteResult {
  rewrittenText: string
  changes: Array<{
    original: string
    replacement: string
    reason: string
  }>
  improvementScore: number
}

// API request/response types
export interface AnalyzeRequest {
  text: string
  guidelineId?: string
  workspaceId: string
  enforcementLevel: EnforcementLevel
  fieldType: FieldType
}

export interface RewriteRequest {
  text: string
  guidelineId?: string
  workspaceId: string
  preserveIntent: boolean
}

export interface ExtractGuidelinesRequest {
  fileBase64: string
  mimeType: string
  name: string
  workspaceId: string
}

// User settings for brand voice
export interface BrandVoiceSettings {
  isEnabled: boolean
  enforcementLevel: EnforcementLevel
  personalMode: boolean
  mutedSuggestionTypes: SuggestionType[]
  guidelineId?: string
}

// Context for the Brand Voice Provider
export interface BrandVoiceContextValue {
  // State
  isEnabled: boolean
  enforcementLevel: EnforcementLevel
  personalMode: boolean
  isLoading: boolean
  activeGuideline: {
    id: string
    name: string
    voiceTone: VoiceTone
  } | null

  // Actions
  analyze: (text: string, fieldType: FieldType) => Promise<AnalysisResult>
  rewrite: (text: string) => Promise<RewriteResult>
  toggleEnabled: () => void
  setEnforcementLevel: (level: EnforcementLevel) => void
  setPersonalMode: (enabled: boolean) => void

  // Suggestion handling
  acceptSuggestion: (id: string, replacement: string) => void
  rejectSuggestion: (id: string) => void
  muteSuggestionType: (type: SuggestionType) => void
}
