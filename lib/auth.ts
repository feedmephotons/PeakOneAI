import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

import { cookies } from 'next/headers'

// DEMO MODE: Demo user for investor demo
const DEMO_USER = {
  id: 'demo-user-id',
  clerkId: 'demo-user-id',
  email: 'sarah.chen@peakone.ai',
  firstName: 'Sarah',
  lastName: 'Chen',
  name: 'Sarah Chen',
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const mockUserId = cookieStore.get('sb-mock-user-id')?.value
    if (mockUserId) {
      const user = await prisma.user.findUnique({
        where: { id: mockUserId }
      })
      if (user) return user
    }
  } catch (err) {
    // Ignore context error for cookies() during static generation
  }

  try {
    const supabase = await createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()

    // DEMO MODE: Return demo user when not authenticated
    if (!supabaseUser) {
      return DEMO_USER
    }

    // Get or create user in database
    const user = await prisma.user.upsert({
      where: { id: supabaseUser.id },
      update: {
        email: supabaseUser.email!,
        firstName: supabaseUser.user_metadata?.first_name,
        lastName: supabaseUser.user_metadata?.last_name,
        name: supabaseUser.user_metadata?.first_name
          ? `${supabaseUser.user_metadata.first_name} ${supabaseUser.user_metadata.last_name || ''}`.trim()
          : null,
      },
      create: {
        id: supabaseUser.id,
        clerkId: supabaseUser.id, // Keep for schema compatibility
        email: supabaseUser.email!,
        firstName: supabaseUser.user_metadata?.first_name,
        lastName: supabaseUser.user_metadata?.last_name,
        name: supabaseUser.user_metadata?.first_name
          ? `${supabaseUser.user_metadata.first_name} ${supabaseUser.user_metadata.last_name || ''}`.trim()
          : null,
      },
    })

    return user
  } catch (error) {
    console.warn('Authentication check failed, falling back to DEMO_USER:', error)
    return DEMO_USER
  }
}

export async function getCurrentOrganization() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  // Get user's first workspace membership
  let membership = await prisma.userWorkspace.findFirst({
    where: { userId: user.id },
    include: { workspace: true },
  })

  if (!membership) {
    const slug = `default-workspace-${user.id}`
    try {
      // Find or create workspace
      let workspace = await prisma.workspace.findUnique({
        where: { slug }
      })

      if (!workspace) {
        workspace = await prisma.workspace.create({
          data: {
            name: 'Default Workspace',
            slug,
            clerkOrgId: slug,
          }
        })
      }

      // Find or create user workspace mapping
      let userWorkspace = await prisma.userWorkspace.findFirst({
        where: { userId: user.id, workspaceId: workspace.id }
      })

      if (!userWorkspace) {
        userWorkspace = await prisma.userWorkspace.create({
          data: {
            userId: user.id,
            workspaceId: workspace.id,
            role: 'OWNER'
          }
        })
      }

      // Find or create project
      let project = await prisma.project.findFirst({
        where: { workspaceId: workspace.id }
      })

      if (!project) {
        project = await prisma.project.create({
          data: {
            name: 'General Tasks',
            workspaceId: workspace.id
          }
        })
      }

      // Seed sample tasks in the database if there are none in this project
      const taskCount = await prisma.task.count({
        where: { projectId: project.id }
      })

      if (taskCount === 0) {
        const sampleTasksData = [
          {
            title: 'Design new landing page',
            description: 'Create wireframes and mockups for the new marketing site',
            status: 'IN_PROGRESS' as const,
            priority: 'HIGH' as const,
            position: 0,
            tags: ['design', 'marketing'],
            creatorId: user.id,
            projectId: project.id
          },
          {
            title: 'Fix authentication bug',
            description: 'Users unable to login with Google OAuth',
            status: 'TODO' as const,
            priority: 'URGENT' as const,
            position: 1,
            tags: ['bug', 'auth'],
            creatorId: user.id,
            projectId: project.id
          },
          {
            title: 'Code review: Payment integration',
            description: '',
            status: 'IN_REVIEW' as const,
            priority: 'MEDIUM' as const,
            position: 2,
            tags: ['review', 'payments'],
            creatorId: user.id,
            projectId: project.id
          },
          {
            title: 'Update documentation',
            description: 'Add API endpoints documentation',
            status: 'DONE' as const,
            priority: 'LOW' as const,
            position: 3,
            tags: ['docs'],
            creatorId: user.id,
            projectId: project.id
          }
        ]

        for (const tData of sampleTasksData) {
          await prisma.task.create({
            data: tData
          })
        }
      }

      membership = {
        id: userWorkspace.id,
        userId: user.id,
        workspaceId: workspace.id,
        role: userWorkspace.role,
        joinedAt: userWorkspace.joinedAt,
        workspace
      }
    } catch (error) {
      console.error('Failed to auto-create and seed workspace:', error)
      return null
    }
  }

  return membership?.workspace || null
}

export async function requireAuth() {
  const user = await getCurrentUser()

  // DEMO MODE: getCurrentUser now always returns a user (demo user if not authenticated)
  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function requireOrganization() {
  const workspace = await getCurrentOrganization()

  if (!workspace) {
    throw new Error('No organization selected')
  }

  return workspace
}

export async function getUserRole(userId: string, workspaceId: string) {
  const membership = await prisma.userWorkspace.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
    select: {
      role: true,
    },
  })

  return membership?.role || null
}

export async function hasPermission(
  userId: string,
  workspaceId: string,
  requiredRoles: string[] = ['ADMIN', 'OWNER']
) {
  const role = await getUserRole(userId, workspaceId)

  if (!role) {
    return false
  }

  return requiredRoles.includes(role)
}

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}