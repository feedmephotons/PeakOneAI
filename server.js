/**
 * Custom Next.js + Socket.io Server
 * Handles real-time WebSocket connections for live meeting features
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3001', 10)

// Initialize Next.js
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_APP_URL
        : 'http://localhost:3001',
      methods: ['GET', 'POST']
    }
  })

  // Socket.io connection handlers
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`)

    // Join meeting room
    socket.on('join-meeting', ({ meetingId, userId, userName }) => {
      socket.join(meetingId)
      console.log(`[Meeting ${meetingId}] ${userName} joined`)

      // Notify others in the room
      socket.to(meetingId).emit('user-joined', {
        userId,
        userName,
        socketId: socket.id
      })
    })

    // Handle audio chunk for transcription
    socket.on('audio-chunk', async ({ meetingId, audioData, userId, userName }) => {
      console.log(`[Meeting ${meetingId}] Received audio chunk from ${userName}`)

      // Broadcast to same meeting that transcription is processing
      io.to(meetingId).emit('transcription-processing', { userId, userName })
    })

    // Handle transcription result
    socket.on('transcription-result', ({ meetingId, transcript, userId, userName, timestamp }) => {
      console.log(`[Meeting ${meetingId}] Transcription: ${userName}: ${transcript}`)

      // Broadcast transcript to all participants in meeting
      io.to(meetingId).emit('new-transcript', {
        id: `${Date.now()}-${userId}`,
        speaker: userName,
        text: transcript,
        timestamp: timestamp || new Date().toISOString(),
        userId
      })
    })

    // Handle AI-detected action item
    socket.on('action-item-detected', ({ meetingId, actionItem }) => {
      console.log(`[Meeting ${meetingId}] Action item detected:`, actionItem)

      // Broadcast to all participants
      io.to(meetingId).emit('new-action-item', actionItem)
    })

    // Leave meeting
    socket.on('leave-meeting', ({ meetingId, userId, userName }) => {
      socket.leave(meetingId)
      console.log(`[Meeting ${meetingId}] ${userName} left`)

      socket.to(meetingId).emit('user-left', {
        userId,
        userName
      })
    })

    // Join chat conversation room
    socket.on('join-chat', async ({ conversationId, userId, userName }) => {
      try {
        const participant = await prisma.conversationParticipant.findFirst({
          where: {
            conversationId,
            userId
          }
        })
        if (!participant) {
          console.warn(`[Chat ${conversationId}] Warning: User ${userId} (${userName}) is not a participant of this conversation. Blocked from joining room.`)
          return
        }
        socket.join(conversationId)
        console.log(`[Chat ${conversationId}] User ${userName} (${userId}) joined room`)
      } catch (err) {
        console.error(`[Chat ${conversationId}] Error verifying participation for user ${userId}:`, err)
      }
    })

    // Leave chat conversation room
    socket.on('leave-chat', ({ conversationId, userId }) => {
      socket.leave(conversationId)
      console.log(`[Chat ${conversationId}] User ${userId} left room`)
    })

    // Send chat message
    socket.on('send-chat-message', ({ conversationId, message }) => {
      console.log(`[Chat ${conversationId}] New message from ${message.senderName}: ${message.content}`)
      // Broadcast message to others in the room
      socket.to(conversationId).emit('new-chat-message', message)
    })

    // Typing indicator
    socket.on('typing', ({ conversationId, userId, userName }) => {
      socket.to(conversationId).emit('user-typing', { userId, userName })
    })

    // Stop typing indicator
    socket.on('stop-typing', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('user-stop-typing', { userId })
    })

    // Read receipts
    socket.on('read-receipt', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('read-status', {
        conversationId,
        userId,
        lastReadAt: new Date().toISOString()
      })
    })

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`)
    })
  })

  // Start server
  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log(`> Socket.io server ready`)
    })
})
