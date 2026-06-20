'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  Search as SearchIcon, FileText, MessageSquare, Users, Calendar,
  CheckSquare, Bot, FolderOpen, Clock, X, ArrowRight, Target, Phone, StickyNote
} from 'lucide-react'
import {
  FIXED_TODAY,
  getMockTasks,
  getMockFiles,
  getMockThreads,
  getMockCalendarEvents,
  getMockCalls,
  MOCK_PEOPLE,
  MOCK_MISSIONS,
  MOCK_NOTES,
} from '@/lib/peak/mock'

type ResultType = 'file' | 'message' | 'task' | 'meeting' | 'contact' | 'ai' | 'mission' | 'note' | 'call'

interface SearchResult {
  id: string
  type: ResultType
  title: string
  description: string
  url: string
  timestamp?: string
}

const SEARCH_CATEGORIES = [
  { id: 'all', label: 'All', icon: SearchIcon },
  { id: 'missions', label: 'Missions', icon: Target },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'files', label: 'Files', icon: FileText },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'meetings', label: 'Calendar', icon: Calendar },
  { id: 'contacts', label: 'People', icon: Users },
  { id: 'notes', label: 'Notes', icon: StickyNote },
]

// Acme Corp seeded recent searches (match canonical entities).
const DEFAULT_RECENT_SEARCHES = [
  'Launch Product X',
  'Brian Miller',
  'board deck',
  'reliability',
]

const RECENT_KEY = 'peak.search.recent.v1'

// Build the full canonical result corpus once. Deterministic — derived only
// from the fixtures and FIXED_TODAY (no Date.now / random → SSR-safe).
function buildCorpus(): SearchResult[] {
  const results: SearchResult[] = []

  for (const m of MOCK_MISSIONS) {
    results.push({
      id: `mission-${m.id}`,
      type: 'mission',
      title: m.name,
      description: m.description || `${m.progress}% complete · ${m.status.replace('_', ' ').toLowerCase()}`,
      url: `/missions/${m.id}`,
      timestamp: m.targetDate || undefined,
    })
  }

  for (const t of getMockTasks()) {
    const who = t.assignee?.name ? `Assigned to ${t.assignee.name}` : 'Unassigned'
    results.push({
      id: `task-${t.id}`,
      type: 'task',
      title: t.title,
      description: t.missionName ? `${t.missionName} · ${who}` : who,
      url: '/tasks',
      timestamp: t.dueDate || t.updatedAt,
    })
  }

  for (const f of getMockFiles()) {
    results.push({
      id: `file-${f.id}`,
      type: 'file',
      title: f.name,
      description: f.aiSummary || `${f.sizeLabel} · ${f.owner.name}`,
      url: '/files',
      timestamp: f.updatedAt,
    })
  }

  for (const th of getMockThreads()) {
    results.push({
      id: `thread-${th.id}`,
      type: 'message',
      title: th.name,
      description: th.lastMessage || `${th.members.length} members`,
      url: `/messages?thread=${th.id}`,
      timestamp: th.lastMessageAt,
    })
  }

  for (const ev of getMockCalendarEvents()) {
    const attendees = ev.attendees?.map((a) => a.name).join(', ')
    results.push({
      id: `event-${ev.id}`,
      type: 'meeting',
      title: ev.title,
      description: ev.description || (attendees ? `With ${attendees}` : ev.type),
      url: ev.joinUrl || '/calendar',
      timestamp: ev.start,
    })
  }

  for (const c of getMockCalls()) {
    results.push({
      id: `call-${c.id}`,
      type: 'call',
      title: c.title,
      description: c.aiSummary || c.durationLabel || 'Call recording',
      url: `/calls/summary/${c.id}`,
      timestamp: c.startTime,
    })
  }

  for (const p of MOCK_PEOPLE) {
    const detail = [p.title, p.company].filter(Boolean).join(' · ')
    results.push({
      id: `contact-${p.id}`,
      type: 'contact',
      title: p.name,
      description: [detail, p.email].filter(Boolean).join(' — '),
      url: `/people/${p.id}`,
    })
  }

  for (const n of MOCK_NOTES) {
    results.push({
      id: `note-${n.id}`,
      type: 'note',
      title: n.title,
      description: (n.body || '').slice(0, 120) || `${n.brain} note`,
      url: '/memory',
      timestamp: n.updatedAt,
    })
  }

  return results
}

const CATEGORY_MAP: Record<string, ResultType[]> = {
  missions: ['mission'],
  files: ['file'],
  messages: ['message'],
  tasks: ['task'],
  meetings: ['meeting', 'call'],
  contacts: ['contact'],
  notes: ['note'],
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(DEFAULT_RECENT_SEARCHES)

  const corpus = useMemo(() => buildCorpus(), [])

  // Load persisted recent searches (seeded with Acme terms on first visit).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECENT_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) setRecentSearches(parsed)
      } else {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(DEFAULT_RECENT_SEARCHES))
      }
    } catch {
      /* ignore */
    }
  }, [])

  const runSearch = useCallback(
    (searchQuery: string, cat: string): SearchResult[] => {
      const q = searchQuery.toLowerCase().trim()
      if (!q) return []
      return corpus.filter((r) => {
        const matchesQuery =
          r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
        if (!matchesQuery) return false
        if (cat === 'all') return true
        return CATEGORY_MAP[cat]?.includes(r.type) ?? true
      })
    },
    [corpus],
  )

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    const timer = setTimeout(() => {
      setResults(runSearch(query, category))
      setLoading(false)
    }, 250)
    return () => clearTimeout(timer)
  }, [query, category, runSearch])

  const persistRecent = (term: string) => {
    setRecentSearches((prev) => {
      const next = [term, ...prev.filter((s) => s !== term)].slice(0, 6)
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
  }

  // Commit a recent search when the user pauses on a non-empty query.
  useEffect(() => {
    if (!query.trim()) return
    const t = setTimeout(() => persistRecent(query.trim()), 1200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const getIcon = (type: ResultType) => {
    const icons: Record<ResultType, typeof FileText> = {
      file: FileText,
      message: MessageSquare,
      task: CheckSquare,
      meeting: Calendar,
      contact: Users,
      ai: Bot,
      mission: Target,
      note: StickyNote,
      call: Phone,
    }
    return icons[type] || SearchIcon
  }

  const getIconColor = (type: ResultType) => {
    const colors: Record<ResultType, string> = {
      file: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      message: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      task: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      meeting: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
      contact: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30',
      ai: 'text-violet-500 bg-violet-100 dark:bg-violet-900/30',
      mission: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30',
      note: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
      call: 'text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30',
    }
    return colors[type] || 'text-gray-500 bg-gray-100'
  }

  // Deterministic relative time vs FIXED_TODAY (SSR-safe).
  const formatTime = (iso?: string) => {
    if (!iso) return ''
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ''
    const diff = new Date(FIXED_TODAY).getTime() - date.getTime()
    const days = Math.round(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days > 1 && days < 7) return `${days}d ago`
    if (days < 0 && days > -7) return `in ${Math.abs(days)}d`
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
            Find missions, tasks, files, people, meetings, and more
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
              aria-label="Clear search"
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
