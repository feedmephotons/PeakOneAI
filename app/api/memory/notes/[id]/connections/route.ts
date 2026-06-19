import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentOrganization } from '@/lib/auth'
import { getMockNoteConnections } from '@/lib/peak/mock'
import type { NoteConnection, NoteContext } from '@/lib/peak/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Group flat connections into the buckets the ContextPanel renders.
function groupConnections(connections: NoteConnection[]): NoteContext {
  const ctx: NoteContext = { people: [], companies: [], projects: [], meetings: [], tasks: [], notes: [] }
  for (const c of connections) {
    switch (c.entityType) {
      case 'PERSON': ctx.people.push(c); break
      case 'COMPANY': ctx.companies.push(c); break
      case 'PROJECT': ctx.projects.push(c); break
      case 'MEETING': ctx.meetings.push(c); break
      case 'TASK': ctx.tasks.push(c); break
      case 'NOTE': ctx.notes.push(c); break
    }
  }
  return ctx
}

// GET /api/memory/notes/[id]/connections
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params
  try {
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const note = await prisma.note.findFirst({
      where: { id, workspaceId: workspace.id },
      select: { id: true },
    })
    if (!note) {
      const mock = getMockNoteConnections(id)
      return NextResponse.json({ data: mock, grouped: groupConnections(mock), source: 'mock' })
    }

    const rows = await prisma.noteConnection.findMany({ where: { noteId: id } })
    const connections: NoteConnection[] = rows.map((c) => ({
      id: c.id,
      noteId: c.noteId,
      entityType: c.entityType,
      entityId: c.entityId,
      label: c.label ?? null,
      autoLinked: c.autoLinked,
      createdAt: c.createdAt.toISOString(),
    }))
    return NextResponse.json({ data: connections, grouped: groupConnections(connections), source: 'db' })
  } catch (error) {
    console.warn('[Memory connections GET] falling back to mock:', (error as Error).message)
    const mock = getMockNoteConnections(id)
    return NextResponse.json({ data: mock, grouped: groupConnections(mock), source: 'mock' })
  }
}
