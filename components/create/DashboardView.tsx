'use client'

/**
 * Peak One — Create Studio · DashboardView
 *
 * Renders a DashboardDoc (marketing / social / general): a KPI row,
 * navy/purple recharts visuals, optional data tables, and — for
 * 'social'/'marketing' variants — a "Connect Meta / TikTok / Instagram"
 * row driven off doc.connections.
 *
 * Live OAuth is out of scope for V1: the connect buttons are placeholders
 * that toggle a local connected/disconnected state only.
 *
 * recharts is client-only, so this module is 'use client'. Nothing in the
 * render path uses Date.now()/Math.random, so it is SSR-safe.
 */

import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plug,
  Check,
  Facebook,
  Instagram,
  Music2,
  Globe,
} from 'lucide-react'
import { StatTile, GlassPanel, SectionLabel } from '@/components/peak'
import type { PeakTone } from '@/components/peak'
import type {
  DashboardDoc,
  DocMetric,
  ChartSpec,
  Sheet,
  Provider,
} from '@/lib/peak/create-types'
import { PeakChart } from './Charts'

// ----------------------------------------------------------------------------
// KPI helpers — map DocMetric.trend → tone + arrow icon.
// ----------------------------------------------------------------------------

function trendTone(trend?: DocMetric['trend']): PeakTone {
  if (trend === 'up') return 'green'
  if (trend === 'down') return 'red'
  return 'primary'
}

function TrendIcon({ trend }: { trend?: DocMetric['trend'] }) {
  if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5" />
  if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5" />
  return <Minus className="h-3.5 w-3.5" />
}

function KpiTile({ metric }: { metric: DocMetric }) {
  const tone = trendTone(metric.trend)
  const deltaColor =
    metric.trend === 'up'
      ? 'text-peak-green'
      : metric.trend === 'down'
        ? 'text-peak-red'
        : 'text-peak-muted'
  return (
    <GlassPanel className="!p-5">
      <StatTile
        value={metric.value}
        label={metric.label}
        tone={tone}
        sublabel={undefined}
      />
      {metric.delta ? (
        <div className={['mt-3 flex items-center gap-1.5 text-xs font-medium', deltaColor].join(' ')}>
          <TrendIcon trend={metric.trend} />
          <span>{metric.delta}</span>
        </div>
      ) : null}
    </GlassPanel>
  )
}

// ----------------------------------------------------------------------------
// Chart cards — full-width for line/area trends, half-width for bar/pie.
// ----------------------------------------------------------------------------

function chartIsWide(type: ChartSpec['type']): boolean {
  return type === 'line' || type === 'area'
}

function ChartCard({ spec }: { spec: ChartSpec }) {
  return (
    <GlassPanel className={chartIsWide(spec.type) ? 'md:col-span-2' : ''}>
      {spec.title ? (
        <h3 className="mb-4 text-sm font-medium text-peak">{spec.title}</h3>
      ) : null}
      <PeakChart spec={spec} height={chartIsWide(spec.type) ? 300 : 260} />
    </GlassPanel>
  )
}

// ----------------------------------------------------------------------------
// Table — navy data table from a Sheet (optional dashboard tables).
// ----------------------------------------------------------------------------

function formatCell(
  value: string | number | undefined,
  type?: Sheet['columns'][number]['type'],
): string {
  if (value === undefined || value === null || value === '') return '—'
  if (typeof value === 'number') {
    if (type === 'currency') return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    if (type === 'percent') return `${value}%`
    return value.toLocaleString('en-US')
  }
  return String(value)
}

