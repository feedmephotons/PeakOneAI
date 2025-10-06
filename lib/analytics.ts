export interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

export interface CategoryData {
  category: string
  value: number
  color?: string
}

export interface ActivityData {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4 // 0 = none, 4 = most active
}

export interface MetricCard {
  title: string
  value: string | number
  change?: number // percentage change
  trend?: 'up' | 'down' | 'neutral'
  icon?: string
}

class AnalyticsManager {
  // Task Analytics
  getTaskStats() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')

    const total = tasks.length
    const completed = tasks.filter((t: { status: string }) => t.status === 'COMPLETED').length
    const inProgress = tasks.filter((t: { status: string }) => t.status === 'IN_PROGRESS').length
    const todo = tasks.filter((t: { status: string }) => t.status === 'TODO').length
    const inReview = tasks.filter((t: { status: string }) => t.status === 'IN_REVIEW').length

    const urgent = tasks.filter((t: { priority: string }) => t.priority === 'URGENT').length
    const high = tasks.filter((t: { priority: string }) => t.priority === 'HIGH').length
    const medium = tasks.filter((t: { priority: string }) => t.priority === 'MEDIUM').length
    const low = tasks.filter((t: { priority: string }) => t.priority === 'LOW').length

    return {
      total,
      byStatus: { completed, inProgress, todo, inReview },
      byPriority: { urgent, high, medium, low },
      completionRate: total > 0 ? (completed / total) * 100 : 0
    }
  }

  // Task completion over time
  getTaskCompletionTrend(days: number = 30): TimeSeriesData[] {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    const now = new Date()
    const data: TimeSeriesData[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const completedOnDay = tasks.filter((t: { status: string; updatedAt: string }) => {
        if (t.status !== 'COMPLETED') return false
        const taskDate = new Date(t.updatedAt).toISOString().split('T')[0]
        return taskDate === dateStr
      }).length

      data.push({
        date: dateStr,
        value: completedOnDay,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })
    }

    return data
  }

  // Tasks by status (for pie chart)
  getTasksByStatus(): CategoryData[] {
    const stats = this.getTaskStats()
    return [
      { category: 'Completed', value: stats.byStatus.completed, color: '#10b981' },
      { category: 'In Progress', value: stats.byStatus.inProgress, color: '#3b82f6' },
      { category: 'In Review', value: stats.byStatus.inReview, color: '#f59e0b' },
      { category: 'To Do', value: stats.byStatus.todo, color: '#6b7280' }
    ].filter(item => item.value > 0)
  }

  // Tasks by priority (for bar chart)
  getTasksByPriority(): CategoryData[] {
    const stats = this.getTaskStats()
    return [
      { category: 'Urgent', value: stats.byPriority.urgent, color: '#ef4444' },
      { category: 'High', value: stats.byPriority.high, color: '#f97316' },
      { category: 'Medium', value: stats.byPriority.medium, color: '#eab308' },
      { category: 'Low', value: stats.byPriority.low, color: '#84cc16' }
    ].filter(item => item.value > 0)
  }

  // Activity heatmap data (GitHub-style)
  getActivityHeatmap(weeks: number = 12): ActivityData[] {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    const files = JSON.parse(localStorage.getItem('files') || '[]')
    const now = new Date()
    const data: ActivityData[] = []

    const days = weeks * 7

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      // Count all activity for this day
      const taskActivity = tasks.filter((t: { createdAt: string; updatedAt: string }) => {
        const createdDate = new Date(t.createdAt).toISOString().split('T')[0]
        const updatedDate = new Date(t.updatedAt).toISOString().split('T')[0]
        return createdDate === dateStr || updatedDate === dateStr
      }).length

      const fileActivity = files.filter((f: { createdAt: string }) => {
        const createdDate = new Date(f.createdAt).toISOString().split('T')[0]
        return createdDate === dateStr
      }).length

      const totalActivity = taskActivity + fileActivity

      // Determine activity level
      let level: 0 | 1 | 2 | 3 | 4 = 0
      if (totalActivity > 0) level = 1
      if (totalActivity > 2) level = 2
      if (totalActivity > 5) level = 3
      if (totalActivity > 10) level = 4

      data.push({
        date: dateStr,
        count: totalActivity,
        level
      })
    }

    return data
  }

  // File storage analytics
  getFileStats() {
    const files = JSON.parse(localStorage.getItem('files') || '[]')

    const total = files.length
    const totalSize = files.reduce((acc: number, f: { size: number }) => acc + (f.size || 0), 0)

    const byType: Record<string, number> = {}
    files.forEach((f: { type: string }) => {
      byType[f.type] = (byType[f.type] || 0) + 1
    })

    return {
      total,
      totalSize,
      byType
    }
  }

  // Files by type (for pie chart)
  getFilesByType(): CategoryData[] {
    const stats = this.getFileStats()
    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6366f1']

    return Object.entries(stats.byType).map(([type, count], index) => ({
      category: type,
      value: count,
      color: colors[index % colors.length]
    }))
  }

  // Weekly activity summary
  getWeeklySummary(): TimeSeriesData[] {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    const data: TimeSeriesData[] = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const activity = tasks.filter((t: { createdAt: string; updatedAt: string }) => {
        const createdDate = new Date(t.createdAt).toISOString().split('T')[0]
        const updatedDate = new Date(t.updatedAt).toISOString().split('T')[0]
        return createdDate === dateStr || updatedDate === dateStr
      }).length

      data.push({
        date: dateStr,
        value: activity,
        label: date.toLocaleDateString('en-US', { weekday: 'short' })
      })
    }

    return data
  }

  // Productivity metrics
  getProductivityMetrics(): MetricCard[] {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    const stats = this.getTaskStats()

    // Calculate completed today
    const today = new Date().toISOString().split('T')[0]
    const completedToday = tasks.filter((t: { status: string; updatedAt: string }) => {
      if (t.status !== 'COMPLETED') return false
      const taskDate = new Date(t.updatedAt).toISOString().split('T')[0]
      return taskDate === today
    }).length

    // Calculate yesterday for trend
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const completedYesterday = tasks.filter((t: { status: string; updatedAt: string }) => {
      if (t.status !== 'COMPLETED') return false
      const taskDate = new Date(t.updatedAt).toISOString().split('T')[0]
      return taskDate === yesterdayStr
    }).length

    const todayChange = completedYesterday > 0
      ? ((completedToday - completedYesterday) / completedYesterday) * 100
      : 0

    return [
      {
        title: 'Total Tasks',
        value: stats.total,
        trend: 'neutral'
      },
      {
        title: 'Completed Today',
        value: completedToday,
        change: todayChange,
        trend: todayChange > 0 ? 'up' : todayChange < 0 ? 'down' : 'neutral'
      },
      {
        title: 'Completion Rate',
        value: `${stats.completionRate.toFixed(1)}%`,
        trend: stats.completionRate > 50 ? 'up' : 'down'
      },
      {
        title: 'In Progress',
        value: stats.byStatus.inProgress,
        trend: 'neutral'
      }
    ]
  }

  // Export analytics data
  exportAnalytics() {
    return {
      taskStats: this.getTaskStats(),
      taskTrend: this.getTaskCompletionTrend(),
      activityHeatmap: this.getActivityHeatmap(),
      fileStats: this.getFileStats(),
      productivity: this.getProductivityMetrics(),
      exportedAt: new Date().toISOString()
    }
  }
}

export const analytics = new AnalyticsManager()
