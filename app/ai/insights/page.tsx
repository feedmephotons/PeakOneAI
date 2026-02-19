'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Brain, TrendingUp, TrendingDown, Users, Clock, Target,
  Lightbulb, AlertTriangle, ChevronRight, BarChart3
} from 'lucide-react'

interface Insight {
  id: string
  type: 'productivity' | 'collaboration' | 'opportunity' | 'warning'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  metric?: {
    value: string
    change: number
    trend: 'up' | 'down'
  }
}

const MOCK_INSIGHTS: Insight[] = [
  {
    id: '1',
    type: 'productivity',
    title: 'Peak productivity hours identified',
    description: 'Your team is most productive between 9-11 AM. Consider scheduling important meetings outside this window.',
    impact: 'high',
    actionable: true,
    metric: { value: '47%', change: 12, trend: 'up' }
  },
  {
    id: '2',
    type: 'collaboration',
    title: 'Cross-team communication gap detected',
    description: 'Engineering and Marketing teams have 40% less interaction this month. Consider a joint sync meeting.',
    impact: 'medium',
    actionable: true,
    metric: { value: '-40%', change: -40, trend: 'down' }
  },
  {
    id: '3',
    type: 'opportunity',
    title: 'Meeting time can be optimized',
    description: '23% of your meetings run over scheduled time. AI can help create better agendas.',
    impact: 'high',
    actionable: true
  },
  {
    id: '4',
    type: 'warning',
    title: 'Deadline risk detected',
    description: 'Sprint goal completion rate is at 65%. 3 tasks may not be completed by Friday.',
    impact: 'high',
    actionable: true,
    metric: { value: '65%', change: -15, trend: 'down' }
  },
  {
    id: '5',
    type: 'productivity',
    title: 'Response time improved',
    description: 'Average message response time decreased by 18% this week.',
    impact: 'medium',
    actionable: false,
    metric: { value: '4.2 min', change: -18, trend: 'down' }
  },
]

export default function AIInsightsPage() {
  const [insights] = useState<Insight[]>(MOCK_INSIGHTS)
  const [filter, setFilter] = useState<'all' | 'productivity' | 'collaboration' | 'opportunity' | 'warning'>('all')

  const filteredInsights = filter === 'all'
    ? insights
    : insights.filter(i => i.type === filter)

  const getTypeIcon = (type: Insight['type']) => {
    const icons = {
      productivity: TrendingUp,
      collaboration: Users,
      opportunity: Lightbulb,
      warning: AlertTriangle
    }
    return icons[type]
  }

  const getTypeColor = (type: Insight['type']) => {
    const colors = {
      productivity: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      collaboration: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      opportunity: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
      warning: 'text-red-500 bg-red-100 dark:bg-red-900/30'
    }
    return colors[type]
  }

  const getImpactColor = (impact: Insight['impact']) => {
    const colors = {
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    }
    return colors[impact]
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Insights
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Intelligent observations and recommendations from Lisa AI
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Insights</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{insights.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Warnings</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {insights.filter(i => i.type === 'warning').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Opportunities</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {insights.filter(i => i.type === 'opportunity').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Actionable</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {insights.filter(i => i.actionable).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'productivity', 'collaboration', 'opportunity', 'warning'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                filter === f
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Insights List */}
        <div className="space-y-4">
          {filteredInsights.map(insight => {
            const Icon = getTypeIcon(insight.type)
            const colorClass = getTypeColor(insight.type)

            return (
              <div
                key={insight.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {insight.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                        {insight.impact} impact
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {insight.metric && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {insight.metric.value}
                            </span>
                            <span className={`flex items-center text-sm ${
                              insight.metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {insight.metric.trend === 'up' ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              {Math.abs(insight.metric.change)}%
                            </span>
                          </div>
                        )}
                      </div>
                      {insight.actionable && (
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition">
                          Take Action
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/ai/reports" className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <span className="font-medium text-gray-900 dark:text-white">View Reports</span>
          </Link>
          <Link href="/ai/productivity" className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="font-medium text-gray-900 dark:text-white">Productivity</span>
          </Link>
          <Link href="/lisa" className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
            <Brain className="w-5 h-5 text-purple-500" />
            <span className="font-medium text-gray-900 dark:text-white">Ask Lisa</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
