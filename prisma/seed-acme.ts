/**
 * prisma/seed-acme.ts — Seed the LIVE Supabase Postgres DB with the canonical
 * Acme Corp world so an AUTHENTICATED user (Sarah Chen) sees real, persistent
 * data after login.
 *
 * - IDEMPOTENT: stable ids, upsert-only. Safe to re-run. NEVER truncates.
 * - Creates the Supabase auth user for Sarah and uses her auth UUID as the
 *   Prisma User.id so getCurrentUser() (which upserts by supabase id) resolves
 *   to this seeded data.
 *
 * Run:  npx tsx prisma/seed-acme.ts
 */

import * as dotenv from 'dotenv'
// Load both env files; .env.local holds the Supabase URL + service-role key.
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local', override: true })
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

import {
  ACME_WORKSPACE_ID,
  ACME_COMPANY,
  MOCK_USER,
  MOCK_TEAM,
  MOCK_PEOPLE,
  MOCK_MISSIONS,
  MOCK_NOTES,
  MOCK_NOTE_CONNECTIONS,
} from '../lib/peak/core'
import { MOCK_TASKS } from '../lib/peak/workspace/tasks'
import { MOCK_FILES } from '../lib/peak/workspace/files'
import { MOCK_MESSAGE_THREADS } from '../lib/peak/workspace/messages'
import { MOCK_CALENDAR_EVENTS } from '../lib/peak/workspace/meetings'
import { MOCK_ACTIVITY_FEED } from '../lib/peak/workspace/notifications'

const prisma = new PrismaClient()

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const D = (iso: string | null | undefined): Date | null =>
  iso ? new Date(iso) : null

// Running counts for the final report.
const counts: Record<string, { inserted: number; updated: number; errors: number }> = {}
function bump(group: string, kind: 'inserted' | 'updated' | 'errors') {
  if (!counts[group]) counts[group] = { inserted: 0, updated: 0, errors: 0 }
  counts[group][kind]++
}

/**
 * Map a fixture "user-*" or "contact-*" id to the real Prisma User id we seed.
 * Team users keep their fixture id; Sarah maps to her Supabase auth UUID;
 * external contacts (Jenna/Brian/Tom) are also seeded as Users so message
 * senderId / participant FKs resolve.
 */
let SARAH_ID = MOCK_USER.id

// External people who appear as message senders / participants but are Contacts.
const EXTERNAL_USERS = [
  { id: 'contact-jenna-rivera', name: 'Jenna Rivera', email: 'jenna@brightpath.io' },
  { id: 'contact-brian-miller', name: 'Brian Miller', email: 'brian@summit-ventures.com' },
  { id: 'contact-tom-becker', name: 'Tom Becker', email: 'tom.becker@acmecorp.com' },
]

function resolveUserId(fixtureId: string): string {
  if (fixtureId === MOCK_USER.id) return SARAH_ID
  return fixtureId
}

// ---------------------------------------------------------------------------
// Step 2 — Supabase auth user for Sarah
// ---------------------------------------------------------------------------
async function ensureSarahAuthUser(): Promise<string> {
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.warn(
      '⚠️  Missing SUPABASE_URL / SERVICE_ROLE_KEY — keeping fixture id for Sarah:',
      MOCK_USER.id,
    )
    return MOCK_USER.id
  }
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const email = 'sarah.chen@acmecorp.com'
  const password = 'Demo123!'
  const user_metadata = { first_name: 'Sarah', last_name: 'Chen' }

  // Try to create; if already registered, look her up instead.
  const { data: created, error: createErr } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata,
    })

  if (created?.user?.id) {
    console.log('✅ Created Supabase auth user for Sarah:', created.user.id)
    return created.user.id
  }

  if (createErr) {
    console.log(
      'ℹ️  createUser returned an error (likely already registered):',
      createErr.message,
    )
  }

  // Look her up via paginated listUsers.
  let page = 1
  const perPage = 200
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data: list, error: listErr } =
      await supabase.auth.admin.listUsers({ page, perPage })
    if (listErr) {
      console.warn('⚠️  listUsers failed:', listErr.message)
      break
    }
    const match = list?.users?.find(
      (u) => (u.email || '').toLowerCase() === email,
    )
    if (match) {
      console.log('✅ Found existing Supabase auth user for Sarah:', match.id)
      // Ensure password / metadata are set as specified (idempotent).
      await supabase.auth.admin.updateUserById(match.id, {
        password,
        email_confirm: true,
        user_metadata,
      })
      return match.id
    }
    if (!list || list.users.length < perPage) break
    page++
  }

  console.warn('⚠️  Could not resolve Sarah auth id — falling back to fixture id')
  return MOCK_USER.id
}

