'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Key, Smartphone, Monitor, AlertTriangle, Check } from 'lucide-react'
import { MOCK_USER } from '@/lib/peak/mock'

// Shared 2FA source of truth with the main /settings page (Account tab).
const TWO_FACTOR_KEY = 'security2FA'

// Sessions tied to Sarah Chen / San Francisco (Acme HQ). Demo data, deterministic.
const INITIAL_SESSIONS = [
  { id: 'sess-1', device: 'Chrome on macOS', location: 'San Francisco, CA', current: true, lastActive: 'Now' },
  { id: 'sess-2', device: 'Safari on iPhone', location: 'San Francisco, CA', current: false, lastActive: '2 hours ago' },
  { id: 'sess-3', device: 'Chrome on iPad', location: 'San Francisco, CA', current: false, lastActive: '3 days ago' },
]

export default function SecuritySettingsPage() {
  const router = useRouter()
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [sessions, setSessions] = useState(INITIAL_SESSIONS)
  const [toast, setToast] = useState<string | null>(null)

  // Read shared 2FA flag so this page and /settings agree.
  useEffect(() => {
    const stored = localStorage.getItem(TWO_FACTOR_KEY)
    if (stored !== null) setTwoFactorEnabled(stored === 'true')
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const toggle2FA = () => {
    // EXTERNAL: needs Clerk MFA enrollment. Demo path persists to the shared localStorage flag.
    const next = !twoFactorEnabled
    setTwoFactorEnabled(next)
    localStorage.setItem(TWO_FACTOR_KEY, String(next))
    showToast(next ? 'Two-factor authentication enabled.' : 'Two-factor authentication disabled.')
  }

  const changePassword = () => {
    // Deep-link to the main settings Account tab where the password form lives.
    router.push('/settings')
  }

  const signOutSession = (id: string) => {
    // EXTERNAL: needs Clerk session revocation. Demo path removes the session row locally.
    setSessions((prev) => prev.filter((s) => s.id !== id))
    showToast('Session signed out.')
  }

  const signOutAllOthers = () => {
    setSessions((prev) => prev.filter((s) => s.current))
    showToast('Signed out of all other sessions.')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Security</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Manage security settings for {MOCK_USER.name} ({MOCK_USER.email})
        </p>

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
            <button
              onClick={changePassword}
              className="px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition"
            >
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
              onClick={toggle2FA}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label="Toggle two-factor authentication"
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
            {sessions.some((s) => !s.current) && (
              <button onClick={signOutAllOthers} className="text-sm text-red-600 hover:underline">
                Sign out all other sessions
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {sessions.map(session => (
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
                  <button onClick={() => signOutSession(session.id)} className="text-sm text-red-600 hover:underline">
                    Sign out
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Tip */}
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

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg shadow-lg">
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-sm">{toast}</span>
        </div>
      )}
    </div>
  )
}
