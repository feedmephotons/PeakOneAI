import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, getCurrentOrganization } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

// GET: Fetches tasks for the current workspace
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workspace = await getCurrentOrganization()
    if (!workspace) {
      return NextResponse.json({ tasks: [] })
    }

    const tasks = await prisma.task.findMany({
      where: {
        project: {
          workspaceId: workspace.id,
        },
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
      },
      orderBy: {
        position: 'asc',
      },
    })

    const mappedTasks = tasks.map((task) => {
      const firstAssignee = task.assignees[0]?.user
      return {
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        status: task.status === 'DONE' ? 'COMPLETED' : task.status,
        priority: task.priority,
        dueDate: task.dueDate || undefined,
        tags: task.tags,
        attachments: 0,
        comments: task._count.comments,
        assignee: firstAssignee
          ? {
              id: firstAssignee.id,
              name: firstAssignee.name || firstAssignee.email,
              avatar: firstAssignee.avatarUrl || undefined,
            }
          : undefined,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }
    })

    return NextResponse.json({ tasks: mappedTasks })
  } catch (error) {
    console.error('[Tasks API GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST: Creates a task
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      tags,
      assigneeId,
      projectId,
    } = body

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
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

    if (dueDate && isNaN(new Date(dueDate).getTime())) {
      return NextResponse.json({ error: 'Invalid due date' }, { status: 400 })
    }

    if (tags !== undefined && (!Array.isArray(tags) || !tags.every(t => typeof t === 'string'))) {
      return NextResponse.json({ error: 'Tags must be an array of strings' }, { status: 400 })
    }

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

    if (assigneeId) {
      const isMember = await prisma.userWorkspace.findFirst({
        where: {
          userId: assigneeId,
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

    // Create task inside transaction with parent project lock
    const task = await prisma.$transaction(async (tx) => {
      // Serialize concurrent requests on the same project
      await tx.$executeRaw`SELECT id FROM "Project" WHERE id = ${project.id} FOR UPDATE`

      // Get position for the task
      const lastTask = await tx.task.findFirst({
        where: {
          projectId: project.id,
        },
        orderBy: { position: 'desc' },
      })

      const position = lastTask ? lastTask.position + 1 : 0
      const dbStatus = status === 'COMPLETED' ? 'DONE' : (status || 'TODO')

      // Create task
      return await tx.task.create({
        data: {
          title,
          description: description || null,
          status: dbStatus,
          priority: priority || 'MEDIUM',
          dueDate: dueDate ? new Date(dueDate) : null,
          position,
          creatorId: user.id,
          projectId: project.id,
          tags: tags || [],
          assignees: assigneeId
            ? {
                create: {
                  userId: assigneeId,
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
        },
      })
    })

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
      comments: task._count.comments,
      assignee: firstAssignee
        ? {
            id: firstAssignee.id,
            name: firstAssignee.name || firstAssignee.email,
            avatar: firstAssignee.avatarUrl || undefined,
          }
        : undefined,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }

    return NextResponse.json({ task: mappedTask }, { status: 201 })
  } catch (error) {
    console.error('[Tasks API POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

// PUT: Updates task fields
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryId = searchParams.get('id')
    
    let body: any
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const id = queryId || body.id

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const workspace = await getCurrentOrganization()
    if (!workspace) {
      return NextResponse.json({ error: 'No active workspace found' }, { status: 404 })
    }

    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          workspaceId: workspace.id,
        },
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found or access denied' }, { status: 404 })
    }

    const {
      title,
      description,
      status,
      priority,
      position,
      dueDate,
      tags,
      assigneeId,
    } = body

    if (title !== undefined && title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (dueDate && isNaN(new Date(dueDate).getTime())) {
      return NextResponse.json({ error: 'Invalid due date' }, { status: 400 })
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

    if (assigneeId) {
      const isMember = await prisma.userWorkspace.findFirst({
        where: {
          userId: assigneeId,
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

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description || null
    if (status !== undefined) {
      updateData.status = status === 'COMPLETED' ? 'DONE' : status
    }
    if (priority !== undefined) updateData.priority = priority
    if (position !== undefined) {
      updateData.position = position
    }
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (tags !== undefined) updateData.tags = tags

    // Wrap both the assignee mappings deletion/insertion and the prisma.task.update query in a single unified transaction block
    const updatedTask = await prisma.$transaction(async (tx) => {
      // Execute project-level lock
      await tx.$executeRaw`SELECT id FROM "Project" WHERE id = ${existingTask.projectId} FOR UPDATE`

      if (position === undefined && status !== undefined) {
        const targetDbStatus = status === 'COMPLETED' ? 'DONE' : status
        if (targetDbStatus !== existingTask.status) {
          const lastTaskInColumn = await tx.task.findFirst({
            where: {
              projectId: existingTask.projectId,
              status: targetDbStatus
            },
            orderBy: { position: 'desc' }
          })
          updateData.position = lastTaskInColumn ? lastTaskInColumn.position + 1 : 0
        }
      }

      // Re-create assignee links if assigneeId is provided
      if ('assigneeId' in body) {
        await tx.taskAssignment.deleteMany({
          where: { taskId: id },
        })

        if (assigneeId) {
          await tx.taskAssignment.create({
            data: {
              taskId: id,
              userId: assigneeId,
            },
          })
        }
      }

      return await tx.task.update({
        where: { id },
        data: updateData,
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
        },
      })
    })

    const firstAssignee = updatedTask.assignees[0]?.user
    const mappedTask = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description || undefined,
      status: updatedTask.status === 'DONE' ? 'COMPLETED' : updatedTask.status,
      priority: updatedTask.priority,
      dueDate: updatedTask.dueDate || undefined,
      tags: updatedTask.tags,
      attachments: 0,
      comments: updatedTask._count.comments,
      assignee: firstAssignee
        ? {
            id: firstAssignee.id,
            name: firstAssignee.name || firstAssignee.email,
            avatar: firstAssignee.avatarUrl || undefined,
          }
        : undefined,
      createdAt: updatedTask.createdAt,
      updatedAt: updatedTask.updatedAt,
    }

    return NextResponse.json({ task: mappedTask })
  } catch (error) {
    console.error('[Tasks API PUT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// DELETE: Deletes a single task or bulk deletion
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const workspace = await getCurrentOrganization()

    if (!workspace) {
      return NextResponse.json({ error: 'No active workspace found' }, { status: 404 })
    }

    if (id) {
      const task = await prisma.task.findFirst({
        where: {
          id,
          project: {
            workspaceId: workspace.id,
          },
        },
      })

      if (!task) {
        return NextResponse.json({ error: 'Task not found or access denied' }, { status: 404 })
      }

      await prisma.task.delete({
        where: { id },
      })

      return NextResponse.json({ success: true, message: 'Task deleted successfully' })
    } else {
      let body
      try {
        body = await request.json()
      } catch (error) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
      }
      
      const { ids } = body

      if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({ error: 'Invalid or missing ids list' }, { status: 400 })
      }

      const uniqueIds = Array.from(new Set(ids))

      const count = await prisma.task.count({
        where: {
          id: { in: uniqueIds },
          project: {
            workspaceId: workspace.id,
          },
        },
      })

      if (count !== uniqueIds.length) {
        return NextResponse.json({ error: 'Some tasks not found or access denied' }, { status: 403 })
      }

      await prisma.task.deleteMany({
        where: {
          id: { in: uniqueIds },
        },
      })

      return NextResponse.json({ success: true, message: `${uniqueIds.length} tasks deleted successfully` })
    }
  } catch (error) {
    console.error('[Tasks API DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete task(s)' },
      { status: 500 }
    )
  }
}
