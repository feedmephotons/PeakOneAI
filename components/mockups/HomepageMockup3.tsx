// Mockup 3: Editorial Clean - Current Homepage
// Magazine-style typography focus

'use client'

import React, { useState } from 'react'

export default function HomepageMockup3() {
  const [viewMode, setViewMode] = useState<'all-in-one' | 'quick-start'>('all-in-one')

  const mainActions = [
    { title: 'Files & Docs', subtitle: 'Store, share, and collaborate on documents', category: 'STORAGE' },
    { title: 'AI Assistant', subtitle: 'Your intelligent partner for productivity', category: 'INTELLIGENCE' },
    { title: 'Tasks & Projects', subtitle: 'Manage your work with structured workflows', category: 'PRODUCTIVITY' },
    { title: 'Video Calls', subtitle: 'Start meetings with AI note-taking', category: 'COMMUNICATION' },
    { title: 'Phone Calls', subtitle: 'Record and transcribe calls automatically', category: 'COMMUNICATION' },
    { title: 'Calendar', subtitle: 'Schedule and manage your appointments', category: 'PLANNING' }
  ]

  const quickStartActions = mainActions.slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-serif italic">Λ</div>
            <span className="text-lg font-serif">ATLAS</span>
          </div>
          <div className="flex items-center gap-12">
            <a href="#" className="text-sm font-light hover:text-gray-600 transition">Dashboard</a>
            <a href="#" className="text-sm font-light hover:text-gray-600 transition">Features</a>
            <a href="#" className="text-sm font-light hover:text-gray-600 transition">Research</a>
            <button className="text-sm font-medium underline underline-offset-4">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-16">
          <p className="text-sm font-mono text-gray-500 mb-4">WELCOME BACK</p>
          <h1 className="text-7xl font-serif leading-none mb-8">
            What do you
            <br />
            <span className="italic">want to do</span>
            <br />
            today?
          </h1>
          <div className="max-w-md">
            <p className="text-lg leading-relaxed text-gray-700">
              Choose your focus. Behind the scenes, everything stays connected
              in perfect harmony.
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex mb-12">
          <div className="inline-flex gap-8">
            <button
              onClick={() => setViewMode('all-in-one')}
              className={`text-sm font-medium transition ${
                viewMode === 'all-in-one'
                  ? 'border-b-2 border-black pb-1'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              ALL-IN-ONE VIEW
            </button>
            <button
              onClick={() => setViewMode('quick-start')}
              className={`text-sm font-medium transition ${
                viewMode === 'quick-start'
                  ? 'border-b-2 border-black pb-1'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              QUICK-START VIEW
            </button>
          </div>
        </div>

        {/* Action Cards */}
        <div className={`grid gap-12 ${
          viewMode === 'all-in-one'
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 max-w-2xl'
        }`}>
          {(viewMode === 'all-in-one' ? mainActions : quickStartActions).map((action, index) => (
            <article key={index} className="group cursor-pointer">
              <p className="text-xs font-mono text-gray-500 mb-3">{action.category}</p>
              <h3 className="text-2xl font-serif mb-3 group-hover:underline underline-offset-4">
                {action.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {action.subtitle}
              </p>
              <div className="mt-4">
                <span className="text-xs text-gray-400 group-hover:text-black transition">
                  EXPLORE →
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Recent Activity */}
        {viewMode === 'all-in-one' && (
          <div className="mt-24 border-t border-gray-200 pt-12">
            <h2 className="text-3xl font-serif mb-12">Today&apos;s Activity</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '12', label: 'Active Calls', time: 'Last hour' },
                { value: '284', label: 'Messages', time: 'Since 9am' },
                { value: '47', label: 'Tasks Done', time: 'This week' },
                { value: '156', label: 'Files Shared', time: 'This month' }
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-4xl font-light">{stat.value}</p>
                  <p className="text-sm font-serif mt-1">{stat.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant */}
      <div className="fixed bottom-8 right-8">
        <button className="w-16 h-16 bg-black text-white font-serif text-2xl hover:bg-gray-800 transition">
          L
        </button>
      </div>
    </div>
  )
}