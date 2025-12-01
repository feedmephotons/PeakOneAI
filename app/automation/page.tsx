'use client'

import { useState } from 'react'
import {
  Zap, Plus, Search, Play, Pause, MoreVertical, Clock, CheckCircle,
  Mail, MessageSquare, Calendar, FileText, Users, Bot, ArrowRight,
  Settings, Trash2, Copy
} from 'lucide-react'

interface Automation {
  id: string
  name: string
  description: string
  trigger: {
    type: 'schedule' | 'event' | 'condition'
    config: string
  }
  actions: {
    type: string
    description: string
  }[]
  status: 'active' | 'paused' | 'draft'
  runsCount: number
  lastRun?: Date
  createdAt: Date
}

const TRIGGER_TYPES = [
  { id: 'schedule', label: 'On a Schedule', icon: Clock, description: 'Run at specific times' },
  { id: 'message', label: 'New Message', icon: MessageSquare, description: 'When a message is received' },
  { id: 'email', label: 'New Email', icon: Mail, description: 'When an email arrives' },
  { id: 'task', label: 'Task Update', icon: CheckCircle, description: 'When a task changes' },
  { id: 'meeting', label: 'Meeting Event', icon: Calendar, description: 'Before/after meetings' },
  { id: 'file', label: 'File Upload', icon: FileText, description: 'When files are added' },
]

const ACTION_TYPES = [
  { id: 'send_message', label: 'Send Message', icon: MessageSquare },
  { id: 'send_email', label: 'Send Email', icon: Mail },
  { id: 'create_task', label: 'Create Task', icon: CheckCircle },
  { id: 'notify_team', label: 'Notify Team', icon: Users },
  { id: 'ai_action', label: 'AI Action', icon: Bot },
  { id: 'schedule_meeting', label: 'Schedule Meeting', icon: Calendar },
]

const MOCK_AUTOMATIONS: Automation[] = [
  {
    id: '1',
    name: 'Daily Standup Reminder',
    description: 'Send reminder 10 minutes before daily standup',
    trigger: { type: 'schedule', config: 'Daily at 8:50 AM' },
    actions: [
      { type: 'send_message', description: 'Post reminder in #team channel' },
      { type: 'notify_team', description: 'Send push notifications' }
    ],
    status: 'active',
    runsCount: 45,
    lastRun: new Date(Date.now() - 3600000 * 24),
    createdAt: new Date(Date.now() - 86400000 * 30)
  },
  {
    id: '2',
    name: 'New Member Welcome',
    description: 'Welcome new team members automatically',
    trigger: { type: 'event', config: 'When user joins organization' },
    actions: [
      { type: 'send_message', description: 'Send welcome DM' },
      { type: 'create_task', description: 'Create onboarding checklist' },
      { type: 'notify_team', description: 'Announce in #general' }
    ],
    status: 'active',
    runsCount: 12,
    lastRun: new Date(Date.now() - 86400000 * 7),
    createdAt: new Date(Date.now() - 86400000 * 60)
  },
  {
    id: '3',
    name: 'Meeting Summary',
    description: 'Generate AI summary after video calls',
    trigger: { type: 'event', config: 'When meeting ends' },
    actions: [
      { type: 'ai_action', description: 'Generate meeting summary' },
      { type: 'send_email', description: 'Email summary to participants' },
      { type: 'create_task', description: 'Create action items as tasks' }
    ],
    status: 'active',
    runsCount: 89,
    lastRun: new Date(Date.now() - 3600000),
    createdAt: new Date(Date.now() - 86400000 * 45)
  },
  {
    id: '4',
    name: 'Weekly Report',
    description: 'Compile and send weekly activity report',
    trigger: { type: 'schedule', config: 'Every Friday at 5:00 PM' },
    actions: [
      { type: 'ai_action', description: 'Compile weekly metrics' },
      { type: 'send_email', description: 'Send to leadership' }
    ],
    status: 'paused',
    runsCount: 8,
    lastRun: new Date(Date.now() - 86400000 * 14),
    createdAt: new Date(Date.now() - 86400000 * 90)
  },
  {
    id: '5',
    name: 'Urgent Email Alert',
    description: 'Notify in Slack when urgent emails arrive',
    trigger: { type: 'condition', config: 'Email subject contains "URGENT"' },
    actions: [
      { type: 'send_message', description: 'Post in #alerts channel' },
      { type: 'notify_team', description: 'Send push notification' }
    ],
    status: 'active',
    runsCount: 23,
    lastRun: new Date(Date.now() - 86400000 * 2),
    createdAt: new Date(Date.now() - 86400000 * 15)
  },
]

export default function AutomationPage() {
  const [automations, setAutomations] = useState<Automation[]>(MOCK_AUTOMATIONS)
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAutomations = automations.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || a.status === filter
    return matchesSearch && matchesFilter
  })

  const toggleStatus = (id: string) => {
    setAutomations(automations.map(a =>
      a.id === id
        ? { ...a, status: a.status === 'active' ? 'paused' : 'active' }
        : a
    ))
  }

  const formatTime = (date?: Date) => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const stats = {
    total: automations.length,
    active: automations.filter(a => a.status === 'active').length,
    totalRuns: automations.reduce((sum, a) => sum + a.runsCount, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Automations
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Automate repetitive tasks and workflows
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition">
            <Plus className="w-4 h-4" />
            Create Automation
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Automations</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRuns}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Runs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search automations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'active', 'paused'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Automations List */}
        {filteredAutomations.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Zap className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No automations found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              Create your first automation to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAutomations.map(automation => (
              <div
                key={automation.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      automation.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Zap className={`w-6 h-6 ${
                        automation.status === 'active'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {automation.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {automation.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(automation.id)}
                      className={`p-2 rounded-lg transition ${
                        automation.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                      }`}
                    >
                      {automation.status === 'active' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Workflow visualization */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm text-purple-700 dark:text-purple-300 whitespace-nowrap">
                      {automation.trigger.config}
                    </span>
                  </div>
                  {automation.actions.map((action, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {action.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {automation.runsCount} runs
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Last run: {formatTime(automation.lastRun)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    automation.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
