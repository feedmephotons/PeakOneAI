'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  Maximize2,
  Minimize2,
  Presentation,
  StickyNote,
} from 'lucide-react'
import { StatTile } from '@/components/peak'
import type {
  ChartSpec,
  ChartType,
  DocMetric,
  PresentationDoc,
  Slide,
} from '@/lib/peak/create-types'

// ----------------------------------------------------------------------------
// Navy / purple palette (mirrors the Peak design tokens — used by the SVG chart
// and the .pptx export theme where we need concrete hex values).
// ----------------------------------------------------------------------------

const NAVY = {
  bg: '0B0C16',
  panel: '13141F',
  border: '23243A',
  text: 'F4F5FA',
  muted: '9498AD',
  primary: '8B5CF6',
  primary300: 'C4B5FD',
  green: '34D399',
  amber: 'FBBF24',
  red: 'F87171',
  blue: '60A5FA',
}

// Series colors for charts (purple-led, navy-friendly).
const SERIES_COLORS = [
  NAVY.primary,
  NAVY.blue,
  NAVY.green,
  NAVY.amber,
  NAVY.red,
  NAVY.primary300,
]

function num(v: string | number): number {
  if (typeof v === 'number') return v
  const parsed = parseFloat(String(v).replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function trendColor(trend?: DocMetric['trend']): string {
  if (trend === 'up') return NAVY.green
  if (trend === 'down') return NAVY.red
  return NAVY.muted
}

// ----------------------------------------------------------------------------
// SlideChart — a self-contained navy SVG chart (no external deps, SSR-safe).
// Supports bar / line / area / pie / donut.
// ----------------------------------------------------------------------------

function SlideChart({ chart, compact = false }: { chart: ChartSpec; compact?: boolean }) {
  const width = compact ? 240 : 720
  const height = compact ? 130 : 300
  const series = chart.series.length ? chart.series : ['value']
  const data = chart.data ?? []

  const isPie = chart.type === 'pie' || chart.type === 'donut'

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-peak-border bg-black/20 text-xs text-peak-muted"
        style={{ width: '100%', height }}
      >
        No chart data
      </div>
    )
  }

  if (isPie) {
    return <PieChart chart={chart} size={compact ? 120 : 240} />
  }

  // Cartesian (bar / line / area).
  const padL = compact ? 26 : 44
  const padR = compact ? 8 : 16
  const padT = compact ? 8 : 16
  const padB = compact ? 18 : 28
  const plotW = width - padL - padR
  const plotH = height - padT - padB

  let max = 0
  for (const row of data) {
    for (const s of series) max = Math.max(max, num(row[s]))
  }
  if (max <= 0) max = 1

  const xFor = (i: number) =>
    data.length === 1 ? padL + plotW / 2 : padL + (plotW * i) / (data.length - 1)
  const yFor = (v: number) => padT + plotH - (plotH * v) / max
  const bandW = plotW / data.length

  // gridlines
  const gridY = [0, 0.25, 0.5, 0.75, 1].map((f) => padT + plotH - plotH * f)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: compact ? height : 'auto', maxHeight: height }}
      role="img"
      aria-label={chart.title || 'chart'}
    >
      {/* grid */}
      {gridY.map((y, i) => (
        <line
          key={i}
          x1={padL}
          x2={width - padR}
          y1={y}
          y2={y}
          stroke={`#${NAVY.border}`}
          strokeWidth={1}
        />
      ))}

      {chart.type === 'bar' &&
        data.map((row, i) => {
          const groupW = bandW * 0.7
          const barW = groupW / series.length
          const x0 = padL + bandW * i + (bandW - groupW) / 2
          return (
            <g key={i}>
              {series.map((s, si) => {
                const v = num(row[s])
                const bh = (plotH * v) / max
                return (
                  <rect
                    key={s}
                    x={x0 + si * barW}
                    y={padT + plotH - bh}
                    width={Math.max(1, barW - 2)}
                    height={bh}
                    rx={2}
                    fill={`#${SERIES_COLORS[si % SERIES_COLORS.length]}`}
                  />
                )
              })}
            </g>
          )
        })}

      {(chart.type === 'line' || chart.type === 'area') &&
        series.map((s, si) => {
          const color = `#${SERIES_COLORS[si % SERIES_COLORS.length]}`
          const pts = data.map((row, i) => `${xFor(i)},${yFor(num(row[s]))}`)
          const linePath = `M ${pts.join(' L ')}`
          const areaPath = `${linePath} L ${xFor(data.length - 1)},${padT + plotH} L ${xFor(0)},${padT + plotH} Z`
          return (
            <g key={s}>
              {chart.type === 'area' && (
                <path d={areaPath} fill={color} fillOpacity={0.18} stroke="none" />
              )}
              <path d={linePath} fill="none" stroke={color} strokeWidth={2} />
              {!compact &&
                data.map((row, i) => (
                  <circle key={i} cx={xFor(i)} cy={yFor(num(row[s]))} r={2.5} fill={color} />
                ))}
            </g>
          )
        })}

      {/* x labels */}
      {!compact &&
        data.map((row, i) => (
          <text
            key={i}
            x={xFor(i)}
            y={height - 8}
            textAnchor="middle"
            fontSize={10}
            fill={`#${NAVY.muted}`}
          >
            {String(row.name).slice(0, 10)}
          </text>
        ))}
    </svg>
  )
}

