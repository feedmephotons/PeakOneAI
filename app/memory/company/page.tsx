'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Search,
  Plus,
  ArrowRight,
  Send,
  FileText,
  Compass,
  ShieldCheck,
  Box,
  Megaphone,
  Scale,
  Users,
  FileBox,
  Layers,
  Eye,
  Brain,
} from 'lucide-react'
import {
  MOCK_NOTES,
  MOCK_FILES,
  MOCK_TEAM,
  ACME_TEAM_SIZE,
} from '@/lib/peak/mock'
import type { Note } from '@/lib/peak/types'

// ----------------------------------------------------------------------------
// Derived content — driven entirely by the canonical Acme Corp fixtures
// ----------------------------------------------------------------------------

const PEAK_NOW = Date.parse('2026-06-18T09:00:00.000Z')

function relativeTime(iso: string): string {
  const diff = PEAK_NOW - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 60) return `${Math.max(1, mins)}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  return days === 1 ? '1d ago' : `${days}d ago`
}

interface Stat {
  label: string
  value: string
  delta: string
  icon: React.ComponentType<{ className?: string }>
}

// Real counts from the fixtures (notes, files, team) rather than invented numbers.
const noteCount = MOCK_NOTES.length
const fileCount = MOCK_FILES.filter((f) => !f.deleted).length
const knowledgeItems = noteCount + fileCount
const connectionCount = MOCK_NOTES.reduce((s, n) => s + (n.connectionCount ?? 0), 0)

const STATS: Stat[] = [
  { label: 'Documents', value: String(fileCount), delta: 'Across all missions', icon: FileText },
  { label: 'Knowledge Items', value: String(knowledgeItems), delta: `${noteCount} notes · ${fileCount} files`, icon: Layers },
  { label: 'Contributors', value: String(ACME_TEAM_SIZE), delta: 'Acme Corp team', icon: Users },
  { label: 'Connections', value: String(connectionCount), delta: 'Auto-linked by Lisa', icon: Eye },
  { label: 'Brains', value: '3', delta: 'My · Team · Company', icon: Brain },
]

interface Category {
  title: string
  /** Tag used to filter /memory. */
  tag: string
  icon: React.ComponentType<{ className?: string }>
  tint: string
  bg: string
}

// Categories map to real note tags so the deep-link actually filters /memory.
const CATEGORY_DEFS: Category[] = [
  { title: 'Strategy', tag: 'strategy', icon: Compass, tint: 'text-peak-primary-300', bg: 'bg-peak-primary/15' },
  { title: 'Launch', tag: 'launch', icon: Box, tint: 'text-peak-primary-300', bg: 'bg-peak-primary/15' },
  { title: 'Marketing', tag: 'marketing', icon: Megaphone, tint: 'text-peak-amber', bg: 'bg-peak-amber/15' },
  { title: 'Pricing & Research', tag: 'research', icon: Scale, tint: 'text-peak-green', bg: 'bg-peak-green/15' },
  { title: 'Partnership', tag: 'partnership', icon: ShieldCheck, tint: 'text-peak-blue', bg: 'bg-peak-blue/15' },
  { title: 'Product', tag: 'product-x', icon: Users, tint: 'text-peak-red', bg: 'bg-peak-red/15' },
]

const SUGGESTED_QUESTIONS = [
  'What are our Q2 priorities?',
  'Summarize the Product Launch Plan',
  'What did the pricing research recommend?',
  'What is the BrightPath partnership decision?',
]

// Tag → pill tone for the Recently Updated list.
const TAG_TONE: Record<string, string> = {
  strategy: 'bg-peak-primary/15 text-peak-primary-300',
  launch: 'bg-peak-primary/15 text-peak-primary-300',
  marketing: 'bg-peak-amber/15 text-peak-amber',
  research: 'bg-peak-green/15 text-peak-green',
  pricing: 'bg-peak-green/15 text-peak-green',
  partnership: 'bg-peak-blue/15 text-peak-blue',
  decision: 'bg-peak-blue/15 text-peak-blue',
}

function tagTone(tag?: string): string {
  return (tag && TAG_TONE[tag]) || 'bg-white/[0.06] text-peak-muted'
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default function CompanyBrainPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [ask, setAsk] = useState('')

  const askLisa = (value: string) => {
    const q = value.trim()
    if (!q) return
    router.push('/lisa?q=' + encodeURIComponent(q))
  }

  // --- Derived category cards: real doc counts + last-updated per tag -------
  const categories = useMemo(() => {
    return CATEGORY_DEFS.map((c) => {
      const matches = MOCK_NOTES.filter((n) => n.tags.includes(c.tag))
      const docs = matches.length
      const latest = matches.reduce<string | null>(
        (acc, n) => (!acc || new Date(n.updatedAt) > new Date(acc) ? n.updatedAt : acc),
        null,
      )
      return { ...c, documents: docs, updated: latest ? `Updated ${relativeTime(latest)}` : 'No documents yet' }
    })
  }, [])

  // --- Recently updated: notes sorted by updatedAt -------------------------
  const recentlyUpdated = useMemo(() => {
    return [...MOCK_NOTES]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map((n: Note) => ({
        id: n.id,
        title: n.title,
        author: n.author?.name ?? MOCK_TEAM[0].name,
        time: relativeTime(n.updatedAt),
        tag: n.tags[0] ?? 'note',
      }))
  }, [])

  // --- Popular knowledge: files with AI summaries -------------------------
  const popular = useMemo(() => {
    return MOCK_FILES.filter((f) => !f.deleted)
      .slice(0, 5)
      .map((f) => ({
        id: f.id,
        title: f.name,
        category: f.owner.name,
        meta: f.sizeLabel,
      }))
  }, [])

  return (
    <div className="peak-os min-h-screen">
      <div className="mx-auto max-w-[1500px] px-6 py-8 sm:px-10">
        {/* ============================================================= */}
        {/* Header                                                         */}
        {/* ============================================================= */}
        <header className="mb-8 flex flex-wrap items-start gap-5">
          <div className="mr-auto">
            <h1 className="flex items-center gap-3 text-4xl font-semibold tracking-tight text-peak">
              Company Brain
              <Sparkles className="h-7 w-7 text-peak-primary-300" />
            </h1>
            <p className="mt-1 text-sm text-peak-muted">
              Institutional knowledge. Organized. Secure. Always accessible.
            </p>
            <Link
              href="/memory"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-peak-primary-300 hover:text-peak-primary"
            >
              <Brain className="h-3.5 w-3.5" />
              Back to My Brain
            </Link>
          </div>

          <div className="order-3 w-full lg:order-2 lg:w-auto lg:flex-1 lg:max-w-md">
            <div className="flex items-center gap-2.5 rounded-xl border border-peak-border bg-white/[0.03] px-4 py-3 focus-within:border-peak-primary/40">
              <Search className="h-4 w-4 shrink-0 text-peak-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') askLisa(search)
                }}
                placeholder="Search company knowledge..."
                className="w-full bg-transparent text-sm text-peak placeholder:text-peak-muted focus:outline-none"
              />
              <kbd className="hidden shrink-0 rounded border border-peak-border bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-peak-dim sm:inline">
                ⌘ K
              </kbd>
            </div>
          </div>

          <button
            onClick={() => router.push('/memory')}
            className="order-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-peak-primary to-peak-primary-600 px-5 py-3 text-sm font-medium text-white shadow-[0_0_24px_-6px_var(--peak-glow)] transition-all hover:brightness-110 lg:order-3"
          >
            <Plus className="h-4 w-4" />
            New Document
          </button>
        </header>

        {/* Two-column: main + right rail */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* ----------------------------------------------------------- */}
          {/* MAIN                                                         */}
          {/* ----------------------------------------------------------- */}
          <div className="min-w-0 space-y-6">
            {/* Stat row */}
            <div className="peak-glass grid grid-cols-2 divide-peak-border px-2 py-5 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x">
              {STATS.map((s) => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="px-4 py-2">
                    <div className="mb-2 flex items-center gap-2 text-peak-muted">
                      <Icon className="h-4 w-4 text-peak-primary-300" />
                      <span className="text-xs">{s.label}</span>
                    </div>
                    <div className="text-3xl font-semibold tracking-tight text-peak">{s.value}</div>
                    <div className="mt-1 text-xs font-medium text-peak-primary-300">{s.delta}</div>
                  </div>
                )
              })}
            </div>

            {/* Knowledge Categories */}
            <div className="peak-glass p-6">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-peak">Knowledge Categories</h2>
                <button
                  onClick={() => router.push('/memory')}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-peak-primary-300 hover:text-peak-primary"
                >
                  View all categories
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mb-5 text-sm text-peak-muted">Curated knowledge across the organization</p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {categories.map((c) => {
                  const Icon = c.icon
                  return (
                    <button
                      key={c.title}
                      onClick={() => router.push('/memory?category=' + encodeURIComponent(c.tag))}
                      className="group flex flex-col rounded-2xl border border-peak-border bg-white/[0.02] p-4 text-left transition-all hover:border-peak-primary/30 hover:bg-white/[0.04]"
                    >
                      <span className={['mb-4 flex h-10 w-10 items-center justify-center rounded-xl', c.bg, c.tint].join(' ')}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-semibold text-peak">{c.title}</span>
                      <span className="mt-3 text-xs text-peak-muted">
                        {c.documents} {c.documents === 1 ? 'document' : 'documents'}
                      </span>
                      <span className="mt-0.5 text-[11px] text-peak-dim">{c.updated}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Recently Updated + Popular Knowledge */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Recently Updated */}
              <div className="peak-glass p-6">
                <h2 className="text-lg font-semibold text-peak">Recently Updated</h2>
                <p className="mb-4 text-sm text-peak-muted">The latest knowledge, always up to date</p>
                <ul className="space-y-1">
                  {recentlyUpdated.map((it) => (
                    <li key={it.id}>
                      <button
                        onClick={() => router.push('/memory?note=' + encodeURIComponent(it.id))}
                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-peak-primary-300">
                          <FileText className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-peak">{it.title}</span>
                          <span className="block truncate text-xs text-peak-muted">{it.author}</span>
                        </span>
                        <span className="shrink-0 text-xs text-peak-dim">{it.time}</span>
                        <span className={['shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium', tagTone(it.tag)].join(' ')}>
                          {titleCase(it.tag)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push('/memory')}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-peak-primary-300 hover:text-peak-primary"
                >
                  View all updates
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Popular Knowledge */}
              <div className="peak-glass p-6">
                <h2 className="text-lg font-semibold text-peak">Popular Knowledge</h2>
                <p className="mb-4 text-sm text-peak-muted">Most accessed by your team</p>
                <ul className="space-y-1">
                  {popular.map((it) => (
                    <li key={it.id}>
                      <button
                        onClick={() => router.push('/files?file=' + encodeURIComponent(it.id))}
                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-peak-muted">
                          <FileBox className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-peak">{it.title}</span>
                          <span className="block truncate text-xs text-peak-muted">{it.category}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5 text-xs text-peak-dim">
                          <Eye className="h-3.5 w-3.5" />
                          {it.meta}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push('/files')}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-peak-primary-300 hover:text-peak-primary"
                >
                  View all popular
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* RIGHT RAIL                                                   */}
          {/* ----------------------------------------------------------- */}
          <aside className="space-y-6">
            {/* AI Assistant */}
            <div className="relative overflow-hidden rounded-2xl border border-peak-primary/20 bg-peak-primary/[0.06] p-5 backdrop-blur-xl">
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-peak-primary/20 blur-2xl" />
              <div className="relative">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-peak-primary/20 text-peak-primary-300">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <span className="text-base font-semibold text-peak">AI Assistant</span>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-peak-muted">
                  Lisa is here to help you find information, answer questions, and connect the dots.
                </p>

                <div className="mb-4 flex items-center gap-2 rounded-xl border border-peak-border bg-white/[0.04] px-3 py-2.5">
                  <Search className="h-4 w-4 shrink-0 text-peak-muted" />
                  <input
                    value={ask}
                    onChange={(e) => setAsk(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') askLisa(ask)
                    }}
                    placeholder="Ask anything about your company..."
                    className="w-full bg-transparent text-sm text-peak placeholder:text-peak-muted focus:outline-none"
                  />
                  <button
                    onClick={() => askLisa(ask)}
                    aria-label="Ask Lisa"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-peak-primary text-white transition-all hover:brightness-110"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mb-2 text-xs font-medium text-peak-muted">Suggested for you</div>
                <ul className="space-y-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <li key={q}>
                      <button
                        onClick={() => askLisa(q)}
                        className="flex w-full items-center gap-2.5 rounded-lg border border-peak-border bg-white/[0.02] px-3 py-2 text-left text-sm text-peak-muted transition-colors hover:bg-white/[0.05] hover:text-peak"
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0 text-peak-dim" />
                        <span className="truncate">{q}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  aria-disabled="true"
                  disabled
                  className="mt-3 inline-flex cursor-default items-center gap-1.5 text-sm font-medium text-peak-primary-300 opacity-50"
                >
                  View more suggestions
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Knowledge Graph */}
            <div className="peak-glass p-5">
              <h3 className="text-base font-semibold text-peak">Knowledge Graph</h3>
              <p className="mb-4 text-sm text-peak-muted">
                See how knowledge connects across your organization.
              </p>
              <KnowledgeGraph />
              <button
                onClick={() => router.push('/memory')}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-peak-primary-300 hover:text-peak-primary"
              >
                Explore graph
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Integrations */}
            <div className="peak-glass p-5">
              <h3 className="text-base font-semibold text-peak">Integrations</h3>
              <p className="mb-4 text-sm text-peak-muted">
                Connect your tools and bring all knowledge into one place.
              </p>
              <div className="flex items-center gap-2.5">
                {['G', 'S', 'N', 'F'].map((letter) => (
                  <span
                    key={letter}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-peak-border bg-white/[0.04] text-sm font-semibold text-peak-muted"
                  >
                    {letter}
                  </span>
                ))}
                <button
                  type="button"
                  aria-disabled="true"
                  disabled
                  aria-label="Add integration (coming soon)"
                  className="flex h-10 w-10 cursor-default items-center justify-center rounded-xl border border-dashed border-peak-border text-peak-muted opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                aria-disabled="true"
                disabled
                className="mt-4 inline-flex cursor-default items-center gap-1.5 text-sm font-medium text-peak-primary-300 opacity-50"
              >
                Manage integrations
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// CSS / SVG knowledge graph placeholder (nodes + edges)
// ----------------------------------------------------------------------------

function KnowledgeGraph() {
  const nodes = [
    { x: 20, y: 70 },
    { x: 95, y: 40 },
    { x: 130, y: 95 },
    { x: 175, y: 55 },
    { x: 230, y: 35 },
    { x: 250, y: 100 },
    { x: 290, y: 70 },
    { x: 60, y: 120 },
  ]
  const edges = [
    [0, 1],
    [1, 2],
    [1, 3],
    [3, 4],
    [3, 5],
    [4, 6],
    [5, 6],
    [0, 7],
    [2, 7],
    [2, 5],
  ]
  return (
    <div className="relative h-40 overflow-hidden rounded-xl border border-peak-border bg-peak-panel/60">
      <div className="absolute inset-0 bg-[radial-gradient(80%_120%_at_50%_50%,rgba(139,92,246,0.12),transparent_70%)]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 310 150" preserveAspectRatio="xMidYMid meet">
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="rgba(196,181,253,0.3)"
            strokeWidth="1"
          />
        ))}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="9" fill="rgba(139,92,246,0.18)" />
            <circle cx={n.x} cy={n.y} r="4.5" fill="#a78bfa" />
          </g>
        ))}
      </svg>
    </div>
  )
}
