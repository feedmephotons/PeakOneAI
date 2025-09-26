'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/components/notifications/NotificationProvider'
import {
  ChevronRight, ChevronLeft, Check, Rocket, User, Bell,
  Palette, Shield, Zap, MessageSquare, FileText, Calendar,
  Video, CheckCircle, X, ArrowRight
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  component: React.ReactNode
}

export const OnboardingFlow: React.FC = () => {
  const router = useRouter()
  const { showNotification } = useNotifications()
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    role: '',
    teamSize: '',
    primaryUse: '',
    theme: 'system',
    notifications: {
      email: true,
      desktop: true,
      mobile: false
    },
    features: {
      lisa: false,
      tasks: false,
      files: false,
      video: false,
      calendar: false,
      messages: false
    }
  })

  useEffect(() => {
    // Check if onboarding was already completed
    const onboardingComplete = localStorage.getItem('onboardingComplete')
    if (onboardingComplete === 'true') {
      setIsComplete(true)
    }
  }, [])

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to SaasX!',
      description: 'Let\'s get you set up in just a few steps',
      icon: <Rocket className="w-6 h-6" />,
      component: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Rocket className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Your AI-Powered Workspace
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Combine messaging, video calls, AI assistance, project management, and cloud storage in one unified platform.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: <MessageSquare />, label: 'Lisa AI Assistant' },
              { icon: <FileText />, label: 'File Management' },
              { icon: <CheckCircle />, label: 'Task Tracking' },
              { icon: <Video />, label: 'Video Calls' },
              { icon: <Calendar />, label: 'Smart Calendar' },
              { icon: <Shield />, label: 'Enterprise Security' }
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-purple-600 dark:text-purple-400">
                  {feature.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'profile',
      title: 'Tell us about yourself',
      description: 'Help us personalize your experience',
      icon: <User className="w-6 h-6" />,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a role</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="manager">Manager</option>
                <option value="executive">Executive</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
                <option value="other">Other</option>
              </select>
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
                <option value="2-5">2-5 people</option>
                <option value="6-10">6-10 people</option>
                <option value="11-25">11-25 people</option>
                <option value="26-50">26-50 people</option>
                <option value="50+">50+ people</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Use Case
            </label>
            <textarea
              value={formData.primaryUse}
              onChange={(e) => setFormData({ ...formData, primaryUse: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Tell us how you plan to use SaasX..."
            />
          </div>
        </div>
      )
    },
    {
      id: 'preferences',
      title: 'Set your preferences',
      description: 'Customize your workspace',
      icon: <Palette className="w-6 h-6" />,
      component: (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Theme Preference
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {['light', 'dark', 'system'].map((theme) => (
                <button
                  key={theme}
                  onClick={() => setFormData({ ...formData, theme })}
                  className={`p-4 rounded-lg border-2 transition ${
                    formData.theme === theme
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="text-center">
                    {theme === 'light' && <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />}
                    {theme === 'dark' && <Moon className="w-8 h-8 mx-auto mb-2 text-indigo-500" />}
                    {theme === 'system' && <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-500" />}
                    <span className="text-sm font-medium capitalize">{theme}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Notification Settings
            </h4>
            <div className="space-y-3">
              {[
                { key: 'email', label: 'Email notifications', icon: <Mail className="w-4 h-4" /> },
                { key: 'desktop', label: 'Desktop notifications', icon: <Bell className="w-4 h-4" /> },
                { key: 'mobile', label: 'Mobile push notifications', icon: <Smartphone className="w-4 h-4" /> }
              ].map((setting) => (
                <label
                  key={setting.key}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <div className="flex items-center gap-3">
                    {setting.icon}
                    <span className="text-sm font-medium">{setting.label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifications[setting.key as keyof typeof formData.notifications]}
                    onChange={(e) => setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        [setting.key]: e.target.checked
                      }
                    })}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Choose your features',
      description: 'Select the tools you want to start with',
      icon: <Zap className="w-6 h-6" />,
      component: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select the features you'd like to explore first. You can always enable more later.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'lisa', label: 'Lisa AI Assistant', icon: <MessageSquare />, description: 'Your intelligent AI companion' },
              { key: 'tasks', label: 'Task Management', icon: <CheckCircle />, description: 'Track and manage your work' },
              { key: 'files', label: 'File Storage', icon: <FileText />, description: 'Secure cloud file management' },
              { key: 'video', label: 'Video Calls', icon: <Video />, description: 'HD video conferencing' },
              { key: 'calendar', label: 'Smart Calendar', icon: <Calendar />, description: 'Schedule and manage events' },
              { key: 'messages', label: 'Team Chat', icon: <MessageSquare />, description: 'Real-time team messaging' }
            ].map((feature) => (
              <label
                key={feature.key}
                className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                  formData.features[feature.key as keyof typeof formData.features]
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.features[feature.key as keyof typeof formData.features]}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: {
                      ...formData.features,
                      [feature.key]: e.target.checked
                    }
                  })}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div className="text-purple-600 dark:text-purple-400 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{feature.label}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{feature.description}</p>
                  </div>
                  {formData.features[feature.key as keyof typeof formData.features] && (
                    <Check className="w-5 h-5 text-purple-600 ml-auto" />
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    completeOnboarding()
  }

  const completeOnboarding = () => {
    // Save onboarding data
    localStorage.setItem('onboardingComplete', 'true')
    localStorage.setItem('userProfile', JSON.stringify(formData))

    showNotification({
      type: 'success',
      title: 'Welcome aboard!',
      message: 'Your workspace is ready. Let\'s get started!',
      duration: 5000
    })

    setIsComplete(true)
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }

  if (isComplete) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 z-50">
        <div className="text-center text-white">
          <Check className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">You're all set!</h2>
          <p className="text-lg opacity-90">Redirecting to your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-auto">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg" />
              <span className="font-bold text-xl">SaasX</span>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Skip setup
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-gray-100 dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-6 py-2">
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div
                    className={`flex-1 h-2 rounded-full transition-colors ${
                      index <= currentStep
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                  {index < steps.length - 1 && <div className="w-2" />}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white">
                {steps[currentStep].icon}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {steps[currentStep].description}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
              {steps[currentStep].component}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  currentStep === 0
                    ? 'invisible'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep === steps.length - 1 ? (
                  <ArrowRight className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboardingComplete')
    if (onboardingComplete !== 'true') {
      setShowOnboarding(true)
    }
  }, [])

  const resetOnboarding = () => {
    localStorage.removeItem('onboardingComplete')
    localStorage.removeItem('userProfile')
    setShowOnboarding(true)
  }

  return { showOnboarding, resetOnboarding }
}