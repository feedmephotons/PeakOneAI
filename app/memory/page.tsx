'use client'

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Brain,
  Users,
  Building2,
  FileText,
  Mic,
  FolderKanban,
  User,
  Building,
  Calendar,
  Files,
  Gavel,
  BookOpen,
  Bookmark,
  Search,
  Plus,
  Star,
  MoreHorizontal,
  ChevronLeft,
  RefreshCw,
  CheckCircle2,
  Paperclip,
  AtSign,
  Smile,
  Send,
  ArrowUp,
  Link2,
  FolderKanban as ProjectIcon,
  FileText as DocIcon,
  Calendar as MeetingIcon,
  Sparkles,
} from 'lucide-react'
import {
  ContextPanel,
  LisaInsight,
  type ContextSection,
  type ContextConnection,
} from '@/components/peak'
import {
  MOCK_NOTES,
  getMockNoteConnections,
} from '@/lib/peak/mock'
import type { Note, NoteBrain, NoteConnection, NoteEntityType, NoteType } from '@/lib/peak/types'

// ----------------------------------------------------------------------------
// Static config
// ----------------------------------------------------------------------------

// Frozen "now" so render-path time math is deterministic between SSR and the
// first client render (avoids hydration mismatches). Mirrors app/page.tsx.
const PEAK_NOW = Date.parse('2026-06-18T09:00:00.000Z')

// localStorage keys for client-side persistence (no notes write API in the
// demo path). `LOCAL_NOTES` holds notes created locally; `NOTE_OVERRIDES`
// holds field-level edits (title/body/starred) applied to any note by id.
const LS_LOCAL_NOTES = 'peak.memory.localNotes'
const LS_NOTE_OVERRIDES = 'peak.memory.noteOverrides'

type NoteOverride = Partial<Pick<Note, 'title' | 'body' | 'starred' | 'updatedAt'>>

function readLocalNotes(): Note[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_LOCAL_NOTES)
    return raw ? (JSON.parse(raw) as Note[]) : []
  } catch {
    return []
  }
}

function writeLocalNotes(notes: Note[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_LOCAL_NOTES, JSON.stringify(notes))
  } catch {
    /* ignore */
  }
}

function readOverrides(): Record<string, NoteOverride> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(LS_NOTE_OVERRIDES)
    return raw ? (JSON.parse(raw) as Record<string, NoteOverride>) : {}
  } catch {
    return {}
  }
}

function writeOverride(id: string, patch: NoteOverride) {
  if (typeof window === 'undefined') return
  try {
    const all = readOverrides()
    all[id] = { ...all[id], ...patch }
    localStorage.setItem(LS_NOTE_OVERRIDES, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

function applyOverrides(notes: Note[]): Note[] {
  const overrides = readOverrides()
  if (Object.keys(overrides).length === 0) return notes
  return notes.map((n) => (overrides[n.id] ? { ...n, ...overrides[n.id] } : n))
}

const BRAINS: { id: NoteBrain; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'MY', label: 'My Brain', icon: Brain },
  { id: 'TEAM', label: 'Team Brain', icon: Users },
  { id: 'COMPANY', label: 'Company Brain', icon: Building2 },
]

// Library sections map to a note-type filter. `type: null` clears the filter.
const NAV_SECTIONS: {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  type: NoteType | null
}[] = [
  { id: 'notes', label: 'Notes', icon: FileText, type: 'NOTE' },
  { id: 'journal', label: 'Journal', icon: BookOpen, type: 'JOURNAL' },
  { id: 'voice', label: 'Voice Notes', icon: Mic, type: 'VOICE' },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, type: 'BOOKMARK' },
]

const NAV_ENTITIES: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; href?: string }[] = [
  { id: 'projects', label: 'Projects', icon: FolderKanban, href: '/projects/tasks' },
  { id: 'people', label: 'People', icon: User, href: '/people' },
  { id: 'companies', label: 'Companies', icon: Building },
  { id: 'meetings', label: 'Meetings', icon: Calendar },
  { id: 'files', label: 'Files', icon: Files, href: '/files' },
  { id: 'decisions', label: 'Decisions', icon: Gavel },
  { id: 'tags', label: 'Tags', icon: Link2 },
]

