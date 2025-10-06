'use client'

import { useState } from 'react'
import AppleDashboard from '@/components/dashboard/AppleDashboard'
import CustomizableDashboard from '@/components/dashboard/CustomizableDashboard'
import { Layout, Home as HomeIcon } from 'lucide-react'

export default function Home() {
  const [useCustomDashboard, setUseCustomDashboard] = useState(false)

  return (
    <div className="relative">
      {/* Dashboard Toggle */}
      <div className="fixed top-20 right-6 z-40">
        <button
          onClick={() => setUseCustomDashboard(!useCustomDashboard)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition"
          title={useCustomDashboard ? 'Switch to Default Dashboard' : 'Switch to Custom Dashboard'}
        >
          {useCustomDashboard ? (
            <>
              <HomeIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Default View</span>
            </>
          ) : (
            <>
              <Layout className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Customize</span>
            </>
          )}
        </button>
      </div>

      {useCustomDashboard ? <CustomizableDashboard /> : <AppleDashboard />}
    </div>
  )
}