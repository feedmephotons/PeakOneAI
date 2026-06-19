'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Search, Plus, Send, Paperclip, Phone, Video, MoreVertical,
  Hash, Users, Star, Smile, Image as ImageIcon,
  File, Mic, BellOff, Lock, MessageSquare
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { io } from 'socket.io-client'

interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file'
  fileUrl?: string
  fileName?: string
  isRead: boolean
  isEdited?: boolean
  reactions?: { emoji: string; users: string[] }[]
  pending?: boolean
}

interface Conversation {
  id: string
  type: 'direct' | 'channel' | 'group'
  name: string
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount: number
  participants: string[]
  avatar?: string
  isOnline?: boolean
  isPinned?: boolean
  isMuted?: boolean
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showChannels, setShowChannels] = useState(true)
  const [showDirectMessages, setShowDirectMessages] = useState(true)
  const [typingUsers, setTypingUsers] = useState<{ [userId: string]: string }>({})
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [socketConnected, setSocketConnected] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const socketRef = useRef<any>(null)
  const prevConversationIdRef = useRef<string | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSyncingRef = useRef(false)

  // 1. Detect browser online/offline status using window event listeners and socket connection status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const offlineActive = isOffline || !socketConnected

  // 2. Fetch authenticated user profile using Supabase client, falling back to demo user profile
  useEffect(() => {
    const fetchUserAndConversations = async () => {
      try {
        const supabase = createClient()
        const { data: { user: supabaseUser } } = await supabase.auth.getUser()
        
        let profile = null
        if (supabaseUser) {
          profile = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.first_name 
              ? `${supabaseUser.user_metadata.first_name} ${supabaseUser.user_metadata.last_name || ''}`.trim()
              : supabaseUser.email?.split('@')[0] || 'User',
            avatarUrl: supabaseUser.user_metadata?.avatar_url || null
          }
        } else {
          profile = {
            id: 'demo-user-id',
            email: 'sarah.chen@peakone.ai',
            name: 'Sarah Chen',
            avatarUrl: null
          }
        }
        setCurrentUser(profile)

        // Fetch conversations
        const response = await fetch('/api/conversations')
        if (response.ok) {
          const data = await response.json()
          setConversations(data.conversations || [])
          
          if (data.conversations && data.conversations.length > 0) {
            setSelectedConversation(data.conversations[0])
          }
        }
      } catch (err) {
        console.error('Error fetching user/conversations:', err)
      }
    }

    fetchUserAndConversations()
  }, [])

  // 3. Fetch messages when conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return
      try {
        const response = await fetch(`/api/messages?conversationId=${selectedConversation.id}`)
        if (response.ok) {
          const data = await response.json()
          setMessages((data.messages || []).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })))
        }
      } catch (err) {
        console.error('Error fetching messages:', err)
      }
    }

    fetchMessages()
  }, [selectedConversation])

  // 4. Initialize and handle socket.io-client connection on port 3001
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL
    if (!socketUrl) return
    const socket = io(socketUrl)
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Connected to socket server')
      setSocketConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server')
      setSocketConnected(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // 5. Integrate room joining/leaving on conversation selection (using join-chat)
  useEffect(() => {
    const socket = socketRef.current
    if (!currentUser || !socket) return

    // Leave previous room if any
    if (prevConversationIdRef.current && prevConversationIdRef.current !== selectedConversation?.id) {
      socket.emit('leave-chat', {
        conversationId: prevConversationIdRef.current,
        userId: currentUser.id
      })
    }

    if (selectedConversation) {
      // Join new room
      socket.emit('join-chat', {
        conversationId: selectedConversation.id,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.email
      })

      prevConversationIdRef.current = selectedConversation.id

      // Emit read-receipt via socket
      socket.emit('read-receipt', {
        conversationId: selectedConversation.id,
        userId: currentUser.id
      })

      // Mark messages in the conversation as read via API PUT
      markAsReadAPI(selectedConversation.id)
    } else {
      prevConversationIdRef.current = null
    }
  }, [selectedConversation, currentUser, socketConnected])

  // Clear typing users when conversation changes
  useEffect(() => {
    setTypingUsers({})
  }, [selectedConversation])

  // 6. Listen to incoming socket events
  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    const handleNewChatMessage = (msg: Message) => {
      if (selectedConversation && msg.conversationId === selectedConversation.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev
          return [...prev, { ...msg, timestamp: new Date(msg.timestamp) }]
        })

        // Mark as read in DB and emit read receipt
        markAsReadAPI(selectedConversation.id)
        socket.emit('read-receipt', {
          conversationId: selectedConversation.id,
          userId: currentUser?.id
        })
      }

      // Update last message & unread count
      setConversations(prev => prev.map(conv => {
        if (conv.id === msg.conversationId) {
          const isCurrent = selectedConversation?.id === msg.conversationId
          return {
            ...conv,
            lastMessage: msg.content || (msg.type === 'image' ? 'Sent an image' : 'Sent a file'),
            lastMessageTime: new Date(msg.timestamp),
            unreadCount: isCurrent ? 0 : conv.unreadCount + 1
          }
        }
        return conv
      }))
    }

    const handleUserTyping = ({ userId, userName }: { userId: string, userName: string }) => {
      setTypingUsers(prev => ({ ...prev, [userId]: userName }))
    }

    const handleUserStopTyping = ({ userId }: { userId: string }) => {
      setTypingUsers(prev => {
        const next = { ...prev }
        delete next[userId]
        return next
      })
    }

    const handleReadStatus = ({ conversationId, userId, lastReadAt }: { conversationId: string, userId: string, lastReadAt: string }) => {
      if (selectedConversation && conversationId === selectedConversation.id) {
        setMessages(prev => prev.map(msg => {
          if ((msg.senderId === 'user' || msg.senderId === currentUser?.id) && new Date(msg.timestamp) <= new Date(lastReadAt)) {
            return { ...msg, isRead: true }
          }
          return msg
        }))
      }
    }

    socket.on('new-chat-message', handleNewChatMessage)
    socket.on('user-typing', handleUserTyping)
    socket.on('user-stop-typing', handleUserStopTyping)
    socket.on('read-status', handleReadStatus)

    return () => {
      socket.off('new-chat-message', handleNewChatMessage)
      socket.off('user-typing', handleUserTyping)
      socket.off('user-stop-typing', handleUserStopTyping)
      socket.off('read-status', handleReadStatus)
    }
  }, [selectedConversation, currentUser])

  // 7. Sync offline queue when coming back online using exponential backoff retry loop
  useEffect(() => {
    if (!offlineActive) {
      syncOfflineQueue()
    }
  }, [offlineActive])

  const syncOfflineQueue = async () => {
    if (isSyncingRef.current) return
    isSyncingRef.current = true

    try {
      // Check multi-tab sync lock
      const lock = localStorage.getItem('offline_messages_queue_lock')
      const now = Date.now()
      if (lock && now - parseInt(lock) < 10000) {
        isSyncingRef.current = false
        return
      }
      // Acquire lock
      localStorage.setItem('offline_messages_queue_lock', now.toString())

      // Stabilization delay to allow browser network stack to settle
      await new Promise(resolve => setTimeout(resolve, 300))

      const queueJson = localStorage.getItem('offline_messages_queue')
      if (!queueJson) {
        localStorage.removeItem('offline_messages_queue_lock')
        return
      }
      const queue: Message[] = JSON.parse(queueJson)
      if (queue.length === 0) {
        localStorage.removeItem('offline_messages_queue_lock')
        return
      }

      console.log(`Syncing ${queue.length} offline messages...`)
      const remainingQueue: Message[] = []
      
      for (const msg of queue) {
        let success = false
        let retries = 0
        let delay = 1000

        while (!success && retries < 5) {
          // Renew lock
          localStorage.setItem('offline_messages_queue_lock', Date.now().toString())
          try {
            const response = await fetch('/api/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: msg.id,
                type: msg.type,
                fileUrl: msg.fileUrl,
                fileName: msg.fileName,
                content: msg.content,
                conversationId: msg.conversationId
              })
            })

            if (response.ok) {
              success = true
              const data = await response.json()
              const savedMsg = data.message

              setMessages(prev => prev.map(m => m.id === msg.id ? { ...savedMsg, pending: false, timestamp: new Date(savedMsg.timestamp) } : m))

              if (socketRef.current) {
                socketRef.current.emit('send-chat-message', {
                  conversationId: msg.conversationId,
                  message: savedMsg
                })
              }
            } else {
              throw new Error('Server error: ' + response.status)
            }
          } catch (error) {
            console.error(`Attempt ${retries + 1} to send message ${msg.id} failed:`, error)
            retries++
            if (retries < 5) {
              await new Promise(resolve => setTimeout(resolve, delay))
              delay *= 2
            }
          }
        }

        if (!success) {
          remainingQueue.push(msg)
        }
      }

      localStorage.setItem('offline_messages_queue', JSON.stringify(remainingQueue))
    } finally {
      localStorage.removeItem('offline_messages_queue_lock')
      isSyncingRef.current = false
    }
  }

  const queueOfflineMessage = (msg: Message) => {
    const queueJson = localStorage.getItem('offline_messages_queue')
    const queue: Message[] = queueJson ? JSON.parse(queueJson) : []
    queue.push(msg)
    localStorage.setItem('offline_messages_queue', JSON.stringify(queue))
  }

  // 8. PUT api to mark conversation as read
  const markAsReadAPI = async (convId: string) => {
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId })
      })

      setConversations(prev => prev.map(conv =>
        conv.id === convId ? { ...conv, unreadCount: 0 } : conv
      ))

      setMessages(prev => prev.map(msg =>
        msg.conversationId === convId ? { ...msg, isRead: true } : msg
      ))
    } catch (err) {
      console.error('Failed to mark conversation as read:', err)
    }
  }

  // 9. Send messaging action
  const sendMessage = async (content: string, type: 'text' | 'image' | 'file' = 'text', fileUrl?: string, fileName?: string) => {
    if (!selectedConversation || !currentUser) return

    const clientMsgId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    const newMsg: Message = {
      id: clientMsgId,
      conversationId: selectedConversation.id,
      senderId: currentUser?.id || 'user',
      senderName: 'You',
      senderAvatar: currentUser.avatarUrl || undefined,
      content,
      timestamp: new Date(),
      type,
      fileUrl,
      fileName,
      isRead: true,
      pending: true
    }

    setMessages(prev => [...prev, newMsg])

    setConversations(prev => prev.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, lastMessage: content || (type === 'image' ? 'Sent an image' : 'Sent a file'), lastMessageTime: new Date() }
        : conv
    ))

    if (offlineActive) {
      queueOfflineMessage(newMsg)
    } else {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: clientMsgId,
            type,
            fileUrl,
            fileName,
            content,
            conversationId: selectedConversation.id
          })
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }

        const data = await response.json()
        const savedMsg = data.message

        setMessages(prev => prev.map(m => m.id === clientMsgId ? { ...savedMsg, pending: false, timestamp: new Date(savedMsg.timestamp) } : m))

        if (socketRef.current) {
          socketRef.current.emit('send-chat-message', {
            conversationId: selectedConversation.id,
            message: savedMsg
          })
        }
      } catch (err) {
        console.error('Error sending message, queueing instead:', err)
        queueOfflineMessage(newMsg)
      }
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    if (socketRef.current && currentUser) {
      socketRef.current.emit('stop-typing', {
        conversationId: selectedConversation.id,
        userId: currentUser.id
      })
    }

    sendMessage(newMessage)
    setNewMessage('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    if (!selectedConversation || !currentUser) return

    const socket = socketRef.current
    if (socket) {
      socket.emit('typing', {
        conversationId: selectedConversation.id,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.email
      })

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop-typing', {
          conversationId: selectedConversation.id,
          userId: currentUser.id
        })
      }, 2000)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (offlineActive) {
      alert('You cannot upload attachments while offline.')
      return
    }
    const file = event.target.files?.[0]
    if (!file || !selectedConversation || !currentUser) return

    const isImg = file.type.startsWith('image/')
    const type: 'image' | 'file' = isImg ? 'image' : 'file'
    const fileName = file.name
    const localUrl = URL.createObjectURL(file)

    let fileUrl = localUrl

    try {
      if (currentUser.id !== 'demo-user-id') {
        const supabase = createClient()
        const fileExt = file.name.split('.').pop()
        const storagePath = `${currentUser.id}/${Date.now()}.${fileExt}`

        const { data, error } = await supabase.storage
          .from('files')
          .upload(storagePath, file)

        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage
            .from('files')
            .getPublicUrl(storagePath)
          fileUrl = publicUrl
        } else {
          console.warn('Supabase upload failed, using local blob URL:', error)
        }
      }
    } catch (err) {
      console.error('Error uploading file:', err)
    }

    await sendMessage('', type, fileUrl, fileName)
  }

  const togglePinConversation = (convId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === convId ? { ...conv, isPinned: !conv.isPinned } : conv
    ))
  }

  const toggleMuteConversation = (convId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === convId ? { ...conv, isMuted: !conv.isMuted } : conv
    ))
  }

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const conversationMessages = selectedConversation
    ? messages.filter(msg => msg.conversationId === selectedConversation.id)
    : []

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🚀', '💯', '🔥']

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-peak-glass border-r border-peak-border flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-peak-border">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-peak-dim" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-xl focus:outline-none focus:border-peak-primary/50"
            />
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-peak-primary hover:bg-peak-primary-600 text-white rounded-xl transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Message</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {/* Pinned */}
          {filteredConversations.some(c => c.isPinned) && (
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-peak-muted uppercase tracking-wider">Pinned</h3>
            </div>
          )}
          {filteredConversations.filter(c => c.isPinned).map(conversation => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversation?.id === conversation.id}
              onClick={() => {
                setSelectedConversation(conversation)
              }}
              onPin={() => togglePinConversation(conversation.id)}
              onMute={() => toggleMuteConversation(conversation.id)}
            />
          ))}

          {/* Channels */}
          <div className="px-4 py-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-peak-muted uppercase tracking-wider">Channels</h3>
            <button
              onClick={() => setShowChannels(!showChannels)}
              className="text-peak-dim hover:text-peak"
            >
              {showChannels ? '−' : '+'}
            </button>
          </div>
          {showChannels && filteredConversations.filter(c => c.type === 'channel' && !c.isPinned).map(conversation => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversation?.id === conversation.id}
              onClick={() => {
                setSelectedConversation(conversation)
              }}
              onPin={() => togglePinConversation(conversation.id)}
              onMute={() => toggleMuteConversation(conversation.id)}
            />
          ))}

          {/* Direct Messages */}
          <div className="px-4 py-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-peak-muted uppercase tracking-wider">Direct Messages</h3>
            <button
              onClick={() => setShowDirectMessages(!showDirectMessages)}
              className="text-peak-dim hover:text-peak"
            >
              {showDirectMessages ? '−' : '+'}
            </button>
          </div>
          {showDirectMessages && filteredConversations.filter(c => (c.type === 'direct' || c.type === 'group') && !c.isPinned).map(conversation => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversation?.id === conversation.id}
              onClick={() => {
                setSelectedConversation(conversation)
              }}
              onPin={() => togglePinConversation(conversation.id)}
              onMute={() => toggleMuteConversation(conversation.id)}
            />
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col h-full relative">
          {/* Chat Header */}
          <div className="bg-peak-glass border-b border-peak-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedConversation.type === 'channel' ? (
                  <div className="w-10 h-10 bg-white/[0.04] border border-peak-border rounded-xl flex items-center justify-center">
                    <Hash className="w-5 h-5 text-peak-muted" />
                  </div>
                ) : selectedConversation.type === 'group' ? (
                  <div className="w-10 h-10 bg-peak-primary rounded-xl flex items-center justify-center text-white font-semibold">
                    <Users className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-10 h-10 bg-peak-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedConversation.name.charAt(0)}
                    </div>
                    {selectedConversation.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-peak-green rounded-full border-2 border-peak-bg" />
                    )}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-peak">
                      {selectedConversation.type === 'channel' && '#'}{selectedConversation.name}
                    </h2>
                    <span className="flex items-center gap-0.5 text-peak-dim" title="End-to-end encrypted">
                      <Lock className="w-3 h-3" />
                    </span>
                  </div>
                  <p className="text-sm text-peak-muted">
                    {selectedConversation.type === 'direct' && selectedConversation.isOnline ? 'Active now' :
                     selectedConversation.type === 'channel' ? `${selectedConversation.participants.length} members` :
                     selectedConversation.type === 'group' ? `${selectedConversation.participants.length} members` :
                     'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Route call buttons appropriately */}
                <Link
                  href={`/phone?contact=${encodeURIComponent(selectedConversation.name)}&autoDial=true`}
                  className="p-2 hover:bg-white/[0.04] rounded-lg transition"
                >
                  <Phone className="w-5 h-5 text-peak-muted" />
                </Link>
                <Link
                  href={`/video?roomId=${encodeURIComponent(selectedConversation.id)}&startCall=true`}
                  className="p-2 hover:bg-white/[0.04] rounded-lg transition"
                >
                  <Video className="w-5 h-5 text-peak-muted" />
                </Link>
                <button className="p-2 hover:bg-white/[0.04] rounded-lg transition">
                  <MoreVertical className="w-5 h-5 text-peak-muted" />
                </button>
              </div>
            </div>
          </div>

          {/* Reconnect Banner */}
          {offlineActive && (
            <div className="bg-peak-amber/15 border-b border-peak-amber/30 text-peak-amber text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 z-10">
              <span className="w-2.5 h-2.5 bg-peak-amber rounded-full animate-ping" />
              <span>You are offline. Reconnecting... Messages will be synced when back online.</span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {conversationMessages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === 'user' || message.senderId === currentUser?.id}
                showAvatar={index === 0 || conversationMessages[index - 1]?.senderId !== message.senderId}
              />
            ))}
            {Object.keys(typingUsers).length > 0 && Object.entries(typingUsers).map(([userId, userName]) => (
              <div key={userId} className="flex items-center gap-2 text-peak-muted">
                <div className="w-8 h-8 bg-peak-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {userName.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-peak-dim">{userName} is typing...</span>
                  <div className="flex gap-1 mt-1">
                    <span className="w-1.5 h-1.5 bg-peak-dim rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-peak-dim rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-peak-dim rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-peak-glass border-t border-peak-border px-6 py-4">
            <div className="flex items-center justify-center gap-1 text-[11px] text-peak-dim mb-2">
              <Lock className="w-3 h-3" />
              <span>Messages are encrypted</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-white/[0.04] rounded-lg transition"
              >
                <Paperclip className="w-5 h-5 text-peak-muted" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-white/[0.04] rounded-lg transition"
              >
                <ImageIcon className="w-5 h-5 text-peak-muted" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && newMessage.length <= 1000 && handleSendMessage()}
                  placeholder="Type a message..."
                  className={`w-full px-4 py-2 bg-white/[0.04] border text-peak placeholder:text-peak-dim rounded-xl focus:outline-none focus:border-peak-primary/50 ${
                    newMessage.length > 1000 ? 'border-peak-red ring-2 ring-peak-red' : 'border-peak-border'
                  }`}
                />
                <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className={`text-[10px] ${newMessage.length > 1000 ? 'text-peak-red font-bold' : 'text-peak-dim'}`}>
                    {newMessage.length}/1000
                  </span>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1 hover:bg-white/[0.08] rounded transition"
                  >
                    <Smile className="w-5 h-5 text-peak-dim" />
                  </button>
                </div>
                {newMessage.length > 1000 && (
                  <div className="text-peak-red text-xs mt-1 absolute left-0 top-full">
                    Message exceeds 1000 character limit
                  </div>
                )}
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 bg-peak-glass border border-peak-border rounded-xl shadow-lg p-2 grid grid-cols-4 gap-1 z-10">
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setNewMessage(newMessage + emoji)
                          setShowEmojiPicker(false)
                        }}
                        className="p-2 hover:bg-white/[0.06] rounded transition text-xl"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="p-2 hover:bg-white/[0.04] rounded-lg transition">
                <Mic className="w-5 h-5 text-peak-muted" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={newMessage.length > 1000}
                className="px-4 py-2 bg-peak-primary hover:bg-peak-primary-600 text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/[0.04] border border-peak-border rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-peak-dim" />
            </div>
            <h3 className="text-xl font-semibold text-peak mb-2">
              Select a conversation
            </h3>
            <p className="text-peak-muted">
              Choose a conversation from the sidebar to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Conversation Item Component
