/**
 * Peak One — Create Studio company context assembler.
 *
 * "What P1 knows about the company." This compiles a compact grounding object
 * (and a string rendering of it) from the mock fixtures so the generator can
 * produce documents that are dramatically better than starting from scratch —
 * they reference the real company, people, missions, metrics and notes.
 *
 * Pure / SSR-safe. No Date.now(), no Math.random().
 */

import {
  MOCK_USER,
  MOCK_TEAM,
  MOCK_PEOPLE,
  MOCK_MISSION,
  MOCK_MISSIONS,
  MOCK_STATS,
  MOCK_DAILY_BRIEF,
  MOCK_MEETINGS,
  MOCK_NOTES,
  MOCK_PRIORITIES,
} from './mock'

/** The structured grounding object handed to the generator. */
export interface CompanyContext {
  company: string
  user: { name: string; role: string; email: string }
  team: Array<{ name: string; role: string }>
  people: Array<{ name: string; company: string; title: string; favorite: boolean }>
  missions: Array<{
    name: string
    status: string
    progress: number
    healthScore: number
    targetDate: string
    budgetUsed: number
    budgetTotal: number
  }>
  primaryMission: {
    name: string
    description: string
    progress: number
    objectives: string[]
    risks: string[]
  }
  stats: Array<{ label: string; value: string; sublabel: string }>
  priorities: Array<{ title: string; detail: string; priority: string }>
  meetings: Array<{ title: string; when: string; prep: string }>
  notes: Array<{ title: string; type: string; summary: string; tags: string[] }>
  /** Lisa's daily briefing flattened to plain sentences. */
  briefing: string[]
  /** A human-readable list of the data sources used — feeds DocMeta.sourceContext. */
  sourceContext: string[]
}

/** Derive the company name from the user's email domain or people list. */
function deriveCompany(): string {
  const fromEmail = MOCK_USER.email?.split('@')[1]
  if (fromEmail) {
    // acmecorp.com -> Acme Corp
    if (fromEmail.startsWith('acmecorp')) return 'Acme Corp'
  }
  const owned = MOCK_PEOPLE.find((p) => p.company && p.company !== 'Summit Ventures' && p.company !== 'BrightPath')
  return owned?.company || 'Acme Corp'
}

/** Flatten Lisa's briefing lines (segmented with emphasis) into plain sentences. */
function flattenBriefing(): string[] {
  return MOCK_DAILY_BRIEF.briefingLines.map((line) =>
    line.map((seg) => seg.text).join('').replace(/\s+/g, ' ').trim(),
  )
}

