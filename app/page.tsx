'use client'

// Peak One — Daily Brief (the homepage / "/").
//
// The navy "operating system" shell + left sidebar are provided by AppLayout
// for this route, so this page only renders the content column. We use
// <PeakShell> for the centered max-width column + the per-page aurora bloom.
//
// All data comes from lib/peak/mock (the data-layer fallback fixtures). Every
// interactive element routes somewhere real — no dead buttons.

import { useRouter } from 'next/navigation'
import {
  Bell,
  Target,
  Calendar,
  CheckSquare,
  AlertTriangle,
  MessageSquare,
  FileText,
  CheckCircle2,
  Flag,
  FilePlus,
  ClipboardPlus,
  Upload,
  PhoneCall,
} from 'lucide-react'

import {
  PeakShell,
  GlassPanel,
  SectionLabel,
  StatTile,
  ProgressRing,
  MissionTimeline,
  LisaBriefingCard,
  PriorityList,
  ActivityFeed,
  UpcomingMeetings,
  QuickActions,
  AskLisaBar,
  LisaInsight,
  type PeakTone,
  type MissionTimelineStep,
  type BriefingLine as PeakBriefingLine,
  type BriefingSegment,
  type ActivityTone,
} from '@/components/peak'

import {
  MOCK_DAILY_BRIEF,
  MOCK_STATS,
  MOCK_BRIEFING_LINES,
  MOCK_MISSION,
  MOCK_MEETINGS,
  MOCK_PRIORITIES,
  MOCK_ACTIVITY,
  MOCK_QUICK_ACTIONS,
  MOCK_INSIGHT,
} from '@/lib/peak/mock'
import type {
  BriefingLine,
  MeetingItem,
  Priority,
  ActivityItem,
  MilestoneState,
} from '@/lib/peak/types'

// ----------------------------------------------------------------------------
// Static "today" string. We render a fixed date (do NOT call new Date() at
// module scope) so SSR and the first client render agree. The Daily Brief
// fixture pins June 18 to match the rest of the mock world.
// ----------------------------------------------------------------------------
const BRIEF_DATE_LABEL = 'Wednesday, June 18'

// ----------------------------------------------------------------------------
// Small adapters: map the shared lib/peak types onto each primitive's props.
// ----------------------------------------------------------------------------

/** lib stat-tile tone → primitive PeakTone (the primitive uses "neutral" not "default"). */
function statTone(t?: string): PeakTone {
  switch (t) {
    case 'primary':
      return 'primary'
    case 'green':
      return 'green'
    case 'amber':
      return 'amber'
    case 'red':
      return 'red'
    case 'blue':
      return 'blue'
    default:
      return 'neutral'
  }
}

const STAT_ICON: Record<string, React.ReactNode> = {
  target: <Target className="h-5 w-5" />,
  calendar: <Calendar className="h-5 w-5" />,
  'check-square': <CheckSquare className="h-5 w-5" />,
  'alert-triangle': <AlertTriangle className="h-5 w-5" />,
}

/** lib BriefingLine (spans w/ 'primary'|'red'|'green'|'amber') → primitive line ('purple'|'red'). */
function toPeakBriefingLines(lines: BriefingLine[]): PeakBriefingLine[] {
  return lines.map((line) =>
    line.map((span): BriefingSegment => {
      let emphasis: BriefingSegment['emphasis']
      if (span.emphasis === 'primary') emphasis = 'purple'
      else if (span.emphasis === 'red') emphasis = 'red'
      return { text: span.text, emphasis }
    }),
  )
}

/** lib milestone state (DONE/ACTIVE/UPCOMING) → primitive (done/active/upcoming). */
function milestoneState(s: MilestoneState): MissionTimelineStep['state'] {
  return s.toLowerCase() as MissionTimelineStep['state']
}

