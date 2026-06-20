'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  FileText, Plus, Search, Copy, MoreVertical, Star, Clock,
  Mail, MessageSquare, CheckSquare, FileCode, Presentation, Table, X, Check, Trash2, Edit3
} from 'lucide-react'
import { FIXED_TODAY, MOCK_USER, MOCK_TEAM } from '@/lib/peak/mock'

interface Template {
  id: string
  name: string
  description: string
  category: 'document' | 'email' | 'message' | 'task' | 'code' | 'presentation' | 'spreadsheet'
  content: string
  starred: boolean
  usageCount: number
  lastUsed?: string
  createdBy: string
}

const CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: FileText },
  { id: 'document', label: 'Documents', icon: FileText },
  { id: 'email', label: 'Emails', icon: Mail },
  { id: 'message', label: 'Messages', icon: MessageSquare },
  { id: 'task', label: 'Tasks', icon: CheckSquare },
  { id: 'code', label: 'Code', icon: FileCode },
  { id: 'presentation', label: 'Presentations', icon: Presentation },
  { id: 'spreadsheet', label: 'Spreadsheets', icon: Table },
] as const

const STORAGE_KEY = 'peak.templates.v1'

// Deterministic dates derived from FIXED_TODAY (SSR-safe).
function daysBefore(days: number): string {
  return new Date(new Date(FIXED_TODAY).getTime() - days * 86400000).toISOString()
}

// Author names mapped to the canonical Acme Corp team.
const SARAH = MOCK_USER.name // Sarah Chen
const MIKE = MOCK_TEAM[1]?.name || 'Mike Wilson'
const LISA = MOCK_TEAM[2]?.name || 'Lisa Park'
const DAVID = MOCK_TEAM[3]?.name || 'David Kim'

// Where "Use Template" routes after copying — per category destination.
const DESTINATION: Record<Template['category'], { href: string; label: string }> = {
  document: { href: '/files', label: 'Open Files' },
  email: { href: '/email', label: 'Open Email' },
  message: { href: '/messages', label: 'Open Messages' },
  task: { href: '/tasks', label: 'Open Tasks' },
  code: { href: '/files', label: 'Open Files' },
  presentation: { href: '/files', label: 'Open Files' },
  spreadsheet: { href: '/files', label: 'Open Files' },
}

