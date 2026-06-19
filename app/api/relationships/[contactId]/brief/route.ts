import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentOrganization } from '@/lib/auth'
import { generateChatResponse, LISA_SYSTEM_PROMPT } from '@/lib/gemini'
import { getMockRelationshipBrief, getMockRelationshipProfile } from '@/lib/peak/mock'
import type { RelationshipBrief, RelationshipProfile } from '@/lib/peak/types'

interface RouteParams {
  params: Promise<{ contactId: string }>
}

// Build the context string Lisa reasons over for the brief.
function buildContext(profile: RelationshipProfile): string {
  const p = profile.person
  const lines: string[] = [
    `Person: ${p.name}${p.title ? ` (${p.title})` : ''}${p.company ? ` at ${p.company}` : ''}`,
    `Connection strength: ${profile.strength}/100`,
    `Last interaction: ${profile.lastInteraction ?? 'unknown'}`,
    `Interaction counts: ${Object.entries(profile.stats).map(([k, v]) => `${v} ${k}`).join(', ')}`,
  ]
  if (profile.recentInteractions.length) {
    lines.push('Recent interactions:')
    profile.recentInteractions.slice(0, 8).forEach((i) => {
      lines.push(`- [${i.kind}] ${i.title}${i.summary ? ` — ${i.summary}` : ''} (${i.date})`)
    })
  }
  if (profile.sharedNotes.length) {
    lines.push('Linked notes:')
    profile.sharedNotes.slice(0, 6).forEach((n) => lines.push(`- ${n.title}: ${(n.body || '').slice(0, 200)}`))
  }
  if (profile.openItems.length) {
    lines.push('Known open items:')
    profile.openItems.forEach((o) => lines.push(`- ${o}`))
  }
  return lines.join('\n')
}

// POST /api/relationships/[contactId]/brief
// "Prepare me for {name}" — Lisa generates a structured relationship brief.
export async function POST(_request: Request, { params }: RouteParams) {
  const { contactId } = await params

  // 1) Gather the profile (DB, else mock) to feed Lisa.
  let profile: RelationshipProfile | undefined
  try {
    const workspace = await getCurrentOrganization()
    if (workspace) {
      const contact = await prisma.contact.findFirst({ where: { id: contactId, workspaceId: workspace.id } })
      if (contact) {
        // Reuse the mock profile shape but with the real person if we have one;
        // a full DB aggregation is done in the profile route — here we just need
        // enough context for the LLM, so fall back to mock context if sparse.
        profile = getMockRelationshipProfile(contactId) ?? {
          person: {
            id: contact.id,
            name: contact.name,
            email: contact.email,
            phoneNumber: contact.phoneNumber,
            company: contact.company,
          },
          strength: 50,
          lastInteraction: null,
          stats: { meetings: 0, messages: 0, calls: 0, notes: 0, tasks: 0, files: 0 },
          recentInteractions: [],
          openItems: [],
          sharedNotes: [],
        }
      }
    }
  } catch (error) {
    console.warn('[Relationship brief] profile lookup failed:', (error as Error).message)
  }
  if (!profile) profile = getMockRelationshipProfile(contactId)

  // 2) Try Gemini. If no key / failure / unparseable, fall back to the mock brief.
  if (profile && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `${LISA_SYSTEM_PROMPT}

You are preparing the user for an interaction with ${profile.person.name}. Using the context below, produce a relationship brief.

Respond with STRICT JSON only, matching this exact shape:
{
  "summary": string,            // 1-3 sentences
  "openItems": string[],        // unresolved items / things owed
  "recentInteractions": string[],// short bullets of recent touchpoints
  "risks": string[],            // relationship risks to be aware of
  "opportunities": string[],    // opportunities to advance the relationship
  "talkingPoints": string[]     // suggested next-best talking points
}

CONTEXT:
${buildContext(profile)}`

      const raw = await generateChatResponse(prompt, LISA_SYSTEM_PROMPT, { responseFormat: 'json', temperature: 0.6 })
      if (raw) {
        const parsed = JSON.parse(raw)
        const brief: RelationshipBrief = {
          contactId,
          personName: profile.person.name,
          summary: parsed.summary ?? '',
          openItems: Array.isArray(parsed.openItems) ? parsed.openItems : [],
          recentInteractions: Array.isArray(parsed.recentInteractions) ? parsed.recentInteractions : [],
          risks: Array.isArray(parsed.risks) ? parsed.risks : [],
          opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
          talkingPoints: Array.isArray(parsed.talkingPoints) ? parsed.talkingPoints : [],
          generatedAt: new Date().toISOString(),
          isMock: false,
        }
        return NextResponse.json({ data: brief, source: 'gemini' })
      }
    } catch (error) {
      console.warn('[Relationship brief] Gemini generation failed, using mock:', (error as Error).message)
    }
  }

  // 3) Mock fallback (no key, paused DB, or parse failure).
  return NextResponse.json({ data: getMockRelationshipBrief(contactId), source: 'mock' })
}
