'use client'

import { useState } from 'react'
import { Search, X, Filter, Calendar, Tag, Star } from 'lucide-react'
import { SearchQuery, advancedSearch } from '@/lib/search'
import { TAG_COLORS } from '@/lib/tags'

interface AdvancedSearchProps {
  isOpen: boolean
  onSearch: (query: SearchQuery) => void
  onClose: () => void
  entityType?: 'task' | 'file' | 'message' | 'all'
}

export default function AdvancedSearch({ isOpen, onSearch, onClose, entityType = 'all' }: AdvancedSearchProps) {
  const [queryText, setQueryText] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Partial<SearchQuery>>({
    tags: [],
    priority: '',
    status: '',
    dateFrom: undefined,
    dateTo: undefined
  })
  const [recentSearches] = useState(advancedSearch.getRecentSearches())

  if (!isOpen) return null

  const handleSearch = () => {
    const parsedQuery = advancedSearch.parseQuery(queryText)
    const finalQuery: SearchQuery = {
      ...parsedQuery,
      ...filters,
      tags: [...(parsedQuery.tags || []), ...(filters.tags || [])]
    }

    onSearch(finalQuery)
    advancedSearch.addRecentSearch(queryText)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const toggleTag = (tag: string) => {
    const current = filters.tags || []
    setFilters({
      ...filters,
      tags: current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag]
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Search className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Advanced Search</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use operators like AND, OR, NOT for advanced queries
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

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search... (e.g., bug AND auth NOT login #urgent priority:HIGH from:2024-01-01)"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              autoFocus
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-3 flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition"
          >
            <Filter className="w-4 h-4" />
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    From Date
                  </span>
                </label>
                <input
                  type="date"
                  value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    To Date
                  </span>
                </label>
                <input
                  type="date"
                  value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Priority and Status */}
            {entityType === 'task' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={filters.priority || ''}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Priorities</option>
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            )}

            {/* Quick Tag Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Quick Tag Filters
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {['bug', 'feature', 'urgent', 'design', 'docs'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition ${
                      filters.tags?.includes(tag)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent Searches</h3>
            <div className="space-y-2">
              {recentSearches.map((recent, index) => (
                <button
                  key={index}
                  onClick={() => setQueryText(recent)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  {recent}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Syntax Help */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search Syntax</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">AND</code> - All terms must match</div>
            <div><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">OR</code> - Any term matches</div>
            <div><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">NOT</code> - Exclude term</div>
            <div><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">#tag</code> - Search by tag</div>
            <div><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">priority:HIGH</code> - Filter priority</div>
            <div><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">from:2024-01-01</code> - Date range</div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition font-medium"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  )
}
