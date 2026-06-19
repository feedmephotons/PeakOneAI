'use client'

import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  PeakShell,
  GlassPanel,
  SectionLabel,
  ProgressRing,
  StatTile,
  MissionTimeline,
  LisaInsight,
} from '@/components/peak'
import type { MissionTimelineStep } from '@/components/peak'
import {
  MOCK_MISSION,
  MOCK_MISSION_RECOMMENDATIONS,
  getMockMission,
} from '@/lib/peak/mock'
import type {
  Mission,
  MissionObjective,
  MissionRisk,
  MissionMember,
  MissionStatus,
  RiskLevel,
} from '@/lib/peak/types'
import {
  Star,
  ChevronRight,
  Settings2,
  Share2,
  MoreHorizontal,
  Calendar,
  Wallet,
  Activity,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  DollarSign,
  Users,
  TrendingUp,
  Layers,
  Code2,
  PenTool,
  Megaphone,
  CheckCircle2,
  Loader2,
  Circle,
} from 'lucide-react'

// ----------------------------------------------------------------------------
// Helpers / shared maps
// ----------------------------------------------------------------------------

type RingTone = 'primary' | 'green' | 'amber' | 'red' | 'blue' | 'neutral'

const STATUS_META: Record<MissionStatus, { label: string; tone: RingTone; pill: string }> = {
  ON_TRACK: { label: 'On Track', tone: 'green', pill: 'bg-peak-green/12 text-peak-green' },
  AT_RISK: { label: 'At Risk', tone: 'amber', pill: 'bg-peak-amber/12 text-peak-amber' },
  BEHIND: { label: 'Behind', tone: 'red', pill: 'bg-peak-red/12 text-peak-red' },
  COMPLETED: { label: 'Completed', tone: 'primary', pill: 'bg-peak-primary/15 text-peak-primary-300' },
}

const OBJECTIVE_STATUS: Record<MissionStatus, { label: string; pill: string; bar: string }> = {
  ON_TRACK: { label: 'In Progress', pill: 'bg-peak-blue/12 text-peak-blue', bar: 'from-peak-blue/70 to-peak-blue' },
  AT_RISK: { label: 'At Risk', pill: 'bg-peak-amber/12 text-peak-amber', bar: 'from-peak-amber/70 to-peak-amber' },
  BEHIND: { label: 'Behind', pill: 'bg-peak-red/12 text-peak-red', bar: 'from-peak-red/70 to-peak-red' },
  COMPLETED: { label: 'Completed', pill: 'bg-peak-green/12 text-peak-green', bar: 'from-peak-green/70 to-peak-green' },
}

const RISK_META: Record<RiskLevel, { label: string; pill: string; iconBg: string; iconColor: string }> = {
  HIGH: { label: 'High', pill: 'bg-peak-red/15 text-peak-red ring-1 ring-peak-red/25', iconBg: 'bg-peak-red/12', iconColor: 'text-peak-red' },
  MED: { label: 'Medium', pill: 'bg-peak-amber/15 text-peak-amber ring-1 ring-peak-amber/25', iconBg: 'bg-peak-amber/12', iconColor: 'text-peak-amber' },
  LOW: { label: 'Low', pill: 'bg-peak-blue/15 text-peak-blue ring-1 ring-peak-blue/25', iconBg: 'bg-peak-blue/12', iconColor: 'text-peak-blue' },
}

const PEAK_NOW = Date.parse('2026-06-18T09:00:00.000Z')

function fmtDate(iso?: string | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { timeZone: 'UTC', ...(opts ?? { month: 'short', day: 'numeric', year: 'numeric' }) })
}

function daysFromNow(iso?: string | null): number | null {
  if (!iso) return null
  return Math.round((new Date(iso).getTime() - PEAK_NOW) / (1000 * 60 * 60 * 24))
}

function remainingLabel(iso?: string | null): string {
  const d = daysFromNow(iso)
  if (d === null) return ''
  if (d < 0) return `${Math.abs(d)} days overdue`
  if (d === 0) return 'Due today'
  return `${d} days remaining`
}

