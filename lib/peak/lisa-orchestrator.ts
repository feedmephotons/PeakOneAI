/**
 * Peak One — Lisa Orchestrator (the "Operator architecture").
 *
 * Vision: Lisa is not a single chat model — she is an *orchestrator* that routes
 * a user's intent to a pluggable "operator". Each operator is a self-contained
 * module that owns one end-to-end workflow (meetings, email, CRM, research, …).
 *
 * This file is the architecture seam for the future "P1 Operators". Today it
 * ships:
 *   - a typed `PeakOperator` interface every operator implements,
 *   - an `OperatorRegistry` that operators register into,
 *   - intent parsing + routing (`Lisa.route` / `Lisa.run`),
 *   - a fully-typed (stubbed) `MeetingOperator` that returns a structured plan:
 *     record → transcribe → summarize → create tasks → update CRM → follow-ups.
 *
 * Nothing here calls a model yet — `run()` returns a *plan* of typed steps so the
 * UI can show "here's what I'd do" and a real implementation can slot in later
 * without changing callers.
 */

// ============================================================================
// Intent
// ============================================================================

/** Coarse intent categories Lisa knows how to route. */
export type PeakIntentKind =
  | 'chat'        // plain conversation — falls through to the chat model
  | 'meeting'     // "summarize my last meeting", "record this call", …
  | 'memory'      // "what do I know about X" — search the brain
  | 'relationship'// "prepare me for Brian" — relationship brief
  | 'mission'     // "spin up a mission for …"
  | 'email'       // "draft a follow-up to …"
  | 'unknown'

/** A parsed user intent handed to operators. */
export interface PeakIntent {
  kind: PeakIntentKind
  /** The raw user utterance. */
  text: string
  /** Lightweight extracted entities (best-effort, no model required). */
  entities?: {
    person?: string
    topic?: string
    [key: string]: string | undefined
  }
  /** 0–1 confidence in the `kind` classification. */
  confidence: number
}

// ============================================================================
// Operator contract
// ============================================================================

/** Status of a single planned step. */
export type OperatorStepStatus = 'pending' | 'running' | 'done' | 'skipped' | 'failed'

/** One step inside an operator's plan (typed, serializable). */
export interface OperatorStep {
  id: string
  label: string
  description?: string
  status: OperatorStepStatus
  /** Optional structured output produced by this step (stub: empty). */
  output?: Record<string, unknown>
}

/** The structured result an operator returns from `run()`. */
export interface OperatorResult {
  operatorId: string
  /** Human summary of what the operator did / would do. */
  summary: string
  /** The ordered plan of steps. */
  steps: OperatorStep[]
  /** True when this is a stubbed/dry-run plan, not a real execution. */
  dryRun: boolean
  /** Anything follow-on the UI might surface (created task ids, draft ids…). */
  artifacts?: Record<string, unknown>
}

/** Context passed to an operator when Lisa runs it. */
export interface OperatorContext {
  intent: PeakIntent
  /** Current user, if known. */
  user?: { id?: string; name?: string }
  /** Free-form params from the caller (e.g. a meetingId). */
  params?: Record<string, unknown>
  /** Emit progress while running (real operators will stream steps). */
  onStep?: (step: OperatorStep) => void
}

/**
 * The pluggable operator interface. Implement this and register it to extend
 * what Lisa can *do* (not just say). Operators are modules; Lisa is the router.
 */
export interface PeakOperator {
  /** Stable id, e.g. 'meeting'. */
  id: string
  /** Display name, e.g. 'Meeting Operator'. */
  name: string
  /** One-line description for the "Operators" affordance. */
  description: string
  /** Availability — drives the available/coming-soon UI. */
  status: 'available' | 'coming-soon'
  /** Does this operator want to handle the given intent? */
  canHandle(intent: PeakIntent): boolean
  /** Execute (or, while stubbed, plan) the workflow. */
  run(ctx: OperatorContext): Promise<OperatorResult>
}

