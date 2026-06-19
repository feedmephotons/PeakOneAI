'use client'

import { useState } from 'react'
import { Plug, Check, Plus, ExternalLink } from 'lucide-react'
import { GlassPanel } from '@/components/peak'

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
    <div className="p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-peak mb-2">Integrations</h1>
        <p className="text-peak-muted mb-8">Connect your favorite tools and services</p>

        {/* Stats */}
        <GlassPanel className="p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-peak-primary/15 rounded-xl flex items-center justify-center ring-1 ring-peak-primary/20">
              <Plug className="w-6 h-6 text-peak-primary-300" />
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-peak">{connectedCount} Connected</p>
              <p className="text-peak-muted">{integrations.length} available integrations</p>
            </div>
          </div>
        </GlassPanel>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map(integration => (
            <GlassPanel key={integration.id} className="p-4 transition-colors hover:bg-white/[0.04]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/[0.05] rounded-xl flex items-center justify-center text-2xl">
                  {integration.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-peak">{integration.name}</h3>
                  <p className="text-sm text-peak-muted">{integration.description}</p>
                </div>
                <button
                  onClick={() => toggleConnection(integration.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    integration.connected
                      ? 'bg-peak-green/15 text-peak-green ring-1 ring-peak-green/20'
                      : 'bg-peak-primary text-white hover:bg-peak-primary-600'
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
            </GlassPanel>
          ))}
        </div>

        {/* Request Integration */}
        <div className="mt-8 text-center">
          <p className="text-peak-muted mb-2">Don&apos;t see what you need?</p>
          <button className="inline-flex items-center gap-2 text-peak-primary-300 hover:text-peak-primary transition-colors">
            Request an integration
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
