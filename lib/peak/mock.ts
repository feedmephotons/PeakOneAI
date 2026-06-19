/**
 * Peak One — mock fixtures for the Phase 2 redesign.
 *
 * These mirror the reference mockups (Sarah Chen / Acme Corp, "Launch Product X"
 * at 72%, Q2 Marketing Strategy note, Brian Miller, etc.) so every page renders
 * immediately — even when the Supabase "PEAK One" project is paused.
 *
 * API routes import these as the fallback payload when Prisma throws.
 */

import type {
  ActivityItem,
  BriefingLine,
  DailyBrief,
  InteractionItem,
  LisaInsight,
  MeetingItem,
  Mission,
  MissionRecommendation,
  Note,
  NoteConnection,
  Person,
  Priority,
  QuickAction,
  RelationshipBrief,
  RelationshipProfile,
  StatTileData,
  UserRef,
  VoiceNote,
} from './types'

// ----------------------------------------------------------------------------
// People / users
// ----------------------------------------------------------------------------

export const MOCK_USER: UserRef = {
  id: 'user-sarah-chen',
  name: 'Sarah Chen',
  email: 'sarah.chen@acmecorp.com',
  avatarUrl: null,
  role: 'Founder & CEO',
}

export const MOCK_TEAM: UserRef[] = [
  MOCK_USER,
  { id: 'user-mike-wilson', name: 'Mike Wilson', email: 'mike@acmecorp.com', role: 'Head of Product' },
  { id: 'user-lisa-park', name: 'Lisa Park', email: 'lisa.park@acmecorp.com', role: 'Marketing Lead' },
  { id: 'user-david-kim', name: 'David Kim', email: 'david@acmecorp.com', role: 'Engineering Lead' },
  { id: 'user-emma-jones', name: 'Emma Jones', email: 'emma@acmecorp.com', role: 'Design Lead' },
]

/** People in the Relationship Intelligence list (built on Contact). */
export const MOCK_PEOPLE: Person[] = [
  {
    id: 'contact-brian-miller',
    name: 'Brian Miller',
    email: 'brian@summit-ventures.com',
    phoneNumber: '+1 (415) 555-0142',
    company: 'Summit Ventures',
    title: 'Investor',
    favorite: true,
  },
  {
    id: 'contact-mike-wilson',
    name: 'Mike Wilson',
    email: 'mike@acmecorp.com',
    phoneNumber: '+1 (415) 555-0199',
    company: 'Acme Corp',
    title: 'Head of Product',
    favorite: false,
  },
  {
    id: 'contact-jenna-rivera',
    name: 'Jenna Rivera',
    email: 'jenna@brightpath.io',
    phoneNumber: '+1 (628) 555-0177',
    company: 'BrightPath',
    title: 'Partnerships Lead',
    favorite: false,
  },
  {
    id: 'contact-tom-becker',
    name: 'Tom Becker',
    email: 'tom.becker@acmecorp.com',
    phoneNumber: '+1 (415) 555-0123',
    company: 'Acme Corp',
    title: 'Legal Counsel',
    favorite: false,
  },
]

// ----------------------------------------------------------------------------
// Missions
// ----------------------------------------------------------------------------

