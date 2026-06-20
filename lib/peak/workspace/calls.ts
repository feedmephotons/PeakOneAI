/**
 * Peak One — canonical calls fixture (recents + recordings + transcripts).
 *
 * Participants are the real Acme team / external contacts; transcripts and AI
 * summaries are tied to the missions. Per-id lookup makes /calls/summary/[id]
 * differ by id. Deterministic / SSR-safe.
 */

import type { CallRecord, CallTranscriptLine, UserRef } from '../types'
import { MOCK_TEAM, MOCK_USER, MOCK_PEOPLE } from '../core'

const SARAH = MOCK_USER
const MIKE = MOCK_TEAM[1]
const LISA = MOCK_TEAM[2]
const DAVID = MOCK_TEAM[3]
const TOM: UserRef = { id: 'contact-tom-becker', name: 'Tom Becker', email: 'tom.becker@acmecorp.com', role: 'Legal Counsel' }
const BRIAN: UserRef = { id: 'contact-brian-miller', name: 'Brian Miller', email: 'brian@summit-ventures.com', role: 'Investor' }

const LAUNCH = 'mission-launch-product-x'
const Q2 = 'mission-q2-growth'

function line(speaker: string, text: string, at: string): CallTranscriptLine {
  return { speaker, text, at }
}

export const MOCK_CALLS: CallRecord[] = [
  {
    id: 'call-q2-campaign',
    title: 'Q2 Campaign Review with Lisa Park',
    direction: 'OUTBOUND',
    participants: [SARAH, LISA],
    startTime: '2026-06-18T18:00:00.000Z',
    durationSec: 1530,
    durationLabel: '25m 30s',
    hasRecording: true,
    recordingUrl: null,
    transcript: [
      line('Lisa Park', 'The Q2 campaign is tracking 18% above target on qualified pipeline.', '00:12'),
      line('Sarah Chen', 'That is the headline for the board. What is gating the launch-week sequence?', '00:31'),
      line('Lisa Park', 'Just your sign-off on the comms calendar and Tom\'s legal clearance.', '01:04'),
      line('Sarah Chen', 'Approving the calendar today. I will chase Tom on legal in the Launch Sync tonight.', '01:22'),
      line('Lisa Park', 'Great. I will line up two webinar dates with BrightPath once their MOU lands.', '01:48'),
    ],
    aiSummary:
      'Q2 campaign is 18% above target on qualified pipeline. Launch-week sequence is ready pending Sarah\'s comms-calendar sign-off and Tom Becker\'s legal clearance. Lisa will schedule the BrightPath joint webinar once the MOU arrives.',
    actionItems: [
      'Sarah: approve launch-week comms calendar (today)',
      'Sarah: clear legal sign-off path with Tom Becker tonight',
      'Lisa: schedule BrightPath joint webinar after MOU',
    ],
    missionId: Q2,
  },
  {
    id: 'call-launch-sync',
    title: 'Launch Sync (Eng + Legal)',
    direction: 'OUTBOUND',
    participants: [SARAH, DAVID, TOM],
    startTime: '2026-06-18T20:00:00.000Z',
    durationSec: 2640,
    durationLabel: '44m 00s',
    hasRecording: true,
    recordingUrl: null,
    transcript: [
      line('Sarah Chen', 'We need a dated path to legal sign-off. Compliance is at 45% with six weeks left.', '00:18'),
      line('Tom Becker', 'The flagged contract terms need outside counsel. With approval I can have an opinion in 10 days.', '00:40'),
      line('Sarah Chen', 'Approved — engage outside counsel this week.', '01:02'),
      line('David Kim', 'GA candidate is on track for the 22nd, but it has to pass the reliability bar first.', '01:25'),
      line('Tom Becker', 'Understood. I will keep the legal gate from blocking the comms timeline if we move now.', '01:50'),
    ],
    aiSummary:
      'Legal/compliance review is the single HIGH risk to the June 30 launch (currently 45%). Sarah approved engaging outside counsel; Tom estimates a legal opinion within 10 days. GA candidate is on track for June 22 pending the reliability bar.',
    actionItems: [
      'Tom: engage outside counsel on flagged contract terms (this week)',
      'David: cut GA candidate by June 22, validate against reliability bar',
      'Sarah: confirm legal gate does not block launch comms',
    ],
    missionId: LAUNCH,
  },
  {
    id: 'call-brian-intro',
    title: 'Intro Call — Summit Ventures',
    direction: 'INBOUND',
    participants: [SARAH, BRIAN],
    startTime: '2026-06-10T17:00:00.000Z',
    durationSec: 1860,
    durationLabel: '31m 00s',
    hasRecording: true,
    recordingUrl: null,
    transcript: [
      line('Brian Miller', 'I like the traction, but I want to understand the pricing and margin story better.', '00:20'),
      line('Sarah Chen', 'We are anchoring at $49 a seat with an annual discount. I will send a one-pager.', '00:44'),
      line('Brian Miller', 'Send it over. The 18%-above-target pipeline is encouraging.', '01:10'),
    ],
    aiSummary:
      'Brian Miller is supportive of Product X but wants a clearer pricing/margin rationale. Sarah committed to sending a $49-anchor pricing one-pager. Open loop: pricing follow-up still awaiting Brian\'s reply.',
    actionItems: ['Sarah: send Brian the pricing one-pager and the pipeline result'],
    missionId: LAUNCH,
  },
  {
    id: 'call-mike-1on1',
    title: '1:1 with Mike Wilson',
    direction: 'OUTBOUND',
    participants: [SARAH, MIKE],
    startTime: '2026-06-09T15:00:00.000Z',
    durationSec: 1200,
    durationLabel: '20m 00s',
    hasRecording: false,
    recordingUrl: null,
    transcript: [
      line('Mike Wilson', 'Beta quality is solid, but bandwidth is tight with the support escalation.', '00:15'),
      line('Sarah Chen', 'Let us revisit staffing once the escalation clears.', '00:38'),
    ],
    aiSummary:
      'Mike is confident in beta quality but flagged engineering bandwidth due to a support escalation. Agreed to revisit staffing once it clears (now resolved — David returning to Product X).',
    actionItems: ['Sarah: move David Kim back to Product X after escalation'],
    missionId: LAUNCH,
  },
  {
    id: 'call-david-reliability',
    title: 'Reliability Standup',
    direction: 'OUTBOUND',
    participants: [SARAH, DAVID],
    startTime: '2026-06-15T08:00:00.000Z',
    durationSec: 600,
    durationLabel: '10m 00s',
    hasRecording: false,
    recordingUrl: null,
    transcript: [
      line('David Kim', 'We are at 95% on the 30-day SLO. The region failover drill is the last blocker.', '00:10'),
      line('Sarah Chen', 'Schedule it this week so it does not gate the GA candidate.', '00:28'),
    ],
    aiSummary:
      'Platform Reliability is at 95% toward the 30-day SLO. The only blocker to SLO certification is the region failover drill, to be scheduled this week so it does not gate the Product X GA candidate.',
    actionItems: ['David: schedule region failover drill this week'],
    missionId: 'mission-platform-reliability',
  },
]

// ----------------------------------------------------------------------------
// Getters
// ----------------------------------------------------------------------------

export function getMockCalls(): CallRecord[] {
  return MOCK_CALLS
}

export function getMockCall(id: string): CallRecord | undefined {
  return MOCK_CALLS.find((c) => c.id === id)
}
