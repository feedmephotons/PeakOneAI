import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET: Fetch messages for a conversation
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId parameter' }, { status: 400 })
    }

    // Verify user is a participant of this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: user.id
      }
    })

    if (!participant) {
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
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST: Persist a new message
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, type, fileUrl, fileName, content, conversationId } = body

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
    }

    // Verify user is a participant of this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: user.id
      }
    })

    if (!participant) {
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
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId } = body

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
    }

    // Update ConversationParticipant for the current user
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
  } catch (error) {
    console.error('[Messages PUT] Error:', error)
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 })
  }
}
