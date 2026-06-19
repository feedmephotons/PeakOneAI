'use client'

import { useState, useEffect } from 'react'
import { analytics } from '@/lib/analytics'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import ActivityHeatmap from '@/components/charts/ActivityHeatmap'
import { GlassPanel, SectionLabel, AskLisaBar } from '@/components/peak'
import { TrendingUp, TrendingDown, Minus, Download, BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full">
        <div className="py-12 text-center">
          <p className="text-peak-muted">Loading analytics…</p>
        </div>
      </div>
    )
  }

  const metrics = analytics.getProductivityMetrics()
  const taskTrend = analytics.getTaskCompletionTrend(30)
  const tasksByStatus = analytics.getTasksByStatus()
  const tasksByPriority = analytics.getTasksByPriority()
  const activityHeatmap = analytics.getActivityHeatmap(12)
  const weeklySummary = analytics.getWeeklySummary()

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-peak-green" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-peak-red" />
      default:
        return <Minus className="h-4 w-4 text-peak-dim" />
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
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-peak-muted">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-peak-primary/15 text-peak-primary-300">
              <BarChart3 className="h-3 w-3" />
            </span>
            Insights
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-peak md:text-4xl">
            Analytics &amp; Insights
          </h1>
          <p className="mt-2 max-w-xl text-sm text-peak-muted">
            Track your productivity and team performance.
          </p>
        </div>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div className="hidden w-64 lg:block">
            <AskLisaBar placeholder="Ask Lisa about your metrics…" />
          </div>
          <button
            onClick={handleExport}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-peak-border px-4 py-2.5 text-sm font-medium text-peak transition-colors hover:bg-white/[0.04]"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <GlassPanel key={index} className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-peak-muted">{metric.title}</p>
              {getTrendIcon(metric.trend)}
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-semibold tracking-tight text-peak">
                {metric.value}
              </p>
              {metric.change !== undefined && metric.change !== 0 && (
                <p
                  className={`mb-1 text-sm font-medium ${
                    metric.change > 0 ? 'text-peak-green' : 'text-peak-red'
                  }`}
                >
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </p>
              )}
            </div>
          </GlassPanel>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Task Completion Trend */}
        <GlassPanel className="p-6">
          <SectionLabel className="mb-4">Task Completion Trend</SectionLabel>
          <LineChart data={taskTrend} height={250} color="#8b5cf6" />
        </GlassPanel>

        {/* Tasks by Status */}
        <GlassPanel className="p-6">
          <SectionLabel className="mb-4">Tasks by Status</SectionLabel>
          <PieChart data={tasksByStatus} size={250} donut showLegend />
        </GlassPanel>

        {/* Weekly Activity */}
        <GlassPanel className="p-6">
          <SectionLabel className="mb-4">Weekly Activity</SectionLabel>
          <BarChart data={weeklySummary.map(d => ({ category: d.label || d.date, value: d.value }))} height={250} />
        </GlassPanel>

        {/* Tasks by Priority */}
        <GlassPanel className="p-6">
          <SectionLabel className="mb-4">Tasks by Priority</SectionLabel>
          <BarChart data={tasksByPriority} height={250} />
        </GlassPanel>
      </div>

      {/* Activity Heatmap */}
      <GlassPanel className="p-6">
        <div className="mb-6">
          <SectionLabel className="mb-1">Activity Heatmap</SectionLabel>
          <p className="text-sm text-peak-muted">
            Your contribution activity over the last 12 weeks
          </p>
        </div>
        <ActivityHeatmap data={activityHeatmap} />
      </GlassPanel>
    </div>
  )
}
