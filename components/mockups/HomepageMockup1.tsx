// Mockup 1: Monochrome Minimal - Current Homepage
// Pure black & white with geometric shapes, no emojis, premium feel

'use client'

import React, { useState } from 'react'

export default function HomepageMockup1() {
  const [viewMode, setViewMode] = useState<'all-in-one' | 'quick-start'>('all-in-one')

  const mainActions = [
    { icon: '□', title: 'Files & Docs', subtitle: 'Store, share, and collaborate on documents' },
    { icon: '◇', title: 'AI Assistant', subtitle: 'Your intelligent partner for productivity' },
    { icon: '△', title: 'Tasks & Projects', subtitle: 'Manage your work with structured workflows' },
    { icon: '○', title: 'Video Calls', subtitle: 'Start meetings with AI note-taking' },
    { icon: '▽', title: 'Phone Calls', subtitle: 'Record and transcribe calls automatically' },
    { icon: '◆', title: 'Calendar', subtitle: 'Schedule and manage your appointments' }
  ]

  const quickStartActions = mainActions.slice(0, 3)

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 relative">
              <div className="absolute inset-0 bg-black rotate-45 transform scale-75"></div>
              <div className="absolute inset-2 bg-white rotate-45 transform scale-75"></div>
            </div>
            <span className="text-2xl font-light tracking-tighter">APEX</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-sm hover:opacity-60 transition">Dashboard</a>
            <a href="#" className="text-sm hover:opacity-60 transition">Solutions</a>
            <a href="#" className="text-sm hover:opacity-60 transition">Settings</a>
            <button className="px-6 py-2 bg-black text-white text-sm hover:bg-gray-900 transition">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-light mb-4">
            What do you want to do today?
          </h1>
          <p className="text-lg text-gray-600">
            Choose your focus. Behind the scenes, everything stays connected.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex border-2 border-black">
            <button
              onClick={() => setViewMode('all-in-one')}
              className={`px-8 py-3 text-sm transition ${
                viewMode === 'all-in-one' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              ALL-IN-ONE VIEW
            </button>
            <button
              onClick={() => setViewMode('quick-start')}
              className={`px-8 py-3 text-sm transition ${
                viewMode === 'quick-start' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              QUICK-START VIEW
            </button>
          </div>
        </div>

        {/* Action Cards */}
        <div className={`grid gap-px bg-black ${
          viewMode === 'all-in-one'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto'
        }`}>
          {(viewMode === 'all-in-one' ? mainActions : quickStartActions).map((action, index) => (
            <button
              key={index}
              className="bg-white p-8 hover:bg-gray-50 transition text-left group"
            >
              <div className="text-4xl mb-6">{action.icon}</div>
              <h3 className="text-xl font-normal mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.subtitle}</p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition">
                <span className="text-sm">→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        {viewMode === 'all-in-one' && (
          <div className="mt-16 border-2 border-black p-8">
            <h2 className="text-2xl font-normal mb-8">Recent Activity</h2>
            <div className="grid grid-cols-4 gap-px bg-black">
              {[
                { value: '12', label: 'Active Calls' },
                { value: '284', label: 'Messages Today' },
                { value: '47', label: 'Tasks Completed' },
                { value: '156', label: 'Files Shared' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 text-center">
                  <p className="text-3xl font-light mb-2">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wider text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant */}
      <div className="fixed bottom-8 right-8">
        <button className="w-16 h-16 bg-black text-white flex items-center justify-center hover:bg-gray-900 transition">
          <span className="text-2xl font-light">A</span>
        </button>
      </div>
    </div>
  )
}