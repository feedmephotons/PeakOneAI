'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  PeakShell,
  GlassPanel,
  SectionLabel,
  ProgressRing,
  AskLisaBar,
} from '@/components/peak'
import { MOCK_MISSIONS } from '@/lib/peak/mock'
import type { Mission, MissionStatus } from '@/lib/peak/types'
import {
  Plus,
  Target,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
} from 'lucide-react'

// ----------------------------------------------------------------------------
// Status → tone mapping (green / amber / red, used across both pages)
// ----------------------------------------------------------------------------

type RingTone = 'primary' | 'green' | 'amber' | 'red' | 'blue' | 'neutral'

const STATUS_META: Record<
  MissionStatus,
  { label: string; tone: RingTone; pill: string; ring: RingTone }
> = {
  ON_TRACK: {
    label: 'On Track',
    tone: 'green',
    pill: 'bg-peak-green/12 text-peak-green ring-1 ring-peak-green/25',
    ring: 'green',
  },
  AT_RISK: {
    label: 'At Risk',
    tone: 'amber',
    pill: 'bg-peak-amber/12 text-peak-amber ring-1 ring-peak-amber/25',
    ring: 'amber',
  },
  BEHIND: {
    label: 'Behind',
    tone: 'red',
    pill: 'bg-peak-red/12 text-peak-red ring-1 ring-peak-red/25',
    ring: 'red',
  },
  COMPLETED: {
    label: 'Completed',
    tone: 'primary',
    pill: 'bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/25',
    ring: 'primary',
  },
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function daysRemaining(iso?: string | null): string | null {
  if (!iso) return null
  const ms = new Date(iso).getTime() - Date.now()
  const days = Math.round(ms / (1000 * 60 * 60 * 24))
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  return `${days} days left`
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ----------------------------------------------------------------------------
// Mission card
// ----------------------------------------------------------------------------

function MissionCard({ mission }: { mission: Mission }) {
  const meta = STATUS_META[mission.status]
  const remaining = daysRemaining(mission.targetDate)

  return (
    <Link href={`/missions/${mission.id}`} className="group block focus:outline-none">
      <GlassPanel className="peak-glass-hover h-full p-6 transition-all duration-200 group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-peak-primary/40">
        <div className="flex items-start gap-5">
          {/* Ring */}
          <div className="shrink-0">
            <ProgressRing value={mission.progress} size={104} tone={meta.ring} />
          </div>

          {/* Body */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="truncate text-lg font-semibold tracking-tight text-peak transition-colors group-hover:text-peak-primary-300">
                {mission.name}
              </h3>
              <span
                className={[
                  'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium',
                  meta.pill,
                ].join(' ')}
              >
                {meta.label}
              </span>
            </div>

            {mission.description ? (
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-peak-muted">
                {mission.description}
              </p>
            ) : null}

            {/* Meta row */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-peak-muted">
              {mission.owner ? (
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-peak-primary/20 text-[10px] font-semibold text-peak-primary-300 ring-1 ring-peak-primary/20">
                    {initials(mission.owner.name)}
                  </span>
                  <span className="text-peak">{mission.owner.name}</span>
                </span>
              ) : null}

              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-peak-dim" />
                {formatDate(mission.targetDate)}
                {remaining ? (
                  <span className="text-peak-dim">· {remaining}</span>
                ) : null}
              </span>

              {typeof mission.riskCount === 'number' && mission.riskCount > 0 ? (
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-peak-amber" />
                  {mission.riskCount} {mission.riskCount === 1 ? 'risk' : 'risks'}
                </span>
              ) : null}

              {typeof mission.objectiveCount === 'number' ? (
                <span className="flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-peak-dim" />
                  {mission.objectiveCount} objectives
                </span>
              ) : null}
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-peak-primary-600 to-peak-primary transition-all duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, mission.progress))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>
    </Link>
  )
}

// ----------------------------------------------------------------------------
// New Mission stub card
// ----------------------------------------------------------------------------

function NewMissionCard() {
  return (
    <button
      type="button"
      onClick={() =>
        alert('New Mission — mission creation flow coming soon. Lisa will help you scope objectives, milestones, and a team.')
      }
      className="group flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-peak-border bg-white/[0.015] p-6 text-center transition-all duration-200 hover:border-peak-primary/40 hover:bg-peak-primary/[0.04]"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/20 transition-transform duration-200 group-hover:scale-105">
        <Plus className="h-6 w-6" />
      </span>
      <span className="text-sm font-semibold text-peak">New Mission</span>
      <span className="max-w-[16rem] text-xs text-peak-muted">
        Launch a new objective. Lisa scopes the plan, team, and risks for you.
      </span>
    </button>
  )
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS)
  const [filter, setFilter] = useState<'ALL' | MissionStatus>('ALL')

  // Try the live API; fall back gracefully to mock fixtures.
  useEffect(() => {
    let active = true
    fetch('/api/missions')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad status'))))
      .then((json) => {
        if (!active) return
        const data: Mission[] | undefined = json?.data
        if (Array.isArray(data) && data.length > 0) setMissions(data)
      })
      .catch(() => {
        /* keep MOCK_MISSIONS */
      })
    return () => {
      active = false
    }
  }, [])

  const visible =
    filter === 'ALL' ? missions : missions.filter((m) => m.status === filter)

  // Portfolio roll-up
  const total = missions.length
  const onTrack = missions.filter((m) => m.status === 'ON_TRACK').length
  const atRisk = missions.filter((m) => m.status === 'AT_RISK').length
  const behind = missions.filter((m) => m.status === 'BEHIND').length
  const avgProgress =
    total > 0
      ? Math.round(missions.reduce((s, m) => s + (m.progress || 0), 0) / total)
      : 0

  const FILTERS: { key: 'ALL' | MissionStatus; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'ON_TRACK', label: 'On Track' },
    { key: 'AT_RISK', label: 'At Risk' },
    { key: 'BEHIND', label: 'Behind' },
    { key: 'COMPLETED', label: 'Completed' },
  ]

  return (
    <PeakShell>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-peak-muted">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-peak-primary/15 text-peak-primary-300">
              <Target className="h-3 w-3" />
            </span>
            Mission Control
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-peak">
            Missions
          </h1>
          <p className="mt-2 max-w-xl text-sm text-peak-muted">
            Every major objective your company is running — progress, risk, and
            health in one command view.
          </p>
        </div>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div className="hidden w-64 lg:block">
            <AskLisaBar placeholder="Ask Lisa about a mission…" />
          </div>
          <button
            type="button"
            onClick={() =>
              alert('New Mission — mission creation flow coming soon.')
            }
            className="flex shrink-0 items-center gap-2 rounded-xl bg-peak-primary px-4 py-2.5 text-sm font-semibold text-white shadow-peak-glow transition-colors hover:bg-peak-primary-600"
          >
            <Plus className="h-4 w-4" />
            New Mission
          </button>
        </div>
      </div>

      {/* Portfolio roll-up */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <GlassPanel className="p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/20">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <div className="text-3xl font-semibold leading-none tracking-tight text-peak">
                {total}
              </div>
              <div className="mt-1.5 text-sm font-medium text-peak">Active</div>
              <div className="mt-0.5 text-xs text-peak-muted">Missions</div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-peak-green/15 text-peak-green ring-1 ring-peak-green/20">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <div className="text-3xl font-semibold leading-none tracking-tight text-peak-green">
                {onTrack}
              </div>
              <div className="mt-1.5 text-sm font-medium text-peak">On Track</div>
              <div className="mt-0.5 text-xs text-peak-muted">Healthy</div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-peak-amber/15 text-peak-amber ring-1 ring-peak-amber/20">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <div className="text-3xl font-semibold leading-none tracking-tight text-peak-amber">
                {atRisk + behind}
              </div>
              <div className="mt-1.5 text-sm font-medium text-peak">Needs Attention</div>
              <div className="mt-0.5 text-xs text-peak-muted">At risk or behind</div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-peak-blue/15 text-peak-blue ring-1 ring-peak-blue/20">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <div className="text-3xl font-semibold leading-none tracking-tight text-peak-blue">
                {avgProgress}%
              </div>
              <div className="mt-1.5 text-sm font-medium text-peak">Avg Progress</div>
              <div className="mt-0.5 text-xs text-peak-muted">Across portfolio</div>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Filters */}
      <div className="mb-5 flex items-center justify-between">
        <SectionLabel>Your Missions</SectionLabel>
        <div className="flex items-center gap-1 rounded-xl border border-peak-border bg-white/[0.02] p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={[
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                filter === f.key
                  ? 'bg-peak-primary/20 text-peak-primary-300'
                  : 'text-peak-muted hover:text-peak',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {visible.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
        {filter === 'ALL' ? <NewMissionCard /> : null}
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-peak-border bg-white/[0.015] p-12 text-center text-sm text-peak-muted">
          No missions in this state.
        </div>
      ) : null}
    </PeakShell>
  )
}
