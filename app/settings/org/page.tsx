'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Building2, Users, Globe, Upload, Check } from 'lucide-react'
import { MOCK_ORG_IDENTITY } from '@/lib/peak/mock'

const ORG_STORAGE_KEY = 'orgIdentity'

export default function OrgSettingsPage() {
  const [orgName, setOrgName] = useState(MOCK_ORG_IDENTITY.company)
  const [orgSlug, setOrgSlug] = useState(MOCK_ORG_IDENTITY.companySlug)
  const [logoDataUri, setLogoDataUri] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Hydrate any locally-persisted edits.
  useEffect(() => {
    const raw = localStorage.getItem(ORG_STORAGE_KEY)
    if (raw) {
      try {
        const v = JSON.parse(raw)
        if (v.orgName) setOrgName(v.orgName)
        if (v.orgSlug) setOrgSlug(v.orgSlug)
        if (v.logoDataUri) setLogoDataUri(v.logoDataUri)
      } catch { /* ignore corrupt cache */ }
    }
  }, [])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setLogoDataUri(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    // EXTERNAL: needs PATCH /api/org + Supabase Storage for the logo. Demo path persists locally.
    localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify({ orgName, orgSlug, logoDataUri }))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Organization Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Manage your organization details</p>

        {/* Org Logo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Organization Logo</h2>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-xl flex items-center justify-center overflow-hidden">
              {logoDataUri ? (
                <Image src={logoDataUri} alt="Organization logo" width={80} height={80} className="w-20 h-20 object-cover" unoptimized />
              ) : (
                <Building2 className="w-10 h-10 text-white" />
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer w-fit">
                <Upload className="w-4 h-4" />
                Upload Logo
                <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
              <p className="text-xs text-gray-500 mt-2">Recommended: 200x200px, PNG or JPG</p>
            </div>
          </div>
        </div>

        {/* Org Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Organization Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization URL
              </label>
              <div className="flex items-center">
                <span className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 border border-r-0 border-gray-200 dark:border-gray-600 rounded-l-lg">
                  peakone.ai/
                </span>
                <input
                  type="text"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Billing Email
              </label>
              <input
                type="email"
                value={MOCK_ORG_IDENTITY.billingEmail}
                readOnly
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Stats — single source of truth from MOCK_ORG_IDENTITY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <Users className="w-8 h-8 text-purple-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{MOCK_ORG_IDENTITY.teamSize}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Team members</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <Building2 className="w-8 h-8 text-blue-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{MOCK_ORG_IDENTITY.departments}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Departments</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <Globe className="w-8 h-8 text-green-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{MOCK_ORG_IDENTITY.plan}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Current plan</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end items-center gap-3">
          {saved && (
            <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="w-4 h-4" /> Organization saved.
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