// ============================================================================
// Registry
// ============================================================================

/** A simple in-memory registry of operators. */
export class OperatorRegistry {
  private operators = new Map<string, PeakOperator>()

  register(operator: PeakOperator): this {
    this.operators.set(operator.id, operator)
    return this
  }

  get(id: string): PeakOperator | undefined {
    return this.operators.get(id)
  }

  all(): PeakOperator[] {
    return Array.from(this.operators.values())
  }

  /** First operator (in registration order) that can handle the intent. */
  find(intent: PeakIntent): PeakOperator | undefined {
    return this.all().find((op) => op.status === 'available' && op.canHandle(intent))
  }
}

// ============================================================================
// Intent parsing (heuristic — model-free, good enough to route)
// ============================================================================

const MEETING_RE = /\b(meeting|call|standup|stand-up|sync|recording|record this|transcribe|transcript)\b/i
const MEMORY_RE = /\b(what do (i|we) know about|search (my )?(memory|brain|notes)|remind me about)\b/i
const RELATIONSHIP_RE = /\b(prepare me for|brief me on|relationship brief|who is)\b/i
const MISSION_RE = /\b(mission|spin up|launch (a )?project|new initiative)\b/i
const EMAIL_RE = /\b(draft (a |an )?(follow.?up|email|reply)|write (an )?email|send (a )?note)\b/i

/** Best-effort person extraction: "prepare me for Brian" → "Brian". */
function extractPerson(text: string): string | undefined {
  const m = text.match(/\b(?:for|with|to|about)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/)
  return m?.[1]
}

/** "what do I know about pricing" → "pricing". */
function extractTopic(text: string): string | undefined {
  const m = text.match(/\babout\s+(.+?)[?.!]*$/i)
  return m?.[1]?.trim()
}

/** Parse a raw utterance into a typed intent. No model call. */
export function parseIntent(text: string): PeakIntent {
  const t = text.trim()

  if (RELATIONSHIP_RE.test(t)) {
    return { kind: 'relationship', text: t, confidence: 0.8, entities: { person: extractPerson(t) } }
  }
  if (MEMORY_RE.test(t)) {
    return { kind: 'memory', text: t, confidence: 0.8, entities: { topic: extractTopic(t) } }
  }
  if (EMAIL_RE.test(t)) {
    return { kind: 'email', text: t, confidence: 0.7, entities: { person: extractPerson(t) } }
  }
  if (MEETING_RE.test(t)) {
    return { kind: 'meeting', text: t, confidence: 0.75 }
  }
  if (MISSION_RE.test(t)) {
    return { kind: 'mission', text: t, confidence: 0.6, entities: { topic: extractTopic(t) } }
  }
  return { kind: 'chat', text: t, confidence: 0.5 }
}

// ============================================================================
// MeetingOperator — typed STUB
// ============================================================================

/**
 * The flagship operator. Records → transcribes → summarizes → creates tasks →
 * updates CRM → schedules follow-ups. Returns a structured plan; the real
 * implementation will replace each step body but keep this exact shape.
 */
