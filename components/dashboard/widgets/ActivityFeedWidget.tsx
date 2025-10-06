'use client'

import { Activity, CheckSquare, File, Video, MessageSquare, User } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'task' | 'file' | 'meeting' | 'message' | 'user'
  action: string
  timestamp: Date
  user?: string
}

export default function ActivityFeedWidget() {
  // Mock activity data - in real app, this would come from API/localStorage
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'task',
      action: 'completed task "Design new landing page"',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      user: 'You'
    },
    {
      id: '2',
      type: 'file',
      action: 'uploaded "project-specs.pdf"',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      user: 'Sarah Chen'
    },
    {
      id: '3',
      type: 'meeting',
      action: 'joined video call',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      user: 'Mike Johnson'
    },
    {
      id: '4',
      type: 'message',
      action: 'sent message in #general',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      user: 'Alex Smith'
    },
    {
      id: '5',
      type: 'task',
      action: 'created task "Bug fix: Auth flow"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      user: 'You'
    },
    {
      id: '6',
      type: 'user',
      action: 'joined the team',
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      user: 'Emma Davis'
    }
  ]

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task': return CheckSquare
      case 'file': return File
      case 'meeting': return Video
      case 'message': return MessageSquare
      case 'user': return User
      default: return Activity
    }
  }

  const getIconColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
      case 'file': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
      case 'meeting': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      case 'message': return 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20'
      case 'user': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = getIcon(activity.type)
        const iconColor = getIconColor(activity.type)

        return (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`p-2 ${iconColor} rounded-lg shrink-0`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">{activity.user}</span>{' '}
                <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                {formatTime(activity.timestamp)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
