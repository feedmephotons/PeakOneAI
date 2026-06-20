'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Building2, Users, Globe, Upload, Check, ArrowLeft } from 'lucide-react'
import { GlassPanel } from '@/components/peak'
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
    <div className="p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-peak-muted hover:text-peak transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>

        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-peak mb-2">Organization Settings</h1>
        <p className="text-peak-muted mb-8">Manage your organization details</p>

        {/* Org Logo */}
        <GlassPanel className="p-6 mb-6">
          <h2 className="font-semibold text-peak mb-4">Organization Logo</h2>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-peak-primary rounded-xl flex items-center justify-center overflow-hidden">
              {logoDataUri ? (
                <Image src={logoDataUri} alt="Organization logo" width={80} height={80} className="w-20 h-20 object-cover" unoptimized />
              ) : (
                <Building2 className="w-10 h-10 text-white" />
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-peak-border text-peak rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer w-fit">
                <Upload className="w-4 h-4" />
                Upload Logo
                <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
              <p className="text-xs text-peak-dim mt-2">Recommended: 200x200px, PNG or JPG</p>
            </div>
          </div>
        </GlassPanel>

        {/* Org Details */}
        <GlassPanel className="p-6 mb-6">
          <h2 className="font-semibold text-peak mb-4">Organization Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-peak-muted mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-lg focus:outline-none focus:border-peak-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-peak-muted mb-2">
                Organization URL
              </label>
              <div className="flex items-center">
                <span className="px-4 py-2 bg-white/[0.02] text-peak-muted border border-r-0 border-peak-border rounded-l-lg">
                  peakone.ai/
                </span>
                <input
                  type="text"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-r-lg focus:outline-none focus:border-peak-primary/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-peak-muted mb-2">
                Billing Email
              </label>
              <input
                type="email"
                value={MOCK_ORG_IDENTITY.billingEmail}
                readOnly
                className="w-full px-4 py-2 bg-white/[0.02] border border-peak-border rounded-lg text-peak-muted"
              />
            </div>
          </div>
        </GlassPanel>

        {/* Stats — single source of truth from MOCK_ORG_IDENTITY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <GlassPanel className="p-6">
            <Users className="w-8 h-8 text-peak-primary-300 mb-3" />
            <p className="text-2xl font-semibold tracking-tight text-peak">{MOCK_ORG_IDENTITY.teamSize}</p>
            <p className="text-sm text-peak-muted">Team members</p>
          </GlassPanel>
          <GlassPanel className="p-6">
            <Building2 className="w-8 h-8 text-peak-primary-300 mb-3" />
            <p className="text-2xl font-semibold tracking-tight text-peak">{MOCK_ORG_IDENTITY.departments}</p>
            <p className="text-sm text-peak-muted">Departments</p>
          </GlassPanel>
          <GlassPanel className="p-6">
            <Globe className="w-8 h-8 text-peak-green mb-3" />
            <p className="text-2xl font-semibold tracking-tight text-peak">{MOCK_ORG_IDENTITY.plan}</p>
            <p className="text-sm text-peak-muted">Current plan</p>
          </GlassPanel>
        </div>

        {/* Save Button */}
        <div className="flex justify-end items-center gap-3">
          {saved && (
            <span className="flex items-center gap-2 text-sm text-peak-green">
              <Check className="w-4 h-4" /> Organization saved.
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-peak-primary text-white rounded-xl hover:bg-peak-primary-600 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
