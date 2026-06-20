'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, Smartphone, Check } from 'lucide-react'

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Notifications</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Choose how you want to be notified</p>

        {/* Channel Headers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="col-span-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notification Type</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Smartphone className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Push</span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Bell className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">In-App</span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {settings.map(setting => (
              <div key={setting.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{setting.label}</p>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
                {(['email', 'push', 'inApp'] as const).map(channel => (
                  <div key={channel} className="text-center">
                    <button
                      onClick={() => toggleSetting(setting.id, channel)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        setting[channel] ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
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
        </div>

        {/* Quiet Hours */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quiet Hours</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Pause notifications during specific hours
          </p>
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">From</label>
              <select
                value={quietFrom}
                onChange={(e) => setQuietFrom(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                {QUIET_FROM.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">To</label>
              <select
                value={quietTo}
                onChange={(e) => setQuietTo(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                {QUIET_TO.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="mt-8 flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="w-4 h-4" /> Preferences saved.
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}
