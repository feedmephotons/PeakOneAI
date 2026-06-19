'use client'

import React from 'react'

export interface SectionLabelProps {
  children: React.ReactNode
  className?: string
  /** Optional right-aligned action (e.g. "View all"). */
  action?: React.ReactNode
}

/**
 * Uppercase muted section label — "TODAY'S FOCUS", "ACTIVITY FEED", etc.
 * Matches the small tracked caps from the mockups.
 */
export default function SectionLabel({ children, className = '', action }: SectionLabelProps) {
  return (
    <div className={['flex items-center justify-between', className].filter(Boolean).join(' ')}>
      <span className="text-xs font-medium uppercase tracking-wider text-peak-muted">
        {children}
      </span>
      {action ? <span className="text-xs font-medium text-peak-primary-300">{action}</span> : null}
    </div>
  )
}
