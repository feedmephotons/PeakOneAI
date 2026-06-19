'use client'

import React, { useMemo, useState } from 'react'
import { use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Sparkles,
  Star,
  Clock,
  Calendar,
  MessageSquare,
  Phone,
  FileText,
  CheckSquare,
  Paperclip,
  Mail,
  AlertTriangle,
  TrendingUp,
  Target,
  Loader2,
  ChevronRight,
  Building2,
  ListChecks,
  CornerUpRight,
} from 'lucide-react'
import {
  PeakShell,
  GlassPanel,
  SectionLabel,
  StatTile,
  LisaInsight,
} from '@/components/peak'
import {
  MOCK_PEOPLE,
  getMockRelationshipProfile,
  getMockRelationshipBrief,
} from '@/lib/peak/mock'
import type {
  InteractionItem,
  Person,
  RelationshipBrief,
  RelationshipProfile,
} from '@/lib/peak/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Stable reference time so render-path date math is deterministic between
// server and client (avoids hydration mismatch). Matches app/page.tsx.
const PEAK_NOW = Date.parse('2026-06-18T09:00:00.000Z')

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

function avatarStyle(name: string): React.CSSProperties {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  const a = 250 + ((h % 30) - 15)
  const b = (a + 40) % 360
  return { backgroundImage: `linear-gradient(135deg, hsl(${a} 70% 55%), hsl(${b} 65% 42%))` }
}

