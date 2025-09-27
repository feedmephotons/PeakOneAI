// Mockup 7: Neo-Morphic - Current Homepage
// Soft shadows and depth

'use client'

import React, { useState } from 'react'

export default function HomepageMockup7() {
  const [viewMode, setViewMode] = useState<'all-in-one' | 'quick-start'>('all-in-one')

  const mainActions = [
    { title: 'Files & Docs', subtitle: 'Store, share, and collaborate', icon: '📁', gradient: 'from-blue-400 to-blue-600' },
    { title: 'AI Assistant', subtitle: 'Your intelligent partner', icon: '🤖', gradient: 'from-purple-400 to-purple-600' },
    { title: 'Tasks & Projects', subtitle: 'Manage your workflows', icon: '✓', gradient: 'from-indigo-400 to-indigo-600' },
    { title: 'Video Calls', subtitle: 'Start meetings instantly', icon: '📹', gradient: 'from-green-400 to-green-600' },
    { title: 'Phone Calls', subtitle: 'Record and transcribe', icon: '📞', gradient: 'from-orange-400 to-orange-600' },
    { title: 'Calendar', subtitle: 'Schedule appointments', icon: '📅', gradient: 'from-pink-400 to-pink-600' }
  ]

  const quickStartActions = mainActions.slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-200">
      <style jsx>{`
        .neo-raised {
          background: linear-gradient(145deg, #e6e6e6, #ffffff);
          box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff;
        }
        .neo-inset {
          background: linear-gradient(145deg, #cacaca, #f0f0f0);
          box-shadow: inset 20px 20px 60px #bebebe, inset -20px -20px 60px #ffffff;
        }
        .neo-flat {
          background: #e0e0e0;
          box-shadow: 5px 5px 10px #bebebe, -5px -5px 10px #ffffff;
        }
      `}</style>

      {/* Navigation */}
      <nav className="px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 neo-raised rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full"></div>
            </div>
            <span className="text-2xl font-light text-gray-700">DEPTH</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 neo-flat rounded-xl text-gray-700 hover:scale-95 transition-transform">
              Dashboard
            </button>
            <button className="px-8 py-3 neo-raised rounded-xl text-gray-800 font-medium hover:scale-95 transition-transform">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="neo-inset rounded-3xl p-12 mb-8 max-w-4xl mx-auto">
            <h1 className="text-5xl font-light text-gray-800 leading-tight mb-6">
              What do you want to
              <br />
              <span className="font-normal bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                accomplish today?
              </span>
            </h1>
            <p className="text-lg text-gray-600">
              Choose your focus. Behind the scenes, everything stays connected.
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-12">
          <div className="neo-raised rounded-2xl p-2 inline-flex gap-2">
            <button
              onClick={() => setViewMode('all-in-one')}
              className={`px-6 py-3 rounded-xl transition-all ${
                viewMode === 'all-in-one'
                  ? 'neo-inset text-indigo-600 font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              All-in-one view
            </button>
            <button
              onClick={() => setViewMode('quick-start')}
              className={`px-6 py-3 rounded-xl transition-all ${
                viewMode === 'quick-start'
                  ? 'neo-inset text-indigo-600 font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Quick-start view
            </button>
          </div>
        </div>

        {/* Action Cards */}
        <div className={`grid gap-8 ${
          viewMode === 'all-in-one'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto'
        }`}>
          {(viewMode === 'all-in-one' ? mainActions : quickStartActions).map((action, index) => (
            <button
              key={index}
              className="neo-raised rounded-2xl p-8 hover:scale-105 transition-transform text-left"
            >
              <div className={`w-14 h-14 neo-inset rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${action.gradient}`}>
                <div className="w-8 h-8 bg-white/30 rounded-lg"></div>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">{action.title}</h3>
              <p className="text-gray-600">{action.subtitle}</p>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        {viewMode === 'all-in-one' && (
          <div className="mt-16 neo-raised rounded-3xl p-12">
            <h2 className="text-3xl font-light text-gray-800 mb-12 text-center">
              Today&apos;s Activity
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '12', label: 'Active Calls', color: 'from-green-400 to-green-600' },
                { value: '284', label: 'Messages', color: 'from-blue-400 to-blue-600' },
                { value: '47', label: 'Tasks Done', color: 'from-purple-400 to-purple-600' },
                { value: '156', label: 'Files Shared', color: 'from-orange-400 to-orange-600' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="neo-inset rounded-2xl p-6 mb-3">
                    <p className={`text-3xl font-light bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant */}
      <div className="fixed bottom-8 right-8">
        <button className="w-16 h-16 neo-raised rounded-full hover:scale-110 transition-transform flex items-center justify-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            L
          </span>
        </button>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  )
}