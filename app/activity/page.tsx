'use client'

import { useState, useEffect } from 'react'
import { FileText, MessageSquare, CheckCircle, Calendar, Video, Upload, Edit, Trash2, User, Clock } from 'lucide-react'

interface Activity {
  id: string
  type: 'upload' | 'edit' | 'delete' | 'message' | 'task' | 'call' | 'event'
  action: string
  target: string
  user: string
  timestamp: Date
  metadata?: any
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading activities
    setTimeout(() => {
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'upload',
          action: 'uploaded',
          target: 'Q4 Sales Report.pdf',
          user: 'You',
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          metadata: { size: '2.3 MB', aiAnalyzed: true }
        },
        {
          id: '2',
          type: 'message',
          action: 'sent message to',
          target: 'Lisa AI',
          user: 'You',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          metadata: { preview: 'Can you analyze the latest sales data?' }
        },
        {
          id: '3',
          type: 'task',
          action: 'completed',
          target: 'Review marketing campaign',
          user: 'John Smith',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          metadata: { status: 'completed' }
        },
        {
          id: '4',
          type: 'edit',
          action: 'edited',
          target: 'Project Proposal.docx',
          user: 'Sarah Johnson',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        },
        {
          id: '5',
          type: 'call',
          action: 'started video call with',
          target: 'Development Team',
          user: 'You',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          metadata: { duration: '45 minutes', participants: 5 }
        },
        {
          id: '6',
          type: 'event',
          action: 'scheduled',
          target: 'Team Standup Meeting',
          user: 'Mike Wilson',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
          metadata: { date: 'Tomorrow at 10:00 AM' }
        },
        {
          id: '7',
          type: 'upload',
          action: 'uploaded',
          target: 'Design Mockups.fig',
          user: 'Emily Chen',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          metadata: { size: '15.7 MB' }
        },
        {
          id: '8',
          type: 'task',
          action: 'created',
          target: 'Implement user authentication',
          user: 'You',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          metadata: { priority: 'high', assignee: 'Development Team' }
        },
        {
          id: '9',
          type: 'delete',
          action: 'deleted',
          target: 'Old Requirements.txt',
          user: 'System',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          metadata: { reason: 'Automatic cleanup' }
        },
        {
          id: '10',
          type: 'message',
          action: 'received response from',
          target: 'Lisa AI',
          user: 'Lisa AI',
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          metadata: { preview: 'I&apos;ve completed the analysis of your sales data...' }
        }
      ]
      setActivities(mockActivities)
      setLoading(false)
    }, 500)
  }, [])

  const getIcon = (type: string) => {
    switch(type) {
      case 'upload': return <Upload className="w-4 h-4" />
      case 'edit': return <Edit className="w-4 h-4" />
      case 'delete': return <Trash2 className="w-4 h-4" />
      case 'message': return <MessageSquare className="w-4 h-4" />
      case 'task': return <CheckCircle className="w-4 h-4" />
      case 'call': return <Video className="w-4 h-4" />
      case 'event': return <Calendar className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'upload': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
      case 'edit': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'delete': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
      case 'message': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
      case 'task': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
      case 'call': return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
      case 'event': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.type === filter)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Recent Activity
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track all activities across your workspace
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
        >
          All Activity
        </button>
        {['upload', 'message', 'task', 'call', 'event', 'edit'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap capitalize transition-colors ${
              filter === type
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {type}s
          </button>
        ))}
      </div>

      {/* Activity list */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Loading activities...
            </div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No activities found
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getTypeColor(activity.type)}`}>
                    {getIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {activity.user}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {activity.action}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {activity.target}
                      </span>
                    </div>
                    {activity.metadata && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.metadata.preview && (
                          <p className="truncate">{activity.metadata.preview}</p>
                        )}
                        {activity.metadata.size && (
                          <span className="inline-flex items-center gap-2">
                            <span>{activity.metadata.size}</span>
                            {activity.metadata.aiAnalyzed && (
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                                AI Analyzed
                              </span>
                            )}
                          </span>
                        )}
                        {activity.metadata.duration && (
                          <span>Duration: {activity.metadata.duration}</span>
                        )}
                        {activity.metadata.date && (
                          <span>{activity.metadata.date}</span>
                        )}
                        {activity.metadata.priority && (
                          <span className="inline-flex items-center gap-2">
                            Priority:
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              activity.metadata.priority === 'high'
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {activity.metadata.priority}
                            </span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatTime(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">24</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Files uploaded</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">18</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tasks completed</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">156</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">AI interactions</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">8</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Active users</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}