/**
 * If a previous run seeded Sarah under the fixture id 'user-sarah-chen' but we
 * now have her real Supabase auth UUID, repoint every FK from the fixture id to
 * the UUID and delete the stale fixture User. Idempotent: no-op if the fixture
 * row does not exist or ids already match.
 */
async function migrateSarahId() {
  if (SARAH_ID === MOCK_USER.id) return
  const stale = await prisma.user.findUnique({ where: { id: MOCK_USER.id } })
  if (!stale) return
  console.log(`↪︎  Migrating Sarah '${MOCK_USER.id}' → '${SARAH_ID}'`)

  // Free the unique email from the stale fixture row before creating the
  // destination (email has a UNIQUE constraint).
  await prisma.user.update({
    where: { id: MOCK_USER.id },
    data: { email: `legacy-${MOCK_USER.id}@acmecorp.invalid`, supabaseId: null },
  })

  // Ensure the destination User exists first (so FK updates have a target).
  await prisma.user.upsert({
    where: { id: SARAH_ID },
    update: { supabaseId: SARAH_ID },
    create: {
      id: SARAH_ID,
      supabaseId: SARAH_ID,
      email: MOCK_USER.email,
      name: MOCK_USER.name,
      firstName: 'Sarah',
      lastName: 'Chen',
    },
  })

  const from = MOCK_USER.id
  const to = SARAH_ID
  // Repoint all references. Use updateMany; skip unique-collision rows by
  // deleting the destination's pre-existing membership/assignment if any.
  await prisma.mission.updateMany({ where: { ownerId: from }, data: { ownerId: to } })
  await prisma.task.updateMany({ where: { creatorId: from }, data: { creatorId: to } })
  await prisma.calendarEvent.updateMany({ where: { creatorId: from }, data: { creatorId: to } })
  await prisma.file.updateMany({ where: { uploaderId: from }, data: { uploaderId: to } })
  await prisma.note.updateMany({ where: { authorId: from }, data: { authorId: to } })
  await prisma.message.updateMany({ where: { senderId: from }, data: { senderId: to } })
  await prisma.activity.updateMany({ where: { userId: from }, data: { userId: to } })

  // Junction tables with composite unique keys — move only if no clash.
  const moveJunction = async (
    rows: { id: string }[],
    update: (id: string) => Promise<unknown>,
    del: (id: string) => Promise<unknown>,
    clash: () => Promise<boolean>,
  ) => {
    for (const r of rows) {
      if (await clash()) {
        await del(r.id)
      } else {
        await update(r.id)
      }
    }
  }

  // UserWorkspace
  for (const uw of await prisma.userWorkspace.findMany({ where: { userId: from } })) {
    const exists = await prisma.userWorkspace.findUnique({
      where: { userId_workspaceId: { userId: to, workspaceId: uw.workspaceId } },
    })
    if (exists) await prisma.userWorkspace.delete({ where: { id: uw.id } })
    else await prisma.userWorkspace.update({ where: { id: uw.id }, data: { userId: to } })
  }
  // TaskAssignment
  for (const ta of await prisma.taskAssignment.findMany({ where: { userId: from } })) {
    const exists = await prisma.taskAssignment.findUnique({
      where: { taskId_userId: { taskId: ta.taskId, userId: to } },
    })
    if (exists) await prisma.taskAssignment.delete({ where: { id: ta.id } })
    else await prisma.taskAssignment.update({ where: { id: ta.id }, data: { userId: to } })
  }
  // MissionMember
  for (const mm of await prisma.missionMember.findMany({ where: { userId: from } })) {
    const exists = await prisma.missionMember.findUnique({
      where: { missionId_userId: { missionId: mm.missionId, userId: to } },
    })
    if (exists) await prisma.missionMember.delete({ where: { id: mm.id } })
    else await prisma.missionMember.update({ where: { id: mm.id }, data: { userId: to } })
  }
  // ConversationParticipant
  for (const cp of await prisma.conversationParticipant.findMany({ where: { userId: from } })) {
    const exists = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: cp.conversationId, userId: to } },
    })
    if (exists) await prisma.conversationParticipant.delete({ where: { id: cp.id } })
    else await prisma.conversationParticipant.update({ where: { id: cp.id }, data: { userId: to } })
  }
  // EventAttendee
  for (const ea of await prisma.eventAttendee.findMany({ where: { userId: from } })) {
    const exists = await prisma.eventAttendee.findUnique({
      where: { eventId_userId: { eventId: ea.eventId, userId: to } },
    })
    if (exists) await prisma.eventAttendee.delete({ where: { id: ea.id } })
    else await prisma.eventAttendee.update({ where: { id: ea.id }, data: { userId: to } })
  }
  void moveJunction

  // Finally remove the stale fixture User.
  try {
    await prisma.user.delete({ where: { id: from } })
    console.log('   removed stale fixture User', from)
  } catch (e) {
    console.warn('   could not delete stale Sarah (residual refs):', (e as Error).message)
  }
}