function DataTable({ sheet }: { sheet: Sheet }) {
  return (
    <GlassPanel className="md:col-span-2 overflow-hidden !p-0">
      <div className="border-b border-peak-border px-6 py-4">
        <h3 className="text-sm font-medium text-peak">{sheet.name}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-peak-border">
              {sheet.columns.map((col) => (
                <th
                  key={col.key}
                  className={[
                    'px-6 py-3 text-xs font-medium uppercase tracking-wider text-peak-muted',
                    col.type === 'number' || col.type === 'currency' || col.type === 'percent'
                      ? 'text-right'
                      : 'text-left',
                  ].join(' ')}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheet.rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-peak-border/50 transition-colors last:border-0 hover:bg-white/[0.02]"
              >
                {sheet.columns.map((col) => {
                  const numeric =
                    col.type === 'number' || col.type === 'currency' || col.type === 'percent'
                  return (
                    <td
                      key={col.key}
                      className={[
                        'px-6 py-3.5 text-peak',
                        numeric ? 'text-right tabular-nums' : 'text-left',
                      ].join(' ')}
                    >
                      {formatCell(row[col.key], col.type)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
          {sheet.totals ? (
            <tfoot>
              <tr className="border-t border-peak-border bg-white/[0.02]">
                {sheet.columns.map((col, ci) => {
                  const numeric =
                    col.type === 'number' || col.type === 'currency' || col.type === 'percent'
                  return (
                    <td
                      key={col.key}
                      className={[
                        'px-6 py-3.5 font-semibold text-peak',
                        numeric ? 'text-right tabular-nums' : 'text-left',
                      ].join(' ')}
                    >
                      {ci === 0 && sheet.totals?.[col.key] === undefined
                        ? 'Total'
                        : formatCell(sheet.totals?.[col.key], col.type)}
                    </td>
                  )
                })}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </GlassPanel>
  )
}

// ----------------------------------------------------------------------------
// Connections row — placeholder connect buttons (V1: no live OAuth).
// ----------------------------------------------------------------------------

const PROVIDER_META: Record<
  Provider,
  { label: string; icon: React.ReactNode; brand: string }
> = {
  meta: { label: 'Meta', icon: <Facebook className="h-4 w-4" />, brand: 'text-[#1877F2]' },
  instagram: { label: 'Instagram', icon: <Instagram className="h-4 w-4" />, brand: 'text-[#E1306C]' },
  tiktok: { label: 'TikTok', icon: <Music2 className="h-4 w-4" />, brand: 'text-peak' },
  google: { label: 'Google', icon: <Globe className="h-4 w-4" />, brand: 'text-peak-blue' },
}

function ConnectionCard({
  provider,
  connected,
  onToggle,
}: {
  provider: Provider
  connected: boolean
  onToggle: () => void
}) {
  const meta = PROVIDER_META[provider]
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-peak-border bg-peak-glass px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={[
            'flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10',
            meta.brand,
          ].join(' ')}
        >
          {meta.icon}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium text-peak">{meta.label}</div>
          <div
            className={[
              'flex items-center gap-1 text-xs',
              connected ? 'text-peak-green' : 'text-peak-dim',
            ].join(' ')}
          >
            <span
              className={[
                'inline-block h-1.5 w-1.5 rounded-full',
                connected ? 'bg-peak-green' : 'bg-peak-dim',
              ].join(' ')}
            />
            {connected ? 'Connected' : 'Not connected'}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={[
          'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
          connected
            ? 'border border-peak-border text-peak-muted hover:bg-white/5'
            : 'bg-peak-primary text-white hover:bg-peak-primary-600',
        ].join(' ')}
      >
        {connected ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Connected
          </>
        ) : (
          <>
            <Plug className="h-3.5 w-3.5" />
            Connect
          </>
        )}
      </button>
    </div>
  )
}

function ConnectionsRow({
  connections,
}: {
  connections: NonNullable<DashboardDoc['connections']>
}) {
  // Local-only connect/disconnect (placeholder; live OAuth out of scope V1).
  const [state, setState] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(connections.map((c) => [c.provider, c.connected])),
  )

  const toggle = (provider: Provider) =>
    setState((prev) => ({ ...prev, [provider]: !prev[provider] }))

  return (
    <section className="space-y-3">
      <SectionLabel>Connect your accounts</SectionLabel>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {connections.map((c) => (
          <ConnectionCard
            key={c.provider}
            provider={c.provider}
            connected={!!state[c.provider]}
            onToggle={() => toggle(c.provider)}
          />
        ))}
      </div>
      <p className="text-xs text-peak-dim">
        Connecting brings live data into this dashboard. Live sync is coming soon — connections here
        are a preview.
      </p>
    </section>
  )
}

// ----------------------------------------------------------------------------
// DashboardView
// ----------------------------------------------------------------------------

export default function DashboardView({ doc }: { doc: DashboardDoc }) {
  const showConnections =
    (doc.variant === 'social' || doc.variant === 'marketing') &&
    !!doc.connections &&
    doc.connections.length > 0

  const kpis = doc.kpis ?? []
  const charts = doc.charts ?? []
  const tables = doc.tables ?? []

  return (
    <div className="space-y-8">
      {/* Connections (social / marketing) */}
      {showConnections ? <ConnectionsRow connections={doc.connections!} /> : null}

      {/* KPI row */}
      {kpis.length > 0 ? (
        <section className="space-y-3">
          <SectionLabel>Key metrics</SectionLabel>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {kpis.map((m, i) => (
              <KpiTile key={`${m.label}-${i}`} metric={m} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Charts grid */}
      {charts.length > 0 ? (
        <section className="space-y-3">
          <SectionLabel>Insights</SectionLabel>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {charts.map((spec, i) => (
              <ChartCard key={`${spec.title ?? spec.type}-${i}`} spec={spec} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Optional tables */}
      {tables.length > 0 ? (
        <section className="space-y-3">
          <SectionLabel>Detail</SectionLabel>
          <div className="grid grid-cols-1 gap-4">
            {tables.map((sheet, i) => (
              <DataTable key={`${sheet.name}-${i}`} sheet={sheet} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Empty state */}
      {kpis.length === 0 && charts.length === 0 && tables.length === 0 ? (
        <GlassPanel className="text-center text-sm text-peak-muted">
          This dashboard has no data yet.
        </GlassPanel>
      ) : null}
    </div>
  )
}
