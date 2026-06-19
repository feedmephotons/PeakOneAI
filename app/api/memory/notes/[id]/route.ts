import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentOrganization } from '@/lib/auth'
import { getMockNote, MOCK_NOTES } from '@/lib/peak/mock'
import type { Note, NoteBrain, NoteType } from '@/lib/peak/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

const VALID_BRAINS: NoteBrain[] = ['MY', 'TEAM', 'COMPANY']
const VALID_TYPES: NoteType[] = ['NOTE', 'JOURNAL', 'RESEARCH', 'VOICE', 'IDEA', 'DRAFT', 'DECISION', 'BOOKMARK']

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
    connections: n.connections?.map((c: any) => ({
      id: c.id,
      noteId: c.noteId,
      entityType: c.entityType,
      entityId: c.entityId,
      label: c.label ?? null,
      autoLinked: c.autoLinked,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
    })),
    connectionCount: n.connections?.length,
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
    updatedAt: n.updatedAt instanceof Date ? n.updatedAt.toISOString() : n.updatedAt,
  }
}

// GET /api/memory/notes/[id]
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params
  try {
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const note = await prisma.note.findFirst({
      where: { id, workspaceId: workspace.id },
      include: { author: true, connections: true },
    })
    if (!note) {
      const mock = getMockNote(id)
      if (mock) return NextResponse.json({ data: mock, source: 'mock' })
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    return NextResponse.json({ data: mapNote(note), source: 'db' })
  } catch (error) {
    console.warn('[Memory note GET] falling back to mock:', (error as Error).message)
    const mock = getMockNote(id)
    if (mock) return NextResponse.json({ data: mock, source: 'mock' })
    return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  }
}

// PUT /api/memory/notes/[id]
export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { title, body: noteBody, brain, type, tags, pinned, starred } = body

  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 })
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
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const existing = await prisma.note.findFirst({ where: { id, workspaceId: workspace.id } })
    if (!existing) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

    const data: any = {}
    if (title !== undefined) data.title = title.trim()
    if (noteBody !== undefined) data.body = noteBody
    if (brain !== undefined) data.brain = brain
    if (type !== undefined) data.type = type
    if (tags !== undefined) data.tags = tags
    if (pinned !== undefined) data.pinned = pinned
    if (starred !== undefined) data.starred = starred

    const note = await prisma.note.update({
      where: { id },
      data,
      include: { author: true, connections: true },
    })
    return NextResponse.json({ data: mapNote(note), source: 'db' })
  } catch (error) {
    console.warn('[Memory note PUT] falling back to mock:', (error as Error).message)
    // Mutate in-memory mock so the UI reflects the change with the DB paused.
    const idx = MOCK_NOTES.findIndex((n) => n.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    const updated: Note = {
      ...MOCK_NOTES[idx],
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(noteBody !== undefined ? { body: noteBody } : {}),
      ...(brain !== undefined ? { brain } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(tags !== undefined ? { tags } : {}),
      ...(pinned !== undefined ? { pinned } : {}),
      ...(starred !== undefined ? { starred } : {}),
      updatedAt: new Date().toISOString(),
    }
    MOCK_NOTES[idx] = updated
    return NextResponse.json({ data: updated, source: 'mock' })
  }
}

// DELETE /api/memory/notes/[id]
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params
  try {
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const existing = await prisma.note.findFirst({ where: { id, workspaceId: workspace.id } })
    if (!existing) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

    await prisma.note.delete({ where: { id } })
    return NextResponse.json({ success: true, source: 'db' })
  } catch (error) {
    console.warn('[Memory note DELETE] falling back to mock:', (error as Error).message)
    const idx = MOCK_NOTES.findIndex((n) => n.id === id)
    if (idx !== -1) MOCK_NOTES.splice(idx, 1)
    return NextResponse.json({ success: true, source: 'mock' })
  }
}
