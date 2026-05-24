'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Send, User, Bot, Mic, Paperclip, Settings, X, FileText,
  Image as ImageIcon, Calendar, CheckSquare, FileSearch, Brain,
  TrendingUp, Mail, Phone, Globe, Code, Database, Shield,
  Zap, BookOpen, Heart
} from 'lucide-react'

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Array<{ name: string; size: number; type: string }>;
  suggestions?: string[];
}

// Simulated AI responses based on keywords and context
const getAIResponse = (input: string): { response: string; suggestions?: string[] } => {
  const lowerInput = input.toLowerCase()

  // Task management
  if (lowerInput.includes('task') || lowerInput.includes('todo') || lowerInput.includes('organize')) {
    return {
      response: `I can help you organize your tasks! Here's what I suggest:

📋 **Current Priority Tasks:**
1. Review pending pull requests
2. Update project documentation
3. Prepare for tomorrow's standup meeting
4. Complete code review for the authentication module

Would you like me to:
- Create a new task list
- Set priorities for existing tasks
- Schedule reminders for deadlines
- Analyze your productivity patterns?`,
      suggestions: ['Create a new task', 'View all tasks', 'Set priorities', 'Schedule reminder']
    }
  }

  // Document analysis
  if (lowerInput.includes('document') || lowerInput.includes('analyze') || lowerInput.includes('file')) {
    return {
      response: `I can analyze documents and files for you!

📄 **Document Analysis Capabilities:**
- Extract key information and summaries
- Identify important dates and deadlines
- Find patterns and insights
- Generate reports and visualizations

To analyze a document, simply upload it using the paperclip icon. I support:
- PDF files
- Word documents (.doc, .docx)
- Text files
- Spreadsheets
- Images with text

What type of document would you like to analyze?`,
      suggestions: ['Upload document', 'Recent analyses', 'Generate report', 'Extract data']
    }
  }

  // Meeting/Calendar
  if (lowerInput.includes('meeting') || lowerInput.includes('schedule') || lowerInput.includes('calendar')) {
    return {
      response: `Let me help you with scheduling! 📅

**Your Upcoming Schedule:**
- 10:00 AM - Team standup (in 2 hours)
- 2:00 PM - Client presentation
- 3:30 PM - Code review session
- Tomorrow 9:00 AM - Sprint planning

**Available time slots today:**
- 11:00 AM - 12:00 PM
- 12:30 PM - 1:30 PM
- 4:00 PM - 5:30 PM

Would you like to:
- Schedule a new meeting
- Send calendar invites
- Find common availability
- Set up recurring meetings?`,
      suggestions: ['Schedule meeting', 'View calendar', 'Find time slot', 'Send invites']
    }
  }

  // Activity summary
  if (lowerInput.includes('activity') || lowerInput.includes('recent') || lowerInput.includes('summary')) {
    return {
      response: `Here's your activity summary: 📊

**Today's Activity:**
- 12 tasks completed ✅
- 8 files uploaded
- 23 messages sent
- 3 meetings attended

**Weekly Stats:**
- Productivity: Up 15% from last week
- Most active: Tuesday (45 tasks)
- Focus time: 28 hours
- Collaboration: 15 team interactions

**Trending Topics in Your Work:**
1. Authentication implementation
2. Database optimization
3. UI/UX improvements
4. Testing coverage

Need more detailed analytics?`,
      suggestions: ['Detailed report', 'Export data', 'Team activity', 'Productivity tips']
    }
  }

  // Code/Development help
  if (lowerInput.includes('code') || lowerInput.includes('debug') || lowerInput.includes('error') || lowerInput.includes('implement')) {
    return {
      response: `I can help with your development tasks! 💻

**Development Assistance:**
- Code review and optimization
- Bug identification and fixes
- Implementation suggestions
- Best practices and patterns

**Recent Code Activities:**
- Fixed authentication bug in login flow
- Optimized database queries (40% faster)
- Added unit tests (coverage: 78%)
- Refactored payment module

What specific coding task do you need help with?`,
      suggestions: ['Review code', 'Debug error', 'Optimize performance', 'Write tests']
    }
  }

  // Help command
  if (lowerInput.includes('help') || lowerInput === '?' || lowerInput.includes('what can you do')) {
    return {
      response: `I'm Lisa, your AI assistant! Here's how I can help you: 🚀

**My Capabilities:**
📋 **Task Management** - Organize, prioritize, and track tasks
📄 **Document Analysis** - Extract insights from files
📅 **Smart Scheduling** - Manage calendars and meetings
📊 **Analytics** - Track productivity and patterns
💻 **Code Assistant** - Help with development tasks
💬 **Communication** - Draft emails and messages
🔍 **Smart Search** - Find information quickly
🎯 **Project Planning** - Roadmaps and timelines

Just ask me anything or click on a quick action to get started!`,
      suggestions: ['Organize tasks', 'Analyze document', 'Schedule meeting', 'Show analytics']
    }
  }

  // Email/Communication
  if (lowerInput.includes('email') || lowerInput.includes('message') || lowerInput.includes('draft')) {
    return {
      response: `I'll help you with your communications! ✉️

**Draft Templates Ready:**
1. Project update email
2. Meeting follow-up
3. Client proposal
4. Team announcement

**Recent Communications:**
- Sent: 5 emails today
- Received: 12 new messages
- Pending: 3 draft responses

Would you like me to:
- Draft a new email
- Summarize unread messages
- Schedule email send
- Create email templates?`,
      suggestions: ['Draft email', 'View inbox', 'Create template', 'Schedule send']
    }
  }

  // Data/Analytics
  if (lowerInput.includes('data') || lowerInput.includes('analytics') || lowerInput.includes('report')) {
    return {
      response: `Let me generate analytics for you! 📈

**Performance Metrics:**
- Project completion: 87% on track
- Team velocity: 42 story points/sprint
- Code quality: A- (improved from B+)
- Customer satisfaction: 4.6/5.0

**Key Insights:**
✅ Productivity peaks on Tuesdays
📈 30% faster task completion this month
🎯 Meeting efficiency improved by 25%
💡 Suggestion: Batch similar tasks for better focus

What specific metrics would you like to explore?`,
      suggestions: ['Generate report', 'Export data', 'Team metrics', 'Custom dashboard']
    }
  }

  // Default response with context awareness
  return {
    response: `I understand you're asking about "${input}". Let me help you with that!

Based on your request, I can:
- Search for relevant information
- Create action items
- Provide recommendations
- Connect you with the right resources

How would you like me to assist you specifically with this?`,
    suggestions: ['Tell me more', 'Search information', 'Create task', 'Get recommendations']
  }
}

