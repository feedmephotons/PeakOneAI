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
          Good {getGreeting()}
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
                onClick={() => router.push('/calendar')}
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

  const enterpriseObservations: Observation[] = [
    {
      id: 'permission-review',
      icon: Shield,
      text: 'permission changes pending review',
      count: 5,
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
      text: 'new users added this week',
      count: 8,
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

  const stats = [
    { label: 'Active Users', value: '142', change: '+12 this week', href: '/settings/org', tone: 'primary' as const },
    { label: 'Storage Used', value: '68%', change: '340 GB of 500 GB', href: '/settings/billing', tone: 'blue' as const },
    { label: 'Compliance Score', value: '94%', change: 'Last scanned 2h ago', href: '/settings/security', tone: 'green' as const },
    { label: 'Open Tickets', value: '7', change: '3 high priority', href: '/help', tone: 'amber' as const },
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
  const memories = [
    { id: '1', text: 'Prefers morning meetings before 11 AM', source: 'Calendar patterns' },
    { id: '2', text: 'Working on Q4 proposal -- due Friday', source: 'Task context' },
    { id: '3', text: 'Usually replies to Sarah within 30 min', source: 'Communication habits' },
    { id: '4', text: 'Frequently references Design System v2 docs', source: 'File activity' },
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

function getGreeting(): string {
  const hour = new Date().getHours()
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
