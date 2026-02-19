'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import DarkModeToggle from './DarkModeToggle'
import { NotificationCenter } from '@/components/notifications/NotificationProvider'
import {
  Search, User, LogOut, Settings, ChevronDown,
  Home, Users, Video, MessageSquare, FolderOpen, CheckSquare,
  Phone, Calendar, Mail, Shield, Scale,
} from 'lucide-react'
import Image from 'next/image'
import { useKeyboardShortcuts } from './KeyboardShortcuts'
import CreateMenu from './navigation/CreateMenu'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useRef } from 'react'
import { getNavForMode } from '@/config/navigation'
import { useAppStore } from '@/stores/app-store'
import { ModeSwitcher } from '@/components/ui/ModeSwitcher'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Users, Video, MessageSquare, FolderOpen, CheckSquare,
  Phone, Calendar, Mail, Shield, Scale,
}

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { openSearch } = useKeyboardShortcuts()
  const { uiMode } = useAppStore()
  const [user, setUser] = useState<{ email: string; firstName?: string; lastName?: string } | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // DEMO MODE: Default demo user for investor demo
  const DEMO_USER = {
    email: 'sarah.chen@peakone.com',
    firstName: 'Sarah',
    lastName: 'Chen',
  }

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({
          email: user.email!,
          firstName: user.user_metadata?.first_name,
          lastName: user.user_metadata?.last_name,
        })
      } else {
        setUser(DEMO_USER)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email!,
          firstName: session.user.user_metadata?.first_name,
          lastName: session.user.user_metadata?.last_name,
        })
      } else {
        setUser(DEMO_USER)
      }
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-1">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mr-6 shrink-0">
              <Image
                src="/peakone-logo.png"
                alt="Peak One"
                width={28}
                height={28}
                className="h-7 w-7"
                priority
              />
              <span className="hidden sm:block font-semibold text-gray-900 dark:text-white text-[15px] tracking-tight">
                Peak One
              </span>
            </Link>

            {/* Core Navigation Links (filtered by UI mode) */}
            <div className="hidden lg:flex items-center gap-0.5">
              {(mounted ? getNavForMode(uiMode) : getNavForMode('team')).map((item) => {
                const Icon = ICON_MAP[item.icon]
                const active = isActive(item.href)

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                      active
                        ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right: Command Bar + Actions */}
          <div className="flex items-center gap-2">
            {/* Command Bar / Search */}
            <button
              onClick={openSearch}
              className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100/80 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200/60 dark:border-gray-700/40 rounded-lg transition-colors w-48 lg:w-56"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 text-left truncate">Search or jump to...</span>
              <kbd className="hidden lg:inline text-[10px] px-1.5 py-0.5 bg-white/60 dark:bg-gray-700/60 border border-gray-300/40 dark:border-gray-600/40 rounded text-gray-400 dark:text-gray-500 font-mono">
                /
              </kbd>
            </button>

            {/* Create Button */}
            <CreateMenu />

            {/* Notifications */}
            <NotificationCenter />

            {/* Dark Mode */}
            <DarkModeToggle />

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-xs">
                    {getUserInitials()}
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-1.5 z-50">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    {/* Mode Switcher */}
                    <div className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
                      <ModeSwitcher variant="inline" />
                    </div>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-gray-100 dark:border-gray-800"
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity"
              >
                <User className="w-3.5 h-3.5" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
