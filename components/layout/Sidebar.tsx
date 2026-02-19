'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Home, Users, Video, MessageSquare, FolderOpen, CheckSquare,
  Settings, Brain, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { CORE_NAV } from '@/config/navigation'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Users, Video, MessageSquare, FolderOpen, CheckSquare,
}

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-200 z-20 ${
        isCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-gray-100 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/peakone-logo.png"
            alt="Peak One"
            width={24}
            height={24}
            className="h-6 w-6 shrink-0"
          />
          {!isCollapsed && (
            <span className="font-semibold text-gray-900 dark:text-white text-sm">Peak One</span>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Core Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {CORE_NAV.map((item) => {
          const Icon = ICON_MAP[item.icon]
          const active = isActive(item.href)

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 transition-colors ${
                active
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              {Icon && <Icon className="w-4 h-4 shrink-0" />}
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: AI + Settings */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-2">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('openPeakAI'))}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white transition-colors mb-0.5"
          title={isCollapsed ? 'Ask AI' : undefined}
        >
          <Brain className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Lisa</span>}
        </button>
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors ${
            isActive('/settings')
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
          }`}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
        </Link>
      </div>
    </aside>
  )
}
