'use client'

import { useState, useCallback, useRef } from 'react'
import { Check, X, RefreshCw, Wand2, AlertCircle } from 'lucide-react'
import type { AnalysisResult, BrandSuggestion, EnforcementLevel, FieldType } from '@/lib/brand-voice/types'

interface BrandVoiceTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
  fieldType?: FieldType
  workspaceId: string
  enforcementLevel?: EnforcementLevel
  debounceMs?: number
  disabled?: boolean
  showScore?: boolean
}

export default function BrandVoiceTextarea({
  value,
  onChange,
  placeholder = 'Start typing...',
  rows = 4,
  className = '',
  fieldType = 'other',
  workspaceId,
  enforcementLevel = 2,
  debounceMs = 800,
  disabled = false,
  showScore = true
}: BrandVoiceTextareaProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<BrandSuggestion | null>(null)
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 })
  const [isRewriting, setIsRewriting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced analysis
  const analyzeText = useCallback(async (text: string) => {
    if (text.trim().length < 15) {
      setAnalysis(null)
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/brand-voice/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          workspaceId,
          enforcementLevel,
          fieldType
        })
      })

      if (response.ok) {
        const result = await response.json()
        setAnalysis(result)
      }
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [workspaceId, enforcementLevel, fieldType])

  // Handle text changes with debounce
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      analyzeText(newValue)
    }, debounceMs)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: BrandSuggestion, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    const containerRect = textareaRef.current?.parentElement?.getBoundingClientRect()

    if (containerRect) {
      setPopoverPosition({
        top: rect.bottom - containerRect.top + 8,
        left: Math.min(rect.left - containerRect.left, containerRect.width - 300)
      })
    }
    setSelectedSuggestion(suggestion)
  }

  // Apply a suggestion
  const applySuggestion = (suggestion: BrandSuggestion) => {
    const newValue = value.substring(0, suggestion.start) +
                     suggestion.suggestedText +
                     value.substring(suggestion.end)
    onChange(newValue)
    setSelectedSuggestion(null)

    // Re-analyze after applying
    setTimeout(() => analyzeText(newValue), 100)
  }

  // Apply all suggestions
  const applyAllSuggestions = () => {
    if (!analysis || analysis.suggestions.length === 0) return

    // Sort by position descending to apply from end to start
    const sorted = [...analysis.suggestions].sort((a, b) => b.start - a.start)
    let newValue = value

    sorted.forEach(suggestion => {
      newValue = newValue.substring(0, suggestion.start) +
                 suggestion.suggestedText +
                 newValue.substring(suggestion.end)
    })

    onChange(newValue)
    setAnalysis(null)
    setTimeout(() => analyzeText(newValue), 100)
  }

  // Full rewrite using AI
  const rewriteText = async () => {
    if (!value.trim()) return

    setIsRewriting(true)
    try {
      const response = await fetch('/api/brand-voice/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: value,
          workspaceId,
          preserveIntent: true
        })
      })

      if (response.ok) {
        const result = await response.json()
        onChange(result.rewrittenText)
        setAnalysis(null)
      }
    } catch (error) {
      console.error('Rewrite error:', error)
    } finally {
      setIsRewriting(false)
    }
  }

  // Render suggestion underlines
  const renderUnderlinedText = () => {
    if (!analysis || analysis.suggestions.length === 0) {
      return null
    }

    // Sort suggestions by position
    const sorted = [...analysis.suggestions].sort((a, b) => a.start - b.start)

    const elements: React.ReactNode[] = []
    let lastEnd = 0

    sorted.forEach((suggestion, i) => {
      // Add text before this suggestion
      if (suggestion.start > lastEnd) {
        elements.push(
          <span key={`text-${i}`} className="text-transparent">
            {value.substring(lastEnd, suggestion.start)}
          </span>
        )
      }

      // Add the underlined suggestion
      const underlineColor = {
        error: 'border-red-500',
        warning: 'border-yellow-500',
        info: 'border-blue-500'
      }[suggestion.severity] || 'border-yellow-500'

      elements.push(
        <span
          key={`suggestion-${i}`}
          className={`border-b-2 border-dashed ${underlineColor} cursor-pointer text-transparent hover:bg-opacity-20`}
          onClick={(e) => handleSuggestionClick(suggestion, e)}
          title={suggestion.reason}
        >
          {value.substring(suggestion.start, suggestion.end)}
        </span>
      )

      lastEnd = suggestion.end
    })

    // Add remaining text
    if (lastEnd < value.length) {
      elements.push(
        <span key="text-end" className="text-transparent">
          {value.substring(lastEnd)}
        </span>
      )
    }

    return elements
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="relative">
      {/* Textarea with overlay */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled || isRewriting}
          className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white
            resize-none ${isRewriting ? 'opacity-50' : ''} ${className}`}
        />

        {/* Underline overlay */}
        {analysis && analysis.suggestions.length > 0 && (
          <div
            className="absolute inset-0 px-4 py-3 pointer-events-none overflow-hidden"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              font: 'inherit',
              lineHeight: 'inherit'
            }}
          >
            <div className="pointer-events-auto">
              {renderUnderlinedText()}
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-3 text-sm">
          {isAnalyzing && (
            <span className="flex items-center gap-1 text-gray-500">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Analyzing...
            </span>
          )}

          {!isAnalyzing && analysis && (
            <>
              {showScore && (
                <span className={`flex items-center gap-1 ${getScoreColor(analysis.overallScore)}`}>
                  <Check className="w-3 h-3" />
                  {analysis.overallScore}% on-brand
                </span>
              )}

              {analysis.suggestions.length > 0 && (
                <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="w-3 h-3" />
                  {analysis.suggestions.length} suggestion{analysis.suggestions.length !== 1 ? 's' : ''}
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {analysis && analysis.suggestions.length > 0 && (
            <button
              onClick={applyAllSuggestions}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30
                text-purple-600 dark:text-purple-400 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition"
            >
              <Check className="w-3 h-3" />
              Apply All
            </button>
          )}

          {enforcementLevel >= 3 && value.trim().length > 20 && (
            <button
              onClick={rewriteText}
              disabled={isRewriting}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600
                text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {isRewriting ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Wand2 className="w-3 h-3" />
              )}
              {isRewriting ? 'Rewriting...' : 'AI Rewrite'}
            </button>
          )}
        </div>
      </div>

      {/* Suggestion popover */}
      {selectedSuggestion && (
        <div
          className="absolute z-50 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border
            border-gray-200 dark:border-gray-700 p-4"
          style={{ top: popoverPosition.top, left: popoverPosition.left }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {selectedSuggestion.severity === 'error' && (
                <span className="w-2 h-2 rounded-full bg-red-500" />
              )}
              {selectedSuggestion.severity === 'warning' && (
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
              )}
              {selectedSuggestion.severity === 'info' && (
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              )}
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
                {selectedSuggestion.type}
              </span>
            </div>
            <button
              onClick={() => setSelectedSuggestion(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400
                text-sm rounded line-through">
                {selectedSuggestion.originalText}
              </span>
              <span className="text-gray-400">→</span>
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400
                text-sm rounded">
                {selectedSuggestion.suggestedText}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedSuggestion.reason}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setSelectedSuggestion(null)}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100
                dark:hover:bg-gray-700 rounded transition"
            >
              Ignore
            </button>
            <button
              onClick={() => applySuggestion(selectedSuggestion)}
              className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close popover */}
      {selectedSuggestion && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSelectedSuggestion(null)}
        />
      )}
    </div>
  )
}
