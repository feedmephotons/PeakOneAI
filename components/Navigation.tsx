'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import GlobalSearch from './GlobalSearch'
import DarkModeToggle from './DarkModeToggle'
import { NotificationCenter } from '@/components/notifications/NotificationProvider'
import { Home, FileText, MessageSquare, CheckCircle, Video, Calendar, Activity } from 'lucide-react'

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
  { href: '/files', label: 'Files', icon: FileText },
  { href: '/lisa', label: 'Lisa AI', icon: MessageSquare },
  { href: '/tasks', label: 'Tasks', icon: CheckCircle },
  { href: '/video', label: 'Video', icon: Video },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/activity', label: 'Activity', icon: Activity },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg" />
              <span className="font-bold text-xl text-gray-900 dark:text-white">SaasX</span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side - Search, Org Switcher, Notifications, Dark mode and User */}
          <div className="flex items-center gap-4">
            <GlobalSearch />
            {OrganizationSwitcher && (
              <OrganizationSwitcher
                appearance={{
                  elements: {
                    rootBox: "flex items-center",
                    organizationSwitcherTrigger: "px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
                  }
                }}
                hidePersonal
              />
            )}
            <NotificationCenter />
            <DarkModeToggle />
            {UserButton ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                  }
                }}
                afterSignOutUrl="/"
              />
            ) : (
              <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full" />
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}