'use client'

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  PeakShell,
  GlassPanel,
  SectionLabel,
  AskLisaBar,
} from '@/components/peak'
import { CREATE_TEMPLATES, getTemplate } from '@/lib/peak/create-mock'
import { saveDoc, listDocs } from '@/lib/peak/create-store'
import type {
  CreateTemplate,
  DocType,
  DocumentSpec,
  GenerateResponse,
} from '@/lib/peak/create-types'
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Clock,
  // template / type icons
  FileText,
  Table,
  Presentation,
  LayoutDashboard,
  FileSignature,
  TrendingUp,
  LineChart,
  Rocket,
  ClipboardCheck,
  Users,
  BarChart3,
  Share2,
  CalendarRange,
  Calculator,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ----------------------------------------------------------------------------
// Icon resolution (lucide name string → component) — keeps mock data declarative
// ----------------------------------------------------------------------------

const ICONS: Record<string, LucideIcon> = {
  FileText,
  Table,
  Presentation,
  LayoutDashboard,
  FileSignature,
  TrendingUp,
  LineChart,
  Rocket,
  ClipboardCheck,
  Users,
  BarChart3,
  Share2,
  CalendarRange,
  Calculator,
  Sparkles,
}

function iconFor(name: string): LucideIcon {
  return ICONS[name] || FileText
}

// ----------------------------------------------------------------------------
// Document types → chips + per-type presentation
// ----------------------------------------------------------------------------

interface TypeChip {
  type: DocType
  label: string
  icon: LucideIcon
}

