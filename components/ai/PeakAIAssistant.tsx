'use client'

import { useState, useRef, useEffect } from 'react'
import { Brain, X, Send, Mic, Sparkles, Minimize2, Maximize2 } from 'lucide-react'
import { PeakIcon } from '@/components/icons/PeakIcon'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function PeakAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m Peak AI, your intelligent assistant. I can help you summarize calls, create tasks, find files, and organize your work. What can I help you with?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Listen for navigation button clicks
  useEffect(() => {
    const handleOpenPeakAI = () => {
      setIsOpen(true)
    }

    window.addEventListener('openPeakAI', handleOpenPeakAI)
    return () => window.removeEventListener('openPeakAI', handleOpenPeakAI)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages([...messages, newMessage])
    setInputValue('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand you want to ' + inputValue + '. I\'m still learning, but I\'ll help you with that soon!',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const examplePrompts = [
    'Summarize my last call',
    'What are my priorities today?',
    'Create a task for the team',
    'Find marketing documents'
  ]

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Open Peak AI Assistant"
      >
        <div className="relative">
          {/* Pulsing ring animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-ping opacity-75" />

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 blur-xl opacity-60 animate-glow" />

          {/* Main button */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 p-3">
            <PeakIcon name="ai" size={64} className="w-full h-full" />
          </div>

          {/* Sparkle effect */}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-gray-900/90 backdrop-blur-xl text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-gray-700">
          <span className="font-medium">Ask Peak AI</span>
          <p className="text-xs text-gray-400 mt-0.5">Cmd/Ctrl + J</p>
        </div>
      </button>
    )
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isExpanded
          ? 'inset-4'
          : 'bottom-6 right-6 w-96 h-[600px]'
      }`}
    >
      <div className="h-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center p-1.5">
              <PeakIcon name="ai" size={32} className="w-full h-full" />
            </div>
            <div>
              <h3 className="font-bold text-white">Peak AI</h3>
              <p className="text-xs text-white/80">AI that listens, learns, and leads</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-lg flex items-center justify-center transition"
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4 text-white" />
              ) : (
                <Maximize2 className="w-4 h-4 text-white" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-lg flex items-center justify-center transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Example Prompts */}
        {messages.length === 1 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInputValue(prompt)}
                  className="text-xs px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition border border-gray-200 dark:border-gray-600"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Peak AI anything..."
                className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none"
                rows={1}
                style={{ maxHeight: '120px' }}
              />
            </div>

            <button
              onClick={() => setIsListening(!isListening)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title="Voice input"
            >
              <Mic className={`w-5 h-5 ${isListening ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
            </button>

            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center transition-all hover:scale-105"
              title="Send message"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
