/**
 * Peak One — shared TypeScript types for the Phase 2 "Operating System" redesign.
 *
 * These are the contract between the data-layer (Prisma models, API routes, mock
 * fixtures) and the page agents (Daily Brief, Memory, Missions, Relationships, Lisa).
 *
 * They are intentionally plain/serializable (dates as ISO strings) so they survive
 * a JSON round-trip through the API routes and render identically with or without
 * a live database.
 */

// ============================================================================
// Primitives / shared
// ============================================================================

export type ID = string
export type ISODate = string

/** A lightweight reference to a user — used for authors, owners, members. */
export interface UserRef {
  id: ID
  name: string
  email?: string
  avatarUrl?: string | null
  role?: string
}

/** Status accent tone used by stat tiles, rings, badges. Maps to the design tokens. */
export type Tone = 'default' | 'primary' | 'green' | 'amber' | 'red' | 'blue'

// ============================================================================
// Memory — Notes & connections
// ============================================================================

export type NoteBrain = 'MY' | 'TEAM' | 'COMPANY'

export type NoteType =
  | 'NOTE'
  | 'JOURNAL'
  | 'RESEARCH'
  | 'VOICE'
  | 'IDEA'
  | 'DRAFT'
  | 'DECISION'
  | 'BOOKMARK'

export type NoteEntityType =
  | 'PERSON'
  | 'COMPANY'
  | 'PROJECT'
  | 'MEETING'
  | 'TASK'
  | 'NOTE'

export interface Note {
  id: ID
  brain: NoteBrain
  type: NoteType
  title: string
  body?: string | null
  tags: string[]
  pinned: boolean
  starred: boolean
  author?: UserRef
  workspaceId?: ID
  /** Hydrated connections, when included. */
  connections?: NoteConnection[]
  /** Convenience count when connections are not fully hydrated. */
  connectionCount?: number
  createdAt: ISODate
  updatedAt: ISODate
}

export interface NoteConnection {
  id: ID
  noteId: ID
  entityType: NoteEntityType
  entityId: ID
  /** Cached display label for the linked entity (person name, project name, etc.). */
  label?: string | null
  autoLinked: boolean
  createdAt?: ISODate
}

export interface VoiceNote {
  id: ID
  audioUrl?: string | null
  transcription?: string | null
  durationSec?: number | null
  noteId?: ID | null
  author?: UserRef
  createdAt: ISODate
  updatedAt: ISODate
}

/** Input shape for creating/updating a note. */
export interface NoteInput {
  brain?: NoteBrain
  type?: NoteType
  title: string
  body?: string | null
  tags?: string[]
  pinned?: boolean
  starred?: boolean
}

/** Grouped context for the Memory right-rail ContextPanel ("Related to this note"). */
export interface NoteContext {
  people: NoteConnection[]
  companies: NoteConnection[]
  projects: NoteConnection[]
  meetings: NoteConnection[]
  tasks: NoteConnection[]
  notes: NoteConnection[]
}

// ============================================================================
// Missions — Mission Control
// ============================================================================

export type MissionStatus = 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED'
export type MilestoneState = 'DONE' | 'ACTIVE' | 'UPCOMING'
export type RiskLevel = 'HIGH' | 'MED' | 'LOW'

export interface MissionObjective {
  id: ID
  missionId?: ID
  title: string
  progress: number // 0-100
  status: MissionStatus
  position?: number
}

export interface MissionMilestone {
  id: ID
  missionId?: ID
  label: string
  date?: ISODate | null
  state: MilestoneState
  position?: number
}

export interface MissionRisk {
  id: ID
  missionId?: ID
  title: string
  level: RiskLevel
  impact?: string | null
  probability?: string | null
  note?: string | null
}

export interface MissionMember {
  id: ID
  missionId?: ID
  role?: string | null
  user: UserRef
}

export interface Mission {
  id: ID
  name: string
  description?: string | null
  status: MissionStatus
  progress: number // 0-100
  targetDate?: ISODate | null
  budgetUsed?: number | null
  budgetTotal?: number | null
  healthScore?: number | null // 0-100
  velocity?: number | null
  owner?: UserRef
  workspaceId?: ID

  // Hydrated children (optional depending on include depth)
  objectives?: MissionObjective[]
  milestones?: MissionMilestone[]
  risks?: MissionRisk[]
  members?: MissionMember[]

  // Counts for list views
  taskCount?: number
  objectiveCount?: number
  riskCount?: number

