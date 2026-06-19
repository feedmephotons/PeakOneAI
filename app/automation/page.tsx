'use client'

import { useState, useEffect } from 'react'
import {
  Zap, Plus, Search, Play, Pause, MoreVertical, Clock, CheckCircle,
  Mail, MessageSquare, Calendar, FileText, Users, Bot, ArrowRight,
  Settings, Trash2, Copy, X, AlertTriangle
} from 'lucide-react'

interface Automation {
  id: string
  name: string
  description: string
  trigger: {
    type: 'schedule' | 'message' | 'email' | 'task' | 'meeting' | 'file'
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
  { id: 'send_message', label: 'Send Message', icon: MessageSquare, description: 'Post in channel or DM' },
  { id: 'send_email', label: 'Send Email', icon: Mail, description: 'Email a recipient' },
  { id: 'create_task', label: 'Create Task', icon: CheckCircle, description: 'Create Kanban task' },
  { id: 'notify_team', label: 'Notify Team', icon: Users, description: 'Push notification' },
  { id: 'ai_action', label: 'AI Action', icon: Bot, description: 'Analyze content with AI' },
  { id: 'schedule_meeting', label: 'Schedule Meeting', icon: Calendar, description: 'Book calendar event' },
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
    trigger: { type: 'message', config: 'When user joins organization' },
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
    trigger: { type: 'meeting', config: 'When meeting ends' },
    actions: [
      { type: 'ai_action', description: 'Generate meeting summary' },
      { type: 'send_email', description: 'Email summary to participants' },
      { type: 'create_task', description: 'Create action items as tasks' }
    ],
    status: 'active',
    runsCount: 89,
    lastRun: new Date(Date.now() - 3600000),
    createdAt: new Date(Date.now() - 86400000 * 45)
  }
]

