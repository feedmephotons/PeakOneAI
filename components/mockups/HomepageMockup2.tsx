// Mockup 2: Dark Gradient - Current Homepage
// Subtle dark purple gradients with glass morphism

'use client'

import React, { useState } from 'react'

export default function HomepageMockup2() {
  const [viewMode, setViewMode] = useState<'all-in-one' | 'quick-start'>('all-in-one')

  const mainActions = [
    { title: 'Files & Docs', subtitle: 'Store, share, and collaborate on documents', color: 'from-blue-500 to-cyan-600' },
    { title: 'AI Assistant', subtitle: 'Your intelligent partner for productivity', color: 'from-violet-500 to-purple-600' },
    { title: 'Tasks & Projects', subtitle: 'Manage your work with structured workflows', color: 'from-indigo-500 to-blue-600' },
    { title: 'Video Calls', subtitle: 'Start meetings with AI note-taking', color: 'from-green-500 to-emerald-600' },
    { title: 'Phone Calls', subtitle: 'Record and transcribe calls automatically', color: 'from-orange-500 to-red-600' },
    { title: 'Calendar', subtitle: 'Schedule and manage your appointments', color: 'from-pink-500 to-rose-600' }
  ]

  const quickStartActions = mainActions.slice(0, 3)

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"></div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full relative">
              <div className="absolute inset-1 bg-black rounded-full"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full"></div>
            </div>
            <span className="text-xl font-light tracking-wide">NEXUS</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-sm text-gray-300 hover:text-white transition">Platform</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition">Resources</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition">Company</a>
            <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm rounded-lg hover:opacity-90 transition">
              Launch App
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">System Active</span>
          </div>
          <h1 className="text-6xl font-extralight mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            What do you want to do today?
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose your focus. Behind the scenes, everything stays connected.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white/10 backdrop-blur-xl rounded-full p-1">
            <button
              onClick={() => setViewMode('all-in-one')}
              className={`px-6 py-2 rounded-full text-sm transition ${
                viewMode === 'all-in-one'
                  ? 'bg-white text-black'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              All-in-one view
            </button>
            <button
              onClick={() => setViewMode('quick-start')}
              className={`px-6 py-2 rounded-full text-sm transition ${
                viewMode === 'quick-start'
                  ? 'bg-white text-black'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Quick-start view
            </button>
          </div>
        </div>

        {/* Action Cards */}
        <div className={`grid gap-6 ${
          viewMode === 'all-in-one'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto'
        }`}>
          {(viewMode === 'all-in-one' ? mainActions : quickStartActions).map((action, index) => (
            <button
              key={index}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition`}></div>
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition text-left">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color} mb-6`}>
                  <div className="w-8 h-8 bg-white/20 rounded"></div>
                </div>
                <h3 className="text-xl font-light text-white mb-2">{action.title}</h3>
                <p className="text-sm text-gray-400">{action.subtitle}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        {viewMode === 'all-in-one' && (
          <div className="mt-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <h2 className="text-2xl font-light mb-8">Recent Activity</h2>
            <div className="grid grid-cols-4 gap-6">
              {[
                { value: '12', label: 'Active Calls', color: 'text-green-400' },
                { value: '284', label: 'Messages Today', color: 'text-blue-400' },
                { value: '47', label: 'Tasks Completed', color: 'text-purple-400' },
                { value: '156', label: 'Files Shared', color: 'text-yellow-400' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className={`text-3xl font-light mb-2 ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant */}
      <div className="fixed bottom-8 right-8">
        <button className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition flex items-center justify-center text-white hover:scale-110 glow">
          <span className="text-2xl font-bold">L</span>
        </button>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
      </div>
    </div>
  )
}