function relativeTime(iso?: string | null): string {
  if (!iso) return 'No contact yet'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'No contact yet'
  const days = Math.floor((PEAK_NOW - then) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function formatDate(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

function strengthMeta(strength: number): { label: string; tone: string; bar: string } {
  if (strength >= 75) return { label: 'Strong', tone: 'text-peak-green', bar: 'bg-peak-green' }
  if (strength >= 50) return { label: 'Active', tone: 'text-peak-primary-300', bar: 'bg-peak-primary' }
  if (strength >= 30) return { label: 'Cooling', tone: 'text-peak-amber', bar: 'bg-peak-amber' }
  return { label: 'At risk', tone: 'text-peak-red', bar: 'bg-peak-red' }
}

const FALLBACK_PERSON: Person = {
  id: 'unknown',
  name: 'Unknown Person',
  company: null,
  title: null,
  email: null,
}

function resolveProfile(id: string): RelationshipProfile {
  const direct = getMockRelationshipProfile(id)
  if (direct) return direct
  const person = MOCK_PEOPLE.find((p) => p.id === id)
  if (person) {
    return {
      person,
      strength: 42,
      lastInteraction: null,
      stats: { meetings: 0, messages: 0, calls: 0, notes: 0, tasks: 0, files: 0 },
      recentInteractions: [],
      openItems: [],
      sharedNotes: [],
    }
  }
  // Unknown id — build a neutral, empty profile around FALLBACK_PERSON so we
  // never impersonate a real contact (e.g. Brian Miller) for a bogus id.
  return {
    person: FALLBACK_PERSON,
    strength: 0,
    lastInteraction: null,
    stats: { meetings: 0, messages: 0, calls: 0, notes: 0, tasks: 0, files: 0 },
    recentInteractions: [],
    openItems: [],
    sharedNotes: [],
  }
}

// Interaction kind → icon + tone
const KIND_META: Record<
  InteractionItem['kind'],
  { icon: React.ReactNode; label: string; chip: string }
> = {
  MEETING: { icon: <Calendar className="h-4 w-4" />, label: 'Meeting', chip: 'text-peak-blue bg-peak-blue/10 ring-peak-blue/20' },
  MESSAGE: { icon: <MessageSquare className="h-4 w-4" />, label: 'Message', chip: 'text-peak-primary-300 bg-peak-primary/10 ring-peak-primary/20' },
  CALL: { icon: <Phone className="h-4 w-4" />, label: 'Call', chip: 'text-peak-green bg-peak-green/10 ring-peak-green/20' },
  NOTE: { icon: <FileText className="h-4 w-4" />, label: 'Note', chip: 'text-peak-primary-300 bg-peak-primary/10 ring-peak-primary/20' },
  TASK: { icon: <CheckSquare className="h-4 w-4" />, label: 'Task', chip: 'text-peak-amber bg-peak-amber/10 ring-peak-amber/20' },
  FILE: { icon: <Paperclip className="h-4 w-4" />, label: 'File', chip: 'text-peak-muted bg-white/5 ring-white/10' },
  EMAIL: { icon: <Mail className="h-4 w-4" />, label: 'Email', chip: 'text-peak-blue bg-peak-blue/10 ring-peak-blue/20' },
}

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------

function Avatar({ person }: { person: Person }) {
  if (person.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={person.avatarUrl}
        alt={person.name}
        className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-white/10"
      />
    )
  }
  return (
    <span
      style={avatarStyle(person.name)}
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-semibold text-white ring-1 ring-white/15"
    >
      {initials(person.name)}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Timeline (connected intelligence)
// ---------------------------------------------------------------------------

const TONE_DOT: Record<string, string> = {
  red: 'bg-peak-red',
  amber: 'bg-peak-amber',
  green: 'bg-peak-green',
  primary: 'bg-peak-primary',
  blue: 'bg-peak-blue',
  default: 'bg-peak-dim',
}

function Timeline({ items }: { items: InteractionItem[] }) {
  if (items.length === 0) {
    return (
      <p className="px-2 py-6 text-sm text-peak-muted">
        No connected interactions on file yet. As you meet, message, and share files, Lisa will
        weave them into this timeline automatically.
      </p>
    )
  }
  return (
    <ol className="relative space-y-1">
      {/* vertical rail */}
      <span className="absolute bottom-3 left-[19px] top-3 w-px bg-peak-border" aria-hidden />
      {items.map((item) => {
        const meta = KIND_META[item.kind]
        const dot = TONE_DOT[item.tone ?? 'default'] ?? TONE_DOT.default
        return (
          <li key={item.id} className="relative flex gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-white/[0.03]">
            <div className="relative z-10 flex flex-col items-center">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${meta.chip}`}>
                {meta.icon}
              </span>
              <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${dot}`} />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-peak">{item.title}</span>
                <span className="shrink-0 text-xs text-peak-dim">{formatDate(item.date)}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-peak-dim">
                  {meta.label}
                </span>
              </div>
              {item.summary && <p className="mt-1 text-sm leading-relaxed text-peak-muted">{item.summary}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// ---------------------------------------------------------------------------
// Relationship Brief panel (the "Prepare me for {name}" reveal)
// ---------------------------------------------------------------------------

function BriefSection({
  icon,
  title,
  items,
  tone = 'muted',
  emptyLabel,
}: {
  icon: React.ReactNode
  title: string
  items: string[]
  tone?: 'muted' | 'red' | 'green'
  emptyLabel?: string
}) {
  if (!items.length && !emptyLabel) return null
  const marker =
    tone === 'red' ? 'text-peak-red' : tone === 'green' ? 'text-peak-green' : 'text-peak-primary-300'
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className={marker}>{icon}</span>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-peak-muted">{title}</h4>
      </div>
      {!items.length ? (
        <p className="text-sm text-peak-muted">{emptyLabel}</p>
      ) : (
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-peak">
            <span className={`mt-2 h-1 w-1 shrink-0 rounded-full ${marker.replace('text-', 'bg-')}`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
      )}
    </div>
  )
}

function RelationshipBriefPanel({
  brief,
  loading,
  firstName,
}: {
  brief: RelationshipBrief | null
  loading: boolean
  firstName: string
}) {
  return (
    <GlassPanel glow className="relative animate-peak-fade-up overflow-hidden p-7">
      {/* aurora wash */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-peak-primary/20 blur-[90px]" />
        <div className="absolute bottom-0 left-1/4 h-40 w-80 rounded-full bg-peak-primary-600/10 blur-[80px]" />
      </div>

      <div className="relative">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-peak-primary/20 text-peak-primary-300 ring-1 ring-peak-primary/30">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-peak-primary-300">
              Lisa · Relationship Brief
            </div>
            <h3 className="text-lg font-semibold text-peak">Prepared for {firstName}</h3>
          </div>
        </div>

        {loading || !brief ? (
          <div className="flex items-center gap-3 py-8 text-peak-muted">
            <Loader2 className="h-5 w-5 animate-spin text-peak-primary-300" />
            <span className="text-sm">Lisa is reading the full relationship history…</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <p className="text-base leading-relaxed text-peak">{brief.summary}</p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <BriefSection
                icon={<ListChecks className="h-4 w-4" />}
                title="Open Items"
                items={brief.openItems}
                emptyLabel="None on file"
              />
              <BriefSection
                icon={<Clock className="h-4 w-4" />}
                title="Recent Interactions"
                items={brief.recentInteractions}
                emptyLabel="No recent interactions"
              />
              <BriefSection
                icon={<AlertTriangle className="h-4 w-4" />}
                title="Risks"
                items={brief.risks}
                tone="red"
                emptyLabel="No risks noted"
              />
              <BriefSection
                icon={<TrendingUp className="h-4 w-4" />}
                title="Opportunities"
                items={brief.opportunities}
                tone="green"
                emptyLabel="No opportunities noted"
              />
            </div>

            {brief.talkingPoints?.length > 0 && (
              <div className="rounded-2xl border border-peak-primary/20 bg-peak-primary/[0.06] p-5">
                <div className="mb-2 flex items-center gap-2">
                  <CornerUpRight className="h-4 w-4 text-peak-primary-300" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-peak-primary-300">
                    Suggested talking points
                  </h4>
                </div>
                <ul className="space-y-1.5">
                  {brief.talkingPoints.map((tp, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-peak">
                      <span className="text-peak-primary-300">{i + 1}.</span>
                      <span>{tp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-peak-dim">
              <Sparkles className="h-3 w-3" />
              {brief.isMock
                ? 'Generated from connected history (offline preview).'
                : 'Generated by Lisa from connected meetings, messages, notes, and tasks.'}
            </div>
          </div>
        )}
      </div>
    </GlassPanel>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PersonProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const profile = useMemo(() => resolveProfile(id), [id])
  const person = profile.person
  const firstName = person.name.split(/\s+/)[0] || person.name
  const meta = strengthMeta(profile.strength)

  const [briefOpen, setBriefOpen] = useState(false)
  const [brief, setBrief] = useState<RelationshipBrief | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)

  const handlePrepare = async () => {
    // Toggle closed if already open.
    if (briefOpen && brief) {
      setBriefOpen(false)
      return
    }
    setBriefOpen(true)
    if (brief) return // already generated

    setBriefLoading(true)
    // Scroll the reveal into view shortly after it mounts.
    setTimeout(() => {
      document.getElementById('relationship-brief')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)

    let result: RelationshipBrief | null = null
    try {
      const res = await fetch(`/api/relationships/${id}/brief`, { method: 'POST' })
      if (res.ok) {
        const json = await res.json()
        result = (json?.data as RelationshipBrief) ?? null
      }
    } catch {
      // network/API unavailable — fall through to mock
    }
    if (!result) result = getMockRelationshipBrief(id)
    setBrief(result)
    setBriefLoading(false)
  }

  const stats = profile.stats
  const followUps = profile.openItems.slice(0, 3)

  return (
    <PeakShell>
      {/* Back link */}
      <Link
        href="/people"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-peak-muted transition-colors hover:text-peak"
      >
        <ArrowLeft className="h-4 w-4" />
        All people
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* MAIN COLUMN */}
        <div className="min-w-0 space-y-6">
          {/* Header card */}
          <GlassPanel className="relative overflow-hidden p-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-peak-primary/10 blur-[80px]" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <Avatar person={person} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-peak">{person.name}</h1>
                    {person.favorite && <Star className="h-4 w-4 fill-peak-amber text-peak-amber" />}
                  </div>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-peak-muted">
                    {person.title && <span>{person.title}</span>}
                    {person.title && person.company && <span className="text-peak-dim">·</span>}
                    {person.company && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-peak-dim" />
                        {person.company}
                      </span>
                    )}
                  </p>

                  {/* Strength + last contact */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/[0.08]">
                        <div
                          className={`h-full rounded-full ${meta.bar}`}
                          style={{ width: `${profile.strength}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${meta.tone}`}>
                        {meta.label} · {profile.strength}%
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs text-peak-muted">
                      <Clock className="h-3.5 w-3.5 text-peak-dim" />
                      Last contact {relativeTime(profile.lastInteraction).toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary CTA */}
              <button
                onClick={handlePrepare}
                className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-peak-primary px-4 py-2.5 text-sm font-semibold text-white shadow-peak-glow transition-all hover:bg-peak-primary-600"
              >
                <Sparkles className="h-4 w-4" />
                Prepare me for {firstName}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </GlassPanel>

          {/* Relationship Brief reveal */}
          {briefOpen && (
            <div id="relationship-brief" className="scroll-mt-6">
              <RelationshipBriefPanel brief={brief} loading={briefLoading} firstName={firstName} />
            </div>
          )}

          {/* Connected intelligence: timeline */}
          <section>
            <SectionLabel className="mb-3">
              Connected intelligence
            </SectionLabel>
            <GlassPanel className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-peak">Interaction timeline</h2>
                <span className="text-xs text-peak-dim">
                  Meetings · Messages · Calls · Notes · Tasks · Files
                </span>
              </div>
              <Timeline items={profile.recentInteractions} />
            </GlassPanel>
          </section>

          {/* Shared notes */}
          {profile.sharedNotes.length > 0 && (
            <section>
              <SectionLabel className="mb-3">Shared notes & docs</SectionLabel>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {profile.sharedNotes.map((note) => (
                  <Link key={note.id} href="/memory" className="group block">
                    <GlassPanel className="peak-glass-hover h-full p-4 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-peak-primary/10 text-peak-primary-300 ring-1 ring-peak-primary/20">
                          <FileText className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-medium text-peak">{note.title}</h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-peak-muted">
                            {(note.body || '').replace(/[#*]/g, '').slice(0, 120)}
                          </p>
                        </div>
                      </div>
                    </GlassPanel>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT RAIL */}
        <aside className="space-y-4">
          {/* Quick stats */}
          <GlassPanel className="p-5">
            <SectionLabel className="mb-4">At a glance</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              <StatTile
                icon={<Calendar className="h-4 w-4" />}
                value={stats.meetings}
                label="Meetings"
                tone="blue"
                variant="cell"
              />
              <StatTile
                icon={<ListChecks className="h-4 w-4" />}
                value={profile.openItems.length}
                label="Open items"
                tone={profile.openItems.length > 0 ? 'amber' : 'neutral'}
                variant="cell"
              />
              <StatTile
                icon={<MessageSquare className="h-4 w-4" />}
                value={stats.messages}
                label="Messages"
                tone="primary"
                variant="cell"
              />
            </div>
            <div className="mt-4 border-t border-peak-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 text-peak-muted">
                  <Clock className="h-4 w-4 text-peak-dim" />
                  Last contact
                </span>
                <span className="font-medium text-peak">{relativeTime(profile.lastInteraction)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 text-peak-muted">
                  <Phone className="h-4 w-4 text-peak-dim" />
                  Calls · Files
                </span>
                <span className="font-medium text-peak">
                  {stats.calls} · {stats.files}
                </span>
              </div>
            </div>
          </GlassPanel>

          {/* Suggested follow-ups */}
          <GlassPanel className="p-5">
            <SectionLabel className="mb-3">Suggested follow-ups</SectionLabel>
            {followUps.length === 0 ? (
              <p className="text-sm text-peak-muted">Nothing outstanding. This relationship is in good shape.</p>
            ) : (
              <ul className="space-y-2.5">
                {followUps.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-peak-amber/10 text-peak-amber ring-1 ring-peak-amber/20">
                      <Target className="h-3 w-3" />
                    </span>
                    <span className="text-sm leading-snug text-peak">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </GlassPanel>

          {/* Linked missions */}
          {profile.missions && profile.missions.length > 0 && (
            <GlassPanel className="p-5">
              <SectionLabel className="mb-3">Linked missions</SectionLabel>
              <ul className="space-y-2">
                {profile.missions.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/missions/${m.id}`}
                      className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-peak transition-colors hover:bg-white/5"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Target className="h-4 w-4 text-peak-primary-300" />
                        {m.name}
                      </span>
                      <ChevronRight className="h-4 w-4 text-peak-dim" />
                    </Link>
                  </li>
                ))}
              </ul>
            </GlassPanel>
          )}

          {/* Lisa insight */}
          <LisaInsight
            title="Lisa Insight"
            body={
              profile.openItems.length > 0
                ? `${firstName} has ${profile.openItems.length} open ${
                    profile.openItems.length === 1 ? 'item' : 'items'
                  } and you last connected ${relativeTime(profile.lastInteraction).toLowerCase()}. Closing the loop now keeps the relationship warm.`
                : `You are in good standing with ${firstName}. A light check-in would keep momentum without being needed.`
            }
            cta={{ label: `Prepare me for ${firstName}`, onClick: handlePrepare }}
          />
        </aside>
      </div>
    </PeakShell>
  )
}
