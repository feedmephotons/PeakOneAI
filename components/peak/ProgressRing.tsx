'use client'

import React from 'react'
import type { PeakTone } from './StatTile'

export interface ProgressRingProps {
  /** 0–100 */
  value: number
  /** Diameter in px. Defaults to 200. */
  size?: number
  /** Stroke width in px. Defaults to size/14. */
  strokeWidth?: number
  /** Big text in the center. Defaults to `${value}%`. */
  label?: React.ReactNode
  /** Small text under the center label, e.g. "On Track". */
  sublabel?: React.ReactNode
  /** Arc color accent. Defaults to 'primary'. */
  tone?: PeakTone
  className?: string
}

const TONE_STROKE: Record<PeakTone, string> = {
  primary: '#8B5CF6',
  green: '#34D399',
  amber: '#FBBF24',
  red: '#F87171',
  blue: '#60A5FA',
  neutral: '#9498AD',
}

const TONE_SUBLABEL: Record<PeakTone, string> = {
  primary: 'text-peak-primary-300',
  green: 'text-peak-green',
  amber: 'text-peak-amber',
  red: 'text-peak-red',
  blue: 'text-peak-blue',
  neutral: 'text-peak-muted',
}

/**
 * The mission progress ring — an SVG donut with a purple glow and a big
 * percentage in the middle (the "72%" ring from the mockups).
 */
export default function ProgressRing({
  value,
  size = 200,
  strokeWidth,
  label,
  sublabel,
  tone = 'primary',
  className = '',
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const sw = strokeWidth ?? Math.round(size / 14)
  const radius = (size - sw) / 2
  const circumference = 2 * Math.PI * radius
  const dash = (clamped / 100) * circumference
  const stroke = TONE_STROKE[tone]
  const gradientId = `peak-ring-${tone}`

  return (
    <div
      className={['relative inline-flex items-center justify-center', className].join(' ')}
      style={{ width: size, height: size }}
    >
      {/* glow bloom behind the ring */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full blur-2xl"
        style={{ background: `radial-gradient(circle, ${stroke}55 0%, transparent 65%)` }}
      />
      <svg width={size} height={size} className="relative -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.5" />
            <stop offset="100%" stopColor={stroke} stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={sw}
        />
        {/* progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ filter: `drop-shadow(0 0 6px ${stroke}aa)`, transition: 'stroke-dasharray 600ms cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-semibold tracking-tight text-peak"
          style={{ fontSize: size * 0.22 }}
        >
          {label ?? `${clamped}%`}
        </span>
        {sublabel ? (
          <span className={['mt-1 flex items-center gap-1.5 text-xs font-medium', TONE_SUBLABEL[tone]].join(' ')}>
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: stroke }} />
            {sublabel}
          </span>
        ) : null}
      </div>
    </div>
  )
}
