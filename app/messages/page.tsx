'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Search, Plus, Send, Paperclip, Phone, Video, MoreVertical,
  Hash, Users, Star, Smile, Image as ImageIcon,
  File, Mic, BellOff
} from 'lucide-react'

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

const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    type: 'direct',
    name: 'Sarah Johnson',
    lastMessage: 'Sounds good! Let me know when you\'re ready.',
    lastMessageTime: new Date(Date.now() - 300000),
    unreadCount: 2,
    participants: ['user', 'sarah'],
    isOnline: true,
    isPinned: true
  },
  {
    id: '2',
    type: 'channel',
    name: 'general',
    lastMessage: 'Welcome to the team!',
    lastMessageTime: new Date(Date.now() - 3600000),
    unreadCount: 0,
    participants: ['user', 'sarah', 'john', 'emily'],
  },
  {
    id: '3',
    type: 'channel',
    name: 'development',
    lastMessage: 'PR #234 has been merged',
    lastMessageTime: new Date(Date.now() - 7200000),
    unreadCount: 5,
    participants: ['user', 'john', 'mike'],
  },
  {
    id: '4',
    type: 'group',
    name: 'Project Alpha Team',
    lastMessage: 'Meeting tomorrow at 2 PM',
    lastMessageTime: new Date(Date.now() - 86400000),
    unreadCount: 0,
    participants: ['user', 'sarah', 'john', 'emily', 'mike'],
    isMuted: true
  },
  {
    id: '5',
    type: 'direct',
    name: 'John Doe',
    lastMessage: 'Can you review my code?',
    lastMessageTime: new Date(Date.now() - 172800000),
    unreadCount: 1,
    participants: ['user', 'john'],
    isOnline: false
  }
]

