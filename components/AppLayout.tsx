'use client'

import Navigation from './Navigation'
import ResponsiveLayout from './layout/ResponsiveLayout'
import { usePathname } from 'next/navigation'
import { NotificationProvider } from '@/components/notifications/NotificationProvider'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { KeyboardShortcutsProvider } from '@/components/KeyboardShortcuts'
import KeyboardShortcutsHint from './KeyboardShortcutsHint'
import MobileNav from '@/components/mobile/MobileNav'
import PeakAIAssistant from '@/components/ai/PeakAIAssistant'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/app-store'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const { navStyle } = useAppStore()
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Don't show navigation on auth pages or landing page (unauthenticated home)
  const isAuthPage = pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/sign-in') ||
    pathname?.startsWith('/sign-up') ||
    pathname?.startsWith('/auth')

  const isLandingPage = (pathname === '/' && isAuthenticated === false) || pathname === '/landing'

  // For auth pages and landing page, render without navigation
  if (isAuthPage || isLandingPage) {
    return <>{children}</>
  }

  // Still loading auth state on home page - show minimal shell
  if (pathname === '/' && isAuthenticated === null) {
    return <>{children}</>
  }

  // Use sidebar/megamenu layout when navStyle is 'sidebar' or 'megamenu'
  const useSidebarLayout = mounted && (navStyle === 'sidebar' || navStyle === 'megamenu')

  return (
    <ErrorBoundary>
      <NotificationProvider position="top-right" maxNotifications={5}>
        <KeyboardShortcutsProvider>
          {useSidebarLayout ? (
            <ResponsiveLayout>
              {children}
              <KeyboardShortcutsHint />
              <PeakAIAssistant />
            </ResponsiveLayout>
          ) : (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navigation />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
                {children}
              </main>
              <KeyboardShortcutsHint />
              <MobileNav />
              <PeakAIAssistant />
            </div>
          )}
        </KeyboardShortcutsProvider>
      </NotificationProvider>
    </ErrorBoundary>
  )
}