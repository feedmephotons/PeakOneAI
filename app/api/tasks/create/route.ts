import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, getCurrentOrganization } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

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
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let body: any
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const {
      title,
      description,
      assignee,
      assigneeId,
      deadline,
      projectId,
      meetingId,
      tags,
      status,
      priority
    } = body

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Validate enum inputs if provided
    const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'COMPLETED', 'CANCELLED']
    const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
    }

    if (tags !== undefined && (!Array.isArray(tags) || !tags.every(t => typeof t === 'string'))) {
      return NextResponse.json({ error: 'Tags must be an array of strings' }, { status: 400 })
    }

    console.log('[CreateTask] Creating task:', { title, assignee, deadline })

    const user = await getCurrentUser()
    let workspace = await getCurrentOrganization()

    if (!workspace) {
      // Auto-create workspace
      const slug = `default-workspace-${user.id}`
      try {
        workspace = await prisma.workspace.findUnique({
          where: { slug },
        })

        if (!workspace) {
          workspace = await prisma.workspace.create({
            data: {
              name: 'Default Workspace',
              slug,
              clerkOrgId: slug,
            },
          })
        }
      } catch (error: any) {
        workspace = await prisma.workspace.findUnique({
          where: { slug },
        })
        if (!workspace) {
          throw error;
        }
      }

      // Create or verify UserWorkspace mapping
      try {
        const mappingExists = await prisma.userWorkspace.findFirst({
          where: {
            userId: user.id,
            workspaceId: workspace.id,
          },
        })

        if (!mappingExists) {
          await prisma.userWorkspace.create({
            data: {
              userId: user.id,
              workspaceId: workspace.id,
              role: 'OWNER',
            },
          })
        }
      } catch (error: any) {
        const mappingExists = await prisma.userWorkspace.findFirst({
          where: {
            userId: user.id,
            workspaceId: workspace.id,
          },
        })
        if (!mappingExists) {
          throw error;
        }
      }
    }

    // Resolve the TODO for assignee lookup by name: if assigneeId is not provided but assignee (name string) is provided, search the workspace for a user membership with a matching name
    let resolvedAssigneeId = assigneeId;
    if (!resolvedAssigneeId && assignee && assignee.trim().length > 0) {
      const member = await prisma.userWorkspace.findFirst({
        where: {
          workspaceId: workspace.id,
          user: {
            name: { contains: assignee, mode: 'insensitive' }
          }
        }
      });
      if (member) {
        resolvedAssigneeId = member.userId;
      }
    }

    if (resolvedAssigneeId) {
      const isMember = await prisma.userWorkspace.findFirst({
        where: {
          userId: resolvedAssigneeId,
          workspaceId: workspace.id,
        },
      })
      if (!isMember) {
        return NextResponse.json(
          { error: 'Assignee is not a member of this workspace' },
          { status: 400 }
        )
      }
    }

    // Check if the project exists in this workspace
    let project = null
    if (projectId) {
      project = await prisma.project.findFirst({
        where: { id: projectId, workspaceId: workspace.id },
      })
    }

    if (!project) {
      project = await prisma.project.findFirst({
        where: { workspaceId: workspace.id },
      })
    }

    if (!project) {
      // Wrap in a transaction to prevent concurrent duplicate project creation
      project = await prisma.$transaction(async (tx) => {
        // Lock the workspace row
        await tx.$executeRaw`SELECT id FROM "Workspace" WHERE id = ${workspace.id} FOR UPDATE`

        // Check if project exists within transaction
        let existingProj = await tx.project.findFirst({
          where: { workspaceId: workspace.id },
        })

        if (!existingProj) {
          existingProj = await tx.project.create({
            data: {
              name: 'General Tasks',
              workspaceId: workspace.id,
            },
          })
        }
        return existingProj
      })
    }

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

    const dbStatus = status === 'COMPLETED' ? 'DONE' : (status || 'TODO')
    const dbPriority = priority || (deadline ? 'HIGH' : 'MEDIUM')

    // Create task inside transaction with parent project lock
    const task = await prisma.$transaction(async (tx) => {
      // Serialize concurrent requests on the same project
      await tx.$executeRaw`SELECT id FROM "Project" WHERE id = ${project.id} FOR UPDATE`

      // Get the highest position for ordering
      const lastTask = await tx.task.findFirst({
        where: {
          projectId: project.id,
        },
        orderBy: { position: 'desc' }
      })

      const position = lastTask ? lastTask.position + 1 : 0

      // Create task
      return await tx.task.create({
        data: {
          title,
          description: description || `From meeting ${meetingId || 'N/A'}`,
          status: dbStatus,
          priority: dbPriority,
          dueDate,
          aiSuggested: true,
          position,
          creatorId: user.id,
          projectId: project.id,
          tags: tags || [],
          assignees: resolvedAssigneeId
            ? {
                create: {
                  userId: resolvedAssigneeId,
                },
              }
            : undefined,
        },
        include: {
          assignees: {
            include: {
              user: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        }
      })
    })

    console.log('[CreateTask] Task created:', task.id)

    const firstAssignee = task.assignees[0]?.user
    const mappedTask = {
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      status: task.status === 'DONE' ? 'COMPLETED' : task.status,
      priority: task.priority,
      dueDate: task.dueDate || undefined,
      tags: task.tags,
      attachments: 0,
      comments: task._count?.comments || 0,
      assignee: firstAssignee
        ? {
            id: firstAssignee.id,
            name: firstAssignee.name || firstAssignee.email,
            avatar: firstAssignee.avatarUrl || undefined,
          }
        : undefined,
      aiSuggested: task.aiSuggested,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }

    return NextResponse.json({
      success: true,
      task: mappedTask
    })

  } catch (error) {
    console.error('[CreateTask] Error:', error)

    // Check if it's a Prisma error about missing project
    if (error instanceof Error && error.message.includes('projectId')) {
      return NextResponse.json(
        {
          error: 'Project setup required'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: 'Task creation failed'
      },
      { status: 500 }
    )
  }
}
