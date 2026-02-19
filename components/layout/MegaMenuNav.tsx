'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Home, Users, Video, MessageSquare, FolderOpen, CheckSquare,
  Settings, Brain,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app-store'
import { CORE_NAV } from '@/config/navigation'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Users, Video, MessageSquare, FolderOpen, CheckSquare,
}

interface MegaMenuNavProps {
  className?: string
}

export function MegaMenuNav({ className }: MegaMenuNavProps) {
  const pathname = usePathname()
  const { navStyle } = useAppStore()

  // Only render if navStyle is 'megamenu'
  if (navStyle !== 'megamenu') {
    return null
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div className="relative flex h-full">
      <aside
        className={cn(
          'relative flex h-full w-52 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
          className
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 px-4 border-b border-gray-100 dark:border-gray-800">
          <Image
            src="/peakone-logo.png"
            alt="Peak One"
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <span className="font-semibold text-gray-900 dark:text-white text-[15px]">Peak One</span>
        </div>

        {/* Core Nav */}
        <div className="flex-1 overflow-y-auto p-2">
          {CORE_NAV.map((item) => {
            const Icon = ICON_MAP[item.icon]
            const active = isActive(item.href)

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'group flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 transition-colors',
                  active
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                {Icon && <Icon className="w-4 h-4 shrink-0" />}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-2">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openPeakAI'))}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white transition-colors mb-0.5"
          >
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium">Lisa</span>
          </button>
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors',
              isActive('/settings')
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      </aside>
    </div>
  )
}

export default MegaMenuNav
