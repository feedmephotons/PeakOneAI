'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Phone, Video, Layout, Cloud, MessageSquare, Calendar,
  Brain, CheckSquare, Sparkles, Zap
} from 'lucide-react'

interface SmartActionCard {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  gradient: string
  path: string
}

export default function PeakDashboard() {
  const router = useRouter()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const smartActions: SmartActionCard[] = [
    {
      id: 'call',
      title: 'Start a Call',
      description: 'Connect with your team instantly',
      icon: Phone,
      color: 'from-blue-500 to-cyan-500',
      gradient: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      path: '/video'
    },
    {
      id: 'meeting',
      title: 'Join a Meeting',
      description: 'Enter your next scheduled meeting',
      icon: Video,
      color: 'from-purple-500 to-pink-500',
      gradient: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      path: '/calendar'
    },
    {
      id: 'task',
      title: 'Create a Task',
      description: 'Add a new task to your board',
      icon: CheckSquare,
      color: 'from-green-500 to-emerald-500',
      gradient: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      path: '/tasks'
    },
    {
      id: 'workspace',
      title: 'Open Workspace',
      description: 'Access your project dashboard',
      icon: Layout,
      color: 'from-orange-500 to-amber-500',
      gradient: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
      path: '/tasks'
    },
    {
      id: 'notes',
      title: 'Review Notes',
      description: 'Check your AI-generated summaries',
      icon: MessageSquare,
      color: 'from-indigo-500 to-blue-500',
      gradient: 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20',
      path: '/messages'
    },
    {
      id: 'files',
      title: 'Upload File',
      description: 'Add documents to your workspace',
      icon: Cloud,
      color: 'from-teal-500 to-cyan-500',
      gradient: 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
      path: '/files'
    },
    {
      id: 'calendar',
      title: 'View Calendar',
      description: 'See your schedule at a glance',
      icon: Calendar,
      color: 'from-rose-500 to-pink-500',
      gradient: 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20',
      path: '/calendar'
    },
    {
      id: 'ai',
      title: 'Ask Peak AI',
      description: 'Get intelligent assistance instantly',
      icon: Brain,
      color: 'from-violet-500 to-purple-500',
      gradient: 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20',
      path: '#ai-assistant'
    },
  ]

  const handleCardClick = (action: SmartActionCard) => {
    if (action.path.startsWith('#')) {
      // Handle AI assistant or other special actions
      console.log(`Opening ${action.title}`)
    } else {
      router.push(action.path)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/80 dark:bg-gray-800/50 backdrop-blur-2xl rounded-full shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Work at Your Peak
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4 font-light">
            The brain of ChatGPT. The power of Zoom.<br className="hidden md:block" />
            The precision of Asana. All in one.
          </p>
          <p className="text-base text-gray-500 dark:text-gray-500 max-w-2xl mx-auto">
            Your conversations, projects, and files — unified by AI that listens, learns, and leads.
          </p>
        </div>

        {/* Smart Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {smartActions.map((action) => {
            const Icon = action.icon
            const isHovered = hoveredCard === action.id

            return (
              <button
                key={action.id}
                onClick={() => handleCardClick(action)}
                onMouseEnter={() => setHoveredCard(action.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`
                  group relative overflow-hidden
                  ${action.gradient}
                  rounded-2xl p-8
                  border-2 ${isHovered ? 'border-gray-300 dark:border-gray-600' : 'border-transparent'}
                  shadow-lg hover:shadow-2xl
                  transition-all duration-300 ease-out
                  transform ${isHovered ? 'scale-105 -translate-y-2' : 'scale-100'}
                  text-left
                `}
              >
                {/* Animated gradient background */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${action.color} opacity-0
                  group-hover:opacity-10 transition-opacity duration-300
                `} />

                {/* Icon */}
                <div className={`
                  relative w-14 h-14 rounded-xl mb-4
                  bg-gradient-to-br ${action.color}
                  flex items-center justify-center
                  shadow-lg
                  transform transition-transform duration-300
                  ${isHovered ? 'rotate-6 scale-110' : 'rotate-0 scale-100'}
                `}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="relative text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {action.title}
                </h3>
                <p className="relative text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>

                {/* Hover indicator */}
                <div className={`
                  absolute bottom-0 left-0 right-0 h-1
                  bg-gradient-to-r ${action.color}
                  transform origin-left transition-transform duration-300
                  ${isHovered ? 'scale-x-100' : 'scale-x-0'}
                `} />
              </button>
            )
          })}
        </div>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">24</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Tasks</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">3</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Meetings Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">156</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Files Stored</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant CTA */}
        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-1 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl animate-pulse-slow">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Peak AI is Listening
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 max-w-xl mx-auto">
              AI that doesn&apos;t just listen — it understands your business.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-8 max-w-lg mx-auto">
              Ask about your meetings, summarize your notes, or let me build your next action plan automatically.
            </p>
            <button
              onClick={() => {
                const event = new CustomEvent('openPeakAI')
                window.dispatchEvent(event)
              }}
              className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
            >
              <Brain className="w-5 h-5" />
              Ask Peak AI Anything
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
