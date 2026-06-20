'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, FolderOpen, MessageSquare, CheckSquare, Clock, Plus,
  ArrowRight, Activity, Briefcase, FileText, UserPlus, X, Target,
} from 'lucide-react'
import { PeakShell, GlassPanel, SectionLabel } from '@/components/peak'
import {
  MOCK_USER,
  MOCK_TEAM,
  MOCK_MISSIONS,
  MOCK_PEOPLE,
  ACME_COMPANY,
  ACME_TEAM_SIZE,
  getMockActivity,
  getActivityHref,
  getMockTasks,
  getMockFiles,
  getMockThreads,
} from '@/lib/peak/mock'
import type { Mission, UserRef, ActivityItem } from '@/lib/peak/types'

// ---------------------------------------------------------------------------
// Helpers — deterministic, SSR-safe (no Date.now / random in render)
// ---------------------------------------------------------------------------

const PEAK_NOW = Date.parse('2026-06-18T09:00:00.000Z')

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

/** Deterministic purple-tinted avatar gradient seeded off the name. */
function avatarStyle(name: string): React.CSSProperties {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  const a = 250 + ((h % 30) - 15) // keep it in the violet band
  const b = (a + 40) % 360
  return { backgroundImage: `linear-gradient(135deg, hsl(${a} 70% 55%), hsl(${b} 65% 42%))` }
}

