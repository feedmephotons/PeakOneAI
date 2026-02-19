'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/components/notifications/NotificationProvider'
import {
  Search, Home, Users, Video, MessageSquare, FolderOpen, CheckSquare,
  Mail, Presentation, Phone, Settings, Sparkles, Brain, FileSearch,
  Languages, ArrowRightLeft, Plus, Calendar, Mic, Command as CommandIcon,
  CornerDownLeft, ArrowUp, ArrowDown,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CommandCategory = 'Navigation' | 'Create' | 'AI Actions'

interface CommandItem {
  id: string
  label: string
  description: string
  category: CommandCategory
  icon: React.ReactNode
  shortcut?: string
  keywords?: string[]
  action: () => void
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const { showNotification } = useNotifications()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // ---- helpers ----

  const navigate = useCallback((path: string) => {
    router.push(path)
    onClose()
  }, [router, onClose])

  const showToast = useCallback((message: string) => {
    showNotification({
      type: 'info',
      title: message,
      duration: 3000,
    })
    onClose()
  }, [onClose, showNotification])

  // ---- command definitions ----

  const commands: CommandItem[] = useMemo(() => [
    // ── Navigation ──────────────────────────────────────────────────────
    {
      id: 'nav-home',
      label: 'Home',
      description: 'Go to dashboard',
      category: 'Navigation',
      icon: <Home className="w-4 h-4" />,
      keywords: ['dashboard', 'overview'],
      action: () => navigate('/'),
    },
    {
      id: 'nav-workspaces',
      label: 'Workspaces',
      description: 'Team collaboration',
      category: 'Navigation',
      icon: <Users className="w-4 h-4" />,
      keywords: ['teams', 'projects', 'groups'],
      action: () => navigate('/teams'),
    },
    {
      id: 'nav-meetings',
      label: 'Meetings',
      description: 'Video and calls',
      category: 'Navigation',
      icon: <Video className="w-4 h-4" />,
      keywords: ['video', 'call', 'conference'],
      action: () => navigate('/meeting'),
    },
    {
      id: 'nav-threads',
      label: 'Threads',
      description: 'Messages and chat',
      category: 'Navigation',
      icon: <MessageSquare className="w-4 h-4" />,
      keywords: ['messages', 'chat', 'conversations'],
      action: () => navigate('/messages'),
    },
    {
      id: 'nav-files',
      label: 'Files',
      description: 'Documents and storage',
      category: 'Navigation',
      icon: <FolderOpen className="w-4 h-4" />,
      keywords: ['documents', 'storage', 'uploads'],
      action: () => navigate('/files'),
    },
    {
      id: 'nav-tasks',
      label: 'Tasks',
      description: 'Projects and boards',
      category: 'Navigation',
      icon: <CheckSquare className="w-4 h-4" />,
      keywords: ['kanban', 'board', 'todo', 'projects'],
      action: () => navigate('/tasks'),
    },
    {
      id: 'nav-email',
      label: 'Draft follow-up',
      description: 'Open email composer',
      category: 'Navigation',
      icon: <Mail className="w-4 h-4" />,
      keywords: ['email', 'compose', 'send', 'follow-up'],
      action: () => navigate('/email'),
    },
    {
      id: 'nav-deck',
      label: 'Create investor deck',
      description: 'Pitch decks and slides',
      category: 'Navigation',
      icon: <Presentation className="w-4 h-4" />,
      keywords: ['deck', 'pitch', 'slides', 'investor'],
      action: () => navigate('/deck'),
    },
    {
      id: 'nav-calls',
      label: 'Schedule call',
      description: 'Phone and scheduling',
      category: 'Navigation',
      icon: <Phone className="w-4 h-4" />,
      keywords: ['call', 'schedule', 'phone'],
      action: () => navigate('/calls'),
    },
    {
      id: 'nav-search',
      label: 'Search files',
      description: 'Find documents and media',
      category: 'Navigation',
      icon: <Search className="w-4 h-4" />,
      keywords: ['search', 'find', 'lookup'],
      action: () => navigate('/search'),
    },
    {
      id: 'nav-lisa',
      label: 'Ask Lisa',
      description: 'AI assistant',
      category: 'Navigation',
      icon: <Brain className="w-4 h-4" />,
      shortcut: 'L',
      keywords: ['ai', 'assistant', 'lisa', 'chat'],
      action: () => navigate('/lisa'),
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      description: 'Account and preferences',
      category: 'Navigation',
      icon: <Settings className="w-4 h-4" />,
      shortcut: ',',
      keywords: ['preferences', 'account', 'config'],
      action: () => navigate('/settings'),
    },

    // ── Create ──────────────────────────────────────────────────────────
    {
      id: 'create-meeting',
      label: 'Start meeting',
      description: 'Start or schedule a video call',
      category: 'Create',
      icon: <Video className="w-4 h-4" />,
      keywords: ['meeting', 'video', 'call', 'start'],
      action: () => navigate('/meeting'),
    },
    {
      id: 'create-task',
      label: 'New task',
      description: 'Create a task on your board',
      category: 'Create',
      icon: <Plus className="w-4 h-4" />,
      shortcut: 'N',
      keywords: ['task', 'todo', 'create'],
      action: () => navigate('/tasks'),
    },
    {
      id: 'create-message',
      label: 'New message / thread',
      description: 'Start a conversation',
      category: 'Create',
      icon: <MessageSquare className="w-4 h-4" />,
      keywords: ['message', 'thread', 'chat', 'conversation'],
      action: () => navigate('/messages'),
    },
    {
      id: 'create-file',
      label: 'Organize files',
      description: 'Manage your documents',
      category: 'Create',
      icon: <FolderOpen className="w-4 h-4" />,
      keywords: ['file', 'organize', 'documents', 'folder'],
      action: () => navigate('/files'),
    },
    {
      id: 'create-event',
      label: 'New calendar event',
      description: 'Schedule an event',
      category: 'Create',
      icon: <Calendar className="w-4 h-4" />,
      keywords: ['calendar', 'event', 'schedule'],
      action: () => navigate('/calendar?action=new'),
    },

    // ── AI Actions ──────────────────────────────────────────────────────
    {
      id: 'ai-summarize',
      label: 'Summarize yesterday',
      description: 'AI-generated daily summary',
      category: 'AI Actions',
      icon: <FileSearch className="w-4 h-4" />,
      keywords: ['summarize', 'summary', 'yesterday', 'recap'],
      action: () => showToast('Generating summary...'),
    },
    {
      id: 'ai-translate',
      label: 'Translate transcript',
      description: 'Translate meeting transcripts',
      category: 'AI Actions',
      icon: <Languages className="w-4 h-4" />,
      keywords: ['translate', 'transcript', 'language'],
      action: () => showToast('Opening translator...'),
    },
    {
      id: 'ai-convert-thread',
      label: 'Convert thread to project',
      description: 'Turn a conversation into tasks',
      category: 'AI Actions',
      icon: <ArrowRightLeft className="w-4 h-4" />,
      keywords: ['convert', 'thread', 'project', 'tasks'],
      action: () => showToast('Converting thread to project...'),
    },
    {
      id: 'ai-transcribe',
      label: 'Transcribe audio',
      description: 'Convert audio to text with AI',
      category: 'AI Actions',
      icon: <Mic className="w-4 h-4" />,
      keywords: ['transcribe', 'audio', 'voice', 'speech'],
      action: () => navigate('/lisa'),
    },
    {
      id: 'ai-ask',
      label: 'Ask Lisa anything',
      description: 'Chat with your AI assistant',
      category: 'AI Actions',
      icon: <Sparkles className="w-4 h-4" />,
      keywords: ['ai', 'lisa', 'ask', 'assistant', 'help'],
      action: () => navigate('/lisa'),
    },
  ], [navigate, showToast])

  // ---- filtering ----

  const filtered = useMemo(() => {
    if (!query.trim()) return commands

    const q = query.toLowerCase().trim()
    return commands.filter(cmd => {
      const haystack = [
        cmd.label,
        cmd.description,
        ...(cmd.keywords || []),
      ].join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [query, commands])

  // Group filtered results by category, preserving order
  const grouped = useMemo(() => {
    const categoryOrder: CommandCategory[] = ['Navigation', 'Create', 'AI Actions']
    const map = new Map<CommandCategory, CommandItem[]>()

    for (const cat of categoryOrder) {
      const items = filtered.filter(c => c.category === cat)
      if (items.length > 0) map.set(cat, items)
    }

    return map
  }, [filtered])

  // Flat list for keyboard navigation
  const flatList = useMemo(() => {
    const list: CommandItem[] = []
    grouped.forEach(items => list.push(...items))
    return list
  }, [grouped])

  // ---- keyboard ----

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, flatList.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (flatList[selectedIndex]) {
            flatList[selectedIndex].action()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, flatList, selectedIndex, onClose])

  // Reset state when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      // Focus input after render
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [isOpen])

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const selected = listRef.current.querySelector('[data-selected="true"]')
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // ---- detect platform for shortcut labels ----
  const isMac = useMemo(() => {
    if (typeof window === 'undefined') return false
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0
  }, [])

  const modKey = isMac ? '\u2318' : 'Ctrl'

  // ---- render ----

  if (!isOpen) return null

  let runningIndex = -1

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Palette */}
      <div
        className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800 overflow-hidden flex flex-col"
        style={{ maxHeight: 'min(520px, 70vh)' }}
        role="dialog"
        aria-label="Command palette"
      >
        {/* ── Search Input ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <Search className="w-4.5 h-4.5 text-gray-400 dark:text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent outline-none text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* ── Results ───────────────────────────────────────────────── */}
        <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain py-1">
          {flatList.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No results for &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            Array.from(grouped.entries()).map(([category, items]) => (
              <div key={category} className="px-2 mb-1">
                {/* Category header */}
                <div className="px-2 pt-2.5 pb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {category}
                  </span>
                </div>

                {/* Items */}
                {items.map(item => {
                  runningIndex++
                  const idx = runningIndex
                  const isSelected = idx === selectedIndex

                  return (
                    <button
                      key={item.id}
                      data-selected={isSelected}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                        ${isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                        }
                      `}
                    >
                      {/* Icon */}
                      <div
                        className={`
                          flex items-center justify-center w-8 h-8 rounded-lg shrink-0
                          ${isSelected
                            ? 'bg-indigo-500/40'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                          }
                        `}
                      >
                        {item.icon}
                      </div>

                      {/* Label + description */}
                      <div className="flex-1 min-w-0">
                        <div className={`text-[13px] font-medium leading-tight ${isSelected ? '' : ''}`}>
                          {item.label}
                        </div>
                        <div
                          className={`text-[11px] leading-tight mt-0.5 truncate ${
                            isSelected
                              ? 'text-indigo-200'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {item.description}
                        </div>
                      </div>

                      {/* Shortcut badge */}
                      {item.shortcut && (
                        <kbd
                          className={`
                            hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded shrink-0
                            ${isSelected
                              ? 'bg-indigo-500/40 text-indigo-100'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700'
                            }
                          `}
                        >
                          {modKey}+{item.shortcut}
                        </kbd>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center w-5 h-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px]">
                <ArrowUp className="w-2.5 h-2.5" />
              </kbd>
              <kbd className="inline-flex items-center justify-center w-5 h-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px]">
                <ArrowDown className="w-2.5 h-2.5" />
              </kbd>
              <span className="ml-0.5">Navigate</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center h-5 px-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px]">
                <CornerDownLeft className="w-2.5 h-2.5" />
              </kbd>
              <span className="ml-0.5">Select</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center h-5 px-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-mono">
                esc
              </kbd>
              <span className="ml-0.5">Close</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CommandIcon className="w-3 h-3" />
            <span>Peak One Command Bar</span>
          </div>
        </div>
      </div>
    </div>
  )
}
