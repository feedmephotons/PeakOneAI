'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  X, Home, Users, Video, MessageSquare, FolderOpen, CheckSquare,
  Plus, Settings, Brain, BarChart3, Mail, Calendar,
} from 'lucide-react'
import { CORE_NAV } from '@/config/navigation'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Users, Video, MessageSquare, FolderOpen, CheckSquare,
}

const EXTRA_NAV = [
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Mail, label: 'Email', href: '/email' },
  { icon: Calendar, label: 'Calendar', href: '/calendar' },
  { icon: Brain, label: 'Lisa', href: '/lisa' },
]

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 lg:hidden border-r border-gray-200 dark:border-gray-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <Image
              src="/peakone-logo.png"
              alt="Peak One"
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span className="font-semibold text-gray-900 dark:text-white text-sm">Peak One</span>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Core Nav */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="mb-1 px-2 pt-2">
            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Navigation</span>
          </div>
          {CORE_NAV.map((item) => {
            const Icon = ICON_MAP[item.icon]
            const active = isActive(item.href)
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}

          {/* Extra navigation */}
          <div className="mt-4 mb-1 px-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">More</span>
          </div>
          {EXTRA_NAV.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom: Settings */}
        <div className="p-2 border-t border-gray-100 dark:border-gray-800">
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      </div>
    </>
  )
}
