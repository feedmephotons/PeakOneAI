import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { MOCK_MESSAGE_THREADS, MOCK_USER } from '@/lib/peak/mock'
import type { MessageThread } from '@/lib/peak/types'

// ----------------------------------------------------------------------------
// Peak-mock fallback — keeps the messages demo populated when there is no DB /
// no authenticated user. Seeded from the canonical Acme Corp threads so the
// page is never empty.
// ----------------------------------------------------------------------------
function threadKindToType(kind: MessageThread['kind']): 'direct' | 'channel' | 'group' {
  if (kind === 'CHANNEL') return 'channel'
  if (kind === 'GROUP') return 'group'
  return 'direct'
}

function mockConversations() {
  return MOCK_MESSAGE_THREADS.map((t) => {
    const type = threadKindToType(t.kind)
    // Direct chats show the other member as "online" for demo flavour.
    const isOnline = type === 'direct'
    return {
      id: t.id,
      type,
      // Channel names already carry the leading '#'.
      name: t.name,
      lastMessage: t.lastMessage || '',
      lastMessageTime: t.lastMessageAt || undefined,
      unreadCount: t.unread || 0,
      participants: t.members.map((m) => m.id),
      avatar: undefined,
      isOnline,
      isPinned: t.id === 'thread-product-x',
      isMuted: false,
    }
  })
}

// GET: Fetch conversations for the current user
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.id === 'demo-user-id') {
      // Demo / unauthenticated — serve the canonical mock threads (ignore any
      // stale DB rows tied to the shared demo user).
      return NextResponse.json({ conversations: mockConversations(), source: 'mock' })
    }

    // Get all conversations this user is a participant of
    const participants = await prisma.conversationParticipant.findMany({
      where: { userId: user.id },
      select: { conversationId: true }
    })

    const conversationIds = participants.map(p => p.conversationId)

    // Fetch the conversations details
    const conversations = await prisma.conversation.findMany({
      where: { id: { in: conversationIds } },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // No real conversations yet — fall back to the seeded demo threads so the
    // page is never empty.
    if (conversations.length === 0) {
      return NextResponse.json({ conversations: mockConversations(), source: 'mock' })
    }

    // Fetch all user details for formatting participant names
    const allParticipantUserIds = Array.from(
      new Set(conversations.flatMap(c => c.participants.map(p => p.userId)))
    )

    const users = await prisma.user.findMany({
      where: { id: { in: allParticipantUserIds } },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true
      }
    })

    const userMap = new Map(users.map(u => [u.id, u]))

    const formattedConversations = conversations.map(conv => {
      const lastMsg = conv.messages[0]
      const otherParticipants = conv.participants.filter(p => p.userId !== user.id)

      // Determine type
      let type: 'direct' | 'channel' | 'group' = 'direct'
      if (conv.isGroup) {
        // If there's a name, it's a channel/group
        type = conv.name?.startsWith('#') ? 'channel' : 'group'
      }

      // Determine name and avatar for direct messages
      let name = conv.name || ''
      let avatar = undefined
      let isOnline = false

      if (type === 'direct' && otherParticipants.length > 0) {
        const otherUser = userMap.get(otherParticipants[0].userId)
        if (otherUser) {
          name = otherUser.name || otherUser.email
          avatar = otherUser.avatarUrl || undefined
          isOnline = true // Mock online status for direct messaging
        }
      }

      return {
        id: conv.id,
        type,
        name: type === 'channel' && !name.startsWith('#') ? `#${name}` : name,
        lastMessage: lastMsg?.content || '',
        lastMessageTime: lastMsg?.createdAt || conv.updatedAt,
        unreadCount: 0, // In standard version we can set default 0
        participants: conv.participants.map(p => p.userId),
        avatar,
        isOnline,
        isPinned: false,
        isMuted: false
      }
    })

    return NextResponse.json({ conversations: formattedConversations })
  } catch (error) {
    console.error('[Conversations GET] Error:', error)
    // DB unreachable in demo — still serve the canonical mock threads.
    return NextResponse.json({ conversations: mockConversations(), source: 'mock' })
  }
}

// POST: Create a new conversation
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, name, participantEmails = [] } = body

    const user = await getCurrentUser()
    if (!user) {
      // Demo mode — synthesize a conversation object the client can use locally.
      const id = `thread-new-${Date.now()}`
      const convName =
        type === 'direct'
          ? (participantEmails[0]?.split('@')[0] || 'New conversation')
          : (name || 'New conversation')
      return NextResponse.json(
        {
          conversation: {
            id,
            type: type || 'direct',
            name: convName,
            lastMessage: '',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            participants: [MOCK_USER.id, ...participantEmails],
            isOnline: type === 'direct',
            isPinned: false,
            isMuted: false,
          },
          source: 'mock',
        },
        { status: 201 }
      )
    }

    if (type === 'direct') {
      if (participantEmails.length === 0) {
        return NextResponse.json({ error: 'Participant email is required for direct messages' }, { status: 400 })
      }

      const targetEmail = participantEmails[0]

      // Find target user
      let targetUser = await prisma.user.findUnique({
        where: { email: targetEmail }
      })

      if (!targetUser) {
        // Create a dummy user for demo if not exists
        targetUser = await prisma.user.create({
          data: {
            email: targetEmail,
            name: targetEmail.split('@')[0],
            clerkId: `mock-clerk-${Date.now()}`
          }
        })
      }

      // Check if direct conversation already exists
      const existingConversations = await prisma.conversation.findMany({
        where: {
          isGroup: false,
          participants: {
            some: { userId: user.id }
          }
        },
        include: {
          participants: true
        }
      })

      const existingConv = existingConversations.find(c =>
        c.participants.some(p => p.userId === targetUser.id)
      )

      if (existingConv) {
        return NextResponse.json({ conversation: existingConv })
      }

      // Create new direct conversation
      const conversation = await prisma.conversation.create({
        data: {
          isGroup: false,
          participants: {
            create: [
              { userId: user.id },
              { userId: targetUser.id }
            ]
          }
        },
        include: {
          participants: true
        }
      })

      return NextResponse.json({ conversation }, { status: 201 })
    } else {
      // Group/Channel Conversation
      if (!name) {
        return NextResponse.json({ error: 'Channel/Group name is required' }, { status: 400 })
      }

      // Find user records for emails
      const targetUsers = await prisma.user.findMany({
        where: { email: { in: participantEmails } }
      })

      const participantsData = [
        { userId: user.id },
        ...targetUsers.map(u => ({ userId: u.id }))
      ]

      const conversation = await prisma.conversation.create({
        data: {
          name,
          isGroup: true,
          participants: {
            create: participantsData
          }
        },
        include: {
          participants: true
        }
      })

      return NextResponse.json({ conversation }, { status: 201 })
    }
  } catch (error) {
    console.error('[Conversations POST] Error:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
