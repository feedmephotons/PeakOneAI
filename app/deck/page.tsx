'use client'

import { useEffect } from 'react'

export default function DeckPage() {
  useEffect(() => {
    window.location.href = 'https://peak-one-ai-deck.vercel.app/pitch-deck.html'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Redirecting to pitch deck...</p>
      </div>
    </div>
  )
}
