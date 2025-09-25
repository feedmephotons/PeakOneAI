import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  // Get or create user in database
  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email: clerkUser.emailAddresses[0].emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      avatarUrl: clerkUser.imageUrl,
    },
    create: {
      id: clerkUser.id,
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      avatarUrl: clerkUser.imageUrl,
    },
  })

  return user
}

export async function getCurrentOrganization() {
  const { orgId } = await auth()

  if (!orgId) {
    return null
  }

  // Get organization from database
  const workspace = await prisma.workspace.findUnique({
    where: { clerkOrgId: orgId },
  })

  return workspace
}

export async function requireAuth() {
  const user = await getCurrentUser()

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