const PRIORITY_DETAIL: Record<Priority['priority'], string> = {
  URGENT: 'Due today',
  HIGH: 'Due today',
  MEDIUM: 'Due tomorrow',
  LOW: 'This week',
}

function priorityTone(t?: string): 'neutral' | 'amber' | 'red' | 'green' {
  if (t === 'red') return 'red'
  if (t === 'amber') return 'amber'
  if (t === 'green') return 'green'
  return 'neutral'
}

function activityTone(t?: string): ActivityTone {
  switch (t) {
    case 'primary':
      return 'primary'
    case 'green':
      return 'green'
    case 'amber':
      return 'amber'
    case 'red':
      return 'red'
    case 'blue':
      return 'blue'
    default:
      return 'neutral'
  }
}

const ACTIVITY_ICON: Record<string, React.ReactNode> = {
  note: <FileText className="h-4 w-4" />,
  task: <CheckCircle2 className="h-4 w-4" />,
  mission: <Flag className="h-4 w-4" />,
  risk: <AlertTriangle className="h-4 w-4" />,
  message: <MessageSquare className="h-4 w-4" />,
}

const QUICK_ICON: Record<string, React.ReactNode> = {
  'file-plus': <FilePlus className="h-5 w-5" />,
  target: <ClipboardPlus className="h-5 w-5" />,
  sparkles: <PhoneCall className="h-5 w-5" />,
  'calendar-plus': <Calendar className="h-5 w-5" />,
}

/** "11:00 AM" from an ISO date string, in a fixed (UTC-stable) way. */
function formatTime(iso: string): string {
  const d = new Date(iso)
  let h = d.getUTCHours()
  const m = d.getUTCMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`
}

function durationLabel(m: MeetingItem): string | undefined {
  if (!m.endTime) return undefined
  const mins = Math.round((new Date(m.endTime).getTime() - new Date(m.startTime).getTime()) / 60000)
  if (mins <= 0) return undefined
  if (mins % 60 === 0) return `${mins / 60}h`
  if (mins > 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`
  return `${mins}m`
}