const SEED_TEMPLATES: Template[] = [
  {
    id: 'tmpl-weekly-status',
    name: 'Weekly Status Report',
    description: 'Standard weekly progress update across active missions',
    category: 'document',
    content: `# Weekly Status — Week of {{date}}

**Prepared by:** ${SARAH}

## Launch Product X (On Track — 72%)
- Highlights:
- Blockers:
- Next steps:

## Q2 Growth Engine (At Risk — 48%)
- Highlights:
- Blockers:
- Next steps:

## Platform Reliability (88%)
- Highlights:
- Blockers:

## Asks for leadership
- `,
    starred: true,
    usageCount: 45,
    lastUsed: daysBefore(1),
    createdBy: SARAH,
  },
  {
    id: 'tmpl-meeting-notes',
    name: 'Meeting Notes',
    description: 'Structured meeting notes with decisions and action items',
    category: 'document',
    content: `# {{meeting title}} — {{date}}

**Attendees:** ${SARAH}, ${MIKE}, ${LISA}
**Mission:** Launch Product X

## Agenda
1.

## Decisions
-

## Action Items
- [ ] Owner — task — due

## Follow-ups
- `,
    starred: true,
    usageCount: 128,
    lastUsed: daysBefore(0),
    createdBy: SARAH,
  },
  {
    id: 'tmpl-investor-update',
    name: 'Investor Update',
    description: 'Monthly update for Summit Ventures (Brian Miller)',
    category: 'email',
    content: `Subject: Acme Corp — Monthly Update ({{month}})

Hi Brian,

Quick update on where things stand at Acme Corp this month.

**Highlights**
- Launch Product X is on track at 72% to GA.
- Q2 Growth Engine is at 48% — flagging a pipeline risk we're actively working.

**Metrics**
- Revenue impact:
- Customer impact:

**Asks**
-

Always happy to jump on a call.

Best,
${SARAH}
Founder & CEO, Acme Corp`,
    starred: true,
    usageCount: 18,
    lastUsed: daysBefore(2),
    createdBy: SARAH,
  },
  {
    id: 'tmpl-client-followup',
    name: 'Partner Follow-up',
    description: 'Follow-up email after a partnership meeting (BrightPath)',
    category: 'email',
    content: `Subject: Great connecting — next steps

Hi Jenna,

Thanks for the time today. As discussed, here are the next steps on the BrightPath partnership:

1.
2.

I'll send over the MOU draft by {{date}}. Let me know if anything looks off.

Best,
${SARAH}`,
    starred: false,
    usageCount: 34,
    lastUsed: daysBefore(4),
    createdBy: SARAH,
  },
  {
    id: 'tmpl-standup',
    name: 'Daily Standup',
    description: 'Brief async standup update for the team channel',
    category: 'message',
    content: `*Standup — {{date}}*
:white_check_mark: Yesterday:
:dart: Today:
:warning: Blockers:
Mission: Launch Product X`,
    starred: false,
    usageCount: 234,
    lastUsed: daysBefore(0),
    createdBy: MIKE,
  },
  {
    id: 'tmpl-bug-report',
    name: 'Bug Report',
    description: 'Standardized bug report for engineering triage',
    category: 'task',
    content: `**Title:**

**Severity:** (P0 / P1 / P2)
**Mission:** Platform Reliability
**Assignee:** ${DAVID}

**Steps to reproduce**
1.

**Expected**

**Actual**

**Environment / logs**
`,
    starred: false,
    usageCount: 89,
    lastUsed: daysBefore(1),
    createdBy: DAVID,
  },
  {
    id: 'tmpl-feature-request',
    name: 'Feature Request',
    description: 'Feature request with problem, proposal, and success metric',
    category: 'task',
    content: `**Feature:**

**Problem / who's affected:**

**Proposal:**

**Mission:** Q2 Growth Engine
**Owner:** ${LISA}

**Success metric:**
`,
    starred: false,
    usageCount: 56,
    createdBy: LISA,
  },
  {
    id: 'tmpl-api-endpoint',
    name: 'API Endpoint',
    description: 'RESTful API endpoint boilerplate (Next.js route handler)',
    category: 'code',
    content: `import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // TODO: implement
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  // TODO: validate + persist
  return NextResponse.json({ ok: true }, { status: 201 })
}`,
    starred: true,
    usageCount: 42,
    createdBy: DAVID,
  },
  {
    id: 'tmpl-react-component',
    name: 'React Component',
    description: 'React functional component with TypeScript props',
    category: 'code',
    content: `'use client'

interface Props {
  title: string
}

export function Component({ title }: Props) {
  return <div className="rounded-xl border p-4">{title}</div>
}`,
    starred: false,
    usageCount: 78,
    createdBy: DAVID,
  },
  {
    id: 'tmpl-sprint-review',
    name: 'Sprint Review',
    description: 'Sprint review deck outline for Launch Product X',
    category: 'presentation',
    content: `Slide 1 — Sprint goal
Slide 2 — What shipped
Slide 3 — Demo: Product X beta
Slide 4 — Metrics vs target
Slide 5 — Risks & blockers
Slide 6 — Next sprint commitments`,
    starred: false,
    usageCount: 15,
    createdBy: MIKE,
  },
  {
    id: 'tmpl-budget-tracker',
    name: 'Budget Tracker',
    description: 'Monthly mission budget tracking sheet',
    category: 'spreadsheet',
    content: `Mission, Budget Total, Budget Used, % Used, Owner
Launch Product X, , , , ${SARAH}
Q2 Growth Engine, , , , ${SARAH}
Platform Reliability, , , , ${DAVID}`,
    starred: false,
    usageCount: 19,
    createdBy: SARAH,
  },
  {
    id: 'tmpl-quick-update',
    name: 'Quick Update',
    description: 'Brief one-line status update message',
    category: 'message',
    content: `Quick update: {{what changed}} — {{impact}}. Next: {{next step}}.`,
    starred: false,
    usageCount: 234,
    lastUsed: daysBefore(0),
    createdBy: SARAH,
  },
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(SEED_TEMPLATES)
  const [category, setCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [useModal, setUseModal] = useState<Template | null>(null)
  const [copied, setCopied] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Template | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Hydrate from localStorage (seed on first visit).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) setTemplates(parsed)
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TEMPLATES))
      }
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [])

  // Persist whenever templates change (after hydration).
  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
    } catch {
      /* ignore */
    }
  }, [templates, hydrated])

  // Close the "..." menu on outside click.
  useEffect(() => {
    if (!menuOpenId) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpenId(null)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpenId])

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = category === 'all' || t.category === category
    return matchesSearch && matchesCategory
  })

  const toggleStar = (id: string) => {
    setTemplates(prev => prev.map(t => (t.id === id ? { ...t, starred: !t.starred } : t)))
  }

  // "Use Template": bump usage, open a preview/copy modal. Copy is a real action;
  // the modal also deep-links to the relevant section to apply the content.
  const openUseModal = (template: Template) => {
    setCopied(false)
    setTemplates(prev =>
      prev.map(t =>
        t.id === template.id
          ? { ...t, usageCount: t.usageCount + 1, lastUsed: FIXED_TODAY }
          : t,
      ),
    )
    setUseModal({ ...template, usageCount: template.usageCount + 1, lastUsed: FIXED_TODAY })
  }

  const copyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const duplicateTemplate = (template: Template) => {
    const copy: Template = {
      ...template,
      id: `tmpl-${Date.now()}`,
      name: `${template.name} (Copy)`,
      usageCount: 0,
      lastUsed: undefined,
      starred: false,
      createdBy: MOCK_USER.name,
    }
    setTemplates(prev => [copy, ...prev])
    setMenuOpenId(null)
  }

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id))
    setMenuOpenId(null)
  }

  const getCategoryIcon = (cat: Template['category']) => {
    const icons = {
      document: FileText,
      email: Mail,
      message: MessageSquare,
      task: CheckSquare,
      code: FileCode,
      presentation: Presentation,
      spreadsheet: Table,
    }
    return icons[cat] || FileText
  }

  const getCategoryColor = (cat: Template['category']) => {
    const colors = {
      document: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      email: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      message: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      task: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
      code: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30',
      presentation: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
      spreadsheet: 'text-teal-500 bg-teal-100 dark:bg-teal-900/30',
    }
    return colors[cat] || 'text-gray-500 bg-gray-100'
  }

  const formatTime = (iso?: string) => {
    if (!iso) return 'Never'
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return 'Never'
    const diff = new Date(FIXED_TODAY).getTime() - date.getTime()
    const days = Math.round(diff / 86400000)
    if (days <= 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Templates
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Reusable templates for documents, messages, and more
            </p>
          </div>
          <button
            onClick={() => { setEditing(null); setCreateOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
              <div className="space-y-1">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon
                  const count = cat.id === 'all'
                    ? templates.length
                    : templates.filter(t => t.category === cat.id).length

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                        category === cat.id
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{cat.label}</span>
                      </div>
                      <span className="text-xs text-gray-400">{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No templates found</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Try adjusting your search or category filter
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map(template => {
                  const Icon = getCategoryIcon(template.category)
                  const colorClass = getCategoryColor(template.category)

                  return (
                    <div
                      key={template.id}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition group relative"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleStar(template.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            aria-label={template.starred ? 'Unstar template' : 'Star template'}
                          >
                            <Star className={`w-4 h-4 ${template.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setMenuOpenId(menuOpenId === template.id ? null : template.id)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              aria-label="Template options"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                            {menuOpenId === template.id && (
                              <div
                                ref={menuRef}
                                className="absolute right-0 top-8 z-10 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1"
                              >
                                <button
                                  onClick={() => { setEditing(template); setCreateOpen(true); setMenuOpenId(null) }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <Edit3 className="w-4 h-4" /> Edit
                                </button>
                                <button
                                  onClick={() => duplicateTemplate(template)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <Copy className="w-4 h-4" /> Duplicate
                                </button>
                                <button
                                  onClick={() => deleteTemplate(template.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                        {template.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <span>Used {template.usageCount} times · {template.createdBy}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(template.lastUsed)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openUseModal(template)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium"
                        >
                          <Copy className="w-4 h-4" />
                          Use Template
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Use Template modal — preview + real copy + deep link to destination */}
      {useModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setUseModal(null)}>
          <div
            className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{useModal.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{useModal.description}</p>
              </div>
              <button onClick={() => setUseModal(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" aria-label="Close">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 overflow-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-100 dark:border-gray-700 font-mono">
{useModal.content}
              </pre>
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => copyContent(useModal.content)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy content'}
              </button>
              <Link
                href={DESTINATION[useModal.category].href}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                {DESTINATION[useModal.category].label}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Template modal */}
      {createOpen && (
        <TemplateEditor
          initial={editing}
          onClose={() => { setCreateOpen(false); setEditing(null) }}
          onSave={(tmpl) => {
            setTemplates(prev => {
              const exists = prev.some(t => t.id === tmpl.id)
              return exists ? prev.map(t => (t.id === tmpl.id ? tmpl : t)) : [tmpl, ...prev]
            })
            setCreateOpen(false)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Create / Edit modal — appends/updates a template in state (persisted above).
// ---------------------------------------------------------------------------
function TemplateEditor({
  initial,
  onClose,
  onSave,
}: {
  initial: Template | null
  onClose: () => void
  onSave: (t: Template) => void
}) {
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [cat, setCat] = useState<Template['category']>(initial?.category || 'document')
  const [content, setContent] = useState(initial?.content || '')

  const canSave = name.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    const tmpl: Template = {
      id: initial?.id || `tmpl-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom template',
      category: cat,
      content,
      starred: initial?.starred ?? false,
      usageCount: initial?.usageCount ?? 0,
      lastUsed: initial?.lastUsed,
      createdBy: initial?.createdBy || MOCK_USER.name,
    }
    onSave(tmpl)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {initial ? 'Edit Template' : 'Create Template'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" aria-label="Close">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-5 space-y-4 overflow-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Investor Update"
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary"
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value as Template['category'])}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
            >
              {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Template body — use {{placeholders}} for fill-ins"
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white font-mono text-sm"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initial ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  )
}