  // Board-level metrics + dependencies (KeyMetricsPanel / Dependencies panel)
  keyMetrics?: MissionKeyMetrics
  dependencies?: MissionDependency[]

  createdAt: ISODate
  updatedAt: ISODate
}

/** Input shape for creating/updating a mission. */
export interface MissionInput {
  name: string
  description?: string | null
  status?: MissionStatus
  progress?: number
  targetDate?: ISODate | null
  budgetUsed?: number | null
  budgetTotal?: number | null
  healthScore?: number | null
  velocity?: number | null
  ownerId?: ID
}

/** A single Lisa recommendation shown in the mission right rail. */
export interface MissionRecommendation {
  id: ID
  title: string
  body: string
  tone?: Tone
}

// ============================================================================
// Relationships — Relationship Intelligence
// ============================================================================

/** A person (built on top of the existing Contact model). */
export interface Person {
  id: ID
  name: string
  email?: string | null
  phoneNumber?: string | null
  company?: string | null
  /** Free-form role/title, e.g. "Investor", "VP Eng". */
  title?: string | null
  avatarUrl?: string | null
  favorite?: boolean
}

/** A single recent interaction across any channel (meeting/message/call/note/task/file). */
export interface InteractionItem {
  id: ID
  kind: 'MEETING' | 'MESSAGE' | 'CALL' | 'NOTE' | 'TASK' | 'FILE' | 'EMAIL'
  title: string
  summary?: string
  date: ISODate
  /** Optional sentiment / status accent. */
  tone?: Tone
}

/**
 * The aggregated intelligence profile for a person — joins meetings, messages,
 * calls, tasks, notes, and files. Returned by GET /api/relationships/[contactId].
 */
export interface RelationshipProfile {
  person: Person
  /** Connection strength 0-100, derived from interaction recency + frequency. */
  strength: number
  lastInteraction?: ISODate | null
  stats: {
    meetings: number
    messages: number
    calls: number
    notes: number
    tasks: number
    files: number
  }
  recentInteractions: InteractionItem[]
  openItems: string[]
  sharedNotes: Note[]
  /** Mission ids this person is linked to. */
  missions?: { id: ID; name: string }[]
}

/**
 * The "Relationship Brief" generated by Lisa ("Prepare me for {name}").
 * Returned by POST /api/relationships/[contactId]/brief.
 */
export interface RelationshipBrief {
  contactId: ID
  personName: string
  /** 1-3 sentence executive summary. */
  summary: string
  openItems: string[]
  recentInteractions: string[]
  risks: string[]
  opportunities: string[]
  /** Suggested talking points / next best actions. */
  talkingPoints: string[]
  generatedAt: ISODate
  /** True when produced by the mock fallback rather than a live Gemini call. */
  isMock?: boolean
}

// ============================================================================
// Daily Brief — homepage
// ============================================================================

/** A single top-priority item on the Daily Brief. */
export interface Priority {
  id: ID
  title: string
  detail?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: ISODate | null
  done?: boolean
  tone?: Tone
}

/** A feed entry for the Activity Feed block. */
export interface ActivityItem {
  id: ID
  actor?: string
  /** Human-readable description, e.g. "Mike Wilson commented on Product Launch Plan". */
  description: string
  type?: string
  entityType?: string
  entityId?: ID
  timestamp: ISODate
  tone?: Tone
}

/** An upcoming meeting tile. */
export interface MeetingItem {
  id: ID
  title: string
  startTime: ISODate
  endTime?: ISODate | null
  location?: string | null
  attendees?: UserRef[]
  /** Pre-meeting Lisa note, if any. */
  prepNote?: string
}

/** Emphasis span inside a Lisa briefing line. */
export interface BriefingSpan {
  text: string
  emphasis?: 'primary' | 'red' | 'green' | 'amber'
}

/** A single line in Lisa's briefing card — array of spans for inline emphasis. */
export type BriefingLine = BriefingSpan[]

/** A small "Insight of the Day" / LisaInsight card payload. */
export interface LisaInsight {
  id: ID
  title: string
  body: string
  cta?: { label: string; href?: string }
  tone?: Tone
}

/** A quick-action button on the Daily Brief / pages. */
export interface QuickAction {
  id: ID
  label: string
  icon?: string
  href?: string
}

/** Stat tile for the "Today's Focus" row (3 Priorities / 2 Meetings / 5 Tasks / 1 at risk). */
export interface StatTileData {
  id: ID
  value: number | string
  label: string
  sublabel?: string
  icon?: string
  tone?: Tone
}

