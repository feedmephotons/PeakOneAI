'use client'

import React, { useState, useEffect } from 'react'
import {
  TrendingUp, TrendingDown, Activity, FileText, CheckSquare, Calendar,
  MessageSquare, Clock, Users, BarChart3, PieChart, Target
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalFiles: number
    totalTasks: number
    totalEvents: number
    totalMessages: number
    filesChange: number
    tasksChange: number
    eventsChange: number
    messagesChange: number
  }
  productivity: {
    tasksCompleted: number
    tasksInProgress: number
    tasksPending: number
    avgCompletionTime: number
  }
  storage: {
    used: number
    total: number
  }
  activity: {
    date: string
    actions: number
  }[]
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    overview: {
      totalFiles: 0,
      totalTasks: 0,
      totalEvents: 0,
      totalMessages: 0,
      filesChange: 0,
      tasksChange: 0,
      eventsChange: 0,
      messagesChange: 0
    },
    productivity: {
      tasksCompleted: 0,
      tasksInProgress: 0,
      tasksPending: 0,
      avgCompletionTime: 0
    },
    storage: {
      used: 0,
      total: 10 * 1024 * 1024 * 1024
    },
    activity: []
  })

  useEffect(() => {
    // Calculate analytics from localStorage
    const files = JSON.parse(localStorage.getItem('fileManager') || '[]')
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    const events = JSON.parse(localStorage.getItem('calendar_events') || '[]')
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]')

    const tasksCompleted = tasks.filter((t: { status: string }) => t.status === 'completed').length
    const tasksInProgress = tasks.filter((t: { status: string }) => t.status === 'in-progress').length
    const tasksPending = tasks.filter((t: { status: string }) => t.status === 'pending').length

    const usedStorage = files.reduce((sum: number, f: { size?: number }) => sum + (f.size || 0), 0)

    // Generate activity data for last 7 days
    const activity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        actions: Math.floor(Math.random() * 50) + 10
      }
    })

    setAnalytics({
      overview: {
        totalFiles: files.length,
        totalTasks: tasks.length,
        totalEvents: events.length,
        totalMessages: conversations.length,
        filesChange: 12,
        tasksChange: 8,
        eventsChange: 5,
        messagesChange: 23
      },
      productivity: {
        tasksCompleted,
        tasksInProgress,
        tasksPending,
        avgCompletionTime: 2.5
      },
      storage: {
        used: usedStorage,
        total: 10 * 1024 * 1024 * 1024
      },
      activity
    })
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const storagePercent = (analytics.storage.used / analytics.storage.total) * 100

  const StatCard = ({ icon: Icon, title, value, change, color }: {
    icon: React.ElementType
    title: string
    value: string | number
    change: number
    color: string
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${color} rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${
          change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your productivity and usage metrics</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FileText}
            title="Total Files"
            value={analytics.overview.totalFiles}
            change={analytics.overview.filesChange}
            color="bg-blue-500"
          />
          <StatCard
            icon={CheckSquare}
            title="Total Tasks"
            value={analytics.overview.totalTasks}
            change={analytics.overview.tasksChange}
            color="bg-purple-500"
          />
          <StatCard
            icon={Calendar}
            title="Events"
            value={analytics.overview.totalEvents}
            change={analytics.overview.eventsChange}
            color="bg-green-500"
          />
          <StatCard
            icon={MessageSquare}
            title="Messages"
            value={analytics.overview.totalMessages}
            change={analytics.overview.messagesChange}
            color="bg-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Overview</h2>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.activity.map((day, index) => {
                const maxActions = Math.max(...analytics.activity.map(d => d.actions))
                const height = (day.actions / maxActions) * 100

                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-purple-600 rounded-t transition-all hover:opacity-80"
                      style={{ height: `${height}%` }}
                      title={`${day.actions} actions`}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{day.date}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Task Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Distribution</h2>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Completed</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {analytics.productivity.tasksCompleted}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(analytics.productivity.tasksCompleted / (analytics.productivity.tasksCompleted + analytics.productivity.tasksInProgress + analytics.productivity.tasksPending || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">In Progress</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {analytics.productivity.tasksInProgress}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(analytics.productivity.tasksInProgress / (analytics.productivity.tasksCompleted + analytics.productivity.tasksInProgress + analytics.productivity.tasksPending || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Pending</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {analytics.productivity.tasksPending}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gray-400 h-2 rounded-full"
                    style={{
                      width: `${(analytics.productivity.tasksPending / (analytics.productivity.tasksCompleted + analytics.productivity.tasksInProgress + analytics.productivity.tasksPending || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Storage Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Storage</h3>
            </div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Used</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatBytes(analytics.storage.used)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min(storagePercent, 100)}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatBytes(analytics.storage.total)} total
            </p>
          </div>

          {/* Avg Completion Time */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Avg Completion</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {analytics.productivity.avgCompletionTime}
              <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">days</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Per task</p>
          </div>

          {/* Productivity Score */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Productivity</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {Math.round((analytics.productivity.tasksCompleted / (analytics.overview.totalTasks || 1)) * 100)}
              <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">%</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completion rate</p>
          </div>
        </div>
      </div>
    </div>
  )
}
