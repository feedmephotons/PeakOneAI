'use client'

/**
 * Peak One — Create Studio document viewer.
 *
 * Loads a generated document from the local store (falling back to a rich mock
 * when the id isn't found locally — e.g. a fresh tab / SSR) and renders the
 * right view by `doc.type`. Header carries the title/subtitle, a Sources chip
 * row (where P1 pulled the grounding from), a Regenerate action (re-POSTs the
 * generate endpoint and re-saves), and an Export menu owned by each view.
 *
 * SSR-safe: no Date.now()/Math.random in the render path; localStorage reads are
 * guarded inside the store. If nothing resolves, we redirect back to /create.
 */

import React, { use, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  RefreshCw,
  Database,
  Sparkles,
  Loader2,
  FileText,
  Table2,
  Presentation as PresentationIcon,
  LayoutDashboard,
} from 'lucide-react'

import { PeakShell, GlassPanel } from '@/components/peak'
import { getDoc, saveDoc } from '@/lib/peak/create-store'
import { getMockDocument } from '@/lib/peak/create-mock'
import type { DocumentSpec, GenerateResponse } from '@/lib/peak/create-types'

import DocumentView from '@/components/create/DocumentView'
import SpreadsheetView from '@/components/create/SpreadsheetView'
import DeckView from '@/components/create/DeckView'
import DashboardView from '@/components/create/DashboardView'

// ----------------------------------------------------------------------------

const TYPE_ICON: Record<DocumentSpec['type'], React.ReactNode> = {
  report: <FileText className="h-4 w-4" />,
  proposal: <FileText className="h-4 w-4" />,
  summary: <FileText className="h-4 w-4" />,
  spreadsheet: <Table2 className="h-4 w-4" />,
  presentation: <PresentationIcon className="h-4 w-4" />,
  dashboard: <LayoutDashboard className="h-4 w-4" />,
}

const TYPE_LABEL: Record<DocumentSpec['type'], string> = {
  report: 'Report',
  proposal: 'Proposal',
  summary: 'Summary',
  spreadsheet: 'Spreadsheet',
  presentation: 'Presentation',
  dashboard: 'Dashboard',
}

export default function CreateViewerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [doc, setDoc] = useState<DocumentSpec | null>(null)
  const [resolved, setResolved] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  // Track whether the loaded doc was a real stored doc (vs. mock fallback) so a
  // 404 can redirect instead of silently showing a mock for a bad id.
  const fromStore = useRef(false)

  // Resolve the doc client-side (store is localStorage-backed).
  useEffect(() => {
    const stored = getDoc(id)
    if (stored) {
      fromStore.current = true
      setDoc(stored)
      setResolved(true)
      return
    }
    // Not in the store. If the id looks like a template/type seed we can show a
    // rich mock; otherwise treat as not-found and bounce to the studio.
    const seed = getMockDocument(id)
    if (seed) {
      fromStore.current = false
      setDoc(seed)
      setResolved(true)
      return
    }
    setResolved(true)
    router.replace('/create')
  }, [id, router])

  const handleRegenerate = async () => {
    if (!doc || regenerating) return
    setRegenerating(true)
    try {
      const res = await fetch('/api/create/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: doc.type, prompt: doc.subtitle || doc.title }),
      })
      const data = (await res.json()) as GenerateResponse
      // Preserve the stable id + provenance so the URL/store entry stays valid.
      const next: DocumentSpec = {
        ...data.doc,
        id: doc.id,
        createdAt: doc.createdAt,
        sourceContext:
          data.doc.sourceContext?.length ? data.doc.sourceContext : doc.sourceContext,
      } as DocumentSpec
      saveDoc(next)
      fromStore.current = true
      setDoc(next)
    } catch {
      /* keep the existing doc on failure — never break the view */
    } finally {
      setRegenerating(false)
    }
  }

  const sources = useMemo(() => doc?.sourceContext ?? [], [doc])

  if (!resolved || !doc) {
    return (
      <PeakShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-peak-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading document…</span>
          </div>
        </div>
      </PeakShell>
    )
  }

  return (
    <PeakShell>
      {/* Header */}
      <div className="create-doc-header mb-6">
        <Link
          href="/create"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-peak-muted transition-colors hover:text-peak"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Create Studio
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-peak-primary/12 px-2.5 py-1 text-xs font-medium text-peak-primary-300 ring-1 ring-peak-primary/20">
              {TYPE_ICON[doc.type]}
              {TYPE_LABEL[doc.type]}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-peak sm:text-4xl">
              {doc.title}
            </h1>
            {doc.subtitle ? (
              <p className="mt-1.5 max-w-2xl text-sm text-peak-muted">{doc.subtitle}</p>
            ) : null}
          </div>

          {/* Actions: Regenerate + per-view Export menu (rendered by each view) */}
          <div className="create-doc-actions flex shrink-0 items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={regenerating}
              className="inline-flex items-center gap-2 rounded-xl border border-peak-border bg-peak-glass px-3.5 py-2 text-sm font-medium text-peak transition-colors hover:bg-peak-glass-hover disabled:opacity-60"
            >
              {regenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {regenerating ? 'Regenerating…' : 'Regenerate'}
            </button>
            {/* The Export menu is co-located with each view's content so it can
                reach the underlying data; views render their own ExportMenu. */}
            <div id="create-export-slot" />
          </div>
        </div>

        {/* Sources chip row */}
        {sources.length ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-peak-dim">
              <Database className="h-3.5 w-3.5" />
              Sources
            </span>
            {sources.map((s, i) => (
              <span
                key={`${s}-${i}`}
                className="inline-flex items-center gap-1 rounded-full border border-peak-border bg-peak-glass px-2.5 py-1 text-xs text-peak-muted"
              >
                {s}
              </span>
            ))}
            <span className="ml-1 inline-flex items-center gap-1 text-xs text-peak-dim">
              <Sparkles className="h-3 w-3 text-peak-primary-300" />
              Grounded in P1 Memory
            </span>
          </div>
        ) : null}
      </div>

      {/* Body — render by type */}
      <div className="create-doc-body">
        {doc.type === 'spreadsheet' ? (
          <SpreadsheetView doc={doc} />
        ) : doc.type === 'presentation' ? (
          <DeckView doc={doc} />
        ) : doc.type === 'dashboard' ? (
          <DashboardView doc={doc} />
        ) : (
          <DocumentView doc={doc} />
        )}
      </div>

      {/* Empty-state guard if a view somehow can't render */}
      {!doc ? (
        <GlassPanel className="text-center text-sm text-peak-muted">
          Nothing to display.
        </GlassPanel>
      ) : null}
    </PeakShell>
  )
}
