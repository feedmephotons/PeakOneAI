'use client'

import { Video, CheckSquare, Calendar, Users, ExternalLink, Clock, Brain, TrendingUp } from 'lucide-react'

interface MeetingReference {
  id: string
  title: string
  date: Date
  type: 'call' | 'meeting'
  context: string // What was said about the file
  timestamp: string // When in the meeting it was mentioned
}

interface RelatedTask {
  id: string
  title: string
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface FileContext {
  fileName: string
  meetingReferences: MeetingReference[]
  relatedTasks: RelatedTask[]
  aiInsights: string[]
  collaborators: string[]
  recentActivity: { user: string; action: string; time: Date }[]
}

export default function FileContextPanel({ file }: { file?: { name: string; id: string } }) {
  // Mock data - in production this would come from the AI context system
  const context: FileContext = {
    fileName: file?.name || 'Q4 Sales Report.pdf',
    meetingReferences: [
      {
        id: '1',
        title: 'Q4 Planning Strategy Call',
        date: new Date('2025-01-17T14:00:00'),
        type: 'call',
        context: 'Sarah mentioned the revenue forecast needs to be updated based on this report',
        timestamp: '14:23'
      },
      {
        id: '2',
        title: 'Weekly Team Sync',
        date: new Date('2025-01-16T10:00:00'),
        type: 'meeting',
        context: 'Mike requested everyone review the Q4 numbers before Friday',
        timestamp: '10:15'
      },
      {
        id: '3',
        title: 'Finance Review',
        date: new Date('2025-01-15T15:00:00'),
        type: 'call',
        context: 'Team discussed regional performance metrics from pages 12-15',
        timestamp: '15:42'
      }
    ],
    relatedTasks: [
      {
        id: '1',
        title: 'Review Q4 sales analysis',
        status: 'IN_PROGRESS',
        priority: 'HIGH'
      },
      {
        id: '2',
        title: 'Update revenue forecast',
        status: 'TODO',
        priority: 'HIGH'
      },
      {
        id: '3',
        title: 'Prepare presentation slides',
        status: 'COMPLETED',
        priority: 'MEDIUM'
      }
    ],
    aiInsights: [
      '23% YoY growth - highest in the East region',
      'Q3 marketing campaign drove 40% of new leads',
      'Recommended action: Increase Q1 budget by 15%'
    ],
    collaborators: ['Sarah Chen', 'Mike Johnson', 'Alex Kim'],
    recentActivity: [
      { user: 'Sarah Chen', action: 'Commented on page 3', time: new Date(Date.now() - 3600000) },
      { user: 'Mike Johnson', action: 'Downloaded', time: new Date(Date.now() - 7200000) },
      { user: 'You', action: 'Uploaded version 3', time: new Date(Date.now() - 86400000) }
    ]
  }

  const getTypeIcon = (type: 'call' | 'meeting') => {
    return type === 'call' ? <Video className="w-4 h-4" /> : <Calendar className="w-4 h-4" />
  }

  const getTypeColor = (type: 'call' | 'meeting') => {
    return type === 'call' ? 'from-purple-500 to-indigo-600' : 'from-blue-500 to-cyan-600'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'LOW':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 dark:text-green-400'
      case 'IN_PROGRESS':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const handleViewMeeting = (meetingId: string, type: 'call' | 'meeting') => {
    if (type === 'call') {
      window.location.href = `/calls/summary/${meetingId}`
    } else {
      window.location.href = `/calendar/${meetingId}`
    }
  }

  const handleViewTask = (taskId: string) => {
    window.location.href = `/tasks?highlight=${taskId}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <ExternalLink className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">File Context</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Smart insights for {context.fileName}</p>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Insights</h3>
        </div>
        <ul className="space-y-2">
          {context.aiInsights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
              <TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Meeting References */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Video className="w-4 h-4" />
          Discussed in Meetings ({context.meetingReferences.length})
        </h3>
        <div className="space-y-3">
          {context.meetingReferences.map((ref) => (
            <button
              key={ref.id}
              onClick={() => handleViewMeeting(ref.id, ref.type)}
              className="w-full text-left group bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className={`w-8 h-8 bg-gradient-to-br ${getTypeColor(ref.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {getTypeIcon(ref.type)}
                  <span className="text-white text-xs sr-only">{ref.type}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                    {ref.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{ref.date.toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{ref.timestamp}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2">
                &ldquo;{ref.context}&rdquo;
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Related Tasks */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          Related Tasks ({context.relatedTasks.length})
        </h3>
        <div className="space-y-2">
          {context.relatedTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => handleViewTask(task.id)}
              className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {task.title}
                </h4>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <span className={`text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Collaborators */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Active Collaborators
        </h3>
        <div className="flex items-center gap-2">
          {context.collaborators.map((name, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {name[0]}
              </div>
              <span className="text-xs text-gray-700 dark:text-gray-300">{name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Activity
        </h3>
        <div className="space-y-2">
          {context.recentActivity.map((activity, i) => (
            <div key={i} className="flex items-start gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {activity.user[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-900 dark:text-white">
                  <span className="font-medium">{activity.user}</span> {activity.action}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <button
        onClick={() => {
          const event = new CustomEvent('openPeakAI')
          window.dispatchEvent(event)
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700"
      >
        <Brain className="w-5 h-5" />
        <span className="font-medium">Ask Lisa About This File</span>
      </button>
    </div>
  )
}