const SAMPLE_MESSAGES: Message[] = [
  {
    id: '1',
    conversationId: '1',
    senderId: 'sarah',
    senderName: 'Sarah Johnson',
    content: 'Hey! How\'s the new feature coming along?',
    timestamp: new Date(Date.now() - 3600000),
    type: 'text',
    isRead: true
  },
  {
    id: '2',
    conversationId: '1',
    senderId: 'user',
    senderName: 'You',
    content: 'Making great progress! Just finished the UI components.',
    timestamp: new Date(Date.now() - 3000000),
    type: 'text',
    isRead: true
  },
  {
    id: '3',
    conversationId: '1',
    senderId: 'sarah',
    senderName: 'Sarah Johnson',
    content: 'That\'s awesome! Can you share a screenshot?',
    timestamp: new Date(Date.now() - 600000),
    type: 'text',
    isRead: true
  },
  {
    id: '4',
    conversationId: '1',
    senderId: 'user',
    senderName: 'You',
    content: 'Sure, here it is:',
    timestamp: new Date(Date.now() - 500000),
    type: 'text',
    isRead: true
  },
  {
    id: '5',
    conversationId: '1',
    senderId: 'user',
    senderName: 'You',
    content: '',
    timestamp: new Date(Date.now() - 480000),
    type: 'image',
    fileUrl: '/screenshot.png',
    fileName: 'Feature_Screenshot.png',
    isRead: true
  },
  {
    id: '6',
    conversationId: '1',
    senderId: 'sarah',
    senderName: 'Sarah Johnson',
    content: 'Looks amazing! 🎉',
    timestamp: new Date(Date.now() - 400000),
    type: 'text',
    isRead: true,
    reactions: [{ emoji: '👍', users: ['user'] }]
  },
  {
    id: '7',
    conversationId: '1',
    senderId: 'sarah',
    senderName: 'Sarah Johnson',
    content: 'Sounds good! Let me know when you\'re ready.',
    timestamp: new Date(Date.now() - 300000),
    type: 'text',
    isRead: false
  }
]

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showChannels, setShowChannels] = useState(true)
  const [showDirectMessages, setShowDirectMessages] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load data from localStorage
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations')
    const savedMessages = localStorage.getItem('messages')

    if (savedConversations) {
      setConversations(JSON.parse(savedConversations))
    } else {
      setConversations(SAMPLE_CONVERSATIONS)
      localStorage.setItem('conversations', JSON.stringify(SAMPLE_CONVERSATIONS))
    }

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    } else {
      setMessages(SAMPLE_MESSAGES)
      localStorage.setItem('messages', JSON.stringify(SAMPLE_MESSAGES))
    }

    // Select first conversation by default
    if (SAMPLE_CONVERSATIONS.length > 0) {
      setSelectedConversation(SAMPLE_CONVERSATIONS[0])
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: Date.now().toString(),
      conversationId: selectedConversation.id,
      senderId: 'user',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      isRead: true
    }

    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)
    localStorage.setItem('messages', JSON.stringify(updatedMessages))

    // Update conversation's last message
    const updatedConversations = conversations.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, lastMessage: newMessage, lastMessageTime: new Date() }
        : conv
    )
    setConversations(updatedConversations)
    localStorage.setItem('conversations', JSON.stringify(updatedConversations))

    setNewMessage('')

    // Simulate typing indicator and response
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      if (selectedConversation.type === 'direct') {
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          conversationId: selectedConversation.id,
          senderId: selectedConversation.participants.find(p => p !== 'user') || 'other',
          senderName: selectedConversation.name,
          content: getRandomResponse(),
          timestamp: new Date(),
          type: 'text',
          isRead: false
        }
        const newUpdatedMessages = [...updatedMessages, responseMessage]
        setMessages(newUpdatedMessages)
        localStorage.setItem('messages', JSON.stringify(newUpdatedMessages))
      }
    }, 2000)
  }

  const getRandomResponse = () => {
    const responses = [
      'That sounds great!',
      'I\'ll look into it right away.',
      'Thanks for the update!',
      'Let me check and get back to you.',
      'Excellent work! 👏',
      'Could you provide more details?',
      'I agree with your approach.',
      'Let\'s discuss this in our next meeting.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedConversation) return

    const message: Message = {
      id: Date.now().toString(),
      conversationId: selectedConversation.id,
      senderId: 'user',
      senderName: 'You',
      content: '',
      timestamp: new Date(),
      type: file.type.startsWith('image/') ? 'image' : 'file',
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      isRead: true
    }

    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)
    localStorage.setItem('messages', JSON.stringify(updatedMessages))
  }

  const togglePinConversation = (convId: string) => {
    const updatedConversations = conversations.map(conv =>
      conv.id === convId ? { ...conv, isPinned: !conv.isPinned } : conv
    )
    setConversations(updatedConversations)
    localStorage.setItem('conversations', JSON.stringify(updatedConversations))
  }

  const toggleMuteConversation = (convId: string) => {
    const updatedConversations = conversations.map(conv =>
      conv.id === convId ? { ...conv, isMuted: !conv.isMuted } : conv
    )
    setConversations(updatedConversations)
    localStorage.setItem('conversations', JSON.stringify(updatedConversations))
  }

  const markAsRead = (convId: string) => {
    const updatedConversations = conversations.map(conv =>
      conv.id === convId ? { ...conv, unreadCount: 0 } : conv
    )
    setConversations(updatedConversations)
    localStorage.setItem('conversations', JSON.stringify(updatedConversations))

    const updatedMessages = messages.map(msg =>
      msg.conversationId === convId ? { ...msg, isRead: true } : msg
    )
    setMessages(updatedMessages)
    localStorage.setItem('messages', JSON.stringify(updatedMessages))
  }

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const conversationMessages = selectedConversation
    ? messages.filter(msg => msg.conversationId === selectedConversation.id)
    : []

  const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🚀', '💯', '🔥']

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Message</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {/* Pinned */}
          {filteredConversations.some(c => c.isPinned) && (
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Pinned</h3>
            </div>
          )}
          {filteredConversations.filter(c => c.isPinned).map(conversation => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversation?.id === conversation.id}
              onClick={() => {
                setSelectedConversation(conversation)
                markAsRead(conversation.id)
              }}
              onPin={() => togglePinConversation(conversation.id)}
              onMute={() => toggleMuteConversation(conversation.id)}
            />
          ))}

          {/* Channels */}
          <div className="px-4 py-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Channels</h3>
            <button
              onClick={() => setShowChannels(!showChannels)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                markAsRead(conversation.id)
              }}
              onPin={() => togglePinConversation(conversation.id)}
              onMute={() => toggleMuteConversation(conversation.id)}
            />
          ))}

          {/* Direct Messages */}
          <div className="px-4 py-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Direct Messages</h3>
            <button
              onClick={() => setShowDirectMessages(!showDirectMessages)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                markAsRead(conversation.id)
              }}
              onPin={() => togglePinConversation(conversation.id)}
              onMute={() => toggleMuteConversation(conversation.id)}
            />
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedConversation.type === 'channel' ? (
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Hash className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                ) : selectedConversation.type === 'group' ? (
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-semibold">
                    <Users className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedConversation.name.charAt(0)}
                    </div>
                    {selectedConversation.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                    )}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedConversation.type === 'channel' && '#'}{selectedConversation.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedConversation.type === 'direct' && selectedConversation.isOnline ? 'Active now' :
                     selectedConversation.type === 'channel' ? `${selectedConversation.participants.length} members` :
                     selectedConversation.type === 'group' ? `${selectedConversation.participants.length} members` :
                     'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                  <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                  <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {conversationMessages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === 'user'}
                showAvatar={index === 0 || conversationMessages[index - 1]?.senderId !== message.senderId}
              />
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {selectedConversation.name.charAt(0)}
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                >
                  <Smile className="w-5 h-5 text-gray-400" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-2 grid grid-cols-4 gap-1">
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setNewMessage(newMessage + emoji)
                          setShowEmojiPicker(false)
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition text-xl"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                <Mic className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
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
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Select a conversation
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
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
      className={`px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition group ${
        isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          {conversation.type === 'channel' ? (
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
              <Hash className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
          ) : conversation.type === 'group' ? (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
          ) : (
            <>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {conversation.name.charAt(0)}
              </div>
              {conversation.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
              )}
            </>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-gray-900 dark:text-white truncate">
              {conversation.type === 'channel' && '#'}{conversation.name}
            </span>
            <div className="flex items-center gap-1">
              {conversation.isPinned && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
              {conversation.isMuted && <BellOff className="w-3 h-3 text-gray-400" />}
              {conversation.lastMessageTime && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(conversation.lastMessageTime)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {conversation.lastMessage}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-full">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPin()
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            title={conversation.isPinned ? 'Unpin' : 'Pin'}
          >
            <Star className={`w-4 h-4 ${conversation.isPinned ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
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
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
          {message.senderName.charAt(0)}
        </div>
      )}
      {!isOwn && !showAvatar && <div className="w-8" />}
      <div className={`max-w-md ${isOwn ? 'items-end' : ''}`}>
        {!isOwn && showAvatar && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{message.senderName}</p>
        )}
        {message.type === 'text' ? (
          <div className={`px-4 py-2 rounded-lg ${
            isOwn
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
          }`}>
            <p className="text-sm">{message.content}</p>
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex gap-1 mt-2">
                {message.reactions.map((reaction, i) => (
                  <span key={i} className="text-sm bg-white/20 rounded px-1">
                    {reaction.emoji} {reaction.users.length}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : message.type === 'image' ? (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div className="w-64 h-48 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
            <div className="px-3 py-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">{message.fileName}</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 flex items-center gap-3">
            <File className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{message.fileName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Click to download</p>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formatTime(message.timestamp)}
          {message.isEdited && ' • Edited'}
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

// Add this import at the top
import { MessageSquare } from 'lucide-react'