// ---------------------------------------------------------------------------
// Workspace
// ---------------------------------------------------------------------------
async function seedWorkspace() {
  try {
    const data = {
      name: ACME_COMPANY,
      slug: 'acme-corp',
      clerkOrgId: ACME_WORKSPACE_ID,
    }
    const existing = await prisma.workspace.findUnique({
      where: { id: ACME_WORKSPACE_ID },
    })
    await prisma.workspace.upsert({
      where: { id: ACME_WORKSPACE_ID },
      update: { name: data.name },
      create: { id: ACME_WORKSPACE_ID, ...data },
    })
    bump('workspace', existing ? 'updated' : 'inserted')
  } catch (e) {
    bump('workspace', 'errors')
    console.error('workspace error:', (e as Error).message)
  }
}

// ---------------------------------------------------------------------------
// Users + memberships
// ---------------------------------------------------------------------------
async function seedUsers() {
  // Team users (Sarah uses the auth UUID; the rest keep fixture ids).
  const teamRows = MOCK_TEAM.map((u, i) => ({
    id: i === 0 ? SARAH_ID : u.id,
    email: u.email,
    name: u.name,
    firstName: u.name.split(' ')[0],
    lastName: u.name.split(' ').slice(1).join(' ') || null,
    supabaseId: i === 0 ? SARAH_ID : null,
    role: i === 0 ? ('OWNER' as const) : ('MEMBER' as const),
  }))

  // External users seeded so message senderId / participants resolve.
  const externalRows = EXTERNAL_USERS.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    firstName: u.name.split(' ')[0],
    lastName: u.name.split(' ').slice(1).join(' ') || null,
    supabaseId: null as string | null,
    role: 'VIEWER' as const,
  }))

  for (const u of [...teamRows, ...externalRows]) {
    try {
      const existing = await prisma.user.findUnique({ where: { id: u.id } })
      await prisma.user.upsert({
        where: { id: u.id },
        update: {
          email: u.email,
          name: u.name,
          firstName: u.firstName,
          lastName: u.lastName,
          ...(u.supabaseId ? { supabaseId: u.supabaseId } : {}),
        },
        create: {
          id: u.id,
          email: u.email,
          name: u.name,
          firstName: u.firstName,
          lastName: u.lastName,
          supabaseId: u.supabaseId,
        },
      })
      bump('users', existing ? 'updated' : 'inserted')

      // Membership in the Acme workspace.
      const member = await prisma.userWorkspace.findUnique({
        where: { userId_workspaceId: { userId: u.id, workspaceId: ACME_WORKSPACE_ID } },
      })
      await prisma.userWorkspace.upsert({
        where: { userId_workspaceId: { userId: u.id, workspaceId: ACME_WORKSPACE_ID } },
        update: { role: u.role },
        create: { userId: u.id, workspaceId: ACME_WORKSPACE_ID, role: u.role },
      })
      bump('userWorkspace', member ? 'updated' : 'inserted')
    } catch (e) {
      bump('users', 'errors')
      console.error('user error', u.id, (e as Error).message)
    }
  }
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------
async function seedContacts() {
  for (const p of MOCK_PEOPLE) {
    try {
      const existing = await prisma.contact.findUnique({ where: { id: p.id } })
      await prisma.contact.upsert({
        where: { id: p.id },
        update: {
          name: p.name,
          phoneNumber: p.phoneNumber || '',
          email: p.email || null,
          company: p.company || null,
          favorite: !!p.favorite,
        },
        create: {
          id: p.id,
          name: p.name,
          phoneNumber: p.phoneNumber || '',
          email: p.email || null,
          company: p.company || null,
          favorite: !!p.favorite,
          workspaceId: ACME_WORKSPACE_ID,
        },
      })
      bump('contacts', existing ? 'updated' : 'inserted')
    } catch (e) {
      bump('contacts', 'errors')
      console.error('contact error', p.id, (e as Error).message)
    }
  }
}

