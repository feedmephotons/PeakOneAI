'use client'

import React from 'react'

export interface QuickAction {
  id: string | number
  label: string
  /** lucide icon element, e.g. <Plus className="w-5 h-5" /> */
  icon: React.ReactNode
  onClick?: () => void
  href?: string
}

export interface QuickActionsProps {
  actions: QuickAction[]
  /** Number of columns in the grid. Defaults to 4. */
  columns?: number
  className?: string
}

/** Grid of icon + label quick action buttons (New Note, New Task, etc.). */
export default function QuickActions({ actions, columns = 4, className = '' }: QuickActionsProps) {
  return (
    <div
      className={['grid gap-3', className].filter(Boolean).join(' ')}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {actions.map((action) => {
        const content = (
          <>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-peak-primary/15 text-peak-primary-300 transition-colors group-hover:bg-peak-primary/25">
              {action.icon}
            </span>
            <span className="text-xs font-medium text-peak-muted">{action.label}</span>
          </>
        )
        const cls =
          'group flex flex-col items-center gap-2 rounded-xl border border-peak-border bg-white/[0.02] p-3 text-center transition-colors hover:bg-white/[0.05]'
        return action.href ? (
          <a key={action.id} href={action.href} className={cls}>
            {content}
          </a>
        ) : (
          <button key={action.id} onClick={action.onClick} className={cls}>
            {content}
          </button>
        )
      })}
    </div>
  )
}
