'use client'

import { useState } from 'react'
import {
  Brain, CheckSquare, Sparkles, FileText, Link as LinkIcon,
  Download, Share2, Copy, Clock, Users, Phone, MessageSquare
} from 'lucide-react'

interface CallParticipant {
  id: string
  name: string
  avatar?: string
  role?: string
}

interface ActionItem {
  id: string
  text: string
  assignee?: string
  completed: boolean
}

interface Highlight {
  id: string
  timestamp: string
  speaker: string
  quote: string
  keywords: string[]
}

interface Attachment {
  id: string
  name: string
  type: string
  url: string
  mentionedAt: string
}

interface CallSummaryData {
  callId: string
  title: string
  date: string
  duration: string
  participants: CallParticipant[]
  summary: string[]
  actionItems: ActionItem[]
  highlights: Highlight[]
  attachments: Attachment[]
  transcript?: string
}

interface CallSummaryPageProps {
  data: CallSummaryData
}

export default function CallSummaryPage({ data }: CallSummaryPageProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary')
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const handleCopy = (sectionId: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedSection(sectionId)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const handleShareSummary = () => {
    // Implement sharing logic
    console.log('Sharing summary...')
  }

  const handleExportPDF = () => {
    // Implement PDF export
    console.log('Exporting to PDF...')
  }

  const handleAskAI = () => {
    // Open AI chat with this call's context
    const event = new CustomEvent('openPeakAI', {
      detail: { context: 'call', callId: data.callId }
    })
    window.dispatchEvent(event)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {data.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {data.date}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {data.participants.length} participants
                </span>
                <span>Duration: {data.duration}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleShareSummary}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <Share2 className="w-4 h-4" />
              Share Summary
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={handleAskAI}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
            >
              <Brain className="w-4 h-4" />
              Ask AI About This Call
            </button>
          </div>
        </div>

        {/* Participants */}
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wider">
              Participants
            </h3>
            <div className="flex flex-wrap gap-3">
              {data.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-xl"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {participant.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {participant.name}
                    </p>
                    {participant.role && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {participant.role}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'summary'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              AI Summary
            </button>
            {data.transcript && (
              <button
                onClick={() => setActiveTab('transcript')}
                className={`px-6 py-3 font-medium transition-all ${
                  activeTab === 'transcript'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Full Transcript
              </button>
            )}
          </div>
        </div>

        {activeTab === 'summary' ? (
          <div className="space-y-8">
            {/* AI Summary */}
            <section className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    AI Summary
                  </h2>
                </div>
                <button
                  onClick={() => handleCopy('summary', data.summary.join('\n'))}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copiedSection === 'summary' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <ul className="space-y-3">
                {data.summary.map((point, index) => (
                  <li key={index} className="flex gap-3">
                    <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Action Items */}
            <section className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Action Items
                  </h2>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Auto-added to task board
                </span>
              </div>
              <div className="space-y-3">
                {data.actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className={`text-gray-700 dark:text-gray-300 ${item.completed ? 'line-through' : ''}`}>
                        {item.text}
                      </p>
                      {item.assignee && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Assigned to: {item.assignee}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Highlights */}
            <section className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Key Highlights
                </h2>
              </div>
              <div className="space-y-4">
                {data.highlights.map((highlight) => (
                  <div
                    key={highlight.id}
                    className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-l-4 border-blue-500"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {highlight.timestamp}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {highlight.speaker}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2 italic">
                      &ldquo;{highlight.quote}&rdquo;
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {highlight.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Attachments */}
            {data.attachments.length > 0 && (
              <section className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <LinkIcon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Attachments
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group"
                    >
                      <FileText className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Mentioned at {attachment.mentionedAt}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                {data.transcript}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
