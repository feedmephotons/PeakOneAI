import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, getCurrentOrganization } from '@/lib/auth'

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function parseDuration(durationStr?: string): number {
  if (!durationStr) return 0;
  const parts = durationStr.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return parseInt(durationStr, 10) || 0;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

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

// GET: Retrieve calls for the current workspace
export async function GET() {
  try {
    const user = await getCurrentUser()
    const workspace = await getOrCreateWorkspace(user)

    const dbCalls = await prisma.call.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { startedAt: 'desc' },
    })

    const mappedCalls = dbCalls.map((call) => {
      let direction: 'incoming' | 'outgoing' | 'missed' = 'outgoing';
      let recorded = false;

      if (call.recordingUrl) {
        try {
          const parsed = JSON.parse(call.recordingUrl);
          if (parsed && typeof parsed === 'object') {
            direction = parsed.direction || 'outgoing';
            recorded = !!parsed.recorded;
          }
        } catch (e) {
          // If not valid JSON, default to outgoing
        }
      }

      const contactName = call.contactName || call.phoneNumber || 'Unknown Number';

      return {
        id: call.id,
        // /phone page schema compatibility
        type: direction,
        contact: contactName,
        phoneNumber: call.phoneNumber || '',
        time: getRelativeTime(call.startedAt),
        duration: formatDuration(call.duration || 0),
        recorded,
        transcribed: !!call.transcription,
        aiSummary: !!call.aiSummary,
        status: call.status === 'ONGOING' ? 'active' : 'ended',
        transcriptText: call.transcription || undefined,
        summaryText: call.aiSummary || undefined,
        actionItems: call.actionItems ? (call.actionItems as any) : [],

        // /calls page schema compatibility
        direction,
        statusMapped: call.status === 'MISSED' ? 'missed' : 'completed',
        participants: [
          {
            name: contactName,
            initials: getInitials(contactName),
          },
        ],
        durationSeconds: call.duration || 0,
        timestamp: call.startedAt,
        hasRecording: recorded,
        hasTranscript: !!call.transcription,
        aiSummaryText: call.aiSummary || undefined,
      }
    })

    return NextResponse.json({ success: true, calls: mappedCalls })
  } catch (error) {
    console.error('[Calls API GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve calls' },
      { status: 500 }
    )
  }
}

// POST: Log a new call
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

    const { type, phoneNumber, contactName, duration, recorded, status } = body

    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 })
    }

    // Try to resolve contact name if not provided
    let resolvedContactName = contactName || phoneNumber
    if (!contactName || contactName === phoneNumber) {
      const matchedContact = await prisma.contact.findFirst({
        where: {
          workspaceId: workspace.id,
          phoneNumber: phoneNumber,
        },
      })
      if (matchedContact) {
        resolvedContactName = matchedContact.name
      }
    }

    const parsedDuration = typeof duration === 'number' ? duration : parseDuration(duration)
    const callStatus = type === 'missed' ? 'MISSED' : (status === 'active' ? 'ONGOING' : 'COMPLETED')

    const dbCall = await prisma.call.create({
      data: {
        type: 'PHONE',
        status: callStatus,
        duration: parsedDuration,
        recordingUrl: JSON.stringify({ direction: type || 'outgoing', recorded: !!recorded }),
        phoneNumber,
        contactName: resolvedContactName,
        startedAt: new Date(),
        initiatorId: user.id,
        workspaceId: workspace.id,
      },
    })

    const mappedCall = {
      id: dbCall.id,
      type: type || 'outgoing',
      contact: resolvedContactName,
      phoneNumber,
      time: 'Just now',
      duration: formatDuration(parsedDuration),
      recorded: !!recorded,
      transcribed: false,
      aiSummary: false,
      status: callStatus === 'ONGOING' ? 'active' : 'ended',
      transcriptText: undefined,
      summaryText: undefined,
      actionItems: [],
    }

    return NextResponse.json({ success: true, call: mappedCall }, { status: 201 })
  } catch (error) {
    console.error('[Calls API POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to log call' },
      { status: 500 }
    )
  }
}
