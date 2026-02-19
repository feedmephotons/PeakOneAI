'use client'

import { useState, useEffect } from 'react'
import { Command, X } from 'lucide-react'

export default function KeyboardShortcutsHint() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const hasSeenHint = localStorage.getItem('hasSeenKeyboardHint')
    if (!hasSeenHint) {
      setTimeout(() => setShow(true), 2000)
    }
  }, [])

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem('hasSeenKeyboardHint', 'true')
  }

  if (!show) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm animate-fade-in-up">
      <div className="bg-indigo-600 text-white rounded-xl shadow-lg p-5">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/80 hover:text-white z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Command className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">💡 Quick Tip</h3>
            <p className="text-sm text-white/90 mb-3">
              Press <kbd className="px-2 py-0.5 bg-white/20 rounded text-xs font-mono">⌘K</kbd> or <kbd className="px-2 py-0.5 bg-white/20 rounded text-xs font-mono">/</kbd> to open quick search
            </p>
            <p className="text-xs text-white/80">
              Press <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-mono">?</kbd> to see all keyboard shortcuts
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
