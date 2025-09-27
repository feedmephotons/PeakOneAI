// Mockup 6: Swiss Design - Current Homepage
// Grid-based, systematic layout

'use client'

import React, { useState } from 'react'

export default function HomepageMockup6() {
  const [viewMode, setViewMode] = useState<'all-in-one' | 'quick-start'>('all-in-one')

  const mainActions = [
    { title: 'Files & Docs', subtitle: 'Systematic file organization', col: 4 },
    { title: 'AI Assistant', subtitle: 'Intelligent automation', col: 4 },
    { title: 'Tasks & Projects', subtitle: 'Structured workflows', col: 4 },
    { title: 'Video Calls', subtitle: 'Clear communication', col: 4 },
    { title: 'Phone Calls', subtitle: 'Voice integration', col: 4 },
    { title: 'Calendar', subtitle: 'Time management', col: 4 }
  ]

  const quickStartActions = mainActions.slice(0, 3)

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="border-b-2 border-black">
        <div className="grid grid-cols-12 gap-4 max-w-7xl mx-auto px-6 py-4">
          <div className="col-span-3 flex items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 grid grid-cols-2 gap-0.5">
                <div className="bg-black"></div>
                <div className="bg-red-600"></div>
                <div className="bg-red-600"></div>
                <div className="bg-black"></div>
              </div>
              <span className="text-xl font-medium">GRID</span>
            </div>
          </div>
          <div className="col-span-6 flex items-center justify-center gap-8">
            <a href="#" className="text-sm hover:text-red-600 transition">Dashboard</a>
            <a href="#" className="text-sm hover:text-red-600 transition">Modules</a>
            <a href="#" className="text-sm hover:text-red-600 transition">Framework</a>
          </div>
          <div className="col-span-3 flex items-center justify-end">
            <button className="px-6 py-2 bg-red-600 text-white text-sm hover:bg-red-700 transition">
              Access Portal
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 mb-16">
          <div className="col-span-8">
            <h1 className="text-6xl font-bold leading-none mb-8">
              What do you
              <br />
              <span className="text-red-600">want to do</span>
              <br />
              today?
            </h1>
            <p className="text-lg max-w-lg">
              Choose your focus. Behind the scenes, everything stays connected
              through our systematic architecture.
            </p>
          </div>
          <div className="col-span-4">
            <div className="h-full grid grid-cols-2 gap-2">
              <div className="bg-black"></div>
              <div className="bg-red-600"></div>
              <div className="bg-red-600"></div>
              <div className="bg-black"></div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="grid grid-cols-12 gap-4 mb-12">
          <div className="col-span-12">
            <div className="inline-flex border-2 border-black">
              <button
                onClick={() => setViewMode('all-in-one')}
                className={`px-6 py-2 text-sm font-medium transition ${
                  viewMode === 'all-in-one'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                All Modules
              </button>
              <button
                onClick={() => setViewMode('quick-start')}
                className={`px-6 py-2 text-sm font-medium transition ${
                  viewMode === 'quick-start'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Core Modules
              </button>
            </div>
          </div>
        </div>

        {/* Action Cards - Grid System */}
        <div className="grid grid-cols-12 gap-4">
          {(viewMode === 'all-in-one' ? mainActions : quickStartActions).map((action, index) => (
            <div
              key={index}
              className={`col-span-12 md:col-span-6 lg:col-span-${action.col} border-2 border-black p-6 hover:bg-red-50 transition cursor-pointer`}
              style={{ gridColumn: `span ${action.col}` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-8 h-8 bg-red-600"></div>
                <span className="text-xs font-bold">0{index + 1}</span>
              </div>
              <h3 className="font-bold mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity - Grid */}
        {viewMode === 'all-in-one' && (
          <div className="mt-16">
            <div className="grid grid-cols-12 gap-4 mb-8">
              <div className="col-span-3">
                <h2 className="text-2xl font-bold">System Status</h2>
              </div>
              <div className="col-span-9">
                <p className="text-gray-600">Real-time performance metrics</p>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4">
              {[
                { value: '12', label: 'Active Calls', span: 3 },
                { value: '284', label: 'Messages Today', span: 3 },
                { value: '47', label: 'Tasks Completed', span: 3 },
                { value: '156', label: 'Files Shared', span: 3 }
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`col-span-${stat.span} border-t-4 border-red-600 pt-4`}
                  style={{ gridColumn: `span ${stat.span}` }}
                >
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant */}
      <div className="fixed bottom-8 right-8">
        <button className="w-16 h-16 border-2 border-black bg-white hover:bg-red-600 hover:text-white transition flex items-center justify-center">
          <span className="text-2xl font-bold">AI</span>
        </button>
      </div>
    </div>
  )
}