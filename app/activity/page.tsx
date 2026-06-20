'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText, MessageSquare, CheckCircle, Calendar, Upload,
  Activity, Users, Download, RefreshCw,
  Mail, AlertTriangle, StickyNote, ArrowUp, ArrowDown, ArrowUpRight,
} from 'lucide-react'
import {
  getMockActivity,
  getActivityHref,
  FIXED_TODAY,
  FIXED_TODAY_DATE,
} from '@/lib/peak/mock'
import type { ActivityItem } from '@/lib/peak/types'

// FIXED_TODAY is an ISO string; derive a Date once for all time math.
const NOW = new Date(FIXED_TODAY)

interface Stats {
  totalActivities: number
  activeUsers: number
  tasksTouched: number
  filesShared: number
  messagesSent: number
  trend: 'up' | 'down' | 'stable'
  percentChange: number
}

// Filters keyed on the canonical ActivityItem.entityType.
const ACTIVITY_TYPES = [
  { id: 'all', label: 'All Activity', icon: Activity },
  { id: 'file', label: 'Files', icon: FileText },
  { id: 'message', label: 'Messages', icon: MessageSquare },
  { id: 'task', label: 'Tasks', icon: CheckCircle },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'note', label: 'Notes', icon: StickyNote },
  { id: 'mission', label: 'Missions', icon: Calendar },
]

export default function ActivityPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalActivities: 0,
    activeUsers: 0,
    tasksTouched: 0,
    filesShared: 0,
    messagesSent: 0,
    trend: 'up',
    percentChange: 0,
  })
  const [refreshing, setRefreshing] = useState(false)

  // Deterministic stats over the supplied feed. No Date.now(), no randomness:
  // anchored to the fixed world clock so every load is identical/SSR-safe.
  const computeStats = useCallback((items: ActivityItem[]): Stats => {
    const startOfDay = new Date(FIXED_TODAY_DATE + 'T00:00:00.000Z').getTime()
    const yesterdayStart = startOfDay - 24 * 60 * 60 * 1000

    const ts = (a: ActivityItem) => new Date(a.timestamp).getTime()
    const todays = items.filter((a) => ts(a) >= startOfDay)
    const yesterdays = items.filter((a) => ts(a) >= yesterdayStart && ts(a) < startOfDay)

    const activeUsers = new Set(items.map((a) => a.actor).filter(Boolean)).size
    const tasksTouched = items.filter((a) => a.entityType === 'task').length
    const filesShared = items.filter((a) => a.entityType === 'file').length
    const messagesSent = items.filter((a) => a.entityType === 'message' || a.entityType === 'email').length

    const change = todays.length - yesterdays.length
    const percentChange = yesterdays.length > 0
      ? Math.round((change / yesterdays.length) * 100)
      : todays.length > 0
        ? 100
        : 0

    return {
      totalActivities: items.length,
      activeUsers,
      tasksTouched,
      filesShared,
      messagesSent,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      percentChange: Math.abs(percentChange),
    }
  }, [])

  // Load the deterministic canonical feed (newest first). No localStorage
  // persistence and no setInterval injecting random events.
  const loadActivities = useCallback(() => {
    const feed = getMockActivity()
    setActivities(feed)
    setStats(computeStats(feed))
    setLoading(false)
  }, [computeStats])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  // Filter activities by entityType and time range.
  useEffect(() => {
    let filtered = [...activities]

    if (filter !== 'all') {
      filtered = filtered.filter((a) => a.entityType === filter)
    }

    const startOfDay = new Date(FIXED_TODAY_DATE + 'T00:00:00.000Z').getTime()
    const startOfWeek = NOW.getTime() - 7 * 24 * 60 * 60 * 1000
    const startOfMonth = new Date(
      Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), 1)
    ).getTime()
    const ts = (a: ActivityItem) => new Date(a.timestamp).getTime()

    switch (timeRange) {
      case 'today':
        filtered = filtered.filter((a) => ts(a) >= startOfDay)
        break
      case 'week':
        filtered = filtered.filter((a) => ts(a) >= startOfWeek)
        break
      case 'month':
        filtered = filtered.filter((a) => ts(a) >= startOfMonth)
        break
    }

    setFilteredActivities(filtered)
  }, [activities, filter, timeRange])

  // Refresh actually re-reads the feed and recomputes stats.
  const handleRefresh = () => {
    setRefreshing(true)
    loadActivities()
    // brief spin for feedback (state only; no fake data mutation)
    setTimeout(() => setRefreshing(false), 600)
  }

  const getActivityIcon = (entityType?: string) => {
    const icons: Record<string, typeof FileText> = {
      file: FileText,
      message: MessageSquare,
      task: CheckCircle,
      email: Mail,
      note: StickyNote,
      mission: Calendar,
      risk: AlertTriangle,
    }
    return (entityType && icons[entityType]) || Activity
  }

  const getActivityColor = (entityType?: string) => {
    const colors: Record<string, string> = {
      file: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      message: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      task: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      email: 'text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30',
      note: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
      mission: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
      risk: 'text-red-500 bg-red-100 dark:bg-red-900/30',
    }
    return (entityType && colors[entityType]) || 'text-gray-500 bg-gray-100 dark:bg-gray-700'
  }

  // SSR-safe relative time anchored to FIXED_TODAY.
  const formatTime = (iso: string) => {
    const date = new Date(iso)
    const diff = NOW.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const exportActivities = () => {
    const dataStr = JSON.stringify(filteredActivities, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `acme-activity-${FIXED_TODAY_DATE}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Activity Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Activity feed and analytics across the Acme Corp workspace
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                title="Refresh feed"
                className={`p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                  refreshing ? 'animate-spin' : ''
                }`}
              >
                <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={exportActivities}
                title="Export activity (JSON)"
                className="p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                stats.trend === 'up' ? 'text-green-600' : stats.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stats.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : stats.trend === 'down' ? <ArrowDown className="w-4 h-4" /> : null}
                <span>{stats.percentChange}%</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalActivities}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Activities</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active People</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tasksTouched}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Task Updates</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.filesShared}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Files Shared</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.messagesSent}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Messages & Email</p>
          </div>
        </div>

        {/* Filters and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>

              {/* Time Range */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Time Range</label>
                <div className="space-y-2">
                  {(['today', 'week', 'month', 'all'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        timeRange === range
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Activity Type</label>
                <div className="space-y-2">
                  {ACTIVITY_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        onClick={() => setFilter(type.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                          filter === type.id
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Activity Feed
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredActivities.length} activities
                  </span>
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading activities...</p>
                  </div>
                ) : filteredActivities.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No activities found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Try adjusting your filters or time range
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredActivities.map((activity) => {
                      const Icon = getActivityIcon(activity.entityType)
                      const colorClass = getActivityColor(activity.entityType)
                      const href = getActivityHref(activity)

                      return (
                        <button
                          key={activity.id}
                          onClick={() => router.push(href)}
                          className="w-full text-left flex gap-4 group p-3 -mx-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer"
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {activity.actor && (
                                    <>
                                      <span className="font-medium">{activity.actor}</span>{' '}
                                    </>
                                  )}
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {activity.actor && activity.description.startsWith(activity.actor)
                                      ? activity.description.slice(activity.actor.length).trim()
                                      : activity.description}
                                  </span>
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatTime(activity.timestamp)}
                                  </span>
                                  {activity.entityType && (
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded capitalize">
                                      {activity.entityType}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition flex-shrink-0 mt-1" />
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