/**
 * The full payload for the Daily Brief homepage.
 */
export interface DailyBrief {
  user: UserRef
  date: ISODate
  greeting: string // e.g. "Good morning"
  stats: StatTileData[]
  briefingLines: BriefingLine[]
  mission?: Mission // featured mission (e.g. "Launch Product X" at 72%)
  priorities: Priority[]
  meetings: MeetingItem[]
  activity: ActivityItem[]
  quickActions: QuickAction[]
  insight?: LisaInsight
}

// ============================================================================
// Mission key metrics + dependencies (KeyMetricsPanel / Dependencies)
// ============================================================================

/** Board-level outcome metrics for a mission's KeyMetricsPanel. */
export interface MissionKeyMetrics {
  /** e.g. "$12.4M" — projected revenue impact. */
  revenueImpact: string
  /** e.g. "48K" — customers / users affected. */
  customerImpact: string
  /** e.g. "$120M" — addressable market opportunity. */
  marketOpportunity: string
  /** 0-10 confidence score. */
  confidence: number
  /** Small caption under the hero progress, e.g. "+6% vs last week". */
  deltaCaption?: string
}

/** A cross-mission / cross-team dependency rendered on /missions/[id]. */
export interface MissionDependency {
  id: ID
  label: string
  /** What it blocks or is blocked by. */
  detail?: string
  status: 'BLOCKED' | 'AT_RISK' | 'ON_TRACK' | 'DONE'
  owner?: UserRef
}

// ============================================================================
// Tasks — canonical task board
// ============================================================================

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Task {
  id: ID
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee?: UserRef
  /** TagManager tag IDs (stable, filterable) — e.g. ['tag-launch','tag-eng']. */
  tags: string[]
  dueDate?: ISODate | null
  missionId?: ID | null
  /** Optional mission name cache for list views. */
  missionName?: string | null
  createdAt: ISODate
  updatedAt: ISODate
  completedAt?: ISODate | null
}

/** A canonical TagManager tag definition shared app-wide. */
export interface TaskTag {
  id: ID
  label: string
  color: string
}

// ============================================================================
// Files / Documents
// ============================================================================

export type FileKind = 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image' | 'folder' | 'other'

export interface FileItem {
  id: ID
  name: string
  kind: FileKind
  /** Bytes. */
  size: number
  /** Human readable, e.g. "2.4 MB". */
  sizeLabel: string
  /** MIME-ish, e.g. "application/pdf". */
  mimeType?: string
  owner: UserRef
  /** Inline data: URI or /public asset — never a dead remote host. */
  thumbnailDataUri?: string | null
  /** Mission this file belongs to, if any. */
  missionId?: ID | null
  /** Note this file is derived from, if any. */
  noteId?: ID | null
  /** Lisa AI one-line summary. */
  aiSummary?: string | null
  aiTags?: string[]
  starred?: boolean
  deleted?: boolean
  folderId?: ID | null
  createdAt: ISODate
  updatedAt: ISODate
}

// ============================================================================
// Messages — channels, DMs, group threads
// ============================================================================

export type ThreadKind = 'CHANNEL' | 'DM' | 'GROUP'

export interface ChatMessage {
  id: ID
  threadId: ID
  sender: UserRef
  body: string
  createdAt: ISODate
  /** ids of users who have read this. */
  readBy?: ID[]
}

export interface MessageThread {
  id: ID
  kind: ThreadKind
  /** Channel name ("#product-x") or group title; DMs derive name from members. */
  name: string
  members: UserRef[]
  messages: ChatMessage[]
  unread?: number
  /** Cached last message preview. */
  lastMessage?: string
  lastMessageAt?: ISODate
}

// ============================================================================
// Calls — recents + recordings + transcripts
// ============================================================================

export type CallDirection = 'INBOUND' | 'OUTBOUND' | 'MISSED'

export interface CallTranscriptLine {
  speaker: string
  text: string
  /** Offset like "00:42". */
  at?: string
}

export interface CallRecord {
  id: ID
  title: string
  direction: CallDirection
  participants: UserRef[]
  startTime: ISODate
  durationSec: number
  /** Human readable, e.g. "18m 30s". */
  durationLabel: string
  hasRecording: boolean
  recordingUrl?: string | null
  transcript?: CallTranscriptLine[]
  aiSummary?: string | null
  actionItems?: string[]
  missionId?: ID | null
}

// ============================================================================
// Email — inbox / folders
// ============================================================================

