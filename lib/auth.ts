import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user: supabaseUser } } = await supabase.auth.getUser()

  if (!supabaseUser) {
    return null
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
}

export async function getCurrentOrganization() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  // Get user's first workspace membership
  const membership = await prisma.userWorkspace.findFirst({
    where: { userId: user.id },
    include: { workspace: true },
  })

  return membership?.workspace || null
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

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}