export const MOCK_MISSION: Mission = {
  id: 'mission-launch-product-x',
  name: 'Launch Product X',
  description:
    'Bring Product X to market by end of Q2. Coordinate engineering, design, marketing, and legal toward a clean June 30 launch.',
  status: 'ON_TRACK',
  progress: 72,
  targetDate: '2026-06-30T00:00:00.000Z',
  budgetUsed: 184000,
  budgetTotal: 250000,
  healthScore: 81,
  velocity: 34,
  owner: MOCK_USER,
  workspaceId: 'workspace-acme',
  objectives: [
    { id: 'obj-1', title: 'Finalize product spec & roadmap', progress: 100, status: 'COMPLETED', position: 0 },
    { id: 'obj-2', title: 'Ship core feature set to beta', progress: 85, status: 'ON_TRACK', position: 1 },
    { id: 'obj-3', title: 'Complete legal & compliance review', progress: 45, status: 'AT_RISK', position: 2 },
    { id: 'obj-4', title: 'Launch Q2 marketing campaign', progress: 70, status: 'ON_TRACK', position: 3 },
    { id: 'obj-5', title: 'Onboard first 10 design partners', progress: 60, status: 'ON_TRACK', position: 4 },
  ],
  milestones: [
    { id: 'ms-1', label: 'Kickoff', date: '2026-01-15T00:00:00.000Z', state: 'DONE', position: 0 },
    { id: 'ms-2', label: 'Spec Locked', date: '2026-02-20T00:00:00.000Z', state: 'DONE', position: 1 },
    { id: 'ms-3', label: 'Beta Release', date: '2026-04-10T00:00:00.000Z', state: 'DONE', position: 2 },
    { id: 'ms-4', label: 'GA Candidate', date: '2026-06-01T00:00:00.000Z', state: 'ACTIVE', position: 3 },
    { id: 'ms-5', label: 'Launch', date: '2026-06-30T00:00:00.000Z', state: 'UPCOMING', position: 4 },
  ],
  risks: [
    {
      id: 'risk-1',
      title: 'Legal review delay',
      level: 'HIGH',
      impact: 'Could push launch 2-3 weeks',
      probability: 'Likely',
      note: 'Compliance review is at 45% with 6 weeks to launch. Tom Becker flagged contract terms that need outside counsel.',
    },
    {
      id: 'risk-2',
      title: 'Engineering bandwidth',
      level: 'MED',
      impact: 'Slower beta bug burn-down',
      probability: 'Possible',
      note: 'Two engineers split across Product X and a support escalation.',
    },
    {
      id: 'risk-3',
      title: 'Market competition',
      level: 'LOW',
      impact: 'Pricing pressure post-launch',
      probability: 'Unlikely near term',
      note: 'A competitor is rumored to be 1-2 quarters behind.',
    },
  ],
  members: [
    { id: 'mm-1', role: 'Mission Owner', user: MOCK_USER },
    { id: 'mm-2', role: 'Product', user: MOCK_TEAM[1] },
    { id: 'mm-3', role: 'Marketing', user: MOCK_TEAM[2] },
    { id: 'mm-4', role: 'Engineering', user: MOCK_TEAM[3] },
    { id: 'mm-5', role: 'Design', user: MOCK_TEAM[4] },
  ],
  taskCount: 28,
  objectiveCount: 5,
  riskCount: 3,
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: '2026-06-17T09:00:00.000Z',
}

export const MOCK_MISSIONS: Mission[] = [
  MOCK_MISSION,
  {
    id: 'mission-q2-growth',
    name: 'Q2 Growth Engine',
    description: 'Stand up the demand-gen and lifecycle marketing machine for H1 expansion.',
    status: 'AT_RISK',
    progress: 48,
    targetDate: '2026-06-30T00:00:00.000Z',
    budgetUsed: 92000,
    budgetTotal: 160000,
    healthScore: 62,
    velocity: 21,
    owner: MOCK_TEAM[2],
    workspaceId: 'workspace-acme',
    taskCount: 17,
    objectiveCount: 4,
    riskCount: 2,
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-06-16T12:00:00.000Z',
  },
  {
    id: 'mission-platform-reliability',
    name: 'Platform Reliability 99.9%',
    description: 'Harden infrastructure and incident response ahead of enterprise rollout.',
    status: 'ON_TRACK',
    progress: 88,
    targetDate: '2026-05-31T00:00:00.000Z',
    budgetUsed: 71000,
    budgetTotal: 90000,
    healthScore: 90,
    velocity: 40,
    owner: MOCK_TEAM[3],
    workspaceId: 'workspace-acme',
    taskCount: 22,
    objectiveCount: 3,
    riskCount: 1,
    createdAt: '2026-01-20T00:00:00.000Z',
    updatedAt: '2026-06-15T08:00:00.000Z',
  },
]

