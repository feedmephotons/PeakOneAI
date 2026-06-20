/**
 * Peak One — canonical notifications + deterministic activity feed.
 *
 * Notifications carry populated deep-link actionUrls. The activity feed replaces
 * any random generators with fixed entries consistent with the home/activity
 * pages. Deterministic / SSR-safe.
 */

import type { ActivityItem, NotificationItem } from '../types'
import { MOCK_TEAM, MOCK_USER } from '../core'

const MIKE = MOCK_TEAM[1]
const LISA = MOCK_TEAM[2]
const DAVID = MOCK_TEAM[3]
const EMMA = MOCK_TEAM[4]
const TOM = { id: 'contact-tom-becker', name: 'Tom Becker', email: 'tom.becker@acmecorp.com', role: 'Legal Counsel' }
const JENNA = { id: 'contact-jenna-rivera', name: 'Jenna Rivera', email: 'jenna@brightpath.io', role: 'Partnerships Lead' }
const LISA_AI = { id: 'lisa-ai', name: 'Lisa', email: 'lisa@acmecorp.com', role: 'AI Assistant' }

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    kind: 'AI',
    title: 'Lisa flagged a HIGH risk',
    body: 'Legal review on Launch Product X is the only HIGH risk to the June 30 launch.',
    actor: LISA_AI,
    read: false,
    actionUrl: '/lisa',
    timestamp: '2026-06-18T16:00:00.000Z',
    tone: 'red',
  },
  {
    id: 'notif-2',
    kind: 'MEETING',
    title: 'Launch Sync starts at 8:00 PM',
    body: 'Launch Sync (Eng + Legal) — resolve the legal review timeline before GA candidate.',
    actor: DAVID,
    read: false,
    actionUrl: '/video/room/meeting-launch-sync',
    timestamp: '2026-06-18T15:30:00.000Z',
    tone: 'primary',
  },
  {
    id: 'notif-3',
    kind: 'MENTION',
    title: 'Lisa Park mentioned you in #product-x',
    body: '"@Sarah Chen can you approve so I can lock launch week?"',
    actor: LISA,
    read: false,
    actionUrl: '/messages?thread=thread-product-x',
    timestamp: '2026-06-18T14:09:00.000Z',
    tone: 'blue',
  },
  {
    id: 'notif-4',
    kind: 'TASK',
    title: 'David moved a task to In Review',
    body: '"Beta bug burn-down" is now In Review on Launch Product X.',
    actor: DAVID,
    read: true,
    actionUrl: '/tasks',
    timestamp: '2026-06-16T15:10:00.000Z',
    tone: 'default',
  },
  {
    id: 'notif-5',
    kind: 'FILE',
    title: 'Jenna shared a file',
    body: 'BrightPath Co-Marketing MOU (draft).pdf was shared with you.',
    actor: JENNA,
    read: true,
    actionUrl: '/files',
    timestamp: '2026-06-18T13:00:00.000Z',
    tone: 'default',
  },
  {
    id: 'notif-6',
    kind: 'TASK',
    title: 'Tom requested outside counsel',
    body: 'Tom Becker flagged contract terms needing outside counsel on Launch Product X.',
    actor: TOM,
    read: true,
    actionUrl: '/missions/mission-launch-product-x',
    timestamp: '2026-06-15T14:20:00.000Z',
    tone: 'amber',
  },
  {
    id: 'notif-7',
    kind: 'CALL',
    title: 'Call summary ready',
    body: 'AI summary for "Q2 Campaign Review with Lisa Park" is ready.',
    actor: LISA_AI,
    read: true,
    actionUrl: '/calls/summary/call-q2-campaign',
    timestamp: '2026-06-18T18:35:00.000Z',
    tone: 'primary',
  },
]

export function getMockNotifications(filter?: { unreadOnly?: boolean }): NotificationItem[] {
  if (filter?.unreadOnly) return MOCK_NOTIFICATIONS.filter((n) => !n.read)
  return MOCK_NOTIFICATIONS
}

export function getMockUnreadCount(): number {
  return MOCK_NOTIFICATIONS.filter((n) => !n.read).length
}

// ----------------------------------------------------------------------------
// Deterministic activity feed (extends the existing MOCK_ACTIVITY in mock.ts).
// ----------------------------------------------------------------------------

