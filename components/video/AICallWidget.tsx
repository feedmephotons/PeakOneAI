'use client'

import { useState, useEffect } from 'react'
import { Brain, Minimize2, Maximize2, X, Mic, Sparkles } from 'lucide-react'

interface Transcript {
  id: string
  speaker: string
  text: string
  timestamp: Date
}

interface ActionItem {
  id: string
  text: string
  assignee?: string
}

interface AICallWidgetProps {
  isMinimized?: boolean
  onClose?: () => void
}

export default function AICallWidget({ isMinimized: initialMinimized = false, onClose }: AICallWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(initialMinimized)
  const [isListening, setIsListening] = useState(true)
  const [transcripts, setTranscripts] = useState<Transcript[]>([
    {
      id: '1',
      speaker: 'John Doe',
      text: 'Let\'s review the Q4 targets and make sure we\'re aligned on priorities.',
      timestamp: new Date(Date.now() - 120000)
    },
    {
      id: '2',
      speaker: 'You',
      text: 'Absolutely. I think we should focus on the three main KPIs we discussed.',
      timestamp: new Date(Date.now() - 60000)
    },
    {
      id: '3',
      speaker: 'Jane Smith',
      text: 'I agree. Can we also add the marketing campaign timeline to our action items?',
      timestamp: new Date(Date.now() - 30000)
    }
  ])
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { id: '1', text: 'Review Q4 KPIs', assignee: 'John' },
    { id: '2', text: 'Create marketing campaign timeline', assignee: 'Jane' }
  ])

  // Simulate live transcription
  useEffect(() => {
    if (!isListening) return

    const interval = setInterval(() => {
      // Simulate new transcript every 10 seconds
      const speakers = ['John Doe', 'Jane Smith', 'You']
      const sampleTexts = [
        'I think we should prioritize the client deliverables first.',
        'Can we schedule a follow-up meeting for next week?',
        'Let me share my screen to show the latest updates.',
        'Great point. Let\'s make sure to document this decision.'
      ]

      const newTranscript: Transcript = {
        id: Date.now().toString(),
        speaker: speakers[Math.floor(Math.random() * speakers.length)],
        text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
        timestamp: new Date()
      }

      setTranscripts(prev => [...prev, newTranscript])
    }, 15000)

    return () => clearInterval(interval)
  }, [isListening])

  // Waveform animation bars
  const WaveformBars = () => {
    return (
      <div className="flex items-center gap-0.5 h-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-0.5 bg-blue-500 rounded-full animate-pulse"
            style={{
              height: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.8s'
            }}
          />
        ))}
      </div>
    )
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-6 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="group flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105"
        >
          <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="font-bold">Peak AI</div>
            <div className="text-xs text-white/80 flex items-center gap-2">
              {isListening ? (
                <>
                  <WaveformBars />
                  <span>Listening...</span>
                </>
              ) : (
                <span>Paused</span>
              )}
            </div>
          </div>
          <Maximize2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-24 right-6 w-96 max-h-[600px] z-40 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Peak AI</h3>
            <div className="text-xs text-white/80 flex items-center gap-2">
              {isListening ? (
                <>
                  <WaveformBars />
                  <span>Live transcription</span>
                </>
              ) : (
                <span>Paused</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              isListening ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500/20 hover:bg-red-500/30'
            }`}
            title={isListening ? 'Pause transcription' : 'Resume transcription'}
          >
            <Mic className={`w-4 h-4 ${isListening ? 'text-white' : 'text-red-300'}`} />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-lg flex items-center justify-center transition"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4 text-white" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-lg flex items-center justify-center transition"
              title="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button className="flex-1 px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400">
          Transcript
        </button>
        <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          Action Items ({actionItems.length})
        </button>
        <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          Summary
        </button>
      </div>

      {/* Transcript Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
        {transcripts.map((transcript) => (
          <div key={transcript.id} className="bg-white dark:bg-gray-700 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                {transcript.speaker}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {transcript.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {transcript.text}
            </p>
          </div>
        ))}

        {/* Live indicator */}
        {isListening && (
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Listening for speech...</span>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-t border-purple-200 dark:border-purple-800 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">AI Insight</p>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Detected 2 action items. Would you like me to add them to your task board?
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
