'use client'

/**
 * Peak One — Create Studio text-document view (report / proposal / summary).
 *
 * Renders an executive summary plus ordered sections. Each section can carry a
 * markdown-ish body (headings, bullets, bold, inline emphasis), an explicit
 * bullet list, and a row of metrics rendered as Peak StatTiles. Export options:
 *   • Print / PDF  — window.print() with a scoped print stylesheet
 *   • Copy / .md   — serialize the doc to clean Markdown
 *
 * SSR-safe: no Date.now()/Math.random in render; the download blob URL is built
 * only inside the click handler. Always-navy, inside the Peak shell.
 */

import React, { useState } from 'react'
import {
  Printer,
  Copy,
  Download,
  Check,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
} from 'lucide-react'

import { GlassPanel, SectionLabel, StatTile } from '@/components/peak'
import type { PeakTone } from '@/components/peak'
import type { ReportDoc, ReportSection, DocMetric } from '@/lib/peak/create-types'

// ----------------------------------------------------------------------------
// Markdown-ish inline + block rendering (lightweight, dependency-free)
// ----------------------------------------------------------------------------

/** Render inline **bold**, *italic* and `code` spans within a line. */
function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  // Split on bold/italic/code tokens while keeping the delimiters.
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  const parts = text.split(re)
  parts.forEach((part, i) => {
    if (!part) return
    const key = `${keyBase}-${i}`
    if (part.startsWith('**') && part.endsWith('**')) {
      out.push(
        <strong key={key} className="font-semibold text-peak">
          {part.slice(2, -2)}
        </strong>,
      )
    } else if (part.startsWith('`') && part.endsWith('`')) {
      out.push(
        <code
          key={key}
          className="rounded bg-white/5 px-1 py-0.5 font-mono text-[0.85em] text-peak-primary-300"
        >
          {part.slice(1, -1)}
        </code>,
      )
    } else if (part.startsWith('*') && part.endsWith('*')) {
      out.push(
        <em key={key} className="italic text-peak">
          {part.slice(1, -1)}
        </em>,
      )
    } else {
      out.push(<React.Fragment key={key}>{part}</React.Fragment>)
    }
  })
  return out
}

/** Render a markdown-ish body string into headings / bullets / paragraphs. */
function MarkdownBody({ body }: { body: string }) {
  const lines = body.replace(/\r\n/g, '\n').split('\n')
  const blocks: React.ReactNode[] = []
  let bulletBuf: string[] = []
  let i = 0

  const flushBullets = () => {
    if (!bulletBuf.length) return
    const items = bulletBuf
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="my-3 space-y-1.5 pl-1">
        {items.map((b, bi) => (
          <li key={bi} className="flex gap-2.5 text-sm leading-relaxed text-peak-muted">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-peak-primary/70" />
            <span>{renderInline(b, `b-${blocks.length}-${bi}`)}</span>
          </li>
        ))}
      </ul>,
    )
    bulletBuf = []
  }

  for (; i < lines.length; i++) {
    const raw = lines[i]
    const line = raw.trim()
    if (!line) {
      flushBullets()
      continue
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line)
    if (h) {
      flushBullets()
      const level = h[1].length
      const content = h[2]
      const cls =
        level <= 1
          ? 'mt-5 mb-2 text-lg font-semibold text-peak'
          : level === 2
            ? 'mt-4 mb-2 text-base font-semibold text-peak'
            : 'mt-3 mb-1.5 text-sm font-semibold uppercase tracking-wide text-peak-muted'
      blocks.push(
        <div key={`h-${i}`} className={cls}>
          {renderInline(content, `h-${i}`)}
        </div>,
      )
      continue
    }
    if (/^[-*•]\s+/.test(line)) {
      bulletBuf.push(line.replace(/^[-*•]\s+/, ''))
      continue
    }
    if (/^\d+\.\s+/.test(line)) {
      // simple ordered item — fold into bullets for layout simplicity
      bulletBuf.push(line.replace(/^\d+\.\s+/, ''))
      continue
    }
    flushBullets()
    blocks.push(
      <p key={`p-${i}`} className="my-2.5 text-sm leading-relaxed text-peak-muted">
        {renderInline(line, `p-${i}`)}
      </p>,
    )
  }
  flushBullets()

  return <div className="create-prose">{blocks}</div>
}

