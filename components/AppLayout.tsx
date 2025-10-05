'use client'

import Navigation from './Navigation'
import { usePathname } from 'next/navigation'
import { NotificationProvider } from '@/components/notifications/NotificationProvider'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { KeyboardShortcutsProvider } from '@/components/KeyboardShortcuts'
import KeyboardShortcutsHint from './KeyboardShortcutsHint'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't show navigation on auth pages
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register')

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <ErrorBoundary>
      <NotificationProvider position="top-right" maxNotifications={5}>
        <KeyboardShortcutsProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <KeyboardShortcutsHint />
          </div>
        </KeyboardShortcutsProvider>
      </NotificationProvider>
    </ErrorBoundary>
  )
}