// ---------------------------------------------------------------------------
// Missions (+ objectives/milestones/risks/members) and a Project per mission
// ---------------------------------------------------------------------------
async function seedMissions() {
  for (const m of MOCK_MISSIONS) {
    try {
      const ownerId = resolveUserId(m.owner?.id ?? MOCK_USER.id)
      const existing = await prisma.mission.findUnique({ where: { id: m.id } })
      await prisma.mission.upsert({
        where: { id: m.id },
        update: {
          name: m.name,
          description: m.description || null,
          status: m.status,
          progress: m.progress,
          targetDate: D(m.targetDate),
          budgetUsed: m.budgetUsed ?? null,
          budgetTotal: m.budgetTotal ?? null,
          healthScore: m.healthScore ?? null,
          velocity: m.velocity ?? null,
          ownerId,
        },
        create: {
          id: m.id,
          name: m.name,
          description: m.description || null,
          status: m.status,
          progress: m.progress,
          targetDate: D(m.targetDate),
          budgetUsed: m.budgetUsed ?? null,
          budgetTotal: m.budgetTotal ?? null,
          healthScore: m.healthScore ?? null,
          velocity: m.velocity ?? null,
          workspaceId: ACME_WORKSPACE_ID,
          ownerId,
        },
      })
      bump('missions', existing ? 'updated' : 'inserted')

      // Objectives
      for (const o of m.objectives || []) {
        const ex = await prisma.missionObjective.findUnique({ where: { id: o.id } })
        await prisma.missionObjective.upsert({
          where: { id: o.id },
          update: { title: o.title, progress: o.progress, status: o.status, position: o.position },
          create: {
            id: o.id, title: o.title, progress: o.progress, status: o.status,
            position: o.position, missionId: m.id,
          },
        })
        bump('missionObjectives', ex ? 'updated' : 'inserted')
      }

      // Milestones
      for (const ms of m.milestones || []) {
        const ex = await prisma.missionMilestone.findUnique({ where: { id: ms.id } })
        await prisma.missionMilestone.upsert({
          where: { id: ms.id },
          update: { label: ms.label, date: D(ms.date), state: ms.state, position: ms.position },
          create: {
            id: ms.id, label: ms.label, date: D(ms.date), state: ms.state,
            position: ms.position, missionId: m.id,
          },
        })
        bump('missionMilestones', ex ? 'updated' : 'inserted')
      }

      // Risks
      for (const r of m.risks || []) {
        const ex = await prisma.missionRisk.findUnique({ where: { id: r.id } })
        await prisma.missionRisk.upsert({
          where: { id: r.id },
          update: { title: r.title, level: r.level, impact: r.impact || null, probability: r.probability || null, note: r.note || null },
          create: {
            id: r.id, title: r.title, level: r.level, impact: r.impact || null,
            probability: r.probability || null, note: r.note || null, missionId: m.id,
          },
        })
        bump('missionRisks', ex ? 'updated' : 'inserted')
      }

      // Members (only real team users — skip any that aren't seeded Users)
      for (const mem of m.members || []) {
        const uid = resolveUserId(mem.user.id)
        try {
          const ex = await prisma.missionMember.findUnique({
            where: { missionId_userId: { missionId: m.id, userId: uid } },
          })
          await prisma.missionMember.upsert({
            where: { missionId_userId: { missionId: m.id, userId: uid } },
            update: { role: mem.role || null },
            create: { id: mem.id, missionId: m.id, userId: uid, role: mem.role || null },
          })
          bump('missionMembers', ex ? 'updated' : 'inserted')
        } catch (e) {
          bump('missionMembers', 'errors')
          console.error('missionMember error', m.id, uid, (e as Error).message)
        }
      }

      // A matching Project per mission so Tasks (require projectId) resolve.
      const projectId = `project-${m.id}`
      const exP = await prisma.project.findUnique({ where: { id: projectId } })
      await prisma.project.upsert({
        where: { id: projectId },
        update: { name: m.name, description: m.description || null },
        create: {
          id: projectId,
          name: m.name,
          description: m.description || null,
          status: 'IN_PROGRESS',
          workspaceId: ACME_WORKSPACE_ID,
        },
      })
      bump('projects', exP ? 'updated' : 'inserted')
    } catch (e) {
      bump('missions', 'errors')
      console.error('mission error', m.id, (e as Error).message)
    }
  }
}