// ----------------------------------------------------------------------------
// Metrics → StatTile
// ----------------------------------------------------------------------------

function trendTone(trend?: DocMetric['trend']): PeakTone {
  if (trend === 'up') return 'green'
  if (trend === 'down') return 'red'
  return 'primary'
}

function TrendIcon({ trend }: { trend?: DocMetric['trend'] }) {
  if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-peak-green" />
  if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-peak-red" />
  return <Minus className="h-3.5 w-3.5 text-peak-muted" />
}

function MetricRow({ metrics }: { metrics: DocMetric[] }) {
  return (
    <div className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {metrics.map((m, i) => (
        <StatTile
          key={`${m.label}-${i}`}
          variant="tile"
          tone={trendTone(m.trend)}
          value={m.value}
          label={m.label}
          sublabel={undefined}
          icon={
            m.delta ? (
              <span className="flex items-center gap-1 text-xs">
                <TrendIcon trend={m.trend} />
              </span>
            ) : undefined
          }
        />
      ))}
    </div>
  )
}

// ----------------------------------------------------------------------------
// Section
// ----------------------------------------------------------------------------

function SectionBlock({ section, index }: { section: ReportSection; index: number }) {
  return (
    <section className="create-section break-inside-avoid">
      <div className="mb-3 flex items-baseline gap-3">
        <span className="text-xs font-semibold tabular-nums text-peak-primary-300">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-peak">{section.heading}</h2>
      </div>

      {section.metrics?.length ? <MetricRow metrics={section.metrics} /> : null}

      {section.body ? <MarkdownBody body={section.body} /> : null}

      {section.bullets?.length ? (
        <ul className="mt-3 space-y-2 pl-1">
          {section.bullets.map((b, bi) => (
            <li
              key={bi}
              className="flex gap-2.5 text-sm leading-relaxed text-peak-muted"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-peak-primary/70" />
              <span>{renderInline(b, `sb-${index}-${bi}`)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

// ----------------------------------------------------------------------------
// Markdown serialization (for copy / download)
// ----------------------------------------------------------------------------

function metricsToMd(metrics?: DocMetric[]): string {
  if (!metrics?.length) return ''
  const head = '| Metric | Value | Change |\n| --- | --- | --- |\n'
  const rows = metrics
    .map((m) => `| ${m.label} | ${m.value} | ${m.delta ?? ''} |`)
    .join('\n')
  return `\n${head}${rows}\n`
}

function docToMarkdown(doc: ReportDoc): string {
  const lines: string[] = []
  lines.push(`# ${doc.title}`)
  if (doc.subtitle) lines.push(`\n_${doc.subtitle}_`)
  lines.push('')
  const meta: string[] = []
  if (doc.author) meta.push(`**Author:** ${doc.author}`)
  if (doc.company) meta.push(`**Company:** ${doc.company}`)
  if (doc.createdAt) meta.push(`**Created:** ${doc.createdAt}`)
  if (meta.length) lines.push(meta.join('  •  '), '')
  if (doc.sourceContext?.length) {
    lines.push(`> Sources: ${doc.sourceContext.join(', ')}`, '')
  }
  if (doc.executiveSummary) {
    lines.push('## Executive Summary', '', doc.executiveSummary, '')
  }
  doc.sections.forEach((s, i) => {
    lines.push(`## ${i + 1}. ${s.heading}`, '')
    if (s.metrics?.length) lines.push(metricsToMd(s.metrics))
    if (s.body) lines.push(s.body, '')
    if (s.bullets?.length) {
      s.bullets.forEach((b) => lines.push(`- ${b}`))
      lines.push('')
    }
  })
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

function safeFilename(title: string, ext: string): string {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'document'
  return `${base}.${ext}`
}

// ----------------------------------------------------------------------------
// Export menu
// ----------------------------------------------------------------------------

function ExportMenu({ doc }: { doc: ReportDoc }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handlePrint = () => {
    setOpen(false)
    if (typeof window !== 'undefined') window.print()
  }

  const handleCopy = async () => {
    setOpen(false)
    const md = docToMarkdown(doc)
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(md)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1800)
      }
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  const handleDownload = () => {
    setOpen(false)
    if (typeof window === 'undefined') return
    const md = docToMarkdown(doc)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = safeFilename(doc.title, 'md')
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative print:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl bg-peak-primary px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-peak-primary-600"
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown className="h-3.5 w-3.5 opacity-80" />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-peak-border bg-peak-panel shadow-peak">
            <button
              type="button"
              onClick={handlePrint}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-peak transition-colors hover:bg-peak-glass-hover"
            >
              <Printer className="h-4 w-4 text-peak-muted" />
              Print / Save as PDF
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-peak transition-colors hover:bg-peak-glass-hover"
            >
              {copied ? (
                <Check className="h-4 w-4 text-peak-green" />
              ) : (
                <Copy className="h-4 w-4 text-peak-muted" />
              )}
              {copied ? 'Copied!' : 'Copy as Markdown'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-peak transition-colors hover:bg-peak-glass-hover"
            >
              <Download className="h-4 w-4 text-peak-muted" />
              Download .md
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}

// ----------------------------------------------------------------------------
// Print stylesheet (scoped, light-on-white for clean PDFs)
// ----------------------------------------------------------------------------

const PRINT_CSS = `
@media print {
  @page { margin: 18mm 16mm; }
  body { background: #ffffff !important; }
  .peak-sidebar, .create-doc-actions, .create-export-bar,
  [data-no-print], nav, aside { display: none !important; }
  .create-doc-header { color: #0b0c14 !important; }
  .create-document-print {
    background: #ffffff !important;
    color: #15161f !important;
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
  }
  .create-document-print * { color: #1d1f2b !important; }
  .create-document-print h1,
  .create-document-print h2,
  .create-document-print strong { color: #0b0c14 !important; }
  .create-section { page-break-inside: avoid; }
  .break-inside-avoid { break-inside: avoid; }
}
`

// ----------------------------------------------------------------------------
// Main view
// ----------------------------------------------------------------------------

export interface DocumentViewProps {
  doc: ReportDoc
}

export default function DocumentView({ doc }: DocumentViewProps) {
  return (
    <>
      <style>{PRINT_CSS}</style>

      {/* Export bar — portals visually into the header action area on screen */}
      <div className="create-export-bar mb-4 flex items-center justify-end print:hidden">
        <ExportMenu doc={doc} />
      </div>

      <GlassPanel className="create-document-print mx-auto max-w-3xl !p-8 sm:!p-10">
        {/* Executive summary */}
        {doc.executiveSummary ? (
          <div className="mb-8 break-inside-avoid">
            <SectionLabel className="mb-2">Executive Summary</SectionLabel>
            <p className="text-[15px] leading-relaxed text-peak">
              {renderInline(doc.executiveSummary, 'exec')}
            </p>
            <div className="mt-6 h-px w-full bg-peak-border" />
          </div>
        ) : null}

        {/* Sections */}
        <div className="space-y-8">
          {doc.sections.map((section, i) => (
            <SectionBlock key={`${section.heading}-${i}`} section={section} index={i} />
          ))}
        </div>

        {/* Footer attribution */}
        <div className="mt-10 border-t border-peak-border pt-5 text-xs text-peak-dim">
          {doc.author ? <span>{doc.author}</span> : null}
          {doc.author && doc.company ? <span> · </span> : null}
          {doc.company ? <span>{doc.company}</span> : null}
          {doc.createdAt ? <span> · {doc.createdAt}</span> : null}
        </div>
      </GlassPanel>
    </>
  )
}
