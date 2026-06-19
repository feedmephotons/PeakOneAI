'use client'

import { useState, useEffect } from 'react'
import {
  PeakShell,
  GlassPanel,
  SectionLabel,
  StatTile,
  AskLisaBar,
} from '@/components/peak'
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
    <PeakShell>
      {isBuilding ? (
        <GlassPanel className="mx-auto w-full max-w-6xl overflow-hidden !p-0">
          {/* Builder Header */}
          <div className="flex items-center justify-between border-b border-peak-border bg-peak-primary/[0.06] p-6">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-peak">
                <Zap className="h-5 w-5 text-peak-primary-300" />
                Automation Flow Builder
              </h2>
              <p className="mt-1 text-xs text-peak-muted">
                Design and link triggers with one or more action nodes
              </p>
            </div>
            <button
              onClick={() => {
                setIsBuilding(false)
                setValidationError(null)
              }}
              className="rounded-lg p-2 transition hover:bg-white/[0.06]"
            >
              <X className="h-5 w-5 text-peak-muted" />
            </button>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-3">
            {/* Left Column: Flow Details & Canvas */}
            <div className="space-y-6 lg:col-span-2">
              {/* Form details */}
              <div className="space-y-4 rounded-xl border border-peak-border bg-white/[0.02] p-4">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-peak-muted">
                    Automation Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sync Drive to Slack"
                    value={builderName}
                    onChange={(e) => setBuilderName(e.target.value)}
                    className="w-full rounded-lg border border-peak-border bg-white/[0.04] px-4 py-2 text-peak placeholder:text-peak-dim focus:border-peak-primary/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-peak-muted">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Short description of this workflow"
                    value={builderDesc}
                    onChange={(e) => setBuilderDesc(e.target.value)}
                    className="w-full rounded-lg border border-peak-border bg-white/[0.04] px-4 py-2 text-peak placeholder:text-peak-dim focus:border-peak-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Visual Workflow Canvas */}
              <div className="flex min-h-[300px] flex-col items-center justify-center space-y-6 rounded-xl border-2 border-dashed border-peak-border bg-white/[0.015] p-8">
                <h3 className="mb-2 self-start text-xs font-medium uppercase tracking-wider text-peak-muted">
                  Workflow Flowchart
                </h3>

                {/* Trigger block node */}
                {selectedTrigger ? (
                  <div className="relative flex w-80 items-center justify-between rounded-xl bg-peak-primary p-4 text-white shadow-peak-glow">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5" />
                      <div>
                        <div className="text-sm font-semibold capitalize">{selectedTrigger} Trigger</div>
                        <input
                          type="text"
                          value={triggerConfig}
                          onChange={(e) => setTriggerConfig(e.target.value)}
                          className="mt-1 w-full rounded border-none bg-white/15 px-1 text-xs text-white/90 focus:outline-none focus:ring-1 focus:ring-white/40"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTrigger(null)
                        setTriggerConfig('')
                      }}
                      className="rounded p-1 hover:bg-white/15"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-80 rounded-xl border border-peak-border bg-white/[0.02] p-6 text-center text-peak-dim">
                    Select a trigger block from the sidebar
                  </div>
                )}

                {/* Arrow indicator */}
                <ArrowRight className="h-6 w-6 rotate-90 text-peak-dim" />

                {/* Action blocks nodes */}
                {selectedActions.length > 0 ? (
                  <div className="flex w-full flex-col items-center space-y-4">
                    {selectedActions.map((action, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        {idx > 0 && <ArrowRight className="my-2 h-4 w-4 rotate-90 text-peak-dim" />}
                        <div className="flex w-80 items-center justify-between rounded-xl border border-peak-primary/30 bg-peak-primary/15 p-4 shadow-peak">
                          <div className="flex min-w-0 items-center gap-3">
                            <Bot className="h-5 w-5 flex-shrink-0 text-peak-primary-300" />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold capitalize text-peak">{action.type.replace('_', ' ')}</div>
                              <input
                                type="text"
                                value={action.description}
                                onChange={(e) => {
                                  const updated = [...selectedActions]
                                  updated[idx].description = e.target.value
                                  setSelectedActions(updated)
                                }}
                                className="mt-1 w-full rounded border-none bg-white/[0.06] px-1 text-xs text-peak-muted focus:outline-none focus:ring-1 focus:ring-peak-primary/40"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveAction(idx)}
                            className="ml-2 rounded p-1 hover:bg-white/[0.08]"
                          >
                            <X className="h-4 w-4 text-peak-muted" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-80 rounded-xl border border-peak-border bg-white/[0.02] p-6 text-center text-peak-dim">
                    Add one or more actions from the sidebar
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Block Library */}
            <div className="space-y-6">
              {/* Trigger Library */}
              <div className="rounded-xl border border-peak-border bg-white/[0.02] p-4">
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-peak-muted">
                  1. Choose Trigger
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {TRIGGER_TYPES.map(trig => {
                    const IconComp = trig.icon
                    return (
                      <button
                        key={trig.id}
                        onClick={() => handleAddTrigger(trig.id)}
                        className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                          selectedTrigger === trig.id
                            ? 'border-peak-primary/50 bg-peak-primary/15 text-peak-primary-300'
                            : 'border-peak-border bg-white/[0.02] text-peak hover:bg-white/[0.04]'
                        }`}
                      >
                        <IconComp className="mt-0.5 h-5 w-5 text-peak-primary-300" />
                        <div>
                          <div className="text-xs font-semibold">{trig.label}</div>
                          <div className="mt-0.5 text-[10px] text-peak-muted">{trig.description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Action Library */}
              <div className="rounded-xl border border-peak-border bg-white/[0.02] p-4">
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-peak-muted">
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
                        className="flex items-start gap-3 rounded-lg border border-peak-border bg-white/[0.02] p-3 text-left text-peak transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <IconComp className="mt-0.5 h-5 w-5 text-peak-primary-300" />
                        <div>
                          <div className="text-xs font-semibold">{act.label}</div>
                          <div className="mt-0.5 text-[10px] text-peak-muted">{act.description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Validation & Save Footer */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-peak-border bg-white/[0.02] p-6 md:flex-row">
            {validationError ? (
              <div className="flex flex-1 items-center gap-2 text-sm font-semibold text-peak-red">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span id="automation-validation-message">{validationError}</span>
              </div>
            ) : (
              <div className="flex-1 text-xs text-peak-muted">
                Ensure all required nodes are connected and validated.
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsBuilding(false)
                  setValidationError(null)
                }}
                className="rounded-lg border border-peak-border px-4 py-2 text-peak-muted transition hover:bg-white/[0.04] hover:text-peak"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAutomation}
                className="rounded-lg bg-peak-primary px-6 py-2 font-semibold text-white shadow-peak-glow transition-colors hover:bg-peak-primary-600"
              >
                Save Automation
              </button>
            </div>
          </div>
        </GlassPanel>
      ) : (
        <div className="w-full">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-peak-muted">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-peak-primary/15 text-peak-primary-300">
                  <Zap className="h-3 w-3" />
                </span>
                Automations
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-peak md:text-4xl">
                Automations
              </h1>
              <p className="mt-2 text-sm text-peak-muted">
                Automate repetitive tasks and workflows
              </p>
            </div>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <div className="hidden w-64 lg:block">
                <AskLisaBar placeholder="Ask Lisa about an automation…" />
              </div>
              <button
                onClick={() => setIsBuilding(true)}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-peak-primary px-4 py-2.5 text-sm font-semibold text-white shadow-peak-glow transition-colors hover:bg-peak-primary-600"
              >
                <Plus className="h-4 w-4" />
                Create Automation
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatTile
              variant="tile"
              tone="primary"
              icon={<Zap className="h-5 w-5" />}
              value={stats.total}
              label="Total Automations"
            />
            <StatTile
              variant="tile"
              tone="green"
              icon={<Play className="h-5 w-5" />}
              value={stats.active}
              label="Active"
            />
            <StatTile
              variant="tile"
              tone="blue"
              icon={<CheckCircle className="h-5 w-5" />}
              value={stats.totalRuns}
              label="Total Runs"
            />
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-peak-dim" />
              <input
                type="text"
                placeholder="Search automations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-peak-border bg-white/[0.04] py-3 pl-12 pr-4 text-peak placeholder:text-peak-dim focus:border-peak-primary/50 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-peak-border bg-white/[0.02] p-1">
              {(['all', 'active', 'paused'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === f
                      ? 'bg-peak-primary/20 text-peak-primary-300'
                      : 'text-peak-muted hover:text-peak'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Automations List */}
          {filteredAutomations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-peak-border bg-white/[0.015] py-16 text-center">
              <Zap className="mx-auto mb-4 h-16 w-16 text-peak-dim" />
              <p className="text-lg font-medium text-peak-muted">No automations found</p>
              <p className="mt-2 text-sm text-peak-dim">
                Create your first automation to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4" id="automations-list-container">
              {filteredAutomations.map(automation => (
                <GlassPanel
                  key={automation.id}
                  className="peak-glass-hover transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${
                        automation.status === 'active'
                          ? 'bg-peak-green/15 ring-peak-green/20'
                          : 'bg-white/[0.04] ring-white/10'
                      }`}>
                        <Zap className={`h-6 w-6 ${
                          automation.status === 'active'
                            ? 'text-peak-green'
                            : 'text-peak-dim'
                        }`} />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-peak">
                          {automation.name}
                        </h3>
                        <p className="text-sm text-peak-muted">
                          {automation.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(automation.id)}
                        className={`rounded-lg p-2 transition ring-1 ${
                          automation.status === 'active'
                            ? 'bg-peak-green/15 text-peak-green ring-peak-green/20'
                            : 'bg-white/[0.04] text-peak-dim ring-white/10'
                        }`}
                      >
                        {automation.status === 'active' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      <button className="rounded-lg p-2 transition hover:bg-white/[0.04]">
                        <Settings className="h-4 w-4 text-peak-dim" />
                      </button>
                      <button className="rounded-lg p-2 transition hover:bg-white/[0.04]">
                        <MoreVertical className="h-4 w-4 text-peak-dim" />
                      </button>
                    </div>
                  </div>

                  {/* Workflow visualization */}
                  <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
                    <div className="flex items-center gap-2 rounded-lg border border-peak-primary/30 bg-peak-primary/15 px-3 py-2">
                      <Clock className="h-4 w-4 text-peak-primary-300" />
                      <span className="whitespace-nowrap text-sm text-peak-primary-300">
                        {automation.trigger.config}
                      </span>
                    </div>
                    {automation.actions.map((action, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-peak-dim" />
                        <div className="flex items-center gap-2 rounded-lg border border-peak-border bg-white/[0.03] px-3 py-2">
                          <span className="whitespace-nowrap text-sm capitalize text-peak-muted">
                            {action.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-peak-muted">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {automation.runsCount} runs
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Last run: {formatTime(automation.lastRun)}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
                      automation.status === 'active'
                        ? 'bg-peak-green/12 text-peak-green ring-peak-green/25'
                        : 'bg-white/[0.04] text-peak-muted ring-white/10'
                    }`}>
                      {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                    </span>
                  </div>
                </GlassPanel>
              ))}
            </div>
          )}
        </div>
      )}
    </PeakShell>
  )
}
