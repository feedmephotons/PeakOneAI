'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Grid3X3, MessageSquare, Video, Phone, Mail,
  CheckSquare, Calendar, FolderOpen, FileText, Briefcase,
  Brain, BarChart3, Zap, LayoutTemplate,
  Users, Contact, Presentation, X, ArrowRight, Terminal, Activity,
} from 'lucide-react'

interface AppItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  action?: string
}

interface AppCategory {
  label: string
  colorClasses: {
    bg: string
    text: string
  }
  items: AppItem[]
}

const APP_CATEGORIES: AppCategory[] = [
  {
    label: 'Communicate',
    colorClasses: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
    },
    items: [
      { label: 'Messages', icon: MessageSquare, href: '/messages' },
      { label: 'Meetings', icon: Video, href: '/video' },
      { label: 'Calls', icon: Phone, href: '/calls' },
      { label: 'Email', icon: Mail, href: '/email' },
    ],
  },
  {
    label: 'Productivity',
    colorClasses: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
    },
    items: [
      { label: 'Tasks', icon: CheckSquare, href: '/tasks' },
      { label: 'Calendar', icon: Calendar, href: '/calendar' },
      { label: 'Files', icon: FolderOpen, href: '/files' },
      { label: 'Documents', icon: FileText, href: '/docs' },
      { label: 'Projects', icon: Briefcase, href: '/projects' },
    ],
  },
  {
    label: 'Intelligence',
    colorClasses: {
      bg: 'bg-purple-50 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
    },
    items: [
      { label: 'Lisa AI', icon: Brain, action: 'openPeakAI' },
      { label: 'Analytics', icon: BarChart3, href: '/analytics' },
      { label: 'Automation', icon: Zap, href: '/automation' },
      { label: 'Templates', icon: LayoutTemplate, href: '/templates' },
    ],
  },
  {
    label: 'Collaborate',
    colorClasses: {
      bg: 'bg-orange-50 dark:bg-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400',
    },
    items: [
      { label: 'Workspaces', icon: Users, href: '/teams' },
      { label: 'Contacts', icon: Contact, href: '/contacts' },
      { label: 'Deck Builder', icon: Presentation, href: '/deck' },
    ],
  },
  {
    label: 'Operations',
    colorClasses: {
      bg: 'bg-zinc-50 dark:bg-zinc-900/30',
      text: 'text-zinc-600 dark:text-zinc-400',
    },
    items: [
      { label: 'DevOps', icon: Terminal, href: '/devops' },
      { label: 'Diagnostics', icon: Activity, href: '/test' },
    ],
  },
]

export default function AppLauncher() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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

  const handleItemClick = (item: AppItem) => {
    if (item.action === 'openPeakAI') {
      window.dispatchEvent(new CustomEvent('openPeakAI'))
    } else if (item.href) {
      router.push(item.href)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Platform tools"
        title="Platform Tools"
      >
        <Grid3X3 className="w-[18px] h-[18px]" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="absolute left-0 mt-2 w-[340px] bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 backdrop-blur z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Platform Tools</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Categories */}
            <div className="max-h-[480px] overflow-y-auto p-3 space-y-4">
              {APP_CATEGORIES.map((category) => (
                <div key={category.label}>
                  <div className="px-1 pb-2">
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                      {category.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {category.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.label}
                          onClick={() => handleItemClick(item)}
                          className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${category.colorClasses.bg}`}>
                            <Icon className={`w-4 h-4 ${category.colorClasses.text}`} />
                          </div>
                          <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white truncate w-full text-center transition-colors">
                            {item.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* All Features link */}
            <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => { router.push('/features'); setIsOpen(false) }}
                className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                View All Features
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
