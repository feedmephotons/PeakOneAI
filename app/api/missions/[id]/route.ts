import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentOrganization } from '@/lib/auth'
import { getMockMission, MOCK_MISSIONS } from '@/lib/peak/mock'
import type { Mission, MissionStatus } from '@/lib/peak/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

const VALID_STATUSES: MissionStatus[] = ['ON_TRACK', 'AT_RISK', 'BEHIND', 'COMPLETED']

// Maps a deeply-included Prisma Mission into the shared shape.
function mapMissionFull(m: any): Mission {
  return {
    id: m.id,
    name: m.name,
    description: m.description ?? null,
    status: m.status,
    progress: m.progress,
    targetDate: m.targetDate ? (m.targetDate instanceof Date ? m.targetDate.toISOString() : m.targetDate) : null,
    budgetUsed: m.budgetUsed ?? null,
    budgetTotal: m.budgetTotal ?? null,
    healthScore: m.healthScore ?? null,
    velocity: m.velocity ?? null,
    workspaceId: m.workspaceId,
    owner: m.owner ? { id: m.owner.id, name: m.owner.name || m.owner.email, avatarUrl: m.owner.avatarUrl } : undefined,
    objectives: m.objectives?.map((o: any) => ({
      id: o.id,
      missionId: o.missionId,
      title: o.title,
      progress: o.progress,
      status: o.status,
      position: o.position,
    })),
    milestones: m.milestones?.map((ms: any) => ({
      id: ms.id,
      missionId: ms.missionId,
      label: ms.label,
      date: ms.date ? (ms.date instanceof Date ? ms.date.toISOString() : ms.date) : null,
      state: ms.state,
      position: ms.position,
    })),
    risks: m.risks?.map((r: any) => ({
      id: r.id,
      missionId: r.missionId,
      title: r.title,
      level: r.level,
      impact: r.impact ?? null,
      probability: r.probability ?? null,
      note: r.note ?? null,
    })),
    members: m.members?.map((mem: any) => ({
      id: mem.id,
      missionId: mem.missionId,
      role: mem.role ?? null,
      user: { id: mem.user.id, name: mem.user.name || mem.user.email, avatarUrl: mem.user.avatarUrl },
    })),
    taskCount: m._count?.tasks,
    objectiveCount: m.objectives?.length ?? m._count?.objectives,
    riskCount: m.risks?.length ?? m._count?.risks,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
    updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
  }
}

// GET /api/missions/[id]
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params
  try {
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const mission = await prisma.mission.findFirst({
      where: { id, workspaceId: workspace.id },
      include: {
        owner: true,
        objectives: { orderBy: { position: 'asc' } },
        milestones: { orderBy: { position: 'asc' } },
        risks: true,
        members: { include: { user: true } },
        _count: { select: { tasks: true } },
      },
    })
    if (!mission) {
      const mock = getMockMission(id)
      if (mock) return NextResponse.json({ data: mock, source: 'mock' })
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }
    return NextResponse.json({ data: mapMissionFull(mission), source: 'db' })
  } catch (error) {
    console.warn('[Mission GET] falling back to mock:', (error as Error).message)
    const mock = getMockMission(id)
    if (mock) return NextResponse.json({ data: mock, source: 'mock' })
    return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
  }
}

// PUT /api/missions/[id]
export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, description, status, progress, targetDate, budgetUsed, budgetTotal, healthScore, velocity } = body

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
  }
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  if (progress !== undefined && (typeof progress !== 'number' || progress < 0 || progress > 100)) {
    return NextResponse.json({ error: 'Progress must be 0-100' }, { status: 400 })
  }
  if (targetDate && isNaN(new Date(targetDate).getTime())) {
    return NextResponse.json({ error: 'Invalid target date' }, { status: 400 })
  }

  try {
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const existing = await prisma.mission.findFirst({ where: { id, workspaceId: workspace.id } })
    if (!existing) return NextResponse.json({ error: 'Mission not found' }, { status: 404 })

    const data: any = {}
    if (name !== undefined) data.name = name.trim()
    if (description !== undefined) data.description = description
    if (status !== undefined) data.status = status
    if (progress !== undefined) data.progress = progress
    if (targetDate !== undefined) data.targetDate = targetDate ? new Date(targetDate) : null
    if (budgetUsed !== undefined) data.budgetUsed = budgetUsed
    if (budgetTotal !== undefined) data.budgetTotal = budgetTotal
    if (healthScore !== undefined) data.healthScore = healthScore
    if (velocity !== undefined) data.velocity = velocity

    const mission = await prisma.mission.update({
      where: { id },
      data,
      include: {
        owner: true,
        objectives: { orderBy: { position: 'asc' } },
        milestones: { orderBy: { position: 'asc' } },
        risks: true,
        members: { include: { user: true } },
        _count: { select: { tasks: true } },
      },
    })
    return NextResponse.json({ data: mapMissionFull(mission), source: 'db' })
  } catch (error) {
    console.warn('[Mission PUT] falling back to mock:', (error as Error).message)
    const idx = MOCK_MISSIONS.findIndex((m) => m.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    const updated: Mission = {
      ...MOCK_MISSIONS[idx],
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(progress !== undefined ? { progress } : {}),
      ...(targetDate !== undefined ? { targetDate } : {}),
      ...(budgetUsed !== undefined ? { budgetUsed } : {}),
      ...(budgetTotal !== undefined ? { budgetTotal } : {}),
      ...(healthScore !== undefined ? { healthScore } : {}),
      ...(velocity !== undefined ? { velocity } : {}),
      updatedAt: new Date().toISOString(),
    }
    MOCK_MISSIONS[idx] = updated
    return NextResponse.json({ data: updated, source: 'mock' })
  }
}

// DELETE /api/missions/[id]
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params
  try {
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const existing = await prisma.mission.findFirst({ where: { id, workspaceId: workspace.id } })
    if (!existing) return NextResponse.json({ error: 'Mission not found' }, { status: 404 })

    await prisma.mission.delete({ where: { id } })
    return NextResponse.json({ success: true, source: 'db' })
  } catch (error) {
    console.warn('[Mission DELETE] falling back to mock:', (error as Error).message)
    const idx = MOCK_MISSIONS.findIndex((m) => m.id === id)
    if (idx !== -1) MOCK_MISSIONS.splice(idx, 1)
    return NextResponse.json({ success: true, source: 'mock' })
  }
}
