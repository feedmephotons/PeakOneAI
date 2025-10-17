'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import DarkModeToggle from './DarkModeToggle'
import { NotificationCenter } from '@/components/notifications/NotificationProvider'
import {
  Home, FileText, MessageSquare, CheckCircle, Video, Calendar,
  Search, Brain, Phone, FolderOpen, ChevronDown, User, Settings, LogOut, Sparkles
} from 'lucide-react'
import { useKeyboardShortcuts } from './KeyboardShortcuts'

// Conditionally import Clerk components only if available
let OrganizationSwitcher: React.ComponentType<{
  appearance?: Record<string, unknown>
  hidePersonal?: boolean
}> | null = null

let UserButton: React.ComponentType<{
  appearance?: Record<string, unknown>
  afterSignOutUrl?: string
}> | null = null

// Dynamic import to avoid build-time issues
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  import('@clerk/nextjs').then((ClerkComponents) => {
    OrganizationSwitcher = ClerkComponents.OrganizationSwitcher as typeof OrganizationSwitcher
    UserButton = ClerkComponents.UserButton as typeof UserButton
  }).catch(() => {
    // Clerk not available, components remain null
  })
}

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/video', label: 'Calls', icon: Phone },
  { href: '/calendar', label: 'Meetings', icon: Video },
  { href: '/tasks', label: 'Projects', icon: CheckCircle },
  { href: '/files', label: 'Files', icon: FolderOpen },
  { href: '/lisa', label: 'AI Notes', icon: MessageSquare },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Navigation() {
  const pathname = usePathname()
  const { openSearch } = useKeyboardShortcuts()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Peak AI</span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 8).map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-gray-900 dark:text-white font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={openSearch}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl transition-all hover:shadow-md border border-gray-200/50 dark:border-gray-700/50"
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline">Search</span>
              <kbd className="hidden xl:inline px-2 py-0.5 text-xs bg-white/80 dark:bg-gray-700/80 border border-gray-300/50 dark:border-gray-600/50 rounded">⌘K</kbd>
            </button>

            {/* AI Assistant Quick Access */}
            <button
              onClick={() => {
                // This will open the global AI assistant
                const event = new CustomEvent('openPeakAI')
                window.dispatchEvent(event)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all"
              title="Ask Peak AI (Cmd/Ctrl + J)"
            >
              <Brain className="w-4 h-4" />
              <span className="hidden lg:inline text-sm font-medium">Peak AI</span>
            </button>

            <NotificationCenter />
            <DarkModeToggle />

            {/* Profile Dropdown */}
            {UserButton ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-xl",
                  }
                }}
                afterSignOutUrl="/"
              />
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 backdrop-blur-xl">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Guest User</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">guest@peakai.com</p>
                    </div>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}