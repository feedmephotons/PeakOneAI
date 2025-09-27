// Mockup 5: Luxury Minimal - Current Homepage
// Premium feel with gold accents

'use client'

import React, { useState } from 'react'

export default function HomepageMockup5() {
  const [viewMode, setViewMode] = useState<'all-in-one' | 'quick-start'>('all-in-one')

  const mainActions = [
    { title: 'Files & Documents', subtitle: 'Secure storage with unparalleled organization' },
    { title: 'AI Assistant', subtitle: 'Bespoke intelligence tailored to your needs' },
    { title: 'Task Management', subtitle: 'Precision workflow orchestration' },
    { title: 'Video Conferencing', subtitle: 'Crystal-clear communication with AI insights' },
    { title: 'Phone Integration', subtitle: 'Seamless call management and transcription' },
    { title: 'Calendar Suite', subtitle: 'Executive scheduling perfected' }
  ]

  const quickStartActions = mainActions.slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border border-amber-400 rounded-full flex items-center justify-center">
              <span className="text-amber-400 font-light text-xl">Σ</span>
            </div>
            <span className="text-lg font-light tracking-[0.3em] uppercase">Sovereign</span>
          </div>
          <div className="flex items-center gap-12">
            <a href="#" className="text-xs tracking-widest text-gray-400 hover:text-amber-400 transition uppercase">Dashboard</a>
            <a href="#" className="text-xs tracking-widest text-gray-400 hover:text-amber-400 transition uppercase">Excellence</a>
            <a href="#" className="text-xs tracking-widest text-gray-400 hover:text-amber-400 transition uppercase">Support</a>
            <button className="px-8 py-3 border border-amber-400 text-amber-400 text-xs tracking-widest uppercase hover:bg-amber-400 hover:text-gray-900 transition">
              Private Access
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-20">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-6 py-2 border border-amber-400/30 mb-12">
            <p className="text-xs tracking-[0.3em] text-amber-400 uppercase">Executive Dashboard</p>
          </div>
          <h1 className="text-6xl font-extralight tracking-wider leading-tight mb-8">
            What do you want to
            <br />
            <span className="font-light text-amber-400">accomplish today?</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto font-light">
            Your command center for extraordinary productivity.
            Every tool, perfectly orchestrated.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex border border-amber-400/30">
            <button
              onClick={() => setViewMode('all-in-one')}
              className={`px-10 py-3 text-xs tracking-widest uppercase transition ${
                viewMode === 'all-in-one'
                  ? 'bg-amber-400 text-gray-900'
                  : 'text-gray-400 hover:text-amber-400'
              }`}
            >
              Complete Suite
            </button>
            <button
              onClick={() => setViewMode('quick-start')}
              className={`px-10 py-3 text-xs tracking-widest uppercase transition ${
                viewMode === 'quick-start'
                  ? 'bg-amber-400 text-gray-900'
                  : 'text-gray-400 hover:text-amber-400'
              }`}
            >
              Essential Tools
            </button>
          </div>
        </div>

        {/* Action Cards */}
        <div className={`grid gap-12 ${
          viewMode === 'all-in-one'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto'
        }`}>
          {(viewMode === 'all-in-one' ? mainActions : quickStartActions).map((action, index) => (
            <button
              key={index}
              className="border border-gray-800 p-8 hover:border-amber-400/50 transition text-left group"
            >
              <div className="w-12 h-12 border border-amber-400 rounded-full mb-6 group-hover:bg-amber-400/10 transition"></div>
              <h3 className="text-xl font-light mb-4 text-amber-400">{action.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{action.subtitle}</p>
              <div className="mt-6 text-xs tracking-widest text-gray-600 group-hover:text-amber-400 transition">
                ACCESS →
              </div>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        {viewMode === 'all-in-one' && (
          <div className="mt-20 border-t border-gray-800 pt-16">
            <h2 className="text-3xl font-light text-center mb-12 tracking-wide">
              Today&apos;s Performance
            </h2>
            <div className="grid grid-cols-4 gap-px bg-gray-800">
              {[
                { value: '12', label: 'Active Calls', sublabel: 'Premium Quality' },
                { value: '284', label: 'Messages', sublabel: 'Processed' },
                { value: '47', label: 'Tasks', sublabel: 'Completed' },
                { value: '156', label: 'Files', sublabel: 'Secured' }
              ].map((stat, i) => (
                <div key={i} className="bg-gray-900 p-8 text-center">
                  <p className="text-4xl font-light text-amber-400 mb-2">{stat.value}</p>
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-xs text-gray-600">{stat.sublabel}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant */}
      <div className="fixed bottom-8 right-8">
        <button className="w-16 h-16 border border-amber-400 bg-gray-900 text-amber-400 flex items-center justify-center hover:bg-amber-400 hover:text-gray-900 transition">
          <span className="text-2xl font-light">L</span>
        </button>
      </div>
    </div>
  )
}