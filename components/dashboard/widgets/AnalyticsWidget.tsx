'use client'

import { useState, useEffect } from 'react'
import { analytics } from '@/lib/analytics'
import LineChart from '@/components/charts/LineChart'
import PieChart from '@/components/charts/PieChart'

export default function AnalyticsWidget() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="text-gray-500 text-sm">Loading...</div>
  }

  const taskTrend = analytics.getTaskCompletionTrend(7)
  const tasksByStatus = analytics.getTasksByStatus()

  return (
    <div className="space-y-6">
      {/* Task Completion Trend */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Tasks Completed (7 Days)
        </h4>
        <LineChart data={taskTrend} height={150} color="#8b5cf6" />
      </div>

      {/* Tasks by Status */}
      {tasksByStatus.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Tasks by Status
          </h4>
          <PieChart data={tasksByStatus} size={180} donut showLegend={false} />
        </div>
      )}
    </div>
  )
}
