'use client'

import React from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'

/** A single briefing line. Plain string, or rich segments with emphasis. */
export type BriefingSegment = { text: string; emphasis?: 'purple' | 'red' }
export type BriefingLine = string | BriefingSegment[]

export interface LisaBriefingCardProps {
  /** 1–3 short lines; segments can be emphasized purple (good) or red (alert). */
  lines: BriefingLine[]
  /** Section label above the text. Defaults to "LISA'S BRIEFING". */
  label?: string
  /** "View full briefing" handler. */
  onView?: () => void
  viewLabel?: string
  className?: string
}

const EMPHASIS: Record<NonNullable<BriefingSegment['emphasis']>, string> = {
  purple: 'text-peak-primary-300',
  red: 'text-peak-red',
}

function renderLine(line: BriefingLine, i: number) {
  if (typeof line === 'string') {
    return (
      <p key={i} className="text-xl font-medium leading-snug text-peak sm:text-2xl">
        {line}
      </p>
    )
  }
  return (
    <p key={i} className="text-xl font-medium leading-snug text-peak sm:text-2xl">
      {line.map((seg, j) => (
        <span key={j} className={seg.emphasis ? EMPHASIS[seg.emphasis] : undefined}>
          {seg.text}
        </span>
      ))}
    </p>
  )
}

/**
 * Lisa's Briefing — the hero panel with the cosmic purple orb + orbital rings
 * + aurora, all pure CSS (no images). Left = emphasis lines + View full
 * briefing; right = the orb art.
 */
export default function LisaBriefingCard({
  lines,
  label = "Lisa's Briefing",
  onView,
  viewLabel = 'View full briefing',
  className = '',
}: LisaBriefingCardProps) {
  return (
    <div className={['peak-glass peak-glass-glow relative overflow-hidden p-7 sm:p-8', className].join(' ')}>
      {/* deep-space aurora wash behind everything */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/2 h-[140%] w-2/3 -translate-y-1/2 bg-[radial-gradient(60%_120%_at_75%_50%,rgba(139,92,246,0.22)_0%,transparent_60%)] blur-md" />
        <div className="absolute right-10 top-1/2 h-[120%] w-1/2 -translate-y-1/2 bg-[radial-gradient(40%_80%_at_90%_40%,rgba(124,58,237,0.18)_0%,transparent_60%)]" />
      </div>

      <div className="relative flex items-center gap-6">
        {/* Text side */}
        <div className="relative z-10 flex-1">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-peak-muted">{label}</span>
            <Sparkles className="h-3.5 w-3.5 text-peak-primary-300" />
          </div>
          <div className="space-y-3">{lines.map(renderLine)}</div>
          {onView && (
            <button
              onClick={onView}
              className="group mt-6 inline-flex items-center gap-2 rounded-lg border border-peak-border bg-white/5 px-4 py-2 text-sm font-medium text-peak transition-colors hover:bg-white/10"
            >
              {viewLabel}
              <ArrowRight className="h-4 w-4 text-peak-primary-300 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>

        {/* Cosmic orb art — pure CSS */}
        <div className="relative hidden h-56 w-72 shrink-0 items-center justify-center md:flex">
          <CosmicOrb />
        </div>
      </div>
    </div>
  )
}

/** Pure-CSS cosmic orb: glowing purple planet + orbital rings + star sparkle. */
function CosmicOrb() {
  return (
    <div className="relative flex h-48 w-48 items-center justify-center">
      {/* orbital rings (tilted ellipses) */}
      <div
        className="peak-orb-ring animate-peak-float"
        style={{ width: 240, height: 96, transform: 'rotate(-18deg)' }}
      />
      <div
        className="peak-orb-ring"
        style={{ width: 200, height: 72, transform: 'rotate(-18deg)', opacity: 0.6 }}
      />

      {/* the orb */}
      <div className="peak-orb animate-peak-pulse-glow relative h-28 w-28">
        {/* central star sparkle */}
        <svg
          viewBox="0 0 24 24"
          className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
          fill="currentColor"
        >
          <path d="M12 0c.6 5.4 2.6 7.4 8 8-5.4.6-7.4 2.6-8 8-.6-5.4-2.6-7.4-8-8 5.4-.6 7.4-2.6 8-8z" />
        </svg>
      </div>

      {/* scattered star dots */}
      <span className="absolute right-2 top-4 h-1 w-1 rounded-full bg-white/80" />
      <span className="absolute bottom-6 left-4 h-0.5 w-0.5 rounded-full bg-peak-primary-300" />
      <span className="absolute right-10 bottom-2 h-0.5 w-0.5 rounded-full bg-white/60" />
    </div>
  )
}