export const MOCK_MISSION_RECOMMENDATIONS: MissionRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Escalate the legal review',
    body: 'Legal is your only HIGH risk and is behind. I can draft an outside-counsel brief and set a 30-min sync with Tom Becker tomorrow.',
    tone: 'red',
  },
  {
    id: 'rec-2',
    title: 'Reallocate one engineer back to Product X',
    body: 'The support escalation is resolved. Moving David Kim back recovers ~6 velocity points and de-risks the beta burn-down.',
    tone: 'amber',
  },
  {
    id: 'rec-3',
    title: 'Lock the launch comms calendar',
    body: 'The Q2 campaign is tracking 18% above target. Now is a good time to commit the launch-week sequence with Lisa Park.',
    tone: 'green',
  },
]

// ----------------------------------------------------------------------------
// Notes (Memory)
// ----------------------------------------------------------------------------

const NOW = '2026-06-17T09:00:00.000Z'

export const MOCK_NOTES: Note[] = [
  {
    id: 'note-q2-marketing',
    brain: 'MY',
    type: 'RESEARCH',
    title: 'Q2 Marketing Strategy',
    body:
      "## Goal\nDrive 3x qualified pipeline for the Product X launch.\n\n## Key bets\n- Lifecycle email + in-product nudges\n- Design-partner case studies\n- Launch-week PR push\n\n## Metrics\nCampaign is currently tracking **18% above target** on MQLs. Brian raised pricing concerns we should pre-empt in messaging.",
    tags: ['marketing', 'q2', 'launch', 'strategy'],
    pinned: true,
    starred: true,
    author: MOCK_USER,
    workspaceId: 'workspace-acme',
    connectionCount: 5,
    createdAt: '2026-05-02T14:00:00.000Z',
    updatedAt: '2026-06-16T17:30:00.000Z',
  },
  {
    id: 'note-acme-partnership',
    brain: 'TEAM',
    type: 'DECISION',
    title: 'Acme Corp Partnership',
    body:
      'Decision: move forward with the BrightPath co-marketing partnership for the launch. Jenna Rivera to send the draft MOU. Revisit revenue share after the first joint webinar.',
    tags: ['partnership', 'brightpath', 'decision'],
    pinned: true,
    starred: false,
    author: MOCK_TEAM[1],
    workspaceId: 'workspace-acme',
    connectionCount: 3,
    createdAt: '2026-05-20T10:00:00.000Z',
    updatedAt: '2026-06-12T11:00:00.000Z',
  },
  {
    id: 'note-product-launch-plan',
    brain: 'TEAM',
    type: 'NOTE',
    title: 'Product Launch Plan',
    body:
      'End-to-end launch runbook for June 30. Owns: eng readiness (David), comms (Lisa), legal sign-off (Tom). Gate: GA candidate must pass the reliability bar before launch comms go out.',
    tags: ['launch', 'runbook', 'product-x'],
    pinned: false,
    starred: true,
    author: MOCK_USER,
    workspaceId: 'workspace-acme',
    connectionCount: 6,
    createdAt: '2026-04-28T09:00:00.000Z',
    updatedAt: '2026-06-15T16:00:00.000Z',
  },
  {
    id: 'note-pricing-research',
    brain: 'COMPANY',
    type: 'RESEARCH',
    title: 'Competitive Pricing Research',
    body:
      'Survey of comparable tools. Most land between $29-$79/seat. Recommendation: anchor at $49 with an annual discount; revisit if Brian Miller pushes on margin.',
    tags: ['pricing', 'research', 'competitive'],
    pinned: false,
    starred: false,
    author: MOCK_TEAM[2],
    workspaceId: 'workspace-acme',
    connectionCount: 2,
    createdAt: '2026-05-10T13:00:00.000Z',
    updatedAt: '2026-06-10T10:00:00.000Z',
  },
  {
    id: 'note-1on1-mike',
    brain: 'MY',
    type: 'JOURNAL',
    title: '1:1 with Mike Wilson',
    body:
      'Mike feels good about beta quality but worried about engineering bandwidth. Agreed to revisit staffing after the support escalation clears.',
    tags: ['1on1', 'team', 'product'],
    pinned: false,
    starred: false,
    author: MOCK_USER,
    workspaceId: 'workspace-acme',
    connectionCount: 2,
    createdAt: '2026-06-09T15:00:00.000Z',
    updatedAt: '2026-06-09T15:30:00.000Z',
  },
  {
    id: 'note-idea-onboarding',
    brain: 'MY',
    type: 'IDEA',
    title: 'Idea: guided onboarding for design partners',
    body: 'A 3-step in-product checklist could cut time-to-value for the first 10 design partners. Worth prototyping.',
    tags: ['idea', 'onboarding', 'product-x'],
    pinned: false,
    starred: false,
    author: MOCK_USER,
    workspaceId: 'workspace-acme',
    connectionCount: 1,
    createdAt: '2026-06-14T08:00:00.000Z',
    updatedAt: '2026-06-14T08:00:00.000Z',
  },
]

