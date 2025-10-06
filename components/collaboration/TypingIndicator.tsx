'use client'

import { useEffect, useState } from 'react'
import { collaboration, TypingIndicator as TypingIndicatorType } from '@/lib/collaboration'

interface TypingIndicatorProps {
  context: string // e.g., 'task:123'
}

export default function TypingIndicator({ context }: TypingIndicatorProps) {
  const [typing, setTyping] = useState<TypingIndicatorType[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const indicators = collaboration.getTypingIndicators(context)
      setTyping(indicators)
    }, 500) // Check every 500ms

    return () => clearInterval(interval)
  }, [context])

  if (typing.length === 0) return null

  const names = typing.map(t => t.userName).join(', ')
  const verb = typing.length === 1 ? 'is' : 'are'

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 animate-pulse">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{names} {verb} typing...</span>
    </div>
  )
}
