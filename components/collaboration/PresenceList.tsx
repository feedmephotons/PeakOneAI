'use client'

import { useEffect, useState } from 'react'
import { User, collaboration } from '@/lib/collaboration'

export default function PresenceList() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    // Load initial users
    setUsers(collaboration.getUsers())

    // Subscribe to presence changes
    const unsubscribe = collaboration.subscribeToPresence((userId, status) => {
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, status } : u
      ))
    })

    return unsubscribe
  }, [])

  const onlineUsers = users.filter(u => u.status === 'online')
  const awayUsers = users.filter(u => u.status === 'away')
  const offlineUsers = users.filter(u => u.status === 'offline')

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
    }
  }

  const formatLastSeen = (date?: Date) => {
    if (!date) return ''
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Online Users */}
      {onlineUsers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Online ({onlineUsers.length})
          </h3>
          <div className="space-y-2">
            {onlineUsers.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(user.status)} border-2 border-white dark:border-gray-900 rounded-full`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Away Users */}
      {awayUsers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Away ({awayUsers.length})
          </h3>
          <div className="space-y-2">
            {awayUsers.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition opacity-75">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(user.status)} border-2 border-white dark:border-gray-900 rounded-full`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Away
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offline Users */}
      {offlineUsers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Offline ({offlineUsers.length})
          </h3>
          <div className="space-y-2">
            {offlineUsers.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition opacity-50">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(user.status)} border-2 border-white dark:border-gray-900 rounded-full`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {formatLastSeen(user.lastSeen)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
