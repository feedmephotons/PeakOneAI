'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Video, FileText, Calendar, MessageSquare,
  CheckSquare, Phone, ArrowRight, X,
  Users, Brain, ChevronRight, Link2,
  AlertCircle, Copy,
  Shield, Activity, Scale,
  BarChart3, Zap, FolderOpen
} from 'lucide-react'
import { useAppStore, type UIMode } from '@/stores/app-store'
import { PeakShell, GlassPanel, SectionLabel, StatTile } from '@/components/peak'
import {
  FIXED_TODAY,
  MOCK_USER,
  ACME_TEAM_SIZE,
  getMockCalendarEvents,
  getMockTasks,
  getMockThreads,
  getMockOrgIdentity,
} from '@/lib/peak/mock'

// ─── AI Command Hero ────────────────────────────────────────────────────────

function CommandHero() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { uiMode } = useAppStore()

  const quickActionsByMode: Record<UIMode, { label: string; icon: React.ComponentType<{ className?: string }>; path: string }[]> = {
    personal: [
      { label: 'Make a call', icon: Phone, path: '/calls' },
      { label: 'Draft email', icon: FileText, path: '/email' },
      { label: 'Summarize yesterday', icon: Brain, path: '#ai' },
      { label: 'Create task', icon: CheckSquare, path: '/tasks' },
      { label: 'Organize files', icon: FileText, path: '/files' },
      { label: 'Check calendar', icon: Calendar, path: '/calendar' },
    ],
    team: [
      { label: 'Start meeting', icon: Video, path: '/video' },
      { label: 'Draft follow-up', icon: FileText, path: '/email' },
      { label: 'Send a message', icon: MessageSquare, path: '/messages' },
      { label: 'Create task', icon: CheckSquare, path: '/tasks' },
      { label: 'Summarize yesterday', icon: Brain, path: '#ai' },
      { label: 'Schedule call', icon: Phone, path: '/calendar' },
    ],
    enterprise: [
      { label: 'Start meeting', icon: Video, path: '/video' },
      { label: 'View activity log', icon: Activity, path: '/activity' },
      { label: 'Review compliance', icon: Scale, path: '/settings/security' },
      { label: 'Create task', icon: CheckSquare, path: '/tasks' },
      { label: 'Admin panel', icon: Shield, path: '/settings/org' },
      { label: 'Team overview', icon: Users, path: '/teams' },
    ],
  }

  const quickActions = quickActionsByMode[uiMode] || quickActionsByMode.team

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
    <section className="relative pb-10">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-semibold text-peak mb-2 tracking-tight">
          Good {getGreeting()}, {MOCK_USER.name.split(' ')[0]}
        </h1>
        <p className="text-base text-peak-muted mb-8">
          What would you like to work on?
        </p>

        {/* Command Input */}
        <form onSubmit={handleSubmit} className="relative mb-6">
          <div
            className={`
              flex items-center gap-3 px-5 py-4
              bg-white/[0.04]
              border rounded-2xl
              transition-all duration-200
              ${isFocused
                ? 'border-peak-primary/50 shadow-peak-glow'
                : 'border-peak-border'
              }
            `}
          >
            <Search className="w-5 h-5 text-peak-dim flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask anything or type a command..."
              className="flex-1 bg-transparent text-peak placeholder:text-peak-dim text-base outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono text-peak-dim bg-white/[0.06] border border-peak-border rounded">
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
                  text-sm font-medium text-peak-muted
                  bg-white/[0.03]
                  border border-peak-border
                  rounded-full
                  hover:bg-white/[0.06] hover:text-peak
                  hover:border-peak-primary/40
                  transition-all duration-150
                "
              >
                <Icon className="w-3.5 h-3.5" />
                {action.label}
              </button>
            )
          })}
        </div>

        {/* Explore All Features CTA */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => router.push('/features')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-peak-primary hover:bg-peak-primary-600 rounded-xl transition-colors shadow-peak-glow"
          >
            Explore All Features
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── Feature Showcase ────────────────────────────────────────────────────────

function FeatureShowcase() {
  const router = useRouter()

  const features = [
    {
      icon: Video,
      title: 'Meetings',
      description: 'AI-powered meetings that transcribe, summarize, and assign action items',
      path: '/video',
    },
    {
      icon: MessageSquare,
      title: 'Messaging',
      description: 'Threaded conversations with smart context and AI follow-ups',
      path: '/messages',
    },
    {
      icon: CheckSquare,
      title: 'Tasks',
      description: 'Kanban boards with AI-suggested priorities from your meetings',
      path: '/tasks',
    },
    {
      icon: FolderOpen,
      title: 'Files',
      description: 'Smart storage with AI analysis and cross-referenced insights',
      path: '/files',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Real-time dashboards and AI-generated performance reports',
      path: '/analytics',
    },
    {
      icon: Zap,
      title: 'Automation',
      description: 'Custom workflows and triggers that run in the background',
      path: '/automation',
    },
    {
      icon: Brain,
      title: 'Lisa AI',
      description: 'Your AI assistant that learns your patterns and preferences',
      path: '#ai',
    },
    {
      icon: Calendar,
      title: 'Calendar',
      description: 'Intelligent scheduling with meeting prep and conflict detection',
      path: '/calendar',
    },
  ]

  const handleFeatureClick = (path: string) => {
    if (path === '#ai') {
      window.dispatchEvent(new CustomEvent('openPeakAI'))
    } else {
      router.push(path)
    }
  }

  return (
    <section id="feature-showcase" className="pb-10">
      <SectionLabel className="mb-3">Platform Capabilities</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div
              key={feature.title}
              onClick={() => handleFeatureClick(feature.path)}
              className="peak-glass peak-glass-hover p-4 transition-all duration-200 cursor-pointer group hover:-translate-y-0.5"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/20">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-semibold text-peak mb-1 transition-colors group-hover:text-peak-primary-300">
                {feature.title}
              </h3>
              <p className="text-xs text-peak-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          )
        })}
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
      text: 'Legal review for Launch Product X is at risk',
      action: 'Review mission',
      path: '/missions/mission-launch-product-x',
    },
    {
      id: 'task-due',
      text: '5 tasks are due today across your missions',
      action: 'View tasks',
      path: '/tasks',
    },
    {
      id: 'meeting-prep',
      text: 'Q2 Campaign Review with Lisa Park at 6:00 PM',
      action: 'Prepare agenda',
      path: '/calendar',
    },
    {
      id: 'file-review',
      text: 'Beta defects burndown updated this morning',
      action: 'Open files',
      path: '/files',
    },
  ]

  const visible = suggestions.filter((s) => !dismissed.has(s.id)).slice(0, 4)

  if (visible.length === 0) return null

  return (
    <section className="pb-10">
      <SectionLabel className="mb-3">Suggested for you</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {visible.map((suggestion) => (
          <div
            key={suggestion.id}
            className="group relative flex flex-col justify-between peak-glass peak-glass-hover p-4 transition-all duration-200"
          >
            <button
              onClick={() => setDismissed((prev) => new Set(prev).add(suggestion.id))}
              className="absolute top-2 right-2 p-1 text-peak-dim hover:text-peak-muted opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <p className="text-sm text-peak-muted mb-3 pr-4 leading-relaxed">
              {suggestion.text}
            </p>
            <button
              onClick={() => router.push(suggestion.path)}
              className="
                inline-flex items-center gap-1 text-sm font-medium
                text-peak-primary-300
                hover:text-peak-primary
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

// Format an ISO timestamp as a UTC clock label (deterministic across SSR).
function fmtClock(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}

// Relative "X ago" anchored to the pinned world clock.
function fmtAgo(iso?: string): string {
  if (!iso) return ''
  const diff = new Date(FIXED_TODAY).getTime() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.round(hrs / 24)
  return days === 1 ? 'Yesterday' : `${days}d ago`
}

function dashPriority(p: string): 'high' | 'medium' | 'low' {
  if (p === 'URGENT' || p === 'HIGH') return 'high'
  if (p === 'MEDIUM') return 'medium'
  return 'low'
}

function TodaysFocus() {
  const router = useRouter()

  // Today's meetings — calendar events pinned to FIXED_TODAY.
  const today = FIXED_TODAY.slice(0, 10)
  const meetings = getMockCalendarEvents()
    .filter((e) => e.start.slice(0, 10) === today)
    .slice(0, 4)
    .map((e) => ({
      id: e.id,
      time: fmtClock(e.start),
      title: e.title,
      participants: (e.attendees ?? []).map((a) => a.name.split(' ')[0]),
      joinUrl: e.joinUrl,
    }))

  // Open tasks — canonical task board, in-progress / todo first.
  const tasks = getMockTasks()
    .filter((t) => t.status !== 'DONE')
    .slice(0, 4)
    .map((t) => ({
      id: t.id,
      title: t.title,
      priority: dashPriority(t.priority),
      aiGenerated: (t.tags ?? []).includes('tag-ai'),
    }))

  // Active threads — canonical message threads with unread counts.
  const threads = getMockThreads()
    .slice(0, 3)
    .map((th) => ({
      id: th.id,
      title: th.name,
      lastActivity: fmtAgo(th.lastMessageAt),
      unread: th.unread ?? 0,
    }))

  const priorityColors = {
    high: 'bg-peak-red/15 text-peak-red ring-1 ring-peak-red/25',
    medium: 'bg-peak-amber/15 text-peak-amber ring-1 ring-peak-amber/25',
    low: 'bg-white/[0.06] text-peak-muted ring-1 ring-white/10',
  }

  return (
    <section className="pb-10">
      <SectionLabel className="mb-3">Today&apos;s Focus</SectionLabel>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming Meetings */}
        <GlassPanel className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-peak-muted" />
              <h3 className="text-sm font-semibold text-peak">
                Upcoming Meetings
              </h3>
            </div>
            <button
              onClick={() => router.push('/calendar')}
              className="text-xs text-peak-dim hover:text-peak-muted transition-colors"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <button
                key={meeting.id}
                onClick={() => router.push(meeting.joinUrl || '/calendar')}
                className="w-full flex items-start gap-3 text-left group"
              >
                <span className="text-xs font-mono text-peak-dim mt-0.5 w-16 flex-shrink-0">
                  {meeting.time}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-peak group-hover:text-peak-primary-300 transition-colors truncate">
                    {meeting.title}
                  </p>
                  <p className="text-xs text-peak-dim truncate">
                    {meeting.participants.join(', ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </GlassPanel>

        {/* Open Tasks */}
        <GlassPanel className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-peak-muted" />
              <h3 className="text-sm font-semibold text-peak">
                Open Tasks
              </h3>
            </div>
            <button
              onClick={() => router.push('/tasks')}
              className="text-xs text-peak-dim hover:text-peak-muted transition-colors"
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
                <div className="w-4 h-4 rounded border-2 border-peak-border flex-shrink-0 group-hover:border-peak-primary/60 transition-colors" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-peak group-hover:text-peak-primary-300 transition-colors truncate">
                      {task.title}
                    </p>
                    {task.aiGenerated && (
                      <Brain className="w-3 h-3 text-peak-primary-300 flex-shrink-0" />
                    )}
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </button>
            ))}
          </div>
        </GlassPanel>

        {/* Active Threads */}
        <GlassPanel className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-peak-muted" />
              <h3 className="text-sm font-semibold text-peak">
                Active Threads
              </h3>
            </div>
            <button
              onClick={() => router.push('/messages')}
              className="text-xs text-peak-dim hover:text-peak-muted transition-colors"
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
                    <p className="text-sm font-medium text-peak group-hover:text-peak-primary-300 transition-colors truncate">
                      {thread.title}
                    </p>
                    {thread.unread > 0 && (
                      <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-peak-primary rounded-full flex-shrink-0">
                        {thread.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-peak-dim">
                    {thread.lastActivity}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-peak-dim group-hover:text-peak-muted transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </GlassPanel>
      </div>
    </section>
  )
}

// ─── Memory Layer ───────────────────────────────────────────────────────────

function MemoryLayer() {
  // Real cross-entity links from the Acme Corp world.
  const connections = [
    {
      id: '1',
      from: 'Q2 Marketing Strategy',
      fromType: 'file' as const,
      to: 'Q2 Campaign Review',
      toType: 'meeting' as const,
    },
    {
      id: '2',
      from: 'Launch Sync',
      fromType: 'meeting' as const,
      to: 'GA candidate sign-off',
      toType: 'task' as const,
    },
    {
      id: '3',
      from: '#product-x',
      fromType: 'thread' as const,
      to: 'Launch Product X',
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
    file: 'text-peak-blue',
    meeting: 'text-peak-green',
    task: 'text-peak-amber',
    thread: 'text-peak-primary-300',
  }

  return (
    <section className="pb-4">
      <SectionLabel className="mb-3">Connected</SectionLabel>
      <div className="flex flex-wrap gap-3">
        {connections.map((conn) => {
          const FromIcon = typeIcons[conn.fromType]
          const ToIcon = typeIcons[conn.toType]
          return (
            <div
              key={conn.id}
              className="
                inline-flex items-center gap-2 px-3 py-2
                bg-white/[0.03]
                border border-peak-border
                rounded-lg text-xs text-peak-muted
              "
            >
              <FromIcon className={`w-3.5 h-3.5 ${typeStyles[conn.fromType]}`} />
              <span className="text-peak font-medium truncate max-w-[120px]">
                {conn.from}
              </span>
              <Link2 className="w-3 h-3 text-peak-dim" />
              <ToIcon className={`w-3.5 h-3.5 ${typeStyles[conn.toType]}`} />
              <span className="text-peak font-medium truncate max-w-[120px]">
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
  const { uiMode } = useAppStore()

  const baseObservations: Observation[] = [
    {
      id: 'unresolved',
      icon: AlertCircle,
      text: 'open risks across your missions',
      count: 4,
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
      text: 'Q2 Growth Engine is at risk on paid acquisition',
      type: 'warning',
    },
  ]

  const enterpriseObservations: Observation[] = [
    {
      id: 'permission-review',
      icon: Shield,
      text: 'permission changes pending review',
      count: 2,
      type: 'warning',
    },
    {
      id: 'compliance-scan',
      icon: Scale,
      text: 'compliance scan completed',
      type: 'info',
    },
    {
      id: 'user-activity',
      icon: Activity,
      text: 'active members on the workspace',
      count: ACME_TEAM_SIZE,
      type: 'info',
    },
  ]

  const observations = uiMode === 'enterprise'
    ? [...baseObservations, ...enterpriseObservations]
    : baseObservations

  const visible = observations.filter((o) => !dismissed.has(o.id))

  if (visible.length === 0) return null

  const typeStyles = {
    info: 'text-peak-blue',
    warning: 'text-peak-amber',
    suggestion: 'text-peak-primary-300',
  }

  return (
    <section className="pb-10">
      <SectionLabel className="mb-3">Observations</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {visible.map((obs) => {
          const Icon = obs.icon
          return (
            <div
              key={obs.id}
              className="
                group inline-flex items-center gap-2 px-3 py-2
                bg-white/[0.03]
                border border-peak-border
                rounded-lg
                hover:bg-white/[0.06]
                transition-all duration-150
              "
            >
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${typeStyles[obs.type]}`} />
              <span className="text-sm text-peak-muted">
                {obs.count !== undefined && (
                  <span className="font-semibold text-peak">{obs.count} </span>
                )}
                {obs.text}
              </span>
              <button
                onClick={() => setDismissed((prev) => new Set(prev).add(obs.id))}
                className="p-0.5 text-peak-dim hover:text-peak-muted opacity-0 group-hover:opacity-100 transition-opacity"
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

// ─── Enterprise Admin Summary ─────────────────────────────────────────────

function EnterpriseAdminSummary() {
  const router = useRouter()
  const org = getMockOrgIdentity()

  const storagePct = Math.round((org.storageUsedGb / org.storageTotalGb) * 100)
  const stats = [
    {
      label: 'Active Users',
      value: String(org.seatsUsed),
      change: `${org.seats} seats on ${org.plan}`,
      href: '/settings/org',
      tone: 'primary' as const,
    },
    {
      label: 'Storage Used',
      value: `${storagePct}%`,
      change: `${org.storageUsedGb} GB of ${org.storageTotalGb} GB`,
      href: '/settings/billing',
      tone: 'blue' as const,
    },
    { label: 'Compliance Score', value: '94%', change: 'Last scanned today', href: '/settings/security', tone: 'green' as const },
    { label: 'Open Risks', value: '4', change: '1 high priority', href: '/missions', tone: 'amber' as const },
  ]

  return (
    <section className="pb-10">
      <SectionLabel className="mb-3">Admin Overview</SectionLabel>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => router.push(stat.href)}
            className="text-left"
          >
            <StatTile
              variant="tile"
              tone={stat.tone}
              value={stat.value}
              label={stat.label}
              sublabel={stat.change}
              className="h-full"
            />
          </button>
        ))}
      </div>
    </section>
  )
}

// ─── Personal AI Memory ──────────────────────────────────────────────────────

function PersonalAIMemory() {
  // First-person memory about the current user (Sarah Chen, Acme Corp CEO).
  const memories = [
    { id: '1', text: 'You prefer focus blocks in the morning before noon', source: 'Calendar patterns' },
    { id: '2', text: 'Driving the Product X launch — GA candidate due June 30', source: 'Mission context' },
    { id: '3', text: 'You usually reply to Mike Wilson within 30 minutes', source: 'Communication habits' },
    { id: '4', text: 'Frequently reference the Q2 Marketing Strategy note', source: 'Memory activity' },
  ]

  return (
    <section className="pb-10">
      <SectionLabel className="mb-3">AI Memory</SectionLabel>
      <div className="space-y-2">
        {memories.map((memory) => (
          <div
            key={memory.id}
            className="
              flex items-start gap-3 px-4 py-3
              peak-glass
            "
          >
            <Brain className="w-4 h-4 text-peak-primary-300 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-peak">{memory.text}</p>
              <p className="text-xs text-peak-dim mt-0.5">{memory.source}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

// Deterministic greeting tied to the pinned world clock (no Date.now() in
// render — keeps SSR and first client render in sync, matching '/').
function getGreeting(): string {
  const hour = new Date(FIXED_TODAY).getUTCHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function PeakDashboard() {
  const { uiMode } = useAppStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentMode = mounted ? uiMode : 'team'

  return (
    <PeakShell maxWidth="max-w-6xl">
      <CommandHero />
      <FeatureShowcase />
      <SuggestedNext />

      {/* Enterprise mode: show admin summary above other sections */}
      {currentMode === 'enterprise' && <EnterpriseAdminSummary />}

      <TodaysFocus />
      <AIObservations />

      {/* Personal mode: show AI memory section */}
      {currentMode === 'personal' && <PersonalAIMemory />}

      <MemoryLayer />
    </PeakShell>
  )
}