export default function AutomationPage() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Builder States
  const [isBuilding, setIsBuilding] = useState(false)
  const [builderName, setBuilderName] = useState('')
  const [builderDesc, setBuilderDesc] = useState('')
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null)
  const [triggerConfig, setTriggerConfig] = useState('')
  const [selectedActions, setSelectedActions] = useState<Array<{ type: string; description: string }>>([])
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('automations')
    if (saved) {
      try {
        setAutomations(JSON.parse(saved).map((a: any) => ({
          ...a,
          lastRun: a.lastRun ? new Date(a.lastRun) : undefined,
          createdAt: new Date(a.createdAt)
        })))
      } catch (e) {
        setAutomations(MOCK_AUTOMATIONS)
      }
    } else {
      setAutomations(MOCK_AUTOMATIONS)
      localStorage.setItem('automations', JSON.stringify(MOCK_AUTOMATIONS))
    }
  }, [])

  const saveToStorage = (list: Automation[]) => {
    setAutomations(list)
    localStorage.setItem('automations', JSON.stringify(list))
  }

  const toggleStatus = (id: string) => {
    const updated = automations.map(a =>
      a.id === id ? { ...a, status: (a.status === 'active' ? 'paused' : 'active') as 'active' | 'paused' } : a
    )
    saveToStorage(updated)
  }

  const filteredAutomations = automations.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || a.status === filter
    return matchesSearch && matchesFilter
  })

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

  // Builder Logic
  const handleAddTrigger = (typeId: string) => {
    setSelectedTrigger(typeId)
    setTriggerConfig(`When ${typeId} trigger occurs`)
    setValidationError(null)
  }

  const handleAddAction = (actionId: string) => {
    // Validation: check compatibility
    if (selectedTrigger === 'file' && actionId === 'schedule_meeting') {
      setValidationError('File Upload trigger cannot be directly connected to Schedule Meeting action.')
      return
    }

    const actionType = ACTION_TYPES.find(a => a.id === actionId)
    if (!actionType) return

    setSelectedActions([...selectedActions, {
      type: actionId,
      description: `${actionType.label} with parameters`
    }])
    setValidationError(null)
  }

  const handleRemoveAction = (index: number) => {
    setSelectedActions(selectedActions.filter((_, i) => i !== index))
  }

  const handleSaveAutomation = () => {
    if (!builderName.trim()) {
      setValidationError('Automation name is required.')
      return
    }
    if (!selectedTrigger) {
      setValidationError('A trigger block is required.')
      return
    }
    if (selectedActions.length === 0) {
      setValidationError('At least one action block is required.')
      return
    }

    // Secondary validation check for incompatible blocks
    if (selectedTrigger === 'file' && selectedActions.some(act => act.type === 'schedule_meeting')) {
      setValidationError('File Upload trigger cannot be directly connected to Schedule Meeting action.')
      return
    }

    const newAuto: Automation = {
      id: `auto-${Date.now()}`,
      name: builderName,
      description: builderDesc || `Custom automation triggered by ${selectedTrigger}`,
      trigger: {
        type: selectedTrigger as any,
        config: triggerConfig
      },
      actions: selectedActions,
      status: 'active',
      runsCount: 0,
      createdAt: new Date()
    }

    const updated = [newAuto, ...automations]
    saveToStorage(updated)

    // Reset and close
    setIsBuilding(false)
    setBuilderName('')
    setBuilderDesc('')
    setSelectedTrigger(null)
    setTriggerConfig('')
    setSelectedActions([])
    setValidationError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {isBuilding ? (
        <div className="w-full max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
          {/* Builder Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/20">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-600" />
                Automation Flow Builder
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Design and link triggers with one or more action nodes
              </p>
            </div>
            <button
              onClick={() => {
                setIsBuilding(false)
                setValidationError(null)
              }}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 p-6">
            {/* Left Column: Flow Details & Canvas */}
            <div className="lg:col-span-2 space-y-6">
              {/* Form details */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Automation Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sync Drive to Slack"
                    value={builderName}
                    onChange={(e) => setBuilderName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Short description of this workflow"
                    value={builderDesc}
                    onChange={(e) => setBuilderDesc(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Visual Workflow Canvas */}
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col items-center justify-center space-y-6 min-h-[300px]">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider self-start mb-2">
                  Workflow Flowchart
                </h3>

                {/* Trigger block node */}
                {selectedTrigger ? (
                  <div className="w-80 p-4 bg-purple-600 text-white rounded-xl shadow-md relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5" />
                      <div>
                        <div className="font-semibold text-sm capitalize">{selectedTrigger} Trigger</div>
                        <input
                          type="text"
                          value={triggerConfig}
                          onChange={(e) => setTriggerConfig(e.target.value)}
                          className="bg-purple-700 border-none text-xs text-purple-100 rounded px-1 mt-1 focus:outline-none focus:ring-1 focus:ring-purple-400 w-full"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTrigger(null)
                        setTriggerConfig('')
                      }}
                      className="p-1 hover:bg-purple-700 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-6 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 w-80 text-gray-400 dark:text-gray-500">
                    Select a trigger block from the sidebar
                  </div>
                )}

                {/* Arrow indicator */}
                <ArrowRight className="w-6 h-6 text-gray-400 rotate-90" />

                {/* Action blocks nodes */}
                {selectedActions.length > 0 ? (
                  <div className="space-y-4 w-full flex flex-col items-center">
                    {selectedActions.map((action, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        {idx > 0 && <ArrowRight className="w-4 h-4 text-gray-400 rotate-90 my-2" />}
                        <div className="w-80 p-4 bg-indigo-600 text-white rounded-xl shadow-md flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <Bot className="w-5 h-5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-sm capitalize truncate">{action.type.replace('_', ' ')}</div>
                              <input
                                type="text"
                                value={action.description}
                                onChange={(e) => {
                                  const updated = [...selectedActions]
                                  updated[idx].description = e.target.value
                                  setSelectedActions(updated)
                                }}
                                className="bg-indigo-700 border-none text-xs text-indigo-100 rounded px-1 mt-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 w-full"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveAction(idx)}
                            className="p-1 hover:bg-indigo-700 rounded ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 w-80 text-gray-400 dark:text-gray-500">
                    Add one or more actions from the sidebar
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Block Library */}
            <div className="space-y-6">
              {/* Trigger Library */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  1. Choose Trigger
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {TRIGGER_TYPES.map(trig => {
                    const IconComp = trig.icon
                    return (
                      <button
                        key={trig.id}
                        onClick={() => handleAddTrigger(trig.id)}
                        className={`flex items-start gap-3 p-3 rounded-lg border text-left transition ${
                          selectedTrigger === trig.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        <IconComp className="w-5 h-5 mt-0.5 text-purple-500" />
                        <div>
                          <div className="font-semibold text-xs">{trig.label}</div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{trig.description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Action Library */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  2. Add Actions
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {ACTION_TYPES.map(act => {
                    const IconComp = act.icon
                    return (
                      <button
                        key={act.id}
                        onClick={() => handleAddAction(act.id)}
                        disabled={!selectedTrigger}
                        className="flex items-start gap-3 p-3 rounded-lg border text-left transition border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <IconComp className="w-5 h-5 mt-0.5 text-indigo-500" />
                        <div>
                          <div className="font-semibold text-xs">{act.label}</div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{act.description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Validation & Save Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
            {validationError ? (
              <div className="flex items-center gap-2 text-red-600 text-sm font-semibold flex-1">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span id="automation-validation-message">{validationError}</span>
              </div>
            ) : (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex-1">
                Ensure all required nodes are connected and validated.
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsBuilding(false)
                  setValidationError(null)
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAutomation}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition"
              >
                Save Automation
              </button>
            </div>
          </div>
        </div>
      ) : (
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
            <button
              onClick={() => setIsBuilding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
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
            <div className="space-y-4" id="automations-list-container">
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
                          <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap capitalize">
                            {action.type.replace('_', ' ')}
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
      )}
    </div>
  )
}
