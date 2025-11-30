'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Star, FileText, FolderOpen, MessageSquare, Calendar, CheckSquare,
  Users, Video, Bot, Search, Grid, List, MoreVertical, X
} from 'lucide-react'

interface FavoriteItem {
  id: string
  type: 'file' | 'folder' | 'channel' | 'meeting' | 'task' | 'contact' | 'conversation'
  name: string
  description?: string
  url: string
  icon?: string
  addedAt: Date
  lastAccessed?: Date
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('favorites')
    if (saved) {
      const parsed = JSON.parse(saved)
      setFavorites(parsed.map((f: FavoriteItem) => ({
        ...f,
        addedAt: new Date(f.addedAt),
        lastAccessed: f.lastAccessed ? new Date(f.lastAccessed) : undefined
      })))
    } else {
      const mockFavorites: FavoriteItem[] = [
        {
          id: '1',
          type: 'file',
          name: 'Q4 Sales Report.pdf',
          description: 'Quarterly sales analysis with projections',
          url: '/files',
          addedAt: new Date(Date.now() - 86400000 * 2),
          lastAccessed: new Date(Date.now() - 3600000)
        },
        {
          id: '2',
          type: 'folder',
          name: 'Project Documents',
          description: '12 files',
          url: '/files',
          addedAt: new Date(Date.now() - 86400000 * 5)
        },
        {
          id: '3',
          type: 'channel',
          name: '#general',
          description: 'Team-wide discussions',
          url: '/messages',
          addedAt: new Date(Date.now() - 86400000 * 10)
        },
        {
          id: '4',
          type: 'meeting',
          name: 'Weekly Standup',
          description: 'Every Monday at 9:00 AM',
          url: '/calendar',
          addedAt: new Date(Date.now() - 86400000 * 3)
        },
        {
          id: '5',
          type: 'task',
          name: 'Review Marketing Campaign',
          description: 'Due in 2 days',
          url: '/tasks',
          addedAt: new Date(Date.now() - 86400000)
        },
        {
          id: '6',
          type: 'contact',
          name: 'Sarah Johnson',
          description: 'Product Manager',
          url: '/messages',
          addedAt: new Date(Date.now() - 86400000 * 7)
        },
        {
          id: '7',
          type: 'conversation',
          name: 'Lisa AI - Budget Analysis',
          description: 'AI conversation from yesterday',
          url: '/lisa',
          addedAt: new Date(Date.now() - 86400000)
        },
        {
          id: '8',
          type: 'file',
          name: 'Brand Guidelines.pdf',
          description: 'Official brand standards',
          url: '/files',
          addedAt: new Date(Date.now() - 86400000 * 14)
        }
      ]
      setFavorites(mockFavorites)
      localStorage.setItem('favorites', JSON.stringify(mockFavorites))
    }
    setLoading(false)
  }, [])

  const getIcon = (type: FavoriteItem['type']) => {
    const icons = {
      file: FileText,
      folder: FolderOpen,
      channel: MessageSquare,
      meeting: Calendar,
      task: CheckSquare,
      contact: Users,
      conversation: Bot
    }
    return icons[type] || Star
  }

  const getIconColor = (type: FavoriteItem['type']) => {
    const colors = {
      file: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      folder: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
      channel: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      meeting: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
      task: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      contact: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30',
      conversation: 'text-violet-500 bg-violet-100 dark:bg-violet-900/30'
    }
    return colors[type] || 'text-gray-500 bg-gray-100'
  }

  const removeFavorite = (id: string) => {
    const updated = favorites.filter(f => f.id !== id)
    setFavorites(updated)
    localStorage.setItem('favorites', JSON.stringify(updated))
  }

  const filteredFavorites = favorites.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / 86400000)

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Favorites
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Quick access to your starred items
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
          />
        </div>

        {/* Favorites Grid/List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading favorites...</p>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-16">
            <Star className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No favorites yet</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              Star items across the app to see them here
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFavorites.map(favorite => {
              const Icon = getIcon(favorite.type)
              const colorClass = getIconColor(favorite.type)

              return (
                <Link
                  key={favorite.id}
                  href={favorite.url}
                  className="group bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeFavorite(favorite.id)
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1">
                    {favorite.name}
                  </h3>
                  {favorite.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-2">
                      {favorite.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-400">
                      Added {formatDate(favorite.addedAt)}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredFavorites.map(favorite => {
                const Icon = getIcon(favorite.type)
                const colorClass = getIconColor(favorite.type)

                return (
                  <Link
                    key={favorite.id}
                    href={favorite.url}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {favorite.name}
                      </h3>
                      {favorite.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {favorite.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 hidden sm:block">
                        {formatDate(favorite.addedAt)}
                      </span>
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeFavorite(favorite.id)
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
