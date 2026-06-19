'use client'

import { Brain, Calendar, TrendingUp, Video, Plus, ChevronRight } from 'lucide-react'

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
        return <Brain className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-peak-green'
      case 'deadline':
        return 'bg-peak-amber'
      case 'priority':
        return 'bg-peak-red'
      case 'meeting':
        return 'bg-peak-primary'
      default:
        return 'bg-peak-primary'
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
        <div className="w-10 h-10 bg-peak-primary rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-peak">Suggestions</h2>
          <p className="text-xs text-peak-muted">Powered by your meetings</p>
        </div>
      </div>

      {/* Add from Meeting Button */}
      <button
        onClick={handleAddFromMeeting}
        className="w-full flex items-center justify-between px-4 py-3 bg-peak-primary text-white rounded-xl hover:bg-peak-primary-600 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          <span className="font-medium">Add from Meeting</span>
        </div>
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* AI Suggestions */}
      <div>
        <h3 className="text-sm font-semibold text-peak-muted mb-3">Suggested Actions</h3>
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="group bg-peak-glass rounded-xl p-4 border border-peak-border hover:bg-white/[0.04] hover:border-peak-primary/30 transition-all cursor-pointer"
              onClick={() => handleAddSuggestion(suggestion)}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className={`w-8 h-8 ${getTypeColor(suggestion.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {getTypeIcon(suggestion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-peak text-sm mb-1">
                    {suggestion.title}
                  </h4>
                  <p className="text-xs text-peak-muted">
                    {suggestion.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getTypeColor(suggestion.type)} transition-all`}
                      style={{ width: `${suggestion.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-peak-muted">
                    {suggestion.confidence}%
                  </span>
                </div>
                <Plus className="w-4 h-4 text-peak-dim group-hover:text-peak-primary-300 transition ml-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Linked Meetings */}
      <div>
        <h3 className="text-sm font-semibold text-peak-muted mb-3">Recent Meetings</h3>
        <div className="space-y-2">
          {linkedMeetings.map((meeting) => (
            <button
              key={meeting.id}
              onClick={() => handleViewMeeting(meeting.id)}
              className="w-full text-left p-3 bg-peak-glass rounded-xl border border-peak-border hover:border-peak-primary/30 hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-peak-primary/15 ring-1 ring-peak-primary/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Video className="w-4 h-4 text-peak-primary-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-peak text-sm mb-1 truncate">
                    {meeting.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-peak-muted">
                    <span>{meeting.date.toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{meeting.actionItems} action items</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-peak-dim group-hover:text-peak-primary-300 transition flex-shrink-0" />
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
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.04] text-peak rounded-xl hover:bg-white/[0.08] transition border border-peak-border"
      >
        <Brain className="w-5 h-5" />
        <span className="font-medium">Ask Lisa</span>
      </button>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-peak-primary/15 ring-1 ring-peak-primary/30 rounded-xl p-3 border border-peak-border">
          <p className="text-2xl font-bold text-peak">{suggestions.length}</p>
          <p className="text-xs text-peak-muted">Suggestions</p>
        </div>
        <div className="bg-peak-green/15 ring-1 ring-peak-green/30 rounded-xl p-3 border border-peak-border">
          <p className="text-2xl font-bold text-peak">{linkedMeetings.reduce((sum, m) => sum + m.actionItems, 0)}</p>
          <p className="text-xs text-peak-muted">Action Items</p>
        </div>
      </div>
    </div>
  )
}
