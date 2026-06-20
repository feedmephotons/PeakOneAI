'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell, CheckCheck, Settings,
  Calendar, FileText, Users, Bot, Phone,
  Star, AlertCircle, Info, CheckCircle, X
} from 'lucide-react'
import { MOCK_NOTIFICATIONS, FIXED_TODAY } from '@/lib/peak/mock'
import type { NotificationItem } from '@/lib/peak/types'

// Local UI-state extension of the canonical NotificationItem (adds starred,
// which the demo persists to localStorage but is not part of the world model).
interface UINotification extends NotificationItem {
  starred?: boolean
}

const NOTIFICATION_FILTERS = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'unread', label: 'Unread', icon: AlertCircle },
  { id: 'mentions', label: 'Mentions', icon: Users },
  { id: 'meetings', label: 'Meetings', icon: Calendar },
  { id: 'tasks', label: 'Tasks', icon: CheckCircle },
  { id: 'ai', label: 'Lisa AI', icon: Bot },
]

const STORAGE_KEY = 'peak-notifications-v2'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<UINotification[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Hydrate from localStorage if the user has interacted before; otherwise
    // seed from the canonical Acme Corp notification fixtures.
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setNotifications(JSON.parse(saved))
      } catch {
        setNotifications(MOCK_NOTIFICATIONS as UINotification[])
      }
    } else {
      setNotifications(MOCK_NOTIFICATIONS as UINotification[])
    }
    setLoading(false)
  }, [])

  const persist = (updated: UINotification[]) => {
    setNotifications(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const getIcon = (kind: NotificationItem['kind']) => {
    const icons = {
      MEETING: Calendar,
      TASK: CheckCircle,
      MENTION: Users,
      AI: Bot,
      FILE: FileText,
      CALL: Phone,
      SYSTEM: Info,
    } as const
    return icons[kind] || Bell
  }

  const getIconColor = (kind: NotificationItem['kind']) => {
    const colors = {
      MEETING: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
      TASK: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      MENTION: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30',
      AI: 'text-violet-500 bg-violet-100 dark:bg-violet-900/30',
      FILE: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      CALL: 'text-red-500 bg-red-100 dark:bg-red-900/30',
      SYSTEM: 'text-gray-500 bg-gray-100 dark:bg-gray-700',
    } as const
    return colors[kind] || 'text-gray-500 bg-gray-100'
  }

  // SSR-safe: relative time anchored to the fixed world clock (FIXED_TODAY),
  // never Date.now(), so the same fixtures render identically every load.
  const formatTime = (iso: string) => {
    const date = new Date(iso)
    const now = new Date(FIXED_TODAY).getTime()
    const diff = now - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (diff < 0) {
      // Scheduled in the (world) future, e.g. a meeting starting later today.
      const upMin = Math.floor(-diff / 60000)
      const upHr = Math.floor(-diff / 3600000)
      if (upMin < 60) return `in ${upMin}m`
      if (upHr < 24) return `in ${upHr}h`
      return date.toLocaleDateString()
    }
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const markAsRead = (id: string) => {
    persist(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    persist(notifications.map((n) => ({ ...n, read: true })))
  }

  const toggleStar = (id: string) => {
    persist(notifications.map((n) => (n.id === id ? { ...n, starred: !n.starred } : n)))
  }

  const deleteNotification = (id: string) => {
    persist(notifications.filter((n) => n.id !== id))
  }

  // Click a row -> mark read, then deep-link to the canonical actionUrl.
  const handleOpen = (n: UINotification) => {
    markAsRead(n.id)
    if (n.actionUrl) router.push(n.actionUrl)
  }

  const filteredNotifications = notifications.filter((n) => {
    switch (filter) {
      case 'unread':
        return !n.read
      case 'mentions':
        return n.kind === 'MENTION'
      case 'meetings':
        return n.kind === 'MEETING'
      case 'tasks':
        return n.kind === 'TASK'
      case 'ai':
        return n.kind === 'AI'
      default:
        return true
    }
  })

  const unreadCount = notifications.filter((n) => !n.read).length

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
            <button
              onClick={() => router.push('/settings/notifications')}
              title="Notification settings"
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {NOTIFICATION_FILTERS.map((f) => {
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
              {filteredNotifications.map((notification) => {
                const Icon = getIcon(notification.kind)
                const colorClass = getIconColor(notification.kind)

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleOpen(notification)}
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
                            {notification.body}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            {notification.actor && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {notification.actor.name}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(notification.timestamp)}
                            </span>
                            {notification.tone === 'red' && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
                                High risk
                              </span>
                            )}
                            {notification.tone === 'amber' && (
                              <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                                Needs attention
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
