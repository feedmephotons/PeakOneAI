'use client'

import { useState, useEffect } from 'react'
import { Star, Trash2, Clock, X, Search as SearchIcon } from 'lucide-react'
import { SavedSearch, advancedSearch, SearchQuery } from '@/lib/search'

interface SavedSearchesProps {
  isOpen: boolean
  onClose: () => void
  onSelectSearch: (query: SearchQuery) => void
  entityType?: 'task' | 'file' | 'message' | 'all'
}

export default function SavedSearches({ isOpen, onClose, onSelectSearch, entityType = 'all' }: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newSearchName, setNewSearchName] = useState('')
  const [newSearchQuery, setNewSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadSavedSearches()
    }
  }, [isOpen])

  const loadSavedSearches = () => {
    const searches = advancedSearch.getSavedSearches()
    setSavedSearches(
      entityType === 'all'
        ? searches
        : searches.filter(s => s.entityType === entityType)
    )
  }

  const handleSaveSearch = () => {
    if (!newSearchName.trim() || !newSearchQuery.trim()) return

    const query = advancedSearch.parseQuery(newSearchQuery)
    advancedSearch.saveSearch(newSearchName, query, entityType)

    loadSavedSearches()
    setNewSearchName('')
    setNewSearchQuery('')
    setIsCreating(false)
  }

  const handleSelectSearch = (search: SavedSearch) => {
    advancedSearch.updateSearchUsage(search.id)
    onSelectSearch(search.query)
    onClose()
  }

  const handleDeleteSearch = (searchId: string) => {
    if (!confirm('Delete this saved search?')) return

    advancedSearch.deleteSavedSearch(searchId)
    loadSavedSearches()
  }

  const formatQueryPreview = (query: SearchQuery): string => {
    const parts: string[] = []

    if (query.text) parts.push(query.text)
    if (query.tags?.length) parts.push(query.tags.map(t => `#${t}`).join(' '))
    if (query.priority) parts.push(`priority:${query.priority}`)
    if (query.status) parts.push(`status:${query.status}`)
    if (query.operators?.and?.length) parts.push(`AND ${query.operators.and.join(' AND ')}`)
    if (query.operators?.or?.length) parts.push(`OR ${query.operators.or.join(' OR ')}`)
    if (query.operators?.not?.length) parts.push(`NOT ${query.operators.not.join(' NOT ')}`)

    return parts.join(' ') || 'Empty query'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Searches</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quick access to your favorite search queries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Create New */}
          {isCreating ? (
            <div className="mb-6 p-4 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Create New Saved Search</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                  placeholder="Search name (e.g., High Priority Bugs)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm"
                />
                <input
                  type="text"
                  value={newSearchQuery}
                  onChange={(e) => setNewSearchQuery(e.target.value)}
                  placeholder="Search query (e.g., bug AND auth priority:HIGH)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsCreating(false)
                      setNewSearchName('')
                      setNewSearchQuery('')
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSearch}
                    className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                  >
                    Save Search
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-purple-500 dark:hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
            >
              <Star className="w-5 h-5" />
              <span className="font-medium">Save Current Search</span>
            </button>
          )}

          {/* Saved Searches List */}
          {savedSearches.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved searches yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Save your frequent searches for quick access
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition group"
                >
                  <div className="flex items-start justify-between">
                    <button
                      onClick={() => handleSelectSearch(search)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                          {search.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mb-2">
                        {formatQueryPreview(search.query)}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {search.lastUsed
                            ? `Used ${new Date(search.lastUsed).toLocaleDateString()}`
                            : `Created ${new Date(search.createdAt).toLocaleDateString()}`
                          }
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                          {search.entityType}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteSearch(search.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={() => {
              advancedSearch.clearRecentSearches()
              onClose()
            }}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Clear recent searches
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
