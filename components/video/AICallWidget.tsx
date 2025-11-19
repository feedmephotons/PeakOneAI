'use client'

import { useState, useEffect, useRef } from 'react'
import { Brain, Minimize2, Maximize2, X, Mic, Sparkles, MicOff } from 'lucide-react'
import { io, Socket } from 'socket.io-client'
import { AudioRecorder, transcribeAudio } from '@/lib/audio-recorder'

interface Transcript {
  id: string
  speaker: string
  text: string
  timestamp: string
  userId?: string
}

interface ActionItem {
  id: string
  text: string
  assignee?: string
  deadline?: string
  confidence?: number
}

interface AICallWidgetProps {
  meetingId: string
  userId: string
  userName: string
  audioStream: MediaStream | null
  isMinimized?: boolean
  onClose?: () => void
}

export default function AICallWidget({
  meetingId,
  userId,
  userName,
  audioStream,
  isMinimized: initialMinimized = false,
  onClose
}: AICallWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(initialMinimized)
  const [isListening, setIsListening] = useState(true)
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [activeTab, setActiveTab] = useState<'transcript' | 'actions' | 'summary'>('transcript')
  const [isProcessing, setIsProcessing] = useState(false)

  const socketRef = useRef<Socket | null>(null)
  const audioRecorderRef = useRef<AudioRecorder | null>(null)
  const transcriptsEndRef = useRef<HTMLDivElement>(null)

  // Initialize Socket.io connection
  useEffect(() => {
    // Use environment variable or default to current origin
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ||
                     (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001')

    console.log('[AICallWidget] Connecting to Socket.io:', socketUrl)

    const socket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 5000
    })
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[AICallWidget] Socket connected')

      // Join meeting room
      socket.emit('join-meeting', {
        meetingId,
        userId,
        userName
      })
    })

    socket.on('connect_error', (error) => {
      console.warn('[AICallWidget] Socket connection failed, working in local-only mode:', error.message)
      // Continue working in local mode - transcripts will still work
    })

    // Listen for new transcripts from other participants
    socket.on('new-transcript', async (transcript: Transcript) => {
      console.log('[AICallWidget] New transcript:', transcript)

      // Group consecutive messages from same speaker into one bubble
      setTranscripts(prev => {
        const lastTranscript = prev[prev.length - 1]

        // If last transcript is from same speaker, append to it
        if (lastTranscript && lastTranscript.userId === transcript.userId) {
          return [
            ...prev.slice(0, -1),
            {
              ...lastTranscript,
              text: lastTranscript.text + ' ' + transcript.text,
              timestamp: transcript.timestamp // Update to latest timestamp
            }
          ]
        }

        // Different speaker or first message, create new bubble
        return [...prev, transcript]
      })

      setIsProcessing(false)

      // Analyze transcript for action items
      try {
        const response = await fetch('/api/meetings/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: transcript.text,
            context: transcripts.slice(-3).map(t => t.text).join(' ') // Last 3 messages for context
          })
        })

        if (response.ok) {
          const { actionItems: detectedItems } = await response.json()

          if (detectedItems && detectedItems.length > 0) {
            console.log('[AICallWidget] Detected action items:', detectedItems)

            // Broadcast action items to all participants
            detectedItems.forEach((item: ActionItem) => {
              socket.emit('action-item-detected', {
                meetingId,
                actionItem: item
              })
            })
          }
        }
      } catch (error) {
        console.error('[AICallWidget] Error analyzing transcript:', error)
      }
    })

    // Listen for processing status
    socket.on('transcription-processing', ({ userName: processingUser }) => {
      if (processingUser !== userName) {
        setIsProcessing(true)
      }
    })

    // Listen for AI-detected action items
    socket.on('new-action-item', (actionItem: ActionItem) => {
      console.log('[AICallWidget] New action item:', actionItem)
      setActionItems(prev => {
        // Avoid duplicates
        if (prev.some(item => item.id === actionItem.id)) {
          return prev
        }
        return [...prev, actionItem]
      })
    })

    socket.on('disconnect', () => {
      console.log('[AICallWidget] Socket disconnected')
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-meeting', {
          meetingId,
          userId,
          userName
        })
        socketRef.current.disconnect()
      }
    }
  }, [meetingId, userId, userName])

  // Initialize audio recording when listening is enabled
  useEffect(() => {
    if (!audioStream || !isListening) {
      if (audioRecorderRef.current?.isRecording()) {
        audioRecorderRef.current.stop()
      }
      return
    }

    const recorder = new AudioRecorder()
    audioRecorderRef.current = recorder

    const handleAudioChunk = async (audioBlob: Blob) => {
      console.log('[AICallWidget] Audio chunk ready, sending for transcription')

      try {
        // Send to transcription API
        const result = await transcribeAudio(audioBlob, meetingId, userName)

        if (result && result.transcript && result.transcript.length > 0) {
          const newTranscript: Transcript = {
            id: `${Date.now()}-${userId}`,
            speaker: userName,
            text: result.transcript,
            timestamp: result.timestamp || new Date().toISOString(),
            userId
          }

          // Try to broadcast via WebSocket if connected
          if (socketRef.current?.connected) {
            socketRef.current.emit('transcription-result', {
              meetingId,
              transcript: result.transcript,
              userId,
              userName,
              timestamp: result.timestamp
            })
          } else {
            // Local-only mode: add transcript directly
            console.log('[AICallWidget] Working in local mode - adding transcript directly')

            // Group consecutive messages from same speaker into one bubble
            setTranscripts(prev => {
              const lastTranscript = prev[prev.length - 1]

              // If last transcript is from same speaker, append to it
              if (lastTranscript && lastTranscript.userId === userId) {
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastTranscript,
                    text: lastTranscript.text + ' ' + newTranscript.text,
                    timestamp: newTranscript.timestamp // Update to latest timestamp
                  }
                ]
              }

              // Different speaker or first message, create new bubble
              return [...prev, newTranscript]
            })

            // Analyze for action items locally
            try {
              const response = await fetch('/api/meetings/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  transcript: newTranscript.text,
                  context: transcripts.slice(-3).map(t => t.text).join(' '),
                  meetingId // Pass meetingId for demo mode detection
                })
              })

              if (response.ok) {
                const { actionItems: detectedItems } = await response.json()
                if (detectedItems && detectedItems.length > 0) {
                  console.log('[AICallWidget] Detected action items (local mode):', detectedItems)
                  setActionItems(prev => {
                    const newItems = detectedItems.filter((item: ActionItem) =>
                      !prev.some(existing => existing.id === item.id)
                    )
                    return [...prev, ...newItems]
                  })
                }
              }
            } catch (error) {
              console.error('[AICallWidget] Error analyzing transcript (local mode):', error)
            }
          }
        }
      } catch (error) {
        console.error('[AICallWidget] Transcription error:', error)
      }
    }

    // Start recording with 5-second chunks
    recorder.start(audioStream, handleAudioChunk, 5000)
      .catch(error => {
        console.error('[AICallWidget] Failed to start recording:', error)
      })

    return () => {
      recorder.stop()
    }
  }, [audioStream, isListening, meetingId, userId, userName])

  // Auto-scroll to latest transcript
  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcripts])

  const toggleListening = () => {
    setIsListening(!isListening)

    if (!isListening && audioRecorderRef.current) {
      audioRecorderRef.current.resume()
    } else if (audioRecorderRef.current) {
      audioRecorderRef.current.pause()
    }
  }

  // Waveform animation bars
  const WaveformBars = () => {
    return (
      <div className="flex items-center gap-0.5 h-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-0.5 bg-blue-500 rounded-full animate-pulse"
            style={{
              height: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.8s'
            }}
          />
        ))}
      </div>
    )
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-6 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="group flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105"
        >
          <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="font-bold">Peak AI</div>
            <div className="text-xs text-white/80 flex items-center gap-2">
              {isListening ? (
                <>
                  <WaveformBars />
                  <span>Listening...</span>
                </>
              ) : (
                <span>Paused</span>
              )}
            </div>
          </div>
          <Maximize2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-24 right-6 w-96 max-h-[600px] z-40 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Peak AI</h3>
            <div className="text-xs text-white/80 flex items-center gap-2">
              {isListening ? (
                <>
                  <WaveformBars />
                  <span>Live transcription</span>
                </>
              ) : (
                <span>Paused</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleListening}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              isListening ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500/20 hover:bg-red-500/30'
            }`}
            title={isListening ? 'Pause transcription' : 'Resume transcription'}
          >
            {isListening ? (
              <Mic className="w-4 h-4 text-white" />
            ) : (
              <MicOff className="w-4 h-4 text-red-300" />
            )}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-lg flex items-center justify-center transition"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4 text-white" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-lg flex items-center justify-center transition"
              title="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button
          onClick={() => setActiveTab('transcript')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'transcript'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Transcript
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'actions'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Action Items {actionItems.length > 0 && `(${actionItems.length})`}
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'summary'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Summary
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
        {activeTab === 'transcript' && (
          <>
            {transcripts.length === 0 && (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Waiting for conversation to start...
                </p>
              </div>
            )}

            {transcripts.map((transcript) => (
              <div key={transcript.id} className="bg-white dark:bg-gray-700 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold text-sm ${
                    transcript.userId === userId
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {transcript.speaker}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(transcript.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {transcript.text}
                </p>
              </div>
            ))}

            {/* Live indicator */}
            {isListening && (
              <div className="flex items-center justify-center gap-2 py-4">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {isProcessing ? 'Processing...' : 'Listening for speech...'}
                </span>
              </div>
            )}

            <div ref={transcriptsEndRef} />
          </>
        )}

        {activeTab === 'actions' && (
          <>
            {actionItems.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No action items detected yet
                </p>
              </div>
            ) : (
              actionItems.map((item) => (
                <div key={item.id} className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.text}
                      </p>
                      {(item.assignee || item.deadline) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.assignee && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                              👤 {item.assignee}
                            </span>
                          )}
                          {item.deadline && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                              📅 {item.deadline}
                            </span>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          try {
                            // Load existing tasks from localStorage
                            const savedTasks = localStorage.getItem('tasks')
                            const tasks = savedTasks ? JSON.parse(savedTasks) : []

                            // Create new task from action item
                            const newTask = {
                              id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                              title: item.text,
                              description: `From meeting: ${meetingId}`,
                              status: 'TODO',
                              priority: item.deadline ? 'HIGH' : 'MEDIUM',
                              assignee: item.assignee ? { id: 'ai-assigned', name: item.assignee } : undefined,
                              dueDate: item.deadline ? new Date(item.deadline) : undefined,
                              tags: ['ai-generated', 'meeting'],
                              attachments: 0,
                              comments: 0,
                              createdAt: new Date(),
                              updatedAt: new Date()
                            }

                            // Add to tasks
                            tasks.push(newTask)
                            localStorage.setItem('tasks', JSON.stringify(tasks))

                            // Show success notification
                            console.log('[AICallWidget] Task added to board:', newTask.title)

                            // Remove from action items
                            setActionItems(prev => prev.filter(a => a.id !== item.id))

                            // Dispatch event so task board updates if it's open
                            window.dispatchEvent(new Event('storage'))
                          } catch (error) {
                            console.error('[AICallWidget] Error adding task to board:', error)
                          }
                        }}
                        className="mt-3 w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium rounded-lg hover:opacity-90 transition"
                      >
                        Add to Task Board
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'summary' && (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Summary will be generated when the meeting ends
            </p>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      {actionItems.length > 0 && activeTab === 'transcript' && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-t border-purple-200 dark:border-purple-800 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">AI Insight</p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Detected {actionItems.length} action {actionItems.length === 1 ? 'item' : 'items'}.{' '}
                <button
                  onClick={() => setActiveTab('actions')}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all →
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
