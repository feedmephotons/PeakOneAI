'use client'

import { BarChart3, Download, Calendar, FileText, Bot } from 'lucide-react'

const REPORTS = [
  { id: '1', name: 'Weekly Activity Summary', type: 'weekly', generatedAt: new Date(Date.now() - 86400000) },
  { id: '2', name: 'Monthly Productivity Report', type: 'monthly', generatedAt: new Date(Date.now() - 86400000 * 7) },
  { id: '3', name: 'Q4 Team Performance', type: 'quarterly', generatedAt: new Date(Date.now() - 86400000 * 30) },
  { id: '4', name: 'Sprint Retrospective Summary', type: 'sprint', generatedAt: new Date(Date.now() - 86400000 * 14) },
]

export default function AIReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Reports</h1>
              <p className="text-gray-600 dark:text-gray-400">Auto-generated reports and analytics</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition">
            <Bot className="w-4 h-4" />
            Generate Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <FileText className="w-8 h-8 text-purple-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{REPORTS.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Reports</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <Calendar className="w-8 h-8 text-blue-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">Weekly</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Auto-generation</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <Bot className="w-8 h-8 text-green-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">AI-Powered</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Insights included</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Reports</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {REPORTS.map(report => (
              <div key={report.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{report.name}</p>
                    <p className="text-sm text-gray-500">
                      Generated {report.generatedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
