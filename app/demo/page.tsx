'use client'

import { useRouter } from 'next/navigation'
import { Sparkles, MessageCircle, Upload, Shield, Activity, Zap, ArrowRight, Check } from 'lucide-react'

export default function DemoPage() {
  const router = useRouter()

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Lisa AI Chat',
      description: 'Have a real conversation with our AI assistant',
      href: '/lisa',
      badge: 'LIVE',
      badgeColor: 'bg-green-100 text-green-700',
      highlights: ['Real-time streaming', 'GPT-5 powered', 'Context aware']
    },
    {
      icon: <Upload className="w-6 h-6" />,
      title: 'Smart File Upload',
      description: 'Upload files and get instant AI analysis',
      href: '/files/upload',
      badge: 'WORKING',
      badgeColor: 'bg-blue-100 text-blue-700',
      highlights: ['Drag & drop', 'AI insights', 'Auto-tagging']
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Authentication',
      description: 'Secure login and registration system',
      href: '/auth/login',
      badge: 'READY',
      badgeColor: 'bg-purple-100 text-purple-700',
      highlights: ['Supabase Auth', 'Protected routes', 'Session management']
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: 'System Status',
      description: 'Check all integrations are working',
      href: '/test',
      badge: 'DIAGNOSTIC',
      badgeColor: 'bg-gray-100 text-gray-700',
      highlights: ['Database ✓', 'Storage ✓', 'AI ✓']
    }
  ]

  const stats = [
    { label: 'Database Tables', value: '20+', status: 'Ready' },
    { label: 'AI Model', value: 'GPT-5', status: 'Active' },
    { label: 'Storage Buckets', value: '3', status: 'Created' },
    { label: 'API Endpoints', value: '10+', status: 'Live' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              SaasX Platform Demo
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Experience the power of our AI-integrated platform. Everything below is functional and ready to test.
            </p>
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className="flex items-center text-green-600">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                All Systems Operational
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Lisa AI Online</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Real-time Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                {stat.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Live Features to Demo</h2>
        <div className="grid grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer group"
              onClick={() => router.push(feature.href)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                  {feature.icon}
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${feature.badgeColor}`}>
                  {feature.badge}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>

              <div className="space-y-2 mb-4">
                {feature.highlights.map((highlight, i) => (
                  <div key={i} className="flex items-center text-sm text-gray-500">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    {highlight}
                  </div>
                ))}
              </div>

              <div className="flex items-center text-violet-600 font-medium group-hover:translate-x-2 transition-transform">
                Try it now
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to See More?</h2>
          <p className="text-lg mb-6 text-violet-100">
            Start with Lisa AI Chat for the best first impression
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => router.push('/lisa')}
              className="px-8 py-3 bg-white text-violet-600 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              <Zap className="w-5 h-5 inline-block mr-2" />
              Chat with Lisa AI
            </button>
            <button
              onClick={() => router.push('/files/upload')}
              className="px-8 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors"
            >
              Try File Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Architecture Info */}
      <div className="max-w-7xl mx-auto px-8 py-8 mb-16">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Platform Architecture</h3>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Frontend</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Next.js 15.5.3</li>
                <li>• React 19</li>
                <li>• Tailwind CSS</li>
                <li>• Apple-inspired UI</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Backend</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Supabase (PostgreSQL)</li>
                <li>• Prisma ORM</li>
                <li>• Next.js API Routes</li>
                <li>• Real-time ready</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">AI & Storage</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• OpenAI GPT-5</li>
                <li>• Supabase Storage</li>
                <li>• File analysis</li>
                <li>• Streaming responses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}