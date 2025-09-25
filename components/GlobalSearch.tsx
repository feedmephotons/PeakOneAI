'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, FileText, MessageSquare, CheckCircle, Calendar, Video, Phone } from 'lucide-react'

interface SearchResult {
  id: string
  type: 'file' | 'task' | 'message' | 'event' | 'call'
  title: string
  description?: string
  timestamp?: string
  icon: JSX.Element
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle keyboard shortcut Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Mock search function - replace with actual API call
  useEffect(() => {
    if (query.length > 0) {
      setIsSearching(true)

      // Simulate search delay
      const timer = setTimeout(() => {
        const mockResults: SearchResult[] = [
          {
            id: '1',
            type: 'file',
            title: 'Q4 Sales Report.pdf',
            description: 'Contains quarterly sales data and projections',
            timestamp: '2 hours ago',
            icon: <FileText className="w-5 h-5" />
          },
          {
            id: '2',
            type: 'task',
            title: 'Review marketing campaign',
            description: 'Due tomorrow at 5:00 PM',
            timestamp: 'Due tomorrow',
            icon: <CheckCircle className="w-5 h-5" />
          },
          {
            id: '3',
            type: 'message',
            title: 'Lisa AI: Project analysis complete',
            description: 'Your project analysis has been completed...',
            timestamp: '1 hour ago',
            icon: <MessageSquare className="w-5 h-5" />
          },
          {
            id: '4',
            type: 'event',
            title: 'Team standup meeting',
            description: 'Daily sync with development team',
            timestamp: 'Today at 10:00 AM',
            icon: <Calendar className="w-5 h-5" />
          },
          {
            id: '5',
            type: 'call',
            title: 'Call with John Smith',
            description: 'Discussed project requirements',
            timestamp: 'Yesterday',
            icon: <Video className="w-5 h-5" />
          }
        ].filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
        )

        setResults(mockResults)
        setIsSearching(false)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setResults([])
      setIsSearching(false)
    }
  }, [query])

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'file': return 'bg-blue-100 text-blue-600'
      case 'task': return 'bg-green-100 text-green-600'
      case 'message': return 'bg-purple-100 text-purple-600'
      case 'event': return 'bg-yellow-100 text-yellow-600'
      case 'call': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <Search className="w-4 h-4 text-gray-500" />
        <span className="text-gray-600 text-sm">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs bg-white rounded border border-gray-300 font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Search modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
          <div
            ref={searchRef}
            className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-5 duration-200"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 p-4 border-b">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files, tasks, messages..."
                className="flex-1 outline-none text-lg"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search results */}
            <div className="max-h-96 overflow-y-auto">
              {isSearching && (
                <div className="p-8 text-center text-gray-500">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </div>
                </div>
              )}

              {!isSearching && query && results.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No results found for &quot;{query}&quot;
                </div>
              )}

              {!isSearching && results.length > 0 && (
                <div className="py-2">
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => {
                        // Handle result click - navigate or open
                        console.log('Selected:', result)
                        setIsOpen(false)
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                        {result.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {result.title}
                        </div>
                        {result.description && (
                          <div className="text-sm text-gray-500 truncate">
                            {result.description}
                          </div>
                        )}
                      </div>
                      {result.timestamp && (
                        <div className="text-xs text-gray-400 whitespace-nowrap">
                          {result.timestamp}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {!query && (
                <div className="p-4 space-y-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
                    Quick Actions
                  </div>
                  <div className="space-y-1">
                    <button className="w-full px-2 py-2 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Upload a file</span>
                    </button>
                    <button className="w-full px-2 py-2 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Create a task</span>
                    </button>
                    <button className="w-full px-2 py-2 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Chat with Lisa AI</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span><kbd>↑↓</kbd> Navigate</span>
                <span><kbd>Enter</kbd> Select</span>
                <span><kbd>Esc</kbd> Close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}