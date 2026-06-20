'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bot, Lightbulb, CheckCircle, X, Clock, Sparkles } from 'lucide-react'
import {
  MOCK_PRIORITIES,
  MOCK_MISSION_RECOMMENDATIONS,
  MOCK_MISSION,
} from '@/lib/peak/mock'

type SuggestionType = 'task' | 'deadline' | 'meeting' | 'message'
type Priority = 'high' | 'medium' | 'low'

interface Suggestion {
  id: string
  text: string
  type: SuggestionType
  priority: Priority
  /** Where Accept should take the user (deep link), or a Lisa prompt. */
  actionHref: string
  lisaPrompt?: string
}

const PRIORITY_RANK: Record<string, Priority> = {
  URGENT: 'high',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

const TONE_PRIORITY: Record<string, Priority> = {
  red: 'high',
  amber: 'medium',
  green: 'low',
  primary: 'medium',
}

/**
 * Suggestions are derived from the canonical Acme Corp world:
 *  - the Daily Brief top priorities (MOCK_PRIORITIES)
 *  - Lisa's mission recommendations (MOCK_MISSION_RECOMMENDATIONS)
 * Deterministic / SSR-safe. Accept routes to the real surface (people, mission,
 * Lisa); Snooze/Dismiss persist to localStorage so the demo state survives reloads.
 */
function buildSuggestions(): Suggestion[] {
  const fromPriorities: Suggestion[] = MOCK_PRIORITIES.map((p) => {
    // Route each priority to the most relevant surface.
    let actionHref = '/lisa'
    let lisaPrompt: string | undefined = p.title
    if (p.id === 'prio-1') {
      actionHref = '/people/contact-brian-miller'
      lisaPrompt = undefined
    } else if (p.id === 'prio-2') {
      actionHref = `/missions/${MOCK_MISSION.id}`
      lisaPrompt = undefined
    }
    return {
      id: p.id,
      text: p.detail ? `${p.title} — ${p.detail}` : p.title,
      type: p.id === 'prio-3' ? 'task' : p.id === 'prio-1' ? 'message' : 'task',
      priority: PRIORITY_RANK[p.priority] ?? 'medium',
      actionHref,
      lisaPrompt,
    }
  })

  const fromRecs: Suggestion[] = MOCK_MISSION_RECOMMENDATIONS.map((rec) => ({
    id: rec.id,
    text: `${rec.title} — ${rec.body}`,
    type: 'task',
    priority: TONE_PRIORITY[rec.tone || 'primary'] ?? 'medium',
    actionHref: '/lisa',
    lisaPrompt: rec.title,
  }))

  return [...fromPriorities, ...fromRecs]
}

const SNOOZE_KEY = 'ai-suggestions:snoozed'
const DISMISS_KEY = 'ai-suggestions:dismissed'

function loadIds(key: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

export default function AISuggestionsPage() {
  const router = useRouter()
  const all = useMemo(() => buildSuggestions(), [])
  const [dismissed, setDismissed] = useState<string[]>([])
  const [snoozed, setSnoozed] = useState<string[]>([])

  // Hydrate persisted state after mount (SSR-safe).
  useEffect(() => {
    setDismissed(loadIds(DISMISS_KEY))
    setSnoozed(loadIds(SNOOZE_KEY))
  }, [])

  const persist = (key: string, ids: string[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(ids))
    } catch {
      /* ignore quota errors */
    }
  }

  const accept = (s: Suggestion) => {
    if (s.lisaPrompt) {
      router.push(`/lisa?prompt=${encodeURIComponent(s.lisaPrompt)}`)
    } else {
      router.push(s.actionHref)
    }
  }

  const snooze = (id: string) => {
    const next = Array.from(new Set([...snoozed, id]))
    setSnoozed(next)
    persist(SNOOZE_KEY, next)
  }

  const unsnooze = (id: string) => {
    const next = snoozed.filter((x) => x !== id)
    setSnoozed(next)
    persist(SNOOZE_KEY, next)
  }

  const dismiss = (id: string) => {
    const next = Array.from(new Set([...dismissed, id]))
    setDismissed(next)
    persist(DISMISS_KEY, next)
  }

  const resetAll = () => {
    setDismissed([])
    setSnoozed([])
    persist(DISMISS_KEY, [])
    persist(SNOOZE_KEY, [])
  }

  const active = all.filter((s) => !dismissed.includes(s.id) && !snoozed.includes(s.id))
  const snoozedItems = all.filter((s) => snoozed.includes(s.id) && !dismissed.includes(s.id))

  const priorityBadge = (priority: Priority) =>
    priority === 'high'
      ? 'bg-peak-red/15 text-peak-red'
      : priority === 'medium'
        ? 'bg-amber-400/15 text-amber-300'
        : 'bg-peak-green/15 text-peak-green'

  return (
    <div className="peak-os min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-peak-primary/15">
              <Lightbulb className="h-7 w-7 text-peak-primary-300" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-peak">Suggestions</h1>
              <p className="text-sm text-peak-muted">Lisa&rsquo;s recommended next moves for today</p>
            </div>
          </div>
          {(dismissed.length > 0 || snoozed.length > 0) && (
            <button
              onClick={resetAll}
              className="rounded-lg border border-peak-border bg-white/[0.03] px-3 py-2 text-xs font-medium text-peak-muted transition hover:bg-white/[0.06]"
            >
              Reset suggestions
            </button>
          )}
        </div>

        {/* Active suggestions */}
        {active.length === 0 ? (
          <div className="peak-glass p-12 text-center">
            <CheckCircle className="mx-auto mb-3 h-12 w-12 text-peak-green" />
            <p className="font-medium text-peak">You&rsquo;re all caught up</p>
            <p className="mt-1 text-sm text-peak-muted">No active suggestions. Snoozed items reappear below.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {active.map((s) => (
              <div key={s.id} className="peak-glass flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-peak-primary/15">
                  <Bot className="h-5 w-5 text-peak-primary-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-peak">{s.text}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${priorityBadge(s.priority)}`}>
                      {s.priority} priority
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => accept(s)}
                    title="Accept — take action"
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-peak-green transition hover:bg-peak-green/10"
                  >
                    {s.lisaPrompt ? <Sparkles className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    Accept
                  </button>
                  <button
                    onClick={() => snooze(s.id)}
                    title="Snooze"
                    className="rounded-lg p-2 text-peak-muted transition hover:bg-white/[0.06]"
                  >
                    <Clock className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => dismiss(s.id)}
                    title="Dismiss"
                    className="rounded-lg p-2 text-peak-red transition hover:bg-peak-red/10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Snoozed */}
        {snoozedItems.length > 0 && (
          <div className="mt-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-peak-muted">Snoozed</p>
            <div className="space-y-2">
              {snoozedItems.map((s) => (
                <div key={s.id} className="peak-glass flex items-center gap-4 p-3 opacity-70">
                  <Clock className="h-4 w-4 shrink-0 text-peak-muted" />
                  <p className="flex-1 text-sm text-peak-muted">{s.text}</p>
                  <button
                    onClick={() => unsnooze(s.id)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-peak-primary-300 transition hover:bg-peak-primary/10"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
