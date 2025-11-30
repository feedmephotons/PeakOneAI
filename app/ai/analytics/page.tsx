'use client'

import Link from 'next/link'
import { BarChart3, TrendingUp, Users, Clock, Target, ArrowRight } from 'lucide-react'

export default function AIAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">Deep insights powered by Lisa AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">+23%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Productivity growth</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <Users className="w-8 h-8 text-blue-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">89%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Team engagement</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <Clock className="w-8 h-8 text-purple-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">4.5h</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg focus time</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <Target className="w-8 h-8 text-orange-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">92%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Goals achieved</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/ai/productivity" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Productivity Analytics</h3>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track your productivity patterns, focus time, and work habits.
            </p>
          </Link>

          <Link href="/ai/team" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Team Analytics</h3>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Understand team collaboration patterns and performance.
            </p>
          </Link>

          <Link href="/ai/time" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Time Analytics</h3>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Analyze how you spend your time and optimize your schedule.
            </p>
          </Link>

          <Link href="/ai/reports" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Custom Reports</h3>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Generate AI-powered reports for stakeholders.
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