export type EmailFolder = 'inbox' | 'sent' | 'archive' | 'trash' | 'starred'

export interface EmailMessage {
  id: ID
  folder: EmailFolder
  from: UserRef
  to: UserRef[]
  subject: string
  body: string
  /** Plain preview snippet. */
  preview: string
  read: boolean
  starred: boolean
  date: ISODate
  missionId?: ID | null
}

// ============================================================================
// Calendar
// ============================================================================

export type CalendarEventType = 'MEETING' | 'FOCUS' | 'DEADLINE' | 'REMINDER'

export interface CalendarEvent {
  id: ID
  title: string
  type: CalendarEventType
  start: ISODate
  end?: ISODate | null
  location?: string | null
  attendees?: UserRef[]
  /** /video/room/[id] join link for video meetings. */
  joinUrl?: string | null
  /** Back-reference to the source meeting. */
  meetingId?: ID | null
  color?: string
  description?: string
}

// ============================================================================
// Notifications
// ============================================================================

export type NotificationKind = 'MEETING' | 'TASK' | 'MENTION' | 'AI' | 'FILE' | 'CALL' | 'SYSTEM'

export interface NotificationItem {
  id: ID
  kind: NotificationKind
  title: string
  body: string
  /** Avatar source (team/contact). */
  actor?: UserRef
  read: boolean
  /** Deep link, e.g. "/tasks", "/video/room/meeting-launch-sync", "/lisa". */
  actionUrl?: string | null
  timestamp: ISODate
  tone?: Tone
}

// ============================================================================
// Meeting detail (transcripts / summaries / recordings)
// ============================================================================

export interface MeetingDetail extends MeetingItem {
  durationSec?: number
  durationLabel?: string
  transcript?: CallTranscriptLine[]
  aiSummary?: string | null
  actionItems?: string[]
  hasRecording?: boolean
  recordingUrl?: string | null
  missionId?: ID | null
}

// ============================================================================
// Analytics
// ============================================================================

export interface AnalyticsSummary {
  tasksTotal: number
  tasksCompleted: number
  tasksInProgress: number
  tasksOverdue: number
  completionRate: number // 0-100
  /** Avg active missions progress. */
  avgMissionProgress: number
  /** Story points / velocity (sum of mission velocity). */
  velocity: number
  filesCount: number
  meetingsCount: number
  /** 7-day completion series for the productivity chart. */
  weeklyCompleted: { day: string; count: number }[]
  /** Tasks bucketed by priority. */
  byPriority: { priority: string; count: number }[]
  /** Tasks bucketed by assignee. */
  byAssignee: { name: string; count: number }[]
}

// ============================================================================
// Automations
// ============================================================================

export interface AutomationRule {
  id: ID
  name: string
  description: string
  enabled: boolean
  trigger: string
  action: string
  /** e.g. "#product-x" or "email Sarah + Lisa". */
  target: string
  runsCount: number
  lastRun?: ISODate | null
}

// ============================================================================
// Settings — org / billing / identity
// ============================================================================

export interface BillingInvoice {
  id: ID
  date: ISODate
  amount: string
  status: 'PAID' | 'DUE' | 'FAILED'
  url?: string | null
}

export interface OrgIdentity {
  /** User identity. */
  user: UserRef
  company: string
  companySlug: string
  /** Canonical headcount — single source of truth. */
  teamSize: number
  departments: number
  plan: string
  seats: number
  seatsUsed: number
  /** Masked, non-test card. */
  cardBrand: string
  cardLast4: string
  cardExpiry: string
  billingEmail: string
  nextInvoiceDate: ISODate
  invoices: BillingInvoice[]
  /** Stable storage figure (no Math.random). */
  storageUsedGb: number
  storageTotalGb: number
}

/** A seeded brand-voice guideline for /settings/brand-voice. */
export interface BrandVoiceGuideline {
  id: ID
  name: string
  enabled: boolean
  defaultLevel: 'subtle' | 'balanced' | 'strong'
  tone: string[]
  doList: string[]
  dontList: string[]
  sample: string
  createdBy: UserRef
  createdAt: ISODate
  updatedAt: ISODate
}

// ============================================================================
// API envelope helpers
// ============================================================================

/** Standard list response. `source` flags whether data came from the DB or mock. */
export interface ListResponse<T> {
  data: T[]
  source?: 'db' | 'mock'
}

export interface ItemResponse<T> {
  data: T
  source?: 'db' | 'mock'
}