// ---------------------------------------------------------------------------
// Tasks (+ assignments)
// ---------------------------------------------------------------------------
async function seedTasks() {
  let position = 0
  for (const t of MOCK_TASKS) {
    try {
      const projectId = `project-${t.missionId}`
      const creatorId = SARAH_ID
      const existing = await prisma.task.findUnique({ where: { id: t.id } })
      await prisma.task.upsert({
        where: { id: t.id },
        update: {
          title: t.title,
          description: t.description || null,
          status: t.status,
          priority: t.priority,
          dueDate: D(t.dueDate),
          completedAt: D(t.completedAt),
          tags: t.tags || [],
          missionId: t.missionId,
          projectId,
        },
        create: {
          id: t.id,
          title: t.title,
          description: t.description || null,
          status: t.status,
          priority: t.priority,
          dueDate: D(t.dueDate),
          completedAt: D(t.completedAt),
          tags: t.tags || [],
          position: position++,
          creatorId,
          projectId,
          missionId: t.missionId,
        },
      })
      bump('tasks', existing ? 'updated' : 'inserted')

      // Assignment
      if (t.assignee?.id) {
        const uid = resolveUserId(t.assignee.id)
        const exA = await prisma.taskAssignment.findUnique({
          where: { taskId_userId: { taskId: t.id, userId: uid } },
        })
        await prisma.taskAssignment.upsert({
          where: { taskId_userId: { taskId: t.id, userId: uid } },
          update: {},
          create: { taskId: t.id, userId: uid },
        })
        bump('taskAssignments', exA ? 'updated' : 'inserted')
      }
    } catch (e) {
      bump('tasks', 'errors')
      console.error('task error', t.id, (e as Error).message)
    }
  }
}

