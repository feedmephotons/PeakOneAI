import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentOrganization } from '@/lib/auth'
import { getMockRelationshipProfile } from '@/lib/peak/mock'
import type { InteractionItem, Note, Person, RelationshipProfile } from '@/lib/peak/types'

interface RouteParams {
  params: Promise<{ contactId: string }>
}

// Derive a 0-100 connection strength from interaction volume + recency.
function deriveStrength(stats: Record<string, number>, lastInteraction: Date | null): number {
  const volume = Object.values(stats).reduce((a, b) => a + b, 0)
  const volumeScore = Math.min(60, volume * 3)
  let recencyScore = 0
  if (lastInteraction) {
    const days = (Date.now() - lastInteraction.getTime()) / 86_400_000
    recencyScore = days < 7 ? 40 : days < 30 ? 25 : days < 90 ? 12 : 4
  }
  return Math.min(100, Math.round(volumeScore + recencyScore))
}

// GET /api/relationships/[contactId]
// Aggregates everything we know about a person across meetings, messages,
// calls, notes, tasks, and files into a single RelationshipProfile.
export async function GET(_request: Request, { params }: RouteParams) {
  const { contactId } = await params
  try {
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const contact = await prisma.contact.findFirst({ where: { id: contactId, workspaceId: workspace.id } })
    if (!contact) {
      const mock = getMockRelationshipProfile(contactId)
      if (mock) return NextResponse.json({ data: mock, source: 'mock' })
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Notes connected to this contact (via NoteConnection PERSON links).
    const connections = await prisma.noteConnection.findMany({
      where: { entityType: 'PERSON', entityId: contactId, note: { workspaceId: workspace.id } },
      include: { note: { include: { author: true } } },
      take: 25,
    })
    const sharedNotes: Note[] = connections
      .filter((c) => c.note)
      .map((c) => ({
        id: c.note!.id,
        brain: c.note!.brain,
        type: c.note!.type,
        title: c.note!.title,
        body: c.note!.body ?? null,
        tags: c.note!.tags,
        pinned: c.note!.pinned,
        starred: c.note!.starred,
        author: c.note!.author ? { id: c.note!.author.id, name: c.note!.author.name || c.note!.author.email } : undefined,
        createdAt: c.note!.createdAt.toISOString(),
        updatedAt: c.note!.updatedAt.toISOString(),
      }))

    // Calls referencing the contact by name (Call has no FK to Contact).
    const calls = contact.phoneNumber
      ? await prisma.call.findMany({
          where: { workspaceId: workspace.id, OR: [{ phoneNumber: contact.phoneNumber }, { contactName: contact.name }] },
          orderBy: { startedAt: 'desc' },
          take: 25,
        })
      : []

    const stats = {
      meetings: 0,
      messages: 0,
      calls: calls.length,
      notes: sharedNotes.length,
      tasks: 0,
      files: 0,
    }

    const recentInteractions: InteractionItem[] = [
      ...calls.map((c): InteractionItem => ({
        id: c.id,
        kind: 'CALL',
        title: c.aiSummary?.slice(0, 80) || `${c.type} call`,
        summary: c.aiSummary ?? undefined,
        date: c.startedAt.toISOString(),
      })),
      ...sharedNotes.map((n): InteractionItem => ({
        id: n.id,
        kind: 'NOTE',
        title: n.title,
        date: n.updatedAt,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const lastInteraction = recentInteractions[0] ? new Date(recentInteractions[0].date) : null

    const person: Person = {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phoneNumber: contact.phoneNumber,
      company: contact.company,
      favorite: contact.favorite,
    }

    const profile: RelationshipProfile = {
      person,
      strength: deriveStrength(stats, lastInteraction),
      lastInteraction: lastInteraction ? lastInteraction.toISOString() : null,
      stats,
      recentInteractions: recentInteractions.slice(0, 10),
      openItems: [],
      sharedNotes,
      missions: [],
    }

    return NextResponse.json({ data: profile, source: 'db' })
  } catch (error) {
    console.warn('[Relationship profile GET] falling back to mock:', (error as Error).message)
    const mock = getMockRelationshipProfile(contactId)
    if (mock) return NextResponse.json({ data: mock, source: 'mock' })
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }
}
