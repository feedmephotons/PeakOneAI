'use client'

/**
 * Peak One — Create Studio chart primitives.
 *
 * Navy/purple-themed recharts wrappers keyed off the ChartSpec contract
 * (lib/peak/create-types.ts). Renders bar / line / area / pie / donut charts
 * with a consistent dark glass look: purple primary series, hairline grid,
 * dark tooltip. recharts is client-only, so this whole module is 'use client'.
 *
 * Used by DashboardView (and reusable by DeckView slides if wanted).
 */

import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import type { ChartSpec } from '@/lib/peak/create-types'

// ----------------------------------------------------------------------------
// Theme — navy base, electric-purple primary, supporting violets/accents.
// ----------------------------------------------------------------------------

/** Multi-series palette: purple first, then supporting hues (still on-brand). */
const SERIES_COLORS = [
  '#8B5CF6', // peak primary (violet-500)
  '#C4B5FD', // peak primary-300 (light purple)
  '#7C3AED', // peak primary-600
  '#60A5FA', // peak blue (info)
  '#34D399', // peak green
  '#FBBF24', // peak amber
  '#F472B6', // pink accent
  '#A78BFA', // violet-400
]

/** Categorical palette for pie/donut slices. */
const SLICE_COLORS = [
  '#8B5CF6',
  '#C4B5FD',
  '#7C3AED',
  '#60A5FA',
  '#34D399',
  '#FBBF24',
  '#F472B6',
  '#A78BFA',
]

const GRID_STROKE = 'rgba(255,255,255,0.07)' // --peak-border
const AXIS_STROKE = 'rgba(255,255,255,0.12)'
const TICK_FILL = '#9498AD' // --peak-text-muted

export function seriesColor(i: number): string {
  return SERIES_COLORS[i % SERIES_COLORS.length]
}

// ----------------------------------------------------------------------------
// Dark tooltip — matches the glass panels.
// ----------------------------------------------------------------------------

interface TooltipPayloadItem {
  name?: string | number
  value?: string | number
  color?: string
  dataKey?: string | number
}

function DarkTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string | number
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-xl border border-peak-border bg-[#13141F]/95 px-3 py-2 text-xs shadow-peak backdrop-blur-xl">
      {label !== undefined && label !== '' ? (
        <div className="mb-1 font-medium text-peak">{label}</div>
      ) : null}
      <div className="space-y-0.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: entry.color || seriesColor(i) }}
            />
            <span className="text-peak-muted">{entry.name}</span>
            <span className="ml-auto font-medium text-peak">
              {formatTickValue(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatTickValue(v: string | number | undefined): string {
  if (v === undefined || v === null) return ''
  if (typeof v === 'number') {
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}K`
    return `${v}`
  }
  return String(v)
}

const axisProps = {
  stroke: AXIS_STROKE,
  tick: { fill: TICK_FILL, fontSize: 11 },
  tickLine: false,
  axisLine: { stroke: AXIS_STROKE },
}

const legendStyle = { fontSize: 12, color: '#9498AD' }

// ----------------------------------------------------------------------------
// Chart renderer — switches on ChartSpec.type.
// ----------------------------------------------------------------------------

export interface PeakChartProps {
  spec: ChartSpec
  height?: number
}

/**
 * Renders a single ChartSpec themed navy/purple.
 * - bar  → grouped BarChart, one Bar per series key
 * - line → LineChart, one Line per series
 * - area → stacked-ish AreaChart with purple gradient fills
 * - pie  → PieChart, slices from data[].{series[0]}
 * - donut→ PieChart with inner radius
 */
export function PeakChart({ spec, height = 280 }: PeakChartProps) {
  const { type, series, data } = spec
  const safeSeries = series && series.length > 0 ? series : ['value']
  const showLegend = safeSeries.length > 1

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-peak-border text-xs text-peak-dim"
        style={{ height }}
      >
        No data
      </div>
    )
  }

  if (type === 'pie' || type === 'donut') {
    const valueKey = safeSeries[0]
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={type === 'donut' ? '55%' : 0}
            outerRadius="80%"
            paddingAngle={type === 'donut' ? 2 : 0}
            stroke="rgba(9,10,18,0.6)"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<DarkTooltip />} cursor={false} />
          <Legend wrapperStyle={legendStyle} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={formatTickValue} width={44} />
          <Tooltip content={<DarkTooltip />} cursor={{ stroke: GRID_STROKE }} />
          {showLegend ? <Legend wrapperStyle={legendStyle} iconType="circle" /> : null}
          {safeSeries.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={seriesColor(i)}
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: seriesColor(i), strokeWidth: 0 }}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
          <defs>
            {safeSeries.map((key, i) => (
              <linearGradient key={key} id={`peak-area-${key}-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={seriesColor(i)} stopOpacity={0.5} />
                <stop offset="95%" stopColor={seriesColor(i)} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={formatTickValue} width={44} />
          <Tooltip content={<DarkTooltip />} cursor={{ stroke: GRID_STROKE }} />
          {showLegend ? <Legend wrapperStyle={legendStyle} iconType="circle" /> : null}
          {safeSeries.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={seriesColor(i)}
              strokeWidth={2.5}
              fill={`url(#peak-area-${key}-${i})`}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  // default: bar
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="name" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={formatTickValue} width={44} />
        <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        {showLegend ? <Legend wrapperStyle={legendStyle} iconType="circle" /> : null}
        {safeSeries.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            fill={seriesColor(i)}
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export default PeakChart