/** Connections keyed by noteId — drives the Memory ContextPanel. */
export const MOCK_NOTE_CONNECTIONS: Record<string, NoteConnection[]> = {
  'note-q2-marketing': [
    { id: 'nc-1', noteId: 'note-q2-marketing', entityType: 'PERSON', entityId: 'contact-brian-miller', label: 'Brian Miller', autoLinked: true },
    { id: 'nc-2', noteId: 'note-q2-marketing', entityType: 'PERSON', entityId: 'user-lisa-park', label: 'Lisa Park', autoLinked: false },
    { id: 'nc-3', noteId: 'note-q2-marketing', entityType: 'PROJECT', entityId: 'mission-q2-growth', label: 'Q2 Growth Engine', autoLinked: true },
    { id: 'nc-4', noteId: 'note-q2-marketing', entityType: 'MEETING', entityId: 'meeting-lisa-briefing', label: 'Q2 Campaign Review', autoLinked: true },
    { id: 'nc-5', noteId: 'note-q2-marketing', entityType: 'NOTE', entityId: 'note-pricing-research', label: 'Competitive Pricing Research', autoLinked: true },
  ],
  'note-acme-partnership': [
    { id: 'nc-6', noteId: 'note-acme-partnership', entityType: 'PERSON', entityId: 'contact-jenna-rivera', label: 'Jenna Rivera', autoLinked: true },
    { id: 'nc-7', noteId: 'note-acme-partnership', entityType: 'COMPANY', entityId: 'company-brightpath', label: 'BrightPath', autoLinked: true },
    { id: 'nc-8', noteId: 'note-acme-partnership', entityType: 'PROJECT', entityId: 'mission-launch-product-x', label: 'Launch Product X', autoLinked: false },
  ],
  'note-product-launch-plan': [
    { id: 'nc-9', noteId: 'note-product-launch-plan', entityType: 'PROJECT', entityId: 'mission-launch-product-x', label: 'Launch Product X', autoLinked: true },
    { id: 'nc-10', noteId: 'note-product-launch-plan', entityType: 'PERSON', entityId: 'user-david-kim', label: 'David Kim', autoLinked: false },
    { id: 'nc-11', noteId: 'note-product-launch-plan', entityType: 'PERSON', entityId: 'user-lisa-park', label: 'Lisa Park', autoLinked: false },
    { id: 'nc-12', noteId: 'note-product-launch-plan', entityType: 'PERSON', entityId: 'contact-tom-becker', label: 'Tom Becker', autoLinked: true },
    { id: 'nc-13', noteId: 'note-product-launch-plan', entityType: 'TASK', entityId: 'task-ga-candidate', label: 'GA candidate sign-off', autoLinked: true },
    { id: 'nc-14', noteId: 'note-product-launch-plan', entityType: 'MEETING', entityId: 'meeting-launch-sync', label: 'Launch Sync', autoLinked: true },
  ],
  'note-pricing-research': [
    { id: 'nc-15', noteId: 'note-pricing-research', entityType: 'PERSON', entityId: 'contact-brian-miller', label: 'Brian Miller', autoLinked: true },
    { id: 'nc-16', noteId: 'note-pricing-research', entityType: 'NOTE', entityId: 'note-q2-marketing', label: 'Q2 Marketing Strategy', autoLinked: true },
  ],
  'note-1on1-mike': [
    { id: 'nc-17', noteId: 'note-1on1-mike', entityType: 'PERSON', entityId: 'contact-mike-wilson', label: 'Mike Wilson', autoLinked: true },
    { id: 'nc-18', noteId: 'note-1on1-mike', entityType: 'PROJECT', entityId: 'mission-launch-product-x', label: 'Launch Product X', autoLinked: true },
  ],
  'note-idea-onboarding': [
    { id: 'nc-19', noteId: 'note-idea-onboarding', entityType: 'PROJECT', entityId: 'mission-launch-product-x', label: 'Launch Product X', autoLinked: true },
  ],
}

