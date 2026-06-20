/**
 * Peak One — canonical task board fixture.
 *
 * ~28 tasks across the three missions, assigned to the real Acme team, with
 * TagManager-compatible tag IDs, statuses, priorities, and due dates pinned to
 * the FIXED_TODAY (2026-06-18) world. Deterministic / SSR-safe.
 */

import type { Task, TaskStatus, TaskTag } from '../types'
import { MOCK_TEAM, MOCK_USER } from '../core'

// Team index helpers (MOCK_TEAM[0]=Sarah, 1=Mike, 2=Lisa, 3=David, 4=Emma)
const SARAH = MOCK_USER
const MIKE = MOCK_TEAM[1]
const LISA = MOCK_TEAM[2]
const DAVID = MOCK_TEAM[3]
const EMMA = MOCK_TEAM[4]

/** Canonical TagManager tags. Task.tags hold these IDs so the filter works. */
export const MOCK_TASK_TAGS: TaskTag[] = [
  { id: 'tag-launch', label: 'Launch', color: '#7c3aed' },
  { id: 'tag-eng', label: 'Engineering', color: '#2563eb' },
  { id: 'tag-design', label: 'Design', color: '#db2777' },
  { id: 'tag-marketing', label: 'Marketing', color: '#ea580c' },
  { id: 'tag-legal', label: 'Legal', color: '#dc2626' },
  { id: 'tag-growth', label: 'Growth', color: '#16a34a' },
  { id: 'tag-reliability', label: 'Reliability', color: '#0891b2' },
  { id: 'tag-product', label: 'Product', color: '#9333ea' },
  { id: 'tag-research', label: 'Research', color: '#64748b' },
]

const LAUNCH = 'mission-launch-product-x'
const Q2 = 'mission-q2-growth'
const REL = 'mission-platform-reliability'

const LAUNCH_NAME = 'Launch Product X'
const Q2_NAME = 'Q2 Growth Engine'
const REL_NAME = 'Platform Reliability 99.9%'

function task(
  id: string,
  title: string,
  status: TaskStatus,
  priority: Task['priority'],
  assignee: Task['assignee'],
  tags: string[],
  dueDate: string | null,
  missionId: string,
  missionName: string,
  description?: string,
): Task {
  // Stable created/updated timestamps derived from the index in the id.
  const created = '2026-05-20T09:00:00.000Z'
  const updated = '2026-06-17T12:00:00.000Z'
  return {
    id,
    title,
    description: description ?? null,
    status,
    priority,
    assignee,
    tags,
    dueDate,
    missionId,
    missionName,
    createdAt: created,
    updatedAt: updated,
    completedAt: status === 'DONE' ? '2026-06-12T16:00:00.000Z' : null,
  }
}

