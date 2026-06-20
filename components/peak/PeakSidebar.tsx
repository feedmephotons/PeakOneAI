'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Home, Target, BrainCircuit, CheckSquare, Calendar,
  MessageSquare, Phone, FolderOpen, FilePlus, BarChart3, Zap, Plug, Sparkles,
  Settings, HelpCircle, ChevronDown,
} from 'lucide-react'

interface PeakNavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

// Nav order locked by the build spec / mockups.
const NAV: PeakNavItem[] = [
  { id: 'daily-brief', label: 'Daily Brief', href: '/', icon: LayoutDashboard },
  { id: 'home', label: 'Home', href: '/home', icon: Home },
  { id: 'missions', label: 'Missions', href: '/missions', icon: Target },
  { id: 'memory', label: 'Memory', href: '/memory', icon: BrainCircuit },
  { id: 'tasks', label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', href: '/calendar', icon: Calendar },
  { id: 'messages', label: 'Messages', href: '/messages', icon: MessageSquare },
  { id: 'calls', label: 'Calls', href: '/calls', icon: Phone },
  { id: 'files', label: 'Files', href: '/files', icon: FolderOpen },
  { id: 'create', label: 'Create', href: '/create', icon: FilePlus },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { id: 'automations', label: 'Automations', href: '/automation', icon: Zap },
  { id: 'integrations', label: 'Integrations', href: '/settings/integrations', icon: Plug },
]

const DEMO_USER = { name: 'Sarah Chen', company: 'Acme Corp', avatar: '' }

export default function PeakSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const openLisa = () => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true }),
    )
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true }),
    )
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden md:flex h-full w-[248px] flex-col bg-peak-2 border-r border-peak-border peak-scrollbar">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-peak-primary to-peak-primary-600 shadow-[0_0_16px_var(--peak-glow)]">
          <Sparkles className="h-4 w-4 text-white" />
        </span>
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-peak">Peak One</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2 peak-scrollbar">
        {NAV.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.id}
              href={item.href}
              className={[
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200',
                active
                  ? 'bg-peak-primary/15 text-peak font-medium shadow-[0_0_24px_-6px_var(--peak-glow)] ring-1 ring-peak-primary/20'
                  : 'text-peak-muted hover:bg-white/[0.04] hover:text-peak',
              ].join(' ')}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-peak-primary shadow-[0_0_8px_var(--peak-glow)]" />
              )}
              <Icon
                className={[
                  'h-[18px] w-[18px] shrink-0',
                  active ? 'text-peak-primary-300' : 'text-peak-muted group-hover:text-peak',
                ].join(' ')}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom: user chip + Ask Lisa */}
      <div className="border-t border-peak-border p-3 space-y-2">
        <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.04]">
          {DEMO_USER.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={DEMO_USER.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-peak-primary to-peak-primary-600 text-sm font-semibold text-white">
              {DEMO_USER.name.split(' ').map((n) => n[0]).join('')}
            </span>
          )}
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-medium text-peak">{DEMO_USER.name}</span>
            <span className="block truncate text-xs text-peak-muted">{DEMO_USER.company}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-peak-dim" />
        </button>

        <button
          onClick={openLisa}
          className="flex w-full items-center gap-3 rounded-xl border border-peak-primary/20 bg-peak-primary/[0.08] px-3 py-2.5 text-sm font-medium text-peak transition-colors hover:bg-peak-primary/[0.14]"
        >
          <Sparkles className="h-4 w-4 text-peak-primary-300" />
          <span className="flex-1 text-left">Ask Lisa AI</span>
          <kbd className="rounded border border-peak-border bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-peak-dim">
            ⌘ K
          </kbd>
        </button>

        <div className="flex items-center gap-1 px-1 pt-1 text-peak-dim">
          <Link href="/settings" className="rounded-lg p-1.5 hover:bg-white/5 hover:text-peak-muted" title="Settings">
            <Settings className="h-4 w-4" />
          </Link>
          <Link href="/help" className="rounded-lg p-1.5 hover:bg-white/5 hover:text-peak-muted" title="Help">
            <HelpCircle className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  )
}
