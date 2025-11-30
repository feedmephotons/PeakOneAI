'use client'

import { useState } from 'react'
import { Building2, Users, Globe, Upload } from 'lucide-react'

export default function OrgSettingsPage() {
  const [orgName, setOrgName] = useState('Acme Corp')
  const [orgSlug, setOrgSlug] = useState('acme-corp')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Organization Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Manage your organization details</p>

        {/* Org Logo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Organization Logo</h2>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload Logo
                <input type="file" className="hidden" accept="image/*" />
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
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <Users className="w-8 h-8 text-purple-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Team members</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <Building2 className="w-8 h-8 text-blue-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Departments</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <Globe className="w-8 h-8 text-green-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">Professional</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Current plan</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