export const MOCK_ACTIVITY_FEED: ActivityItem[] = [
  { id: 'feed-1', actor: 'Lisa Park', description: 'Lisa Park mentioned you in #product-x', type: 'MESSAGE', entityType: 'message', entityId: 'thread-product-x', timestamp: '2026-06-18T14:09:00.000Z', tone: 'blue' },
  { id: 'feed-2', actor: 'Sarah Chen', description: 'You approved the launch-week comms calendar', type: 'UPDATED', entityType: 'task', entityId: 'task-launch-comms', timestamp: '2026-06-18T14:12:00.000Z', tone: 'green' },
  { id: 'feed-3', actor: 'David Kim', description: 'David Kim emailed "GA candidate on track for the 22nd"', type: 'CREATED', entityType: 'email', entityId: 'email-david-ga', timestamp: '2026-06-18T11:20:00.000Z' },
  { id: 'feed-4', actor: 'Jenna Rivera', description: 'Jenna Rivera shared "BrightPath Co-Marketing MOU (draft).pdf"', type: 'CREATED', entityType: 'file', entityId: 'file-brightpath-mou', timestamp: '2026-06-18T13:00:00.000Z' },
  { id: 'feed-5', actor: 'Lisa', description: 'Lisa flagged Legal review as a HIGH risk on Launch Product X', type: 'CREATED', entityType: 'risk', entityId: 'risk-1', timestamp: '2026-06-18T16:00:00.000Z', tone: 'red' },
  { id: 'feed-6', actor: 'Mike Wilson', description: 'Mike Wilson commented on Product Launch Plan', type: 'COMMENTED', entityType: 'note', entityId: 'note-product-launch-plan', timestamp: '2026-06-17T08:40:00.000Z' },
  { id: 'feed-7', actor: 'Lisa Park', description: 'Lisa Park updated the Q2 Marketing Strategy', type: 'UPDATED', entityType: 'note', entityId: 'note-q2-marketing', timestamp: '2026-06-16T17:30:00.000Z', tone: 'primary' },
  { id: 'feed-8', actor: 'David Kim', description: 'David Kim moved "Beta bug burn-down" to In Review', type: 'UPDATED', entityType: 'task', entityId: 'task-beta-burndown', timestamp: '2026-06-16T15:10:00.000Z' },
  { id: 'feed-9', actor: 'Tom Becker', description: 'Tom Becker requested outside counsel on contract terms', type: 'COMMENTED', entityType: 'mission', entityId: 'mission-launch-product-x', timestamp: '2026-06-15T14:20:00.000Z', tone: 'amber' },
  { id: 'feed-10', actor: 'Emma Jones', description: 'Emma Jones uploaded "Pricing Page Mockup.png"', type: 'CREATED', entityType: 'file', entityId: 'file-pricing-page-mock', timestamp: '2026-06-14T09:00:00.000Z' },
  { id: 'feed-11', actor: 'Sarah Chen', description: 'You sent the pricing rationale to Brian Miller', type: 'CREATED', entityType: 'email', entityId: 'email-sent-brian', timestamp: '2026-06-14T16:00:00.000Z' },
  { id: 'feed-12', actor: 'David Kim', description: 'David Kim completed "On-call runbooks"', type: 'UPDATED', entityType: 'task', entityId: 'task-oncall-runbooks', timestamp: '2026-06-12T16:00:00.000Z', tone: 'green' },
]

export function getMockActivity(limit?: number): ActivityItem[] {
  const items = [...MOCK_ACTIVITY_FEED].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
  return typeof limit === 'number' ? items.slice(0, limit) : items
}

/** Deep-link target for an activity row, by entityType. */
export function getActivityHref(item: ActivityItem): string {
  switch (item.entityType) {
    case 'note':
      return `/memory/${item.entityId}`
    case 'task':
      return '/tasks'
    case 'file':
      return '/files'
    case 'email':
      return '/email'
    case 'message':
      return `/messages?thread=${item.entityId}`
    case 'mission':
    case 'risk':
      return `/missions/${item.entityType === 'risk' ? 'mission-launch-product-x' : item.entityId}`
    default:
      return '/activity'
  }
}
