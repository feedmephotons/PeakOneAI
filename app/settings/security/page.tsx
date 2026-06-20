'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Key, Smartphone, Monitor, AlertTriangle, Check, ArrowLeft } from 'lucide-react'
import { GlassPanel, SectionLabel } from '@/components/peak'
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
    <div className="p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back to settings */}
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-peak-muted hover:text-peak transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>

        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-peak mb-2">Security</h1>
        <p className="text-peak-muted mb-8">
          Manage security settings for {MOCK_USER.name} ({MOCK_USER.email})
        </p>

        {/* Password */}
        <GlassPanel className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/[0.05] rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-peak-muted" />
              </div>
              <div>
                <h3 className="font-medium text-peak">Password</h3>
                <p className="text-sm text-peak-muted">Last changed 30 days ago</p>
              </div>
            </div>
            <button
              onClick={changePassword}
              className="px-4 py-2 text-sm text-peak-primary-300 hover:text-peak-primary hover:bg-white/[0.04] rounded-lg transition-colors"
            >
              Change Password
            </button>
          </div>
        </GlassPanel>

        {/* Two-Factor */}
        <GlassPanel className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-peak-green/15 rounded-lg flex items-center justify-center ring-1 ring-peak-green/20">
                <Smartphone className="w-5 h-5 text-peak-green" />
              </div>
              <div>
                <h3 className="font-medium text-peak">Two-Factor Authentication</h3>
                <p className="text-sm text-peak-muted">
                  {twoFactorEnabled ? 'Enabled via authenticator app' : 'Add an extra layer of security'}
                </p>
              </div>
            </div>
            <button
              onClick={toggle2FA}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                twoFactorEnabled ? 'bg-peak-primary' : 'bg-white/[0.12]'
              }`}
              aria-label="Toggle two-factor authentication"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </GlassPanel>

        {/* Active Sessions */}
        <div className="bg-peak-glass border border-peak-border rounded-2xl overflow-hidden mb-6 shadow-peak backdrop-blur">
          <div className="p-4 border-b border-peak-border flex items-center justify-between">
            <SectionLabel>Active Sessions</SectionLabel>
            {sessions.some((s) => !s.current) && (
              <button onClick={signOutAllOthers} className="text-sm text-peak-red hover:underline">
                Sign out all other sessions
              </button>
            )}
          </div>
          <div className="divide-y divide-peak-border">
            {sessions.map(session => (
              <div key={session.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Monitor className="w-5 h-5 text-peak-dim" />
                  <div>
                    <p className="font-medium text-peak">
                      {session.device}
                      {session.current && <span className="ml-2 text-xs text-peak-green">(Current)</span>}
                    </p>
                    <p className="text-sm text-peak-muted">{session.location} • {session.lastActive}</p>
                  </div>
                </div>
                {!session.current && (
                  <button onClick={() => signOutSession(session.id)} className="text-sm text-peak-red hover:underline">
                    Sign out
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Tip */}
        <div className="bg-peak-amber/10 rounded-2xl border border-peak-amber/25 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-peak-amber" />
            <div>
              <p className="font-medium text-peak">Security Tip</p>
              <p className="text-sm text-peak-muted">
                Review your active sessions regularly and sign out of devices you don&apos;t recognize.
              </p>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-peak-glass border border-peak-border text-peak rounded-xl shadow-lg backdrop-blur">
          <Check className="w-4 h-4 text-peak-green" />
          <span className="text-sm">{toast}</span>
        </div>
      )}
    </div>
  )
}