/** Build the structured company context from P1's stored knowledge. */
export function getCompanyContext(): CompanyContext {
  const company = deriveCompany()

  return {
    company,
    user: { name: MOCK_USER.name, role: MOCK_USER.role || 'Founder & CEO', email: MOCK_USER.email || '' },
    team: MOCK_TEAM.filter((t) => t.id !== MOCK_USER.id).map((t) => ({
      name: t.name,
      role: t.role || 'Team member',
    })),
    people: MOCK_PEOPLE.map((p) => ({
      name: p.name,
      company: p.company || '',
      title: p.title || '',
      favorite: !!p.favorite,
    })),
    missions: MOCK_MISSIONS.map((m) => ({
      name: m.name,
      status: m.status,
      progress: m.progress,
      healthScore: m.healthScore ?? 0,
      targetDate: m.targetDate || '',
      budgetUsed: m.budgetUsed ?? 0,
      budgetTotal: m.budgetTotal ?? 0,
    })),
    primaryMission: {
      name: MOCK_MISSION.name,
      description: MOCK_MISSION.description || '',
      progress: MOCK_MISSION.progress,
      objectives: (MOCK_MISSION.objectives || []).map(
        (o) => `${o.title} — ${o.progress}% (${o.status})`,
      ),
      risks: (MOCK_MISSION.risks || []).map(
        (r) => `${r.title} [${r.level}]: ${r.impact}`,
      ),
    },
    stats: MOCK_STATS.map((s) => ({
      label: s.label,
      value: String(s.value),
      sublabel: s.sublabel || '',
    })),
    priorities: MOCK_PRIORITIES.map((p) => ({
      title: p.title,
      detail: p.detail || '',
      priority: p.priority,
    })),
    meetings: MOCK_MEETINGS.map((m) => ({
      title: m.title,
      when: m.startTime || '',
      prep: m.prepNote || '',
    })),
    notes: MOCK_NOTES.map((n) => ({
      title: n.title,
      type: n.type,
      summary: (n.body || '').replace(/[#*`>]/g, '').replace(/\s+/g, ' ').slice(0, 220).trim(),
      tags: n.tags,
    })),
    briefing: flattenBriefing(),
    sourceContext: [
      `${company} company profile`,
      `${MOCK_USER.name} (${MOCK_USER.role})`,
      `${MOCK_MISSIONS.length} missions incl. "${MOCK_MISSION.name}" at ${MOCK_MISSION.progress}%`,
      `${MOCK_NOTES.length} Memory notes`,
      `${MOCK_MEETINGS.length} upcoming meetings`,
      `${MOCK_PEOPLE.length} CRM contacts`,
      `${MOCK_PRIORITIES.length} active priorities`,
    ],
  }
}

/**
 * Compile the company context into a compact grounding string suitable for a
 * system / user prompt. Deterministic — safe for SSR and snapshotting.
 */
export function assembleCompanyContext(): string {
  const ctx = getCompanyContext()
  const lines: string[] = []

  lines.push(`COMPANY: ${ctx.company}`)
  lines.push(`PRIMARY USER: ${ctx.user.name}, ${ctx.user.role} (${ctx.user.email})`)
  lines.push('')

  lines.push('TEAM:')
  ctx.team.forEach((t) => lines.push(`  - ${t.name} — ${t.role}`))
  lines.push('')

  lines.push('KEY RELATIONSHIPS / CRM:')
  ctx.people.forEach((p) =>
    lines.push(`  - ${p.name}${p.title ? `, ${p.title}` : ''}${p.company ? ` @ ${p.company}` : ''}`),
  )
  lines.push('')

  lines.push('MISSIONS:')
  ctx.missions.forEach((m) =>
    lines.push(
      `  - ${m.name}: ${m.status}, ${m.progress}% complete, health ${m.healthScore}, ` +
        `budget $${m.budgetUsed.toLocaleString()}/$${m.budgetTotal.toLocaleString()}, target ${m.targetDate.slice(0, 10)}`,
    ),
  )
  lines.push('')

  lines.push(`PRIMARY MISSION — ${ctx.primaryMission.name} (${ctx.primaryMission.progress}%):`)
  lines.push(`  ${ctx.primaryMission.description}`)
  lines.push('  Objectives:')
  ctx.primaryMission.objectives.forEach((o) => lines.push(`    • ${o}`))
  lines.push('  Risks:')
  ctx.primaryMission.risks.forEach((r) => lines.push(`    • ${r}`))
  lines.push('')

  lines.push('TODAY (Daily Brief stats):')
  ctx.stats.forEach((s) => lines.push(`  - ${s.label}: ${s.value} (${s.sublabel})`))
  lines.push('')

  lines.push("LISA'S BRIEFING:")
  ctx.briefing.forEach((b) => lines.push(`  - ${b}`))
  lines.push('')

  lines.push('ACTIVE PRIORITIES:')
  ctx.priorities.forEach((p) => lines.push(`  - [${p.priority}] ${p.title} — ${p.detail}`))
  lines.push('')

  lines.push('UPCOMING MEETINGS:')
  ctx.meetings.forEach((m) =>
    lines.push(`  - ${m.title} (${m.when.slice(0, 16).replace('T', ' ')}) — ${m.prep}`),
  )
  lines.push('')

  lines.push('MEMORY / NOTES:')
  ctx.notes.forEach((n) => lines.push(`  - [${n.type}] ${n.title}: ${n.summary} (tags: ${n.tags.join(', ')})`))

  return lines.join('\n')
}
