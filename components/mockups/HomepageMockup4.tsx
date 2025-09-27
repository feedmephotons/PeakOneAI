// Mockup 4: Tech Brutalist - Current Homepage
// Bold, stark contrasts with sharp edges

'use client'

import React, { useState } from 'react'

export default function HomepageMockup4() {
  const [viewMode, setViewMode] = useState<'all-in-one' | 'quick-start'>('all-in-one')

  const mainActions = [
    { title: 'FILES & DOCS', subtitle: 'STORE. SHARE. COLLABORATE.', color: 'bg-blue-500' },
    { title: 'AI ASSISTANT', subtitle: 'INTELLIGENT. POWERFUL. YOURS.', color: 'bg-purple-600' },
    { title: 'TASKS & PROJECTS', subtitle: 'MANAGE. TRACK. DELIVER.', color: 'bg-red-500' },
    { title: 'VIDEO CALLS', subtitle: 'MEET. RECORD. TRANSCRIBE.', color: 'bg-green-500' },
    { title: 'PHONE CALLS', subtitle: 'DIAL. CAPTURE. ANALYZE.', color: 'bg-orange-500' },
    { title: 'CALENDAR', subtitle: 'SCHEDULE. SYNC. EXECUTE.', color: 'bg-pink-500' }
  ]

  const quickStartActions = mainActions.slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-0 flex">
          <div className="px-8 py-6 bg-yellow-400 text-black">
            <span className="text-2xl font-black tracking-tighter">FORGE</span>
          </div>
          <div className="flex-1 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <a href="#" className="text-sm font-bold uppercase tracking-wider hover:text-yellow-400 transition">Dashboard</a>
              <a href="#" className="text-sm font-bold uppercase tracking-wider hover:text-yellow-400 transition">Deploy</a>
              <a href="#" className="text-sm font-bold uppercase tracking-wider hover:text-yellow-400 transition">Scale</a>
            </div>
            <button className="px-6 py-3 bg-white text-black font-bold uppercase text-sm hover:bg-yellow-400 transition">
              Start Building
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-0">
        {/* Header */}
        <div className="bg-black text-white p-16">
          <h1 className="text-7xl font-black uppercase leading-none mb-8">
            What Do
            <br />
            <span className="text-yellow-400">You Want</span>
            <br />
            To Do
            <br />
            <span className="text-yellow-400">Today?</span>
          </h1>
          <p className="text-xl max-w-lg">
            Choose your focus. Everything stays connected. No compromises.
          </p>
        </div>

        {/* View Toggle */}
        <div className="bg-yellow-400 p-4">
          <div className="inline-flex">
            <button
              onClick={() => setViewMode('all-in-one')}
              className={`px-8 py-3 font-bold uppercase text-sm transition ${
                viewMode === 'all-in-one'
                  ? 'bg-black text-yellow-400'
                  : 'bg-yellow-400 text-black hover:bg-yellow-300'
              }`}
            >
              All-in-One
            </button>
            <button
              onClick={() => setViewMode('quick-start')}
              className={`px-8 py-3 font-bold uppercase text-sm transition ${
                viewMode === 'quick-start'
                  ? 'bg-black text-yellow-400'
                  : 'bg-yellow-400 text-black hover:bg-yellow-300'
              }`}
            >
              Quick-Start
            </button>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
          {(viewMode === 'all-in-one' ? mainActions : quickStartActions).map((action, index) => (
            <button
              key={index}
              className={`${action.color} text-white p-12 relative group overflow-hidden text-left`}
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase mb-3">{action.title}</h3>
                <p className="text-lg font-bold">{action.subtitle}</p>
              </div>
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition"></div>
              <div className="absolute bottom-4 right-4 text-6xl font-black opacity-20 group-hover:opacity-40 transition">
                →
              </div>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        {viewMode === 'all-in-one' && (
          <div className="bg-black text-white p-16">
            <h2 className="text-4xl font-black uppercase mb-8 text-yellow-400">
              Today&apos;s Stats
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '12', label: 'ACTIVE CALLS' },
                { value: '284', label: 'MESSAGES' },
                { value: '47', label: 'TASKS DONE' },
                { value: '156', label: 'FILES SHARED' }
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-5xl font-black text-yellow-400">{stat.value}</p>
                  <p className="text-sm font-bold uppercase mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant */}
      <div className="fixed bottom-8 right-8">
        <button className="w-20 h-20 bg-yellow-400 text-black font-black text-2xl hover:bg-yellow-300 transition shadow-lg">
          AI
        </button>
      </div>
    </div>
  )
}