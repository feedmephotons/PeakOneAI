import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET: Fetch conversations for the current user
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

// POST: Create a new conversation
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, name, participantEmails = [] } = body

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
