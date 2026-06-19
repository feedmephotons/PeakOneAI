import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentOrganization } from '@/lib/auth'
import { getMockMission } from '@/lib/peak/mock'
import type { MissionObjective, MissionStatus } from '@/lib/peak/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

const VALID_STATUSES: MissionStatus[] = ['ON_TRACK', 'AT_RISK', 'BEHIND', 'COMPLETED']

function mapObjective(o: any): MissionObjective {
  return { id: o.id, missionId: o.missionId, title: o.title, progress: o.progress, status: o.status, position: o.position }
}

// GET /api/missions/[id]/objectives
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params
  try {
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const mission = await prisma.mission.findFirst({ where: { id, workspaceId: workspace.id }, select: { id: true } })
    if (!mission) {
      const mock = getMockMission(id)
      return NextResponse.json({ data: mock?.objectives ?? [], source: 'mock' })
    }
    const objectives = await prisma.missionObjective.findMany({ where: { missionId: id }, orderBy: { position: 'asc' } })
    return NextResponse.json({ data: objectives.map(mapObjective), source: 'db' })
  } catch (error) {
    console.warn('[Mission objectives GET] falling back to mock:', (error as Error).message)
    const mock = getMockMission(id)
    return NextResponse.json({ data: mock?.objectives ?? [], source: 'mock' })
  }
}

// POST /api/missions/[id]/objectives
export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { title, progress, status, position } = body
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  if (progress !== undefined && (typeof progress !== 'number' || progress < 0 || progress > 100)) {
    return NextResponse.json({ error: 'Progress must be 0-100' }, { status: 400 })
  }
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  try {
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const mission = await prisma.mission.findFirst({ where: { id, workspaceId: workspace.id }, select: { id: true } })
    if (!mission) return NextResponse.json({ error: 'Mission not found' }, { status: 404 })

    const objective = await prisma.missionObjective.create({
      data: {
        title: title.trim(),
        progress: progress ?? 0,
        status: status ?? 'ON_TRACK',
        position: position ?? 0,
        missionId: id,
      },
    })
    return NextResponse.json({ data: mapObjective(objective), source: 'db' }, { status: 201 })
  } catch (error) {
    console.warn('[Mission objectives POST] falling back to mock:', (error as Error).message)
    const mock: MissionObjective = {
      id: `mock-obj-${Date.now()}`,
      missionId: id,
      title: title.trim(),
      progress: progress ?? 0,
      status: status ?? 'ON_TRACK',
      position: position ?? 0,
    }
    return NextResponse.json({ data: mock, source: 'mock' }, { status: 201 })
  }
}
