// Mockup 8: Future Vision - Current Homepage
// Holographic effects and modern gradients

'use client'

import React, { useState } from 'react'

export default function HomepageMockup8() {
  const [viewMode, setViewMode] = useState<'all-in-one' | 'quick-start'>('all-in-one')

  const mainActions = [
    { title: 'Files & Docs', subtitle: 'Quantum-secured storage', icon: '◈', gradient: 'from-cyan-400 via-blue-500 to-purple-600' },
    { title: 'AI Assistant', subtitle: 'Neural intelligence network', icon: '◉', gradient: 'from-purple-400 via-pink-500 to-red-500' },
    { title: 'Tasks & Projects', subtitle: 'Adaptive workflows', icon: '◐', gradient: 'from-green-400 via-teal-500 to-blue-600' },
    { title: 'Video Calls', subtitle: 'Holographic meetings', icon: '◎', gradient: 'from-orange-400 via-red-500 to-pink-600' },
    { title: 'Phone Calls', subtitle: 'Neural voice synthesis', icon: '◊', gradient: 'from-indigo-400 via-purple-500 to-pink-600' },
    { title: 'Calendar', subtitle: 'Temporal coordination', icon: '◇', gradient: 'from-yellow-400 via-orange-500 to-red-600' }
  ]

  const quickStartActions = mainActions.slice(0, 3)

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <style jsx>{`
        @keyframes holographic {
          0%, 100% { opacity: 0.8; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .holographic {
          background: linear-gradient(
            135deg,
            rgba(0, 255, 255, 0.1),
            rgba(255, 0, 255, 0.1),
            rgba(0, 255, 255, 0.1)
          );
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: holographic 3s ease-in-out infinite;
        }
        .glow-text {
          text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
        }
        .neon-border {
          box-shadow: inset 0 0 20px rgba(0, 255, 255, 0.2),
                      0 0 20px rgba(0, 255, 255, 0.1);
        }
        .grid-bg {
          background-image: 
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>

      <div className="grid-bg fixed inset-0 opacity-20"></div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-cyan-500/30">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 blur-xl opacity-50"></div>
              <div className="relative w-full h-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                <span className="text-black font-bold text-xl">∞</span>
              </div>
            </div>
            <span className="text-2xl font-thin tracking-wider glow-text text-cyan-400">NEXUS</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="px-6 py-2 holographic hover:border-cyan-400 transition">
              Control Panel
            </button>
            <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 transition">
              Initialize
            </button>
          </div>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"></div>
          <div className="relative">
            <div className="inline-block mb-6">
              <div className="text-xs tracking-[0.5em] text-cyan-400 uppercase mb-2">System Ready</div>
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
            </div>
            <h1 className="text-6xl font-thin leading-tight mb-8">
              What do you want to
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-normal">
                accomplish today?
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Choose your focus. All systems synchronized in the neural network.
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-12">
          <div className="holographic p-1 inline-flex">
            <button
              onClick={() => setViewMode('all-in-one')}
              className={`px-8 py-3 transition ${
                viewMode === 'all-in-one'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Full Matrix
            </button>
            <button
              onClick={() => setViewMode('quick-start')}
              className={`px-8 py-3 transition ${
                viewMode === 'quick-start'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Quick Access
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
              className="holographic p-8 hover:border-cyan-400 transition-all hover:scale-105 text-left group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} flex items-center justify-center text-2xl font-light`}>
                  {action.icon}
                </div>
                <div className="text-xs text-cyan-400 opacity-50">v{index + 1}.0</div>
              </div>
              <h3 className="text-xl font-light mb-3 group-hover:text-cyan-400 transition">
                {action.title}
              </h3>
              <p className="text-sm text-gray-400">{action.subtitle}</p>
              <div className="mt-4 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        {viewMode === 'all-in-one' && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-thin bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                System Analytics
              </h2>
            </div>
            <div className="holographic p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { value: '12', label: 'Active Streams', unit: 'live' },
                  { value: '284', label: 'Data Packets', unit: 'processed' },
                  { value: '47', label: 'Tasks', unit: 'completed' },
                  { value: '156', label: 'Files', unit: 'synced' }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 blur-2xl opacity-30"></div>
                      <p className="relative text-4xl font-thin bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{stat.label}</p>
                    <p className="text-xs text-cyan-400/50">{stat.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Floating Particles Effect */}
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
                animationDelay: `${i * 0.5}s`,
                opacity: 0.3 + i * 0.1
              }}
            />
          ))}
        </div>
      </div>

      {/* AI Assistant */}
      <div className="fixed bottom-8 right-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 blur-xl animate-pulse"></div>
          <button className="relative w-16 h-16 bg-black border border-cyan-400 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20 transition flex items-center justify-center">
            <span className="text-2xl font-thin text-cyan-400">L</span>
          </button>
        </div>
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  )
}