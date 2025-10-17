'use client'

import { useParams, useRouter } from 'next/navigation'
import { Brain, Clock, Users, Phone, FileText, CheckSquare, MessageSquare, Paperclip, Download, Share2, Edit } from 'lucide-react'

// Mock data - in production this would come from API
const mockCallSummary = {
  id: '1',
  title: 'Q4 Planning Strategy Call',
  participants: ['Sarah Chen', 'Mike Johnson', 'You'],
  date: new Date('2025-01-17T14:00:00'),
  duration: '45 min',
  summary: [
    'Discussed Q4 revenue targets and growth projections',
    'Reviewed marketing campaign performance from Q3',
    'Identified key product features for next release',
    'Aligned on hiring priorities for engineering team'
  ],
  actionItems: [
    {
      id: '1',
      task: 'Send updated revenue forecast to finance team',
      assignee: 'Sarah Chen',
      dueDate: '2025-01-20',
      priority: 'HIGH'
    },
    {
      id: '2',
      task: 'Schedule follow-up meeting with product team',
      assignee: 'Mike Johnson',
      dueDate: '2025-01-19',
      priority: 'MEDIUM'
    },
    {
      id: '3',
      task: 'Draft job descriptions for 3 senior engineer positions',
      assignee: 'You',
      dueDate: '2025-01-25',
      priority: 'HIGH'
    }
  ],
  highlights: [
    {
      id: '1',
      timestamp: '14:12',
      speaker: 'Sarah Chen',
      quote: 'We need to hit $2.5M in Q4 to meet our annual target. This is non-negotiable.'
    },
    {
      id: '2',
      timestamp: '14:28',
      speaker: 'Mike Johnson',
      quote: 'The new AI features are getting great feedback from beta users. We should fast-track the release.'
    },
    {
      id: '3',
      timestamp: '14:41',
      speaker: 'You',
      quote: 'Let\'s prioritize senior hires over junior roles for Q1. We need experience right now.'
    }
  ],
  attachments: [
    { id: '1', name: 'Q4_Revenue_Forecast.xlsx', type: 'spreadsheet', size: '1.2 MB' },
    { id: '2', name: 'Marketing_Campaign_Results.pdf', type: 'pdf', size: '3.4 MB' },
    { id: '3', name: 'Product_Roadmap_Draft.pdf', type: 'pdf', size: '890 KB' }
  ]
}

export default function CallSummaryPage() {
  const params = useParams()
  const router = useRouter()
  const callId = params.id

  const handleAddToTasks = (actionItem: typeof mockCallSummary.actionItems[0]) => {
    // In production, this would create a task in the task system
    alert(`Task "${actionItem.task}" added to your task board`)
  }

  const handleExport = () => {
    // In production, this would export to PDF or other formats
    alert('Exporting call summary...')
  }

  const handleShare = () => {
    // In production, this would share with team members
    alert('Share call summary with team...')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {mockCallSummary.title}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Call ID: {callId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{mockCallSummary.date.toLocaleDateString()} at {mockCallSummary.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{mockCallSummary.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{mockCallSummary.participants.length} participants</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                title="Export"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                title="Edit"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Participants:</span>
            <div className="flex items-center gap-2">
              {mockCallSummary.participants.map((participant, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {participant[0]}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{participant}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Summary</h2>
          </div>

          <ul className="space-y-3">
            {mockCallSummary.summary.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{i + 1}</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Items */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Action Items</h2>
          </div>

          <div className="space-y-3">
            {mockCallSummary.actionItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.task}</h3>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      item.priority === 'HIGH'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Assigned to: {item.assignee}</span>
                    <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleAddToTasks(item)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition text-sm font-medium"
                >
                  Add to Tasks
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Highlights</h2>
          </div>

          <div className="space-y-4">
            {mockCallSummary.highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-purple-600 text-white text-xs font-semibold rounded">
                    {highlight.timestamp}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{highlight.speaker}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">&ldquo;{highlight.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>

        {/* Attachments */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Paperclip className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Attachments</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mockCallSummary.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition cursor-pointer"
              >
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{attachment.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{attachment.size}</p>
                </div>
                <Download className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            ← Back to Calls
          </button>

          <button
            onClick={() => {
              const event = new CustomEvent('openPeakAI')
              window.dispatchEvent(event)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition"
          >
            <Brain className="w-5 h-5" />
            <span>Ask Peak AI About This Call</span>
          </button>
        </div>
      </div>
    </div>
  )
}
