'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GlobalSearch from '@/components/search/GlobalSearch'
import {
  Command, MessageSquare, FileText, CheckCircle, Video,
  Calendar, Settings, HelpCircle, Plus, Search, Clock
} from 'lucide-react'

interface Shortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  description: string
  action: () => void
  icon?: React.ReactNode
}

const KeyboardShortcutsContext = createContext<{
  shortcuts: Shortcut[]
  isHelpOpen: boolean
  setIsHelpOpen: (open: boolean) => void
}>({
  shortcuts: [],
  isHelpOpen: false,
  setIsHelpOpen: () => {}
})

export const useKeyboardShortcuts = () => useContext(KeyboardShortcutsContext)

export const KeyboardShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter()
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const shortcuts: Shortcut[] = [
    {
      key: 'k',
      ctrlKey: true,
      metaKey: true,
      description: 'Open command palette',
      icon: <Command className="w-4 h-4" />,
      action: () => setIsSearchOpen(true)
    },
    {
      key: '/',
      description: 'Focus search',
      icon: <Search className="w-4 h-4" />,
      action: () => setIsSearchOpen(true)
    },
    {
      key: 'h',
      ctrlKey: true,
      metaKey: true,
      description: 'Go to Home',
      action: () => router.push('/')
    },
    {
      key: 'l',
      ctrlKey: true,
      metaKey: true,
      description: 'Open Lisa AI',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => router.push('/lisa')
    },
    {
      key: 'f',
      ctrlKey: true,
      metaKey: true,
      description: 'Go to Files',
      icon: <FileText className="w-4 h-4" />,
      action: () => router.push('/files')
    },
    {
      key: 't',
      ctrlKey: true,
      metaKey: true,
      description: 'Go to Tasks',
      icon: <CheckCircle className="w-4 h-4" />,
      action: () => router.push('/tasks')
    },
    {
      key: 'v',
      ctrlKey: true,
      metaKey: true,
      description: 'Start Video Call',
      icon: <Video className="w-4 h-4" />,
      action: () => router.push('/video')
    },
    {
      key: 'c',
      ctrlKey: true,
      metaKey: true,
      description: 'Open Calendar',
      icon: <Calendar className="w-4 h-4" />,
      action: () => router.push('/calendar')
    },
    {
      key: ',',
      ctrlKey: true,
      metaKey: true,
      description: 'Open Settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => router.push('/settings')
    },
    {
      key: 'm',
      ctrlKey: true,
      metaKey: true,
      description: 'Go to Messages',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => router.push('/messages')
    },
    {
      key: 'a',
      ctrlKey: true,
      metaKey: true,
      description: 'Go to Activity',
      icon: <Clock className="w-4 h-4" />,
      action: () => router.push('/activity')
    },
    {
      key: 'p',
      ctrlKey: true,
      metaKey: true,
      description: 'Go to Phone',
      action: () => router.push('/phone')
    },
    {
      key: 'n',
      ctrlKey: true,
      metaKey: true,
      description: 'New Task',
      icon: <Plus className="w-4 h-4" />,
      action: () => router.push('/tasks?action=new')
    },
    {
      key: 'n',
      ctrlKey: true,
      metaKey: true,
      shiftKey: true,
      description: 'New File',
      icon: <FileText className="w-4 h-4" />,
      action: () => router.push('/files?action=new')
    },
    {
      key: 'e',
      ctrlKey: true,
      metaKey: true,
      shiftKey: true,
      description: 'New Event',
      icon: <Calendar className="w-4 h-4" />,
      action: () => router.push('/calendar?action=new')
    },
    {
      key: '?',
      shiftKey: true,
      description: 'Show keyboard shortcuts',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => setIsHelpOpen(true)
    },
    {
      key: 'Escape',
      description: 'Close modals/Cancel',
      action: () => {
        // Close any open modals
        setIsHelpOpen(false)
        const closeButtons = document.querySelectorAll('[data-modal-close]')
        closeButtons.forEach(button => (button as HTMLElement).click())
      }
    }
  ]

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        // Allow Escape to work in inputs
        if (e.key !== 'Escape') return
      }

      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatch = shortcut.key.toLowerCase() === e.key.toLowerCase()
        const ctrlMatch = shortcut.ctrlKey ? (e.ctrlKey || e.metaKey) : true
        const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey

        return keyMatch && ctrlMatch && shiftMatch
      })

      if (matchingShortcut) {
        e.preventDefault()
        matchingShortcut.action()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [shortcuts])

  return (
    <KeyboardShortcutsContext.Provider value={{ shortcuts, isHelpOpen, setIsHelpOpen }}>
      {children}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ShortcutsHelp />
    </KeyboardShortcutsContext.Provider>
  )
}

const ShortcutsHelp: React.FC = () => {
  const { shortcuts, isHelpOpen, setIsHelpOpen } = useKeyboardShortcuts()
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

  if (!isHelpOpen) return null

  const formatKey = (shortcut: Shortcut) => {
    const parts = []
    if (shortcut.ctrlKey || shortcut.metaKey) {
      parts.push(isMac ? '⌘' : 'Ctrl')
    }
    if (shortcut.shiftKey) parts.push('⇧')
    parts.push(shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase())
    return parts.join(' ')
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsHelpOpen(false)}
      />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
            <button
              onClick={() => setIsHelpOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              data-modal-close
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex items-center gap-3">
                  {shortcut.icon}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {shortcut.description}
                  </span>
                </div>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                  {formatKey(shortcut)}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">ESC</kbd> to close
            </p>
          </div>
        </div>
      </div>
    </>
  )
}