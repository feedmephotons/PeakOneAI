/**
 * Peak One — canonical message threads fixture.
 *
 * #product-x and #general channels, DMs among the Acme team, and a group thread
 * that includes external contacts. Realistic launch/pricing content tied to the
 * missions. Deterministic / SSR-safe (fixed timestamps).
 */

import type { ChatMessage, MessageThread, UserRef } from '../types'
import { MOCK_TEAM, MOCK_USER, MOCK_PEOPLE } from '../core'

const SARAH = MOCK_USER
const MIKE = MOCK_TEAM[1]
const LISA = MOCK_TEAM[2]
const DAVID = MOCK_TEAM[3]
const EMMA = MOCK_TEAM[4]

// External contacts as UserRefs (for the group thread).
const JENNA: UserRef = { id: 'contact-jenna-rivera', name: 'Jenna Rivera', email: 'jenna@brightpath.io', role: 'Partnerships Lead' }
const BRIAN: UserRef = { id: 'contact-brian-miller', name: 'Brian Miller', email: 'brian@summit-ventures.com', role: 'Investor' }

function msg(id: string, threadId: string, sender: UserRef, body: string, createdAt: string): ChatMessage {
  return { id, threadId, sender, body, createdAt, readBy: [SARAH.id] }
}

const productXMessages: ChatMessage[] = [
  msg('m-px-1', 'thread-product-x', DAVID, 'Beta bug burn-down is down to 6 open, all P2 or lower. GA candidate cut is on track for the 22nd.', '2026-06-18T14:02:00.000Z'),
  msg('m-px-2', 'thread-product-x', MIKE, 'Nice. Launch runbook is at 70% — eng readiness checklist is the long pole.', '2026-06-18T14:05:00.000Z'),
  msg('m-px-3', 'thread-product-x', LISA, 'Comms calendar is ready for sign-off. @Sarah Chen can you approve so I can lock launch week?', '2026-06-18T14:09:00.000Z'),
  msg('m-px-4', 'thread-product-x', SARAH, 'Approving today. One blocker: I still need the legal sign-off path from Tom before comms go live.', '2026-06-18T14:12:00.000Z'),
  msg('m-px-5', 'thread-product-x', EMMA, 'Pricing page mock is in Figma — $49 anchor with the annual-discount toggle. Will ship to staging tomorrow.', '2026-06-18T14:18:00.000Z'),
]

const generalMessages: ChatMessage[] = [
  msg('m-gn-1', 'thread-general', SARAH, 'Q2 board update is Thursday. Pipeline is 18% above target — great quarter, team.', '2026-06-18T09:30:00.000Z'),
  msg('m-gn-2', 'thread-general', LISA, 'The design-partner case studies are publishing this week, perfect timing for the deck.', '2026-06-18T09:34:00.000Z'),
  msg('m-gn-3', 'thread-general', MIKE, 'Reminder: Launch Sync (Eng + Legal) at 8pm tonight.', '2026-06-18T09:40:00.000Z'),
]

const dmMikeMessages: ChatMessage[] = [
  msg('m-mike-1', 'thread-dm-mike', MIKE, 'Beta quality feels good but I am still nervous about engineering bandwidth.', '2026-06-17T16:00:00.000Z'),
  msg('m-mike-2', 'thread-dm-mike', SARAH, 'Support escalation is resolved — I am moving David back to Product X full-time.', '2026-06-17T16:03:00.000Z'),
  msg('m-mike-3', 'thread-dm-mike', MIKE, 'That recovers the burn-down. Thank you.', '2026-06-17T16:05:00.000Z'),
]

const dmLisaMessages: ChatMessage[] = [
  msg('m-lisa-1', 'thread-dm-lisa', LISA, 'Campaign is tracking 18% above target on MQLs. Want me to commit the launch-week sequence?', '2026-06-18T11:00:00.000Z'),
  msg('m-lisa-2', 'thread-dm-lisa', SARAH, 'Yes — pending the comms-calendar sign-off in #product-x. Let us review at 6pm.', '2026-06-18T11:04:00.000Z'),
]

const dmDavidMessages: ChatMessage[] = [
  msg('m-david-1', 'thread-dm-david', DAVID, 'Region failover drill is the only thing between us and SLO certification.', '2026-06-18T10:00:00.000Z'),
  msg('m-david-2', 'thread-dm-david', SARAH, 'Let us get it scheduled this week so reliability does not gate the GA candidate.', '2026-06-18T10:06:00.000Z'),
]

const groupLaunchMessages: ChatMessage[] = [
  msg('m-grp-1', 'thread-group-launch', JENNA, 'Hi all — sending the draft co-marketing MOU by EOD. Excited for the joint webinar in launch week.', '2026-06-18T13:00:00.000Z'),
  msg('m-grp-2', 'thread-group-launch', LISA, 'Perfect. I will line up two launch-week dates for the webinar once the MOU lands.', '2026-06-18T13:05:00.000Z'),
  msg('m-grp-3', 'thread-group-launch', MIKE, 'Looping in Sarah for sign-off. Pricing is anchored at $49 if it comes up with your audience.', '2026-06-18T13:08:00.000Z'),
  msg('m-grp-4', 'thread-group-launch', SARAH, 'Thanks Jenna. Once the MOU is in, we are go for the webinar.', '2026-06-18T13:12:00.000Z'),
]

function thread(
  id: string,
  kind: MessageThread['kind'],
  name: string,
  members: UserRef[],
  messages: ChatMessage[],
  unread: number,
): MessageThread {
  const last = messages[messages.length - 1]
  return {
    id,
    kind,
    name,
    members,
    messages,
    unread,
    lastMessage: last?.body ?? '',
    lastMessageAt: last?.createdAt,
  }
}

export const MOCK_MESSAGE_THREADS: MessageThread[] = [
  thread('thread-product-x', 'CHANNEL', '#product-x', [SARAH, MIKE, LISA, DAVID, EMMA], productXMessages, 2),
  thread('thread-general', 'CHANNEL', '#general', [SARAH, MIKE, LISA, DAVID, EMMA], generalMessages, 0),
  thread('thread-group-launch', 'GROUP', 'Launch Partnership', [SARAH, MIKE, LISA, JENNA], groupLaunchMessages, 1),
  thread('thread-dm-mike', 'DM', 'Mike Wilson', [SARAH, MIKE], dmMikeMessages, 0),
  thread('thread-dm-lisa', 'DM', 'Lisa Park', [SARAH, LISA], dmLisaMessages, 1),
  thread('thread-dm-david', 'DM', 'David Kim', [SARAH, DAVID], dmDavidMessages, 0),
]

// ----------------------------------------------------------------------------
// Getters
// ----------------------------------------------------------------------------

export function getMockThreads(): MessageThread[] {
  return MOCK_MESSAGE_THREADS
}

export function getMockThread(id: string): MessageThread | undefined {
  return MOCK_MESSAGE_THREADS.find((t) => t.id === id)
}
