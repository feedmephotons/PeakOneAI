'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Palette, Database, Cloud, Brain, CheckCircle2, Circle, Activity } from 'lucide-react'

interface ApiStatus {
  loading: boolean
  success: boolean | null
  message?: string
}

export default function DevOpsPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [dbStatus, setDbStatus] = useState<ApiStatus>({ loading: true, success: null })
  const [storageStatus, setStorageStatus] = useState<ApiStatus>({ loading: true, success: null })
  const [aiStatus, setAiStatus] = useState<ApiStatus>({ loading: true, success: null })

  useEffect(() => {
    // Fetch DB status
    fetch('/api/test/db')
      .then(res => res.json())
      .then(data => setDbStatus({ loading: false, success: data.success, message: data.message || 'Connected' }))
      .catch(() => setDbStatus({ loading: false, success: false, message: 'Database connection failed' }))

    // Fetch Storage status
    fetch('/api/test/storage')
      .then(res => res.json())
      .then(data => setStorageStatus({ loading: false, success: data.success, message: data.message || 'Connected' }))
      .catch(() => setStorageStatus({ loading: false, success: false, message: 'Storage connection failed' }))

    // Fetch AI status
    fetch('/api/test/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello Lisa, are you working?' })
    })
      .then(res => res.json())
      .then(data => setAiStatus({ loading: false, success: data.success, message: data.response || 'Connected' }))
      .catch(() => setAiStatus({ loading: false, success: false, message: 'AI service connection failed' }))
  }, [])

  const sections = [
    { id: 'overview', title: 'Visual Identity', icon: Palette },
    { id: 'roadmap', title: 'Feature Roadmap', icon: Sparkles },
    { id: 'diagnostics', title: 'System Diagnostics', icon: Activity },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 min-h-screen bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 sticky top-0 flex flex-col justify-between">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Peak AI
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Design Document</p>
              </div>
            </div>

            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 max-w-5xl mx-auto">
          {activeSection === 'overview' && (
            <div className="space-y-8">
              {/* Default section requirements */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Visual Identity
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Style Guidelines</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Peak AI follows a <strong>Minimalist Apple aesthetic</strong> with neural, futuristic highlights. Whites, charcoals, and soft gradients define our background palette, providing a clean surface that breathes.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Milestone Feature Roadmap</h3>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-200 dark:divide-gray-700">
                      {[
                        { name: 'Lisa AI Chat Assistant', status: 'COMPLETE', badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
                        { name: 'File Upload UI & AI', status: 'COMPLETE', badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
                        { name: 'Kanban Tasks DB Sync', status: 'COMPLETE/IN_PROGRESS', badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' },
                        { name: 'DevOps & Navigation', status: 'IN_PROGRESS', badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
                        { name: 'E2E Test & Build Verification', status: 'PLANNED', badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/10">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${item.badge}`}>{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Integration Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Database Status */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col justify-between">
                        <div className="flex items-center space-x-3 mb-2">
                          <Database className="w-5 h-5 text-blue-500" />
                          <span className="font-medium text-sm text-gray-900 dark:text-white">Database</span>
                        </div>
                        {dbStatus.loading ? (
                          <span className="text-xs text-gray-400">Loading...</span>
                        ) : dbStatus.success ? (
                          <span className="text-xs text-green-500 font-semibold">● Connected</span>
                        ) : (
                          <span className="text-xs text-red-500 font-semibold">● Connection Failed</span>
                        )}
                      </div>

                      {/* Storage Status */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col justify-between">
                        <div className="flex items-center space-x-3 mb-2">
                          <Cloud className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-sm text-gray-900 dark:text-white">Storage</span>
                        </div>
                        {storageStatus.loading ? (
                          <span className="text-xs text-gray-400">Loading...</span>
                        ) : storageStatus.success ? (
                          <span className="text-xs text-green-500 font-semibold">● Connected</span>
                        ) : (
                          <span className="text-xs text-red-500 font-semibold">● Connection Failed</span>
                        )}
                      </div>

                      {/* AI Status */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col justify-between">
                        <div className="flex items-center space-x-3 mb-2">
                          <Brain className="w-5 h-5 text-purple-500" />
                          <span className="font-medium text-sm text-gray-900 dark:text-white">AI Services</span>
                        </div>
                        {aiStatus.loading ? (
                          <span className="text-xs text-gray-400">Loading...</span>
                        ) : aiStatus.success ? (
                          <span className="text-xs text-green-500 font-semibold">● Connected</span>
                        ) : (
                          <span className="text-xs text-red-500 font-semibold">● Connection Failed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'roadmap' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Roadmap Status</h2>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Track the development progress across all project milestones.
                </p>
                <div className="space-y-4">
                  {[
                    { name: 'Lisa AI Chat Assistant', status: 'COMPLETE' },
                    { name: 'File Upload UI & AI', status: 'COMPLETE' },
                    { name: 'Kanban Tasks DB Sync', status: 'COMPLETE/IN_PROGRESS' },
                    { name: 'DevOps & Navigation', status: 'IN_PROGRESS' },
                    { name: 'E2E Test & Build Verification', status: 'PLANNED' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-4">
                      {item.status.includes('COMPLETE') ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      ) : item.status === 'IN_PROGRESS' ? (
                        <Circle className="w-5 h-5 text-yellow-500 shrink-0 fill-yellow-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'diagnostics' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Integration Diagnostics</h2>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-xl">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Database</span>
                  {dbStatus.loading ? 'Checking...' : dbStatus.success ? 'Success' : 'Failed'}
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-xl">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Storage</span>
                  {storageStatus.loading ? 'Checking...' : storageStatus.success ? 'Success' : 'Failed'}
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-xl">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">AI Assistant</span>
                  {aiStatus.loading ? 'Checking...' : aiStatus.success ? 'Success' : 'Failed'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