export const MOCK_VOICE_NOTES: VoiceNote[] = [
  {
    id: 'voice-1',
    audioUrl: null,
    transcription:
      'Reminder to follow up with Brian on the pricing concern before the next board update. Also confirm the legal review timeline with Tom.',
    durationSec: 42,
    noteId: null,
    author: MOCK_USER,
    createdAt: '2026-06-16T18:00:00.000Z',
    updatedAt: '2026-06-16T18:00:00.000Z',
  },
]

// ----------------------------------------------------------------------------
// Daily Brief
// ----------------------------------------------------------------------------

export const MOCK_STATS: StatTileData[] = [
  { id: 'stat-priorities', value: 3, label: 'Priorities', sublabel: 'Top focus today', icon: 'target', tone: 'primary' },
  { id: 'stat-meetings', value: 2, label: 'Meetings', sublabel: 'Next at 6:00 PM', icon: 'calendar', tone: 'blue' },
  { id: 'stat-tasks', value: 5, label: 'Tasks', sublabel: 'Due today', icon: 'check-square', tone: 'default' },
  { id: 'stat-at-risk', value: 1, label: 'At Risk', sublabel: 'Legal review', icon: 'alert-triangle', tone: 'red' },
]

/** Lisa's briefing lines with inline emphasis (purple / red). */
export const MOCK_BRIEFING_LINES: BriefingLine[] = [
  [
    { text: 'Lisa flagged that ' },
    { text: 'Brian Miller has not responded', emphasis: 'red' },
    { text: ' to your pricing follow-up from 4 days ago.' },
  ],
  [
    { text: 'The ' },
    { text: 'Q2 campaign is tracking 18% above target', emphasis: 'primary' },
    { text: ' on qualified pipeline — strong momentum into launch.' },
  ],
  [
    { text: 'Legal review on ' },
    { text: 'Launch Product X', emphasis: 'primary' },
    { text: ' is the one ' },
    { text: 'item at risk', emphasis: 'red' },
    { text: '. Lisa raised concerns about the timeline.' },
  ],
]

export const MOCK_PRIORITIES: Priority[] = [
  {
    id: 'prio-1',
    title: 'Respond to Brian Miller on pricing',
    detail: 'No response in 4 days — pricing concern is blocking the board update.',
    priority: 'URGENT',
    dueDate: '2026-06-18T17:00:00.000Z',
    tone: 'red',
  },
  {
    id: 'prio-2',
    title: 'Unblock legal review for Product X',
    detail: 'Compliance review at 45%; engage outside counsel.',
    priority: 'HIGH',
    dueDate: '2026-06-19T17:00:00.000Z',
    tone: 'amber',
  },
  {
    id: 'prio-3',
    title: 'Approve Q2 launch comms calendar',
    detail: 'Lisa Park needs sign-off to lock launch-week sequence.',
    priority: 'MEDIUM',
    dueDate: '2026-06-18T22:00:00.000Z',
    tone: 'primary',
  },
]