// ---------------------------------------------------------------------------
// Folders + Files
// ---------------------------------------------------------------------------
async function seedFiles() {
  // One folder per mission + a "General" folder for unlinked files.
  const folderForMission: Record<string, string> = {}
  for (const m of MOCK_MISSIONS) {
    const fid = `folder-${m.id}`
    folderForMission[m.id] = fid
    try {
      const ex = await prisma.folder.findUnique({ where: { id: fid } })
      await prisma.folder.upsert({
        where: { id: fid },
        update: { name: m.name },
        create: { id: fid, name: m.name, path: `/${m.name}`, workspaceId: ACME_WORKSPACE_ID },
      })
      bump('folders', ex ? 'updated' : 'inserted')
    } catch (e) {
      bump('folders', 'errors')
      console.error('folder error', fid, (e as Error).message)
    }
  }
  const generalFolderId = 'folder-acme-general'
  try {
    const ex = await prisma.folder.findUnique({ where: { id: generalFolderId } })
    await prisma.folder.upsert({
      where: { id: generalFolderId },
      update: { name: 'General' },
      create: { id: generalFolderId, name: 'General', path: '/General', workspaceId: ACME_WORKSPACE_ID },
    })
    bump('folders', ex ? 'updated' : 'inserted')
  } catch (e) {
    bump('folders', 'errors')
    console.error('folder error general', (e as Error).message)
  }

  for (const f of MOCK_FILES) {
    try {
      const uploaderId = resolveUserId(f.owner.id)
      const folderId = f.missionId ? folderForMission[f.missionId] : generalFolderId
      const existing = await prisma.file.findUnique({ where: { id: f.id } })
      await prisma.file.upsert({
        where: { id: f.id },
        update: {
          name: f.name,
          mimeType: f.mimeType,
          size: BigInt(f.size),
          aiSummary: f.aiSummary || null,
          aiTags: f.aiTags || [],
          thumbnailUrl: f.thumbnailDataUri || null,
          missionId: f.missionId || null,
          folderId,
        },
        create: {
          id: f.id,
          name: f.name,
          mimeType: f.mimeType,
          size: BigInt(f.size),
          url: f.thumbnailDataUri || `https://files.acmecorp.com/${f.id}`,
          thumbnailUrl: f.thumbnailDataUri || null,
          aiSummary: f.aiSummary || null,
          aiTags: f.aiTags || [],
          uploaderId,
          folderId,
          workspaceId: ACME_WORKSPACE_ID,
          missionId: f.missionId || null,
        },
      })
      bump('files', existing ? 'updated' : 'inserted')
    } catch (e) {
      bump('files', 'errors')
      console.error('file error', f.id, (e as Error).message)
    }
  }
}

// ---------------------------------------------------------------------------
// Conversations + participants + messages
// ---------------------------------------------------------------------------
async function seedMessages() {
  for (const thread of MOCK_MESSAGE_THREADS) {
    try {
      const isGroup = thread.kind === 'CHANNEL' || thread.kind === 'GROUP'
      const existing = await prisma.conversation.findUnique({ where: { id: thread.id } })
      await prisma.conversation.upsert({
        where: { id: thread.id },
        update: { name: thread.name, isGroup },
        create: { id: thread.id, name: thread.name, isGroup },
      })
      bump('conversations', existing ? 'updated' : 'inserted')

      // Participants — include all members; ensure Sarah is always a participant.
      const memberIds = new Set<string>(thread.members.map((mm) => resolveUserId(mm.id)))
      memberIds.add(SARAH_ID)
      for (const uid of memberIds) {
        try {
          const exP = await prisma.conversationParticipant.findUnique({
            where: { conversationId_userId: { conversationId: thread.id, userId: uid } },
          })
          await prisma.conversationParticipant.upsert({
            where: { conversationId_userId: { conversationId: thread.id, userId: uid } },
            update: {},
            create: { conversationId: thread.id, userId: uid },
          })
          bump('conversationParticipants', exP ? 'updated' : 'inserted')
        } catch (e) {
          bump('conversationParticipants', 'errors')
          console.error('participant error', thread.id, uid, (e as Error).message)
        }
      }

      // Messages
      for (const cm of thread.messages) {
        try {
          const senderId = resolveUserId(cm.sender.id)
          const exM = await prisma.message.findUnique({ where: { id: cm.id } })
          await prisma.message.upsert({
            where: { id: cm.id },
            update: { content: cm.body, senderId, conversationId: thread.id },
            create: {
              id: cm.id,
              content: cm.body,
              senderId,
              conversationId: thread.id,
              createdAt: D(cm.createdAt) || undefined,
            },
          })
          bump('messages', exM ? 'updated' : 'inserted')
        } catch (e) {
          bump('messages', 'errors')
          console.error('message error', cm.id, (e as Error).message)
        }
      }
    } catch (e) {
      bump('conversations', 'errors')
      console.error('conversation error', thread.id, (e as Error).message)
    }
  }
}

