'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, File, CheckSquare, MessageSquare, Calendar, User, Clock, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  type: 'file' | 'task' | 'message' | 'event' | 'contact' | 'action'
  title: string
  subtitle?: string
  icon: React.ReactNode
  action: () => void
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  const quickActions: SearchResult[] = [
    {
      id: 'new-file',
      type: 'action',
      title: 'Create New File',
      icon: <File className="w-4 h-4" />,
      action: () => {
        router.push('/files?action=new')
        onClose()
      }
    },
    {
      id: 'new-task',
      type: 'action',
      title: 'Create New Task',
      icon: <CheckSquare className="w-4 h-4" />,
      action: () => {
        router.push('/tasks?action=new')
        onClose()
      }
    },
    {
      id: 'new-message',
      type: 'action',
      title: 'New Message',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => {
        router.push('/messages?action=new')
        onClose()
      }
    },
    {
      id: 'new-event',
      type: 'action',
      title: 'Create Calendar Event',
      icon: <Calendar className="w-4 h-4" />,
      action: () => {
        router.push('/calendar?action=new')
        onClose()
      }
    },
    {
      id: 'go-files',
      type: 'action',
      title: 'Go to Files',
      icon: <File className="w-4 h-4" />,
      action: () => {
        router.push('/files')
        onClose()
      }
    },
    {
      id: 'go-tasks',
      type: 'action',
      title: 'Go to Tasks',
      icon: <CheckSquare className="w-4 h-4" />,
      action: () => {
        router.push('/tasks')
        onClose()
      }
    },
    {
      id: 'go-messages',
      type: 'action',
      title: 'Go to Messages',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => {
        router.push('/messages')
        onClose()
      }
    },
    {
      id: 'go-calendar',
      type: 'action',
      title: 'Go to Calendar',
      icon: <Calendar className="w-4 h-4" />,
      action: () => {
        router.push('/calendar')
        onClose()
      }
    },
    {
      id: 'go-activity',
      type: 'action',
      title: 'Go to Activity',
      icon: <Clock className="w-4 h-4" />,
      action: () => {
        router.push('/activity')
        onClose()
      }
    }
  ]

  const searchAllModules = useCallback((searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) {
      return quickActions
    }

    const lowerQuery = searchQuery.toLowerCase()
    const matchingResults: SearchResult[] = []

    // Search files
    const files = JSON.parse(localStorage.getItem('files') || '[]')
    files.forEach((file: { id: string; name: string; type: string }) => {
      if (file.name.toLowerCase().includes(lowerQuery)) {
        matchingResults.push({
          id: `file-${file.id}`,
          type: 'file',
          title: file.name,
          subtitle: `File • ${file.type}`,
          icon: <File className="w-4 h-4" />,
          action: () => {
            router.push(`/files?id=${file.id}`)
            onClose()
          }
        })
      }
    })

    // Search tasks
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    tasks.forEach((task: { id: string; title: string; status: string }) => {
      if (task.title.toLowerCase().includes(lowerQuery)) {
        matchingResults.push({
          id: `task-${task.id}`,
          type: 'task',
          title: task.title,
          subtitle: `Task • ${task.status}`,
          icon: <CheckSquare className="w-4 h-4" />,
          action: () => {
            router.push(`/tasks?id=${task.id}`)
            onClose()
          }
        })
      }
    })

    // Search messages
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]')
    conversations.forEach((conv: { id: string; name: string; lastMessage: string }) => {
      if (conv.name.toLowerCase().includes(lowerQuery) || conv.lastMessage.toLowerCase().includes(lowerQuery)) {
        matchingResults.push({
          id: `message-${conv.id}`,
          type: 'message',
          title: conv.name,
          subtitle: `Message • ${conv.lastMessage.substring(0, 50)}...`,
          icon: <MessageSquare className="w-4 h-4" />,
          action: () => {
            router.push(`/messages?id=${conv.id}`)
            onClose()
          }
        })
      }
    })

    // Search calendar events
    const events = JSON.parse(localStorage.getItem('calendar_events') || '[]')
    events.forEach((event: { id: string; title: string; start: string }) => {
      if (event.title.toLowerCase().includes(lowerQuery)) {
        matchingResults.push({
          id: `event-${event.id}`,
          type: 'event',
          title: event.title,
          subtitle: `Event • ${new Date(event.start).toLocaleDateString()}`,
          icon: <Calendar className="w-4 h-4" />,
          action: () => {
            router.push(`/calendar?id=${event.id}`)
            onClose()
          }
        })
      }
    })

    // Search contacts
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]')
    contacts.forEach((contact: { id: string; name: string; email: string }) => {
      if (contact.name.toLowerCase().includes(lowerQuery) || contact.email.toLowerCase().includes(lowerQuery)) {
        matchingResults.push({
          id: `contact-${contact.id}`,
          type: 'contact',
          title: contact.name,
          subtitle: `Contact • ${contact.email}`,
          icon: <User className="w-4 h-4" />,
          action: () => {
            router.push(`/contacts?id=${contact.id}`)
            onClose()
          }
        })
      }
    })

    // Add matching quick actions
    quickActions.forEach(action => {
      if (action.title.toLowerCase().includes(lowerQuery)) {
        matchingResults.push(action)
      }
    })

    return matchingResults
  }, [router, onClose, quickActions])

  useEffect(() => {
    const searchResults = searchAllModules(query)
    setResults(searchResults)
    setSelectedIndex(0)
  }, [query, searchAllModules])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (results[selectedIndex]) {
          results[selectedIndex].action()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files, tasks, messages, events..."
            className="flex-1 outline-none text-lg"
            autoFocus
          />
          <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No results found
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={result.action}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition ${
                    index === selectedIndex ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    index === selectedIndex ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {result.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-sm text-gray-500">{result.subtitle}</div>
                    )}
                  </div>
                  <ArrowRight className={`w-4 h-4 ${
                    index === selectedIndex ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border rounded">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border rounded">Enter</kbd>
              <span>Select</span>
            </span>
          </div>
          <div>
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </div>
        </div>
      </div>
    </div>
  )
}
