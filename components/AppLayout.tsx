'use client'

import Navigation from './Navigation'
import { usePathname } from 'next/navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't show navigation on auth pages
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register')

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}