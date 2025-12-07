'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Sparkles,
  Video,
  MessageSquare,
  FolderOpen,
  Calendar,
  CheckSquare,
  Shield,
  Zap,
  Users,
  ArrowRight,
  Play,
  Star,
  ChevronRight,
  Globe,
  Lock,
  Cpu,
  BarChart3,
  Check,
  Bell,
  Search,
  MoreHorizontal,
  Phone,
  FileText,
  Bot,
} from 'lucide-react'
import Image from 'next/image'

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Assistant',
    description: 'Lisa, your intelligent AI assistant, helps with scheduling, summaries, and smart suggestions.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Video,
    title: 'HD Video Conferencing',
    description: 'Crystal-clear video calls with AI transcription, action items, and meeting summaries.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: MessageSquare,
    title: 'Team Messaging',
    description: 'Real-time chat with channels, threads, and seamless file sharing.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: FolderOpen,
    title: 'Smart File Storage',
    description: 'AI-organized cloud storage with automatic tagging and intelligent search.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: Calendar,
    title: 'Unified Calendar',
    description: 'Schedule meetings, set reminders, and sync across all your devices.',
    color: 'from-red-500 to-rose-500',
  },
  {
    icon: CheckSquare,
    title: 'Task Management',
    description: 'Kanban boards, project tracking, and AI-suggested task priorities.',
    color: 'from-indigo-500 to-violet-500',
  },
]

const stats = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '50M+', label: 'Messages Sent' },
  { value: '10K+', label: 'Teams Active' },
  { value: '4.9/5', label: 'User Rating' },
]

