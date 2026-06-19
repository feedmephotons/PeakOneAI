'use client'

import React from 'react'

export interface PriorityItem {
  id: string | number
  title: string
  /** Right-aligned meta, e.g. "Due today". */
  meta?: string
  /** Tone of the meta dot / text. Defaults to neutral. */
  tone?: 'neutral' | 'amber' | 'red' | 'green'
  onClick?: () => void
}

export interface PriorityListProps {
  items: PriorityItem[]
  /** Show numeric rank badges (01, 02, 03). Defaults to true. */
  numbered?: boolean
  className?: string
}

const META_TONE: Record<NonNullable<PriorityItem['tone']>, string> = {
  neutral: 'text-peak-muted',
  amber: 'text-peak-amber',
  red: 'text-peak-red',
  green: 'text-peak-green',
}

/** Ranked "Top Priorities" list for the right rail. */
export default function PriorityList({ items, numbered = true, className = '' }: PriorityListProps) {
  return (
    <ul className={['space-y-1', className].filter(Boolean).join(' ')}>
      {items.map((item, i) => (
        <li key={item.id}>
          <button
            onClick={item.onClick}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/5"
          >
            {numbered && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-peak-primary/15 text-xs font-semibold text-peak-primary-300">
                {String(i + 1).padStart(2, '0')}
              </span>
            )}
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-peak">{item.title}</span>
            {item.meta && (
              <span className={['shrink-0 text-xs', META_TONE[item.tone ?? 'neutral']].join(' ')}>
                {item.meta}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  )
}
