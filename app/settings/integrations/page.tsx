'use client'

import { useState } from 'react'
import { Plug, Check, Plus, ExternalLink } from 'lucide-react'

const INTEGRATIONS = [
  { id: '1', name: 'Slack', description: 'Send notifications to Slack channels', icon: '💬', connected: true },
  { id: '2', name: 'Google Calendar', description: 'Sync your calendar events', icon: '📅', connected: true },
  { id: '3', name: 'GitHub', description: 'Link repositories and track issues', icon: '🐙', connected: false },
  { id: '4', name: 'Jira', description: 'Sync tasks and projects', icon: '📋', connected: false },
  { id: '5', name: 'Notion', description: 'Import and export documents', icon: '📝', connected: false },
  { id: '6', name: 'Figma', description: 'Embed design files', icon: '🎨', connected: true },
  { id: '7', name: 'Zoom', description: 'Start meetings directly', icon: '📹', connected: false },
  { id: '8', name: 'Salesforce', description: 'Sync CRM data', icon: '☁️', connected: false },
]

export default function IntegrationsSettingsPage() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS)

  const toggleConnection = (id: string) => {
    setIntegrations(integrations.map(i =>
      i.id === id ? { ...i, connected: !i.connected } : i
    ))
  }

  const connectedCount = integrations.filter(i => i.connected).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Integrations</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Connect your favorite tools and services</p>

        {/* Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Plug className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{connectedCount} Connected</p>
              <p className="text-gray-600 dark:text-gray-400">{integrations.length} available integrations</p>
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map(integration => (
            <div key={integration.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                  {integration.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{integration.name}</h3>
                  <p className="text-sm text-gray-500">{integration.description}</p>
                </div>
                <button
                  onClick={() => toggleConnection(integration.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    integration.connected
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {integration.connected ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Plus className="w-4 h-4" />
                      Connect
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Request Integration */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">Don&apos;t see what you need?</p>
          <button className="inline-flex items-center gap-2 text-purple-600 hover:underline">
            Request an integration
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
