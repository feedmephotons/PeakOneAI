import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentOrganization } from '@/lib/auth'
import { getMockMission } from '@/lib/peak/mock'
import type { MilestoneState, MissionMilestone } from '@/lib/peak/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

const VALID_STATES: MilestoneState[] = ['DONE', 'ACTIVE', 'UPCOMING']

function mapMilestone(m: any): MissionMilestone {
  return {
    id: m.id,
    missionId: m.missionId,
    label: m.label,
    date: m.date ? (m.date instanceof Date ? m.date.toISOString() : m.date) : null,
    state: m.state,
    position: m.position,
  }
}

// GET /api/missions/[id]/milestones
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params
  try {
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const mission = await prisma.mission.findFirst({ where: { id, workspaceId: workspace.id }, select: { id: true } })
    if (!mission) {
      const mock = getMockMission(id)
      return NextResponse.json({ data: mock?.milestones ?? [], source: 'mock' })
    }
    const milestones = await prisma.missionMilestone.findMany({ where: { missionId: id }, orderBy: { position: 'asc' } })
    return NextResponse.json({ data: milestones.map(mapMilestone), source: 'db' })
  } catch (error) {
    console.warn('[Mission milestones GET] falling back to mock:', (error as Error).message)
    const mock = getMockMission(id)
    return NextResponse.json({ data: mock?.milestones ?? [], source: 'mock' })
  }
}

// POST /api/missions/[id]/milestones
export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { label, date, state, position } = body
  if (!label || typeof label !== 'string' || label.trim().length === 0) {
    return NextResponse.json({ error: 'Label is required' }, { status: 400 })
  }
  if (state !== undefined && !VALID_STATES.includes(state)) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
  }
  if (date && isNaN(new Date(date).getTime())) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  try {
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const mission = await prisma.mission.findFirst({ where: { id, workspaceId: workspace.id }, select: { id: true } })
    if (!mission) return NextResponse.json({ error: 'Mission not found' }, { status: 404 })

    const milestone = await prisma.missionMilestone.create({
      data: {
        label: label.trim(),
        date: date ? new Date(date) : null,
        state: state ?? 'UPCOMING',
        position: position ?? 0,
        missionId: id,
      },
    })
    return NextResponse.json({ data: mapMilestone(milestone), source: 'db' }, { status: 201 })
  } catch (error) {
    console.warn('[Mission milestones POST] falling back to mock:', (error as Error).message)
    const mock: MissionMilestone = {
      id: `mock-ms-${Date.now()}`,
      missionId: id,
      label: label.trim(),
      date: date ?? null,
      state: state ?? 'UPCOMING',
      position: position ?? 0,
    }
    return NextResponse.json({ data: mock, source: 'mock' }, { status: 201 })
  }
}
