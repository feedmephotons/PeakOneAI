'use client'

import { useState, useMemo } from 'react'
import {
  Brain, CheckSquare, FileText, Link as LinkIcon,
  Download, Share2, Copy, Clock, Users, Phone, MessageSquare, Search
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
  deadline?: string
  confidence?: number
  completed?: boolean
}

interface TranscriptEntry {
  id: string
  speaker: string
  text: string
  timestamp: string
  userId?: string
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
  summary: string // AI-generated summary paragraph
  keyPoints: string[] // Bullet points from summary
  actionItems: ActionItem[]
  highlights?: Highlight[]
  attachments?: Attachment[]
  transcripts?: TranscriptEntry[] // Array of transcript entries
}

interface CallSummaryPageProps {
  data: CallSummaryData
}

export default function CallSummaryPage({ data }: CallSummaryPageProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary')
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter transcripts based on search query
  const filteredTranscripts = useMemo(() => {
    if (!data.transcripts || !searchQuery.trim()) {
      return data.transcripts || []
    }

    const query = searchQuery.toLowerCase()
    return data.transcripts.filter(
      (entry) =>
        entry.text.toLowerCase().includes(query) ||
        entry.speaker.toLowerCase().includes(query)
    )
  }, [data.transcripts, searchQuery])

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 rounded px-1">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

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
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 font-medium"
            >
              <Brain className="w-4 h-4" />
              Ask Lisa About This Call
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
              Summary
            </button>
            {data.transcripts && data.transcripts.length > 0 && (
              <button
                onClick={() => setActiveTab('transcript')}
                className={`px-6 py-3 font-medium transition-all ${
                  activeTab === 'transcript'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Full Transcript ({data.transcripts.length})
              </button>
            )}
          </div>
        </div>

        {activeTab === 'summary' ? (
          <div className="space-y-8">
            {/* Summary */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Summary
                  </h2>
                </div>
                <button
                  onClick={() => handleCopy('summary', data.summary + '\n\nKey Points:\n' + data.keyPoints.join('\n'))}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copiedSection === 'summary' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Summary Paragraph */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {data.summary}
                </p>
              </div>

              {/* Key Points */}
              {data.keyPoints && data.keyPoints.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Key Discussion Points
                  </h3>
                  <ul className="space-y-3">
                    {data.keyPoints.map((point, index) => (
                      <li key={index} className="flex gap-3">
                        <Brain className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{point}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
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
                {data.actionItems.length > 0 ? (
                  data.actionItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed || false}
                        onChange={() => {}}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className={`text-gray-700 dark:text-gray-300 ${item.completed ? 'line-through' : ''}`}>
                          {item.text}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                          {item.assignee && (
                            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              👤 {item.assignee}
                            </span>
                          )}
                          {item.deadline && (
                            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              📅 {item.deadline}
                            </span>
                          )}
                          {item.confidence !== undefined && (
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                              {Math.round(item.confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No action items detected
                  </p>
                )}
              </div>
            </section>

            {/* Highlights */}
            {data.highlights && data.highlights.length > 0 && (
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
            )}

            {/* Attachments */}
            {data.attachments && data.attachments.length > 0 && (
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
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transcript by speaker or content..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              {searchQuery && (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  Found {filteredTranscripts.length} result{filteredTranscripts.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
                </p>
              )}
            </div>

            {/* Transcript Entries */}
            <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
              {filteredTranscripts.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTranscripts.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      {/* Header: Speaker and Timestamp */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {entry.speaker.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {highlightText(entry.speaker, searchQuery)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(entry.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopy(`transcript-${entry.id}`, entry.text)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Copy text"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Transcript Text */}
                      <div className="pl-11">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {highlightText(entry.text, searchQuery)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No results found for your search' : 'No transcript entries yet'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-4 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