export const MOCK_MEETINGS: MeetingItem[] = [
  {
    id: 'meeting-lisa-briefing',
    title: 'Q2 Campaign Review with Lisa Park',
    startTime: '2026-06-18T18:00:00.000Z',
    endTime: '2026-06-18T18:30:00.000Z',
    location: 'Zoom',
    attendees: [MOCK_USER, MOCK_TEAM[2]],
    prepNote: 'Campaign is 18% above target. Decide whether to commit the launch-week sequence now.',
  },
  {
    id: 'meeting-launch-sync',
    title: 'Launch Sync (Eng + Legal)',
    startTime: '2026-06-18T20:00:00.000Z',
    endTime: '2026-06-18T20:45:00.000Z',
    location: 'War Room',
    attendees: [MOCK_USER, MOCK_TEAM[3], MOCK_PEOPLE[3] as unknown as UserRef],
    prepNote: 'Resolve the legal review timeline before GA candidate.',
  },
]

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'act-1', actor: 'Mike Wilson', description: 'Mike Wilson commented on Product Launch Plan', type: 'COMMENTED', entityType: 'note', entityId: 'note-product-launch-plan', timestamp: '2026-06-17T08:40:00.000Z' },
  { id: 'act-2', actor: 'Lisa Park', description: 'Lisa Park updated the Q2 Marketing Strategy', type: 'UPDATED', entityType: 'note', entityId: 'note-q2-marketing', timestamp: '2026-06-16T17:30:00.000Z', tone: 'primary' },
  { id: 'act-3', actor: 'David Kim', description: 'David Kim moved "Beta bug burn-down" to In Review', type: 'UPDATED', entityType: 'task', entityId: 'task-beta-burndown', timestamp: '2026-06-16T15:10:00.000Z' },
  { id: 'act-4', actor: 'Lisa', description: 'Lisa flagged Legal review as a HIGH risk on Launch Product X', type: 'CREATED', entityType: 'risk', entityId: 'risk-1', timestamp: '2026-06-16T09:00:00.000Z', tone: 'red' },
  { id: 'act-5', actor: 'Tom Becker', description: 'Tom Becker requested outside counsel on contract terms', type: 'COMMENTED', entityType: 'mission', entityId: 'mission-launch-product-x', timestamp: '2026-06-15T14:20:00.000Z', tone: 'amber' },
]

export const MOCK_QUICK_ACTIONS: QuickAction[] = [
  { id: 'qa-1', label: 'New Note', icon: 'file-plus', href: '/memory' },
  { id: 'qa-2', label: 'New Mission', icon: 'target', href: '/missions' },
  { id: 'qa-3', label: 'Ask Lisa', icon: 'sparkles' },
  { id: 'qa-4', label: 'Schedule Meeting', icon: 'calendar-plus', href: '/calendar' },
]

export const MOCK_INSIGHT: LisaInsight = {
  id: 'insight-1',
  title: 'Insight of the Day',
  body: "You have not heard back from Brian Miller in 4 days, and his pricing concern overlaps with the Q2 campaign messaging. Closing this loop before Thursday's board update would remove your biggest open question.",
  cta: { label: 'Prepare me for Brian', href: '/people/contact-brian-miller' },
  tone: 'primary',
}

export const MOCK_DAILY_BRIEF: DailyBrief = {
  user: MOCK_USER,
  date: '2026-06-18T00:00:00.000Z',
  greeting: 'Good morning',
  stats: MOCK_STATS,
  briefingLines: MOCK_BRIEFING_LINES,
  mission: MOCK_MISSION,
  priorities: MOCK_PRIORITIES,
  meetings: MOCK_MEETINGS,
  activity: MOCK_ACTIVITY,
  quickActions: MOCK_QUICK_ACTIONS,
  insight: MOCK_INSIGHT,
}