export const MOCK_TASKS: Task[] = [
  // ---- Launch Product X (18) ----
  task('task-spec-lock', 'Lock final product spec & roadmap', 'DONE', 'HIGH', MIKE, ['tag-launch', 'tag-product'], '2026-02-20T00:00:00.000Z', LAUNCH, LAUNCH_NAME, 'Finalize and sign off the Product X spec.'),
  task('task-beta-burndown', 'Beta bug burn-down', 'IN_REVIEW', 'HIGH', DAVID, ['tag-launch', 'tag-eng'], '2026-06-20T00:00:00.000Z', LAUNCH, LAUNCH_NAME, 'Drive open beta bugs to zero before GA candidate.'),
  task('task-ga-candidate', 'GA candidate sign-off', 'IN_PROGRESS', 'URGENT', DAVID, ['tag-launch', 'tag-eng', 'tag-reliability'], '2026-06-22T00:00:00.000Z', LAUNCH, LAUNCH_NAME, 'Cut and validate the GA candidate build against the reliability bar.'),
  task('task-legal-review', 'Complete legal & compliance review', 'IN_PROGRESS', 'URGENT', SARAH, ['tag-launch', 'tag-legal'], '2026-06-21T00:00:00.000Z', LAUNCH, LAUNCH_NAME, 'Unblock compliance review (currently 45%); engage outside counsel.'),
  task('task-outside-counsel', 'Draft outside-counsel brief', 'TODO', 'HIGH', SARAH, ['tag-launch', 'tag-legal'], '2026-06-19T00:00:00.000Z', LAUNCH, LAUNCH_NAME, 'Brief for Tom Becker / outside counsel on flagged contract terms.'),
  task('task-launch-comms', 'Approve launch-week comms calendar', 'TODO', 'HIGH', LISA, ['tag-launch', 'tag-marketing'], '2026-06-18T00:00:00.000Z', LAUNCH, LAUNCH_NAME, 'Lisa needs sign-off to lock the launch-week sequence.'),
  task('task-design-partner-onboarding', 'Onboard design partners 7-10', 'IN_PROGRESS', 'MEDIUM', EMMA, ['tag-launch', 'tag-design'], '2026-06-25T00:00:00.000Z', LAUNCH, LAUNCH_NAME, 'Get the remaining 4 of 10 design partners live.'),
  task('task-onboarding-checklist', 'Prototype guided onboarding checklist', 'TODO', 'LOW', EMMA, ['tag-launch', 'tag-design', 'tag-product'], '2026-06-28T00:00:00.000Z', LAUNCH, LAUNCH_NAME, '3-step in-product checklist to cut time-to-value.'),
  task('task-launch-pr', 'Brief PR agency on launch story', 'TODO', 'MEDIUM', LISA, ['tag-launch', 'tag-marketing'], '2026-06-24T00:00:00.000Z', LAUNCH, LAUNCH_NAME),
  task('task-pricing-page', 'Ship pricing page ($49 anchor)', 'IN_PROGRESS', 'MEDIUM', EMMA, ['tag-launch', 'tag-design', 'tag-marketing'], '2026-06-23T00:00:00.000Z', LAUNCH, LAUNCH_NAME),
  task('task-brian-pricing', 'Send Brian pricing one-pager', 'TODO', 'URGENT', SARAH, ['tag-launch', 'tag-research'], '2026-06-18T00:00:00.000Z', LAUNCH, LAUNCH_NAME, 'Close the pricing loop with Brian Miller before the board update.'),
  task('task-mou-brightpath', 'Chase BrightPath co-marketing MOU', 'TODO', 'MEDIUM', MIKE, ['tag-launch', 'tag-marketing'], '2026-06-20T00:00:00.000Z', LAUNCH, LAUNCH_NAME, 'Jenna Rivera to send the draft MOU.'),
  task('task-launch-runbook', 'Finalize launch runbook', 'IN_PROGRESS', 'HIGH', MIKE, ['tag-launch', 'tag-product'], '2026-06-26T00:00:00.000Z', LAUNCH, LAUNCH_NAME),
  task('task-eng-readiness', 'Engineering readiness checklist', 'IN_PROGRESS', 'HIGH', DAVID, ['tag-launch', 'tag-eng'], '2026-06-27T00:00:00.000Z', LAUNCH, LAUNCH_NAME),
  task('task-support-playbook', 'Write launch support playbook', 'TODO', 'MEDIUM', MIKE, ['tag-launch', 'tag-product'], '2026-06-29T00:00:00.000Z', LAUNCH, LAUNCH_NAME),
  task('task-case-studies', 'Publish 3 design-partner case studies', 'IN_PROGRESS', 'MEDIUM', LISA, ['tag-launch', 'tag-marketing'], '2026-06-24T00:00:00.000Z', LAUNCH, LAUNCH_NAME),
  task('task-demo-script', 'Record Product X demo video', 'TODO', 'LOW', EMMA, ['tag-launch', 'tag-marketing', 'tag-design'], '2026-06-26T00:00:00.000Z', LAUNCH, LAUNCH_NAME),
  task('task-board-deck', 'Assemble Q2 board update deck', 'IN_PROGRESS', 'HIGH', SARAH, ['tag-launch', 'tag-research'], '2026-06-19T00:00:00.000Z', LAUNCH, LAUNCH_NAME),

  // ---- Q2 Growth Engine (6) ----
  task('task-lifecycle-emails', 'Build lifecycle email sequences', 'IN_PROGRESS', 'HIGH', LISA, ['tag-growth', 'tag-marketing'], '2026-06-22T00:00:00.000Z', Q2, Q2_NAME),
  task('task-paid-channel', 'Stand up paid acquisition channel', 'IN_PROGRESS', 'HIGH', LISA, ['tag-growth', 'tag-marketing'], '2026-06-25T00:00:00.000Z', Q2, Q2_NAME, 'Paid CAC trending high; iterate creative.'),
  task('task-growth-hire', 'Close Growth Marketing Manager hire', 'TODO', 'URGENT', SARAH, ['tag-growth'], '2026-06-30T00:00:00.000Z', Q2, Q2_NAME, 'Open role blocking paid channel scale.'),
  task('task-mql-dashboard', 'Wire up MQL dashboard', 'DONE', 'MEDIUM', LISA, ['tag-growth', 'tag-research'], '2026-05-30T00:00:00.000Z', Q2, Q2_NAME),
  task('task-webinar', 'Schedule first BrightPath joint webinar', 'TODO', 'MEDIUM', LISA, ['tag-growth', 'tag-marketing'], '2026-06-28T00:00:00.000Z', Q2, Q2_NAME),
  task('task-nurture-creative', 'Refresh nurture creative', 'TODO', 'LOW', EMMA, ['tag-growth', 'tag-design'], '2026-06-29T00:00:00.000Z', Q2, Q2_NAME),

  // ---- Platform Reliability (5) ----
  task('task-slo-cert', 'SLO certification (99.9% / 30d)', 'IN_PROGRESS', 'HIGH', DAVID, ['tag-reliability', 'tag-eng'], '2026-06-21T00:00:00.000Z', REL, REL_NAME),
  task('task-failover-drill', 'Run region failover drill', 'TODO', 'HIGH', DAVID, ['tag-reliability', 'tag-eng'], '2026-06-20T00:00:00.000Z', REL, REL_NAME, 'Final blocker for SLO certification.'),
  task('task-loadtest', 'Enterprise-scale load test', 'IN_PROGRESS', 'MEDIUM', DAVID, ['tag-reliability', 'tag-eng'], '2026-06-23T00:00:00.000Z', REL, REL_NAME),
  task('task-oncall-runbooks', 'Finalize on-call runbooks', 'DONE', 'MEDIUM', DAVID, ['tag-reliability', 'tag-eng'], '2026-03-20T00:00:00.000Z', REL, REL_NAME),
  task('task-security-review', 'Enterprise security review', 'IN_PROGRESS', 'HIGH', DAVID, ['tag-reliability', 'tag-eng', 'tag-legal'], '2026-06-27T00:00:00.000Z', REL, REL_NAME),
]

// ----------------------------------------------------------------------------
// Getters
// ----------------------------------------------------------------------------

export function getMockTasks(filter?: {
  missionId?: string
  status?: TaskStatus
  assigneeId?: string
  tag?: string
}): Task[] {
  let tasks = [...MOCK_TASKS]
  if (filter?.missionId) tasks = tasks.filter((t) => t.missionId === filter.missionId)
  if (filter?.status) tasks = tasks.filter((t) => t.status === filter.status)
  if (filter?.assigneeId) tasks = tasks.filter((t) => t.assignee?.id === filter.assigneeId)
  if (filter?.tag) tasks = tasks.filter((t) => t.tags.includes(filter.tag!))
  return tasks
}

export function getMockTask(id: string): Task | undefined {
  return MOCK_TASKS.find((t) => t.id === id)
}

export function getMockTaskTags(): TaskTag[] {
  return MOCK_TASK_TAGS
}
