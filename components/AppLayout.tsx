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
import PeakSidebar from '@/components/peak/PeakSidebar'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/app-store'

// Routes that render inside the navy "operating system" shell (Phase 2 redesign).
// Existing routes keep the legacy top-nav until their page agent migrates them.
const PEAK_OS_ROUTES = [
  '/', '/missions', '/memory', '/people', '/lisa',
  '/home', '/tasks', '/calendar', '/messages', '/calls',
  '/files', '/analytics', '/automation', '/settings/integrations',
  '/create',
]

function isPeakOsRoute(pathname: string | null): boolean {
  if (!pathname) return false
  return PEAK_OS_ROUTES.some((r) => (r === '/' ? pathname === '/' : pathname === r || pathname.startsWith(r + '/')))
}

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

  // Only treat /landing as a landing page (not homepage - demo mode shows dashboard with nav)
  const isLandingPage = pathname === '/landing'

  // For auth pages and landing page, render without navigation
  if (isAuthPage || isLandingPage) {
    return <>{children}</>
  }

  // DEMO MODE: Don't hide nav while auth is loading on homepage
  // Previously this returned bare children, hiding the nav bar entirely
  // if (pathname === '/' && isAuthenticated === null) {
  //   return <>{children}</>
  // }

  // Use sidebar/megamenu layout when navStyle is 'sidebar' or 'megamenu'
  // DEMO MODE: Force top navigation for demo
  const useSidebarLayout = false // mounted && (navStyle === 'sidebar' || navStyle === 'megamenu')

  // Phase 2: navy "operating system" shell for redesigned routes.
  const usePeakShell = isPeakOsRoute(pathname)

  return (
    <ErrorBoundary>
      <NotificationProvider position="top-right" maxNotifications={5}>
        <KeyboardShortcutsProvider>
          {usePeakShell ? (
            <div className="peak-os min-h-screen">
              <PeakSidebar />
              <main className="min-h-screen md:pl-[248px] pb-24 md:pb-0">{children}</main>
              <KeyboardShortcutsHint />
              <MobileNav />
              <PeakAIAssistant />
            </div>
          ) : useSidebarLayout ? (
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