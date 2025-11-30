'use client'

import { Clock, Calendar, TrendingUp, PieChart, AlertTriangle } from 'lucide-react'

export default function AITimePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Clock className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Time Intelligence</h1>
            <p className="text-gray-600 dark:text-gray-400">AI-powered time tracking and optimization</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <Clock className="w-8 h-8 text-blue-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">42.5h</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">This week</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <Calendar className="w-8 h-8 text-green-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">18h</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">In meetings</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <TrendingUp className="w-8 h-8 text-purple-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">24.5h</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Deep work</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <AlertTriangle className="w-8 h-8 text-orange-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">3.2h</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Overtime</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Time Distribution</h2>
            <div className="space-y-4">
              {[
                { label: 'Deep Work', value: 45, color: 'bg-purple-500' },
                { label: 'Meetings', value: 30, color: 'bg-blue-500' },
                { label: 'Communication', value: 15, color: 'bg-green-500' },
                { label: 'Admin', value: 10, color: 'bg-gray-500' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="text-gray-500">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className={`h-2 ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Recommendations</h2>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Consider blocking 9-11 AM for deep work - your most productive hours
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  You have 4 back-to-back meetings tomorrow - consider adding breaks
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Great job! Your focus time increased by 15% this week
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
