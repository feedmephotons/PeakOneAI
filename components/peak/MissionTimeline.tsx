'use client'

import React from 'react'
import { Check } from 'lucide-react'

export type MilestoneState = 'done' | 'active' | 'upcoming'

export interface MissionTimelineStep {
  label: string
  /** Secondary line under the label, e.g. a date "Jan 15". */
  date?: string
  /** Optional status caption under the date, e.g. "Completed" / "In Progress". */
  caption?: string
  state: MilestoneState
}

export interface MissionTimelineProps {
  steps: MissionTimelineStep[]
  className?: string
}

/**
 * Horizontal milestone timeline with connecting line and check / active /
 * upcoming nodes. The active node carries a purple glow.
 */
export default function MissionTimeline({ steps, className = '' }: MissionTimelineProps) {
  return (
    <div className={['relative w-full', className].filter(Boolean).join(' ')}>
      <div className="flex items-start justify-between">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1
          return (
            <div key={i} className="relative flex flex-1 flex-col items-center">
              {/* connector line to the next node */}
              {!isLast && (
                <span
                  className="absolute top-3 left-1/2 h-px w-full"
                  style={{
                    background:
                      step.state === 'done'
                        ? 'linear-gradient(90deg, #34D399 0%, rgba(255,255,255,0.12) 100%)'
                        : 'rgba(255,255,255,0.12)',
                  }}
                />
              )}

              {/* node */}
              <span className="relative z-10 flex h-6 w-6 items-center justify-center">
                {step.state === 'done' && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-peak-green text-[#0b1f17]">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                )}
                {step.state === 'active' && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-peak-primary shadow-[0_0_16px_4px_var(--peak-glow)] ring-4 ring-peak-primary/25">
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </span>
                )}
                {step.state === 'upcoming' && (
                  <span className="h-5 w-5 rounded-full border-2 border-white/20 bg-peak-bg" />
                )}
              </span>

              {/* labels */}
              <div className="mt-2.5 text-center">
                {step.date && <div className="text-xs font-medium text-peak">{step.date}</div>}
                <div className="text-xs text-peak-muted">{step.label}</div>
                {step.caption && (
                  <div
                    className={[
                      'mt-0.5 text-[10px] font-medium',
                      step.state === 'done'
                        ? 'text-peak-green'
                        : step.state === 'active'
                          ? 'text-peak-primary-300'
                          : 'text-peak-dim',
                    ].join(' ')}
                  >
                    {step.caption}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
