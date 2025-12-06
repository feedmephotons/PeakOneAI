'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Bot,
  Play,
  Pause,
  StopCircle,
  Send,
  Loader2,
  Globe,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Maximize2,
  Minimize2,
  Eye,
  ChevronRight,
  AlertCircle,
  Info
} from 'lucide-react'

interface AgentSession {
  id: string
  objective: string
  status: 'idle' | 'planning' | 'executing' | 'paused' | 'completed' | 'failed'
  startUrl?: string
  createdAt: string
}

interface AgentTask {
  id: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
  order: number
}

interface LiveState {
  screenshot: string
  url: string
  status: string
  currentAction?: string
  progress: {
    completedTasks: number
    totalTasks: number
    currentTask?: string
  }
  logs: {
    timestamp: string
    level: 'info' | 'warn' | 'error' | 'success'
    message: string
  }[]
}

interface Message {
  id: string
  role: 'user' | 'agent' | 'system'
  content: string
  timestamp: string
}

export default function AgentPage() {
  const [activeSession, setActiveSession] = useState<AgentSession | null>(null)
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [liveState, setLiveState] = useState<LiveState | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [startUrl, setStartUrl] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showLogs, setShowLogs] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Poll for live state when session is active
  const pollLiveState = useCallback(async () => {
    if (!activeSession || !['executing', 'planning', 'paused'].includes(activeSession.status)) {
      return
    }

    try {
      const response = await fetch(`/api/agent/sessions/${activeSession.id}/live`)
      if (response.ok) {
        const data = await response.json()
        setLiveState(data.liveState)
        if (data.session) {
          setActiveSession(prev => prev ? { ...prev, status: data.session.status } : null)
        }
      }
    } catch (error) {
      console.error('Poll error:', error)
    }
  }, [activeSession])

  useEffect(() => {
    if (activeSession && ['executing', 'planning', 'paused'].includes(activeSession.status)) {
      // Start polling
      pollingRef.current = setInterval(pollLiveState, 2000)
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [activeSession, pollLiveState])

  // Fetch session details
  const fetchSessionDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/agent/sessions/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setActiveSession(data.session)
        setTasks(data.session.tasks || [])
        setMessages(data.messages || [])
        setLiveState(data.liveState)
      }
    } catch (error) {
      console.error('Fetch session error:', error)
    }
  }

  // Create new session
  const createSession = async (objective: string) => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/agent/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'default', // TODO: Get from context
          objective,
          startUrl: startUrl || undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        setActiveSession(data.session)
        setMessages([{
          id: 'system-1',
          role: 'system',
          content: `Session created. Objective: ${objective}`,
          timestamp: new Date().toISOString()
        }])

        // Start the session
        await fetch(`/api/agent/sessions/${data.session.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'start' })
        })

        setInputValue('')
        setStartUrl('')
      }
    } catch (error) {
      console.error('Create session error:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Session control actions
  const sessionAction = async (action: 'pause' | 'resume' | 'cancel') => {
    if (!activeSession) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/agent/sessions/${activeSession.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        await fetchSessionDetails(activeSession.id)
      }
    } catch (error) {
      console.error('Session action error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Send message to agent
  const sendMessage = async () => {
    if (!inputValue.trim()) return

    if (!activeSession) {
      // Create new session with the message as objective
      await createSession(inputValue)
      return
    }

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])

    // Send to agent
    try {
      await fetch(`/api/agent/sessions/${activeSession.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'message', message: inputValue })
      })
    } catch (error) {
      console.error('Send message error:', error)
    }

    setInputValue('')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'executing':
      case 'planning':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle2 className="w-3 h-3 text-green-500" />
      case 'error':
        return <XCircle className="w-3 h-3 text-red-500" />
      case 'warn':
        return <AlertCircle className="w-3 h-3 text-yellow-500" />
      default:
        return <Info className="w-3 h-3 text-blue-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Browser Agent</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Autonomous web automation powered by AI
              </p>
            </div>
          </div>

          {activeSession && (
            <div className="flex items-center gap-2">
              {activeSession.status === 'executing' && (
                <button
                  onClick={() => sessionAction('pause')}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg
                    hover:bg-yellow-200 transition disabled:opacity-50"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
              )}
              {activeSession.status === 'paused' && (
                <button
                  onClick={() => sessionAction('resume')}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg
                    hover:bg-green-200 transition disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
              )}
              {['executing', 'paused', 'planning'].includes(activeSession.status) && (
                <button
                  onClick={() => sessionAction('cancel')}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg
                    hover:bg-red-200 transition disabled:opacity-50"
                >
                  <StopCircle className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Chat */}
        <div className="w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!activeSession && messages.length === 0 && (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  What would you like me to do?
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Describe a task and I&apos;ll browse the web to complete it. For example:
                  &quot;Search for the latest news about AI&quot; or &quot;Fill out the contact form on example.com&quot;
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : message.role === 'system'
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-60 mt-1 block">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {!activeSession && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Start URL (optional)</span>
                </div>
                <input
                  type="url"
                  value={startUrl}
                  onChange={(e) => setStartUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={activeSession ? "Send additional instructions..." : "Describe what you want me to do..."}
                disabled={isCreating}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isCreating}
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl
                  hover:opacity-90 disabled:opacity-50 transition"
              >
                {isCreating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Live View */}
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : 'w-1/2'} flex flex-col`}>
          {/* Live View Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Live View</span>
              {activeSession && (
                <span className="flex items-center gap-1.5 text-sm text-gray-400">
                  {getStatusIcon(activeSession.status)}
                  {activeSession.status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => liveState && pollLiveState()}
                className="p-2 text-gray-400 hover:text-white transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-400 hover:text-white transition"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Browser View */}
          <div className="flex-1 bg-gray-900 flex items-center justify-center p-4 overflow-hidden">
            {liveState?.screenshot ? (
              <div className="relative w-full h-full">
                <img
                  src={`data:image/png;base64,${liveState.screenshot}`}
                  alt="Browser view"
                  className="w-full h-full object-contain rounded-lg shadow-2xl"
                />
                {liveState.url && (
                  <div className="absolute top-2 left-2 right-2 bg-gray-800 bg-opacity-90 rounded-lg px-3 py-2
                    flex items-center gap-2 text-sm text-white">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{liveState.url}</span>
                  </div>
                )}
                {liveState.currentAction && (
                  <div className="absolute bottom-2 left-2 right-2 bg-purple-600 bg-opacity-90 rounded-lg px-3 py-2
                    flex items-center gap-2 text-sm text-white">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{liveState.currentAction}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Globe className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No active browser session</p>
                <p className="text-sm">Start a task to see the live view</p>
              </div>
            )}
          </div>

          {/* Progress & Logs */}
          {activeSession && (
            <div className="bg-gray-800 border-t border-gray-700">
              {/* Progress Bar */}
              {liveState?.progress && liveState.progress.totalTasks > 0 && (
                <div className="px-4 py-3 border-b border-gray-700">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>{liveState.progress.currentTask || 'Processing...'}</span>
                    <span>
                      {liveState.progress.completedTasks} / {liveState.progress.totalTasks} tasks
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{
                        width: `${(liveState.progress.completedTasks / liveState.progress.totalTasks) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Logs */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  showLogs ? 'max-h-48' : 'max-h-0'
                }`}
              >
                <div className="p-3 space-y-1 max-h-48 overflow-y-auto">
                  {liveState?.logs?.map((log, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs"
                    >
                      {getLogIcon(log.level)}
                      <span className="text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`
                        ${log.level === 'error' ? 'text-red-400' : ''}
                        ${log.level === 'warn' ? 'text-yellow-400' : ''}
                        ${log.level === 'success' ? 'text-green-400' : ''}
                        ${log.level === 'info' ? 'text-gray-300' : ''}
                      `}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggle Logs */}
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="w-full px-4 py-2 flex items-center justify-center gap-2 text-gray-400
                  hover:bg-gray-700 transition text-sm"
              >
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${showLogs ? 'rotate-90' : ''}`}
                />
                {showLogs ? 'Hide' : 'Show'} Logs
              </button>
            </div>
          )}

          {/* Task List */}
          {tasks.length > 0 && (
            <div className="bg-gray-800 border-t border-gray-700 p-4 max-h-48 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Tasks</h3>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    {getStatusIcon(task.status)}
                    <span className={`
                      ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'}
                    `}>
                      {task.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
