import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getMockThread, MOCK_USER } from '@/lib/peak/mock'

// ----------------------------------------------------------------------------
// Peak-mock fallback — serve the canonical Acme Corp thread messages when there
// is no DB / no authenticated user so the messages demo is never empty.
// ----------------------------------------------------------------------------
function mockMessagesForThread(conversationId: string) {
  const thread = getMockThread(conversationId)
  if (!thread) return [] as Array<Record<string, unknown>>
  return thread.messages.map((m) => {
    const isOwn = m.sender.id === MOCK_USER.id
    return {
      id: m.id,
      conversationId: thread.id,
      // Map Sarah (the demo user) to the 'user' sender id the client treats as own.
      senderId: isOwn ? 'user' : m.sender.id,
      senderName: isOwn ? 'You' : m.sender.name,
      senderAvatar: m.sender.avatarUrl || undefined,
      content: m.body,
      timestamp: m.createdAt,
      type: 'text' as const,
      isRead: true,
    }
  })
}

// GET: Fetch messages for a conversation
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId parameter' }, { status: 400 })
    }

    const user = await getCurrentUser()
    if (!user) {
      // Demo / unauthenticated — serve canonical mock messages.
      return NextResponse.json({ messages: mockMessagesForThread(conversationId), source: 'mock' })
    }

    // Verify user is a participant of this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: user.id
      }
    })

    if (!participant) {
      // Could be one of the seeded demo threads — fall back to mock messages.
      const mock = mockMessagesForThread(conversationId)
      if (mock.length > 0) {
        return NextResponse.json({ messages: mock, source: 'mock' })
      }
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    const lastRead = participant.lastReadAt
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderName: msg.senderId === user.id ? 'You' : (msg.sender.name || msg.sender.email),
      senderAvatar: msg.sender.avatarUrl || undefined,
      content: msg.content,
      timestamp: msg.createdAt,
      type: msg.type || 'text',
      fileUrl: msg.fileUrl || undefined,
      fileName: msg.fileName || undefined,
      isRead: msg.senderId === user.id || (lastRead ? new Date(lastRead) >= new Date(msg.createdAt) : false)
    }))

    return NextResponse.json({ messages: formattedMessages })
  } catch (error) {
    console.error('[Messages GET] Error:', error)
    // DB unreachable in demo — try the mock fallback before erroring.
    try {
      const { searchParams } = new URL(request.url)
      const conversationId = searchParams.get('conversationId')
      if (conversationId) {
        return NextResponse.json({ messages: mockMessagesForThread(conversationId), source: 'mock' })
      }
    } catch {
      /* ignore */
    }
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST: Persist a new message
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, type, fileUrl, fileName, content, conversationId } = body

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
    }

    const user = await getCurrentUser()
    if (!user) {
      // Demo mode — echo the message back as persisted so the optimistic UI
      // resolves the "Sending..." state without a DB.
      const formattedMessage = {
        id: id || `msg-${Date.now()}`,
        conversationId,
        senderId: 'user',
        senderName: 'You',
        senderAvatar: undefined,
        content: content || '',
        timestamp: new Date().toISOString(),
        type: type || 'text',
        fileUrl: fileUrl || undefined,
        fileName: fileName || undefined,
        isRead: true,
      }
      return NextResponse.json({ message: formattedMessage, source: 'mock' }, { status: 201 })
    }

    // Verify user is a participant of this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: user.id
      }
    })

    if (!participant) {
      // Seeded demo thread — echo back optimistically instead of 403.
      if (getMockThread(conversationId)) {
        const formattedMessage = {
          id: id || `msg-${Date.now()}`,
          conversationId,
          senderId: 'user',
          senderName: 'You',
          senderAvatar: undefined,
          content: content || '',
          timestamp: new Date().toISOString(),
          type: type || 'text',
          fileUrl: fileUrl || undefined,
          fileName: fileName || undefined,
          isRead: true,
        }
        return NextResponse.json({ message: formattedMessage, source: 'mock' }, { status: 201 })
      }
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // If an ID is provided, check if message already exists (idempotence for offline sync)
    if (id) {
      const existingMessage = await prisma.message.findUnique({
        where: { id },
        include: { sender: true }
      })
      if (existingMessage) {
        if (existingMessage.conversationId !== conversationId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        const formattedMessage = {
          id: existingMessage.id,
          conversationId: existingMessage.conversationId,
          senderId: existingMessage.senderId,
          senderName: 'You',
          senderAvatar: existingMessage.sender.avatarUrl || undefined,
          content: existingMessage.content,
          timestamp: existingMessage.createdAt,
          type: existingMessage.type || 'text',
          fileUrl: existingMessage.fileUrl || undefined,
          fileName: existingMessage.fileName || undefined,
          isRead: true
        }
        return NextResponse.json({ message: formattedMessage }, { status: 200 })
      }
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        id: id || undefined,
        content: content || '',
        type: type || 'text',
        fileUrl: fileUrl || undefined,
        fileName: fileName || undefined,
        conversationId,
        senderId: user.id
      },
      include: {
        sender: true
      }
    })

    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })

    const formattedMessage = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId, // Mark creator as message.senderId for client UI mapping
      senderName: 'You',
      senderAvatar: message.sender.avatarUrl || undefined,
      content: message.content,
      timestamp: message.createdAt,
      type: message.type || 'text',
      fileUrl: message.fileUrl || undefined,
      fileName: message.fileName || undefined,
      isRead: true
    }

    return NextResponse.json({ message: formattedMessage }, { status: 201 })
  } catch (error) {
    console.error('[Messages POST] Error:', error)
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }
}

// PUT: Mark all messages in a conversation as read
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { conversationId } = body

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
    }

    const user = await getCurrentUser()
    if (!user) {
      // Demo mode — no DB to update; acknowledge so the client clears unread.
      return NextResponse.json({ success: true, lastReadAt: new Date().toISOString(), source: 'mock' })
    }

    // Update ConversationParticipant for the current user
    try {
      const updatedParticipant = await prisma.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId: user.id
          }
        },
        data: {
          lastReadAt: new Date()
        }
      })
      return NextResponse.json({ success: true, lastReadAt: updatedParticipant.lastReadAt })
    } catch {
      // Seeded demo thread has no participant row — acknowledge anyway.
      return NextResponse.json({ success: true, lastReadAt: new Date().toISOString(), source: 'mock' })
    }
  } catch (error) {
    console.error('[Messages PUT] Error:', error)
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 })
  }
}
