'use client'

import { useRouter } from 'next/navigation'
import {
  Video, MessageSquare, Phone, Mail, CheckSquare, Calendar,
  FolderOpen, FileText, BarChart3, Zap, Brain, LayoutTemplate,
  Users, Contact, Presentation, Shield, Settings, Activity,
  Mic, FileSearch, Briefcase, Star, Search, Globe,
  ArrowRight, Sparkles
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Feature {
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: string
}

interface FeatureCategory {
  title: string
  description: string
  colorClasses: { bg: string; text: string; border: string }
  features: Feature[]
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const categories: FeatureCategory[] = [
  {
    title: 'Communication',
    description: 'Stay connected with your team through every channel.',
    colorClasses: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
    features: [
      {
        name: 'Meetings',
        description:
          'AI-powered video calls with live transcription, smart summaries, and automatic action items.',
        icon: Video,
        href: '/video',
        badge: 'AI-Powered',
      },
      {
        name: 'Messaging',
        description:
          'Threaded team conversations with smart context linking and AI-suggested responses.',
        icon: MessageSquare,
        href: '/messages',
        badge: 'AI-Powered',
      },
      {
        name: 'Phone Calls',
        description:
          'Secure voice calls with recording, transcription, and call intelligence.',
        icon: Phone,
        href: '/calls',
      },
      {
        name: 'Email',
        description:
          'Draft, send, and manage emails with on-brand AI writing assistance.',
        icon: Mail,
        href: '/email',
        badge: 'AI-Powered',
      },
    ],
  },
  {
    title: 'Productivity',
    description: 'Organize your work and ship faster with smart tools.',
    colorClasses: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
    },
    features: [
      {
        name: 'Task Management',
        description:
          'Kanban boards with AI-suggested priorities pulled directly from your meetings.',
        icon: CheckSquare,
        href: '/tasks',
        badge: 'AI-Powered',
      },
      {
        name: 'Calendar',
        description:
          'Intelligent scheduling with automated meeting prep and conflict detection.',
        icon: Calendar,
        href: '/calendar',
      },
      {
        name: 'File Storage',
        description:
          'Smart file management with AI analysis, tagging, and cross-reference insights.',
        icon: FolderOpen,
        href: '/files',
        badge: 'AI-Powered',
      },
      {
        name: 'Documents',
        description:
          'Collaborative document creation with AI drafting and real-time editing.',
        icon: FileText,
        href: '/docs',
      },
      {
        name: 'Projects',
        description:
          'End-to-end project tracking with timeline views and resource management.',
        icon: Briefcase,
        href: '/projects',
      },
    ],
  },
  {
    title: 'AI Intelligence',
    description: 'Let Lisa and the AI engine do the heavy lifting.',
    colorClasses: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
    },
    features: [
      {
        name: 'Lisa AI Assistant',
        description:
          'Your personal AI that learns your patterns, preferences, and work style.',
        icon: Brain,
        href: '/lisa',
        badge: 'Core',
      },
      {
        name: 'Analytics & Reports',
        description:
          'Real-time dashboards with AI-generated insights and performance reports.',
        icon: BarChart3,
        href: '/analytics',
      },
      {
        name: 'Automation',
        description:
          'Custom workflow rules and triggers that run tasks in the background.',
        icon: Zap,
        href: '/automation',
      },
      {
        name: 'Transcription',
        description:
          'Convert audio and video to searchable, shareable text in 50+ languages.',
        icon: Mic,
        href: '/ai/transcriptions',
        badge: 'AI-Powered',
      },
      {
        name: 'AI Summaries',
        description:
          'Instant meeting recaps, email digests, and document summaries.',
        icon: FileSearch,
        href: '/ai/summaries',
        badge: 'AI-Powered',
      },
    ],
  },
  {
    title: 'Collaboration',
    description: 'Work together seamlessly, no matter where your team is.',
    colorClasses: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
    },
    features: [
      {
        name: 'Workspaces',
        description:
          'Dedicated team spaces with shared resources, channels, and permissions.',
        icon: Users,
        href: '/teams',
      },
      {
        name: 'Contacts',
        description:
          'Centralized people directory with relationship context and interaction history.',
        icon: Contact,
        href: '/contacts',
      },
      {
        name: 'Deck Builder',
        description:
          'Create polished pitch decks and presentations with AI-assisted content.',
        icon: Presentation,
        href: '/deck',
        badge: 'AI-Powered',
      },
      {
        name: 'Templates',
        description:
          'Reusable workflow templates for emails, projects, meetings, and more.',
        icon: LayoutTemplate,
        href: '/templates',
      },
      {
        name: 'Favorites',
        description:
          'Quick access to your most-used files, conversations, and tools.',
        icon: Star,
        href: '/favorites',
      },
    ],
  },
  {
    title: 'Administration',
    description: 'Full control over your platform, security, and team.',
    colorClasses: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
    },
    features: [
      {
        name: 'Settings',
        description:
          'Customize your workspace, notifications, appearance, and preferences.',
        icon: Settings,
        href: '/settings',
      },
      {
        name: 'Security',
        description:
          'Privacy controls, two-factor auth, and data encryption settings.',
        icon: Shield,
        href: '/settings/security',
      },
      {
        name: 'Activity Log',
        description:
          'Full audit trail of team actions and system events.',
        icon: Activity,
        href: '/activity',
      },
      {
        name: 'Integrations',
        description:
          'Connect your existing tools and services to Peak One.',
        icon: Globe,
        href: '/settings/integrations',
      },
      {
        name: 'Help Center',
        description:
          'Guides, tutorials, and support resources.',
        icon: Search,
        href: '/help',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AllFeaturesPage() {
  const router = useRouter()

  const totalFeatures = categories.reduce(
    (sum, cat) => sum + cat.features.length,
    0,
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ----------------------------------------------------------------- */}
      {/* Hero */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {totalFeatures} features across {categories.length} categories
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Everything Peak One Can Do
          </h1>

          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
            One platform for communication, productivity, and AI-powered
            intelligence. Here&apos;s everything at your fingertips.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={() => router.push('/demo')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Open Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Feature Categories */}
      {/* ----------------------------------------------------------------- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {categories.map((category) => (
          <section key={category.title}>
            {/* Category header */}
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {category.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {category.description}
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.features.map((feature) => {
                const Icon = feature.icon
                return (
                  <button
                    key={feature.name}
                    onClick={() => router.push(feature.href)}
                    className={`
                      group relative text-left p-4 bg-white dark:bg-gray-800/50
                      border ${category.colorClasses.border}
                      rounded-xl hover:shadow-md
                      hover:border-opacity-100 transition-all duration-200
                      cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={`
                          w-10 h-10 shrink-0 rounded-lg flex items-center justify-center
                          ${category.colorClasses.bg}
                        `}
                      >
                        <Icon
                          className={`w-5 h-5 ${category.colorClasses.text}`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {feature.name}
                          </span>
                          {feature.badge && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                              {feature.badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="w-4 h-4 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Bottom CTA */}
      {/* ----------------------------------------------------------------- */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            Ready to dive in?
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            All {totalFeatures} features, one unified platform.
          </p>
          <button
            onClick={() => router.push('/demo')}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
