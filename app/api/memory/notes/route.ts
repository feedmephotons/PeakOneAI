import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, getCurrentOrganization } from '@/lib/auth'
import { getMockNotes, MOCK_NOTES } from '@/lib/peak/mock'
import type { Note, NoteBrain, NoteType } from '@/lib/peak/types'

const VALID_BRAINS: NoteBrain[] = ['MY', 'TEAM', 'COMPANY']
const VALID_TYPES: NoteType[] = ['NOTE', 'JOURNAL', 'RESEARCH', 'VOICE', 'IDEA', 'DRAFT', 'DECISION', 'BOOKMARK']

// Maps a Prisma Note (+author) into the shared serializable shape.
function mapNote(n: any): Note {
  return {
    id: n.id,
    brain: n.brain,
    type: n.type,
    title: n.title,
    body: n.body ?? null,
    tags: n.tags ?? [],
    pinned: n.pinned,
    starred: n.starred,
    workspaceId: n.workspaceId,
    author: n.author
      ? { id: n.author.id, name: n.author.name || n.author.email, email: n.author.email, avatarUrl: n.author.avatarUrl }
      : undefined,
    connectionCount: n._count?.connections ?? n.connections?.length,
    createdAt: (n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt),
    updatedAt: (n.updatedAt instanceof Date ? n.updatedAt.toISOString() : n.updatedAt),
  }
}

// GET /api/memory/notes?brain=MY&type=NOTE&pinned=true&q=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const brain = searchParams.get('brain') || undefined
  const type = searchParams.get('type') || undefined
  const pinnedParam = searchParams.get('pinned')
  const q = searchParams.get('q') || undefined
  const pinned = pinnedParam === null ? undefined : pinnedParam === 'true'

  try {
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const where: any = { workspaceId: workspace.id }
    if (brain && VALID_BRAINS.includes(brain as NoteBrain)) where.brain = brain
    if (type && VALID_TYPES.includes(type as NoteType)) where.type = type
    if (pinned !== undefined) where.pinned = pinned
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { body: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ]
    }

    const notes = await prisma.note.findMany({
      where,
      include: { author: true, _count: { select: { connections: true } } },
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
    })

    return NextResponse.json({ data: notes.map(mapNote), source: 'db' })
  } catch (error) {
    console.warn('[Memory notes GET] falling back to mock:', (error as Error).message)
    return NextResponse.json({ data: getMockNotes({ brain, type, pinned, q }), source: 'mock' })
  }
}

// POST /api/memory/notes
export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { title, body: noteBody, brain, type, tags, pinned, starred } = body

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  if (brain !== undefined && !VALID_BRAINS.includes(brain)) {
    return NextResponse.json({ error: 'Invalid brain' }, { status: 400 })
  }
  if (type !== undefined && !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }
  if (tags !== undefined && (!Array.isArray(tags) || !tags.every((t: any) => typeof t === 'string'))) {
    return NextResponse.json({ error: 'Tags must be an array of strings' }, { status: 400 })
  }

  try {
    const user = await getCurrentUser()
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        body: noteBody ?? null,
        brain: brain ?? 'MY',
        type: type ?? 'NOTE',
        tags: tags ?? [],
        pinned: pinned ?? false,
        starred: starred ?? false,
        workspaceId: workspace.id,
        authorId: user.id,
      },
      include: { author: true, _count: { select: { connections: true } } },
    })

    return NextResponse.json({ data: mapNote(note), source: 'db' }, { status: 201 })
  } catch (error) {
    console.warn('[Memory notes POST] falling back to mock:', (error as Error).message)
    // Return an optimistic mock note so the UI still updates with the DB paused.
    const now = new Date().toISOString()
    const mock: Note = {
      id: `mock-note-${Date.now()}`,
      brain: (brain as NoteBrain) ?? 'MY',
      type: (type as NoteType) ?? 'NOTE',
      title: title.trim(),
      body: noteBody ?? null,
      tags: tags ?? [],
      pinned: pinned ?? false,
      starred: starred ?? false,
      connectionCount: 0,
      createdAt: now,
      updatedAt: now,
    }
    MOCK_NOTES.unshift(mock)
    return NextResponse.json({ data: mock, source: 'mock' }, { status: 201 })
  }
}