// ----------------------------------------------------------------------------
// Relationships
// ----------------------------------------------------------------------------

const BRIAN_INTERACTIONS: InteractionItem[] = [
  { id: 'int-1', kind: 'EMAIL', title: 'Pricing follow-up (awaiting reply)', summary: 'Sent pricing rationale; no response in 4 days.', date: '2026-06-14T16:00:00.000Z', tone: 'red' },
  { id: 'int-2', kind: 'MEETING', title: 'Q2 Board Prep', summary: 'Reviewed pipeline and runway. Brian flagged pricing/margin concerns.', date: '2026-06-05T17:00:00.000Z', tone: 'amber' },
  { id: 'int-3', kind: 'NOTE', title: 'Competitive Pricing Research linked', summary: 'Pricing research note references Brian’s concern.', date: '2026-05-10T13:00:00.000Z' },
  { id: 'int-4', kind: 'CALL', title: 'Intro call — Summit Ventures', summary: 'Initial investment conversation; strong interest in Product X.', date: '2026-03-02T18:00:00.000Z', tone: 'green' },
]

export const MOCK_RELATIONSHIP_PROFILES: Record<string, RelationshipProfile> = {
  'contact-brian-miller': {
    person: MOCK_PEOPLE[0],
    strength: 68,
    lastInteraction: '2026-06-14T16:00:00.000Z',
    stats: { meetings: 4, messages: 11, calls: 2, notes: 2, tasks: 1, files: 3 },
    recentInteractions: BRIAN_INTERACTIONS,
    openItems: [
      'Awaiting reply to the pricing follow-up (4 days)',
      'Pricing/margin concern raised at board prep is unresolved',
      'Needs the updated Q2 pipeline deck before Thursday',
    ],
    sharedNotes: [MOCK_NOTES[0], MOCK_NOTES[3]],
    missions: [{ id: 'mission-launch-product-x', name: 'Launch Product X' }],
  },
  'contact-mike-wilson': {
    person: MOCK_PEOPLE[1],
    strength: 84,
    lastInteraction: '2026-06-17T08:40:00.000Z',
    stats: { meetings: 12, messages: 48, calls: 5, notes: 3, tasks: 9, files: 6 },
    recentInteractions: [
      { id: 'int-m1', kind: 'NOTE', title: 'Commented on Product Launch Plan', date: '2026-06-17T08:40:00.000Z' },
      { id: 'int-m2', kind: 'MEETING', title: '1:1 with Mike Wilson', summary: 'Discussed beta quality and engineering bandwidth.', date: '2026-06-09T15:00:00.000Z' },
      { id: 'int-m3', kind: 'TASK', title: 'Assigned "Beta bug burn-down"', date: '2026-06-04T10:00:00.000Z' },
    ],
    openItems: ['Revisit engineering staffing after support escalation clears'],
    sharedNotes: [MOCK_NOTES[2], MOCK_NOTES[4]],
    missions: [{ id: 'mission-launch-product-x', name: 'Launch Product X' }],
  },
}

