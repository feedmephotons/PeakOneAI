import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * API Endpoint: Create Task from Action Item
 * POST /api/tasks/create
 *
 * Body: {
 *   title: string,
 *   description?: string,
 *   assignee?: string (name),
 *   deadline?: string,
 *   projectId?: string,
 *   meetingId?: string
 * }
 */
export async function POST(request: Request) {
  try {
    // Multi-tenant authentication
    const { userId, orgId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const {
      title,
      description,
      assignee,
      deadline,
      projectId,
      meetingId
    } = await request.json()

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    console.log('[CreateTask] Creating task:', { title, assignee, deadline })

    // TODO: For now, create tasks without project (needs schema update) or use a default project
    // For demo, we'll create without strict project requirement
    // In production, you'd:
    // 1. Find or create a "Meeting Notes" project
    // 2. Or make projectId optional in schema

    // Parse deadline if provided
    let dueDate: Date | undefined
    if (deadline) {
      try {
        // Try to parse natural language dates like "Friday", "next week", etc.
        // For now, simple ISO date parsing
        dueDate = new Date(deadline)
        if (isNaN(dueDate.getTime())) {
          dueDate = undefined
        }
      } catch (error) {
        console.warn('[CreateTask] Could not parse deadline:', deadline)
      }
    }

    // Get the highest position for ordering
    const lastTask = await prisma.task.findFirst({
      where: { creatorId: userId },
      orderBy: { position: 'desc' }
    })

    const position = lastTask ? lastTask.position + 1 : 0

    // Create task (with required projectId - using placeholder for now)
    // You'll need to create a default project or update schema
    const DEFAULT_PROJECT_ID = 'default-project-id' // TODO: Create this project or make projectId optional

    const task = await prisma.task.create({
      data: {
        title,
        description: description || `From meeting ${meetingId || 'N/A'}`,
        status: 'TODO',
        priority: deadline ? 'HIGH' : 'MEDIUM',
        dueDate,
        aiSuggested: true,
        position,
        creatorId: userId,
        projectId: projectId || DEFAULT_PROJECT_ID,
      },
      include: {
        assignees: true
      }
    })

    // TODO: If assignee name is provided, find user by name and create TaskAssignment
    // For now, skip as we'd need user lookup by name

    console.log('[CreateTask] Task created:', task.id)

    return NextResponse.json({
      success: true,
      task: {
        id: task.id,
        title: task.title,
        status: task.status,
        dueDate: task.dueDate,
        aiSuggested: task.aiSuggested
      }
    })

  } catch (error) {
    console.error('[CreateTask] Error:', error)

    // Check if it's a Prisma error about missing project
    if (error instanceof Error && error.message.includes('projectId')) {
      return NextResponse.json(
        {
          error: 'Project setup required',
          details: 'Please create a default project first or update task creation flow'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: 'Task creation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