function relativeTime(iso?: string | null): string {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const mins = Math.floor((PEAK_NOW - then) / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

const STATUS_META: Record<string, { label: string; tone: string; bar: string; ring: string }> = {
  ON_TRACK: { label: 'On track', tone: 'text-peak-green', bar: 'bg-peak-green', ring: 'ring-peak-green/20 bg-peak-green/10' },
  AT_RISK: { label: 'At risk', tone: 'text-peak-amber', bar: 'bg-peak-amber', ring: 'ring-peak-amber/20 bg-peak-amber/10' },
  BLOCKED: { label: 'Blocked', tone: 'text-peak-red', bar: 'bg-peak-red', ring: 'ring-peak-red/20 bg-peak-red/10' },
  COMPLETED: { label: 'Done', tone: 'text-peak-primary-300', bar: 'bg-peak-primary', ring: 'ring-peak-primary/20 bg-peak-primary/10' },
}

function statusMeta(status: string) {
  return STATUS_META[status] ?? STATUS_META.ON_TRACK
}

/**
 * Team members map to relationship profiles where one exists (contact-*),
 * otherwise deep-link by their own user id. /people/[id] handles unknown ids
 * gracefully so this never 404s.
 */
function profileHrefFor(member: UserRef): string {
  const contact = MOCK_PEOPLE.find(
    (p) => p.name.toLowerCase() === member.name.toLowerCase(),
  )
  return `/people/${contact?.id ?? member.id}`
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface NewWorkspaceDraft {
  id: string
  name: string
  description: string
  owner: string
}

export default function TeamsPage() {
  const router = useRouter()

  // Locally-created workspaces persist for the session (demo path).
  // EXTERNAL: needs a missions/workspaces API for real persistence.
  const [drafts, setDrafts] = useState<NewWorkspaceDraft[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSent, setInviteSent] = useState<string | null>(null)

  // --- Canonical data ---------------------------------------------------

  const tasks = useMemo(() => getMockTasks(), [])
  const files = useMemo(() => getMockFiles(), [])
  const threads = useMemo(() => getMockThreads(), [])
  const activity = useMemo<ActivityItem[]>(() => getMockActivity(6), [])

  // Per-mission counts derived from the canonical fixtures.
  const missionCounts = useMemo(() => {
    const map = new Map<string, { tasks: number; files: number; threads: number }>()
    for (const m of MOCK_MISSIONS) {
      const t = tasks.filter((task) => task.missionId === m.id).length
      const f = files.filter((file) => file.missionId === m.id).length
      // Threads aren't mission-tagged; attribute the launch thread to the launch mission.
      const th = threads.filter((thread) =>
        m.id === 'mission-launch-product-x'
          ? /product.?x|launch/i.test(thread.name ?? '')
          : false,
      ).length
      map.set(m.id, {
        tasks: t || m.taskCount || 0,
        files: f,
        threads: th,
      })
    }
    return map
  }, [tasks, files, threads])

  // --- Stats (computed from arrays, not hardcoded) ----------------------

  const openTasks = tasks.filter((t) => t.status !== 'DONE').length
  const stats = [
    { label: 'Workspaces', value: String(MOCK_MISSIONS.length + drafts.length), icon: <Briefcase className="w-5 h-5" />, tone: 'primary' as const },
    { label: 'Team members', value: String(ACME_TEAM_SIZE), icon: <Users className="w-5 h-5" />, tone: 'green' as const },
    { label: 'Open tasks', value: String(openTasks), icon: <CheckSquare className="w-5 h-5" />, tone: 'amber' as const },
    { label: 'Files shared', value: String(files.length), icon: <FileText className="w-5 h-5" />, tone: 'blue' as const },
  ]

  // --- Handlers ---------------------------------------------------------

  function handleCreate() {
    const name = newName.trim()
    if (!name) return
    const id = `ws-draft-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
    setDrafts((d) => [
      ...d,
      { id, name, description: newDesc.trim() || 'New collaborative workspace', owner: MOCK_USER.name },
    ])
    setNewName('')
    setNewDesc('')
    setShowCreate(false)
  }

  function handleInvite() {
    const email = inviteEmail.trim()
    if (!email) return
    // EXTERNAL: needs an invites API / email send to actually deliver.
    setInviteSent(email)
    setInviteEmail('')
  }

  function openMission(id: string) {
    router.push(`/missions/${id}`)
  }

  return (
    <PeakShell>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-peak-primary-300">
            {ACME_COMPANY}
          </div>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight text-peak">
            Team <span className="text-peak-primary-300">Workspaces</span>
          </h1>
          <p className="mt-2 text-sm text-peak-muted">
            Every mission is a shared workspace. Collaborate with the {ACME_COMPANY} team across tasks, files, and threads.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-peak-primary px-5 py-2.5 text-sm font-medium text-white shadow-peak-glow transition-colors hover:bg-peak-primary-600 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Workspace
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <GlassPanel key={s.label} className="flex items-center gap-3 p-4">
            <span
              className={[
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1',
                s.tone === 'primary' ? 'bg-peak-primary/15 text-peak-primary-300 ring-peak-primary/20' : '',
                s.tone === 'green' ? 'bg-peak-green/15 text-peak-green ring-peak-green/20' : '',
                s.tone === 'amber' ? 'bg-peak-amber/15 text-peak-amber ring-peak-amber/20' : '',
                s.tone === 'blue' ? 'bg-peak-blue/15 text-peak-blue ring-peak-blue/20' : '',
              ].join(' ')}
            >
              {s.icon}
            </span>
            <div>
              <p className="text-2xl font-semibold leading-none tracking-tight text-peak">{s.value}</p>
              <p className="mt-1 text-xs text-peak-muted">{s.label}</p>
            </div>
          </GlassPanel>
        ))}
      </div>

      {/* Main grid: workspaces + activity */}
      <div className="mb-10 grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Workspaces */}
        <div className="xl:col-span-3">
          <SectionLabel className="mb-4">Active Workspaces</SectionLabel>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_MISSIONS.map((m) => (
              <WorkspaceCard key={m.id} mission={m} counts={missionCounts.get(m.id)} onOpen={() => openMission(m.id)} />
            ))}
            {drafts.map((d) => (
              <DraftCard key={d.id} draft={d} />
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="xl:col-span-1">
          <SectionLabel className="mb-4">Activity</SectionLabel>
          <GlassPanel className="p-5">
            <div className="space-y-4">
              {activity.map((item) => (
                <Link
                  key={item.id}
                  href={getActivityHref(item)}
                  className="-mx-2 flex gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-peak-primary" />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug text-peak">{item.description}</p>
                    <p className="mt-0.5 text-xs text-peak-dim">{relativeTime(item.timestamp)}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link
              href="/activity"
              className="mt-4 flex items-center justify-center gap-1 border-t border-peak-border pt-3 text-xs font-medium text-peak-primary-300 transition-colors hover:text-peak-primary"
            >
              View all activity
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </GlassPanel>
        </div>
      </div>

      {/* Team members */}
      <div className="mb-6">
        <SectionLabel
          className="mb-4"
          action={
            <button
              onClick={() => setShowInvite(true)}
              className="inline-flex items-center gap-1.5 text-peak-primary-300 transition-colors hover:text-peak-primary"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invite
            </button>
          }
        >
          Team Members ({MOCK_TEAM.length})
        </SectionLabel>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {MOCK_TEAM.map((member) => (
            <Link key={member.id} href={profileHrefFor(member)} className="group block">
              <GlassPanel className="peak-glass-hover flex flex-col items-center p-4 text-center transition-colors">
                <div
                  className="mb-2 flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={avatarStyle(member.name)}
                >
                  {initials(member.name)}
                </div>
                <p className="w-full truncate text-sm font-medium text-peak group-hover:text-peak-primary-300">
                  {member.name}
                </p>
                <span className="mt-1.5 inline-block rounded-full bg-peak-primary/10 px-2 py-0.5 text-[11px] font-medium text-peak-primary-300 ring-1 ring-peak-primary/20">
                  {member.id === MOCK_USER.id ? 'Owner' : member.role}
                </span>
              </GlassPanel>
            </Link>
          ))}
        </div>
      </div>

      {/* Create Workspace modal */}
      {showCreate && (
        <Modal title="Create Workspace" onClose={() => setShowCreate(false)}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-peak-muted">Name</label>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="e.g. Customer Advisory Board"
                className="w-full rounded-xl border border-peak-border bg-white/[0.04] px-3.5 py-2.5 text-sm text-peak placeholder:text-peak-dim focus:border-peak-primary/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-peak-muted">Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                placeholder="What is this workspace for?"
                className="w-full resize-none rounded-xl border border-peak-border bg-white/[0.04] px-3.5 py-2.5 text-sm text-peak placeholder:text-peak-dim focus:border-peak-primary/50 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-peak-muted transition-colors hover:text-peak"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="rounded-xl bg-peak-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-peak-primary-600 disabled:opacity-40"
              >
                Create
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Invite modal */}
      {showInvite && (
        <Modal
          title="Invite teammate"
          onClose={() => {
            setShowInvite(false)
            setInviteSent(null)
          }}
        >
          {inviteSent ? (
            <div className="space-y-4">
              <p className="text-sm text-peak">
                Invite queued for <span className="font-medium text-peak-primary-300">{inviteSent}</span>.
              </p>
              <p className="text-xs text-peak-dim">
                {/* EXTERNAL: needs an invites API / email send to actually deliver. */}
                They will receive a link to join the {ACME_COMPANY} workspace.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowInvite(false)
                    setInviteSent(null)
                  }}
                  className="rounded-xl bg-peak-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-peak-primary-600"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-peak-muted">Email address</label>
                <input
                  autoFocus
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                  placeholder="name@acmecorp.com"
                  className="w-full rounded-xl border border-peak-border bg-white/[0.04] px-3.5 py-2.5 text-sm text-peak placeholder:text-peak-dim focus:border-peak-primary/50 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowInvite(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-peak-muted transition-colors hover:text-peak"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim()}
                  className="rounded-xl bg-peak-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-peak-primary-600 disabled:opacity-40"
                >
                  Send invite
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </PeakShell>
  )
}

// ---------------------------------------------------------------------------
// Workspace card (mission-backed)
// ---------------------------------------------------------------------------

function WorkspaceCard({
  mission,
  counts,
  onOpen,
}: {
  mission: Mission
  counts?: { tasks: number; files: number; threads: number }
  onOpen: () => void
}) {
  const meta = statusMeta(mission.status)
  const members = mission.members ?? []
  return (
    <GlassPanel
      onClick={onOpen}
      className="peak-glass-hover group cursor-pointer overflow-hidden p-0 transition-colors"
    >
      <div className={`h-1 ${meta.bar}`} />
      <div className="p-5">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-peak transition-colors group-hover:text-peak-primary-300">
            {mission.name}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${meta.ring} ${meta.tone}`}
          >
            {meta.label}
          </span>
        </div>
        <p className="mb-4 line-clamp-2 text-sm text-peak-muted">{mission.description}</p>

        {/* Progress */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-peak-dim">Progress</span>
            <span className={`font-medium ${meta.tone}`}>{mission.progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${mission.progress}%` }} />
          </div>
        </div>

        {/* Members */}
        <div className="mb-4 flex -space-x-2">
          {members.slice(0, 4).map((mm) => (
            <div
              key={mm.id}
              title={mm.user.name}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-medium text-white ring-2 ring-peak-bg"
              style={avatarStyle(mm.user.name)}
            >
              {initials(mm.user.name)}
            </div>
          ))}
          {members.length > 4 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08] text-[11px] font-medium text-peak-muted ring-2 ring-peak-bg">
              +{members.length - 4}
            </div>
          )}
        </div>

        {/* Counts */}
        <div className="mb-3 flex items-center gap-4 text-xs text-peak-muted">
          <span className="flex items-center gap-1">
            <CheckSquare className="h-3.5 w-3.5" />
            {counts?.tasks ?? 0} tasks
          </span>
          <span className="flex items-center gap-1">
            <FolderOpen className="h-3.5 w-3.5" />
            {counts?.files ?? 0} files
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {counts?.threads ?? 0} threads
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-peak-border pt-3">
          <span className="flex items-center gap-1 text-xs text-peak-dim">
            <Clock className="h-3.5 w-3.5" />
            {relativeTime(mission.updatedAt)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpen()
            }}
            className="flex items-center gap-1 text-xs font-medium text-peak-primary-300 transition-colors hover:text-peak-primary"
          >
            Open
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </GlassPanel>
  )
}

// ---------------------------------------------------------------------------
// Locally-created workspace draft card
// ---------------------------------------------------------------------------

function DraftCard({ draft }: { draft: NewWorkspaceDraft }) {
  return (
    <GlassPanel className="overflow-hidden p-0">
      <div className="h-1 bg-peak-primary" />
      <div className="p-5">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-peak">{draft.name}</h3>
          <span className="shrink-0 rounded-full bg-peak-primary/10 px-2 py-0.5 text-[10px] font-medium text-peak-primary-300 ring-1 ring-peak-primary/20">
            New
          </span>
        </div>
        <p className="mb-4 line-clamp-2 text-sm text-peak-muted">{draft.description}</p>
        <div className="flex items-center gap-2 text-xs text-peak-dim">
          <Target className="h-3.5 w-3.5" />
          Owned by {draft.owner}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-peak-border pt-3">
          <span className="flex items-center gap-1 text-xs text-peak-dim">
            <Clock className="h-3.5 w-3.5" />
            just now
          </span>
          <span className="text-xs text-peak-dim">Setup in progress</span>
        </div>
      </div>
    </GlassPanel>
  )
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <GlassPanel className="relative z-10 w-full max-w-md p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-peak">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-peak-muted transition-colors hover:bg-white/[0.06] hover:text-peak"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </GlassPanel>
    </div>
  )
}
