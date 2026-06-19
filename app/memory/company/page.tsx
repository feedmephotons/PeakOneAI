'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Search,
  Plus,
  ChevronDown,
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

// ----------------------------------------------------------------------------
// Static mock content (mirrors the Company Brain mockup)
// ----------------------------------------------------------------------------

interface Stat {
  label: string
  value: string
  delta: string
  icon: React.ComponentType<{ className?: string }>
}

const STATS: Stat[] = [
  { label: 'Documents', value: '1,247', delta: '+ 23 this month', icon: FileText },
  { label: 'Knowledge Items', value: '2,842', delta: '+ 45 this month', icon: Layers },
  { label: 'Contributors', value: '128', delta: '+ 8 this month', icon: Users },
  { label: 'Views (30d)', value: '12.6K', delta: '+ 18%', icon: Eye },
  { label: 'Searches (30d)', value: '3,421', delta: '+ 21%', icon: Search },
]

interface Category {
  title: string
  icon: React.ComponentType<{ className?: string }>
  tint: string
  bg: string
  documents: number
  updated: string
}

const CATEGORIES: Category[] = [
  { title: 'Strategy & Vision', icon: Compass, tint: 'text-peak-primary-300', bg: 'bg-peak-primary/15', documents: 24, updated: 'Updated 2d ago' },
  { title: 'Policies & Procedures', icon: ShieldCheck, tint: 'text-peak-blue', bg: 'bg-peak-blue/15', documents: 87, updated: 'Updated 5d ago' },
  { title: 'Product & Engineering', icon: Box, tint: 'text-peak-primary-300', bg: 'bg-peak-primary/15', documents: 156, updated: 'Updated 1h ago' },
  { title: 'Sales & Marketing', icon: Megaphone, tint: 'text-peak-amber', bg: 'bg-peak-amber/15', documents: 89, updated: 'Updated 3h ago' },
  { title: 'Finance & Legal', icon: Scale, tint: 'text-peak-green', bg: 'bg-peak-green/15', documents: 64, updated: 'Updated 1d ago' },
  { title: 'People & Culture', icon: Users, tint: 'text-peak-red', bg: 'bg-peak-red/15', documents: 43, updated: 'Updated 4d ago' },
]

interface RecentItem {
  title: string
  author: string
  time: string
  tag: string
  tagTone: string
}

const RECENTLY_UPDATED: RecentItem[] = [
  { title: 'Q2 OKR Document', author: 'Mike Wilson', time: '2h ago', tag: 'Strategy', tagTone: 'bg-peak-primary/15 text-peak-primary-300' },
  { title: 'Remote Work Policy', author: 'HR Team', time: '5h ago', tag: 'HR', tagTone: 'bg-peak-blue/15 text-peak-blue' },
  { title: 'Product Roadmap 2025', author: 'Product Team', time: '8h ago', tag: 'Product', tagTone: 'bg-peak-primary/15 text-peak-primary-300' },
  { title: 'Security Guidelines v2.1', author: 'IT Team', time: '1d ago', tag: 'Security', tagTone: 'bg-peak-green/15 text-peak-green' },
  { title: 'Sales Playbook', author: 'Emily Chen', time: '1d ago', tag: 'Sales', tagTone: 'bg-peak-amber/15 text-peak-amber' },
]

interface PopularItem {
  title: string
  category: string
  views: string
}

const POPULAR: PopularItem[] = [
  { title: 'Employee Handbook', category: 'People & Culture', views: '2.2K' },
  { title: 'Code of Conduct', category: 'Policies & Procedures', views: '1.8K' },
  { title: 'Q1 Financial Report', category: 'Finance & Legal', views: '1.5K' },
  { title: 'Product Strategy', category: 'Strategy & Vision', views: '1.3K' },
  { title: 'All Hands Presentation', category: 'Strategy & Vision', views: '1.1K' },
]

const SUGGESTED_QUESTIONS = [
  'What are our Q2 priorities?',
  'Show me the latest product updates',
  'Find sales playbook',
  "What's our remote work policy?",
]

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
            onClick={() => router.push('/files')}
            className="order-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-peak-primary to-peak-primary-600 px-5 py-3 text-sm font-medium text-white shadow-[0_0_24px_-6px_var(--peak-glow)] transition-all hover:brightness-110 lg:order-3"
          >
            <Plus className="h-4 w-4" />
            New Document
            <ChevronDown className="h-4 w-4 opacity-80" />
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
                {CATEGORIES.map((c) => {
                  const Icon = c.icon
                  return (
                    <button
                      key={c.title}
                      onClick={() => router.push('/memory?category=' + encodeURIComponent(c.title))}
                      className="group flex flex-col rounded-2xl border border-peak-border bg-white/[0.02] p-4 text-left transition-all hover:border-peak-primary/30 hover:bg-white/[0.04]"
                    >
                      <span className={['mb-4 flex h-10 w-10 items-center justify-center rounded-xl', c.bg, c.tint].join(' ')}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-semibold text-peak">{c.title}</span>
                      <span className="mt-3 text-xs text-peak-muted">{c.documents} documents</span>
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
                  {RECENTLY_UPDATED.map((it) => (
                    <li key={it.title}>
                      <button
                        onClick={() => router.push('/files')}
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
                        <span className={['shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium', it.tagTone].join(' ')}>
                          {it.tag}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push('/files')}
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
                  {POPULAR.map((it) => (
                    <li key={it.title}>
                      <button
                        onClick={() => router.push('/files')}
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
                          {it.views}
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
