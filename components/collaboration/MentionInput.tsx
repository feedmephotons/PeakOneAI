'use client'

import { useState, useRef, useEffect } from 'react'
import { User, collaboration } from '@/lib/collaboration'

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onTyping?: () => void
}

export default function MentionInput({
  value,
  onChange,
  placeholder = 'Type @ to mention someone...',
  className = '',
  onTyping
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mentionQuery, setMentionQuery] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Notify typing
    if (onTyping) {
      onTyping()
    }

    // Check for @ mention
    const cursorPosition = e.target.selectionStart
    const textBeforeCursor = newValue.slice(0, cursorPosition)
    const match = textBeforeCursor.match(/@(\w*)$/)

    if (match) {
      const query = match[1]
      setMentionQuery(query)
      const users = collaboration.getMentionSuggestions(query)
      setSuggestions(users)
      setShowSuggestions(users.length > 0)
      setSelectedIndex(0)
    } else {
      setShowSuggestions(false)
    }
  }

  const insertMention = (user: User) => {
    if (!inputRef.current) return

    const cursorPosition = inputRef.current.selectionStart
    const textBeforeCursor = value.slice(0, cursorPosition)
    const textAfterCursor = value.slice(cursorPosition)

    // Remove the @ and partial name
    const newTextBefore = textBeforeCursor.replace(/@\w*$/, `@${user.name} `)
    const newValue = newTextBefore + textAfterCursor

    onChange(newValue)
    setShowSuggestions(false)

    // Set cursor position after mention
    setTimeout(() => {
      if (inputRef.current) {
        const newPosition = newTextBefore.length
        inputRef.current.selectionStart = newPosition
        inputRef.current.selectionEnd = newPosition
        inputRef.current.focus()
      }
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && suggestions[selectedIndex]) {
      e.preventDefault()
      insertMention(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        rows={3}
      />

      {/* Mention Suggestions */}
      {showSuggestions && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-2">
            {suggestions.map((user, index) => (
              <button
                key={user.id}
                onClick={() => insertMention(user)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  index === selectedIndex
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    user.status === 'online' ? 'bg-green-500' :
                    user.status === 'away' ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
