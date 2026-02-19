'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Video, FileText, Calendar, MessageSquare,
  CheckSquare, Phone, ArrowRight, X, Clock,
  Users, Brain, ChevronRight, Link2,
  AlertCircle, Copy, FileWarning, Eye
} from 'lucide-react'

// ─── AI Command Hero ────────────────────────────────────────────────────────

function CommandHero() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const quickActions = [
    { label: 'Start meeting', icon: Video, path: '/video' },
    { label: 'Draft follow-up', icon: FileText, path: '/messages' },
    { label: 'Summarize yesterday', icon: Brain, path: '#ai' },
    { label: 'Create task', icon: CheckSquare, path: '/tasks' },
    { label: 'Organize files', icon: FileText, path: '/files' },
    { label: 'Schedule call', icon: Phone, path: '/calendar' },
  ]

  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      const event = new CustomEvent('openPeakAI', { detail: { prompt: query } })
      window.dispatchEvent(event)
      setQuery('')
    }
  }

  const handleQuickAction = (path: string) => {
    if (path.startsWith('#')) {
      const event = new CustomEvent('openPeakAI')
      window.dispatchEvent(event)
    } else {
      router.push(path)
    }
  }

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault()
          inputRef.current?.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  return (
    <section className="relative pb-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">
          Good {getGreeting()}
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 mb-8">
          What would you like to work on?
        </p>

        {/* Command Input */}
        <form onSubmit={handleSubmit} className="relative mb-6">
          <div
            className={`
              flex items-center gap-3 px-5 py-4
              bg-white dark:bg-gray-800
              border rounded-2xl
              transition-all duration-200
              ${isFocused
                ? 'border-indigo-400 dark:border-indigo-500 shadow-lg shadow-indigo-500/10'
                : 'border-gray-200 dark:border-gray-700 shadow-sm'
              }
            `}
          >
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask anything or type a command..."
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded">
              /
            </kbd>
          </div>
        </form>

        {/* Quick Action Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.path)}
                className="
                  inline-flex items-center gap-1.5 px-3.5 py-2
                  text-sm font-medium text-gray-600 dark:text-gray-300
                  bg-gray-50 dark:bg-gray-800/60
                  border border-gray-200 dark:border-gray-700
                  rounded-full
                  hover:bg-white dark:hover:bg-gray-700
                  hover:border-gray-300 dark:hover:border-gray-600
                  hover:shadow-sm
                  transition-all duration-150
                "
              >
                <Icon className="w-3.5 h-3.5" />
                {action.label}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Suggested Next ─────────────────────────────────────────────────────────

interface Suggestion {
  id: string
  text: string
  action: string
  path: string
}

function SuggestedNext() {
  const router = useRouter()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const suggestions: Suggestion[] = [
    {
      id: 'follow-up',
      text: 'You have 2 unread meeting notes from yesterday',
      action: 'Review notes',
      path: '/messages',
    },
    {
      id: 'task-due',
      text: '3 tasks are due today',
      action: 'View tasks',
      path: '/tasks',
    },
    {
      id: 'meeting-prep',
      text: 'Team standup in 45 minutes',
      action: 'Prepare agenda',
      path: '/calendar',
    },
    {
      id: 'file-review',
      text: 'New files shared with you this morning',
      action: 'Open files',
      path: '/files',
    },
  ]

  const visible = suggestions.filter((s) => !dismissed.has(s.id)).slice(0, 4)

  if (visible.length === 0) return null

  return (
    <section className="pb-8">
      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Suggested for you
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {visible.map((suggestion) => (
          <div
            key={suggestion.id}
            className="
              group relative flex flex-col justify-between
              p-4 bg-white dark:bg-gray-800/50
              border border-gray-100 dark:border-gray-700/50
              rounded-xl
              hover:border-gray-200 dark:hover:border-gray-600
              hover:shadow-sm
              transition-all duration-150
            "
          >
            <button
              onClick={() => setDismissed((prev) => new Set(prev).add(suggestion.id))}
              className="absolute top-2 right-2 p-1 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 pr-4 leading-relaxed">
              {suggestion.text}
            </p>
            <button
              onClick={() => router.push(suggestion.path)}
              className="
                inline-flex items-center gap-1 text-sm font-medium
                text-indigo-600 dark:text-indigo-400
                hover:text-indigo-700 dark:hover:text-indigo-300
                transition-colors
              "
            >
              {suggestion.action}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Today's Focus ──────────────────────────────────────────────────────────

function TodaysFocus() {
  const router = useRouter()

  const meetings = [
    { id: '1', time: '9:00 AM', title: 'Team Standup', participants: ['Alex', 'Sarah', 'Mike'] },
    { id: '2', time: '11:30 AM', title: 'Client Review', participants: ['Jordan', 'Lisa'] },
    { id: '3', time: '2:00 PM', title: 'Sprint Planning', participants: ['Full team'] },
    { id: '4', time: '4:30 PM', title: '1:1 with Manager', participants: ['Rachel'] },
  ]

  const tasks = [
    { id: '1', title: 'Review Q4 proposal draft', priority: 'high' as const, aiGenerated: false },
    { id: '2', title: 'Update onboarding docs', priority: 'medium' as const, aiGenerated: true },
    { id: '3', title: 'Follow up with design team', priority: 'medium' as const, aiGenerated: true },
    { id: '4', title: 'Prepare demo environment', priority: 'low' as const, aiGenerated: false },
  ]

  const threads = [
    { id: '1', title: 'Product launch timeline', lastActivity: '12 min ago', unread: 3 },
    { id: '2', title: 'Budget approval Q1', lastActivity: '1 hr ago', unread: 0 },
    { id: '3', title: 'Engineering hiring pipeline', lastActivity: '2 hr ago', unread: 1 },
  ]

  const priorityColors = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  }

  return (
    <section className="pb-8">
      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Today&apos;s Focus
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming Meetings */}
        <div className="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Upcoming Meetings
              </h3>
            </div>
            <button
              onClick={() => router.push('/calendar')}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <button
                key={meeting.id}
                onClick={() => router.push('/calendar')}
                className="w-full flex items-start gap-3 text-left group"
              >
                <span className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-0.5 w-16 flex-shrink-0">
                  {meeting.time}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {meeting.title}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                    {meeting.participants.join(', ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Open Tasks */}
        <div className="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Open Tasks
              </h3>
            </div>
            <button
              onClick={() => router.push('/tasks')}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              View all
            </button>
          </div>
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => router.push('/tasks')}
                className="w-full flex items-center gap-3 text-left group"
              >
                <div className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0 group-hover:border-indigo-400 dark:group-hover:border-indigo-500 transition-colors" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {task.title}
                    </p>
                    {task.aiGenerated && (
                      <Brain className="w-3 h-3 text-indigo-400 dark:text-indigo-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Threads */}
        <div className="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Active Threads
              </h3>
            </div>
            <button
              onClick={() => router.push('/messages')}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => router.push('/messages')}
                className="w-full flex items-center gap-3 text-left group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {thread.title}
                    </p>
                    {thread.unread > 0 && (
                      <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-indigo-500 rounded-full flex-shrink-0">
                        {thread.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {thread.lastActivity}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Memory Layer ───────────────────────────────────────────────────────────

function MemoryLayer() {
  const connections = [
    {
      id: '1',
      from: 'Q4 Proposal.pdf',
      fromType: 'file' as const,
      to: 'Client Review (11:30 AM)',
      toType: 'meeting' as const,
    },
    {
      id: '2',
      from: 'Sprint Planning',
      fromType: 'meeting' as const,
      to: 'Update onboarding docs',
      toType: 'task' as const,
    },
    {
      id: '3',
      from: 'Product launch timeline',
      fromType: 'thread' as const,
      to: 'Prepare demo environment',
      toType: 'task' as const,
    },
  ]

  const typeIcons = {
    file: FileText,
    meeting: Video,
    task: CheckSquare,
    thread: MessageSquare,
  }

  const typeStyles = {
    file: 'text-blue-500 dark:text-blue-400',
    meeting: 'text-green-500 dark:text-green-400',
    task: 'text-amber-500 dark:text-amber-400',
    thread: 'text-purple-500 dark:text-purple-400',
  }

  return (
    <section className="pb-4">
      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Connected
      </h2>
      <div className="flex flex-wrap gap-3">
        {connections.map((conn) => {
          const FromIcon = typeIcons[conn.fromType]
          const ToIcon = typeIcons[conn.toType]
          return (
            <div
              key={conn.id}
              className="
                inline-flex items-center gap-2 px-3 py-2
                bg-gray-50 dark:bg-gray-800/40
                border border-gray-100 dark:border-gray-700/50
                rounded-lg text-xs text-gray-500 dark:text-gray-400
              "
            >
              <FromIcon className={`w-3.5 h-3.5 ${typeStyles[conn.fromType]}`} />
              <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[120px]">
                {conn.from}
              </span>
              <Link2 className="w-3 h-3 text-gray-300 dark:text-gray-600" />
              <ToIcon className={`w-3.5 h-3.5 ${typeStyles[conn.toType]}`} />
              <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[120px]">
                {conn.to}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── AI Observations ────────────────────────────────────────────────────────

interface Observation {
  id: string
  icon: React.ElementType
  text: string
  count?: number
  type: 'info' | 'warning' | 'suggestion'
}

function AIObservations() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const observations: Observation[] = [
    {
      id: 'unresolved',
      icon: AlertCircle,
      text: 'unresolved items from last week',
      count: 3,
      type: 'info',
    },
    {
      id: 'summaries',
      icon: FileText,
      text: 'meeting summaries ready for review',
      count: 2,
      type: 'suggestion',
    },
    {
      id: 'duplicate',
      icon: Copy,
      text: 'duplicate file detected',
      count: 1,
      type: 'warning',
    },
  ]

  const visible = observations.filter((o) => !dismissed.has(o.id))

  if (visible.length === 0) return null

  const typeStyles = {
    info: 'text-blue-500 dark:text-blue-400',
    warning: 'text-amber-500 dark:text-amber-400',
    suggestion: 'text-indigo-500 dark:text-indigo-400',
  }

  return (
    <section className="pb-8">
      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Observations
      </h2>
      <div className="flex flex-wrap gap-2">
        {visible.map((obs) => {
          const Icon = obs.icon
          return (
            <div
              key={obs.id}
              className="
                group inline-flex items-center gap-2 px-3 py-2
                bg-white dark:bg-gray-800/50
                border border-gray-100 dark:border-gray-700/50
                rounded-lg
                hover:border-gray-200 dark:hover:border-gray-600
                transition-all duration-150
              "
            >
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${typeStyles[obs.type]}`} />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {obs.count !== undefined && (
                  <span className="font-semibold">{obs.count} </span>
                )}
                {obs.text}
              </span>
              <button
                onClick={() => setDismissed((prev) => new Set(prev).add(obs.id))}
                className="p-0.5 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function PeakDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-16">
        <CommandHero />
        <SuggestedNext />
        <TodaysFocus />
        <AIObservations />
        <MemoryLayer />
      </div>
    </div>
  )
}
