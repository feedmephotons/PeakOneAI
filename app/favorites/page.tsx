'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Star, FileText, FolderOpen, MessageSquare, Calendar, CheckSquare,
  Users, Bot, Search, Grid, List, X, Target, Phone, StickyNote
} from 'lucide-react'
import { FIXED_TODAY } from '@/lib/peak/mock'
import {
  type FavoriteItem,
  type FavoriteType,
  getFavorites,
  saveFavorites,
  removeFavorite as removeFavoriteFromStore,
} from '@/lib/peak/favorites'

// Canonical Acme Corp seed favorites — deep-linked to specific entities.
// addedAt offsets are computed deterministically from FIXED_TODAY (SSR-safe).
function daysBefore(days: number): string {
  return new Date(new Date(FIXED_TODAY).getTime() - days * 86400000).toISOString()
}

const SEED_FAVORITES: FavoriteItem[] = [
  {
    id: 'mission-launch-product-x',
    type: 'mission',
    name: 'Launch Product X',
    description: '72% · On track',
    url: '/missions/mission-launch-product-x',
    addedAt: daysBefore(2),
  },
  {
    id: 'mission-q2-growth',
    type: 'mission',
    name: 'Q2 Growth Engine',
    description: '48% · At risk',
    url: '/missions/mission-q2-growth',
    addedAt: daysBefore(5),
  },
  {
    id: 'file-board-deck',
    type: 'file',
    name: 'Q2 Board Deck.pptx',
    description: 'Owned by Sarah Chen',
    url: '/files',
    addedAt: daysBefore(1),
  },
  {
    id: 'thread-product-x',
    type: 'channel',
    name: '#product-x',
    description: 'Launch coordination channel',
    url: '/messages?thread=thread-product-x',
    addedAt: daysBefore(10),
  },
  {
    id: 'contact-brian-miller',
    type: 'contact',
    name: 'Brian Miller',
    description: 'Investor · Summit Ventures',
    url: '/people/contact-brian-miller',
    addedAt: daysBefore(7),
  },
  {
    id: 'call-q2-campaign',
    type: 'call',
    name: 'Q2 Campaign Sync',
    description: 'Call recap with action items',
    url: '/calls/summary/call-q2-campaign',
    addedAt: daysBefore(1),
  },
  {
    id: 'note-product-launch-plan',
    type: 'note',
    name: 'Product Launch Plan',
    description: 'Memory note · Launch Product X',
    url: '/memory',
    addedAt: daysBefore(3),
  },
  {
    id: 'thread-dm-lisa',
    type: 'conversation',
    name: 'Lisa AI',
    description: 'Your AI assistant conversation',
    url: '/lisa',
    addedAt: daysBefore(1),
  },
]

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const existing = getFavorites()
    if (existing.length > 0) {
      setFavorites(existing)
    } else {
      // First visit: seed the shared store with canonical favorites.
      saveFavorites(SEED_FAVORITES)
      setFavorites(SEED_FAVORITES)
    }
    setLoading(false)
  }, [])

  const getIcon = (type: FavoriteType) => {
    const icons: Record<FavoriteType, typeof FileText> = {
      file: FileText,
      folder: FolderOpen,
      channel: MessageSquare,
      meeting: Calendar,
      task: CheckSquare,
      contact: Users,
      mission: Target,
      note: StickyNote,
      call: Phone,
      conversation: Bot,
    }
    return icons[type] || Star
  }

  const getIconColor = (type: FavoriteType) => {
    const colors: Record<FavoriteType, string> = {
      file: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      folder: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
      channel: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      meeting: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
      task: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      contact: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30',
      mission: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30',
      note: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
      call: 'text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30',
      conversation: 'text-violet-500 bg-violet-100 dark:bg-violet-900/30',
    }
    return colors[type] || 'text-gray-500 bg-gray-100'
  }

  const removeFavorite = (id: string) => {
    const updated = removeFavoriteFromStore(id)
    setFavorites(updated)
  }

  const filteredFavorites = favorites.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Deterministic relative date vs FIXED_TODAY (SSR-safe).
  const formatDate = (iso: string) => {
    const date = new Date(iso)
    const diff = new Date(FIXED_TODAY).getTime() - date.getTime()
    const days = Math.floor(diff / 86400000)

    if (days <= 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full">
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
                      aria-label={`Remove ${favorite.name} from favorites`}
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
                        aria-label={`Remove ${favorite.name} from favorites`}
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
