'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutGrid, CheckSquare, Sparkles, Settings,
  Home, Video, MessageSquare, Calendar, FolderOpen,
  Users, BarChart3, Zap, FileText, Phone, Clock,
  Cloud, Search, Bot, Mic, FileSearch, TrendingUp,
  Target, Activity, Bell, HelpCircle, Book, Mail
} from 'lucide-react'

interface MenuItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  description?: string
  badge?: string
  isNew?: boolean
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

interface FeaturedItem {
  title: string
  description: string
  href: string
  gradient?: boolean
}

interface MenuCategory {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  tagline: string
  sections: MenuSection[]
  featured?: FeaturedItem[]
  highlight?: boolean
}

export default function MegaMenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout>()

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
    setActiveMenu(null)
  }, [pathname])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setActiveMenu(null)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setActiveMenu(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleMouseEnter = (categoryId: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }

    // If menu is already open, switch immediately
    if (isOpen) {
      setActiveMenu(categoryId)
    } else {
      // Otherwise, delay before opening
      setTimeout(() => {
        setActiveMenu(categoryId)
        setIsOpen(true)
      }, 150)
    }
  }

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
      setActiveMenu(null)
    }, 300)
  }

  const categories: MenuCategory[] = [
    {
      id: 'workspace',
      label: 'Workspace',
      icon: LayoutGrid,
      tagline: 'Your digital command center',
      sections: [
        {
          title: 'Overview',
          items: [
            { label: 'Dashboard', href: '/', icon: Home, description: 'Main overview' },
            { label: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Insights & metrics' },
            { label: 'Activity Feed', href: '/activity', icon: Activity, description: 'Recent updates' },
          ]
        },
        {
          title: 'Communication',
          items: [
            { label: 'Messages', href: '/messages', icon: MessageSquare, description: 'Team chat' },
            { label: 'Video Calls', href: '/video', icon: Video, description: 'Start a call' },
            { label: 'Phone', href: '/calls', icon: Phone, description: 'Voice calls' },
          ]
        },
        {
          title: 'Quick Access',
          items: [
            { label: 'Notifications', href: '/notifications', icon: Bell, badge: '3' },
            { label: 'Recent Files', href: '/files?recent=true', icon: Clock },
            { label: 'Favorites', href: '/favorites', icon: Target },
          ]
        }
      ],
      featured: [
        {
          title: 'Take a Tour',
          description: 'Discover all Peak AI features',
          href: '/tour',
          gradient: false
        }
      ]
    },
    {
      id: 'productivity',
      label: 'Productivity',
      icon: CheckSquare,
      tagline: 'Get things done, together',
      sections: [
        {
          title: 'Project Management',
          items: [
            { label: 'Tasks', href: '/tasks', icon: CheckSquare, description: 'Kanban boards', badge: '12' },
            { label: 'Projects', href: '/tasks?view=projects', icon: LayoutGrid, description: 'All projects' },
            { label: 'Templates', href: '/templates', icon: FileText, description: 'Reusable workflows' },
            { label: 'Automation', href: '/automation', icon: Zap, description: 'Rules & triggers', isNew: true },
          ]
        },
        {
          title: 'Organization',
          items: [
            { label: 'Calendar', href: '/calendar', icon: Calendar, description: 'Schedule & events' },
            { label: 'Files', href: '/files', icon: FolderOpen, description: 'Cloud storage' },
            { label: 'Search', href: '/search', icon: Search, description: 'Find anything' },
          ]
        },
        {
          title: 'Collaboration',
          items: [
            { label: 'Team Spaces', href: '/teams', icon: Users, description: 'Shared workspaces' },
            { label: 'Comments', href: '/activity?filter=comments', icon: MessageSquare },
            { label: 'Mentions', href: '/mentions', icon: Bell, badge: '5' },
          ]
        }
      ]
    },
    {
      id: 'lisa',
      label: 'Lisa AI',
      icon: Sparkles,
      tagline: 'Intelligence that works for you',
      highlight: true,
      sections: [
        {
          title: 'AI Assistant',
          items: [
            { label: 'Chat with Lisa', href: '/lisa', icon: Sparkles, description: 'Ask anything', isNew: true },
            { label: 'Voice Assistant', href: '/lisa?voice=true', icon: Mic, description: 'Talk to Lisa' },
            { label: 'Smart Search', href: '/search?ai=true', icon: Search, description: 'AI-powered search' },
            { label: 'AI Insights', href: '/ai/insights', icon: TrendingUp, description: 'Data analysis' },
          ]
        },
        {
          title: 'AI Features',
          items: [
            { label: 'Meeting Transcription', href: '/ai/meetings', icon: Video, description: 'Auto transcribe' },
            { label: 'Document Analysis', href: '/ai/documents', icon: FileSearch, description: 'Extract insights' },
            { label: 'Task Automation', href: '/ai/automation', icon: Zap, description: 'Smart workflows' },
            { label: 'Smart Suggestions', href: '/ai/suggestions', icon: Bot, description: 'AI recommendations' },
          ]
        },
        {
          title: 'AI Analytics',
          items: [
            { label: 'Productivity Insights', href: '/ai/productivity', icon: BarChart3 },
            { label: 'Team Performance', href: '/ai/team', icon: Users },
            { label: 'Time Tracking', href: '/ai/time', icon: Clock },
            { label: 'AI Reports', href: '/ai/reports', icon: FileText, isNew: true },
          ]
        }
      ],
      featured: [
        {
          title: 'AI Workspace Tour',
          description: 'See what Lisa AI can do for you',
          href: '/lisa/tour',
          gradient: true
        },
        {
          title: 'View AI Analytics',
          description: 'Track your efficiency with AI',
          href: '/ai/analytics',
          gradient: true
        }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      tagline: 'Personalize your experience',
      sections: [
        {
          title: 'Account',
          items: [
            { label: 'Profile', href: '/settings', icon: Users, description: 'Personal settings' },
            { label: 'Organization', href: '/settings/org', icon: LayoutGrid, description: 'Team settings' },
            { label: 'Billing', href: '/settings/billing', icon: FileText, description: 'Plans & invoices' },
            { label: 'Security', href: '/settings/security', icon: Settings, description: 'Privacy controls' },
          ]
        },
        {
          title: 'Configuration',
          items: [
            { label: 'Integrations', href: '/settings/integrations', icon: Zap, description: 'Connected apps' },
            { label: 'Notifications', href: '/settings/notifications', icon: Bell },
            { label: 'Keyboard Shortcuts', href: '/settings/shortcuts', icon: FileText },
          ]
        },
        {
          title: 'Resources',
          items: [
            { label: 'Help Center', href: '/help', icon: HelpCircle, description: 'Get support' },
            { label: 'API Docs', href: '/docs', icon: Book, description: 'Developer docs' },
            { label: 'Contact Support', href: '/support', icon: Mail, description: 'Email us' },
          ]
        }
      ]
    }
  ]

  const activeCategory = categories.find(c => c.id === activeMenu)

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger Items */}
      <div className="flex items-center gap-1">
        {categories.map((category) => {
          const Icon = category.icon
          const isActive = activeMenu === category.id

          return (
            <button
              key={category.id}
              onMouseEnter={() => handleMouseEnter(category.id)}
              onClick={() => {
                setActiveMenu(activeMenu === category.id ? null : category.id)
                setIsOpen(!isOpen || activeMenu !== category.id)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? category.highlight
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
              aria-expanded={isActive}
              aria-haspopup="true"
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{category.label}</span>
            </button>
          )
        })}
      </div>

      {/* Megamenu Panel */}
      {isOpen && activeCategory && (
        <>
          {/* Backdrop - no blur, just darkening */}
          <div
            className="fixed inset-0 bg-black/10 z-40 animate-in fade-in duration-200"
            onClick={() => {
              setIsOpen(false)
              setActiveMenu(null)
            }}
            aria-hidden="true"
          />

          {/* Panel - blur only this card */}
          <div
            onMouseEnter={() => {
              if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current)
              }
            }}
            onMouseLeave={handleMouseLeave}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-screen max-w-6xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            role="menu"
            aria-label={`${activeCategory.label} menu`}
          >
            <div className="glass border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
              <MegaMenuPanel
                category={activeCategory}
                onClose={() => {
                  setIsOpen(false)
                  setActiveMenu(null)
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// MegaMenuPanel Component
function MegaMenuPanel({
  category,
  onClose
}: {
  category: MenuCategory
  onClose: () => void
}) {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            category.highlight
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800'
          }`}>
            <category.icon className={`w-5 h-5 ${
              category.highlight ? 'text-white' : 'text-gray-600 dark:text-gray-400'
            }`} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${
              category.highlight
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                : 'text-gray-900 dark:text-white'
            }`}>
              {category.label}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {category.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-3 gap-8">
        {category.sections.map((section, idx) => (
          <div key={idx}>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {section.title}
            </h4>
            <div className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const ItemIcon = item.icon
                return (
                  <Link
                    key={itemIdx}
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:translate-x-1 duration-200"
                    role="menuitem"
                  >
                    {ItemIcon && (
                      <ItemIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                            {item.badge}
                          </span>
                        )}
                        {item.isNew && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded shadow-sm">
                            New
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Featured Section */}
      {category.featured && category.featured.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            {category.featured.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                onClick={onClose}
                className={`p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                  item.gradient
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                role="menuitem"
              >
                <h5 className="font-semibold mb-1">{item.title}</h5>
                <p className={`text-sm ${
                  item.gradient ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
