'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Sparkles,
  Users,
  Star,
  ArrowRight,
  Clock,
  Building2,
} from 'lucide-react'
import { PeakShell, GlassPanel, SectionLabel, AskLisaBar } from '@/components/peak'
import {
  MOCK_PEOPLE,
  MOCK_RELATIONSHIP_PROFILES,
} from '@/lib/peak/mock'
import type { Person, RelationshipProfile } from '@/lib/peak/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

/** Deterministic purple-tinted avatar gradient seeded off the name. */
function avatarStyle(name: string): React.CSSProperties {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  const a = 250 + ((h % 30) - 15) // keep it in the violet band
  const b = (a + 40) % 360
  return {
    backgroundImage: `linear-gradient(135deg, hsl(${a} 70% 55%), hsl(${b} 65% 42%))`,
  }
}

function relativeTime(iso?: string | null): string {
  if (!iso) return 'No contact yet'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'No contact yet'
  const days = Math.floor((Date.now() - then) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function strengthMeta(strength: number): { label: string; tone: string; bar: string } {
  if (strength >= 75) return { label: 'Strong', tone: 'text-peak-green', bar: 'bg-peak-green' }
  if (strength >= 50) return { label: 'Active', tone: 'text-peak-primary-300', bar: 'bg-peak-primary' }
  if (strength >= 30) return { label: 'Cooling', tone: 'text-peak-amber', bar: 'bg-peak-amber' }
  return { label: 'At risk', tone: 'text-peak-red', bar: 'bg-peak-red' }
}

/** Default profile for people without a hand-authored mock profile. */
function profileFor(person: Person): RelationshipProfile {
  const existing = MOCK_RELATIONSHIP_PROFILES[person.id]
  if (existing) return existing
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

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------

function Avatar({ person, size = 'md' }: { person: Person; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-14 w-14 text-lg' : size === 'sm' ? 'h-9 w-9 text-xs' : 'h-12 w-12 text-sm'
  if (person.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={person.avatarUrl}
        alt={person.name}
        className={`${dim} shrink-0 rounded-2xl object-cover ring-1 ring-white/10`}
      />
    )
  }
  return (
    <span
      style={avatarStyle(person.name)}
      className={`${dim} flex shrink-0 items-center justify-center rounded-2xl font-semibold text-white ring-1 ring-white/15`}
    >
      {initials(person.name)}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Person card
// ---------------------------------------------------------------------------

function PersonCard({ person, index }: { person: Person; index: number }) {
  const profile = profileFor(person)
  const meta = strengthMeta(profile.strength)
  const openCount = profile.openItems.length

  return (
    <Link href={`/people/${person.id}`} className="group block">
      <GlassPanel
        className="peak-glass-hover h-full animate-peak-fade-up p-5 transition-all duration-200 group-hover:-translate-y-0.5"
      >
        <div style={{ animationDelay: `${index * 40}ms` }} className="flex h-full flex-col">
          <div className="flex items-start gap-3">
            <Avatar person={person} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-base font-semibold text-peak">{person.name}</h3>
                {person.favorite && (
                  <Star className="h-3.5 w-3.5 shrink-0 fill-peak-amber text-peak-amber" />
                )}
              </div>
              <p className="truncate text-sm text-peak-muted">
                {person.title}
                {person.title && person.company ? ' · ' : ''}
                {person.company}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-peak-dim transition-all group-hover:translate-x-0.5 group-hover:text-peak-primary-300" />
          </div>

          {/* Strength meter */}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium uppercase tracking-wider text-peak-dim">Relationship</span>
              <span className={`font-medium ${meta.tone}`}>
                {meta.label} · {profile.strength}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full ${meta.bar} transition-all`}
                style={{ width: `${profile.strength}%` }}
              />
            </div>
          </div>

          {/* Footer meta */}
          <div className="mt-4 flex items-center justify-between text-xs text-peak-muted">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-peak-dim" />
              {relativeTime(profile.lastInteraction)}
            </span>
            {openCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-peak-amber/10 px-2 py-0.5 font-medium text-peak-amber ring-1 ring-peak-amber/20">
                {openCount} open
              </span>
            )}
          </div>
        </div>
      </GlassPanel>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PeoplePage() {
  const [query, setQuery] = useState('')

  const people = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? MOCK_PEOPLE.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.company || '').toLowerCase().includes(q) ||
            (p.title || '').toLowerCase().includes(q) ||
            (p.email || '').toLowerCase().includes(q),
        )
      : [...MOCK_PEOPLE]
    // Sort by relationship strength, favorites floated by their strength anyway.
    return list.sort((a, b) => profileFor(b).strength - profileFor(a).strength)
  }, [query])

  const totalOpen = useMemo(
    () => MOCK_PEOPLE.reduce((sum, p) => sum + profileFor(p).strength * 0 + profileFor(p).openItems.length, 0),
    [],
  )

  return (
    <PeakShell>
      {/* Header */}
      <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <SectionLabel className="mb-2">Relationship Intelligence</SectionLabel>
          <h1 className="text-4xl font-semibold tracking-tight text-peak sm:text-5xl">
            People<span className="text-peak-primary-300"> — Relationship Intelligence</span>
          </h1>
          <p className="mt-3 max-w-xl text-base text-peak-muted">
            Everyone you work with, understood. Lisa connects every meeting, message, note, and
            task into one living profile per person.
          </p>
        </div>
        <div className="w-full max-w-sm lg:w-80">
          <AskLisaBar placeholder="Ask Lisa about anyone…" />
        </div>
      </header>

      {/* Search + summary row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-peak-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people by name, company, or role…"
            className="w-full rounded-xl border border-peak-border bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-peak placeholder:text-peak-dim outline-none transition-colors focus:border-peak-primary/40 focus:bg-white/[0.05]"
          />
        </div>
        <div className="flex shrink-0 items-center gap-4 text-xs text-peak-muted">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4 text-peak-primary-300" />
            {people.length} {people.length === 1 ? 'person' : 'people'}
          </span>
          {totalOpen > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-peak-amber" />
              {totalOpen} open items
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      {people.length === 0 ? (
        <GlassPanel className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="mb-3 h-8 w-8 text-peak-dim" />
          <p className="text-sm font-medium text-peak">No people match “{query}”.</p>
          <p className="mt-1 text-sm text-peak-muted">Try a different name, company, or role.</p>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {people.map((person, i) => (
            <PersonCard key={person.id} person={person} index={i} />
          ))}
        </div>
      )}
    </PeakShell>
  )
}
