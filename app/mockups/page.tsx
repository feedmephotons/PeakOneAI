'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Grid3X3, Maximize2 } from 'lucide-react'

// Import all mockup components
import HomepageMockup1 from '@/components/mockups/HomepageMockup1'
import HomepageMockup2 from '@/components/mockups/HomepageMockup2'
import HomepageMockup3 from '@/components/mockups/HomepageMockup3'
import HomepageMockup4 from '@/components/mockups/HomepageMockup4'
import HomepageMockup5 from '@/components/mockups/HomepageMockup5'
import HomepageMockup6 from '@/components/mockups/HomepageMockup6'
import HomepageMockup7 from '@/components/mockups/HomepageMockup7'
import HomepageMockup8 from '@/components/mockups/HomepageMockup8'

const mockups = [
  { id: 1, name: 'Monochrome Minimal', component: HomepageMockup1, theme: 'Pure black & white with geometric shapes' },
  { id: 2, name: 'Dark Gradient', component: HomepageMockup2, theme: 'Subtle dark purple gradients with glass morphism' },
  { id: 3, name: 'Editorial Clean', component: HomepageMockup3, theme: 'Magazine-style typography focus' },
  { id: 4, name: 'Tech Brutalist', component: HomepageMockup4, theme: 'Bold, stark contrasts with sharp edges' },
  { id: 5, name: 'Luxury Minimal', component: HomepageMockup5, theme: 'Premium feel with gold accents' },
  { id: 6, name: 'Swiss Design', component: HomepageMockup6, theme: 'Grid-based, systematic layout' },
  { id: 7, name: 'Neo-Morphic', component: HomepageMockup7, theme: 'Soft shadows and depth' },
  { id: 8, name: 'Future Vision', component: HomepageMockup8, theme: 'Holographic effects and modern gradients' }
]

export default function MockupsPage() {
  const [currentMockup, setCurrentMockup] = useState(0)
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single')

  const CurrentMockupComponent = mockups[currentMockup].component

  const nextMockup = () => {
    setCurrentMockup((prev) => (prev + 1) % mockups.length)
  }

  const previousMockup = () => {
    setCurrentMockup((prev) => (prev - 1 + mockups.length) % mockups.length)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light tracking-tight">Homepage Mockups</h1>
            <p className="text-sm text-gray-500 mt-1">
              {viewMode === 'single' ? `${currentMockup + 1} of ${mockups.length}` : 'Grid View'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1.5 rounded-md transition ${
                  viewMode === 'single' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md transition ${
                  viewMode === 'grid' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
            {/* Close Button */}
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition"
            >
              Back to App
            </Link>
          </div>
        </div>
      </div>

      {viewMode === 'single' ? (
        <>
          {/* Single View */}
          <div className="pt-20">
            {/* Mockup Info */}
            <div className="max-w-7xl mx-auto px-6 py-8">
              <h2 className="text-4xl font-light mb-2">{mockups[currentMockup].name}</h2>
              <p className="text-gray-500">{mockups[currentMockup].theme}</p>
            </div>

            {/* Mockup Display */}
            <div className="relative">
              <div className="w-full bg-white">
                <CurrentMockupComponent />
              </div>
            </div>

            {/* Navigation */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-4 bg-black/80 backdrop-blur-xl rounded-full px-6 py-3 border border-white/10">
              <button
                onClick={previousMockup}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {mockups.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMockup(index)}
                    className={`w-2 h-2 rounded-full transition ${
                      index === currentMockup ? 'bg-white w-8' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextMockup}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Grid View */}
          <div className="pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {mockups.map((mockup, index) => {
                const MockupComponent = mockup.component
                return (
                  <div
                    key={mockup.id}
                    className="group cursor-pointer"
                    onClick={() => {
                      setCurrentMockup(index)
                      setViewMode('single')
                    }}
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-light">{mockup.name}</h3>
                      <p className="text-sm text-gray-500">{mockup.theme}</p>
                    </div>
                    <div className="relative overflow-hidden rounded-lg border border-white/10 group-hover:border-white/30 transition">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-10 group-hover:opacity-0 transition" />
                      <div className="scale-50 origin-top-left" style={{ width: '200%', height: '200%' }}>
                        <MockupComponent />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}