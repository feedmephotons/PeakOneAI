/**
 * Peak One — canonical email inbox fixture.
 *
 * User is sarah.chen@acmecorp.com. Folders: inbox / sent / archive / trash /
 * starred. Bodies reference the missions. Deterministic / SSR-safe.
 */

import type { EmailMessage, UserRef } from '../types'
import { MOCK_TEAM, MOCK_USER } from '../core'

const SARAH = MOCK_USER
const MIKE = MOCK_TEAM[1]
const LISA = MOCK_TEAM[2]
const DAVID = MOCK_TEAM[3]
const EMMA = MOCK_TEAM[4]
const TOM: UserRef = { id: 'contact-tom-becker', name: 'Tom Becker', email: 'tom.becker@acmecorp.com', role: 'Legal Counsel' }
const BRIAN: UserRef = { id: 'contact-brian-miller', name: 'Brian Miller', email: 'brian@summit-ventures.com', role: 'Investor' }
const JENNA: UserRef = { id: 'contact-jenna-rivera', name: 'Jenna Rivera', email: 'jenna@brightpath.io', role: 'Partnerships Lead' }

const LAUNCH = 'mission-launch-product-x'
const Q2 = 'mission-q2-growth'

function preview(body: string): string {
  return body.replace(/\s+/g, ' ').slice(0, 120).trim()
}

function email(
  id: string,
  folder: EmailMessage['folder'],
  from: UserRef,
  to: UserRef[],
  subject: string,
  body: string,
  read: boolean,
  starred: boolean,
  date: string,
  missionId: string | null,
): EmailMessage {
  return { id, folder, from, to, subject, body, preview: preview(body), read, starred, date, missionId }
}

export const MOCK_EMAILS: EmailMessage[] = [
  // ---- Inbox ----
  email('email-tom-legal', 'inbox', TOM, [SARAH], 'Re: Legal sign-off path for Product X',
    'Sarah — the flagged contract terms need outside counsel. With your approval I can have an opinion within ~10 days, which keeps us inside the launch window. Let me know and I will engage them today.',
    false, true, '2026-06-18T15:10:00.000Z', LAUNCH),
  email('email-lisa-comms', 'inbox', LISA, [SARAH], 'Launch-week comms calendar — ready for sign-off',
    'The launch-week sequence is built and the design-partner case studies publish this week. I just need your sign-off to lock it. Campaign is 18% above target on MQLs.',
    false, false, '2026-06-18T13:40:00.000Z', Q2),
  email('email-jenna-mou', 'inbox', JENNA, [SARAH, MIKE], 'BrightPath co-marketing MOU (draft attached)',
    'Hi Sarah — attaching the draft co-marketing MOU. Excited for a joint webinar during launch week. Once you have signed off we can set dates and align audiences.',
    true, false, '2026-06-18T13:00:00.000Z', LAUNCH),
  email('email-david-ga', 'inbox', DAVID, [SARAH, MIKE], 'GA candidate on track for the 22nd',
    'Beta burn-down is down to 6 open (all P2 or lower). GA candidate cut is on track for June 22, pending the reliability bar. Region failover drill is the last reliability blocker.',
    true, false, '2026-06-18T11:20:00.000Z', LAUNCH),
  email('email-brian-thread', 'inbox', BRIAN, [SARAH], 'Re: Pricing rationale',
    'Thanks Sarah. The 18% number is encouraging. I still want to walk through the margin assumptions before the board update — can we grab 20 minutes this week?',
    false, true, '2026-06-18T09:05:00.000Z', LAUNCH),

  // ---- Sent ----
  email('email-sent-brian', 'sent', SARAH, [BRIAN], 'Pricing rationale + Q2 pipeline',
    'Brian — here is the one-pager on the $49 anchor and annual-discount rationale, plus the Q2 pipeline result (18% above target). Happy to walk through margin whenever works.',
    true, false, '2026-06-14T16:00:00.000Z', LAUNCH),
  email('email-sent-team', 'sent', SARAH, [MIKE, LISA, DAVID, EMMA], 'Q2 board update — Thursday',
    'Team — board update is Thursday. Headline: pipeline 18% above target, Launch Product X at 72%. One HIGH risk (legal). Send me anything you want reflected by Wednesday EOD.',
    true, false, '2026-06-18T09:30:00.000Z', LAUNCH),
  email('email-sent-tom', 'sent', SARAH, [TOM], 'Approved: engage outside counsel',
    'Tom — approved. Please engage outside counsel on the flagged terms today so legal does not gate the launch comms. Thank you.',
    true, false, '2026-06-18T20:50:00.000Z', LAUNCH),

  // ---- Archive ----
  email('email-arch-spec', 'archive', MIKE, [SARAH], 'Product X spec v3 — signed off',
    'Spec v3 is locked and signed off. Roadmap attached. Moving into the beta hardening phase.',
    true, false, '2026-02-20T17:00:00.000Z', LAUNCH),
  email('email-arch-partnership', 'archive', MIKE, [SARAH], 'Decision: move forward with BrightPath',
    'Logged the decision to move forward with the BrightPath co-marketing partnership. Jenna to send the draft MOU.',
    true, false, '2026-05-20T10:30:00.000Z', LAUNCH),

  // ---- Trash ----
  email('email-trash-newsletter', 'trash', { id: 'ext-newsletter', name: 'SaaS Weekly', email: 'news@saasweekly.example' }, [SARAH], 'This week in SaaS',
    'Top stories in SaaS this week. Unsubscribe anytime.',
    true, false, '2026-06-12T07:00:00.000Z', null),
]

// ----------------------------------------------------------------------------
// Getters
// ----------------------------------------------------------------------------

export function getMockEmails(folder?: EmailMessage['folder']): EmailMessage[] {
  if (!folder) return MOCK_EMAILS
  if (folder === 'starred') return MOCK_EMAILS.filter((e) => e.starred && e.folder !== 'trash')
  return MOCK_EMAILS.filter((e) => e.folder === folder)
}

export function getMockEmail(id: string): EmailMessage | undefined {
  return MOCK_EMAILS.find((e) => e.id === id)
}
