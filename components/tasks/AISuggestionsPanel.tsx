'use client'

import { Brain, Calendar, TrendingUp, Video, Plus, Sparkles, ChevronRight } from 'lucide-react'

interface AISuggestion {
  id: string
  type: 'task' | 'deadline' | 'priority' | 'meeting'
  title: string
  description: string
  confidence: number
  action?: () => void
}

interface LinkedMeeting {
  id: string
  title: string
  date: Date
  actionItems: number
}

export default function AISuggestionsPanel() {
  const suggestions: AISuggestion[] = [
    {
      id: '1',
      type: 'task',
      title: 'Follow up on Q4 hiring goals',
      description: 'Mentioned in yesterday\'s strategy call',
      confidence: 95
    },
    {
      id: '2',
      type: 'deadline',
      title: 'Revenue forecast deadline approaching',
      description: 'Due Jan 20 - mentioned in call with Sarah',
      confidence: 88
    },
    {
      id: '3',
      type: 'priority',
      title: 'Upgrade "API Documentation" to HIGH',
      description: 'Multiple mentions across recent meetings',
      confidence: 82
    },
    {
      id: '4',
      type: 'task',
      title: 'Schedule product roadmap review',
      description: 'Action item from Q4 planning call',
      confidence: 90
    }
  ]

  const linkedMeetings: LinkedMeeting[] = [
    {
      id: '1',
      title: 'Q4 Planning Strategy Call',
      date: new Date('2025-01-17T14:00:00'),
      actionItems: 3
    },
    {
      id: '2',
      title: 'Weekly Team Sync',
      date: new Date('2025-01-16T10:00:00'),
      actionItems: 2
    }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <Plus className="w-4 h-4" />
      case 'deadline':
        return <Calendar className="w-4 h-4" />
      case 'priority':
        return <TrendingUp className="w-4 h-4" />
      case 'meeting':
        return <Video className="w-4 h-4" />
      default:
        return <Sparkles className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'from-green-500 to-emerald-600'
      case 'deadline':
        return 'from-orange-500 to-amber-600'
      case 'priority':
        return 'from-red-500 to-pink-600'
      case 'meeting':
        return 'from-purple-500 to-indigo-600'
      default:
        return 'from-blue-500 to-cyan-600'
    }
  }

  const handleAddSuggestion = (suggestion: AISuggestion) => {
    alert(`Adding: ${suggestion.title}`)
  }

  const handleViewMeeting = (meetingId: string) => {
    window.location.href = `/calls/summary/${meetingId}`
  }

  const handleAddFromMeeting = () => {
    alert('Opening meeting selector...')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Suggestions</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Powered by your meetings</p>
        </div>
      </div>

      {/* Add from Meeting Button */}
      <button
        onClick={handleAddFromMeeting}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all"
      >
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          <span className="font-medium">Add from Meeting</span>
        </div>
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* AI Suggestions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Suggested Actions</h3>
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="group bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer"
              onClick={() => handleAddSuggestion(suggestion)}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className={`w-8 h-8 bg-gradient-to-br ${getTypeColor(suggestion.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {getTypeIcon(suggestion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                    {suggestion.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {suggestion.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getTypeColor(suggestion.type)} transition-all`}
                      style={{ width: `${suggestion.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {suggestion.confidence}%
                  </span>
                </div>
                <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition ml-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Linked Meetings */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent Meetings</h3>
        <div className="space-y-2">
          {linkedMeetings.map((meeting) => (
            <button
              key={meeting.id}
              onClick={() => handleViewMeeting(meeting.id)}
              className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
                    {meeting.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{meeting.date.toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{meeting.actionItems} action items</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Ask AI */}
      <button
        onClick={() => {
          const event = new CustomEvent('openPeakAI')
          window.dispatchEvent(event)
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">Ask Peak AI</span>
      </button>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{suggestions.length}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">AI Suggestions</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 border border-green-100 dark:border-green-800">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{linkedMeetings.reduce((sum, m) => sum + m.actionItems, 0)}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Action Items</p>
        </div>
      </div>
    </div>
  )
}
