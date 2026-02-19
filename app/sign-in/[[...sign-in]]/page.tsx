'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, Users, ArrowLeft } from 'lucide-react'

// Demo accounts for testing (hidden by default)
const demoAccounts = {
  admin: { email: 'admin@peakone.ai', password: 'Demo123!', label: 'Site Admin', name: 'Sarah Chen' },
  acme: [
    { email: 'john.smith@example.com', password: 'Demo123!', label: 'Owner', name: 'John Smith' },
    { email: 'emily.davis@example.com', password: 'Demo123!', label: 'Manager', name: 'Emily Davis' },
    { email: 'michael.wong@example.com', password: 'Demo123!', label: 'Developer', name: 'Michael Wong' },
    { email: 'lisa.patel@example.com', password: 'Demo123!', label: 'Designer', name: 'Lisa Patel' },
    { email: 'david.jones@example.com', password: 'Demo123!', label: 'Sales', name: 'David Jones' },
  ],
  techstart: [
    { email: 'alex.rivera@techstart.io', password: 'Demo123!', label: 'CEO', name: 'Alex Rivera' },
    { email: 'jessica.kim@techstart.io', password: 'Demo123!', label: 'CTO', name: 'Jessica Kim' },
    { email: 'ryan.thompson@techstart.io', password: 'Demo123!', label: 'Engineer', name: 'Ryan Thompson' },
    { email: 'maria.garcia@techstart.io', password: 'Demo123!', label: 'Product', name: 'Maria Garcia' },
    { email: 'kevin.lee@techstart.io', password: 'Demo123!', label: 'Marketing', name: 'Kevin Lee' },
  ],
  individual: { email: 'freelancer@gmail.com', password: 'Demo123!', label: 'Freelancer', name: 'Chris Taylor' },
}

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || '/files'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDemoPanel, setShowDemoPanel] = useState(false)
  const [demoClickCount, setDemoClickCount] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      router.push(redirectUrl)
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      router.push(redirectUrl)
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  // Triple-click on logo to show demo panel
  const handleLogoClick = () => {
    const newCount = demoClickCount + 1
    setDemoClickCount(newCount)
    if (newCount >= 3) {
      setShowDemoPanel(!showDemoPanel)
      setDemoClickCount(0)
    }
    // Reset count after 1 second
    setTimeout(() => setDemoClickCount(0), 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to home</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="flex items-center justify-center gap-2 mb-4 cursor-pointer select-none"
            onClick={handleLogoClick}
          >
            <Image
              src="/peakone-logo.png"
              alt="Peak One"
              width={48}
              height={48}
              className="w-12 h-12"
            />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Peak One</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to access your workspace
          </p>
        </div>

        {/* Demo Panel (hidden by default) */}
        {showDemoPanel && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Demo Accounts</span>
            </div>

            {/* Admin */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Platform Admin</p>
              <button
                onClick={() => handleDemoLogin(demoAccounts.admin.email, demoAccounts.admin.password)}
                className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-gray-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors border border-gray-200 dark:border-gray-700"
              >
                <span className="font-medium">{demoAccounts.admin.name}</span>
                <span className="text-gray-500 ml-2">({demoAccounts.admin.label})</span>
              </button>
            </div>

            {/* Acme Corp */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Acme Corporation</p>
              <div className="grid grid-cols-2 gap-1">
                {demoAccounts.acme.map((user) => (
                  <button
                    key={user.email}
                    onClick={() => handleDemoLogin(user.email, user.password)}
                    className="text-left px-2 py-1.5 text-xs bg-white dark:bg-gray-800 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <span className="font-medium block truncate">{user.name}</span>
                    <span className="text-gray-400">{user.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TechStart */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">TechStart Inc</p>
              <div className="grid grid-cols-2 gap-1">
                {demoAccounts.techstart.map((user) => (
                  <button
                    key={user.email}
                    onClick={() => handleDemoLogin(user.email, user.password)}
                    className="text-left px-2 py-1.5 text-xs bg-white dark:bg-gray-800 rounded hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <span className="font-medium block truncate">{user.name}</span>
                    <span className="text-gray-400">{user.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Individual */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Individual Account</p>
              <button
                onClick={() => handleDemoLogin(demoAccounts.individual.email, demoAccounts.individual.password)}
                className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-gray-800 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors border border-gray-200 dark:border-gray-700"
              >
                <span className="font-medium">{demoAccounts.individual.name}</span>
                <span className="text-gray-500 ml-2">({demoAccounts.individual.label})</span>
              </button>
            </div>
          </div>
        )}

        {/* Sign In Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
