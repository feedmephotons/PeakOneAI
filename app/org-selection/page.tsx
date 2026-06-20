'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Check, Plus } from 'lucide-react'
import { ACME_COMPANY, ACME_TEAM_SIZE, MOCK_USER } from '@/lib/peak/mock'

export default function OrgSelectionPage() {
  const router = useRouter()
  const hasClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  // Workspace name can be overridden by the onboarding flow.
  const [workspaceName, setWorkspaceName] = useState(ACME_COMPANY)
  const [selecting, setSelecting] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('peak.activeWorkspaceName')
    if (stored) setWorkspaceName(stored)
  }, [])

  // EXTERNAL: needs Clerk OrganizationList when CLERK is configured. For the
  // mock world we render the canonical Acme Corp workspace and continue.
  const selectWorkspace = () => {
    setSelecting(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('peak.activeWorkspaceName', workspaceName)
    }
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Peak One</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Select a Workspace
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a workspace to continue
          </p>
          {!hasClerk && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Showing your demo workspace (sign-in not configured).
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-3">
          {/* Canonical Acme Corp workspace card */}
          <button
            onClick={selectWorkspace}
            disabled={selecting}
            className="group flex w-full items-center gap-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 text-left transition-all hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-60"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <Building2 className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 dark:text-white">{workspaceName}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {ACME_TEAM_SIZE} members · {MOCK_USER.name} (Owner)
              </div>
            </div>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-gray-700">
              <Check className="h-4 w-4" />
            </span>
          </button>

          {/* Create a new workspace */}
          <button
            onClick={() => router.push('/onboarding')}
            className="flex w-full items-center gap-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 text-left transition-all hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700/40"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              <Plus className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 dark:text-white">Create new workspace</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Set up a fresh organization</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
