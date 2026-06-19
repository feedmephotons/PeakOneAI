import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentOrganization } from '@/lib/auth'
import { getMockMission } from '@/lib/peak/mock'
import type { MissionRisk, RiskLevel } from '@/lib/peak/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

const VALID_LEVELS: RiskLevel[] = ['HIGH', 'MED', 'LOW']

function mapRisk(r: any): MissionRisk {
  return {
    id: r.id,
    missionId: r.missionId,
    title: r.title,
    level: r.level,
    impact: r.impact ?? null,
    probability: r.probability ?? null,
    note: r.note ?? null,
  }
}

// GET /api/missions/[id]/risks
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params
  try {
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const mission = await prisma.mission.findFirst({ where: { id, workspaceId: workspace.id }, select: { id: true } })
    if (!mission) {
      const mock = getMockMission(id)
      return NextResponse.json({ data: mock?.risks ?? [], source: 'mock' })
    }
    const risks = await prisma.missionRisk.findMany({ where: { missionId: id } })
    return NextResponse.json({ data: risks.map(mapRisk), source: 'db' })
  } catch (error) {
    console.warn('[Mission risks GET] falling back to mock:', (error as Error).message)
    const mock = getMockMission(id)
    return NextResponse.json({ data: mock?.risks ?? [], source: 'mock' })
  }
}

// POST /api/missions/[id]/risks
export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { title, level, impact, probability, note } = body
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  if (level !== undefined && !VALID_LEVELS.includes(level)) {
    return NextResponse.json({ error: 'Invalid level' }, { status: 400 })
  }

  try {
    const workspace = await getCurrentOrganization()
    if (!workspace) throw new Error('No workspace')

    const mission = await prisma.mission.findFirst({ where: { id, workspaceId: workspace.id }, select: { id: true } })
    if (!mission) return NextResponse.json({ error: 'Mission not found' }, { status: 404 })

    const risk = await prisma.missionRisk.create({
      data: {
        title: title.trim(),
        level: level ?? 'MED',
        impact: impact ?? null,
        probability: probability ?? null,
        note: note ?? null,
        missionId: id,
      },
    })
    return NextResponse.json({ data: mapRisk(risk), source: 'db' }, { status: 201 })
  } catch (error) {
    console.warn('[Mission risks POST] falling back to mock:', (error as Error).message)
    const mock: MissionRisk = {
      id: `mock-risk-${Date.now()}`,
      missionId: id,
      title: title.trim(),
      level: level ?? 'MED',
      impact: impact ?? null,
      probability: probability ?? null,
      note: note ?? null,
    }
    return NextResponse.json({ data: mock, source: 'mock' }, { status: 201 })
  }
}
