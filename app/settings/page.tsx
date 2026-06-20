'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  User, Camera, Shield, Bell, Moon, Sun,
  Monitor, Palette, Trash2, Download, Upload,
  Save, Eye, EyeOff, Settings2, ChevronRight,
  Database, CreditCard, Check, PanelLeft, LayoutGrid, Menu
} from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { GlassPanel } from '@/components/peak'
import { MOCK_USER, MOCK_ORG_IDENTITY, ACME_COMPANY } from '@/lib/peak/mock'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  bio: string
  location: string
  website: string
  company: string
  role: string
  joinDate: Date | string
}

interface Settings {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    desktop: boolean
    messages: boolean
    tasks: boolean
    meetings: boolean
    updates: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'team' | 'private'
    showEmail: boolean
    showPhone: boolean
    showLocation: boolean
    activityStatus: boolean
  }
  preferences: {
    soundEffects: boolean
    animations: boolean
    compactMode: boolean
    sidebarCollapsed: boolean
    autoPlayVideos: boolean
    dataSaverQuality: 'low' | 'medium' | 'high'
  }
  security: {
    twoFactorEnabled: boolean
    loginAlerts: boolean
    trustedDevices: string[]
  }
}

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Settings2 },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Monitor },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'data', label: 'Data & Storage', icon: Database }
]

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const { navStyle, setNavStyle } = useAppStore()
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    name: '',
    email: '',
    phone: '',
    avatar: '',
    bio: '',
    location: '',
    website: '',
    company: '',
    role: '',
    joinDate: new Date()
  })
  const [settings, setSettings] = useState<Settings>({
    theme: 'system',
    language: 'en',
    timezone: 'America/New_York',
    notifications: {
      email: true,
      push: true,
      desktop: true,
      messages: true,
      tasks: true,
      meetings: true,
      updates: false
    },
    privacy: {
      profileVisibility: 'team',
      showEmail: true,
      showPhone: false,
      showLocation: true,
      activityStatus: true
    },
    preferences: {
      soundEffects: true,
      animations: true,
      compactMode: false,
      sidebarCollapsed: false,
      autoPlayVideos: false,
      dataSaverQuality: 'medium'
    },
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      trustedDevices: []
    }
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Load settings from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile')
    const savedSettings = localStorage.getItem('userSettings')

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    } else {
      // Set default profile from the canonical Acme identity (Sarah Chen / Founder & CEO).
      const defaultProfile = {
        id: MOCK_USER.id,
        name: MOCK_USER.name,
        email: MOCK_USER.email ?? '',
        phone: '+1 (415) 555-0142',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(MOCK_USER.name)}&background=6366f1&color=fff`,
        bio: 'Founder & CEO at Acme Corp. Building Product X to turn scattered company knowledge into action.',
        location: 'San Francisco, CA',
        website: 'https://acmecorp.com',
        company: ACME_COMPANY,
        role: MOCK_USER.role ?? 'Founder & CEO',
        joinDate: '2026-01-15T00:00:00.000Z'
      }
      setProfile(defaultProfile)
      localStorage.setItem('userProfile', JSON.stringify(defaultProfile))
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    } else {
      localStorage.setItem('userSettings', JSON.stringify(settings))
    }

    // Apply theme
    const theme = savedSettings ? JSON.parse(savedSettings).theme : 'system'
    applyTheme(theme)

    // Sync 2FA from the shared source of truth used by /settings/security.
    const shared2FA = localStorage.getItem('security2FA')
    if (shared2FA !== null) {
      setSettings((prev) => ({
        ...prev,
        security: { ...prev.security, twoFactorEnabled: shared2FA === 'true' },
      }))
    }
  }, [])

  const applyTheme = (theme: string) => {
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      localStorage.setItem('userProfile', JSON.stringify(profile))
      localStorage.setItem('userSettings', JSON.stringify(settings))
      setIsSaving(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }, 1000)
  }

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setSettings({ ...settings, theme })
    applyTheme(theme)
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const [passwordMessage, setPasswordMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'err', text: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'err', text: 'Password must be at least 8 characters.' })
      return
    }
    // EXTERNAL: needs Clerk (user.updatePassword). Demo path records the change time locally.
    localStorage.setItem('passwordChangedAt', new Date().toISOString())
    setPasswordMessage({ type: 'ok', text: 'Password updated.' })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setPasswordMessage(null), 3000)
  }

  const handleClearCache = () => {
    // Clear non-essential cached keys; keep profile + settings intact.
    const keep = new Set(['userProfile', 'userSettings'])
    Object.keys(localStorage)
      .filter((k) => !keep.has(k) && (k.startsWith('cache') || k.startsWith('peak:cache')))
      .forEach((k) => localStorage.removeItem(k))
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleDeleteAccount = () => {
    // EXTERNAL: needs Clerk/Supabase account deletion. Demo path clears local state and returns home.
    if (!confirm('Permanently delete your account and all local data? This cannot be undone.')) return
    localStorage.removeItem('userProfile')
    localStorage.removeItem('userSettings')
    router.push('/')
  }

  const handleExportData = () => {
    const data = {
      profile,
      settings,
      exportDate: new Date().toISOString()
    }
    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `acme_settings_${new Date().toISOString()}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.profile) setProfile(data.profile)
          if (data.settings) setSettings(data.settings)
          handleSave()
        } catch {
          alert('Invalid file format')
        }
      }
      reader.readAsText(file)
    }
  }

  // Stable storage figure sourced from the canonical org identity (no Math.random in render).
  const GB = 1024 * 1024 * 1024
  const storage = {
    used: MOCK_ORG_IDENTITY.storageUsedGb * GB,
    total: MOCK_ORG_IDENTITY.storageTotalGb * GB,
    percent: (MOCK_ORG_IDENTITY.storageUsedGb / MOCK_ORG_IDENTITY.storageTotalGb) * 100,
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-peak mb-2">Settings</h1>
          <p className="text-peak-muted">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-peak-glass border border-peak-border rounded-2xl p-2">
              {TABS.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      // Billing has a dedicated page; deep-link instead of a dead panel.
                      if (tab.id === 'billing') { router.push('/settings/billing'); return }
                      setActiveTab(tab.id)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-peak-primary/15 text-peak ring-1 ring-peak-primary/20'
                        : 'text-peak-muted hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                    {activeTab === tab.id && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <GlassPanel className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-peak mb-4">Profile Information</h2>
                    <p className="text-sm text-peak-muted mb-6">
                      Update your personal information and profile details
                    </p>
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Image
                        src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&background=6366f1&color=fff`}
                        alt={profile.name}
                        className="w-24 h-24 rounded-full object-cover"
                        width={96}
                        height={96}
                      />
                      <label className="absolute bottom-0 right-0 p-1 bg-peak-glass border border-peak-border rounded-full shadow-lg cursor-pointer hover:bg-white/[0.04]">
                        <Camera className="w-4 h-4 text-peak-muted" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-peak">{profile.name}</h3>
                      <p className="text-sm text-peak-muted">{profile.role}</p>
                      <p className="text-xs text-peak-dim mt-1">
                        Member since {new Date(profile.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-peak-muted mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-xl focus:outline-none focus:border-peak-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-peak-muted mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-xl focus:outline-none focus:border-peak-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-peak-muted mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-xl focus:outline-none focus:border-peak-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-peak-muted mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-xl focus:outline-none focus:border-peak-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-peak-muted mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={profile.company}
                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                        className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-xl focus:outline-none focus:border-peak-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-peak-muted mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-xl focus:outline-none focus:border-peak-primary/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-peak-muted mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-xl focus:outline-none focus:border-peak-primary/50"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-peak mb-4">Account Settings</h2>
                    <p className="text-sm text-peak-muted mb-6">
                      Manage your account security and authentication
                    </p>
                  </div>

                  {/* Change Password */}
                  <div className="border border-peak-border rounded-2xl p-6">
                    <h3 className="text-lg font-medium text-peak mb-4">Change Password</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-peak-muted mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={passwordVisible ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2 pr-10 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-xl focus:outline-none focus:border-peak-primary/50"
                          />
                          <button
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-peak-dim hover:text-peak-muted"
                          >
                            {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-peak-muted mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-xl focus:outline-none focus:border-peak-primary/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-peak-muted mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-xl focus:outline-none focus:border-peak-primary/50"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePasswordChange}
                          className="px-6 py-2 bg-peak-primary text-white rounded-xl hover:bg-peak-primary-600 transition-colors"
                        >
                          Update Password
                        </button>
                        {passwordMessage && (
                          <span className={`text-sm ${passwordMessage.type === 'ok' ? 'text-peak-green' : 'text-peak-red'}`}>
                            {passwordMessage.text}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="border border-peak-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-peak">Two-Factor Authentication</h3>
                        <p className="text-sm text-peak-muted mt-1">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorEnabled}
                          onChange={(e) => {
                            // Persist to the shared key so /settings/security stays in sync.
                            localStorage.setItem('security2FA', String(e.target.checked))
                            setSettings({
                              ...settings,
                              security: { ...settings.security, twoFactorEnabled: e.target.checked }
                            })
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/[0.08] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-peak-primary"></div>
                      </label>
                    </div>
                  </div>

                  {/* Login Alerts */}
                  <div className="border border-peak-border rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-peak">Login Alerts</h3>
                        <p className="text-sm text-peak-muted mt-1">
                          Get notified when someone logs into your account
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security.loginAlerts}
                          onChange={(e) => setSettings({
                            ...settings,
                            security: { ...settings.security, loginAlerts: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/[0.08] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-peak-primary"></div>
                      </label>
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="border border-peak-red/30 rounded-2xl p-6 bg-peak-red/10">
                    <h3 className="text-lg font-medium text-peak-red mb-2">Delete Account</h3>
                    <p className="text-sm text-peak-muted mb-4">
                      Permanently delete your account and all of your data. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-peak-red text-white rounded-xl hover:bg-peak-red/90 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-peak mb-4">Appearance</h2>
                    <p className="text-sm text-peak-muted mb-6">
                      Customize how Peak One looks and feels
                    </p>
                  </div>

                  {/* Theme Selection */}
                  <div>
                    <h3 className="text-lg font-medium text-peak mb-4">Theme</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => handleThemeChange('light')}
                        className={`p-4 border-2 rounded-2xl transition-colors ${
                          settings.theme === 'light'
                            ? 'border-peak-primary/60 bg-peak-primary/15'
                            : 'border-peak-border hover:bg-white/[0.04]'
                        }`}
                      >
                        <Sun className="w-8 h-8 mx-auto mb-2 text-peak-amber" />
                        <p className="text-sm font-medium text-peak">Light</p>
                      </button>

                      <button
                        onClick={() => handleThemeChange('dark')}
                        className={`p-4 border-2 rounded-2xl transition-colors ${
                          settings.theme === 'dark'
                            ? 'border-peak-primary/60 bg-peak-primary/15'
                            : 'border-peak-border hover:bg-white/[0.04]'
                        }`}
                      >
                        <Moon className="w-8 h-8 mx-auto mb-2 text-peak-primary-300" />
                        <p className="text-sm font-medium text-peak">Dark</p>
                      </button>

                      <button
                        onClick={() => handleThemeChange('system')}
                        className={`p-4 border-2 rounded-2xl transition-colors ${
                          settings.theme === 'system'
                            ? 'border-peak-primary/60 bg-peak-primary/15'
                            : 'border-peak-border hover:bg-white/[0.04]'
                        }`}
                      >
                        <Monitor className="w-8 h-8 mx-auto mb-2 text-peak-muted" />
                        <p className="text-sm font-medium text-peak">System</p>
                      </button>
                    </div>
                  </div>

                  {/* Navigation Style */}
                  <div>
                    <h3 className="text-lg font-medium text-peak mb-4">Navigation Style</h3>
                    <p className="text-sm text-peak-muted mb-4">
                      Choose how you want to navigate through the app
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setNavStyle('topnav')}
                        className={`p-4 border-2 rounded-2xl transition-colors ${
                          navStyle === 'topnav'
                            ? 'border-peak-primary/60 bg-peak-primary/15'
                            : 'border-peak-border hover:bg-white/[0.04]'
                        }`}
                      >
                        <Menu className="w-8 h-8 mx-auto mb-2 text-peak-muted" />
                        <p className="text-sm font-medium text-peak">Top Nav</p>
                        <p className="text-xs text-peak-dim mt-1">Horizontal menu</p>
                      </button>

                      <button
                        onClick={() => setNavStyle('sidebar')}
                        className={`p-4 border-2 rounded-2xl transition-colors ${
                          navStyle === 'sidebar'
                            ? 'border-peak-primary/60 bg-peak-primary/15'
                            : 'border-peak-border hover:bg-white/[0.04]'
                        }`}
                      >
                        <PanelLeft className="w-8 h-8 mx-auto mb-2 text-peak-primary-300" />
                        <p className="text-sm font-medium text-peak">Sidebar</p>
                        <p className="text-xs text-peak-dim mt-1">Classic left panel</p>
                      </button>

                      <button
                        onClick={() => setNavStyle('megamenu')}
                        className={`p-4 border-2 rounded-2xl transition-colors ${
                          navStyle === 'megamenu'
                            ? 'border-peak-primary/60 bg-peak-primary/15'
                            : 'border-peak-border hover:bg-white/[0.04]'
                        }`}
                      >
                        <LayoutGrid className="w-8 h-8 mx-auto mb-2 text-peak-primary-300" />
                        <p className="text-sm font-medium text-peak">Mega Menu</p>
                        <p className="text-xs text-peak-dim mt-1">Flyout panels</p>
                      </button>
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-peak-muted mb-2">
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-xl focus:outline-none focus:border-peak-primary/50"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="zh">中文</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-sm font-medium text-peak-muted mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                      className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-xl focus:outline-none focus:border-peak-primary/50"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-peak mb-4">Notifications</h2>
                    <p className="text-sm text-peak-muted mb-6">
                      Choose what notifications you want to receive
                    </p>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-peak capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm text-peak-muted">
                            Receive notifications for {key}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, [key]: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-white/[0.08] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-peak-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-peak mb-4">Privacy & Security</h2>
                    <p className="text-sm text-peak-muted mb-6">
                      Control your privacy settings and data visibility
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-peak mb-4">Profile Visibility</h3>
                    <div className="space-y-3">
                      {['public', 'team', 'private'].map(visibility => (
                        <label key={visibility} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="visibility"
                            value={visibility}
                            checked={settings.privacy.profileVisibility === visibility}
                            onChange={(e) => setSettings({
                              ...settings,
                              privacy: { ...settings.privacy, profileVisibility: e.target.value as 'public' | 'team' | 'private' }
                            })}
                            className="w-4 h-4 accent-peak-primary"
                          />
                          <div>
                            <p className="font-medium text-peak capitalize">{visibility}</p>
                            <p className="text-sm text-peak-muted">
                              {visibility === 'public' && 'Anyone can view your profile'}
                              {visibility === 'team' && 'Only team members can view your profile'}
                              {visibility === 'private' && 'Only you can view your profile'}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(settings.privacy).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-peak">
                            {key === 'showEmail' && 'Show Email Address'}
                            {key === 'showPhone' && 'Show Phone Number'}
                            {key === 'showLocation' && 'Show Location'}
                            {key === 'activityStatus' && 'Show Activity Status'}
                          </p>
                          <p className="text-sm text-peak-muted">
                            Make this information visible to others
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value as boolean}
                            onChange={(e) => setSettings({
                              ...settings,
                              privacy: { ...settings.privacy, [key]: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-white/[0.08] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-peak-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data & Storage Tab */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-peak mb-4">Data & Storage</h2>
                    <p className="text-sm text-peak-muted mb-6">
                      Manage your data, storage, and export options
                    </p>
                  </div>

                  {/* Storage Usage */}
                  <div className="border border-peak-border rounded-2xl p-6">
                    <h3 className="text-lg font-medium text-peak mb-4">Storage Usage</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-peak-muted">Used</span>
                        <span className="font-medium text-peak">
                          {(storage.used / (1024 * 1024 * 1024)).toFixed(2)} GB of {(storage.total / (1024 * 1024 * 1024)).toFixed(0)} GB
                        </span>
                      </div>
                      <div className="w-full bg-white/[0.08] rounded-full h-2">
                        <div
                          className="bg-peak-primary h-2 rounded-full transition-all"
                          style={{ width: `${storage.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Export/Import Data */}
                  <div className="border border-peak-border rounded-2xl p-6">
                    <h3 className="text-lg font-medium text-peak mb-4">Export Your Data</h3>
                    <p className="text-sm text-peak-muted mb-4">
                      Download all your data including settings, preferences, and profile information
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleExportData}
                        className="px-4 py-2 bg-peak-primary text-white rounded-xl hover:bg-peak-primary-600 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export Data
                      </button>
                      <label className="px-4 py-2 border border-peak-border text-peak-muted rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Import Data
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportData}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Clear Cache */}
                  <div className="border border-peak-border rounded-2xl p-6">
                    <h3 className="text-lg font-medium text-peak mb-4">Clear Cache</h3>
                    <p className="text-sm text-peak-muted mb-4">
                      Clear cached data to free up storage space
                    </p>
                    <button
                      onClick={handleClearCache}
                      className="px-4 py-2 border border-peak-border text-peak-muted rounded-xl hover:bg-white/[0.04] transition-colors"
                    >
                      Clear Cache
                    </button>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-peak-border">
                <div>
                  {showSuccess && (
                    <div className="flex items-center gap-2 text-peak-green">
                      <Check className="w-4 h-4" />
                      <span className="text-sm">Settings saved successfully!</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-peak-primary text-white rounded-xl hover:bg-peak-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  )
}