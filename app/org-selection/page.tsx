'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OrgSelectionPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if Clerk is available
    const hasClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

    if (!hasClerk) {
      // No Clerk available, redirect to files
      router.push('/files')
    }
  }, [router])

  // If Clerk is available, it will be loaded dynamically
  const hasClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (!hasClerk) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Redirecting...
          </h2>
        </div>
      </div>
    )
  }

  // This will be replaced by actual Clerk components when available
  // For now, show a placeholder

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SaasX</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Select a Workspace
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose or create a workspace to continue
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-4">Organization selection requires Clerk authentication to be configured.</p>
            <button
              onClick={() => router.push('/files')}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
            >
              Continue without organization
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}