const testimonials = [
  {
    quote: "PeakOne AI transformed how our team collaborates. The AI assistant alone saved us 10 hours a week.",
    author: 'Sarah Chen',
    role: 'CTO, TechStart Inc',
    avatar: 'SC',
  },
  {
    quote: "Finally, one platform that does it all. No more juggling between Slack, Zoom, and Notion.",
    author: 'Michael Rodriguez',
    role: 'Product Lead, Acme Corp',
    avatar: 'MR',
  },
  {
    quote: "The AI meeting summaries are incredible. I never miss action items anymore.",
    author: 'Emily Watson',
    role: 'Operations Director, GlobalTech',
    avatar: 'EW',
  },
]

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'Perfect for individuals and small teams getting started',
    features: [
      'Up to 5 team members',
      '10GB cloud storage',
      'Basic AI assistant',
      'Video calls up to 40 min',
      'Email support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$12',
    period: '/user/month',
    description: 'For growing teams that need more power and features',
    features: [
      'Unlimited team members',
      '100GB cloud storage',
      'Advanced AI with custom training',
      'Unlimited video calls',
      'Meeting transcription & summaries',
      'Priority support',
      'Custom integrations',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with advanced security needs',
    features: [
      'Everything in Professional',
      'Unlimited storage',
      'SSO & SAML',
      'Advanced admin controls',
      'Dedicated account manager',
      '99.99% uptime SLA',
      'On-premise deployment option',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/peakone-logo.svg"
                alt="PeakOne AI"
                width={180}
                height={24}
                className="h-6 w-auto"
                priority
              />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Testimonials
              </a>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute top-40 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-60 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Powered by Google Gemini 2.5
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-gray-900 dark:text-white">Your Team&apos;s</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI-Powered Hub
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Messaging, video, files, tasks, and calendar — unified with AI that actually understands your work.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/sign-up"
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <Play className="w-5 h-5 text-purple-600" />
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2">4.9/5 from 2,000+ reviews</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-300 dark:bg-gray-700" />
              <span>Trusted by 10,000+ teams worldwide</span>
            </div>
          </div>

          {/* Hero Image/Preview - Dashboard Mockup */}
          <div className="relative mt-16 max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              {/* Dashboard Mockup */}
              <div className="aspect-[16/10]">
                {/* Top Bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/peakone-logo.svg"
                      alt="PeakOne AI"
                      width={120}
                      height={16}
                      className="h-4 w-auto"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-64 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center px-3 gap-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Search anything...</span>
                    </div>
                    <button className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Bell className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex h-[calc(100%-52px)]">
                  {/* Sidebar */}
                  <div className="w-16 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 py-4 flex flex-col items-center gap-3">
                    {[
                      { icon: MessageSquare, active: true },
                      { icon: Video, active: false },
                      { icon: Phone, active: false },
                      { icon: Calendar, active: false },
                      { icon: CheckSquare, active: false },
                      { icon: FolderOpen, active: false },
                    ].map((item, i) => (
                      <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.active ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        <item.icon className={`w-5 h-5 ${item.active ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                    ))}
                  </div>

                  {/* Chat List */}
                  <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">Messages</span>
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </div>
                    {[
                      { name: 'Product Team', msg: 'Lisa: Sprint review ready', time: '2m', unread: true },
                      { name: 'Sarah Chen', msg: 'Sent you the designs', time: '15m', unread: true },
                      { name: 'Engineering', msg: 'Build passed', time: '1h', unread: false },
                      { name: 'Marketing', msg: 'Campaign launched!', time: '3h', unread: false },
                    ].map((chat, i) => (
                      <div key={i} className={`p-2 rounded-xl mb-1 ${i === 0 ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">{chat.name}</span>
                          <span className="text-xs text-gray-400">{chat.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 truncate pr-2">{chat.msg}</span>
                          {chat.unread && <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Main Chat Area */}
                  <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">PT</div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">Product Team</p>
                          <p className="text-xs text-green-500">Online</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Video className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Phone className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 space-y-3 overflow-hidden">
                      <div className="flex gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">SC</div>
                        <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-3 py-2 max-w-xs">
                          <p className="text-sm text-gray-900 dark:text-white">Hey team, designs are ready for review!</p>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl rounded-tr-sm px-3 py-2 max-w-xs">
                          <p className="text-sm text-white">Looks great! Lisa, can you summarize?</p>
                        </div>
                      </div>
                      {/* AI Response */}
                      <div className="flex gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-100 dark:border-purple-800 rounded-2xl rounded-tl-sm px-3 py-2 max-w-sm">
                          <p className="text-sm text-gray-900 dark:text-white">Here&apos;s a summary of the designs:</p>
                          <ul className="text-xs text-gray-600 dark:text-gray-300 mt-1 space-y-0.5">
                            <li>• New dashboard layout</li>
                            <li>• Updated color scheme</li>
                            <li>• 3 action items identified</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <span className="text-sm text-gray-400">Type a message...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -left-8 top-1/4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 hidden lg:block animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">New Message</p>
                  <p className="text-xs text-gray-500">Lisa: Meeting notes ready!</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-8 top-1/3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 hidden lg:block animate-float delay-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">AI Summary</p>
                  <p className="text-xs text-gray-500">3 action items detected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything you need,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                one platform
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Stop paying for multiple tools. PeakOne AI brings all your team&apos;s essentials together with AI that makes everything smarter.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Highlight Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Advanced AI Technology</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Meet Lisa, your AI assistant that actually{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  gets work done
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Powered by Google Gemini 2.5, Lisa understands context, remembers preferences, and helps your team work faster than ever.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Automatic meeting transcription & summaries',
                  'Smart task prioritization & deadlines',
                  'Intelligent file organization & search',
                  'Context-aware chat suggestions',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-200">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Try Lisa Free
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl border border-white/10 p-6 overflow-hidden">
                {/* AI Chat Preview */}
                <div className="bg-gray-900/80 backdrop-blur rounded-2xl p-4 space-y-4">
                  {/* AI Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Lisa AI</p>
                      <p className="text-xs text-green-400">Active</p>
                    </div>
                  </div>
                  {/* Chat Messages */}
                  <div className="space-y-3">
                    <div className="flex gap-2 justify-end">
                      <div className="bg-white/10 rounded-2xl rounded-tr-sm px-4 py-2 max-w-xs">
                        <p className="text-sm text-white">Summarize today&apos;s meeting notes</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gradient-to-br from-purple-600/50 to-pink-600/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
                        <p className="text-sm text-white mb-2">Here&apos;s your meeting summary:</p>
                        <ul className="text-xs text-white/80 space-y-1">
                          <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> Q4 targets approved</li>
                          <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> New hire starting Monday</li>
                          <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> Product launch moved to Dec 15</li>
                        </ul>
                        <p className="text-xs text-purple-300 mt-3">3 action items created automatically</p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <div className="bg-white/10 rounded-2xl rounded-tr-sm px-4 py-2 max-w-xs">
                        <p className="text-sm text-white">Create tasks for the action items</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gradient-to-br from-purple-600/50 to-pink-600/50 rounded-2xl rounded-tl-sm px-4 py-2">
                        <p className="text-sm text-white">Done! I&apos;ve created 3 tasks and assigned them to the relevant team members.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Loved by teams{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                everywhere
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what teams are saying about their experience with PeakOne AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Simple,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                transparent pricing
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-3xl border ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-transparent text-white shadow-2xl shadow-purple-500/30 scale-105'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-sm font-bold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.highlighted ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}>
                    {plan.period}
                  </span>
                </div>
                <p className={`mb-6 ${plan.highlighted ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className={`flex items-center gap-3 ${plan.highlighted ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? 'text-white' : 'text-green-500'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`block w-full py-3 text-center font-semibold rounded-xl transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-white text-purple-600 hover:shadow-lg hover:scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Enterprise-grade{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                security
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your data is protected with industry-leading security measures.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'SOC 2 Compliant', desc: 'Audited security controls and processes' },
              { icon: Lock, title: 'End-to-End Encryption', desc: 'All data encrypted at rest and in transit' },
              { icon: Globe, title: 'GDPR Ready', desc: 'Full compliance with data protection regulations' },
            ].map((item, i) => (
              <div key={i} className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to transform how your team works?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
            Join 10,000+ teams already using PeakOne AI to collaborate smarter.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/sign-in"
              className="px-8 py-4 text-gray-600 dark:text-gray-300 font-semibold hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign in to existing account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-900 dark:bg-gray-950 text-gray-400">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center mb-6">
                <Image
                  src="/peakone-logo.svg"
                  alt="PeakOne AI"
                  width={160}
                  height={22}
                  className="h-5 w-auto brightness-0 invert"
                />
              </Link>
              <p className="text-gray-500 leading-relaxed">
                The AI-powered workspace for modern teams. Communicate, collaborate, and create together.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500">&copy; 2025 PeakOne AI. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  )
}