function money(n?: number | null): string {
  if (n === null || n === undefined) return '—'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n}`
}

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

function timelineSteps(m: Mission): MissionTimelineStep[] {
  const ms = m.milestones ?? []
  return ms.map((s) => ({
    label: s.label,
    date: fmtDate(s.date, { month: 'short', day: 'numeric' }),
    caption: s.state === 'DONE' ? 'Completed' : s.state === 'ACTIVE' ? 'In Progress' : 'Upcoming',
    state: s.state.toLowerCase() as MissionTimelineStep['state'],
  }))
}

const TABS = [
  'Overview',
  'Objectives',
  'Timeline',
  'Dependencies',
  'Risks',
  'Documents',
  'Team',
  'Reports',
] as const
type Tab = (typeof TABS)[number]

// ----------------------------------------------------------------------------
// Objectives block
// ----------------------------------------------------------------------------

function ObjectiveRow({ obj }: { obj: MissionObjective }) {
  const meta = OBJECTIVE_STATUS[obj.status]
  const done = obj.progress >= 100
  return (
    <div className="flex items-center gap-4 py-3">
      <span className="shrink-0">
        {done ? (
          <CheckCircle2 className="h-6 w-6 text-peak-green" />
        ) : obj.progress > 0 ? (
          <Loader2 className="h-6 w-6 text-peak-primary-300" />
        ) : (
          <Circle className="h-6 w-6 text-peak-dim" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-sm font-medium text-peak">{obj.title}</span>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-peak">{obj.progress}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={['h-full rounded-full bg-gradient-to-r transition-all duration-500', meta.bar].join(' ')}
            style={{ width: `${Math.max(0, Math.min(100, obj.progress))}%` }}
          />
        </div>
      </div>
      <span className={['shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium', meta.pill].join(' ')}>
        {meta.label}
      </span>
    </div>
  )
}

function ObjectivesPanel({ mission }: { mission: Mission }) {
  const objectives = mission.objectives ?? []
  const completed = objectives.filter((o) => o.progress >= 100).length
  return (
    <GlassPanel>
      <SectionLabel
        action={
          <span className="text-peak-muted">
            {completed} of {objectives.length} completed
          </span>
        }
      >
        Objectives
      </SectionLabel>
      <div className="mt-3 divide-y divide-white/[0.05]">
        {objectives.map((obj) => (
          <ObjectiveRow key={obj.id} obj={obj} />
        ))}
        {objectives.length === 0 ? (
          <div className="py-6 text-center text-sm text-peak-muted">No objectives yet.</div>
        ) : null}
      </div>
    </GlassPanel>
  )
}

// ----------------------------------------------------------------------------
// Key Metrics block
// ----------------------------------------------------------------------------

function KeyMetricsPanel() {
  return (
    <GlassPanel>
      <SectionLabel>Key Metrics</SectionLabel>
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
        <div>
          <StatTile icon={<DollarSign className="h-5 w-5" />} value="$12.4M" label="Revenue Impact" tone="green" />
          <div className="mt-1.5 flex items-center gap-1 px-2 text-xs font-medium text-peak-green">
            <TrendingUp className="h-3 w-3" /> 22%
          </div>
        </div>
        <div>
          <StatTile icon={<Users className="h-5 w-5" />} value="48K" label="Customer Impact" tone="blue" />
          <div className="mt-1.5 flex items-center gap-1 px-2 text-xs font-medium text-peak-blue">
            <TrendingUp className="h-3 w-3" /> 18%
          </div>
        </div>
        <div>
          <StatTile icon={<TrendingUp className="h-5 w-5" />} value="$120M" label="Market Opportunity" tone="primary" />
          <div className="mt-1.5 flex items-center gap-1 px-2 text-xs font-medium text-peak-primary-300">
            <Sparkles className="h-3 w-3" /> High
          </div>
        </div>
        <div>
          <StatTile icon={<Activity className="h-5 w-5" />} value="8.7/10" label="Confidence Score" tone="amber" />
          <div className="mt-1.5 flex items-center gap-1 px-2 text-xs font-medium text-peak-green">
            <TrendingUp className="h-3 w-3" /> 0.6 pts
          </div>
        </div>
      </div>
    </GlassPanel>
  )
}

// ----------------------------------------------------------------------------
// Dependencies flow
// ----------------------------------------------------------------------------

interface DepNode {
  team: string
  work: string
  status: 'Completed' | 'In Progress' | 'Upcoming'
  icon: React.ReactNode
}

const DEPENDENCIES: DepNode[] = [
  { team: 'Platform Team', work: 'API Development', status: 'Completed', icon: <Code2 className="h-4 w-4" /> },
  { team: 'Design Team', work: 'UI/UX System', status: 'In Progress', icon: <PenTool className="h-4 w-4" /> },
  { team: 'Marketing Team', work: 'Campaign Assets', status: 'In Progress', icon: <Megaphone className="h-4 w-4" /> },
]

const DEP_STATUS: Record<DepNode['status'], string> = {
  Completed: 'text-peak-green',
  'In Progress': 'text-peak-primary-300',
  Upcoming: 'text-peak-dim',
}

function DependenciesPanel() {
  return (
    <GlassPanel>
      <SectionLabel
        action={
          <Link href="#" className="inline-flex items-center gap-1 text-peak-primary-300 hover:text-peak-primary">
            View all dependencies <ArrowRight className="h-3 w-3" />
          </Link>
        }
      >
        Dependencies
      </SectionLabel>
      <div className="mt-4 flex flex-col items-stretch gap-3 md:flex-row md:items-center">
        {DEPENDENCIES.map((dep, i) => (
          <React.Fragment key={dep.team}>
            <div className="flex-1 rounded-xl border border-peak-border bg-white/[0.02] p-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-peak-primary/15 text-peak-primary-300">
                  {dep.icon}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-peak">{dep.team}</div>
                  <div className="truncate text-xs text-peak-muted">{dep.work}</div>
                </div>
              </div>
              <div className={['mt-3 text-xs font-medium', DEP_STATUS[dep.status]].join(' ')}>
                {dep.status}
              </div>
            </div>
            {i < DEPENDENCIES.length - 1 ? (
              <ArrowRight className="mx-auto hidden h-4 w-4 shrink-0 text-peak-dim md:block" />
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </GlassPanel>
  )
}

// ----------------------------------------------------------------------------
// Right rail blocks
// ----------------------------------------------------------------------------

function TopRisksPanel({ risks }: { risks: MissionRisk[] }) {
  return (
    <GlassPanel className="p-5">
      <SectionLabel action={<Link href="#" className="text-peak-primary-300 hover:text-peak-primary">View all</Link>}>
        Top Risks
      </SectionLabel>
      <div className="mt-4 space-y-4">
        {risks.map((risk) => {
          const meta = RISK_META[risk.level]
          return (
            <div key={risk.id} className="flex gap-3">
              <span className={['mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', meta.iconBg, meta.iconColor].join(' ')}>
                <ShieldAlert className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-peak">{risk.title}</span>
                  <span className={['shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', meta.pill].join(' ')}>
                    {meta.label}
                  </span>
                </div>
                {risk.note ? (
                  <p className="mt-0.5 line-clamp-2 text-xs text-peak-muted">{risk.note}</p>
                ) : null}
                <div className="mt-1 text-[11px] text-peak-dim">
                  Impact: <span className="text-peak-muted">{risk.impact ?? '—'}</span>
                  <span className="px-1.5">·</span>
                  Probability: <span className="text-peak-muted">{risk.probability ?? '—'}</span>
                </div>
              </div>
            </div>
          )
        })}
        {risks.length === 0 ? (
          <div className="text-sm text-peak-muted">No risks identified.</div>
        ) : null}
      </div>
    </GlassPanel>
  )
}

function MissionTeamPanel({ members }: { members: MissionMember[] }) {
  const shown = members.slice(0, 4)
  const overflow = members.length - shown.length
  return (
    <GlassPanel className="p-5">
      <SectionLabel action={<Link href="#" className="text-peak-primary-300 hover:text-peak-primary">View all</Link>}>
        Mission Team
      </SectionLabel>
      <div className="mt-4 space-y-3.5">
        {shown.map((m, idx) => (
          <div key={m.id} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-peak-primary/20 text-xs font-semibold text-peak-primary-300 ring-1 ring-peak-primary/20">
              {initials(m.user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-peak">{m.user.name}</div>
              <div className="truncate text-xs text-peak-muted">{m.role ?? m.user.role ?? 'Member'}</div>
            </div>
            {idx === 0 ? (
              <span className="shrink-0 rounded-full bg-peak-primary/15 px-2 py-0.5 text-[10px] font-medium text-peak-primary-300">
                You
              </span>
            ) : (
              <span
                className={[
                  'h-2 w-2 shrink-0 rounded-full',
                  idx % 3 === 2 ? 'bg-peak-amber' : 'bg-peak-green',
                ].join(' ')}
              />
            )}
          </div>
        ))}
        {members.length === 0 ? (
          <div className="text-sm text-peak-muted">No team members assigned.</div>
        ) : null}
      </div>
      {overflow > 0 ? (
        <div className="mt-4 flex items-center gap-2 border-t border-white/[0.05] pt-3">
          <div className="flex -space-x-2">
            {members.slice(4, 7).map((m) => (
              <span
                key={m.id}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-peak-bg2 text-[9px] font-semibold text-peak-muted ring-2 ring-peak-bg"
              >
                {initials(m.user.name)}
              </span>
            ))}
          </div>
          <span className="text-xs text-peak-muted">+{overflow} members</span>
        </div>
      ) : null}
    </GlassPanel>
  )
}

function UpcomingMilestonesPanel({ mission }: { mission: Mission }) {
  const upcoming = (mission.milestones ?? [])
    .filter((m) => m.state !== 'DONE')
    .sort((a, b) => (a.date && b.date ? new Date(a.date).getTime() - new Date(b.date).getTime() : 0))

  return (
    <GlassPanel className="p-5">
      <SectionLabel action={<Link href="#" className="text-peak-primary-300 hover:text-peak-primary">View all</Link>}>
        Upcoming Milestones
      </SectionLabel>
      <div className="mt-4 space-y-3">
        {upcoming.map((ms) => {
          const d = daysFromNow(ms.date)
          return (
            <div key={ms.id} className="flex items-center gap-3">
              <span className="w-12 shrink-0 text-xs font-medium text-peak-muted">
                {fmtDate(ms.date, { month: 'short', day: 'numeric' })}
              </span>
              <span className="flex-1 truncate text-sm text-peak">{ms.label}</span>
              {d !== null ? (
                <span
                  className={[
                    'shrink-0 text-xs',
                    ms.state === 'ACTIVE' ? 'text-peak-primary-300' : 'text-peak-muted',
                  ].join(' ')}
                >
                  {d <= 0 ? 'Now' : `in ${d} days`}
                </span>
              ) : null}
            </div>
          )
        })}
        {upcoming.length === 0 ? (
          <div className="py-2 text-sm text-peak-muted">No upcoming milestones.</div>
        ) : null}
      </div>
    </GlassPanel>
  )
}

function LisaRecommendationsPanel() {
  const recs = MOCK_MISSION_RECOMMENDATIONS
  return (
    <div className="relative overflow-hidden rounded-2xl border border-peak-primary/20 bg-peak-primary/[0.06] p-5 backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-peak-primary/20 blur-2xl" />
      <div className="relative">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-peak-primary/20 text-peak-primary-300">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-peak-primary-300">
            Lisa Recommendations
          </span>
        </div>

        {recs[0] ? (
          <div>
            <div className="text-sm font-semibold text-peak">{recs[0].title}</div>
            <p className="mt-1 text-sm leading-relaxed text-peak-muted">{recs[0].body}</p>
          </div>
        ) : null}

        {recs.length > 1 ? (
          <div className="mt-4 space-y-2.5 border-t border-peak-primary/15 pt-3">
            {recs.slice(1).map((r) => (
              <div key={r.id} className="flex items-start gap-2">
                <span
                  className={[
                    'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                    r.tone === 'red' ? 'bg-peak-red' : r.tone === 'amber' ? 'bg-peak-amber' : 'bg-peak-green',
                  ].join(' ')}
                />
                <span className="text-xs leading-relaxed text-peak-muted">
                  <span className="font-medium text-peak">{r.title}.</span> {r.body}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-peak-primary/15 px-3 py-2 text-sm font-medium text-peak-primary-300 transition-colors hover:bg-peak-primary/25"
        >
          View All Recommendations
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// Risks tab (full)
// ----------------------------------------------------------------------------

function RisksTab({ risks }: { risks: MissionRisk[] }) {
  return (
    <GlassPanel>
      <SectionLabel>All Risks</SectionLabel>
      <div className="mt-4 space-y-3">
        {risks.map((risk) => {
          const meta = RISK_META[risk.level]
          return (
            <div key={risk.id} className="rounded-xl border border-peak-border bg-white/[0.02] p-4">
              <div className="flex items-start gap-3">
                <span className={['flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', meta.iconBg, meta.iconColor].join(' ')}>
                  <ShieldAlert className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-peak">{risk.title}</span>
                    <span className={['shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium', meta.pill].join(' ')}>
                      {meta.label}
                    </span>
                  </div>
                  {risk.note ? <p className="mt-1 text-sm text-peak-muted">{risk.note}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-peak-dim">
                    <span>Impact: <span className="text-peak-muted">{risk.impact ?? '—'}</span></span>
                    <span>Probability: <span className="text-peak-muted">{risk.probability ?? '—'}</span></span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {risks.length === 0 ? (
          <div className="py-6 text-center text-sm text-peak-muted">No risks identified.</div>
        ) : null}
      </div>
    </GlassPanel>
  )
}

// ----------------------------------------------------------------------------
// Team tab (full)
// ----------------------------------------------------------------------------

function TeamTab({ members }: { members: MissionMember[] }) {
  return (
    <GlassPanel>
      <SectionLabel>Mission Team</SectionLabel>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-xl border border-peak-border bg-white/[0.02] p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-peak-primary/20 text-sm font-semibold text-peak-primary-300 ring-1 ring-peak-primary/20">
              {initials(m.user.name)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-peak">{m.user.name}</div>
              <div className="truncate text-xs text-peak-muted">{m.role ?? m.user.role ?? 'Member'}</div>
              {m.user.email ? <div className="truncate text-xs text-peak-dim">{m.user.email}</div> : null}
            </div>
          </div>
        ))}
        {members.length === 0 ? (
          <div className="text-sm text-peak-muted">No team members assigned.</div>
        ) : null}
      </div>
    </GlassPanel>
  )
}

// ----------------------------------------------------------------------------
// Main page
// ----------------------------------------------------------------------------

export default function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [mission, setMission] = useState<Mission>(() => getMockMission(id) ?? MOCK_MISSION)
  const [tab, setTab] = useState<Tab>('Overview')
  const [starred, setStarred] = useState(true)

  // Try the live API; fall back to whatever mock we already have.
  useEffect(() => {
    let active = true
    fetch(`/api/missions/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad status'))))
      .then((json) => {
        if (!active) return
        if (json?.data && typeof json.data === 'object') setMission(json.data as Mission)
      })
      .catch(() => {
        /* keep mock */
      })
    return () => {
      active = false
    }
  }, [id])

  const status = STATUS_META[mission.status]
  const budgetPct =
    mission.budgetTotal && mission.budgetUsed
      ? Math.round((mission.budgetUsed / mission.budgetTotal) * 100)
      : null
  const objectives = mission.objectives ?? []
  const risks = mission.risks ?? []
  const members = mission.members ?? []

  return (
    <PeakShell>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm">
        <Link href="/missions" className="text-peak-muted transition-colors hover:text-peak-primary-300">
          Mission Control
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-peak-dim" />
        <span className="text-peak">{mission.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-semibold tracking-tight text-peak">{mission.name}</h1>
            <button
              type="button"
              onClick={() => setStarred((s) => !s)}
              aria-label="Star mission"
              className="text-peak-dim transition-colors hover:text-peak-amber"
            >
              <Star className={['h-6 w-6', starred ? 'fill-peak-amber text-peak-amber' : ''].join(' ')} />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="max-w-2xl text-sm text-peak-muted">{mission.description}</p>
            {mission.owner ? (
              <span className="flex items-center gap-2 text-sm">
                <span className="text-peak-dim">Owner</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-peak-primary/20 text-[10px] font-semibold text-peak-primary-300 ring-1 ring-peak-primary/20">
                  {initials(mission.owner.name)}
                </span>
                <span className="text-peak">{mission.owner.name}</span>
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-peak-border bg-white/[0.03] px-3.5 py-2 text-sm font-medium text-peak transition-colors hover:bg-white/[0.06]">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Mission Settings</span>
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-peak-border bg-white/[0.03] px-3.5 py-2 text-sm font-medium text-peak transition-colors hover:bg-white/[0.06]">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-peak-border bg-white/[0.03] text-peak transition-colors hover:bg-white/[0.06]">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main grid: content + right rail */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        {/* LEFT / CENTER */}
        <div className="min-w-0 space-y-6">
          {/* Hero: ring + stat column */}
          <GlassPanel glow className="p-7">
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center">
              <div className="shrink-0">
                <ProgressRing
                  value={mission.progress}
                  size={260}
                  tone={status.tone}
                  label={
                    <span className="flex flex-col items-center">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-peak-muted">
                        Overall Progress
                      </span>
                      <span className="text-5xl font-semibold tracking-tight text-peak">{mission.progress}%</span>
                      <span className="mt-1 flex items-center gap-1 text-xs font-medium text-peak-green">
                        <TrendingUp className="h-3 w-3" /> 8% vs last week
                      </span>
                    </span>
                  }
                />
              </div>

              {/* Stat column */}
              <div className="flex-1 space-y-5">
                <StatRow
                  icon={<Calendar className="h-5 w-5" />}
                  label="Target Date"
                  value={fmtDate(mission.targetDate)}
                  meta={remainingLabel(mission.targetDate)}
                  metaTone="muted"
                />
                <StatRow
                  icon={<Wallet className="h-5 w-5" />}
                  label="Budget"
                  value={`${money(mission.budgetUsed)} / ${money(mission.budgetTotal)}`}
                  meta={budgetPct !== null ? `${budgetPct}% used` : undefined}
                  metaTone="muted"
                />
                <StatRow
                  icon={<Activity className="h-5 w-5" />}
                  label="Team Velocity"
                  value={`${mission.velocity ?? '—'}%`}
                  meta={status.label}
                  metaTone="green"
                />
                <StatRow
                  icon={<Sparkles className="h-5 w-5" />}
                  label="Health Score"
                  value={`${mission.healthScore ?? '—'} / 100`}
                  meta={(mission.healthScore ?? 0) >= 80 ? 'Good' : (mission.healthScore ?? 0) >= 60 ? 'Fair' : 'Poor'}
                  metaTone={(mission.healthScore ?? 0) >= 80 ? 'green' : (mission.healthScore ?? 0) >= 60 ? 'amber' : 'red'}
                />
              </div>
            </div>
          </GlassPanel>

          {/* Tab bar */}
          <div className="border-b border-peak-border">
            <div className="flex items-center gap-1 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={[
                    'relative shrink-0 px-3.5 py-2.5 text-sm font-medium transition-colors',
                    tab === t ? 'text-peak' : 'text-peak-muted hover:text-peak',
                  ].join(' ')}
                >
                  {t}
                  {tab === t ? (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-peak-primary shadow-[0_0_8px_var(--peak-glow)]" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          {tab === 'Overview' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ObjectivesPanel mission={mission} />
                <div className="space-y-6">
                  <GlassPanel>
                    <SectionLabel>Mission Timeline</SectionLabel>
                    <div className="mt-6 pb-1">
                      <MissionTimeline steps={timelineSteps(mission)} />
                    </div>
                  </GlassPanel>
                  <KeyMetricsPanel />
                </div>
              </div>
              <DependenciesPanel />
            </div>
          ) : null}

          {tab === 'Objectives' ? <ObjectivesPanel mission={mission} /> : null}

          {tab === 'Timeline' ? (
            <GlassPanel>
              <SectionLabel>Mission Timeline</SectionLabel>
              <div className="mt-8 pb-2">
                <MissionTimeline steps={timelineSteps(mission)} />
              </div>
            </GlassPanel>
          ) : null}

          {tab === 'Dependencies' ? <DependenciesPanel /> : null}

          {tab === 'Risks' ? <RisksTab risks={risks} /> : null}

          {tab === 'Team' ? <TeamTab members={members} /> : null}

          {tab === 'Documents' ? (
            <GlassPanel>
              <SectionLabel>Documents</SectionLabel>
              <div className="mt-6 flex flex-col items-center justify-center gap-2 py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-peak-primary/15 text-peak-primary-300">
                  <Layers className="h-6 w-6" />
                </span>
                <div className="text-sm font-medium text-peak">No documents linked yet</div>
                <p className="max-w-sm text-xs text-peak-muted">
                  Specs, runbooks, and decision docs for this mission will appear here once attached.
                </p>
              </div>
            </GlassPanel>
          ) : null}

          {tab === 'Reports' ? (
            <GlassPanel>
              <SectionLabel>Reports</SectionLabel>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatTile icon={<TrendingUp className="h-5 w-5" />} value={`${mission.progress}%`} label="Progress" tone="primary" />
                <StatTile icon={<Activity className="h-5 w-5" />} value={`${mission.velocity ?? '—'}%`} label="Velocity" tone="green" />
                <StatTile icon={<Sparkles className="h-5 w-5" />} value={`${mission.healthScore ?? '—'}`} label="Health" tone="amber" />
                <StatTile icon={<ShieldAlert className="h-5 w-5" />} value={risks.length} label="Open Risks" tone="red" />
              </div>
              <p className="mt-5 text-xs text-peak-muted">
                Full status reports and exportable summaries are generated by Lisa. Ask Lisa for
                a weekly mission report from the command bar.
              </p>
            </GlassPanel>
          ) : null}
        </div>

        {/* RIGHT RAIL */}
        <aside className="space-y-6">
          <TopRisksPanel risks={risks} />
          <MissionTeamPanel members={members} />
          <UpcomingMilestonesPanel mission={mission} />
          <LisaRecommendationsPanel />
        </aside>
      </div>
    </PeakShell>
  )
}

// ----------------------------------------------------------------------------
// Stat row (hero stat column)
// ----------------------------------------------------------------------------

function StatRow({
  icon,
  label,
  value,
  meta,
  metaTone = 'muted',
}: {
  icon: React.ReactNode
  label: string
  value: string
  meta?: string
  metaTone?: 'muted' | 'green' | 'amber' | 'red'
}) {
  const metaClass =
    metaTone === 'green'
      ? 'text-peak-green'
      : metaTone === 'amber'
        ? 'text-peak-amber'
        : metaTone === 'red'
          ? 'text-peak-red'
          : 'text-peak-muted'
  return (
    <div className="flex items-center gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-peak-muted ring-1 ring-white/[0.06]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-peak-muted">{label}</div>
        <div className="text-lg font-semibold tracking-tight text-peak">{value}</div>
      </div>
      {meta ? <span className={['shrink-0 text-xs font-medium', metaClass].join(' ')}>{meta}</span> : null}
    </div>
  )
}
