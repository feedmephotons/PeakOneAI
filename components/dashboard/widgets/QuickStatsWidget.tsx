'use client'

import { CheckSquare, File, Video, MessageSquare, TrendingUp, Clock } from 'lucide-react'

export default function QuickStatsWidget() {
  // Load data from localStorage
  const tasks = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('tasks') || '[]')
    : []

  const completedToday = tasks.filter((t: { status: string; updatedAt: string }) => {
    if (t.status !== 'COMPLETED') return false
    const updated = new Date(t.updatedAt)
    const today = new Date()
    return updated.toDateString() === today.toDateString()
  }).length

  const stats = [
    {
      icon: CheckSquare,
      label: 'Total Tasks',
      value: tasks.length,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: TrendingUp,
      label: 'Completed Today',
      value: completedToday,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: File,
      label: 'Files',
      value: 24,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: Video,
      label: 'Meetings',
      value: 8,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      value: 156,
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-50 dark:bg-pink-900/20'
    },
    {
      icon: Clock,
      label: 'Hours Tracked',
      value: 32,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20'
    }
  ]

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {stats.map((stat, index) => (
        <div key={index} className={`p-3 ${stat.bg} rounded-lg`}>
          <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stat.value}
          </p>
          <p className={`text-xs ${stat.color} font-medium`}>
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  )
}