function PieChart({ chart, size }: { chart: ChartSpec; size: number }) {
  const key = chart.series[0] || 'value'
  const slices = chart.data.map((row) => ({ name: String(row.name), value: num(row[key]) }))
  const total = slices.reduce((a, s) => a + s.value, 0) || 1
  const r = size / 2
  const cx = r
  const cy = r
  const inner = chart.type === 'donut' ? r * 0.58 : 0

  let acc = 0
  const arcs = slices.map((s, i) => {
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2
    acc += s.value
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2
    const large = end - start > Math.PI ? 1 : 0
    const x1 = cx + r * Math.cos(start)
    const y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end)
    const y2 = cy + r * Math.sin(end)
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
    return { d, color: `#${SERIES_COLORS[i % SERIES_COLORS.length]}`, name: s.name }
  })

  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }} role="img">
        {arcs.map((a, i) => (
          <path key={i} d={a.d} fill={a.color} stroke={`#${NAVY.bg}`} strokeWidth={1.5} />
        ))}
        {inner > 0 && <circle cx={cx} cy={cy} r={inner} fill={`#${NAVY.panel}`} />}
      </svg>
      <ul className="space-y-1">
        {arcs.map((a, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-peak-muted">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: a.color }} />
            <span className="text-peak">{a.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ----------------------------------------------------------------------------
// SlideStage — renders a single slide's content for the main 16:9 stage.
// ----------------------------------------------------------------------------

function SlideStage({ slide }: { slide: Slide }) {
  const hasChart = !!slide.chart
  const hasKpis = !!slide.kpis?.length
  return (
    <div className="flex h-full w-full flex-col p-[4.5%]">
      <div className="shrink-0">
        <h2 className="text-3xl font-semibold tracking-tight text-peak md:text-4xl">
          {slide.title}
        </h2>
        {slide.subtitle ? (
          <p className="mt-1.5 text-base text-peak-primary-300 md:text-lg">{slide.subtitle}</p>
        ) : null}
        <div className="mt-3 h-px w-16 bg-peak-primary/60" />
      </div>

      <div className="mt-5 flex min-h-0 flex-1 gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {hasKpis ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {slide.kpis!.slice(0, 4).map((m, i) => (
                <div key={i} className="peak-glass p-4">
                  <div className="text-2xl font-semibold tracking-tight text-peak-primary-300">
                    {m.value}
                  </div>
                  <div className="mt-1 text-xs font-medium text-peak">{m.label}</div>
                  {m.delta ? (
                    <div className="mt-0.5 text-xs" style={{ color: trendColor(m.trend) }}>
                      {m.trend === 'up' ? '▲' : m.trend === 'down' ? '▼' : '–'} {m.delta}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {slide.bullets?.length ? (
            <ul className="space-y-2.5">
              {slide.bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-peak md:text-base">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-peak-primary" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {hasChart ? (
          <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            <div className="w-full">
              {slide.chart!.title ? (
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-peak-muted">
                  {slide.chart!.title}
                </div>
              ) : null}
              <SlideChart chart={slide.chart!} />
            </div>
          </div>
        ) : null}
      </div>

      {/* chart on small screens stacks below */}
      {hasChart ? (
        <div className="mt-4 lg:hidden">
          <SlideChart chart={slide.chart!} compact />
        </div>
      ) : null}
    </div>
  )
}

// ----------------------------------------------------------------------------
// .pptx export (pptxgenjs, dynamically imported on demand).
// ----------------------------------------------------------------------------

function pptxChartType(type: ChartType): string {
  switch (type) {
    case 'line':
      return 'line'
    case 'area':
      return 'area'
    case 'pie':
    case 'donut':
      return 'doughnut'
    case 'bar':
    default:
      return 'bar'
  }
}

async function exportPptx(doc: PresentationDoc) {
  const mod = await import('pptxgenjs')
  const PptxGenJS = mod.default
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'P1_16x9', width: 13.333, height: 7.5 })
  pptx.layout = 'P1_16x9'
  pptx.author = doc.author || 'Peak One'
  pptx.company = doc.company || ''
  pptx.title = doc.title

  const W = 13.333

  // Title slide.
  const cover = pptx.addSlide()
  cover.background = { color: NAVY.bg }
  cover.addShape('rect', { x: 0, y: 6.95, w: W, h: 0.08, fill: { color: NAVY.primary } })
  cover.addText(doc.title, {
    x: 0.8,
    y: 2.6,
    w: W - 1.6,
    h: 1.4,
    fontSize: 40,
    bold: true,
    color: NAVY.text,
    fontFace: 'Arial',
  })
  if (doc.subtitle) {
    cover.addText(doc.subtitle, {
      x: 0.8,
      y: 4.0,
      w: W - 1.6,
      h: 0.8,
      fontSize: 18,
      color: NAVY.primary300,
      fontFace: 'Arial',
    })
  }
  cover.addText(
    [doc.company, doc.author].filter(Boolean).join('  ·  '),
    { x: 0.8, y: 6.1, w: W - 1.6, h: 0.4, fontSize: 12, color: NAVY.muted, fontFace: 'Arial' },
  )

  for (const slide of doc.slides) {
    const s = pptx.addSlide()
    s.background = { color: NAVY.bg }

    // header accent
    s.addShape('rect', { x: 0.6, y: 1.18, w: 1.1, h: 0.05, fill: { color: NAVY.primary } })

    s.addText(slide.title, {
      x: 0.6,
      y: 0.45,
      w: W - 1.2,
      h: 0.7,
      fontSize: 26,
      bold: true,
      color: NAVY.text,
      fontFace: 'Arial',
    })
    if (slide.subtitle) {
      s.addText(slide.subtitle, {
        x: 0.6,
        y: 1.05,
        w: W - 1.2,
        h: 0.4,
        fontSize: 14,
        color: NAVY.primary300,
        fontFace: 'Arial',
      })
    }

    const hasChart = !!slide.chart && (slide.chart.data?.length ?? 0) > 0
    const bodyW = hasChart ? 6.4 : W - 1.2
    let cursorY = 1.5

    // KPIs row
    if (slide.kpis?.length) {
      const kpis = slide.kpis.slice(0, 4)
      const gap = 0.2
      const tileW = (bodyW - gap * (kpis.length - 1)) / kpis.length
      kpis.forEach((m, i) => {
        const x = 0.6 + i * (tileW + gap)
        s.addShape('roundRect', {
          x,
          y: cursorY,
          w: tileW,
          h: 1.05,
          rectRadius: 0.06,
          fill: { color: NAVY.panel },
          line: { color: NAVY.border, width: 0.75 },
        })
        s.addText(
          [
            { text: `${m.value}\n`, options: { fontSize: 18, bold: true, color: NAVY.primary300 } },
            { text: m.label, options: { fontSize: 9, color: NAVY.text } },
          ],
          { x: x + 0.12, y: cursorY + 0.12, w: tileW - 0.24, h: 0.8, fontFace: 'Arial', valign: 'top' },
        )
      })
      cursorY += 1.3
    }

    // bullets
    if (slide.bullets?.length) {
      s.addText(
        slide.bullets.map((b) => ({
          text: b,
          options: { bullet: { code: '2022' }, color: NAVY.text, fontSize: 14, paraSpaceAfter: 6 },
        })),
        { x: 0.6, y: cursorY, w: bodyW, h: 7.5 - cursorY - 0.4, fontFace: 'Arial', valign: 'top' },
      )
    }

    // chart
    if (hasChart) {
      const chart = slide.chart!
      const t = pptxChartType(chart.type)
      const labels = chart.data.map((r) => String(r.name))
      if (t === 'doughnut') {
        const key = chart.series[0] || 'value'
        s.addChart('doughnut' as never, [
          { name: chart.title || 'Series', labels, values: chart.data.map((r) => num(r[key])) },
        ] as never, {
          x: 7.2,
          y: 1.5,
          w: 5.5,
          h: 4.6,
          chartColors: SERIES_COLORS,
          showLegend: true,
          legendColor: NAVY.text,
          showTitle: false,
          dataLabelColor: NAVY.text,
        } as never)
      } else {
        const dataset = chart.series.map((key) => ({
          name: key,
          labels,
          values: chart.data.map((r) => num(r[key])),
        }))
        s.addChart(t as never, dataset as never, {
          x: 7.2,
          y: 1.5,
          w: 5.5,
          h: 4.6,
          chartColors: SERIES_COLORS,
          showLegend: chart.series.length > 1,
          legendColor: NAVY.text,
          showTitle: false,
          catAxisLabelColor: NAVY.muted,
          valAxisLabelColor: NAVY.muted,
          catGridLine: { style: 'none' },
          valGridLine: { color: NAVY.border },
        } as never)
      }
    }

    // speaker notes
    if (slide.notes) s.addNotes(slide.notes)
  }

  await pptx.writeFile({ fileName: `${(doc.title || 'presentation').replace(/[^\w.-]+/g, '_')}.pptx` })
}

// ----------------------------------------------------------------------------
// DeckView — main component.
// ----------------------------------------------------------------------------

export default function DeckView({ doc }: { doc: PresentationDoc }) {
  const slides = useMemo(() => doc.slides ?? [], [doc.slides])
  const count = slides.length
  const [index, setIndex] = useState(0)
  const [showNotes, setShowNotes] = useState(false)
  const [present, setPresent] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportErr, setExportErr] = useState<string | null>(null)

  const clamped = Math.min(index, Math.max(0, count - 1))
  const current = slides[clamped]

  const go = useCallback(
    (next: number) => {
      setIndex((i) => {
        const target = typeof next === 'number' ? next : i
        return Math.max(0, Math.min(count - 1, target))
      })
    },
    [count],
  )

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIndex((i) => Math.min(count - 1, i + 1)), [count])

  // Keyboard nav.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        prev()
      } else if (e.key === 'Escape') {
        setPresent(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const handleExportPptx = useCallback(async () => {
    setExportErr(null)
    setExporting(true)
    try {
      await exportPptx(doc)
    } catch (err) {
      setExportErr(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }, [doc])

  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') window.print()
  }, [])

  if (count === 0 || !current) {
    return (
      <div className="peak-glass flex flex-col items-center justify-center gap-2 p-12 text-center">
        <Presentation className="h-8 w-8 text-peak-muted" />
        <p className="text-peak-muted">This presentation has no slides yet.</p>
      </div>
    )
  }

  return (
    <div className="deckview flex flex-col gap-4">
      {/* Toolbar */}
      <div className="deck-toolbar flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-peak-muted">
          <Presentation className="h-4 w-4 text-peak-primary-300" />
          <span className="font-medium text-peak">
            Slide {clamped + 1} <span className="text-peak-muted">of {count}</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotes((v) => !v)}
            className={[
              'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm transition-colors',
              showNotes
                ? 'border-peak-primary/40 bg-peak-primary/15 text-peak-primary-300'
                : 'border-peak-border bg-white/5 text-peak hover:bg-white/10',
            ].join(' ')}
            aria-pressed={showNotes}
          >
            <StickyNote className="h-4 w-4" />
            Notes
          </button>
          <button
            type="button"
            onClick={() => setPresent((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-peak-border bg-white/5 px-3 py-1.5 text-sm text-peak transition-colors hover:bg-white/10"
          >
            {present ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {present ? 'Exit' : 'Present'}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-peak-border bg-white/5 px-3 py-1.5 text-sm text-peak transition-colors hover:bg-white/10"
          >
            <FileDown className="h-4 w-4" />
            PDF
          </button>
          <button
            type="button"
            onClick={handleExportPptx}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-peak-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-peak-primary-600 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting…' : '.pptx'}
          </button>
        </div>
      </div>

      {exportErr ? (
        <div className="rounded-xl border border-peak-red/30 bg-peak-red/10 px-3 py-2 text-sm text-peak-red">
          {exportErr}
        </div>
      ) : null}

      {/* Stage + (optional) present overlay */}
      <div
        className={
          present
            ? 'fixed inset-0 z-50 flex flex-col bg-peak p-6'
            : 'flex flex-col gap-4'
        }
      >
        {present ? (
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-peak-muted">
              {clamped + 1} / {count} — {doc.title}
            </span>
            <button
              type="button"
              onClick={() => setPresent(false)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-peak-border bg-white/5 px-3 py-1.5 text-sm text-peak hover:bg-white/10"
            >
              <Minimize2 className="h-4 w-4" />
              Exit
            </button>
          </div>
        ) : null}

        <div className={present ? 'flex min-h-0 flex-1 items-center' : ''}>
          <div className="relative w-full">
            {/* 16:9 navy stage */}
            <div
              className="deck-stage relative w-full overflow-hidden rounded-2xl border border-peak-border"
              style={{
                aspectRatio: '16 / 9',
                background:
                  'radial-gradient(120% 140% at 12% 0%, rgba(139,92,246,0.16), transparent 55%), #0B0C16',
              }}
            >
              <SlideStage slide={current} />
            </div>

            {/* Prev / Next overlay buttons */}
            <button
              type="button"
              onClick={prev}
              disabled={clamped === 0}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-peak-border bg-black/40 text-peak backdrop-blur transition hover:bg-black/60 disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={clamped === count - 1}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-peak-border bg-black/40 text-peak backdrop-blur transition hover:bg-black/60 disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Speaker notes panel */}
        {showNotes ? (
          <div className="peak-glass mt-3 p-4">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-peak-muted">
              <StickyNote className="h-3.5 w-3.5" />
              Speaker Notes
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-peak">
              {current.notes?.trim() || 'No speaker notes for this slide.'}
            </p>
          </div>
        ) : null}
      </div>

      {/* Thumbnail strip */}
      <div className="deck-thumbs -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {slides.map((s, i) => {
          const active = i === clamped
          return (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={active ? 'true' : undefined}
              className={[
                'group relative flex w-36 shrink-0 flex-col overflow-hidden rounded-lg border text-left transition',
                active
                  ? 'border-peak-primary/60 ring-1 ring-peak-primary/40'
                  : 'border-peak-border hover:border-white/20',
              ].join(' ')}
              style={{ aspectRatio: '16 / 9' }}
            >
              <span
                className="flex h-full w-full flex-col p-2"
                style={{ background: active ? '#101122' : '#0B0C16' }}
              >
                <span className="absolute left-1 top-1 rounded bg-black/40 px-1 text-[10px] text-peak-muted">
                  {i + 1}
                </span>
                <span className="mt-3 line-clamp-2 text-[11px] font-medium leading-tight text-peak">
                  {s.title}
                </span>
                {s.bullets?.length ? (
                  <span className="mt-1 line-clamp-2 text-[9px] leading-tight text-peak-muted">
                    {s.bullets[0]}
                  </span>
                ) : null}
                {s.chart ? (
                  <span className="mt-auto h-6 w-full opacity-80">
                    <SlideChart chart={s.chart} compact />
                  </span>
                ) : null}
              </span>
            </button>
          )
        })}
      </div>

      {/* Print styles: each slide stacked, navy-on-white for ink-friendly PDF. */}
      <style jsx global>{`
        @media print {
          .deck-toolbar,
          .deck-thumbs,
          .deck-stage button[aria-label='Previous slide'],
          .deck-stage button[aria-label='Next slide'] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