export const MOCK_RELATIONSHIP_BRIEFS: Record<string, RelationshipBrief> = {
  'contact-brian-miller': {
    contactId: 'contact-brian-miller',
    personName: 'Brian Miller',
    summary:
      'Brian is your lead investor at Summit Ventures and is engaged but currently quiet — he has not replied to your pricing follow-up in 4 days, and the underlying margin concern he raised at board prep is still open. He is supportive of Product X overall.',
    openItems: [
      'No reply to the pricing follow-up (sent 4 days ago)',
      'Margin/pricing concern from Q2 Board Prep is unresolved',
      'Owes a reaction to the updated Q2 pipeline numbers',
    ],
    recentInteractions: [
      'Jun 14 — Sent pricing rationale email (no reply yet)',
      'Jun 5 — Q2 Board Prep, flagged pricing/margin',
      'Mar 2 — Intro call, strong interest in Product X',
    ],
    risks: [
      'Silence may signal unresolved doubt on pricing strategy',
      'Pricing concern overlaps with the Q2 campaign messaging you are about to lock',
    ],
    opportunities: [
      'Q2 campaign is 18% above target — share it to rebuild confidence',
      'A crisp pricing one-pager could convert his concern into an endorsement',
    ],
    talkingPoints: [
      'Lead with the 18%-above-target pipeline result',
      'Walk through the $49 anchor and annual-discount rationale',
      'Ask directly what would make him comfortable on margin',
    ],
    generatedAt: NOW,
    isMock: true,
  },
}

// ----------------------------------------------------------------------------
// Simple getters (used by API mock fallback + page agents)
// ----------------------------------------------------------------------------

export function getMockNotes(filter?: { brain?: string; type?: string; pinned?: boolean; q?: string }): Note[] {
  let notes = [...MOCK_NOTES]
  if (filter?.brain) notes = notes.filter((n) => n.brain === filter.brain)
  if (filter?.type) notes = notes.filter((n) => n.type === filter.type)
  if (filter?.pinned !== undefined) notes = notes.filter((n) => n.pinned === filter.pinned)
  if (filter?.q) {
    const q = filter.q.toLowerCase()
    notes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.body || '').toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }
  return notes
}

export function getMockNote(id: string): Note | undefined {
  const note = MOCK_NOTES.find((n) => n.id === id)
  if (!note) return undefined
  return { ...note, connections: MOCK_NOTE_CONNECTIONS[id] || [] }
}

export function getMockNoteConnections(id: string): NoteConnection[] {
  return MOCK_NOTE_CONNECTIONS[id] || []
}

/** Full-text-ish search across notes for /api/memory/search. */
export function searchMock(q: string): { notes: Note[]; people: Person[]; missions: Mission[] } {
  const query = (q || '').toLowerCase().trim()
  if (!query) return { notes: [], people: [], missions: [] }
  return {
    notes: getMockNotes({ q: query }),
    people: MOCK_PEOPLE.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.company || '').toLowerCase().includes(query) ||
        (p.title || '').toLowerCase().includes(query),
    ),
    missions: MOCK_MISSIONS.filter(
      (m) => m.name.toLowerCase().includes(query) || (m.description || '').toLowerCase().includes(query),
    ),
  }
}

export function getMockMissions(filter?: { status?: string }): Mission[] {
  let missions = [...MOCK_MISSIONS]
  if (filter?.status) missions = missions.filter((m) => m.status === filter.status)
  return missions
}

export function getMockMission(id: string): Mission | undefined {
  return MOCK_MISSIONS.find((m) => m.id === id)
}

export function getMockRelationshipProfile(contactId: string): RelationshipProfile | undefined {
  return MOCK_RELATIONSHIP_PROFILES[contactId]
}

export function getMockRelationshipBrief(contactId: string): RelationshipBrief {
  return (
    MOCK_RELATIONSHIP_BRIEFS[contactId] || {
      contactId,
      personName: MOCK_PEOPLE.find((p) => p.id === contactId)?.name || 'this person',
      summary:
        'Not enough recent signal to build a deep brief yet. Based on what is on file, keep the relationship warm and confirm any open items before your next interaction.',
      openItems: ['Confirm current priorities', 'Check for any unanswered messages'],
      recentInteractions: [],
      risks: ['Limited recent contact may mean drift'],
      opportunities: ['A quick check-in could re-establish momentum'],
      talkingPoints: ['Ask what is top of mind right now', 'Offer a relevant update from your side'],
      generatedAt: new Date().toISOString(),
      isMock: true,
    }
  )
}

export function getMockDailyBrief(): DailyBrief {
  return MOCK_DAILY_BRIEF
}
