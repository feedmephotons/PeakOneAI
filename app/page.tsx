'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppleDashboard from '@/components/dashboard/AppleDashboard'
import CustomizableDashboard from '@/components/dashboard/CustomizableDashboard'
import PeakDashboard from '@/components/dashboard/PeakDashboard'
import LandingPage from '@/components/landing/LandingPage'
import { Layout, Home as HomeIcon, Sparkles } from 'lucide-react'

type DashboardView = 'peak' | 'apple' | 'custom'

export default function Home() {
  const [dashboardView, setDashboardView] = useState<DashboardView>('peak')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Check current auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  const cycleView = () => {
    if (dashboardView === 'peak') setDashboardView('apple')
    else if (dashboardView === 'apple') setDashboardView('custom')
    else setDashboardView('peak')
  }

  // DEMO MODE: Skip auth check for investor demo
  // TODO: Remove this after demo - restore auth check below
  /*
  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    return <LandingPage />
  }
  */

  // Show dashboard for authenticated users
  return (
    <div className="relative">
      {/* Dashboard Toggle */}
      <div className="fixed top-20 right-6 z-40">
        <button
          onClick={cycleView}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          title="Switch Dashboard View"
        >
          {dashboardView === 'peak' ? (
            <>
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Peak View</span>
            </>
          ) : dashboardView === 'apple' ? (
            <>
              <HomeIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Apple View</span>
            </>
          ) : (
            <>
              <Layout className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Custom View</span>
            </>
          )}
        </button>
      </div>

      {dashboardView === 'peak' ? (
        <PeakDashboard />
      ) : dashboardView === 'custom' ? (
        <CustomizableDashboard />
      ) : (
        <AppleDashboard />
      )}
    </div>
  )
}