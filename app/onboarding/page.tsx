'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Users, Briefcase, GraduationCap, Heart } from 'lucide-react'

const organizationTypes = [
  { id: 'startup', label: 'Startup', icon: Building2, description: 'Small, fast-growing team' },
  { id: 'enterprise', label: 'Enterprise', icon: Briefcase, description: 'Large organization' },
  { id: 'agency', label: 'Agency', icon: Users, description: 'Creative or consulting team' },
  { id: 'education', label: 'Education', icon: GraduationCap, description: 'School or university' },
  { id: 'nonprofit', label: 'Non-profit', icon: Heart, description: 'NGO or charity' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    orgName: '',
    orgType: '',
    teamSize: '',
    role: '',
  })


  const handleCreateOrganization = async () => {
    if (!formData.orgName) return

    setLoading(true)

    // Store onboarding data in localStorage for later use
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboardingData', JSON.stringify(formData))
    }

    // Simulate organization creation
    setTimeout(() => {
      router.push('/files')
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to SaasX</h1>
          </div>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map(num => (
              <div
                key={num}
                className={`h-2 w-16 rounded-full transition-colors ${
                  num <= step
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Let&apos;s set up your workspace
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Tell us a bit about your organization
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={formData.orgName}
                  onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                  placeholder="Acme Inc."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Organization Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {organizationTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        onClick={() => setFormData({ ...formData, orgType: type.id })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.orgType === type.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {type.label}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.orgName || !formData.orgType}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Team Details
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Help us customize your experience
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Size
                </label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select team size</option>
                  <option value="1">Just me</option>
                  <option value="2-10">2-10 people</option>
                  <option value="11-50">11-50 people</option>
                  <option value="51-200">51-200 people</option>
                  <option value="200+">200+ people</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Role
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="CEO, Developer, Designer, etc."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.teamSize || !formData.role}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  You&apos;re all set!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Let&apos;s create your workspace and get started
                </p>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Your Workspace Details:
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p><span className="font-medium">Name:</span> {formData.orgName}</p>
                    <p><span className="font-medium">Type:</span> {organizationTypes.find(t => t.id === formData.orgType)?.label}</p>
                    <p><span className="font-medium">Team Size:</span> {formData.teamSize}</p>
                    <p><span className="font-medium">Your Role:</span> {formData.role}</p>
                  </div>
                </div>

                <button
                  onClick={handleCreateOrganization}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Workspace...' : 'Create Workspace & Continue'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}