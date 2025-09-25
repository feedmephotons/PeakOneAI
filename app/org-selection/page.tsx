'use client'

import { OrganizationList } from '@clerk/nextjs'

export default function OrgSelectionPage() {
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

        <OrganizationList
          appearance={{
            elements: {
              rootBox: "mx-auto",
              organizationPreviewMainIdentifier: "text-gray-900 dark:text-white",
              organizationPreviewSecondaryIdentifier: "text-gray-600 dark:text-gray-400",
              organizationPreview: "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
            }
          }}
          hidePersonal={false}
          afterCreateOrganizationUrl="/files"
          afterSelectOrganizationUrl="/files"
        />
      </div>
    </div>
  )
}