// Helper to convert File to Base64 (including data prefix)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

export default function LisaAIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: `Hello! I'm Lisa, your AI assistant. 👋

I'm here to help you be more productive and organized. I can assist with:
- Task management and prioritization
- Document analysis and summarization
- Smart scheduling and calendar management
- Code reviews and development help
- Data analytics and insights
- And much more!

How can I help you today?`,
      timestamp: new Date(),
      suggestions: ['Help me organize tasks', 'Analyze a document', 'Schedule a meeting', 'Show my activity']
    }
    setMessages([welcomeMessage])
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      setFileError(null)
      const newFiles = Array.from(files)
      const validFiles: File[] = []
      
      for (const file of newFiles) {
        if (file.size > 4.5 * 1024 * 1024) {
          setFileError(`File "${file.name}" exceeds the 4.5MB limit. Please upload a smaller file.`)
          continue
        }
        validFiles.push(file)
      }
      
      if (validFiles.length > 0) {
        setAttachedFiles(prev => [...prev, ...validFiles])
      }
    }
  }

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Autogrowing Textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const newHeight = Math.min(textarea.scrollHeight, 160)
      textarea.style.height = `${newHeight}px`
    }
  }, [input])

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input
    if (!textToSend.trim() && attachedFiles.length === 0) return

    let messageContent = textToSend
    const filesToConvert = [...attachedFiles]

    // Empty input and attached files state early
    setInput('')
    setAttachedFiles([])
    setIsTyping(true)

    // Convert attached files to base64
    let attachments: Array<{ name: string; size: number; type: string; base64: string }> = []
    try {
      attachments = await Promise.all(
        filesToConvert.map(async (file) => {
          const base64 = await fileToBase64(file)
          return {
            name: file.name,
            size: file.size,
            type: file.type,
            base64,
          }
        })
      )
    } catch (err) {
      console.error('[Lisa] Error converting files to base64:', err)
    }

    if (filesToConvert.length > 0) {
      const fileNames = filesToConvert.map(f => f.name).join(', ')
      messageContent = `${textToSend}${textToSend ? '\n\n' : ''}[Attached files: ${fileNames}]`
    }

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments.map(a => ({ name: a.name, size: a.size, type: a.type })) : undefined
    }

    setMessages(prev => [...prev, userMessage])

    const assistantMsgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

    try {
      // Call the real AI API
      console.log('[Lisa] Calling /api/ai/chat with message:', messageContent)
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          useRAG: false,
          attachments,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      // Hide typing bubble when streaming starts
      setIsTyping(false)

      // Add a placeholder assistant message
      setMessages(prev => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        },
      ])

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let receivedContent = false
      let lineBuffer = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            if (lineBuffer.trim()) {
              const line = lineBuffer.trim()
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data !== '[DONE]') {
                  try {
                    const parsed = JSON.parse(data)
                    if (parsed.type === 'content' && parsed.content) {
                      receivedContent = true
                      const contentChunk = parsed.content
                      setMessages(prev => prev.map(msg => 
                        msg.id === assistantMsgId ? { ...msg, content: msg.content + contentChunk } : msg
                      ))
                    }
                  } catch {}
                }
              }
            }
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          lineBuffer += chunk
          const lines = lineBuffer.split('\n')
          
          lineBuffer = lines.pop() || ''

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine) continue

            if (trimmedLine.startsWith('data: ')) {
              const data = trimmedLine.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.type === 'content' && parsed.content) {
                  receivedContent = true
                  const contentChunk = parsed.content

                  // Progressively update the assistant message in state
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMsgId ? { ...msg, content: msg.content + contentChunk } : msg
                  ))
                }
              } catch {
                // Skip unparseable lines
              }
            }
          }
        }
      }

      // If we didn't receive any content, put a fallback
      if (!receivedContent) {
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMsgId ? { ...msg, content: 'I apologize, but I was unable to generate a response. Please try again.' } : msg
        ))
      }
    } catch (error) {
      console.error('AI chat error:', error)
      setIsTyping(false)

      // Fallback to simulated response if fetch/network fails using setInterval (client-side fallback stream)
      const { response: fallbackResponse, suggestions } = getAIResponse(textToSend)

      // Append assistant message placeholder with suggestions
      setMessages(prev => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          suggestions,
        },
      ])

      const words = fallbackResponse.split(' ')
      let currentWordIndex = 0

      const intervalId = setInterval(() => {
        if (currentWordIndex >= words.length) {
          clearInterval(intervalId)
          return
        }

        const nextWord = words[currentWordIndex] + (currentWordIndex === words.length - 1 ? '' : ' ')
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId ? { ...msg, content: msg.content + nextWord } : msg
        ))

        currentWordIndex++
      }, 50)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickActions = [
    { icon: CheckSquare, label: "Organize my tasks", action: "Help me organize my tasks" },
    { icon: FileSearch, label: "Analyze document", action: "I need to analyze a document" },
    { icon: Calendar, label: "Schedule meeting", action: "Help me schedule a meeting" },
    { icon: TrendingUp, label: "Show analytics", action: "Show me my activity summary" },
    { icon: Mail, label: "Draft email", action: "Help me draft an email" },
    { icon: Code, label: "Code help", action: "I need help with code" }
  ]

  const capabilities = [
    { icon: Brain, title: "Smart AI Assistant", desc: "Powered by advanced language models" },
    { icon: Zap, title: "Instant Responses", desc: "Get help in real-time" },
    { icon: Shield, title: "Secure & Private", desc: "Your data stays protected" },
    { icon: Globe, title: "Multi-domain Expert", desc: "Help across all areas" },
    { icon: Database, title: "Context Aware", desc: "Remembers your preferences" },
    { icon: Heart, title: "Personalized", desc: "Learns and adapts to you" }
  ]

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative">
      {/* Ambient Siri-style glow background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/0 blur-[120px] dark:from-indigo-600/10 dark:to-purple-600/0 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-violet-400/20 to-fuchsia-400/0 blur-[120px] dark:from-violet-600/10 dark:to-fuchsia-600/0 animate-pulse" style={{ animationDuration: '12s' }}></div>
      </div>

      {/* Sidebar */}
      <div className="hidden md:flex w-80 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-r border-zinc-200/50 dark:border-zinc-800/50 flex flex-col relative z-10">
        <div className="p-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Lisa AI</h2>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Online & Ready
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <button
                  key={index}
                  onClick={() => sendMessage(action.action)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Icon className="w-4 h-4 text-violet-500" />
                  <span>{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Capabilities</h3>
          <div className="space-y-3">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{capability.title}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{capability.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative z-10 bg-transparent">
        {/* Chat Header */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-b border-zinc-200/50 dark:border-zinc-800/50 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Chat with Lisa</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Your intelligent AI assistant</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-lg transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-lg transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-lg transition-colors">
                <BookOpen className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-transparent">
          {messages.map((message, index) => (
            <div key={index} className="animate-in">
              <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-zinc-200 dark:bg-zinc-700'
                      : 'bg-gradient-to-br from-violet-500 to-purple-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <div className={`px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                        : 'bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-md text-zinc-800 dark:text-zinc-200 shadow-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                           {message.attachments.map((file, i) => (
                            <div key={i} className={`flex items-center gap-2 text-xs ${
                              message.role === 'user' ? 'text-violet-100' : 'text-zinc-500 dark:text-zinc-400'
                            }`}>
                              {file.type.startsWith('image/') ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                              <span>{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-zinc-500 dark:text-zinc-400 text-right' : 'text-zinc-400 dark:text-zinc-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {message.suggestions && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(suggestion)}
                            className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-all duration-200 active:scale-95"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl backdrop-blur-md shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-t border-zinc-200/50 dark:border-zinc-800/50 px-6 py-4 sticky bottom-0 z-10">
          {fileError && (
            <div className="mb-2 text-xs text-red-500 font-medium bg-red-500/10 dark:bg-red-500/5 px-3 py-1.5 rounded-lg border border-red-500/20 animate-in">
              {fileError}
            </div>
          )}
          {/* Attached Files Display */}
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2 animate-in">
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  )}
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{file.name}</span>
                  <button
                    onClick={() => removeAttachedFile(index)}
                    className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Lisa anything..."
                className="w-full px-4 py-3 pr-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none border border-zinc-200/50 dark:border-zinc-800/50 transition-all duration-200"
                rows={1}
                style={{ minHeight: '48px' }}
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 bottom-3 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-200"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() && attachedFiles.length === 0}
              className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
            Powered by Google Gemini 2.5 Flash
          </p>
        </div>
      </div>
    </div>
  )
}