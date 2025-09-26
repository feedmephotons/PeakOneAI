'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  CheckCircle, XCircle, AlertCircle, Info, X, Bell,
  MessageSquare, Calendar, FileText
} from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  timestamp: Date
  read: boolean
  category?: 'message' | 'task' | 'meeting' | 'file' | 'system'
}

interface NotificationContextType {
  notifications: Notification[]
  showNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  position: NotificationPosition
  setPosition: (position: NotificationPosition) => void
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  notificationHistory: Notification[]
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
  position?: NotificationPosition
  maxNotifications?: number
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  position: initialPosition = 'top-right',
  maxNotifications = 5
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationHistory, setNotificationHistory] = useState<Notification[]>([])
  const [position, setPosition] = useState<NotificationPosition>(initialPosition)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Load notification history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notificationHistory')
    if (saved) {
      const parsed = JSON.parse(saved)
      setNotificationHistory(parsed.map((n: Notification) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      })))
    }

    // Load sound preference
    const soundPref = localStorage.getItem('notificationSound')
    if (soundPref !== null) {
      setSoundEnabled(soundPref === 'true')
    }
  }, [])

  const playNotificationSound = () => {
    if (soundEnabled && typeof window !== 'undefined') {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    }
  }

  const showNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
      duration: notification.duration || 5000
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, maxNotifications)
      return updated
    })

    setNotificationHistory(prev => {
      const updated = [newNotification, ...prev].slice(0, 100) // Keep last 100 notifications
      localStorage.setItem('notificationHistory', JSON.stringify(updated))
      return updated
    })

    playNotificationSound()

    // Auto remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, newNotification.duration)
    }

    // Request browser notification permission and show browser notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/icon-192x192.png', // Add your app icon
          badge: '/icon-192x192.png',
          tag: newNotification.id
        })
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission()
      }
    }
  }, [maxNotifications, soundEnabled])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setNotificationHistory(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n)
      localStorage.setItem('notificationHistory', JSON.stringify(updated))
      return updated
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
    setNotificationHistory(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      localStorage.setItem('notificationHistory', JSON.stringify(updated))
      return updated
    })
  }, [])

  useEffect(() => {
    localStorage.setItem('notificationSound', soundEnabled.toString())
  }, [soundEnabled])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        removeNotification,
        clearNotifications,
        markAsRead,
        markAllAsRead,
        position,
        setPosition,
        soundEnabled,
        setSoundEnabled,
        notificationHistory
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

// Notification Container Component
const NotificationContainer: React.FC = () => {
  const { notifications, position, removeNotification } = useNotifications()

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2'
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2'
      default:
        return 'top-4 right-4'
    }
  }

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBackgroundColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  return (
    <div className={`fixed z-50 ${getPositionClasses()} space-y-3 pointer-events-none`}>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`
            max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg
            border pointer-events-auto transform transition-all duration-300
            ${getBackgroundColor(notification.type)}
            ${index === 0 ? 'animate-slide-in' : ''}
          `}
          style={{
            animation: `slideIn 0.3s ease-out`
          }}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.icon || getIcon(notification.type)}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {notification.title}
                </p>
                {notification.message && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {notification.message}
                  </p>
                )}
                {notification.action && (
                  <button
                    onClick={notification.action.onClick}
                    className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Notification Center Component (can be used in header)
export const NotificationCenter: React.FC = () => {
  const { notificationHistory, markAsRead, markAllAsRead, clearNotifications } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notificationHistory.filter(n => !n.read).length

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'message':
        return <MessageSquare className="w-4 h-4" />
      case 'task':
        return <CheckCircle className="w-4 h-4" />
      case 'meeting':
        return <Calendar className="w-4 h-4" />
      case 'file':
        return <FileText className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
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
    return `${days}d ago`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notificationHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notificationHistory.slice(0, 20).map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition ${
                        !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {notification.icon || getCategoryIcon(notification.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          {notification.message && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notificationHistory.length > 20 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full text-sm text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Add animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
  `
  document.head.appendChild(style)
}

// Export notification helper functions
// Note: These functions are placeholders. Use the useNotifications hook directly in components
export const notify = {
  success: (title: string, message?: string, options?: Partial<Notification>) => {
    console.log('Success notification:', title, message, options)
  },
  error: (title: string, message?: string, options?: Partial<Notification>) => {
    console.log('Error notification:', title, message, options)
  },
  warning: (title: string, message?: string, options?: Partial<Notification>) => {
    console.log('Warning notification:', title, message, options)
  },
  info: (title: string, message?: string, options?: Partial<Notification>) => {
    console.log('Info notification:', title, message, options)
  }
}