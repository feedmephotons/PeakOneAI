'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Book, Search, ChevronRight, Code, Zap, Shield, Database,
  Webhook, Key, Terminal, FileCode, GitBranch, Box
} from 'lucide-react'

const DOC_SECTIONS = [
  {
    id: 'quickstart',
    title: 'Quick Start',
    icon: Zap,
    description: 'Get up and running in minutes',
    items: [
      { title: 'Installation', url: '#' },
      { title: 'Authentication', url: '#' },
      { title: 'First API Call', url: '#' },
      { title: 'SDK Setup', url: '#' },
    ]
  },
  {
    id: 'api',
    title: 'API Reference',
    icon: Code,
    description: 'Complete API documentation',
    items: [
      { title: 'REST API Overview', url: '#' },
      { title: 'Messages API', url: '#' },
      { title: 'Files API', url: '#' },
      { title: 'Users API', url: '#' },
      { title: 'Channels API', url: '#' },
    ]
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    icon: Webhook,
    description: 'Real-time event notifications',
    items: [
      { title: 'Webhook Setup', url: '#' },
      { title: 'Event Types', url: '#' },
      { title: 'Payload Format', url: '#' },
      { title: 'Security', url: '#' },
    ]
  },
  {
    id: 'sdks',
    title: 'SDKs & Libraries',
    icon: Box,
    description: 'Official client libraries',
    items: [
      { title: 'JavaScript/Node.js', url: '#' },
      { title: 'Python', url: '#' },
      { title: 'Go', url: '#' },
      { title: 'Ruby', url: '#' },
    ]
  },
  {
    id: 'authentication',
    title: 'Authentication',
    icon: Key,
    description: 'API keys and OAuth',
    items: [
      { title: 'API Keys', url: '#' },
      { title: 'OAuth 2.0', url: '#' },
      { title: 'JWT Tokens', url: '#' },
      { title: 'Scopes & Permissions', url: '#' },
    ]
  },
  {
    id: 'security',
    title: 'Security',
    icon: Shield,
    description: 'Best practices and compliance',
    items: [
      { title: 'Data Encryption', url: '#' },
      { title: 'Rate Limiting', url: '#' },
      { title: 'IP Allowlisting', url: '#' },
      { title: 'Audit Logs', url: '#' },
    ]
  },
]

const CODE_EXAMPLES = [
  {
    language: 'JavaScript',
    code: `import { PeakOne } from '@peakone/sdk';

const client = new PeakOne({
  apiKey: process.env.PEAKONE_API_KEY
});

// Send a message
const message = await client.messages.create({
  channel: 'general',
  content: 'Hello from the API!'
});`
  },
  {
    language: 'Python',
    code: `from peakone import PeakOne

client = PeakOne(api_key=os.environ['PEAKONE_API_KEY'])

# Send a message
message = client.messages.create(
    channel='general',
    content='Hello from the API!'
)`
  },
  {
    language: 'cURL',
    code: `curl -X POST https://api.peakone.ai/v1/messages \\
  -H "Authorization: Bearer $PEAKONE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"channel": "general", "content": "Hello!"}'`
  }
]

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Book className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documentation</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">PeakOne AI Developer Docs</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="#"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <GitBranch className="w-4 h-4" />
                v2.0
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Terminal className="w-4 h-4" />
                API Console
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {DOC_SECTIONS.map(section => {
            const Icon = section.icon
            return (
              <div
                key={section.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{section.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{section.description}</p>
                  </div>
                </div>
                <ul className="space-y-1">
                  {section.items.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.url}
                        className="flex items-center justify-between py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                      >
                        <span>{item.title}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Code Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Example</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Send your first message with just a few lines of code</p>
            </div>
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {CODE_EXAMPLES.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                    activeTab === index
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {example.language}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6 bg-gray-900">
            <pre className="text-sm text-gray-300 overflow-x-auto">
              <code>{CODE_EXAMPLES[activeTab].code}</code>
            </pre>
          </div>
        </div>

        {/* API Status */}
        <div className="mt-8 flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800 dark:text-green-300">
              All systems operational
            </span>
          </div>
          <Link
            href="#"
            className="text-sm text-green-700 dark:text-green-400 hover:underline"
          >
            View status page →
          </Link>
        </div>
      </div>
    </div>
  )
}
