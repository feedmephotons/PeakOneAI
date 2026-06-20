'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Mail, Smartphone, Check, ArrowLeft } from 'lucide-react'
import { GlassPanel, SectionLabel } from '@/components/peak'

interface NotificationSetting {
  id: string
  label: string
  description: string
  email: boolean
  push: boolean
  inApp: boolean
}

const DEFAULT_SETTINGS: NotificationSetting[] = [
  { id: 'messages', label: 'Messages', description: 'When someone sends you a message', email: false, push: true, inApp: true },
  { id: 'mentions', label: 'Mentions', description: 'When someone mentions you', email: true, push: true, inApp: true },
  { id: 'tasks', label: 'Task Updates', description: 'When tasks are assigned or completed', email: true, push: false, inApp: true },
  { id: 'meetings', label: 'Meeting Reminders', description: 'Reminders before scheduled meetings', email: true, push: true, inApp: true },
  { id: 'ai', label: 'AI Insights', description: 'When Lisa AI has recommendations', email: false, push: false, inApp: true },
  { id: 'files', label: 'File Shares', description: 'When files are shared with you', email: false, push: false, inApp: true },
]

const STORAGE_KEY = 'notificationPreferences'
const QUIET_FROM = ['10:00 PM', '11:00 PM', '12:00 AM']
const QUIET_TO = ['7:00 AM', '8:00 AM', '9:00 AM']

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>(DEFAULT_SETTINGS)
  const [quietFrom, setQuietFrom] = useState(QUIET_FROM[0])
  const [quietTo, setQuietTo] = useState(QUIET_TO[0])
  const [saved, setSaved] = useState(false)

  // Hydrate persisted preferences.
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const v = JSON.parse(raw)
        if (Array.isArray(v.settings)) setSettings(v.settings)
        if (v.quietFrom) setQuietFrom(v.quietFrom)
        if (v.quietTo) setQuietTo(v.quietTo)
      } catch { /* ignore corrupt cache */ }
    }
  }, [])

  const toggleSetting = (id: string, channel: 'email' | 'push' | 'inApp') => {
    setSettings(settings.map(s =>
      s.id === id ? { ...s, [channel]: !s[channel] } : s
    ))
  }

  const handleSave = () => {
    // EXTERNAL: needs a NotificationPreference API. Demo path persists to localStorage.
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, quietFrom, quietTo }))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/settings"
            className="p-2 -ml-2 rounded-xl transition-colors hover:bg-white/[0.04]"
            aria-label="Back to settings"
          >
            <ArrowLeft className="w-5 h-5 text-peak-muted" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-peak">Notifications</h1>
        </div>
        <p className="text-peak-muted mb-8">Choose how you want to be notified</p>

        {/* Channel Headers */}
        <GlassPanel className="overflow-hidden">
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-peak-border bg-white/[0.03]">
            <div className="col-span-1">
              <span className="text-sm font-medium text-peak-muted">Notification Type</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Mail className="w-4 h-4 text-peak-dim" />
                <span className="text-sm font-medium text-peak-muted">Email</span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Smartphone className="w-4 h-4 text-peak-dim" />
                <span className="text-sm font-medium text-peak-muted">Push</span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Bell className="w-4 h-4 text-peak-dim" />
                <span className="text-sm font-medium text-peak-muted">In-App</span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-peak-border">
            {settings.map(setting => (
              <div key={setting.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                <div>
                  <p className="font-medium text-peak">{setting.label}</p>
                  <p className="text-sm text-peak-muted">{setting.description}</p>
                </div>
                {(['email', 'push', 'inApp'] as const).map(channel => (
                  <div key={channel} className="text-center">
                    <button
                      onClick={() => toggleSetting(setting.id, channel)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        setting[channel] ? 'bg-peak-primary' : 'bg-white/[0.08]'
                      }`}
                      aria-label={`Toggle ${setting.label} ${channel}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        setting[channel] ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Quiet Hours */}
        <GlassPanel className="mt-8 p-6">
          <SectionLabel className="mb-4">Quiet Hours</SectionLabel>
          <p className="text-sm text-peak-muted mb-4">
            Pause notifications during specific hours
          </p>
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm text-peak-muted">From</label>
              <select
                value={quietFrom}
                onChange={(e) => setQuietFrom(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white/[0.04] border border-peak-border text-peak rounded-lg focus:border-peak-primary/50"
              >
                {QUIET_FROM.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-peak-muted">To</label>
              <select
                value={quietTo}
                onChange={(e) => setQuietTo(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white/[0.04] border border-peak-border text-peak rounded-lg focus:border-peak-primary/50"
              >
                {QUIET_TO.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </GlassPanel>

        {/* Save */}
        <div className="mt-8 flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-2 text-sm text-peak-green">
              <Check className="w-4 h-4" /> Preferences saved.
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-peak-primary text-white rounded-xl hover:bg-peak-primary-600 transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}
