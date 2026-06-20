'use client'

import { useMemo } from 'react'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import ActivityHeatmap from '@/components/charts/ActivityHeatmap'
import { GlassPanel, SectionLabel, AskLisaBar } from '@/components/peak'
import type { TimeSeriesData, CategoryData, ActivityData, MetricCard } from '@/lib/analytics'
import { getMockAnalytics, FIXED_TODAY, ACME_COMPANY } from '@/lib/peak/mock'
import { TrendingUp, TrendingDown, Minus, Download, BarChart3 } from 'lucide-react'

// Deterministic, SSR-safe analytics driven by the canonical Acme Corp dataset.
// Everything below is computed from getMockAnalytics() so the page is never
// all-zeros and never depends on localStorage('tasks').

const STATUS_COLORS: Record<string, string> = {
  Completed: '#10b981',
  'In Progress': '#3b82f6',
  Overdue: '#ef4444',
  'To Do': '#6b7280',
}

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#84cc16',
}

const ASSIGNEE_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6366f1']

function priorityLabel(p: string) {
  return p.charAt(0) + p.slice(1).toLowerCase()
}

export default function AnalyticsPage() {
  const summary = useMemo(() => getMockAnalytics(), [])

  const metrics: MetricCard[] = useMemo(
    () => [
      { title: 'Total Tasks', value: summary.tasksTotal, trend: 'neutral' },
      {
        title: 'Completed',
        value: summary.tasksCompleted,
        change: summary.completionRate - 50,
        trend: summary.completionRate >= 50 ? 'up' : 'down',
      },
      {
        title: 'Completion Rate',
        value: `${summary.completionRate}%`,
        trend: summary.completionRate >= 50 ? 'up' : 'down',
      },
      {
        title: 'Overdue',
        value: summary.tasksOverdue,
        trend: summary.tasksOverdue > 0 ? 'down' : 'up',
      },
    ],
    [summary],
  )

  // 30-day completion trend reconstructed deterministically from the canonical
  // 7-day weeklyCompleted series (tiled across ~4 weeks, ending FIXED_TODAY).
  const taskTrend: TimeSeriesData[] = useMemo(() => {
    const today = new Date(FIXED_TODAY)
    const weekly = summary.weeklyCompleted // 7 entries Mon..Sun
    const out: TimeSeriesData[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setUTCDate(d.getUTCDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      // map calendar weekday (1=Mon..0=Sun) into the Mon..Sun weekly array
      const wd = d.getUTCDay() // 0=Sun..6=Sat
      const idx = wd === 0 ? 6 : wd - 1
      out.push({
        date: dateStr,
        value: weekly[idx]?.count ?? 0,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      })
    }
    return out
  }, [summary])

  const tasksByStatus: CategoryData[] = useMemo(
    () =>
      [
        { category: 'Completed', value: summary.tasksCompleted, color: STATUS_COLORS['Completed'] },
        { category: 'In Progress', value: summary.tasksInProgress, color: STATUS_COLORS['In Progress'] },
        { category: 'Overdue', value: summary.tasksOverdue, color: STATUS_COLORS['Overdue'] },
        {
          category: 'To Do',
          value: Math.max(
            0,
            summary.tasksTotal - summary.tasksCompleted - summary.tasksInProgress - summary.tasksOverdue,
          ),
          color: STATUS_COLORS['To Do'],
        },
      ].filter((s) => s.value > 0),
    [summary],
  )

  const tasksByPriority: CategoryData[] = useMemo(
    () =>
      summary.byPriority
        .map((p) => ({
          category: priorityLabel(p.priority),
          value: p.count,
          color: PRIORITY_COLORS[p.priority] || '#8b5cf6',
        }))
        .filter((p) => p.value > 0),
    [summary],
  )

  const tasksByAssignee: CategoryData[] = useMemo(
    () =>
      summary.byAssignee
        .map((a, i) => ({
          category: a.name,
          value: a.count,
          color: ASSIGNEE_COLORS[i % ASSIGNEE_COLORS.length],
        }))
        .filter((a) => a.value > 0),
    [summary],
  )

  const weeklySummary: TimeSeriesData[] = useMemo(
    () => summary.weeklyCompleted.map((d) => ({ date: d.day, value: d.count, label: d.day })),
    [summary],
  )

  // 12-week GitHub-style heatmap, deterministically seeded from weeklyCompleted
  // + per-day priority weighting so it reads as real Acme activity (no random).
  const activityHeatmap: ActivityData[] = useMemo(() => {
    const today = new Date(FIXED_TODAY)
    const weekly = summary.weeklyCompleted
    const out: ActivityData[] = []
    const days = 12 * 7
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setUTCDate(d.getUTCDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const wd = d.getUTCDay()
      const idx = wd === 0 ? 6 : wd - 1
      const base = weekly[idx]?.count ?? 0
      // deterministic per-day modulation from the date digits (stable, no random)
      const seed = (d.getUTCDate() + d.getUTCMonth() * 3) % 4
      const count = base + (wd === 0 || wd === 6 ? 0 : seed)
      let level: 0 | 1 | 2 | 3 | 4 = 0
      if (count > 0) level = 1
      if (count > 2) level = 2
      if (count > 4) level = 3
      if (count > 6) level = 4
      out.push({ date: dateStr, count, level })
    }
    return out
  }, [summary])

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
    const data = {
      company: ACME_COMPANY,
      summary,
      taskTrend,
      weeklySummary,
      tasksByStatus,
      tasksByPriority,
      tasksByAssignee,
      exportedAt: FIXED_TODAY,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `acme-analytics-${FIXED_TODAY.split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
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
            {ACME_COMPANY} productivity and team performance across {summary.byAssignee.length} teammates.
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

      {/* Secondary mission/velocity stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <GlassPanel className="p-5">
          <p className="text-xs text-peak-muted">Avg Mission Progress</p>
          <p className="mt-1 text-2xl font-semibold text-peak">{summary.avgMissionProgress}%</p>
        </GlassPanel>
        <GlassPanel className="p-5">
          <p className="text-xs text-peak-muted">Velocity</p>
          <p className="mt-1 text-2xl font-semibold text-peak">{summary.velocity}</p>
        </GlassPanel>
        <GlassPanel className="p-5">
          <p className="text-xs text-peak-muted">Files</p>
          <p className="mt-1 text-2xl font-semibold text-peak">{summary.filesCount}</p>
        </GlassPanel>
        <GlassPanel className="p-5">
          <p className="text-xs text-peak-muted">Meetings</p>
          <p className="mt-1 text-2xl font-semibold text-peak">{summary.meetingsCount}</p>
        </GlassPanel>
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
          {tasksByStatus.length > 0 ? (
            <PieChart data={tasksByStatus} size={250} donut showLegend />
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-peak-muted">
              No task data yet
            </div>
          )}
        </GlassPanel>

        {/* Weekly Activity */}
        <GlassPanel className="p-6">
          <SectionLabel className="mb-4">Weekly Activity</SectionLabel>
          <BarChart
            data={weeklySummary.map((d) => ({ category: d.label || d.date, value: d.value }))}
            height={250}
          />
        </GlassPanel>

        {/* Tasks by Assignee */}
        <GlassPanel className="p-6">
          <SectionLabel className="mb-4">Tasks by Assignee</SectionLabel>
          {tasksByAssignee.length > 0 ? (
            <BarChart data={tasksByAssignee} height={250} />
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-peak-muted">
              No assignee data yet
            </div>
          )}
        </GlassPanel>
      </div>

      {/* Tasks by Priority */}
      <GlassPanel className="mb-8 p-6">
        <SectionLabel className="mb-4">Tasks by Priority</SectionLabel>
        {tasksByPriority.length > 0 ? (
          <BarChart data={tasksByPriority} height={220} />
        ) : (
          <div className="flex h-[220px] items-center justify-center text-sm text-peak-muted">
            No priority data yet
          </div>
        )}
      </GlassPanel>

      {/* Activity Heatmap */}
      <GlassPanel className="p-6">
        <div className="mb-6">
          <SectionLabel className="mb-1">Activity Heatmap</SectionLabel>
          <p className="text-sm text-peak-muted">
            {ACME_COMPANY} contribution activity over the last 12 weeks
          </p>
        </div>
        <ActivityHeatmap data={activityHeatmap} />
      </GlassPanel>
    </div>
  )
}
