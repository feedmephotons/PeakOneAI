import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentOrganization } from '@/lib/auth'
import { searchMock } from '@/lib/peak/mock'
import type { Mission, Note, Person } from '@/lib/peak/types'

// GET /api/memory/search?q=...
// Cross-entity memory search (notes + people + missions). Powers Lisa's
// "what do I know about X" command.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()

  if (!q) {
    return NextResponse.json({ data: { notes: [], people: [], missions: [] }, query: q, source: 'db' })
  }

  try {
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const [notesRaw, contactsRaw, missionsRaw] = await Promise.all([
      prisma.note.findMany({
        where: {
          workspaceId: workspace.id,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { body: { contains: q, mode: 'insensitive' } },
            { tags: { has: q } },
          ],
        },
        include: { author: true, _count: { select: { connections: true } } },
        take: 20,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.contact.findMany({
        where: {
          workspaceId: workspace.id,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { company: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      prisma.mission.findMany({
        where: {
          workspaceId: workspace.id,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    const notes: Note[] = notesRaw.map((n) => ({
      id: n.id,
      brain: n.brain,
      type: n.type,
      title: n.title,
      body: n.body ?? null,
      tags: n.tags,
      pinned: n.pinned,
      starred: n.starred,
      workspaceId: n.workspaceId,
      author: n.author ? { id: n.author.id, name: n.author.name || n.author.email } : undefined,
      connectionCount: n._count.connections,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    }))

    const people: Person[] = contactsRaw.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phoneNumber: c.phoneNumber,
      company: c.company,
      favorite: c.favorite,
    }))

    const missions: Mission[] = missionsRaw.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      status: m.status,
      progress: m.progress,
      targetDate: m.targetDate ? m.targetDate.toISOString() : null,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }))

    return NextResponse.json({ data: { notes, people, missions }, query: q, source: 'db' })
  } catch (error) {
    console.warn('[Memory search GET] falling back to mock:', (error as Error).message)
    return NextResponse.json({ data: searchMock(q), query: q, source: 'mock' })
  }
}
