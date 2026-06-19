import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, getCurrentOrganization } from '@/lib/auth'
import { getMockMissions, MOCK_MISSIONS } from '@/lib/peak/mock'
import type { Mission, MissionStatus } from '@/lib/peak/types'

const VALID_STATUSES: MissionStatus[] = ['ON_TRACK', 'AT_RISK', 'BEHIND', 'COMPLETED']

function mapMission(m: any): Mission {
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
    taskCount: m._count?.tasks,
    objectiveCount: m._count?.objectives,
    riskCount: m._count?.risks,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
    updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
  }
}

// GET /api/missions?status=ON_TRACK
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || undefined

  try {
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const where: any = { workspaceId: workspace.id }
    if (status && VALID_STATUSES.includes(status as MissionStatus)) where.status = status

    const missions = await prisma.mission.findMany({
      where,
      include: {
        owner: true,
        _count: { select: { tasks: true, objectives: true, risks: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json({ data: missions.map(mapMission), source: 'db' })
  } catch (error) {
    console.warn('[Missions GET] falling back to mock:', (error as Error).message)
    return NextResponse.json({ data: getMockMissions({ status }), source: 'mock' })
  }
}

// POST /api/missions
export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, description, status, progress, targetDate, budgetUsed, budgetTotal, healthScore, velocity } = body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
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
    const user = await getCurrentUser()
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const mission = await prisma.mission.create({
      data: {
        name: name.trim(),
        description: description ?? null,
        status: status ?? 'ON_TRACK',
        progress: progress ?? 0,
        targetDate: targetDate ? new Date(targetDate) : null,
        budgetUsed: budgetUsed ?? null,
        budgetTotal: budgetTotal ?? null,
        healthScore: healthScore ?? null,
        velocity: velocity ?? null,
        workspaceId: workspace.id,
        ownerId: user.id,
      },
      include: { owner: true, _count: { select: { tasks: true, objectives: true, risks: true } } },
    })
    return NextResponse.json({ data: mapMission(mission), source: 'db' }, { status: 201 })
  } catch (error) {
    console.warn('[Missions POST] falling back to mock:', (error as Error).message)
    const now = new Date().toISOString()
    const mock: Mission = {
      id: `mock-mission-${Date.now()}`,
      name: name.trim(),
      description: description ?? null,
      status: status ?? 'ON_TRACK',
      progress: progress ?? 0,
      targetDate: targetDate ?? null,
      budgetUsed: budgetUsed ?? null,
      budgetTotal: budgetTotal ?? null,
      healthScore: healthScore ?? null,
      velocity: velocity ?? null,
      taskCount: 0,
      objectiveCount: 0,
      riskCount: 0,
      createdAt: now,
      updatedAt: now,
    }
    MOCK_MISSIONS.unshift(mock)
    return NextResponse.json({ data: mock, source: 'mock' }, { status: 201 })
  }
}
