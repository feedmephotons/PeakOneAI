'use client'

import React from 'react'

export type PeakTone = 'primary' | 'green' | 'amber' | 'red' | 'blue' | 'neutral'

export interface StatTileProps {
  /** lucide-react icon element, e.g. <Calendar className="w-5 h-5" />. Optional. */
  icon?: React.ReactNode
  value: React.ReactNode
  label: string
  sublabel?: string
  /** Color accent for the icon chip + value. Defaults to 'primary'. */
  tone?: PeakTone
  /** Render as a standalone glass tile (mockup 1) vs. a borderless cell (mockup 2). */
  variant?: 'tile' | 'cell'
  className?: string
}

const TONE_TEXT: Record<PeakTone, string> = {
  primary: 'text-peak-primary-300',
  green: 'text-peak-green',
  amber: 'text-peak-amber',
  red: 'text-peak-red',
  blue: 'text-peak-blue',
  neutral: 'text-peak',
}

const TONE_CHIP: Record<PeakTone, string> = {
  primary: 'bg-peak-primary/15 text-peak-primary-300 ring-peak-primary/20',
  green: 'bg-peak-green/15 text-peak-green ring-peak-green/20',
  amber: 'bg-peak-amber/15 text-peak-amber ring-peak-amber/20',
  red: 'bg-peak-red/15 text-peak-red ring-peak-red/20',
  blue: 'bg-peak-blue/15 text-peak-blue ring-peak-blue/20',
  neutral: 'bg-white/5 text-peak-muted ring-white/10',
}

/**
 * A focus stat — big number + label + optional icon chip and sublabel.
 * Used for "Today's Focus" (3 Priorities / 2 Meetings / 5 Tasks / 1 at risk).
 */
export default function StatTile({
  icon,
  value,
  label,
  sublabel,
  tone = 'primary',
  variant = 'cell',
  className = '',
}: StatTileProps) {
  const inner = (
    <div className="flex items-start gap-3">
      {icon ? (
        <span
          className={[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1',
            TONE_CHIP[tone],
          ].join(' ')}
        >
          {icon}
        </span>
      ) : null}
      <div className="min-w-0">
        <div className={['text-3xl font-semibold leading-none tracking-tight', TONE_TEXT[tone]].join(' ')}>
          {value}
        </div>
        <div className="mt-1.5 text-sm font-medium text-peak">{label}</div>
        {sublabel ? <div className="mt-0.5 text-xs text-peak-muted">{sublabel}</div> : null}
      </div>
    </div>
  )

  if (variant === 'tile') {
    return (
      <div
        className={[
          'peak-glass peak-glass-hover p-5 transition-colors duration-200',
          className,
        ].join(' ')}
      >
        {inner}
      </div>
    )
  }

  return <div className={['px-2', className].filter(Boolean).join(' ')}>{inner}</div>
}
