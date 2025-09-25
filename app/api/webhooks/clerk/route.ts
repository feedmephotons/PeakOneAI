import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    try {
      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email: email_addresses[0].email_address,
          firstName: first_name || null,
          lastName: last_name || null,
          avatarUrl: image_url || null,
        },
        create: {
          id: id,
          clerkId: id,
          email: email_addresses[0].email_address,
          firstName: first_name || null,
          lastName: last_name || null,
          avatarUrl: image_url || null,
        },
      })
    } catch (error) {
      console.error('Error syncing user:', error)
    }
  }

  if (eventType === 'organization.created' || eventType === 'organization.updated') {
    const { id, name, slug, image_url, public_metadata } = evt.data

    try {
      await prisma.workspace.upsert({
        where: { clerkOrgId: id },
        update: {
          name,
          slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
          logoUrl: image_url || null,
          metadata: public_metadata as Record<string, unknown>,
        },
        create: {
          id: id,
          clerkOrgId: id,
          name,
          slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
          logoUrl: image_url || null,
          metadata: public_metadata as Record<string, unknown>,
        },
      })
    } catch (error) {
      console.error('Error syncing organization:', error)
    }
  }

  if (eventType === 'organizationMembership.created') {
    const { organization, public_user_data, role } = evt.data

    try {
      // First ensure user exists
      const user = await prisma.user.upsert({
        where: { clerkId: public_user_data.user_id },
        update: {},
        create: {
          id: public_user_data.user_id,
          clerkId: public_user_data.user_id,
          email: public_user_data.identifier || '',
          firstName: public_user_data.first_name || null,
          lastName: public_user_data.last_name || null,
          avatarUrl: public_user_data.image_url || null,
        },
      })

      // Then create membership
      await prisma.userWorkspace.create({
        data: {
          userId: user.id,
          workspaceId: organization.id,
          role: role === 'admin' ? 'ADMIN' : 'MEMBER',
        },
      })
    } catch (error) {
      console.error('Error syncing membership:', error)
    }
  }

  if (eventType === 'organizationMembership.deleted') {
    const { organization, public_user_data } = evt.data

    try {
      await prisma.userWorkspace.delete({
        where: {
          userId_workspaceId: {
            userId: public_user_data.user_id,
            workspaceId: organization.id,
          },
        },
      })
    } catch (error) {
      console.error('Error removing membership:', error)
    }
  }

  return new Response('Webhook processed', { status: 200 })
}