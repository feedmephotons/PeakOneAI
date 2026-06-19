import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, getCurrentOrganization } from '@/lib/auth'

async function getOrCreateWorkspace(user: any) {
  let workspace = await getCurrentOrganization()
  if (!workspace) {
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
    } catch (e) {
      workspace = await prisma.workspace.findUnique({
        where: { slug },
      })
      if (!workspace) throw e;
    }

    try {
      const mappingExists = await prisma.userWorkspace.findFirst({
        where: { userId: user.id, workspaceId: workspace.id },
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
    } catch (e) {
      // Ignore concurrent inserts
    }
  }
  return workspace;
}

const DEFAULT_CONTACTS = [
  { name: 'Sarah Johnson', phoneNumber: '+1 (555) 123-4567', email: 'sarah@company.com', company: 'Acme Corp', favorite: true },
  { name: 'Michael Chen', phoneNumber: '+1 (555) 987-6543', email: 'michael@tech.com', company: 'Tech Solutions', favorite: false },
  { name: 'Emily Davis', phoneNumber: '+1 (555) 456-7890', email: 'emily@design.com', company: 'Design Studio', favorite: false },
  { name: 'David Wilson', phoneNumber: '+1 (555) 321-6547', email: 'david@finance.com', company: 'Finance Inc', favorite: true }
]

// GET: Retrieve contacts for workspace (and seed if empty)
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    const workspace = await getOrCreateWorkspace(user)

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const totalCount = await prisma.contact.count({
      where: { workspaceId: workspace.id }
    })

    if (totalCount === 0) {
      // Auto seed contacts
      await Promise.all(
        DEFAULT_CONTACTS.map((c) =>
          prisma.contact.create({
            data: {
              ...c,
              workspaceId: workspace.id,
            },
          })
        )
      )
    }

    const contacts = await prisma.contact.findMany({
      where: {
        workspaceId: workspace.id,
        OR: search
          ? [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { company: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, contacts })
  } catch (error) {
    console.error('[Contacts API GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve contacts' },
      { status: 500 }
    )
  }
}

// POST: Create a new contact
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    const workspace = await getOrCreateWorkspace(user)

    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
    }

    const { name, phoneNumber, email, company, favorite } = body

    if (!name || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Name and Phone Number are required' },
        { status: 400 }
      )
    }

    const newContact = await prisma.contact.create({
      data: {
        name,
        phoneNumber,
        email: email || null,
        company: company || null,
        favorite: !!favorite,
        workspaceId: workspace.id,
      },
    })

    return NextResponse.json({ success: true, contact: newContact }, { status: 201 })
  } catch (error) {
    console.error('[Contacts API POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}