function ConversationItem({
  conversation,
  isSelected,
  onClick,
  onPin,
  onMute
}: {
  conversation: Conversation
  isSelected: boolean
  onClick: () => void
  onPin: () => void
  onMute: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 hover:bg-white/[0.04] cursor-pointer transition group ${
        isSelected ? 'bg-white/[0.06]' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          {conversation.type === 'channel' ? (
            <div className="w-10 h-10 bg-white/[0.04] border border-peak-border rounded-xl flex items-center justify-center">
              <Hash className="w-5 h-5 text-peak-muted" />
            </div>
          ) : conversation.type === 'group' ? (
            <div className="w-10 h-10 bg-peak-primary rounded-xl flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
          ) : (
            <>
              <div className="w-10 h-10 bg-peak-primary rounded-full flex items-center justify-center text-white font-semibold">
                {conversation.name.charAt(0)}
              </div>
              {conversation.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-peak-green rounded-full border-2 border-peak-bg" />
              )}
            </>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-peak truncate">
              {conversation.type === 'channel' && '#'}{conversation.name}
            </span>
            <div className="flex items-center gap-1">
              {conversation.isPinned && <Star className="w-3 h-3 text-peak-amber fill-current" />}
              {conversation.isMuted && <BellOff className="w-3 h-3 text-peak-dim" />}
              {conversation.lastMessageTime && (
                <span className="text-xs text-peak-muted">
                  {formatTime(conversation.lastMessageTime)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-peak-muted truncate">
              {conversation.lastMessage}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-peak-primary text-white text-xs font-medium rounded-full">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPin()
            }}
            className="p-1 hover:bg-white/[0.08] rounded"
            title={conversation.isPinned ? 'Unpin' : 'Pin'}
          >
            <Star className={`w-4 h-4 ${conversation.isPinned ? 'text-peak-amber fill-current' : 'text-peak-dim'}`} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Message Bubble Component
function MessageBubble({
  message,
  isOwn,
  showAvatar
}: {
  message: Message
  isOwn: boolean
  showAvatar: boolean
}) {
  return (
    <div className={`flex items-start gap-3 ${isOwn ? 'justify-end' : ''}`}>
      {!isOwn && showAvatar && (
        <div className="w-8 h-8 bg-peak-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">
          {message.senderName.charAt(0)}
        </div>
      )}
      {!isOwn && !showAvatar && <div className="w-8" />}
      <div className={`max-w-md ${isOwn ? 'items-end flex flex-col' : ''}`}>
        {!isOwn && showAvatar && (
          <p className="text-xs text-peak-muted mb-1">{message.senderName}</p>
        )}
        {message.type === 'text' ? (
          <div className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-peak-primary/20 border border-peak-primary/40 text-peak'
              : 'bg-white/[0.04] border border-peak-border text-peak'
          }`}>
            <p className="text-sm">{message.content}</p>
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex gap-1 mt-2">
                {message.reactions.map((reaction, i) => (
                  <span key={i} className="text-sm bg-white/10 rounded px-1">
                    {reaction.emoji} {reaction.users.length}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : message.type === 'image' ? (
          <div className="bg-white/[0.04] rounded-2xl overflow-hidden border border-peak-border max-w-sm">
            {message.fileUrl ? (
              <img
                src={message.fileUrl}
                alt={message.fileName || 'Uploaded image'}
                className="max-w-full max-h-60 object-contain"
              />
            ) : (
              <div className="w-64 h-48 bg-white/[0.04] flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-peak-dim" />
              </div>
            )}
            <div className="px-3 py-2 border-t border-peak-border bg-white/[0.02]">
              <p className="text-xs text-peak-muted truncate">{message.fileName}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/[0.04] rounded-2xl p-3 flex items-center gap-3 border border-peak-border">
            <File className="w-8 h-8 text-peak-dim" />
            <div>
              <p className="text-sm font-medium text-peak truncate max-w-xs">{message.fileName}</p>
              {message.fileUrl ? (
                <a
                  href={message.fileUrl}
                  download={message.fileName}
                  className="text-xs text-peak-primary-300 hover:underline"
                >
                  Download file
                </a>
              ) : (
                <p className="text-xs text-peak-muted">Processing file...</p>
              )}
            </div>
          </div>
        )}
        <p className="text-xs text-peak-muted mt-1 flex items-center gap-2">
          <span>{formatTime(message.timestamp)}</span>
          {message.isEdited && <span>• Edited</span>}
          {isOwn && (
            <span className="font-semibold text-[10px]">
              {message.pending ? '• Sending...' : message.isRead ? '• Read' : '• Delivered'}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

// Helper function to format time
function formatTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return new Date(date).toLocaleDateString()
}