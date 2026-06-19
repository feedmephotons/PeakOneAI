'use client'

import React from 'react'

export type ActivityTone = 'primary' | 'green' | 'amber' | 'red' | 'blue' | 'neutral'

export interface ActivityItem {
  id: string | number
  /** lucide icon element; falls back to a dot. */
  icon?: React.ReactNode
  title: string
  subtitle?: string
  time?: string
  tone?: ActivityTone
  /** Show an unread dot on the right. */
  unread?: boolean
  onClick?: () => void
}

export interface ActivityFeedProps {
  items: ActivityItem[]
  className?: string
}

const ICON_TONE: Record<ActivityTone, string> = {
  primary: 'bg-peak-primary/15 text-peak-primary-300',
  green: 'bg-peak-green/15 text-peak-green',
  amber: 'bg-peak-amber/15 text-peak-amber',
  red: 'bg-peak-red/15 text-peak-red',
  blue: 'bg-peak-blue/15 text-peak-blue',
  neutral: 'bg-white/5 text-peak-muted',
}

/** Recent activity list for the right rail. */
export default function ActivityFeed({ items, className = '' }: ActivityFeedProps) {
  return (
    <ul className={['space-y-1', className].filter(Boolean).join(' ')}>
      {items.map((item) => (
        <li key={item.id}>
          <button
            onClick={item.onClick}
            className="flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/5"
          >
            <span
              className={[
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                ICON_TONE[item.tone ?? 'neutral'],
              ].join(' ')}
            >
              {item.icon ?? <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-peak">{item.title}</span>
              {item.subtitle && (
                <span className="block truncate text-xs text-peak-muted">{item.subtitle}</span>
              )}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {item.time && <span className="text-xs text-peak-dim">{item.time}</span>}
              {item.unread && <span className="h-1.5 w-1.5 rounded-full bg-peak-primary" />}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
