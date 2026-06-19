'use client'

import React from 'react'

export interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  /** Add a purple glow halo around the panel (hero / Lisa cards). */
  glow?: boolean
  /** Optional element type override (defaults to div). */
  as?: keyof React.JSX.IntrinsicElements
  onClick?: () => void
}

/**
 * The standard floating glass panel used everywhere in the Peak OS.
 * bg-peak-glass + hairline border + backdrop blur + soft shadow.
 */
export default function GlassPanel({
  children,
  className = '',
  glow = false,
  as: Tag = 'div',
  onClick,
}: GlassPanelProps) {
  return (
    <Tag
      onClick={onClick}
      className={[
        'peak-glass',
        glow ? 'peak-glass-glow' : '',
        'p-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  )
}
