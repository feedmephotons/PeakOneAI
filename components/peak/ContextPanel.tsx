'use client'

import React, { useState } from 'react'
import { Link2 } from 'lucide-react'

export interface ContextConnection {
  id: string | number
  /** lucide icon element OR an avatar URL string. */
  icon?: React.ReactNode
  avatar?: string
  title: string
  subtitle?: string
  /** Which filter tab this belongs to, e.g. "People". */
  group?: string
  onClick?: () => void
}

export interface ContextSection {
  /** Section heading, e.g. "Connections". Optional. */
  label?: string
  items: ContextConnection[]
}

export interface ContextPanelProps {
  /** One or more connection sections. */
  sections: ContextSection[]
  /** Filter tabs across the top. Defaults to All/People/Projects/Files/Meetings. */
  tabs?: string[]
  title?: string
  /** Footer slot — e.g. a <LisaInsight /> and recent-activity block. */
  footer?: React.ReactNode
  className?: string
}

const DEFAULT_TABS = ['All', 'People', 'Projects', 'Files', 'Meetings']

/**
 * Memory's right-side "Related to this note" panel — filter tabs + grouped
 * connection rows (people, projects, files, meetings).
 */
export default function ContextPanel({
  sections,
  tabs = DEFAULT_TABS,
  title = 'Related to this note',
  footer,
  className = '',
}: ContextPanelProps) {
  const [active, setActive] = useState(tabs[0])

  const matches = (item: ContextConnection) =>
    active === tabs[0] || !item.group || item.group === active

  return (
    <div className={['space-y-4', className].filter(Boolean).join(' ')}>
      <div className="peak-glass p-5">
        <div className="mb-3 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-peak-primary-300" />
          <span className="text-sm font-semibold text-peak">{title}</span>
        </div>

        {/* tabs */}
        <div className="mb-4 flex items-center gap-4 border-b border-peak-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={[
                '-mb-px border-b-2 pb-2 text-xs font-medium transition-colors',
                active === tab
                  ? 'border-peak-primary text-peak'
                  : 'border-transparent text-peak-muted hover:text-peak',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* grouped connections */}
        <div className="space-y-4">
          {sections.map((section, si) => {
            const items = section.items.filter(matches)
            if (items.length === 0) return null
            return (
              <div key={si}>
                {section.label && (
                  <div className="mb-2 text-xs font-medium uppercase tracking-wider text-peak-dim">
                    {section.label}
                  </div>
                )}
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={item.onClick}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
                      >
                        {item.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.avatar} alt="" className="h-8 w-8 rounded-lg object-cover" />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-peak-primary-300">
                            {item.icon}
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-peak">{item.title}</span>
                          {item.subtitle && (
                            <span className="block truncate text-xs text-peak-muted">{item.subtitle}</span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {footer}
    </div>
  )
}
