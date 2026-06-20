'use client'

import { PeakShell, GlassPanel, SectionLabel, StatTile } from '@/components/peak'
import {
  DEVOPS_PHASES, DEVOPS_AREAS, DEVOPS_EXTERNAL, DEVOPS_FOLLOWUPS, DEVOPS_UPDATED, DEVOPS_LOGIN,
  type AreaState,
} from '@/lib/peak/devops-status'
import { CheckCircle2, Plug, Wrench, ListChecks } from 'lucide-react'

const STATE_META: Record<AreaState, { label: string; cls: string }> = {
  'done': { label: 'Done', cls: 'text-peak-green bg-peak-green/12 ring-peak-green/30' },
  'demo-ready': { label: 'Demo-ready', cls: 'text-peak-primary-300 bg-peak-primary/12 ring-peak-primary/30' },
  'needs-service': { label: 'Needs service', cls: 'text-peak-amber bg-peak-amber/12 ring-peak-amber/30' },
  'in-progress': { label: 'In progress', cls: 'text-peak-blue bg-peak-blue/12 ring-peak-blue/30' },
}

export default function DevOpsPage() {
  const done = DEVOPS_AREAS.filter(a => a.state === 'done').length
  const demo = DEVOPS_AREAS.filter(a => a.state === 'demo-ready').length
  const svc = DEVOPS_AREAS.filter(a => a.state === 'needs-service').length

  return (
    <PeakShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel>Build Status</SectionLabel>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-peak md:text-4xl">
              Functionality Tracker
            </h1>
            <p className="mt-1 text-peak-muted">
              What&apos;s wired, what&apos;s demo-ready, and what needs an external service to go fully live.
            </p>
          </div>
          <div className="text-right">
            <div className="rounded-lg bg-peak-primary/10 px-3 py-1.5 text-xs text-peak-primary-300 ring-1 ring-peak-primary/25">
              Demo login: <code className="text-peak">{DEVOPS_LOGIN}</code>
            </div>
            <span className="mt-1 block text-xs text-peak-dim">Updated {DEVOPS_UPDATED}</span>
          </div>
        </div>

        {/* Overview */}
        <GlassPanel className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:divide-x lg:divide-peak-border">
          <StatTile icon={<CheckCircle2 className="h-5 w-5" />} value={String(done)} label="Fully done" sublabel="works end-to-end" tone="green" />
          <StatTile icon={<ListChecks className="h-5 w-5" />} value={String(demo)} label="Demo-ready" sublabel="canon data, wired" tone="primary" />
          <StatTile icon={<Plug className="h-5 w-5" />} value={String(svc)} label="Needs service" sublabel="external dependency" tone="amber" />
          <StatTile icon={<CheckCircle2 className="h-5 w-5" />} value="0" label="Placeholders left" sublabel="48-route scan" tone="green" />
        </GlassPanel>

        {/* Completed phases */}
        <div>
          <SectionLabel>Completed</SectionLabel>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {DEVOPS_PHASES.map((p) => (
              <GlassPanel key={p.title} className="flex items-start gap-3 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-peak-green" />
                <div>
                  <div className="font-medium text-peak">{p.title}</div>
                  <div className="text-sm text-peak-muted">{p.detail}</div>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>

        {/* Per-area status */}
        <div>
          <SectionLabel>Per-area status</SectionLabel>
          <GlassPanel className="mt-3 divide-y divide-peak-border p-0">
            {DEVOPS_AREAS.map((a) => {
              const m = STATE_META[a.state]
              return (
                <div key={a.area} className="flex flex-wrap items-start gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-peak">{a.area}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${m.cls}`}>{m.label}</span>
                    </div>
                    <div className="mt-0.5 text-sm text-peak-muted">{a.detail}</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {a.routes.map((r) => (
                      <code key={r} className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[11px] text-peak-dim ring-1 ring-peak-border">{r}</code>
                    ))}
                  </div>
                </div>
              )
            })}
          </GlassPanel>
        </div>

        {/* External dependencies */}
        <div>
          <SectionLabel>Needs an external service to go fully live</SectionLabel>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {DEVOPS_EXTERNAL.map((e) => (
              <GlassPanel key={e.service} className="p-4">
                <div className="flex items-center gap-2">
                  <Plug className="h-4 w-4 text-peak-amber" />
                  <span className="font-medium text-peak">{e.service}</span>
                </div>
                <div className="mt-1 text-sm text-peak"><span className="text-peak-muted">Blocks:</span> {e.blocks}</div>
                <div className="mt-1 text-sm text-peak-muted">{e.note}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {e.routes.map((r) => (
                    <code key={r} className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[11px] text-peak-dim ring-1 ring-peak-border">{r}</code>
                  ))}
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>

        {/* Follow-ups */}
        <div>
          <SectionLabel>Known follow-ups</SectionLabel>
          <GlassPanel className="mt-3 space-y-2.5 p-5">
            {DEVOPS_FOLLOWUPS.map((f, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-peak-dim" />
                <span className="text-sm text-peak-muted">{f}</span>
              </div>
            ))}
          </GlassPanel>
        </div>
      </div>
    </PeakShell>
  )
}
