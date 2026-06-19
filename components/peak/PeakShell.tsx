'use client'

import React from 'react'

export interface PeakShellProps {
  children: React.ReactNode
  /** Constrain content to a centered max-width column. Defaults to true. */
  contained?: boolean
  /** Max width of the content column when contained. */
  maxWidth?: string
  className?: string
}

/**
 * Wraps a page in the navy "operating system" background + aurora bloom and
 * provides a centered, padded content area. Pages render their content as
 * children; the navy app background is also applied at the layout level, so
 * PeakShell is primarily for the content column + per-page aurora.
 */
export default function PeakShell({
  children,
  contained = true,
  maxWidth = 'max-w-[1600px]',
  className = '',
}: PeakShellProps) {
  return (
    <div className={['peak-os relative min-h-full', className].filter(Boolean).join(' ')}>
      {/* Faint top-right aurora bloom behind page content */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[420px] w-[620px] rounded-full bg-peak-primary/10 blur-[120px]" />
      </div>
      <div
        className={[
          'relative px-6 py-8 sm:px-8 lg:px-10',
          contained ? `${maxWidth} mx-auto` : 'w-full',
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  )
}
