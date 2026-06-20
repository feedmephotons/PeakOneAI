'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Send, User, Mic, Paperclip, X, FileText,
  Image as ImageIcon, Sparkles, ArrowUp, Boxes, CheckCircle2, Clock,
} from 'lucide-react'
import { LisaOrchestrator, type OperatorInfo } from '@/lib/peak/lisa-orchestrator'

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Array<{ name: string; size: number; type: string }>;
  suggestions?: string[];
}

// Simulated AI responses (fallback only — used when /api/ai/chat is unreachable)
const getAIResponse = (input: string): { response: string; suggestions?: string[] } => {
  const lowerInput = input.toLowerCase()

  if (lowerInput.includes('task') || lowerInput.includes('todo') || lowerInput.includes('organize')) {
    return {
      response: `I can help you organize your tasks. Here's what I'd prioritize:

1. Finalize the Product Launch Plan — due today
2. Review the Investor Update — due today
3. Approve the Marketing Budget — due tomorrow

Want me to create a task list, set priorities, or schedule reminders?`,
      suggestions: ['Create a new task', 'View all tasks', 'Set priorities', 'Schedule reminder']
    }
  }

  if (lowerInput.includes('summar') || lowerInput.includes('yesterday')) {
    return {
      response: `Here's a recap of yesterday:

- 3 customer conversations mentioned pricing concerns
- The Q2 campaign is trending 18% above target
- The investor follow-up to Brian still has no response

Want the full briefing or a draft follow-up for Brian?`,
      suggestions: ['View full briefing', 'Draft follow-up for Brian', 'Show pricing mentions']
    }
  }

  if (lowerInput.includes('prepare') || lowerInput.includes('brian')) {
    return {
      response: `Preparing your relationship brief for Brian.

- Last interaction: investor update email (no response, 5 days)
- Open items: Q3 revenue model, follow-up call
- Sentiment: positive but cooling on response time

I'd recommend a short, direct follow-up today. Want me to draft it?`,
      suggestions: ['Draft follow-up', 'Open Brian’s profile', 'Recent interactions']
    }
  }

  return {
    response: `Got it — "${input}". I can search your memory, prepare you for a person, summarize a meeting, or draft a follow-up. How would you like me to help?`,
    suggestions: ['Search memory', 'Summarize yesterday', 'Prepare me for Brian', 'Draft follow-up']
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

// Quick-action chips shown above the composer (and in the empty state).
// `href` routes (e.g. to the Create Studio); otherwise `prompt` is sent to Lisa.
const QUICK_ACTIONS: { label: string; prompt: string; href?: string }[] = [
  { label: 'Summarize yesterday', prompt: 'Summarize yesterday for me' },
  { label: 'Prepare me for Brian', prompt: 'Prepare me for Brian' },
  { label: 'Build a Q2 sales report', prompt: 'Build me a Q2 sales report', href: '/create?template=sales-report-q2' },
  { label: 'What do I know about pricing', prompt: 'What do I know about pricing?' },
  { label: 'Draft follow-up', prompt: 'Draft a follow-up email' },
]

export default function LisaAIPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const [showOperators, setShowOperators] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // The orchestrator powers the "Operators" affordance + intent routing preview.
  const orchestrator = useMemo(() => new LisaOrchestrator(), [])
  const operators: OperatorInfo[] = useMemo(() => orchestrator.listOperators(), [orchestrator])

  const hasConversation = messages.length > 0

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

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

  return (
    <div className="peak-os relative flex h-screen flex-col overflow-hidden">
      {/* Aurora bloom behind the page */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-peak-primary/10 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between gap-4 border-b border-peak-border px-6 py-4 sm:px-10">
        <div className="flex items-center gap-3">
          <LisaOrb size={36} />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-peak">Lisa</h1>
            <p className="flex items-center gap-1.5 text-xs text-peak-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-peak-green shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
              Your AI orchestrator
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowOperators(v => !v)}
          className={[
            'inline-flex items-center gap-2 rounded-xl border border-peak-border px-3.5 py-2 text-sm font-medium transition-colors',
            showOperators ? 'bg-peak-primary/15 text-peak' : 'bg-white/[0.03] text-peak-muted hover:bg-white/[0.06]',
          ].join(' ')}
        >
          <Boxes className="h-4 w-4 text-peak-primary-300" />
          Operators
        </button>
      </header>

      {/* Operators panel (architecture affordance) */}
      {showOperators && (
        <div className="relative z-10 border-b border-peak-border bg-white/[0.015] px-6 py-4 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-peak-muted">
              P1 Operators — Lisa orchestrates, operators execute
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {operators.map((op) => (
                <div
                  key={op.id}
                  className="peak-glass flex items-start gap-3 p-3.5"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-peak-primary/15 text-peak-primary-300">
                    <Boxes className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-peak">{op.name}</span>
                      {op.status === 'available' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-peak-green/15 px-1.5 py-0.5 text-[10px] font-medium text-peak-green">
                          <CheckCircle2 className="h-3 w-3" /> Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-peak-dim">
                          <Clock className="h-3 w-3" /> Soon
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs leading-snug text-peak-muted">{op.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages / empty state */}
      <div className="peak-scrollbar relative z-10 flex-1 overflow-y-auto px-6 py-6 sm:px-10">
        <div className="mx-auto max-w-3xl">
          {!hasConversation ? (
            <EmptyState onPick={sendMessage} onRoute={(href) => router.push(href)} />
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={index} className="animate-peak-fade-up">
                  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-2xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                      {message.role === 'user' ? (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-peak-border bg-white/[0.05]">
                          <User className="h-4 w-4 text-peak-muted" />
                        </div>
                      ) : (
                        <LisaOrb size={32} />
                      )}
                      <div>
                        <div className={`rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-peak-primary/20 border border-peak-primary/30 text-peak'
                            : 'peak-glass text-peak'
                        }`}>
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((file, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-peak-muted">
                                  {file.type.startsWith('image/') ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                  <span>{file.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className={`mt-1 text-xs text-peak-dim ${message.role === 'user' ? 'text-right' : ''}`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {message.suggestions && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                onClick={() => sendMessage(suggestion)}
                                className="rounded-lg border border-peak-border bg-white/[0.03] px-3 py-1 text-xs text-peak-primary-300 transition-colors hover:bg-white/[0.07]"
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
                    <LisaOrb size={32} />
                    <div className="peak-glass rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-peak-primary-300" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-peak-primary-300" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-peak-primary-300" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="relative z-10 border-t border-peak-border px-6 py-4 sm:px-10">
        <div className="mx-auto max-w-3xl">
          {fileError && (
            <div className="mb-2 rounded-lg border border-peak-red/20 bg-peak-red/10 px-3 py-1.5 text-xs font-medium text-peak-red">
              {fileError}
            </div>
          )}

          {/* Quick-action chips (always visible above composer) */}
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((qa) => (
              <button
                key={qa.label}
                onClick={() => (qa.href ? router.push(qa.href) : sendMessage(qa.prompt))}
                className="inline-flex items-center gap-1.5 rounded-full border border-peak-border bg-white/[0.03] px-3 py-1.5 text-xs text-peak-muted transition-colors hover:bg-white/[0.07] hover:text-peak"
              >
                <Sparkles className="h-3 w-3 text-peak-primary-300" />
                {qa.label}
              </button>
            ))}
          </div>

          {/* Attached files */}
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 rounded-lg border border-peak-border bg-white/[0.04] px-3 py-1">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="h-4 w-4 text-peak-muted" />
                  ) : (
                    <FileText className="h-4 w-4 text-peak-muted" />
                  )}
                  <span className="text-sm text-peak">{file.name}</span>
                  <button
                    onClick={() => removeAttachedFile(index)}
                    className="text-peak-dim transition-colors hover:text-peak-red"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="peak-glass flex items-end gap-2 p-2">
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-peak-muted transition-colors hover:bg-white/[0.06] hover:text-peak"
              aria-label="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-disabled="true"
              disabled
              title="Voice input coming soon"
              className="flex h-10 w-10 shrink-0 cursor-default items-center justify-center rounded-xl text-peak-muted opacity-50"
              aria-label="Voice input (coming soon)"
            >
              <Mic className="h-5 w-5" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Lisa anything…"
              className="peak-scrollbar flex-1 resize-none bg-transparent px-1 py-2.5 text-sm text-peak placeholder:text-peak-muted focus:outline-none"
              rows={1}
              style={{ minHeight: '44px' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() && attachedFiles.length === 0}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-peak-primary text-white shadow-[0_0_20px_var(--peak-glow)] transition-all hover:bg-peak-primary-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-peak-dim">
            Powered by Google Gemini · Lisa routes your intent through Peak One Operators
          </p>
        </div>
      </div>
    </div>
  )
}

/** The cosmic purple orb avatar — pure CSS (mirrors LisaBriefingCard's orb). */
function LisaOrb({ size = 32 }: { size?: number }) {
  return (
    <div
      className="peak-orb relative shrink-0 animate-peak-pulse-glow"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]"
        style={{ width: size * 0.5, height: size * 0.5 }}
        fill="currentColor"
      >
        <path d="M12 0c.6 5.4 2.6 7.4 8 8-5.4.6-7.4 2.6-8 8-.6-5.4-2.6-7.4-8-8 5.4-.6 7.4-2.6 8-8z" />
      </svg>
    </div>
  )
}

/** The pre-conversation hero: big orb, greeting, quick-action chips. */
function EmptyState({ onPick, onRoute }: { onPick: (prompt: string) => void; onRoute: (href: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 pt-10 text-center sm:pt-16">
      <div className="relative mb-8 flex h-44 w-44 items-center justify-center">
        {/* orbital rings */}
        <div
          className="peak-orb-ring animate-peak-float"
          style={{ width: 220, height: 88, transform: 'rotate(-18deg)' }}
        />
        <div
          className="peak-orb-ring"
          style={{ width: 180, height: 64, transform: 'rotate(-18deg)', opacity: 0.6 }}
        />
        <LisaOrb size={104} />
        {/* scattered stars */}
        <span className="absolute right-4 top-6 h-1 w-1 rounded-full bg-white/80" />
        <span className="absolute bottom-8 left-6 h-0.5 w-0.5 rounded-full bg-peak-primary-300" />
      </div>

      <h2 className="text-3xl font-semibold tracking-tight text-peak sm:text-4xl">
        Ask Lisa <span className="text-peak-primary-300">anything</span>
      </h2>
      <p className="mt-3 max-w-md text-sm text-peak-muted">
        I connect your memory, missions, people, and meetings. Ask a question or pick a starting point.
      </p>

      <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
        {QUICK_ACTIONS.map((qa) => (
          <button
            key={qa.label}
            onClick={() => (qa.href ? onRoute(qa.href) : onPick(qa.prompt))}
            className="peak-glass peak-glass-hover group flex items-center gap-3 p-3.5 text-left transition-colors"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-peak-primary/15 text-peak-primary-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="flex-1 text-sm font-medium text-peak">{qa.label}</span>
            <ArrowUp className="h-4 w-4 rotate-45 text-peak-dim transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        ))}
      </div>
    </div>
  )
}
