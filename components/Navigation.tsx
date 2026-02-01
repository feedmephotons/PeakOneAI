'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import DarkModeToggle from './DarkModeToggle'
import { NotificationCenter } from '@/components/notifications/NotificationProvider'
import { Search, User, LogOut, Settings, ChevronDown, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useKeyboardShortcuts } from './KeyboardShortcuts'
import MegaMenu from './navigation/MegaMenu'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useRef } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { openSearch } = useKeyboardShortcuts()
  const [user, setUser] = useState<{ email: string; firstName?: string; lastName?: string } | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // DEMO MODE: Default demo user for investor demo
  const DEMO_USER = {
    email: 'sarah.chen@peakone.ai',
    firstName: 'Sarah',
    lastName: 'Chen',
  }

  useEffect(() => {
    const supabase = createClient()

    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({
          email: user.email!,
          firstName: user.user_metadata?.first_name,
          lastName: user.user_metadata?.last_name,
        })
      } else {
        // DEMO MODE: Use demo user when not authenticated
        setUser(DEMO_USER)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email!,
          firstName: session.user.user_metadata?.first_name,
          lastName: session.user.user_metadata?.last_name,
        })
      } else {
        // DEMO MODE: Use demo user when not authenticated
        setUser(DEMO_USER)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    // DEMO MODE: Go to landing page instead of sign-in
    router.push('/landing')
    router.refresh()
  }

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  const getUserDisplayName = () => {
    if (user?.firstName) {
      return `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    }
    return user?.email || 'User'
  }

  return (
    <nav className="sticky top-0 z-40 glass border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/peakone-logo.svg"
              alt="PeakOne AI"
              width={180}
              height={24}
              className="h-6 w-auto group-hover:scale-105 transition-transform duration-300 dark:brightness-110"
              priority
            />
          </Link>

          {/* Desktop navigation - MegaMenu */}
          <div className="hidden lg:flex items-center gap-1">
            <MegaMenu />
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
              <Sparkles className="w-4 h-4" />
              <span className="hidden lg:inline text-sm">Ask AI</span>
            </button>

            <NotificationCenter />
            <DarkModeToggle />

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                    {getUserInitials()}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
                    {getUserDisplayName()}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-gray-200 dark:border-gray-700"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:shadow-lg transition-all"
              >
                <User className="w-4 h-4" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}