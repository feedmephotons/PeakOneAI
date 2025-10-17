'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import DarkModeToggle from './DarkModeToggle'
import { NotificationCenter } from '@/components/notifications/NotificationProvider'
import { Search } from 'lucide-react'
import { useKeyboardShortcuts } from './KeyboardShortcuts'
import dynamic from 'next/dynamic'
import { PeakIcon, type IconName } from './icons/PeakIcon'

// Dynamically import Clerk components to avoid SSR issues
const OrganizationSwitcher = dynamic(
  () => import('@clerk/nextjs').then(mod => mod.OrganizationSwitcher),
  { ssr: false }
)
const UserButton = dynamic(
  () => import('@clerk/nextjs').then(mod => mod.UserButton),
  { ssr: false }
)

const navItems: Array<{ href: string; label: string; icon: IconName }> = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/video', label: 'Calls', icon: 'calls' },
  { href: '/calendar', label: 'Meetings', icon: 'meetings' },
  { href: '/tasks', label: 'Projects', icon: 'tasks' },
  { href: '/files', label: 'Files', icon: 'files' },
  { href: '/lisa', label: 'AI Notes', icon: 'messages' },
  { href: '/calendar', label: 'Calendar', icon: 'calendar' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
]

export default function Navigation() {
  const pathname = usePathname()
  const { openSearch } = useKeyboardShortcuts()

  // Check if Clerk is available
  const hasClerkKey = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  return (
    <nav className="sticky top-0 z-40 glass border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 p-2">
              <PeakIcon name="logo" size={32} className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">Peak AI</span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 8).map((item) => {
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
                  <PeakIcon name={item.icon} size={16} className="w-4 h-4" />
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
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white glass hover:shadow-lg transition-all duration-200 rounded-xl"
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline font-medium">Search</span>
              <kbd className="hidden xl:inline px-2 py-0.5 text-xs bg-white/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 rounded font-medium">⌘K</kbd>
            </button>

            {/* AI Assistant Quick Access */}
            <button
              onClick={() => {
                // This will open the global AI assistant
                const event = new CustomEvent('openPeakAI')
                window.dispatchEvent(event)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
              title="Ask Peak AI (Cmd/Ctrl + J)"
            >
              <PeakIcon name="ai" size={16} className="w-4 h-4" />
              <span className="hidden lg:inline text-sm">Ask AI</span>
            </button>

            <NotificationCenter />
            <DarkModeToggle />

            {/* Organization Switcher - Multi-tenant support (only show when Clerk is available) */}
            {hasClerkKey && (
              <OrganizationSwitcher
                hidePersonal={false}
                appearance={{
                  elements: {
                    rootBox: "flex items-center",
                    organizationSwitcherTrigger: "px-3 py-2 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all",
                    organizationSwitcherTriggerIcon: "w-5 h-5",
                    organizationPreviewAvatarBox: "w-8 h-8 rounded-lg",
                  },
                }}
              />
            )}

            {/* User Button (only show when Clerk is available) */}
            {hasClerkKey && (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-xl",
                    userButtonPopoverCard: "shadow-2xl",
                  }
                }}
                afterSignOutUrl="/"
              />
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}