// Friendly label for a note's "type" line in the list.
const NOTE_TYPE_LABEL: Record<string, string> = {
  NOTE: 'Note',
  JOURNAL: 'Journal',
  RESEARCH: 'Research',
  VOICE: 'Voice Note',
  IDEA: 'Idea',
  DRAFT: 'Draft',
  DECISION: 'Decision',
  BOOKMARK: 'Bookmark',
}

// Per-type icon tint for the list rows (kept subtle / single-hue family).
function noteIconTint(type: string): string {
  switch (type) {
    case 'DECISION':
      return 'text-peak-green'
    case 'DRAFT':
      return 'text-peak-amber'
    case 'IDEA':
      return 'text-peak-blue'
    case 'RESEARCH':
      return 'text-peak-primary-300'
    default:
      return 'text-peak-muted'
  }
}

function formatNoteDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  } catch {
    return iso
  }
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const diff = PEAK_NOW - then
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

// Icon for a connection row, keyed by entity type.
function connectionIcon(type: NoteEntityType): React.ReactNode {
  switch (type) {
    case 'PERSON':
      return <User className="h-4 w-4" />
    case 'COMPANY':
      return <Building className="h-4 w-4" />
    case 'PROJECT':
      return <ProjectIcon className="h-4 w-4" />
    case 'MEETING':
      return <MeetingIcon className="h-4 w-4" />
    case 'TASK':
      return <CheckCircle2 className="h-4 w-4" />
    default:
      return <DocIcon className="h-4 w-4" />
  }
}

// Map an entity type to a ContextPanel filter tab.
function connectionGroup(type: NoteEntityType): string {
  switch (type) {
    case 'PERSON':
      return 'People'
    case 'PROJECT':
    case 'COMPANY':
      return 'Projects'
    case 'MEETING':
      return 'Meetings'
    case 'TASK':
    case 'NOTE':
    default:
      return 'Files'
  }
}

