import { prisma } from '@/lib/prisma'
import { getCurrentOrganization, getCurrentUser } from '@/lib/auth'

/**
 * Get Prisma client with automatic organization filtering
 * This ensures all queries are scoped to the current organization
 */
export async function getTenantPrisma() {
  const workspace = await getCurrentOrganization()

  if (!workspace) {
    throw new Error('No organization context')
  }

  // Return a proxy that automatically adds workspaceId to queries
  return new Proxy(prisma, {
    get(target, prop: string) {
      const originalModel = (target as any)[prop]

      if (!originalModel || typeof originalModel !== 'object') {
        return originalModel
      }

      return new Proxy(originalModel, {
        get(modelTarget, modelProp: string) {
          const originalMethod = modelTarget[modelProp]

          if (typeof originalMethod !== 'function') {
            return originalMethod
          }

          // Intercept query methods
          return function(...args: any[]) {
            const [queryArgs] = args

            // Add workspaceId to where clause for find operations
            if (
              ['findFirst', 'findMany', 'findUnique', 'count'].includes(modelProp) &&
              queryArgs
            ) {
              queryArgs.where = {
                ...queryArgs.where,
                workspaceId: workspace.id,
              }
            }

            // Add workspaceId to data for create operations
            if (modelProp === 'create' && queryArgs?.data) {
              queryArgs.data.workspaceId = workspace.id
            }

            // Add workspaceId to data for createMany operations
            if (modelProp === 'createMany' && queryArgs?.data) {
              if (Array.isArray(queryArgs.data)) {
                queryArgs.data = queryArgs.data.map((item: any) => ({
                  ...item,
                  workspaceId: workspace.id,
                }))
              } else {
                queryArgs.data.workspaceId = workspace.id
              }
            }

            // Add workspaceId to where clause for update operations
            if (
              ['update', 'updateMany', 'delete', 'deleteMany'].includes(modelProp) &&
              queryArgs
            ) {
              queryArgs.where = {
                ...queryArgs.where,
                workspaceId: workspace.id,
              }
            }

            return originalMethod.apply(modelTarget, args)
          }
        }
      })
    }
  })
}

/**
 * Create a new file with organization context
 */
export async function createTenantFile(data: {
  name: string
  mimeType: string
  size: number
  url: string
  folderId?: string
  aiSummary?: string
  aiTags?: string[]
}) {
  const workspace = await getCurrentOrganization()
  const user = await getCurrentUser()

  if (!workspace || !user) {
    throw new Error('Authentication required')
  }

  return prisma.file.create({
    data: {
      ...data,
      size: BigInt(data.size),
      workspaceId: workspace.id,
      uploaderId: user.id,
    },
  })
}

/**
 * Get files for the current organization
 */
export async function getTenantFiles(folderId?: string) {
  const workspace = await getCurrentOrganization()

  if (!workspace) {
    throw new Error('No organization context')
  }

  return prisma.file.findMany({
    where: {
      workspaceId: workspace.id,
      folderId: folderId || null,
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

/**
 * Get tasks for the current organization
 */
export async function getTenantTasks(projectId?: string) {
  const workspace = await getCurrentOrganization()

  if (!workspace) {
    throw new Error('No organization context')
  }

  const where: any = {
    project: {
      workspaceId: workspace.id,
    },
  }

  if (projectId) {
    where.projectId = projectId
  }

  return prisma.task.findMany({
    where,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      assignees: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      position: 'asc',
    },
  })
}

/**
 * Get workspace members
 */
export async function getWorkspaceMembers() {
  const workspace = await getCurrentOrganization()

  if (!workspace) {
    throw new Error('No organization context')
  }

  return prisma.userWorkspace.findMany({
    where: {
      workspaceId: workspace.id,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      joinedAt: 'asc',
    },
  })
}