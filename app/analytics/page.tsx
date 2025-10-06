'use client'

import { analytics } from '@/lib/analytics'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import ActivityHeatmap from '@/components/charts/ActivityHeatmap'
import { TrendingUp, TrendingDown, Minus, Download } from 'lucide-react'

export default function AnalyticsPage() {
  const metrics = analytics.getProductivityMetrics()
  const taskTrend = analytics.getTaskCompletionTrend(30)
  const tasksByStatus = analytics.getTasksByStatus()
  const tasksByPriority = analytics.getTasksByPriority()
  const activityHeatmap = analytics.getActivityHeatmap(12)
  const weeklySummary = analytics.getWeeklySummary()

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const handleExport = () => {
    const data = analytics.exportAnalytics()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString()}.json`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Analytics & Insights
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your productivity and team performance
            </p>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</p>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </p>
                {metric.change !== undefined && metric.change !== 0 && (
                  <p
                    className={`text-sm font-medium mb-1 ${
                      metric.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Task Completion Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Task Completion Trend
            </h3>
            <LineChart data={taskTrend} height={250} color="#8b5cf6" />
          </div>

          {/* Tasks by Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tasks by Status
            </h3>
            <PieChart data={tasksByStatus} size={250} donut showLegend />
          </div>

          {/* Weekly Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Weekly Activity
            </h3>
            <BarChart data={weeklySummary} height={250} />
          </div>

          {/* Tasks by Priority */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tasks by Priority
            </h3>
            <BarChart data={tasksByPriority} height={250} />
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Activity Heatmap
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your contribution activity over the last 12 weeks
            </p>
          </div>
          <ActivityHeatmap data={activityHeatmap} />
        </div>
      </div>
    </div>
  )
}
