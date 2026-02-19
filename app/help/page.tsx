'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  HelpCircle, Search, Book, MessageCircle, Video, FileText, Users,
  Bot, ChevronRight, ExternalLink, Play, Mail, Phone
} from 'lucide-react'

const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Play,
    description: 'Learn the basics and set up your workspace',
    articles: [
      { title: 'Welcome to Peak One', url: '#' },
      { title: 'Setting up your profile', url: '#' },
      { title: 'Inviting team members', url: '#' },
      { title: 'Your first message', url: '#' },
    ]
  },
  {
    id: 'messaging',
    title: 'Messaging & Channels',
    icon: MessageCircle,
    description: 'Master team communication',
    articles: [
      { title: 'Creating channels', url: '#' },
      { title: 'Direct messages', url: '#' },
      { title: 'Message formatting', url: '#' },
      { title: 'Mentions and notifications', url: '#' },
    ]
  },
  {
    id: 'video',
    title: 'Video & Calls',
    icon: Video,
    description: 'Video conferencing and screen sharing',
    articles: [
      { title: 'Starting a video call', url: '#' },
      { title: 'Screen sharing', url: '#' },
      { title: 'Meeting recordings', url: '#' },
      { title: 'Audio settings', url: '#' },
    ]
  },
  {
    id: 'files',
    title: 'Files & Storage',
    icon: FileText,
    description: 'Manage and share files',
    articles: [
      { title: 'Uploading files', url: '#' },
      { title: 'File sharing permissions', url: '#' },
      { title: 'Storage limits', url: '#' },
      { title: 'AI file analysis', url: '#' },
    ]
  },
  {
    id: 'lisa-ai',
    title: 'Lisa AI Assistant',
    icon: Bot,
    description: 'Get the most from your AI assistant',
    articles: [
      { title: 'Introduction to Lisa', url: '#' },
      { title: 'AI chat commands', url: '#' },
      { title: 'Document summarization', url: '#' },
      { title: 'Meeting transcription', url: '#' },
    ]
  },
  {
    id: 'teams',
    title: 'Teams & Organizations',
    icon: Users,
    description: 'Manage your organization',
    articles: [
      { title: 'Creating organizations', url: '#' },
      { title: 'User roles and permissions', url: '#' },
      { title: 'Team settings', url: '#' },
      { title: 'Billing and subscriptions', url: '#' },
    ]
  },
]

const POPULAR_ARTICLES = [
  { title: 'How to reset your password', category: 'Account' },
  { title: 'Keyboard shortcuts guide', category: 'Productivity' },
  { title: 'Understanding your billing', category: 'Billing' },
  { title: 'Two-factor authentication setup', category: 'Security' },
  { title: 'Integrating with other apps', category: 'Integrations' },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-lg text-purple-100 mb-8">
            Search our knowledge base or browse by category
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-0 rounded-xl focus:outline-none focus:ring-4 focus:ring-white/30 text-gray-900 dark:text-white text-lg shadow-xl"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Categories Grid */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {HELP_CATEGORIES.map(category => {
            const Icon = category.icon
            return (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{category.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {category.articles.map((article, index) => (
                    <li key={index}>
                      <Link
                        href={article.url}
                        className="flex items-center justify-between py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                      >
                        <span>{article.title}</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Popular Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Popular Articles
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
              {POPULAR_ARTICLES.map((article, index) => (
                <Link
                  key={index}
                  href="#"
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <Book className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{article.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{article.category}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Need More Help?
            </h2>
            <div className="space-y-4">
              <Link
                href="/support"
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
              >
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Contact Support</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get help from our team</p>
                </div>
              </Link>

              <Link
                href="/docs"
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Documentation</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">In-depth guides & API docs</p>
                </div>
              </Link>

              <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Ask Lisa AI</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get instant answers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