function connectionSubtitle(type: NoteEntityType): string {
  switch (type) {
    case 'PERSON':
      return 'Person'
    case 'COMPANY':
      return 'Company'
    case 'PROJECT':
      return 'Project'
    case 'MEETING':
      return 'Meeting'
    case 'TASK':
      return 'Task'
    default:
      return 'Note'
  }
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

function MemoryPageInner() {
  const searchParams = useSearchParams()
  // Deep-link params from Company Brain: ?category=<tag> sets a tag filter;
  // ?note=<id> selects a specific note.
  const categoryParam = searchParams.get('category')
  const noteParam = searchParams.get('note')

  const [brain, setBrain] = useState<NoteBrain>('MY')
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES)
  const [selectedId, setSelectedId] = useState<string>(noteParam || 'note-q2-marketing')
  // Active tag filter from a category deep-link (null = no tag filter).
  const [tagFilter, setTagFilter] = useState<string | null>(categoryParam)
  const [connections, setConnections] = useState<NoteConnection[]>(
    getMockNoteConnections('note-q2-marketing'),
  )
  const [query, setQuery] = useState('')
  const [source, setSource] = useState<'db' | 'mock'>('mock')
  // Active Library note-type filter (null = all types).
  const [typeFilter, setTypeFilter] = useState<NoteType | null>(null)
  // Monotonic counter so locally-created notes get stable, unique ids.
  const [noteCounter, setNoteCounter] = useState(0)

  // --- Load all notes (try API, fall back to mock) ------------------------
  // Exposed as a callback so the Refresh control can re-run it on demand.
  const loadNotes = useCallback(async () => {
    const local = readLocalNotes()
    try {
      const res = await fetch('/api/memory/notes', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (Array.isArray(json?.data) && json.data.length > 0) {
        // Merge: locally-created notes first, then server/mock notes, with
        // field-level overrides applied on top.
        setNotes(applyOverrides([...local, ...(json.data as Note[])]))
        setSource((json.source as 'db' | 'mock') || 'mock')
        return
      }
    } catch {
      setSource('mock')
    }
    // Fallback path: mock + local + overrides.
    setNotes(applyOverrides([...local, ...MOCK_NOTES]))
  }, [])

  useEffect(() => {
    void loadNotes()
  }, [loadNotes])

  // --- Create a new note locally and select it ----------------------------
  const handleNewNote = useCallback(() => {
    const nextCounter = noteCounter + 1
    setNoteCounter(nextCounter)
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `note-${crypto.randomUUID()}`
        : `note-${PEAK_NOW}-${nextCounter}`
    const now = new Date().toISOString()
    const newNote: Note = {
      id,
      brain,
      type: 'NOTE',
      title: 'Untitled note',
      body: '',
      tags: [],
      pinned: false,
      starred: false,
      createdAt: now,
      updatedAt: now,
    }
    setNotes((prev) => [newNote, ...prev])
    // Persist so the new note survives a refresh.
    writeLocalNotes([newNote, ...readLocalNotes()])
    setTypeFilter(null)
    setSelectedId(id)
  }, [brain, noteCounter])

  // --- Toggle the starred flag on a note (persisted) ----------------------
  const toggleStar = useCallback((id: string) => {
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, starred: !n.starred } : n))
      const updated = next.find((n) => n.id === id)
      if (updated) {
        // Persist: locally-created notes update in place; everything else gets
        // a field-level override.
        const locals = readLocalNotes()
        if (locals.some((n) => n.id === id)) {
          writeLocalNotes(locals.map((n) => (n.id === id ? { ...n, starred: updated.starred } : n)))
        } else {
          writeOverride(id, { starred: updated.starred })
        }
      }
      return next
    })
  }, [])

  // --- Edit a note's title/body (persisted) -------------------------------
  const updateNote = useCallback((id: string, patch: { title?: string; body?: string }) => {
    const now = new Date().toISOString()
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: now } : n)),
    )
    const locals = readLocalNotes()
    if (locals.some((n) => n.id === id)) {
      writeLocalNotes(locals.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: now } : n)))
    } else {
      writeOverride(id, { ...patch, updatedAt: now })
    }
  }, [])

  // --- Notes visible for the active brain + search + type filter ----------
  const brainNotes = useMemo(() => {
    const q = query.trim().toLowerCase()
    return notes.filter((n) => {
      // A tag filter (from a category deep-link) spans all brains; otherwise
      // scope to the active brain.
      if (tagFilter) {
        if (!n.tags.includes(tagFilter)) return false
      } else if (n.brain !== brain) {
        return false
      }
      if (typeFilter && n.type !== typeFilter) return false
      if (!q) return true
      return (
        n.title.toLowerCase().includes(q) ||
        (n.body || '').toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [notes, brain, query, typeFilter, tagFilter])

  const pinnedNotes = useMemo(() => brainNotes.filter((n) => n.pinned), [brainNotes])
  const recentNotes = useMemo(
    () =>
      [...brainNotes]
        .filter((n) => !n.pinned)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [brainNotes],
  )

  // Honor a ?note=<id> deep-link once that note is present.
  useEffect(() => {
    if (noteParam && notes.some((n) => n.id === noteParam)) {
      setSelectedId(noteParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteParam, notes.length])

  // When the brain/tag filter changes, snap selection to the first available note.
  useEffect(() => {
    if (brainNotes.length === 0) return
    if (!brainNotes.some((n) => n.id === selectedId)) {
      setSelectedId(brainNotes[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brain, tagFilter, brainNotes.length])

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) || null,
    [notes, selectedId],
  )

  // --- Load connections for the selected note -----------------------------
  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    // Optimistic mock so the panel never blanks.
    setConnections(getMockNoteConnections(selectedId))
    ;(async () => {
      try {
        const res = await fetch(`/api/memory/notes/${selectedId}/connections`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (cancelled) return
        if (Array.isArray(json?.data)) {
          setConnections(json.data as NoteConnection[])
        }
      } catch {
        // keep mock
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedId])

  // --- ContextPanel sections from connections -----------------------------
  const contextSections: ContextSection[] = useMemo(() => {
    const items: ContextConnection[] = connections.map((c) => ({
      id: c.id,
      icon: connectionIcon(c.entityType),
      title: c.label || c.entityId,
      subtitle: connectionSubtitle(c.entityType),
      group: connectionGroup(c.entityType),
    }))
    return [{ label: 'Connections', items }]
  }, [connections])

  return (
    <div className="peak-os min-h-screen">
      <div className="mx-auto grid max-w-[1700px] grid-cols-1 gap-0 lg:grid-cols-[232px_minmax(0,1fr)_340px]">
        {/* ============================================================= */}
        {/* LEFT — Memory mini-nav                                         */}
        {/* ============================================================= */}
        <aside className="hidden border-r border-peak-border px-4 py-6 lg:block">
          {/* Brain switcher */}
          <div className="mb-6 space-y-1">
            {BRAINS.map((b) => {
              const Icon = b.icon
              const active = brain === b.id
              const isCompany = b.id === 'COMPANY'
              const inner = (
                <span
                  className={[
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200',
                    active
                      ? 'bg-peak-primary/15 font-medium text-peak shadow-[0_0_24px_-6px_var(--peak-glow)] ring-1 ring-peak-primary/20'
                      : 'text-peak-muted hover:bg-white/[0.04] hover:text-peak',
                  ].join(' ')}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-peak-primary shadow-[0_0_8px_var(--peak-glow)]" />
                  )}
                  <Icon
                    className={[
                      'h-[18px] w-[18px] shrink-0',
                      active ? 'text-peak-primary-300' : 'text-peak-muted group-hover:text-peak',
                    ].join(' ')}
                  />
                  <span>{b.label}</span>
                </span>
              )
              // Company Brain has its own dedicated page.
              return isCompany ? (
                <Link key={b.id} href="/memory/company">
                  {inner}
                </Link>
              ) : (
                <button key={b.id} onClick={() => setBrain(b.id)} className="block w-full text-left">
                  {inner}
                </button>
              )
            })}
          </div>

          {/* Note sections */}
          <div className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-peak-dim">
            Library
          </div>
          <nav className="mb-6 space-y-0.5">
            {NAV_SECTIONS.map((item) => {
              const Icon = item.icon
              const active = typeFilter === item.type
              return (
                <button
                  key={item.id}
                  onClick={() => setTypeFilter((prev) => (prev === item.type ? null : item.type))}
                  className={[
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-peak-primary/10 font-medium text-peak ring-1 ring-peak-primary/20'
                      : 'text-peak-muted hover:bg-white/[0.04] hover:text-peak',
                  ].join(' ')}
                  aria-pressed={active}
                >
                  <Icon
                    className={[
                      'h-[17px] w-[17px] shrink-0',
                      active ? 'text-peak-primary-300' : 'text-peak-dim',
                    ].join(' ')}
                  />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Entities */}
          <div className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-peak-dim">
            Connected
          </div>
          <nav className="space-y-0.5">
            {NAV_ENTITIES.map((item) => {
              const Icon = item.icon
              if (item.href) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-peak-muted transition-colors hover:bg-white/[0.04] hover:text-peak"
                  >
                    <Icon className="h-[17px] w-[17px] shrink-0 text-peak-dim" />
                    <span>{item.label}</span>
                  </Link>
                )
              }
              // No destination yet — render as honest, non-interactive.
              return (
                <div
                  key={item.id}
                  aria-disabled="true"
                  className="flex w-full cursor-default items-center gap-3 rounded-lg px-3 py-2 text-sm text-peak-muted opacity-50"
                >
                  <Icon className="h-[17px] w-[17px] shrink-0 text-peak-dim" />
                  <span>{item.label}</span>
                </div>
              )
            })}
          </nav>
        </aside>

        {/* ============================================================= */}
        {/* CENTER — header + notes list + note view                      */}
        {/* ============================================================= */}
        <section className="min-w-0 px-6 py-6 sm:px-8">
          {/* Header */}
          <header className="mb-6 flex flex-wrap items-center gap-4">
            <div className="mr-auto">
              <h1 className="text-2xl font-semibold tracking-tight text-peak">P1 Memory</h1>
              <p className="text-sm text-peak-muted">Your second brain. Everything connected.</p>
            </div>
            <div className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1 sm:max-w-md">
              <div className="flex items-center gap-2.5 rounded-xl border border-peak-border bg-white/[0.03] px-4 py-2.5 focus-within:border-peak-primary/40">
                <Search className="h-4 w-4 shrink-0 text-peak-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your memory..."
                  className="w-full bg-transparent text-sm text-peak placeholder:text-peak-muted focus:outline-none"
                />
                <kbd className="hidden shrink-0 rounded border border-peak-border bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-peak-dim sm:inline">
                  ⌘ K
                </kbd>
              </div>
            </div>
            <button
              onClick={handleNewNote}
              className="order-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-peak-primary to-peak-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_24px_-6px_var(--peak-glow)] transition-all hover:brightness-110 sm:order-3"
            >
              <Plus className="h-4 w-4" />
              New Note
            </button>
          </header>

          {/* Two-up: notes list + note view */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
            {/* Notes list */}
            <div className="peak-glass flex max-h-[calc(100vh-180px)] flex-col p-0">
              <div className="flex items-center justify-between border-b border-peak-border px-5 py-4">
                <h2 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-peak">
                  {tagFilter ? `#${tagFilter}` : typeFilter ? NOTE_TYPE_LABEL[typeFilter] || 'Notes' : 'Notes'}
                  {(typeFilter || tagFilter) && (
                    <button
                      onClick={() => {
                        setTypeFilter(null)
                        setTagFilter(null)
                      }}
                      className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[11px] font-normal text-peak-muted transition-colors hover:text-peak"
                    >
                      Clear
                    </button>
                  )}
                </h2>
                <button
                  onClick={() => void loadNotes()}
                  aria-label="Refresh notes"
                  className="text-peak-muted transition-colors hover:text-peak"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="peak-scrollbar flex-1 overflow-y-auto px-3 py-3">
                {/* Pinned */}
                {pinnedNotes.length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-2 pb-2 pt-1">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-peak-muted">
                        Pinned
                      </span>
                      <span className="text-[11px] text-peak-dim">{pinnedNotes.length}</span>
                    </div>
                    <ul className="mb-4 space-y-1">
                      {pinnedNotes.map((n) => (
                        <NoteListRow
                          key={n.id}
                          note={n}
                          active={n.id === selectedId}
                          onSelect={() => setSelectedId(n.id)}
                        />
                      ))}
                    </ul>
                  </>
                )}

                {/* Recent */}
                <div className="flex items-center justify-between px-2 pb-2 pt-1">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-peak-muted">
                    Recent
                  </span>
                  <span className="text-[11px] text-peak-dim">{recentNotes.length}</span>
                </div>
                <ul className="space-y-1">
                  {recentNotes.map((n) => (
                    <NoteListRow
                      key={n.id}
                      note={n}
                      active={n.id === selectedId}
                      onSelect={() => setSelectedId(n.id)}
                    />
                  ))}
                  {recentNotes.length === 0 && pinnedNotes.length === 0 && (
                    <li className="px-2 py-6 text-center text-sm text-peak-muted">
                      No notes in this brain yet.
                    </li>
                  )}
                </ul>
              </div>

              <div className="border-t border-peak-border px-5 py-3">
                <button
                  onClick={() => {
                    setTypeFilter(null)
                    setTagFilter(null)
                    setQuery('')
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-peak-primary-300 hover:text-peak-primary"
                >
                  View all notes
                  <ArrowUp className="h-3.5 w-3.5 rotate-90" />
                </button>
              </div>
            </div>

            {/* Note view */}
            <div className="peak-glass min-h-[calc(100vh-180px)] p-0">
              {selectedNote ? (
                <NoteView
                  key={selectedNote.id}
                  note={selectedNote}
                  onToggleStar={() => toggleStar(selectedNote.id)}
                  onBack={() => setSelectedId('')}
                  onUpdate={(patch) => updateNote(selectedNote.id, patch)}
                />
              ) : (
                <div className="flex h-full min-h-[400px] items-center justify-center text-sm text-peak-muted">
                  Select a note to view it.
                </div>
              )}
            </div>
          </div>

          {source === 'mock' && (
            <p className="mt-3 text-[11px] text-peak-dim">
              Showing sample memory (live database unavailable).
            </p>
          )}
        </section>

        {/* ============================================================= */}
        {/* RIGHT — Related to this note + Lisa + activity                 */}
        {/* ============================================================= */}
        <aside className="hidden border-l border-peak-border px-5 py-6 lg:block">
          <ContextPanel
            sections={contextSections}
            footer={
              <>
                <LisaInsight
                  title="Lisa Insight"
                  body="Based on similar campaigns, increasing content output by 30% could drive 22% more qualified leads."
                  cta={{ label: 'View Insight' }}
                />
                <RecentActivity />
              </>
            }
          />
        </aside>
      </div>
    </div>
  )
}

// useSearchParams requires a Suspense boundary in the App Router.
export default function MemoryPage() {
  return (
    <Suspense fallback={<div className="peak-os min-h-screen" />}>
      <MemoryPageInner />
    </Suspense>
  )
}

// ----------------------------------------------------------------------------
// Note list row
// ----------------------------------------------------------------------------

function NoteListRow({
  note,
  active,
  onSelect,
}: {
  note: Note
  active: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        onClick={onSelect}
        className={[
          'group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all',
          active
            ? 'bg-peak-primary/10 ring-1 ring-peak-primary/25'
            : 'hover:bg-white/[0.04]',
        ].join(' ')}
      >
        <span
          className={[
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]',
            noteIconTint(note.type),
          ].join(' ')}
        >
          <FileText className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium text-peak">{note.title}</span>
            {note.starred && <Star className="h-3 w-3 shrink-0 fill-peak-primary text-peak-primary" />}
          </span>
          <span className="block truncate text-xs text-peak-muted">
            {NOTE_TYPE_LABEL[note.type] || 'Note'}
          </span>
          <span className="block text-[11px] text-peak-dim">{formatNoteDate(note.updatedAt)}</span>
        </span>
        {note.pinned && (
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-peak-primary" aria-hidden />
        )}
      </button>
    </li>
  )
}

// ----------------------------------------------------------------------------
// Rich note view
// ----------------------------------------------------------------------------

interface MetricCard {
  label: string
  value: string
  delta: string
}

// The Q2 Marketing Strategy mockup's metric cards. Shown for that note;
// other notes render their body sections without metric cards.
const Q2_METRICS: MetricCard[] = [
  { label: 'Pipeline Generated', value: '$2.4M', delta: '18% vs Q1' },
  { label: 'MQLs', value: '1,248', delta: '22% vs Q1' },
  { label: 'Website Traffic', value: '48.7K', delta: '15% vs Q1' },
  { label: 'Brand Mentions', value: '320', delta: '25% vs Q1' },
]

const Q2_STRATEGIES = [
  'Launch multi-channel campaign focused on product differentiation',
  'Partner with industry leaders for co-marketing and webinars',
  'Increase content output by 30% across all channels',
  'Optimize paid spend for better conversion rate',
]

const Q2_NEXT_STEPS = [
  { label: 'Finalize campaign messaging', due: 'May 22' },
  { label: 'Confirm influencer partnerships', due: 'May 24' },
  { label: 'Launch paid campaigns', due: 'May 27' },
]

function NoteView({
  note,
  onToggleStar,
  onBack,
  onUpdate,
}: {
  note: Note
  onToggleStar: () => void
  onBack: () => void
  onUpdate: (patch: { title?: string; body?: string }) => void
}) {
  const isQ2 = note.id === 'note-q2-marketing'
  // Local comment draft. Send appends to a per-note local comments list
  // (persisted in component state; a full fix needs a comments model).
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<{ id: string; body: string }[]>([])
  // Editable title — commits on blur / Enter.
  const [titleDraft, setTitleDraft] = useState(note.title)
  // Editable body for free-form notes (the Q2 note has a hand-tuned layout).
  const [bodyDraft, setBodyDraft] = useState(note.body || '')

  const commitTitle = () => {
    const t = titleDraft.trim() || 'Untitled note'
    if (t !== note.title) onUpdate({ title: t })
  }
  const commitBody = () => {
    if (bodyDraft !== (note.body || '')) onUpdate({ body: bodyDraft })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header bar */}
      <div className="flex items-start gap-3 px-7 pt-6">
        <button
          onClick={onBack}
          aria-label="Back to notes list"
          className="mt-1 text-peak-muted transition-colors hover:text-peak"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  ;(e.target as HTMLInputElement).blur()
                }
              }}
              aria-label="Note title"
              className="min-w-0 flex-1 rounded-lg bg-transparent text-2xl font-semibold tracking-tight text-peak focus:bg-white/[0.03] focus:outline-none focus:ring-1 focus:ring-peak-primary/30"
            />
            <button
              onClick={onToggleStar}
              aria-label={note.starred ? 'Unstar note' : 'Star note'}
              aria-pressed={note.starred}
              className="text-peak-muted transition-colors hover:text-peak"
            >
              <Star
                className={[
                  'h-5 w-5',
                  note.starred ? 'fill-peak-primary text-peak-primary' : 'text-peak-muted',
                ].join(' ')}
              />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-peak-dim sm:inline">
            Edited {relativeTime(note.updatedAt)}
          </span>
          <AvatarStack />
          {/* No note-actions menu yet — honest, non-interactive. */}
          <span aria-disabled="true" className="cursor-default text-peak-muted opacity-50">
            <MoreHorizontal className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2 px-7 pt-4">
        {note.tags.map((t, i) => (
          <span
            key={t}
            className={[
              'rounded-md px-2.5 py-1 text-xs font-medium',
              i === 0
                ? 'bg-peak-primary/15 text-peak-primary-300'
                : 'bg-white/[0.05] text-peak-muted',
            ].join(' ')}
          >
            {i === 0 ? toTitle(t) : t}
          </span>
        ))}
        {/* Tag editing not wired yet — honest, non-interactive. */}
        <span
          aria-disabled="true"
          className="flex h-6 w-6 cursor-default items-center justify-center rounded-md bg-white/[0.05] text-peak-muted opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
        </span>
      </div>

      {/* Body */}
      <div className="peak-scrollbar flex-1 overflow-y-auto px-7 py-6">
        {isQ2 ? (
          <Q2Body />
        ) : (
          <textarea
            value={bodyDraft}
            onChange={(e) => setBodyDraft(e.target.value)}
            onBlur={commitBody}
            placeholder="Start writing… Use ## for headings, - for bullets, **bold** for emphasis."
            className="min-h-[280px] w-full resize-none rounded-xl bg-transparent text-[15px] leading-relaxed text-peak-muted placeholder:text-peak-dim focus:bg-white/[0.02] focus:outline-none focus:ring-1 focus:ring-peak-primary/20"
          />
        )}
      </div>

      {/* Comment bar */}
      <div className="border-t border-peak-border px-7 py-4">
        {comments.length > 0 && (
          <ul className="mb-3 space-y-2">
            {comments.map((c) => (
              <li key={c.id} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-peak-primary to-peak-primary-600 text-[10px] font-semibold text-white">
                  SC
                </span>
                <span className="flex-1 rounded-xl bg-white/[0.03] px-3 py-2 text-sm text-peak">{c.body}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-peak-primary to-peak-primary-600 text-xs font-semibold text-white">
            SC
          </span>
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-peak-border bg-white/[0.03] px-4 py-2.5">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && comment.trim()) {
                  e.preventDefault()
                  setComments((prev) => [...prev, { id: `c-${prev.length + 1}`, body: comment.trim() }])
                  setComment('')
                }
              }}
              placeholder="Add a comment..."
              className="w-full bg-transparent text-sm text-peak placeholder:text-peak-muted focus:outline-none"
            />
            {/* Attachment / mention / emoji affordances aren't wired yet. */}
            <div aria-disabled="true" className="flex items-center gap-2.5 text-peak-muted opacity-50">
              <Paperclip className="h-4 w-4" />
              <AtSign className="h-4 w-4" />
              <Smile className="h-4 w-4" />
            </div>
          </div>
          {/* Appends to the local comments list (no comment backend yet). */}
          <button
            onClick={() => {
              if (!comment.trim()) return
              setComments((prev) => [...prev, { id: `c-${prev.length + 1}`, body: comment.trim() }])
              setComment('')
            }}
            disabled={!comment.trim()}
            aria-label="Send comment"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-peak-primary text-white transition-colors hover:bg-peak-primary-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-peak-primary"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// The hand-tuned rich body that matches the Q2 Marketing Strategy mockup.
function Q2Body() {
  return (
    <div className="space-y-8">
      {/* Hero aurora banner */}
      <div className="relative h-36 overflow-hidden rounded-2xl border border-peak-border bg-peak-panel">
        <div className="absolute inset-0 bg-[radial-gradient(120%_140%_at_70%_60%,rgba(139,92,246,0.35),transparent_55%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[radial-gradient(80%_120%_at_60%_100%,rgba(196,181,253,0.25),transparent_60%)] blur-md" />
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 600 140">
          <path
            d="M0 90 Q 150 40 300 80 T 600 60"
            fill="none"
            stroke="url(#wave)"
            strokeWidth="2"
            opacity="0.7"
          />
          <defs>
            <linearGradient id="wave" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
              <stop offset="50%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 1. Objective */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-peak">1. Objective</h3>
        <p className="text-[15px] leading-relaxed text-peak-muted">
          Increase brand awareness and drive qualified pipeline for Acme Corp&apos;s Q2 product
          launch through integrated marketing campaigns.
        </p>
      </section>

      {/* 2. Key Strategies */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-peak">2. Key Strategies</h3>
        <ul className="space-y-2.5">
          {Q2_STRATEGIES.map((s) => (
            <li key={s} className="flex items-start gap-3 text-[15px] text-peak-muted">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-peak-green" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Target Metrics */}
      <section>
        <h3 className="mb-4 text-base font-semibold text-peak">3. Target Metrics</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Q2_METRICS.map((m) => (
            <div key={m.label} className="rounded-2xl border border-peak-border bg-white/[0.025] p-4">
              <div className="mb-2 text-xs text-peak-muted">{m.label}</div>
              <div className="text-2xl font-semibold tracking-tight text-peak">{m.value}</div>
              <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-peak-green">
                <ArrowUp className="h-3 w-3" />
                {m.delta}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Next Steps */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-peak">4. Next Steps</h3>
        <ul className="space-y-3">
          {Q2_NEXT_STEPS.map((step) => (
            <li key={step.label} className="flex items-center gap-3">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-peak-border" />
              <span className="flex-1 text-[15px] text-peak-muted">{step.label}</span>
              <span className="text-sm text-peak-dim">{step.due}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

// Render a markdown-ish block from a note body (## headings, - bullets, **bold**).
function NoteBlock({ block }: { block: string }) {
  const lines = block.split('\n')
  if (lines[0]?.startsWith('## ')) {
    const heading = lines[0].replace(/^##\s+/, '')
    const rest = lines.slice(1)
    return (
      <div>
        <h3 className="mb-2 text-base font-semibold text-peak">{heading}</h3>
        {rest.map((l, i) => (
          <BodyLine key={i} line={l} />
        ))}
      </div>
    )
  }
  return (
    <div>
      {lines.map((l, i) => (
        <BodyLine key={i} line={l} />
      ))}
    </div>
  )
}

function BodyLine({ line }: { line: string }) {
  if (!line.trim()) return null
  if (line.startsWith('- ')) {
    return (
      <div className="flex items-start gap-2.5">
        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-peak-primary-300" />
        <span>{renderEmphasis(line.replace(/^-\s+/, ''))}</span>
      </div>
    )
  }
  return <p>{renderEmphasis(line)}</p>
}

// Convert **bold** spans into purple emphasis.
function renderEmphasis(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <span key={i} className="font-medium text-peak-primary-300">
          {p.slice(2, -2)}
        </span>
      )
    }
    return <span key={i}>{p}</span>
  })
}

function AvatarStack() {
  const initials = ['SC', 'MW', 'LP']
  return (
    <div className="flex -space-x-2">
      {initials.map((ini, i) => (
        <span
          key={ini}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-peak-bg bg-gradient-to-br from-peak-primary to-peak-primary-600 text-[10px] font-semibold text-white"
          style={{ zIndex: 3 - i }}
        >
          {ini}
        </span>
      ))}
      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-peak-bg bg-white/10 text-[10px] font-semibold text-peak-muted">
        +2
      </span>
    </div>
  )
}

function toTitle(s: string): string {
  return s
    .split(/[-\s]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ----------------------------------------------------------------------------
// Right-rail recent activity (footer slot)
// ----------------------------------------------------------------------------

function RecentActivity() {
  const items = [
    { id: 1, icon: <FileText className="h-3.5 w-3.5" />, text: 'You updated this note', time: '2m ago' },
    { id: 2, icon: <span className="text-[10px] font-semibold">MW</span>, text: 'Mike Wilson added a comment', time: '1h ago' },
    { id: 3, icon: <Sparkles className="h-3.5 w-3.5" />, text: 'Lisa connected 3 related items', time: 'Yesterday' },
  ]
  return (
    <div className="peak-glass p-5">
      <div className="mb-3 text-sm font-semibold text-peak">Recent activity</div>
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-peak-primary-300">
              {it.icon}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-peak-muted">{it.text}</span>
            <span className="shrink-0 text-xs text-peak-dim">{it.time}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
