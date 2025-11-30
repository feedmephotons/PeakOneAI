'use client'

import { useState } from 'react'
import { Shield, Key, Smartphone, Monitor, Clock, AlertTriangle } from 'lucide-react'

const SESSIONS = [
  { id: '1', device: 'Chrome on macOS', location: 'San Francisco, CA', current: true, lastActive: 'Now' },
  { id: '2', device: 'Safari on iPhone', location: 'San Francisco, CA', current: false, lastActive: '2 hours ago' },
  { id: '3', device: 'Chrome on Windows', location: 'New York, NY', current: false, lastActive: '3 days ago' },
]

export default function SecuritySettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Security</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Manage your account security settings</p>

        {/* Password */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Password</h3>
                <p className="text-sm text-gray-500">Last changed 30 days ago</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition">
              Change Password
            </button>
          </div>
        </div>

        {/* Two-Factor */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">
                  {twoFactorEnabled ? 'Enabled via authenticator app' : 'Add an extra layer of security'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Active Sessions</h2>
            <button className="text-sm text-red-600 hover:underline">Sign out all other sessions</button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {SESSIONS.map(session => (
              <div key={session.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Monitor className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {session.device}
                      {session.current && <span className="ml-2 text-xs text-green-600">(Current)</span>}
                    </p>
                    <p className="text-sm text-gray-500">{session.location} • {session.lastActive}</p>
                  </div>
                </div>
                {!session.current && (
                  <button className="text-sm text-red-600 hover:underline">Sign out</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Log */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Security Tip</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Review your active sessions regularly and sign out of devices you don&apos;t recognize.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
