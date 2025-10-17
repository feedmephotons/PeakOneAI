'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Mic, MicOff, Video, VideoOff, Phone, Settings, Users, ScreenShare,
  Grid, Maximize2, Brain, Sparkles, CheckSquare, FileText, Download, Copy
} from 'lucide-react'
import MeetingToTaskConverter from '@/components/meetings/MeetingToTaskConverter'

interface Participant {
  id: string
  name: string
  isMuted: boolean
  isVideoOff: boolean
  isSpeaking?: boolean
}

interface TranscriptLine {
  id: string
  speaker: string
  text: string
  timestamp: Date
}

interface ActionItem {
  id: string
  text: string
  assignee?: string
  completed: boolean
}

interface Note {
  id: string
  text: string
  timestamp: Date
}

export default function MeetingRoomPage() {
  const params = useParams()
  const router = useRouter()
  const meetingId = params.id as string
  const localVideoRef = useRef<HTMLVideoElement>(null)

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid')
  const [showAIPanel, setShowAIPanel] = useState(true)
  const [aiPanelTab, setAiPanelTab] = useState<'transcript' | 'actions' | 'notes'>('transcript')
  const [showTaskConverter, setShowTaskConverter] = useState(false)

  // Mock participants
  const [participants] = useState<Participant[]>([
    { id: '1', name: 'Sarah Chen', isMuted: false, isVideoOff: false, isSpeaking: false },
    { id: '2', name: 'Mike Johnson', isMuted: true, isVideoOff: false },
    { id: '3', name: 'Alex Kim', isMuted: false, isVideoOff: true },
  ])

  // Mock transcript
  const [transcript, setTranscript] = useState<TranscriptLine[]>([
    {
      id: '1',
      speaker: 'Sarah Chen',
      text: 'Good morning everyone! Thanks for joining. Let\'s start by reviewing the Q4 roadmap.',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: '2',
      speaker: 'You',
      text: 'Sounds good. I have the latest figures ready to share.',
      timestamp: new Date(Date.now() - 240000)
    },
    {
      id: '3',
      speaker: 'Mike Johnson',
      text: 'Perfect. I think we should prioritize the API integration first.',
      timestamp: new Date(Date.now() - 180000)
    },
    {
      id: '4',
      speaker: 'Alex Kim',
      text: 'Agreed. That will unlock the mobile features we\'ve been planning.',
      timestamp: new Date(Date.now() - 120000)
    }
  ])

  // Mock action items
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { id: '1', text: 'Review Q4 roadmap priorities', assignee: 'Sarah', completed: false },
    { id: '2', text: 'Prepare API integration timeline', assignee: 'Mike', completed: false },
    { id: '3', text: 'Draft mobile feature specifications', assignee: 'Alex', completed: false }
  ])

  // Mock notes
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', text: 'Q4 focus: API integration → Mobile features → Analytics dashboard', timestamp: new Date(Date.now() - 180000) },
    { id: '2', text: 'Target launch: End of Q1 2025', timestamp: new Date(Date.now() - 120000) }
  ])

  // Simulate live transcription
  useEffect(() => {
    const interval = setInterval(() => {
      const speakers = ['Sarah Chen', 'Mike Johnson', 'Alex Kim', 'You']
      const sampleTexts = [
        'Let\'s make sure we\'re all aligned on the timeline.',
        'I can have the initial design ready by next week.',
        'We should schedule a follow-up to review progress.',
        'Great point. Let\'s add that to our action items.'
      ]

      const newLine: TranscriptLine = {
        id: Date.now().toString(),
        speaker: speakers[Math.floor(Math.random() * speakers.length)],
        text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
        timestamp: new Date()
      }

      setTranscript(prev => [...prev, newLine])
    }, 20000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const startLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        })

        setLocalStream(stream)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error('Error accessing media devices:', error)
      }
    }

    startLocalStream()

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false
        })

        const videoTrack = screenStream.getVideoTracks()[0]
        if (localStream && localVideoRef.current) {
          const sender = localStream.getVideoTracks()[0]
          localStream.removeTrack(sender)
          localStream.addTrack(videoTrack)
          localVideoRef.current.srcObject = localStream
        }

        setIsScreenSharing(true)

        videoTrack.onended = () => {
          setIsScreenSharing(false)
        }
      } catch (error) {
        console.error('Error sharing screen:', error)
      }
    }
  }

  const handleLeave = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    router.push('/calendar')
  }

  const toggleActionItem = (id: string) => {
    setActionItems(actionItems.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  const exportSummary = () => {
    const summary = {
      meetingId,
      date: new Date().toISOString(),
      participants: ['You', ...participants.map(p => p.name)],
      transcript,
      actionItems,
      notes
    }

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meeting-${meetingId}-summary.json`
    a.click()
  }

  const copyTranscript = () => {
    const text = transcript.map(line => `${line.speaker}: ${line.text}`).join('\n')
    navigator.clipboard.writeText(text)
    alert('Transcript copied to clipboard')
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-3 flex items-center justify-between border-b border-gray-700">
        <div>
          <h2 className="text-white font-semibold">Meeting ID: {meetingId}</h2>
          <p className="text-gray-400 text-sm">{participants.length + 1} participants</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
            title={viewMode === 'grid' ? 'Speaker view' : 'Grid view'}
          >
            {viewMode === 'grid' ? <Maximize2 className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={`p-2 rounded-lg transition ${
              showAIPanel
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="Toggle AI Panel"
          >
            <Brain className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-4 overflow-auto">
          <div className={`h-full ${viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-4'}`}>
            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    You
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/50 px-3 py-1 rounded-lg text-white text-sm backdrop-blur-sm">
                You {isMuted && <span className="ml-2">🔇</span>}
              </div>
              {isScreenSharing && (
                <div className="absolute top-3 left-3 bg-blue-500 px-2 py-1 rounded text-white text-xs font-medium">
                  Sharing Screen
                </div>
              )}
            </div>

            {/* Remote Participants */}
            {participants.map((participant) => (
              <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
                {participant.isVideoOff ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {participant.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {participant.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/50 px-3 py-1 rounded-lg text-white text-sm backdrop-blur-sm">
                  {participant.name} {participant.isMuted && <span className="ml-2">🔇</span>}
                </div>
                {participant.isSpeaking && (
                  <div className="absolute inset-0 border-4 border-green-500 rounded-lg pointer-events-none" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Panel */}
        {showAIPanel && (
          <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
            {/* AI Panel Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Peak AI</h3>
                  <p className="text-xs text-white/80">Meeting Intelligence</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700 bg-gray-800">
              <button
                onClick={() => setAiPanelTab('transcript')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                  aiPanelTab === 'transcript'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Transcript
              </button>
              <button
                onClick={() => setAiPanelTab('actions')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                  aiPanelTab === 'actions'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Actions ({actionItems.length})
              </button>
              <button
                onClick={() => setAiPanelTab('notes')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                  aiPanelTab === 'notes'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Notes ({notes.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiPanelTab === 'transcript' && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-400">Live transcription enabled</p>
                    <button
                      onClick={copyTranscript}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  {transcript.map((line) => (
                    <div key={line.id} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-white">{line.speaker}</span>
                        <span className="text-xs text-gray-400">
                          {line.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{line.text}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-center gap-2 py-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-400">Listening...</span>
                  </div>
                </>
              )}

              {aiPanelTab === 'actions' && (
                <>
                  <div className="flex items-center justify-between gap-2 mb-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3 border border-blue-500/20">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <p className="text-xs text-gray-300">AI detected {actionItems.filter(a => !a.completed).length} pending actions</p>
                    </div>
                    <button
                      onClick={() => setShowTaskConverter(true)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition flex items-center gap-1"
                    >
                      <CheckSquare className="w-3 h-3" />
                      Convert to Tasks
                    </button>
                  </div>
                  {actionItems.map((item) => (
                    <div key={item.id} className="bg-gray-700 rounded-lg p-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleActionItem(item.id)}
                          className="mt-1 w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                            {item.text}
                          </p>
                          {item.assignee && (
                            <p className="text-xs text-gray-400 mt-1">Assigned to: {item.assignee}</p>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </>
              )}

              {aiPanelTab === 'notes' && (
                <>
                  <div className="flex items-center gap-2 mb-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-purple-500/20">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <p className="text-xs text-gray-300">AI-generated meeting notes</p>
                  </div>
                  {notes.map((note) => (
                    <div key={note.id} className="bg-gray-700 rounded-lg p-3">
                      <p className="text-sm text-white mb-2">{note.text}</p>
                      <p className="text-xs text-gray-400">
                        {note.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* AI Panel Actions */}
            <div className="border-t border-gray-700 p-4 space-y-2">
              <button
                onClick={exportSummary}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition text-sm"
              >
                <Download className="w-4 h-4" />
                Export Summary
              </button>
              <button
                onClick={() => {
                  const event = new CustomEvent('openPeakAI')
                  window.dispatchEvent(event)
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white rounded-lg transition text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Ask Peak AI
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition ${
              isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition ${
              isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition ${
              isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <ScreenShare className="w-6 h-6" />
          </button>

          <button className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition" title="Participants">
            <Users className="w-6 h-6" />
          </button>

          <div className="w-px h-10 bg-gray-600 mx-2" />

          <button
            onClick={handleLeave}
            className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
            title="Leave meeting"
          >
            <Phone className="w-6 h-6 rotate-135" />
          </button>
        </div>
      </div>

      {/* Meeting to Task Converter */}
      {showTaskConverter && (
        <MeetingToTaskConverter
          meetingId={meetingId}
          meetingTitle={`Meeting ${meetingId}`}
          actionItems={actionItems.map(item => ({
            id: item.id,
            text: item.text,
            assignee: item.assignee,
            priority: 'MEDIUM'
          }))}
          onClose={() => setShowTaskConverter(false)}
          onTasksCreated={(count) => {
            alert(`${count} task(s) created successfully!`)
          }}
        />
      )}
    </div>
  )
}
