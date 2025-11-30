'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Search as SearchIcon, FileText, MessageSquare, Users, Calendar,
  CheckSquare, Bot, FolderOpen, Clock, Filter, X, ArrowRight
} from 'lucide-react'

interface SearchResult {
  id: string
  type: 'file' | 'message' | 'task' | 'meeting' | 'contact' | 'ai' | 'folder'
  title: string
  description: string
  url: string
  timestamp?: Date
  highlight?: string
}

const SEARCH_CATEGORIES = [
  { id: 'all', label: 'All', icon: SearchIcon },
  { id: 'files', label: 'Files', icon: FileText },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'meetings', label: 'Meetings', icon: Calendar },
  { id: 'contacts', label: 'People', icon: Users },
]

const RECENT_SEARCHES = [
  'Q4 report',
  'marketing campaign',
  'sprint planning',
  'budget review',
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(RECENT_SEARCHES)

  const mockSearch = useCallback((searchQuery: string, cat: string): SearchResult[] => {
    if (!searchQuery.trim()) return []

    const allResults: SearchResult[] = [
      { id: '1', type: 'file', title: 'Q4 Sales Report.pdf', description: 'Quarterly analysis with growth projections', url: '/files', timestamp: new Date(Date.now() - 86400000) },
      { id: '2', type: 'file', title: 'Marketing Strategy 2025.docx', description: 'Annual marketing plan and budget', url: '/files', timestamp: new Date(Date.now() - 172800000) },
      { id: '3', type: 'message', title: 'Message in #general', description: 'Sarah: Can we discuss the Q4 results?', url: '/messages', timestamp: new Date(Date.now() - 3600000) },
      { id: '4', type: 'message', title: 'Message from John Smith', description: 'The report looks great! A few suggestions...', url: '/messages', timestamp: new Date(Date.now() - 7200000) },
      { id: '5', type: 'task', title: 'Review Q4 Budget', description: 'Due tomorrow - Assigned to you', url: '/tasks', timestamp: new Date(Date.now() - 14400000) },
      { id: '6', type: 'task', title: 'Update marketing materials', description: 'In progress - Due in 3 days', url: '/tasks' },
      { id: '7', type: 'meeting', title: 'Quarterly Review Meeting', description: 'Tomorrow at 2:00 PM with Leadership Team', url: '/calendar' },
      { id: '8', type: 'meeting', title: 'Sprint Planning', description: 'Monday at 9:00 AM', url: '/calendar' },
      { id: '9', type: 'contact', title: 'Sarah Johnson', description: 'Product Manager - sarah@company.com', url: '/messages' },
      { id: '10', type: 'contact', title: 'John Smith', description: 'Engineering Lead - john@company.com', url: '/messages' },
      { id: '11', type: 'ai', title: 'Lisa AI: Budget Analysis', description: 'Conversation about Q4 budget breakdown', url: '/lisa', timestamp: new Date(Date.now() - 86400000) },
      { id: '12', type: 'folder', title: 'Project Documents', description: '15 files - Last updated 2 days ago', url: '/files' },
    ]

    const filtered = allResults.filter(result => {
      const matchesQuery = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description.toLowerCase().includes(searchQuery.toLowerCase())

      if (cat === 'all') return matchesQuery

      const categoryMap: Record<string, string[]> = {
        files: ['file', 'folder'],
        messages: ['message'],
        tasks: ['task'],
        meetings: ['meeting'],
        contacts: ['contact'],
      }

      return matchesQuery && categoryMap[cat]?.includes(result.type)
    })

    return filtered
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    const timer = setTimeout(() => {
      const searchResults = mockSearch(query, category)
      setResults(searchResults)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, category, mockSearch])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    if (searchQuery.trim() && !recentSearches.includes(searchQuery)) {
      setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)])
    }
  }

  const getIcon = (type: SearchResult['type']) => {
    const icons = {
      file: FileText,
      folder: FolderOpen,
      message: MessageSquare,
      task: CheckSquare,
      meeting: Calendar,
      contact: Users,
      ai: Bot
    }
    return icons[type] || SearchIcon
  }

  const getIconColor = (type: SearchResult['type']) => {
    const colors = {
      file: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      folder: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
      message: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      task: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      meeting: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
      contact: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30',
      ai: 'text-violet-500 bg-violet-100 dark:bg-violet-900/30'
    }
    return colors[type] || 'text-gray-500 bg-gray-100'
  }

  const formatTime = (date?: Date) => {
    if (!date) return ''
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Search Everything
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find files, messages, tasks, meetings, and more
          </p>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input
            type="text"
            placeholder="Search across your workspace..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-14 pr-12 py-4 text-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white shadow-sm"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {SEARCH_CATEGORIES.map(cat => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  category === cat.id
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Results or Recent Searches */}
        {!query.trim() ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Recent Searches</span>
            </div>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <SearchIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{search}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Searching...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <SearchIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No results found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              Try different keywords or adjust your filters
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </p>
            {results.map(result => {
              const Icon = getIcon(result.type)
              const colorClass = getIconColor(result.type)

              return (
                <Link
                  key={result.id}
                  href={result.url}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {result.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {result.description}
                    </p>
                  </div>
                  {result.timestamp && (
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatTime(result.timestamp)}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