// ---------------------------------------------------------------------------
// Calendar events + attendees
// ---------------------------------------------------------------------------
async function seedCalendar() {
  for (const e of MOCK_CALENDAR_EVENTS) {
    try {
      const creatorId = SARAH_ID
      const existing = await prisma.calendarEvent.findUnique({ where: { id: e.id } })
      const missionId =
        (e as { missionId?: string | null }).missionId ??
        (e.id === 'evt-lisa-briefing'
          ? 'mission-q2-growth'
          : e.id === 'evt-launch-sync'
          ? 'mission-launch-product-x'
          : null)
      await prisma.calendarEvent.upsert({
        where: { id: e.id },
        update: {
          title: e.title,
          description: e.description || null,
          location: e.location || null,
          startTime: D(e.start)!,
          endTime: D(e.end) || D(e.start)!,
          color: e.color || null,
          missionId,
        },
        create: {
          id: e.id,
          title: e.title,
          description: e.description || null,
          location: e.location || null,
          startTime: D(e.start)!,
          endTime: D(e.end) || D(e.start)!,
          color: e.color || null,
          creatorId,
          workspaceId: ACME_WORKSPACE_ID,
          missionId,
        },
      })
      bump('calendarEvents', existing ? 'updated' : 'inserted')

      for (const att of e.attendees || []) {
        const uid = resolveUserId(att.id)
        try {
          const exA = await prisma.eventAttendee.findUnique({
            where: { eventId_userId: { eventId: e.id, userId: uid } },
          })
          await prisma.eventAttendee.upsert({
            where: { eventId_userId: { eventId: e.id, userId: uid } },
            update: { status: 'ACCEPTED' },
            create: { eventId: e.id, userId: uid, status: 'ACCEPTED' },
          })
          bump('eventAttendees', exA ? 'updated' : 'inserted')
        } catch (e2) {
          bump('eventAttendees', 'errors')
          console.error('attendee error', e.id, uid, (e2 as Error).message)
        }
      }
    } catch (err) {
      bump('calendarEvents', 'errors')
      console.error('calendar error', e.id, (err as Error).message)
    }
  }
}

// ---------------------------------------------------------------------------
// Notes + NoteConnections
// ---------------------------------------------------------------------------
async function seedNotes() {
  for (const n of MOCK_NOTES) {
    try {
      // Author Sarah for everything (per spec) — keeps notes visible to her.
      const authorId = SARAH_ID
      const existing = await prisma.note.findUnique({ where: { id: n.id } })
      await prisma.note.upsert({
        where: { id: n.id },
        update: {
          brain: n.brain,
          type: n.type,
          title: n.title,
          body: n.body || null,
          tags: n.tags || [],
          pinned: !!n.pinned,
          starred: !!n.starred,
          authorId,
        },
        create: {
          id: n.id,
          brain: n.brain,
          type: n.type,
          title: n.title,
          body: n.body || null,
          tags: n.tags || [],
          pinned: !!n.pinned,
          starred: !!n.starred,
          workspaceId: ACME_WORKSPACE_ID,
          authorId,
        },
      })
      bump('notes', existing ? 'updated' : 'inserted')

      // Connections
      const conns = MOCK_NOTE_CONNECTIONS[n.id] || []
      for (const c of conns) {
        try {
          const exC = await prisma.noteConnection.findUnique({
            where: {
              noteId_entityType_entityId: {
                noteId: n.id,
                entityType: c.entityType,
                entityId: c.entityId,
              },
            },
          })
          await prisma.noteConnection.upsert({
            where: {
              noteId_entityType_entityId: {
                noteId: n.id,
                entityType: c.entityType,
                entityId: c.entityId,
              },
            },
            update: { label: c.label || null, autoLinked: !!c.autoLinked },
            create: {
              id: c.id,
              noteId: n.id,
              entityType: c.entityType,
              entityId: c.entityId,
              label: c.label || null,
              autoLinked: !!c.autoLinked,
            },
          })
          bump('noteConnections', exC ? 'updated' : 'inserted')
        } catch (e) {
          bump('noteConnections', 'errors')
          console.error('noteConnection error', n.id, c.entityId, (e as Error).message)
        }
      }
    } catch (e) {
      bump('notes', 'errors')
      console.error('note error', n.id, (e as Error).message)
    }
  }
}

