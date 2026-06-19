'use client'

import React from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'

export interface LisaInsightProps {
  title?: string
  body: React.ReactNode
  /** CTA label + handler. If omitted, no button renders. */
  cta?: { label: string; onClick?: () => void; href?: string }
  className?: string
}

/**
 * Small purple insight card used across pages ("Lisa Insight" / "Insight of
 * the day" / "Lisa Recommendations"). Subtle purple-tinted glass.
 */
export default function LisaInsight({ title = 'Lisa Insight', body, cta, className = '' }: LisaInsightProps) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl border border-peak-primary/20 bg-peak-primary/[0.06] p-5 backdrop-blur-xl',
        className,
      ].join(' ')}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-peak-primary/20 blur-2xl" />
      <div className="relative">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-peak-primary/20 text-peak-primary-300">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-semibold text-peak">{title}</span>
        </div>
        <div className="text-sm leading-relaxed text-peak-muted">{body}</div>
        {cta &&
          (cta.href ? (
            <a
              href={cta.href}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-peak-primary-300 hover:text-peak-primary"
            >
              {cta.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          ) : (
            <button
              onClick={cta.onClick}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-peak-primary/15 px-3 py-1.5 text-sm font-medium text-peak-primary-300 transition-colors hover:bg-peak-primary/25"
            >
              {cta.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ))}
      </div>
    </div>
  )
}
