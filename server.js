/**
 * Custom Next.js + Socket.io Server
 * Handles real-time WebSocket connections for live meeting features
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3001', 10)

// Initialize Next.js
const app = next({ dev, hostname, port })
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