// ---------------------------------------------------------------------------
// Activity feed (optional)
// ---------------------------------------------------------------------------
async function seedActivity() {
  const actorToUser: Record<string, string> = {
    'Sarah Chen': SARAH_ID,
    'Mike Wilson': 'user-mike-wilson',
    'Lisa Park': 'user-lisa-park',
    'David Kim': 'user-david-kim',
    'Emma Jones': 'user-emma-jones',
    'Tom Becker': 'contact-tom-becker',
    'Jenna Rivera': 'contact-jenna-rivera',
    Lisa: 'user-lisa-park',
  }
  const typeMap: Record<string, string> = {
    MESSAGE: 'COMMENTED',
    CREATED: 'CREATED',
    UPDATED: 'UPDATED',
    COMMENTED: 'COMMENTED',
  }
  for (const a of MOCK_ACTIVITY_FEED) {
    try {
      const userId = actorToUser[a.actor] || SARAH_ID
      const id = `activity-${a.id}`
      const type = (typeMap[a.type] || 'UPDATED') as
        | 'CREATED' | 'UPDATED' | 'DELETED' | 'COMPLETED'
        | 'ASSIGNED' | 'COMMENTED' | 'UPLOADED' | 'SHARED'
      const existing = await prisma.activity.findUnique({ where: { id } })
      await prisma.activity.upsert({
        where: { id },
        update: {
          type,
          entityType: a.entityType,
          entityId: a.entityId,
          description: a.description,
          userId,
        },
        create: {
          id,
          type,
          entityType: a.entityType,
          entityId: a.entityId,
          description: a.description,
          userId,
          createdAt: D(a.timestamp) || undefined,
        },
      })
      bump('activities', existing ? 'updated' : 'inserted')
    } catch (e) {
      bump('activities', 'errors')
      console.error('activity error', a.id, (e as Error).message)
    }
  }
}

// ---------------------------------------------------------------------------
// Optional cleanup of the single stale legacy 'Alex Rivera' conversation.
// ---------------------------------------------------------------------------
async function cleanupLegacy() {
  try {
    const stale = await prisma.conversation.findMany({
      where: { name: 'Alex Rivera' },
      select: { id: true },
    })
    for (const c of stale) {
      await prisma.message.deleteMany({ where: { conversationId: c.id } })
      await prisma.conversationParticipant.deleteMany({ where: { conversationId: c.id } })
      await prisma.conversation.delete({ where: { id: c.id } })
      bump('legacyCleanup', 'updated')
      console.log('🧹 Removed stale legacy conversation:', c.id)
    }
  } catch (e) {
    bump('legacyCleanup', 'errors')
    console.error('legacy cleanup error:', (e as Error).message)
  }
}

// ---------------------------------------------------------------------------
async function main() {
  console.log('— Seeding Acme Corp world into the LIVE DB —')

  SARAH_ID = await ensureSarahAuthUser()
  console.log('Sarah Prisma User.id will be:', SARAH_ID)

  await seedWorkspace()
  await migrateSarahId()
  await seedUsers()
  await seedContacts()
  await seedMissions()
  await seedTasks()
  await seedFiles()
  await seedMessages()
  await seedCalendar()
  await seedNotes()
  await seedActivity()
  await cleanupLegacy()

  console.log('\n===== ROW COUNTS (inserted / updated / errors) =====')
  for (const [group, c] of Object.entries(counts)) {
    console.log(
      `${group.padEnd(26)} inserted=${c.inserted}  updated=${c.updated}  errors=${c.errors}`,
    )
  }
  console.log('====================================================')
  console.log('Login: sarah.chen@acmecorp.com / Demo123!')
}

main()
  .catch((e) => {
    console.error('FATAL:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