function meetingChannel(m: MeetingItem): 'calendar' | 'video' | 'phone' {
  const loc = (m.location || '').toLowerCase()
  if (loc.includes('zoom') || loc.includes('meet') || loc.includes('video')) return 'video'
  if (loc.includes('call') || loc.includes('phone')) return 'phone'
  return 'calendar'
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default function DailyBriefPage() {
  const router = useRouter()
  const brief = MOCK_DAILY_BRIEF
  const firstName = brief.user.name.split(' ')[0]
  const mission = MOCK_MISSION

  const openAskLisa = () =>
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true }),
    )

  // -- Stat tiles -------------------------------------------------------------
  const stats = MOCK_STATS

  // -- Mission timeline -------------------------------------------------------
  const timelineSteps: MissionTimelineStep[] = (mission.milestones ?? []).map((ms) => ({
    label: ms.label,
    date: ms.date
      ? new Date(ms.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        })
      : undefined,
    state: milestoneState(ms.state),
  }))

  // -- Priorities -------------------------------------------------------------
  const priorityItems = MOCK_PRIORITIES.map((p) => ({
    id: p.id,
    title: p.title,
    meta: PRIORITY_DETAIL[p.priority],
    tone: priorityTone(p.tone),
    onClick: () => router.push('/tasks'),
  }))

  // -- Activity ---------------------------------------------------------------
  const activityItems = MOCK_ACTIVITY.map((a: ActivityItem) => {
    const dest =
      a.entityType === 'note'
        ? '/memory'
        : a.entityType === 'task'
          ? '/tasks'
          : a.entityType === 'mission' || a.entityType === 'risk'
            ? `/missions/${mission.id}`
            : '/home'
    return {
      id: a.id,
      icon: ACTIVITY_ICON[a.entityType ?? 'message'] ?? <MessageSquare className="h-4 w-4" />,
      title: a.description,
      subtitle: a.actor ? `${a.actor} · just now` : undefined,
      time: relativeTime(a.timestamp),
      tone: activityTone(a.tone),
      unread: a.id === 'act-1' || a.id === 'act-2',
      onClick: () => router.push(dest),
    }
  })

  // -- Meetings ---------------------------------------------------------------
  const meetingItems = MOCK_MEETINGS.map((m) => ({
    id: m.id,
    time: formatTime(m.startTime),
    title: m.title,
    duration: durationLabel(m),
    channel: meetingChannel(m),
    onClick: () => router.push('/calls'),
  }))

  // -- Quick actions ----------------------------------------------------------
  const QUICK_ROUTES: Record<string, string> = {
    'qa-1': '/memory', // New Note
    'qa-2': '/tasks', // New Task
    'qa-3': '/files', // Upload File
    'qa-4': '/calls', // Start Call
  }
  const QUICK_LABELS: Record<string, string> = {
    'qa-1': 'New Note',
    'qa-2': 'New Task',
    'qa-3': 'Upload File',
    'qa-4': 'Start Call',
  }
  const QUICK_ICONS: Record<string, React.ReactNode> = {
    'qa-1': <FilePlus className="h-5 w-5" />,
    'qa-2': <ClipboardPlus className="h-5 w-5" />,
    'qa-3': <Upload className="h-5 w-5" />,
    'qa-4': <PhoneCall className="h-5 w-5" />,
  }
  const quickActions = MOCK_QUICK_ACTIONS.map((qa) => ({
    id: qa.id,
    label: QUICK_LABELS[qa.id] ?? qa.label,
    icon: QUICK_ICONS[qa.id] ?? QUICK_ICON[qa.icon ?? ''] ?? <FilePlus className="h-5 w-5" />,
    onClick: () => router.push(QUICK_ROUTES[qa.id] ?? '/home'),
  }))

  return (
    <PeakShell>
      {/* ===================== Top bar ===================== */}
      <div className="mb-2 flex items-center justify-between gap-6">
        <p className="text-sm text-peak-muted">{BRIEF_DATE_LABEL}</p>
        <div className="flex items-center gap-3">
          <div className="hidden w-[380px] sm:block">
            <AskLisaBar />
          </div>
          <button
            aria-label="Notifications"
            onClick={() => router.push('/notifications')}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-peak-border bg-white/[0.03] text-peak-muted transition-colors hover:bg-white/[0.06] hover:text-peak"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-peak-primary ring-2 ring-peak-bg" />
          </button>
          <button
            aria-label="Account"
            onClick={() => router.push('/settings')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-peak-primary/20 text-sm font-semibold text-peak-primary-300 ring-1 ring-peak-primary/30 transition-colors hover:bg-peak-primary/30"
          >
            {firstName.charAt(0)}
          </button>
        </div>
      </div>

      {/* ===================== Greeting ===================== */}
      <header className="animate-peak-fade-up mb-8">
        <h1 className="text-5xl font-semibold tracking-tight text-peak sm:text-6xl">
          Good morning, <span className="text-peak-primary-300">{firstName}.</span>
        </h1>
        <p className="mt-3 text-lg text-peak-muted">Here&rsquo;s what matters today.</p>
      </header>

      {/* ===================== Content grid ===================== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        {/* ---------- Main column ---------- */}
        <div className="min-w-0 space-y-6">
          {/* Today's Focus */}
          <GlassPanel className="p-6">
            <SectionLabel className="mb-5">Today&rsquo;s Focus</SectionLabel>
            <div className="grid grid-cols-2 gap-y-6 lg:grid-cols-4 lg:divide-x lg:divide-white/[0.06]">
              {stats.map((s) => (
                <StatTile
                  key={s.id}
                  icon={s.icon ? STAT_ICON[s.icon] : undefined}
                  value={s.value}
                  label={s.label}
                  sublabel={s.sublabel}
                  tone={statTone(s.tone)}
                  variant="cell"
                />
              ))}
            </div>
          </GlassPanel>

          {/* Lisa's Briefing */}
          <LisaBriefingCard
            lines={toPeakBriefingLines(MOCK_BRIEFING_LINES)}
            onView={() => router.push('/lisa')}
          />

          {/* Mission Progress + Upcoming Meetings (two-up) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Mission Progress */}
            <GlassPanel className="flex flex-col">
              <SectionLabel
                className="mb-5"
                action={
                  <button
                    onClick={() => router.push(`/missions/${mission.id}`)}
                    className="hover:text-peak-primary"
                  >
                    View mission
                  </button>
                }
              >
                Mission Progress
              </SectionLabel>

              <div className="flex items-center gap-5">
                <ProgressRing
                  value={mission.progress}
                  size={132}
                  sublabel="On Track"
                  tone="primary"
                />
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-peak">{mission.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-peak-muted">{mission.description}</p>
                </div>
              </div>

              <div className="mt-6">
                <MissionTimeline steps={timelineSteps} />
              </div>
            </GlassPanel>

            {/* Upcoming Meetings */}
            <GlassPanel className="flex flex-col">
              <SectionLabel
                className="mb-3"
                action={
                  <button
                    onClick={() => router.push('/calendar')}
                    className="hover:text-peak-primary"
                  >
                    View calendar
                  </button>
                }
              >
                Upcoming Meetings
              </SectionLabel>
              <UpcomingMeetings items={meetingItems} />
            </GlassPanel>
          </div>

          {/* Insight of the Day */}
          <LisaInsight
            title="Insight of the Day"
            body={MOCK_INSIGHT.body}
            cta={
              MOCK_INSIGHT.cta
                ? {
                    label: MOCK_INSIGHT.cta.label,
                    onClick: () => router.push(MOCK_INSIGHT.cta?.href ?? '/people'),
                  }
                : undefined
            }
          />
        </div>

        {/* ---------- Right rail ---------- */}
        <aside className="space-y-6">
          {/* Top Priorities */}
          <GlassPanel>
            <SectionLabel
              className="mb-4"
              action={
                <button onClick={() => router.push('/tasks')} className="hover:text-peak-primary">
                  View all
                </button>
              }
            >
              Top Priorities
            </SectionLabel>
            <PriorityList items={priorityItems} />
          </GlassPanel>

          {/* Activity Feed */}
          <GlassPanel>
            <SectionLabel
              className="mb-4"
              action={
                <button onClick={() => router.push('/activity')} className="hover:text-peak-primary">
                  View all
                </button>
              }
            >
              Activity Feed
            </SectionLabel>
            <ActivityFeed items={activityItems} />
          </GlassPanel>

          {/* Quick Actions */}
          <GlassPanel>
            <SectionLabel className="mb-4">Quick Actions</SectionLabel>
            <QuickActions actions={quickActions} columns={4} />
          </GlassPanel>

          {/* Ask Lisa CTA (mirrors the command bar for quick reach on the rail) */}
          <LisaInsight
            title="Ask Lisa anything"
            body="Search your memory, prep for a meeting, or get a relationship brief — just ask."
            cta={{ label: 'Open Lisa  ⌘K', onClick: openAskLisa }}
          />
        </aside>
      </div>
    </PeakShell>
  )
}

/** Coarse relative time ("2m ago", "1h ago", "Yesterday") from an ISO string.
 *  Uses a fixed reference (the brief date) so SSR/CSR agree and it never drifts. */
function relativeTime(iso: string): string {
  const REF = Date.parse('2026-06-17T09:00:00.000Z')
  const then = Date.parse(iso)
  const diffMin = Math.max(0, Math.round((REF - then) / 60000))
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.round(diffH / 24)
  if (diffD === 1) return 'Yesterday'
  return `${diffD}d ago`
}
