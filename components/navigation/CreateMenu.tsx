'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus, MessageSquare, Video, CheckSquare, Upload, FileText,
  Presentation, BarChart3, Mail, LayoutTemplate, Zap, Calendar,
  Contact, Sparkles, Brain, Mic, FileSearch, X,
} from 'lucide-react'
import { CREATE_ACTIONS } from '@/config/navigation'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare, Video, CheckSquare, Upload, FileText,
  Presentation, BarChart3, Mail, LayoutTemplate, Zap, Calendar,
  Contact, Sparkles, Brain, Mic, FileSearch,
}

const CATEGORY_LABELS: Record<string, string> = {
  create: 'Create',
  navigate: 'Go to',
  ai: 'AI',
}

export default function CreateMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen])

  const groupedActions = {
    create: CREATE_ACTIONS.filter(a => a.category === 'create'),
    navigate: CREATE_ACTIONS.filter(a => a.category === 'navigate'),
    ai: CREATE_ACTIONS.filter(a => a.category === 'ai'),
  }

  const handleAction = (action: typeof CREATE_ACTIONS[0]) => {
    if (action.action === 'openPeakAI') {
      window.dispatchEvent(new CustomEvent('openPeakAI'))
      setIsOpen(false)
      return
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-700/40 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Create</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Actions</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Grouped Actions */}
            <div className="max-h-[400px] overflow-y-auto py-1">
              {Object.entries(groupedActions).map(([category, actions]) => (
                <div key={category}>
                  <div className="px-3 pt-2.5 pb-1">
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      {CATEGORY_LABELS[category]}
                    </span>
                  </div>
                  {actions.map((action) => {
                    const Icon = ICON_MAP[action.icon]
                    const content = (
                      <div className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors cursor-pointer">
                        {Icon && <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">{action.label}</div>
                          <div className="text-[11px] text-gray-400 dark:text-gray-500">{action.description}</div>
                        </div>
                        {action.shortcut && (
                          <kbd className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-400 font-mono shrink-0">
                            {action.shortcut}
                          </kbd>
                        )}
                      </div>
                    )

                    if (action.action) {
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleAction(action)}
                          className="w-full text-left"
                        >
                          {content}
                        </button>
                      )
                    }

                    return (
                      <Link
                        key={action.id}
                        href={action.href || '#'}
                        onClick={() => setIsOpen(false)}
                      >
                        {content}
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
