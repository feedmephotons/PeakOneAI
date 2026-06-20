'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/components/notifications/NotificationProvider'
import {
  Search, Home, Users, Video, MessageSquare, FolderOpen, CheckSquare,
  Mail, Presentation, Phone, Settings, Sparkles, Brain, FileSearch,
  Languages, ArrowRightLeft, Plus, Calendar, Mic, Command as CommandIcon,
  CornerDownLeft, ArrowUp, ArrowDown, Terminal, Activity, Target, UserCog,
  Sunrise, FilePlus, FileText, Table2, LayoutDashboard,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CommandCategory = 'Lisa' | 'Navigation' | 'Create' | 'AI Actions'

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
    // ── Lisa (Peak One) ─────────────────────────────────────────────────
    {
      id: 'peak-ask-lisa',
      label: 'Ask Lisa…',
      description: 'Open Lisa, your AI orchestrator',
      category: 'Lisa',
      icon: <Sparkles className="w-4 h-4" />,
      keywords: ['ai', 'lisa', 'ask', 'assistant', 'chat', 'help'],
      action: () => navigate('/lisa'),
    },
    {
      id: 'peak-search-memory',
      label: 'Search memory',
      description: 'What do I know about…',
      category: 'Lisa',
      icon: <Brain className="w-4 h-4" />,
      keywords: ['memory', 'brain', 'notes', 'recall', 'know', 'search'],
      action: () => navigate('/memory'),
    },
    {
      id: 'peak-new-mission',
      label: 'New Mission',
      description: 'Spin up a mission in Mission Control',
      category: 'Lisa',
      icon: <Target className="w-4 h-4" />,
      keywords: ['mission', 'project', 'objective', 'initiative', 'new'],
      action: () => navigate('/missions'),
    },
    {
      id: 'peak-prepare-for',
      label: 'Prepare me for…',
      description: 'Lisa relationship brief for a person',
      category: 'Lisa',
      icon: <UserCog className="w-4 h-4" />,
      keywords: ['prepare', 'relationship', 'brief', 'person', 'people', 'meeting prep'],
      action: () => navigate('/people'),
    },
    {
      id: 'peak-daily-brief',
      label: 'Daily Brief',
      description: 'Open your morning briefing',
      category: 'Lisa',
      icon: <Sunrise className="w-4 h-4" />,
      keywords: ['daily', 'brief', 'briefing', 'morning', 'today', 'home'],
      action: () => navigate('/'),
    },

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
      action: () => navigate('/video'),
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
    {
      id: 'nav-devops',
      label: 'DevOps & Visual Identity',
      description: 'Design doc and marketing guidelines',
      category: 'Navigation',
      icon: <Terminal className="w-4 h-4" />,
      keywords: ['design', 'visual', 'devops', 'style', 'colors'],
      action: () => navigate('/devops'),
    },
    {
      id: 'nav-test',
      label: 'System Integration Test',
      description: 'Check DB, Storage, and AI service health',
      category: 'Navigation',
      icon: <Activity className="w-4 h-4" />,
      keywords: ['test', 'health', 'diagnostics', 'supabase', 'database'],
      action: () => navigate('/test'),
    },

    // ── Create ──────────────────────────────────────────────────────────
    {
      id: 'create-document',
      label: 'Create document',
      description: 'Open the Create Studio',
      category: 'Create',
      icon: <FilePlus className="w-4 h-4" />,
      keywords: ['create', 'studio', 'document', 'generate', 'new doc'],
      action: () => navigate('/create'),
    },
    {
      id: 'create-report',
      label: 'Create report',
      description: 'Build a Q2 sales report',
      category: 'Create',
      icon: <FileText className="w-4 h-4" />,
      keywords: ['report', 'sales', 'q2', 'create', 'generate'],
      action: () => navigate('/create?template=sales-report-q2'),
    },
    {
      id: 'create-deck',
      label: 'Build a deck',
      description: 'Generate a board presentation',
      category: 'Create',
      icon: <Presentation className="w-4 h-4" />,
      keywords: ['deck', 'presentation', 'board', 'slides', 'build'],
      action: () => navigate('/create?template=board-presentation'),
    },
    {
      id: 'create-spreadsheet',
      label: 'Generate spreadsheet',
      description: 'Build a financial forecast',
      category: 'Create',
      icon: <Table2 className="w-4 h-4" />,
      keywords: ['spreadsheet', 'forecast', 'financial', 'excel', 'generate'],
      action: () => navigate('/create?template=financial-forecast'),
    },
    {
      id: 'create-marketing-dashboard',
      label: 'Marketing dashboard',
      description: 'Generate a marketing dashboard',
      category: 'Create',
      icon: <LayoutDashboard className="w-4 h-4" />,
      keywords: ['marketing', 'dashboard', 'analytics', 'social', 'generate'],
      action: () => navigate('/create?template=marketing-dashboard'),
    },
    {
      id: 'create-meeting',
      label: 'Start meeting',
      description: 'Start or schedule a video call',
      category: 'Create',
      icon: <Video className="w-4 h-4" />,
      keywords: ['meeting', 'video', 'call', 'start'],
      action: () => navigate('/video'),
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
    const categoryOrder: CommandCategory[] = ['Lisa', 'Navigation', 'Create', 'AI Actions']
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
    <div className="peak-os fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#05060c]/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Palette */}
      <div
        className="peak-glass peak-glass-glow peak-scrollbar relative w-full max-w-xl overflow-hidden flex flex-col p-0"
        style={{ maxHeight: 'min(540px, 72vh)' }}
        role="dialog"
        aria-label="Command palette"
      >
        {/* faint purple aurora at the top edge */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 bg-[radial-gradient(50%_100%_at_50%_0%,rgba(139,92,246,0.18)_0%,transparent_70%)]" />

        {/* ── Search Input ─────────────────────────────────────────── */}
        <div className="relative flex items-center gap-3 px-4 py-3.5 border-b border-peak-border">
          <Sparkles className="w-4 h-4 text-peak-primary-300 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }}
            placeholder="Ask Lisa anything…"
            className="flex-1 bg-transparent outline-none text-[15px] text-peak placeholder:text-peak-muted"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-peak-dim bg-white/5 border border-peak-border rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* ── Results ───────────────────────────────────────────────── */}
        <div ref={listRef} className="peak-scrollbar relative flex-1 overflow-y-auto overscroll-contain py-1">
          {flatList.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-peak-muted">
                No results for &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            Array.from(grouped.entries()).map(([category, items]) => (
              <div key={category} className="px-2 mb-1">
                {/* Category header */}
                <div className="px-2 pt-2.5 pb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-peak-muted">
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
                        relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors
                        ${isSelected
                          ? 'bg-peak-primary/15 text-peak'
                          : 'text-peak-muted hover:bg-white/[0.04]'
                        }
                      `}
                    >
                      {/* left accent on selection */}
                      {isSelected && (
                        <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-peak-primary shadow-[0_0_10px_var(--peak-glow)]" />
                      )}

                      {/* Icon */}
                      <div
                        className={`
                          flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors
                          ${isSelected
                            ? 'bg-peak-primary/25 text-peak-primary-300'
                            : 'bg-white/[0.04] text-peak-muted'
                          }
                        `}
                      >
                        {item.icon}
                      </div>

                      {/* Label + description */}
                      <div className="flex-1 min-w-0">
                        <div className={`text-[13px] font-medium leading-tight ${isSelected ? 'text-peak' : 'text-peak'}`}>
                          {item.label}
                        </div>
                        <div
                          className={`text-[11px] leading-tight mt-0.5 truncate ${
                            isSelected ? 'text-peak-primary-300' : 'text-peak-dim'
                          }`}
                        >
                          {item.description}
                        </div>
                      </div>

                      {/* Shortcut badge */}
                      {item.shortcut && (
                        <kbd
                          className={`
                            hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded shrink-0 border border-peak-border
                            ${isSelected
                              ? 'bg-peak-primary/20 text-peak-primary-300'
                              : 'bg-white/5 text-peak-dim'
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
        <div className="relative px-4 py-2 border-t border-peak-border bg-white/[0.02] flex items-center justify-between text-[11px] text-peak-dim">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center w-5 h-5 bg-white/5 border border-peak-border rounded text-[10px]">
                <ArrowUp className="w-2.5 h-2.5" />
              </kbd>
              <kbd className="inline-flex items-center justify-center w-5 h-5 bg-white/5 border border-peak-border rounded text-[10px]">
                <ArrowDown className="w-2.5 h-2.5" />
              </kbd>
              <span className="ml-0.5">Navigate</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center h-5 px-1.5 bg-white/5 border border-peak-border rounded text-[10px]">
                <CornerDownLeft className="w-2.5 h-2.5" />
              </kbd>
              <span className="ml-0.5">Select</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center h-5 px-1.5 bg-white/5 border border-peak-border rounded text-[10px] font-mono">
                esc
              </kbd>
              <span className="ml-0.5">Close</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-peak-primary-300">
            <CommandIcon className="w-3 h-3" />
            <span>Ask Lisa</span>
          </div>
        </div>
      </div>
    </div>
  )
}