export const MeetingOperator: PeakOperator = {
  id: 'meeting',
  name: 'Meeting Operator',
  description: 'Record, transcribe, summarize a meeting, then auto-create tasks, update the CRM, and draft follow-ups.',
  status: 'available',

  canHandle(intent) {
    return intent.kind === 'meeting'
  },

  async run(ctx) {
    const steps: OperatorStep[] = [
      { id: 'record', label: 'Capture recording', description: 'Join the call and capture audio/video.', status: 'pending' },
      { id: 'transcribe', label: 'Transcribe', description: 'Run Gemini native-audio transcription with speaker labels.', status: 'pending' },
      { id: 'summarize', label: 'Summarize', description: 'Produce a structured recap: decisions, blockers, sentiment.', status: 'pending' },
      { id: 'tasks', label: 'Create tasks', description: 'Extract action items and create tasks with owners + due dates.', status: 'pending' },
      { id: 'crm', label: 'Update CRM', description: 'Log the interaction and update contact/deal records.', status: 'pending' },
      { id: 'followups', label: 'Draft follow-ups', description: 'Draft follow-up emails for each attendee for review.', status: 'pending' },
    ]

    // Stub: mark the plan as drafted (pending). A real run would mutate statuses
    // to 'running' → 'done' and emit each via ctx.onStep.
    steps.forEach((s) => ctx.onStep?.(s))

    return {
      operatorId: MeetingOperator.id,
      summary:
        'Meeting Operator is ready. When wired to live data it will record the call, transcribe and summarize it, then create tasks, update the CRM, and draft follow-ups for your review.',
      steps,
      dryRun: true,
      artifacts: {},
    }
  },
}

// ============================================================================
// Coming-soon operators (architecture placeholders for the "Operators" UI)
// ============================================================================

function comingSoon(id: string, name: string, description: string): PeakOperator {
  return {
    id,
    name,
    description,
    status: 'coming-soon',
    canHandle: () => false,
    async run(ctx) {
      return {
        operatorId: id,
        summary: `${name} is coming soon.`,
        steps: [],
        dryRun: true,
        artifacts: { intent: ctx.intent.text },
      }
    },
  }
}

export const EmailOperator = comingSoon(
  'email',
  'Email Operator',
  'Draft, send, and chase follow-up emails grounded in your memory and CRM.',
)

export const ResearchOperator = comingSoon(
  'research',
  'Research Operator',
  'Run multi-source research and file the findings into your Company Brain.',
)

export const MissionOperator = comingSoon(
  'mission',
  'Mission Operator',
  'Spin up a mission with objectives, milestones, and risks from a one-line goal.',
)

// ============================================================================
// Lisa — the orchestrator facade
// ============================================================================

/** Lightweight metadata about an operator, for the "Operators" affordance. */
export interface OperatorInfo {
  id: string
  name: string
  description: string
  status: PeakOperator['status']
}

/**
 * The orchestrator. Parses intent, finds an operator, runs it. Plain chat
 * intents return `null` so the caller falls through to the existing
 * `/api/ai/chat` streaming model — the orchestrator never breaks chat.
 */
export class LisaOrchestrator {
  readonly registry: OperatorRegistry

  constructor(registry?: OperatorRegistry) {
    this.registry = registry ?? defaultRegistry()
  }

  /** Parse + match — returns the chosen operator (or undefined) without running. */
  route(text: string): { intent: PeakIntent; operator?: PeakOperator } {
    const intent = parseIntent(text)
    const operator = intent.kind === 'chat' ? undefined : this.registry.find(intent)
    return { intent, operator }
  }

  /**
   * Run the matching operator. Returns `null` when no operator applies (chat),
   * signalling the caller to use the normal streaming chat path.
   */
  async run(
    text: string,
    ctx?: Omit<OperatorContext, 'intent'>,
  ): Promise<OperatorResult | null> {
    const { intent, operator } = this.route(text)
    if (!operator) return null
    return operator.run({ ...ctx, intent })
  }

  /** Operators for the UI affordance (available first, then coming-soon). */
  listOperators(): OperatorInfo[] {
    return this.registry
      .all()
      .map((o) => ({ id: o.id, name: o.name, description: o.description, status: o.status }))
      .sort((a, b) => (a.status === b.status ? 0 : a.status === 'available' ? -1 : 1))
  }
}

/** Build the default registry with the shipped + coming-soon operators. */
export function defaultRegistry(): OperatorRegistry {
  return new OperatorRegistry()
    .register(MeetingOperator)
    .register(EmailOperator)
    .register(ResearchOperator)
    .register(MissionOperator)
}

/** A shared default orchestrator instance for convenience. */
export const lisa = new LisaOrchestrator()
