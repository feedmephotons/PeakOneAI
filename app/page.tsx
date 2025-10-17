'use client'

import { useState } from 'react'
import AppleDashboard from '@/components/dashboard/AppleDashboard'
import CustomizableDashboard from '@/components/dashboard/CustomizableDashboard'
import PeakDashboard from '@/components/dashboard/PeakDashboard'
import { Layout, Home as HomeIcon, Sparkles } from 'lucide-react'

type DashboardView = 'peak' | 'apple' | 'custom'

export default function Home() {
  const [dashboardView, setDashboardView] = useState<DashboardView>('peak')

  const cycleView = () => {
    if (dashboardView === 'peak') setDashboardView('apple')
    else if (dashboardView === 'apple') setDashboardView('custom')
    else setDashboardView('peak')
  }

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