'use client'

import { useState, useEffect } from 'react'
import {
  Bell, Check, CheckCheck, Trash2, Settings, Filter,
  MessageSquare, Calendar, FileText, Users, Bot, Phone,
  Star, AlertCircle, Info, CheckCircle, X, MoreVertical
} from 'lucide-react'

interface Notification {
  id: string
  type: 'message' | 'meeting' | 'task' | 'file' | 'mention' | 'ai' | 'call' | 'system'
  title: string
  description: string
  timestamp: Date
  read: boolean
  starred: boolean
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  actionUrl?: string
  sender?: {
    name: string
    avatar?: string
    initials: string
  }
}

const NOTIFICATION_FILTERS = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'unread', label: 'Unread', icon: AlertCircle },
  { id: 'mentions', label: 'Mentions', icon: Users },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'meetings', label: 'Meetings', icon: Calendar },
  { id: 'ai', label: 'Lisa AI', icon: Bot },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load or create mock notifications
    const saved = localStorage.getItem('notifications')
    if (saved) {
      const parsed = JSON.parse(saved)
      setNotifications(parsed.map((n: Notification) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      })))
    } else {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'mention',
          title: 'Sarah mentioned you in #general',
          description: '@you Can you review the latest design mockups?',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          read: false,
          starred: false,
          priority: 'high',
          sender: { name: 'Sarah Johnson', initials: 'SJ' }
        },
        {
          id: '2',
          type: 'meeting',
          title: 'Meeting starting in 15 minutes',
          description: 'Sprint Planning with Engineering Team',
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          read: false,
          starred: true,
          priority: 'urgent'
        },
        {
          id: '3',
          type: 'ai',
          title: 'Lisa AI completed your request',
          description: 'Your document summary is ready to view',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          read: false,
          starred: false
        },
        {
          id: '4',
          type: 'task',
          title: 'Task assigned to you',
          description: 'Review Q4 marketing budget proposal',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          read: true,
          starred: false,
          sender: { name: 'John Smith', initials: 'JS' }
        },
        {
          id: '5',
          type: 'file',
          title: 'New file shared with you',
          description: 'Project Roadmap.pdf was shared by Emily Chen',
          timestamp: new Date(Date.now() - 1000 * 60 * 120),
          read: true,
          starred: false,
          sender: { name: 'Emily Chen', initials: 'EC' }
        },
        {
          id: '6',
          type: 'message',
          title: 'New message from Mike Wilson',
          description: 'Hey, did you get a chance to look at the proposal?',
          timestamp: new Date(Date.now() - 1000 * 60 * 180),
          read: true,
          starred: false,
          sender: { name: 'Mike Wilson', initials: 'MW' }
        },
        {
          id: '7',
          type: 'call',
          title: 'Missed call from Lisa Park',
          description: 'You missed a video call at 2:30 PM',
          timestamp: new Date(Date.now() - 1000 * 60 * 240),
          read: true,
          starred: false,
          sender: { name: 'Lisa Park', initials: 'LP' }
        },
        {
          id: '8',
          type: 'system',
          title: 'Weekly activity summary',
          description: 'Your productivity increased by 15% this week!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          read: true,
          starred: false
        }
      ]
      setNotifications(mockNotifications)
      localStorage.setItem('notifications', JSON.stringify(mockNotifications))
    }
    setLoading(false)
  }, [])

  const getIcon = (type: Notification['type']) => {
    const icons = {
      message: MessageSquare,
      meeting: Calendar,
      task: CheckCircle,
      file: FileText,
      mention: Users,
      ai: Bot,
      call: Phone,
      system: Info
    }
    return icons[type] || Bell
  }

  const getIconColor = (type: Notification['type']) => {
    const colors = {
      message: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      meeting: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
      task: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      file: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      mention: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30',
      ai: 'text-violet-500 bg-violet-100 dark:bg-violet-900/30',
      call: 'text-red-500 bg-red-100 dark:bg-red-900/30',
      system: 'text-gray-500 bg-gray-100 dark:bg-gray-700'
    }
    return colors[type] || 'text-gray-500 bg-gray-100'
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const markAsRead = (id: string) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    )
    setNotifications(updated)
    localStorage.setItem('notifications', JSON.stringify(updated))
  }

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    localStorage.setItem('notifications', JSON.stringify(updated))
  }

  const toggleStar = (id: string) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, starred: !n.starred } : n
    )
    setNotifications(updated)
    localStorage.setItem('notifications', JSON.stringify(updated))
  }

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id)
    setNotifications(updated)
    localStorage.setItem('notifications', JSON.stringify(updated))
  }

  const filteredNotifications = notifications.filter(n => {
    switch (filter) {
      case 'unread':
        return !n.read
      case 'mentions':
        return n.type === 'mention'
      case 'messages':
        return n.type === 'message'
      case 'meetings':
        return n.type === 'meeting'
      case 'ai':
        return n.type === 'ai'
      default:
        return true
    }
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {NOTIFICATION_FILTERS.map(f => {
            const Icon = f.icon
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  filter === f.id
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No notifications</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                {filter !== 'all' ? 'Try a different filter' : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredNotifications.map(notification => {
                const Icon = getIcon(notification.type)
                const colorClass = getIconColor(notification.type)

                return (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 flex gap-4 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-900 dark:text-white`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                            {notification.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(notification.timestamp)}
                            </span>
                            {notification.priority === 'urgent' && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
                                Urgent
                              </span>
                            )}
                            {notification.priority === 'high' && (
                              <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                                High Priority
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleStar(notification.id)
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                          >
                            <Star className={`w-4 h-4 ${notification.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
