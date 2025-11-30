'use client'

import { Clock, TrendingUp, Target, Calendar, BarChart3 } from 'lucide-react'

export default function AIProductivityPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Productivity Insights</h1>
            <p className="text-gray-600 dark:text-gray-400">AI-powered productivity analysis and recommendations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Focus Score</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">87%</p>
            <p className="text-sm text-green-600 mt-1">+5% from last week</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Deep Work</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">4.2h</p>
            <p className="text-sm text-gray-500 mt-1">Daily average</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Meetings</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">12h</p>
            <p className="text-sm text-gray-500 mt-1">This week</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Tasks Done</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">23</p>
            <p className="text-sm text-gray-500 mt-1">This week</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Peak Hours</h2>
          <div className="h-48 flex items-end gap-1">
            {[20, 35, 60, 85, 95, 80, 65, 45, 55, 70, 50, 30].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-500">{i + 8}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Your most productive hours: 10 AM - 12 PM
          </p>
        </div>
      </div>
    </div>
  )
}