const TYPE_CHIPS: TypeChip[] = [
  { type: 'report', label: 'Report', icon: FileText },
  { type: 'spreadsheet', label: 'Spreadsheet', icon: Table },
  { type: 'presentation', label: 'Presentation', icon: Presentation },
  { type: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { type: 'proposal', label: 'Proposal', icon: FileSignature },
]

const TYPE_LABEL: Record<DocType, string> = {
  report: 'Report',
  proposal: 'Proposal',
  summary: 'Summary',
  spreadsheet: 'Spreadsheet',
  presentation: 'Presentation',
  dashboard: 'Dashboard',
}

const TYPE_ICON: Record<DocType, LucideIcon> = {
  report: FileText,
  proposal: FileSignature,
  summary: FileText,
  spreadsheet: Table,
  presentation: Presentation,
  dashboard: LayoutDashboard,
}

// ----------------------------------------------------------------------------
// Template gallery grouping (by output category)
// ----------------------------------------------------------------------------

interface TemplateGroup {
  label: string
  match: (t: CreateTemplate) => boolean
}

const TEMPLATE_GROUPS: TemplateGroup[] = [
  { label: 'Reports & Summaries', match: (t) => t.type === 'report' || t.type === 'summary' },
  { label: 'Presentations', match: (t) => t.type === 'presentation' },
  { label: 'Spreadsheets', match: (t) => t.type === 'spreadsheet' },
  { label: 'Dashboards', match: (t) => t.type === 'dashboard' },
  { label: 'Proposals', match: (t) => t.type === 'proposal' },
]

function groupedTemplates(): Array<{ label: string; items: CreateTemplate[] }> {
  const used = new Set<string>()
  const groups: Array<{ label: string; items: CreateTemplate[] }> = []
  for (const g of TEMPLATE_GROUPS) {
    const items = CREATE_TEMPLATES.filter((t) => !used.has(t.id) && g.match(t))
    items.forEach((t) => used.add(t.id))
    if (items.length) groups.push({ label: g.label, items })
  }
  const leftover = CREATE_TEMPLATES.filter((t) => !used.has(t.id))
  if (leftover.length) groups.push({ label: 'More', items: leftover })
  return groups
}

// ----------------------------------------------------------------------------
// Recent docs date formatting (deterministic UTC; only runs client-side)
// ----------------------------------------------------------------------------

function formatRelative(iso?: string): string {
  if (!iso) return ''
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return ''
  return new Date(t).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// ----------------------------------------------------------------------------
// Studio (inner — reads search params, so it lives under a Suspense boundary)
// ----------------------------------------------------------------------------

function CreateStudio() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [prompt, setPrompt] = useState('')
  const [activeType, setActiveType] = useState<DocType | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [recents, setRecents] = useState<DocumentSpec[]>([])

  const groups = useMemo(() => groupedTemplates(), [])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Guard so an auto-generate from query params only fires once.
  const autoFiredRef = useRef(false)

  // Load recent documents from the store (client-only, SSR-safe).
  const refreshRecents = useCallback(() => {
    setRecents(listDocs())
  }, [])

  useEffect(() => {
    refreshRecents()
  }, [refreshRecents])

  /**
   * Generate a document, persist it, and route to the viewer.
   * Accepts an explicit template/type/prompt so callers (form submit, template
   * card, query-param auto-run) all funnel through one path.
   */
  const generate = useCallback(
    async (opts: { templateId?: string; type?: DocType | null; prompt: string; label: string }) => {
      const trimmed = opts.prompt.trim()
      if (!trimmed || loading) return

      setLoading(true)
      setLoadingLabel(opts.label)
      setError(null)

      try {
        const res = await fetch('/api/create/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: opts.templateId,
            type: opts.type || undefined,
            prompt: trimmed,
          }),
        })

        if (!res.ok) throw new Error(`Generation failed (${res.status})`)
        const data = (await res.json()) as GenerateResponse
        if (!data?.doc) throw new Error('No document returned')

        // Stamp a fresh, unique id + real timestamp at persist time. The mock /
        // engine may return a stable seeded id + fixed timestamp (SSR-safety);
        // we own identity on save so saved docs never collide.
        const doc: DocumentSpec = {
          ...data.doc,
          id: `doc-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
          createdAt: new Date().toISOString(),
        }

        saveDoc(doc)
        router.push(`/create/${doc.id}`)
      } catch (e) {
        setLoading(false)
        setLoadingLabel('')
        setError(
          e instanceof Error
            ? `Couldn't create that just now — ${e.message}. Try again.`
            : "Couldn't create that just now. Try again.",
        )
      }
    },
    [loading, router],
  )

  // ---- Query params: ?template= (auto-generate) / ?prompt= (auto-fill or run)
  useEffect(() => {
    if (autoFiredRef.current) return
    const templateId = searchParams.get('template')
    const qPrompt = searchParams.get('prompt')

    if (templateId) {
      const tpl = getTemplate(templateId)
      if (tpl) {
        autoFiredRef.current = true
        void generate({
          templateId: tpl.id,
          type: tpl.type,
          prompt: qPrompt || tpl.prompt,
          label: tpl.label,
        })
        return
      }
    }

    if (qPrompt) {
      autoFiredRef.current = true
      // A bare prompt auto-fills the hero and kicks off generation.
      setPrompt(qPrompt)
      void generate({ prompt: qPrompt, type: null, label: 'your document' })
    }
    // We intentionally run this once on mount; generate is stable for our use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) {
      textareaRef.current?.focus()
      return
    }
    const label = activeType ? `your ${TYPE_LABEL[activeType].toLowerCase()}` : 'your document'
    void generate({ type: activeType, prompt, label })
  }

  const onPickTemplate = (tpl: CreateTemplate) => {
    void generate({
      templateId: tpl.id,
      type: tpl.type,
      prompt: tpl.prompt,
      label: tpl.label,
    })
  }

  return (
    <PeakShell>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-peak-muted">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-peak-primary/15 text-peak-primary-300">
              <Sparkles className="h-3 w-3" />
            </span>
            Create Studio
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-peak sm:text-5xl">
            What would you like to{' '}
            <span className="text-peak-primary-300">create</span>?
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-peak-muted">
            Describe it in plain language. P1 turns everything it already knows about
            your company into a polished, board-ready document.
          </p>
        </div>

        <div className="hidden w-64 shrink-0 lg:block">
          <AskLisaBar placeholder="Ask Lisa to create…" />
        </div>
      </div>

      {/* Hero input */}
      <GlassPanel glow className="mb-3 p-5 sm:p-6">
        <form onSubmit={onSubmit}>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                onSubmit(e as unknown as React.FormEvent)
              }
            }}
            disabled={loading}
            rows={3}
            placeholder="e.g. Build me a Q2 sales report · Create a board deck · Generate a 12-month financial forecast · Make a marketing dashboard"
            className="w-full resize-none bg-transparent text-lg leading-relaxed text-peak placeholder:text-peak-dim focus:outline-none disabled:opacity-60"
          />

          <div className="mt-4 flex flex-col gap-4 border-t border-peak-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Type chips */}
            <div className="flex flex-wrap items-center gap-2">
              {TYPE_CHIPS.map((chip) => {
                const Icon = chip.icon
                const active = activeType === chip.type
                return (
                  <button
                    key={chip.type}
                    type="button"
                    disabled={loading}
                    onClick={() => setActiveType(active ? null : chip.type)}
                    aria-pressed={active}
                    className={[
                      'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60',
                      active
                        ? 'bg-peak-primary/20 text-peak-primary-300 ring-1 ring-peak-primary/40'
                        : 'bg-white/[0.04] text-peak-muted ring-1 ring-peak-border hover:bg-white/[0.07] hover:text-peak',
                    ].join(' ')}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {chip.label}
                  </button>
                )
              })}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-peak-primary px-5 py-2.5 text-sm font-semibold text-white shadow-peak-glow transition-colors hover:bg-peak-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </GlassPanel>

      {/* Provenance line */}
      <div className="mb-2 flex items-center gap-2 px-1 text-xs text-peak-dim">
        <Sparkles className="h-3 w-3 text-peak-primary-300" />
        <span>
          Powered by P1 Memory · Lisa · Operators — grounded in your company knowledge
        </span>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-peak-red/30 bg-peak-red/10 px-4 py-3 text-sm text-peak-red">
          {error}
        </div>
      ) : (
        <div className="mb-6" />
      )}

      {/* Loading overlay banner during generation */}
      {loading ? (
        <GlassPanel className="mb-8 flex items-center gap-3 p-4">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-peak-primary-300" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-peak">
              Creating {loadingLabel || 'your document'}…
            </div>
            <div className="text-xs text-peak-muted">
              Gathering company context, generating, and formatting.
            </div>
          </div>
        </GlassPanel>
      ) : null}

      {/* Recent documents */}
      {recents.length > 0 ? (
        <section className="mb-10">
          <SectionLabel className="mb-4">Recent documents</SectionLabel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recents.slice(0, 6).map((doc) => {
              const Icon = TYPE_ICON[doc.type]
              return (
                <Link key={doc.id} href={`/create/${doc.id}`} className="group block focus:outline-none">
                  <GlassPanel className="peak-glass-hover flex items-start gap-3 p-4 transition-all duration-200 group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-peak-primary/40">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/20">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-peak transition-colors group-hover:text-peak-primary-300">
                        {doc.title}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-peak-muted">
                        <span className="capitalize">{TYPE_LABEL[doc.type]}</span>
                        {doc.createdAt ? (
                          <>
                            <span className="text-peak-dim">·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-peak-dim" />
                              {formatRelative(doc.createdAt)}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </GlassPanel>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      {/* Template gallery */}
      <section>
        <SectionLabel className="mb-4">Start from a template</SectionLabel>
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="mb-3 text-xs font-medium uppercase tracking-wider text-peak-dim">
                {group.label}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((tpl) => {
                  const Icon = iconFor(tpl.icon)
                  return (
                    <GlassPanel
                      key={tpl.id}
                      as="button"
                      onClick={() => onPickTemplate(tpl)}
                      className={[
                        'peak-glass-hover group h-full p-5 text-left transition-all duration-200 hover:-translate-y-0.5',
                        loading ? 'pointer-events-none opacity-60' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <div className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/20 transition-colors group-hover:bg-peak-primary/25">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="truncate text-sm font-semibold text-peak transition-colors group-hover:text-peak-primary-300">
                              {tpl.label}
                            </h3>
                            <ArrowRight className="h-4 w-4 shrink-0 text-peak-dim opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                          </div>
                          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-peak-muted">
                            {tpl.description}
                          </p>
                        </div>
                      </div>
                    </GlassPanel>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PeakShell>
  )
}

// ----------------------------------------------------------------------------
// Page (Suspense boundary required for useSearchParams in Next 15)
// ----------------------------------------------------------------------------

function StudioFallback() {
  return (
    <PeakShell>
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-3 text-peak-muted">
          <Loader2 className="h-5 w-5 animate-spin text-peak-primary-300" />
          <span className="text-sm">Loading Create Studio…</span>
        </div>
      </div>
    </PeakShell>
  )
}

export default function CreatePage() {
  return (
    <Suspense fallback={<StudioFallback />}>
      <CreateStudio />
    </Suspense>
  )
}
