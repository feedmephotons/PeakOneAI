'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Mic, MicOff, Video, VideoOff, Phone, Settings, Users, ScreenShare,
  Grid, Maximize2, Brain, CheckSquare, FileText, Download, Copy,
  Circle, Languages, ListChecks, Link2
} from 'lucide-react'
import MeetingToTaskConverter from '@/components/meetings/MeetingToTaskConverter'
import { getMockMeetingDetail, MOCK_USER, FIXED_TODAY } from '@/lib/peak/mock'

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

// Deterministic base instant for the fixed 2026-06-18 world (avoids Date.now()).
const FIXED_NOW = new Date(FIXED_TODAY).getTime()

export default function MeetingRoomPage() {
  const params = useParams()
  const router = useRouter()
  const meetingId = params.id as string
  const localVideoRef = useRef<HTMLVideoElement>(null)

  // Canonical meeting fixture (transcript / summary / action items / attendees).
  const detail = getMockMeetingDetail(meetingId)
  const meetingTitle = detail?.title ?? 'Live Meeting'

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid')
  const [showAIPanel, setShowAIPanel] = useState(true)
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(false)
  const [aiPanelTab, setAiPanelTab] = useState<'transcript' | 'actions' | 'notes'>('transcript')
  const [showTaskConverter, setShowTaskConverter] = useState(false)
  // Cycle the active speaker deterministically across transcript lines.
  const [speakingIndex, setSpeakingIndex] = useState(0)

  // Participants: the meeting's real attendees (minus the local user "You").
  const [participants] = useState<Participant[]>(() => {
    const attendees = detail?.attendees ?? []
    return attendees
      .filter((a) => a.id !== MOCK_USER.id)
      .map((a, i) => ({
        id: a.id,
        name: a.name,
        isMuted: i % 2 === 1,
        isVideoOff: i === 1,
        isSpeaking: false,
      }))
  })

  // Transcript: from the canonical fixture, with deterministic timestamps.
  const [transcript, setTranscript] = useState<TranscriptLine[]>(() => {
    const lines = detail?.transcript ?? []
    if (lines.length === 0) {
      return [
        {
          id: 't-1',
          speaker: MOCK_USER.name,
          text: 'Joining now — Lisa is recording, transcribing and summarizing this session.',
          timestamp: new Date(FIXED_NOW),
        },
      ]
    }
    return lines.map((l, i) => ({
      id: `t-${i + 1}`,
      speaker: l.speaker,
      text: l.text,
      timestamp: new Date(FIXED_NOW - (lines.length - i) * 60000),
    }))
  })

  // Action items: from the fixture's AI-extracted action items.
  const [actionItems, setActionItems] = useState<ActionItem[]>(() => {
    const items = detail?.actionItems ?? []
    return items.map((text, i) => ({
      id: `a-${i + 1}`,
      text,
      completed: false,
    }))
  })

  // Notes: the AI summary, split into bullet lines.
  const [notes] = useState<Note[]>(() => {
    const summary = detail?.aiSummary
    if (!summary) return []
    return summary
      .split(/(?<=\.)\s+/)
      .filter((s) => s.trim().length > 0)
      .slice(0, 4)
      .map((text, i) => ({
        id: `n-${i + 1}`,
        text: text.trim(),
        timestamp: new Date(FIXED_NOW - (4 - i) * 60000),
      }))
  })

  // Deterministically advance the active-speaker indicator (no random()).
  useEffect(() => {
    if (transcript.length === 0) return
    const interval = setInterval(() => {
      setSpeakingIndex((prev) => (prev + 1) % Math.max(participants.length, 1))
    }, 4000)
    return () => clearInterval(interval)
  }, [transcript.length, participants.length])

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
          video: true,
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
      title: meetingTitle,
      date: FIXED_TODAY,
      participants: [MOCK_USER.name, ...participants.map(p => p.name)],
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
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-white font-semibold">{meetingTitle}</h2>
            <p className="text-gray-400 text-sm">{participants.length + 1} participants</p>
          </div>
          {/* Meeting capability badges */}
          <div className="hidden md:flex items-center gap-1.5">
            <span className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded text-[11px] text-gray-300"><Circle className="w-3 h-3 text-red-400" />REC</span>
            <span className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded text-[11px] text-gray-300"><FileText className="w-3 h-3" />Transcript</span>
            <span className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded text-[11px] text-gray-300"><Languages className="w-3 h-3" />Translate</span>
            <span className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded text-[11px] text-gray-300"><Brain className="w-3 h-3" />Summary</span>
            <span className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded text-[11px] text-gray-300"><ListChecks className="w-3 h-3" />Actions</span>
            <span className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded text-[11px] text-gray-300"><Link2 className="w-3 h-3" />Memory</span>
          </div>
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
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="Toggle AI Panel"
          >
            <Brain className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowParticipantsPanel((v) => !v)}
            className={`p-2 rounded-lg transition ${
              showParticipantsPanel
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="Participants"
          >
            <Users className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push('/settings')}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
            title="Settings"
          >
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
                  <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
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
            {participants.map((participant, idx) => {
              const isSpeaking = idx === speakingIndex && !participant.isMuted
              return (
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
                {isSpeaking && (
                  <div className="absolute inset-0 border-4 border-green-500 rounded-lg pointer-events-none" />
                )}
              </div>
              )
            })}
          </div>
        </div>

        {/* AI Panel */}
        {showAIPanel && (
          <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
            {/* AI Panel Header */}
            <div className="bg-indigo-600 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Meeting Intelligence</h3>
                  <p className="text-xs text-white/80">Recorded, transcribed, summarized &amp; action-itemized</p>
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
                  <div className="flex items-center justify-between gap-2 mb-3 bg-indigo-500/10 rounded-lg p-3 border border-indigo-500/20">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-indigo-400" />
                      <p className="text-xs text-gray-300">Detected {actionItems.filter(a => !a.completed).length} pending actions</p>
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
                  <div className="flex items-center gap-2 mb-3 bg-indigo-500/10 rounded-lg p-3 border border-indigo-500/20">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <p className="text-xs text-gray-300">Meeting notes</p>
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
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm"
              >
                <Brain className="w-4 h-4" />
                Ask Lisa
              </button>
            </div>
          </div>
        )}

        {/* Participants Panel */}
        {showParticipantsPanel && (
          <div className="w-72 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4" /> Participants ({participants.length + 1})
              </h3>
              <button
                onClick={() => setShowParticipantsPanel(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="flex items-center gap-3 bg-gray-700 rounded-lg p-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                  {MOCK_USER.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">{MOCK_USER.name} (You)</p>
                  <p className="text-xs text-gray-400">{MOCK_USER.role || 'Host'}</p>
                </div>
                {isMuted && <MicOff className="w-4 h-4 text-red-400" />}
              </div>
              {participants.map((p) => (
                <div key={p.id} className="flex items-center gap-3 bg-gray-700 rounded-lg p-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                    {p.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.isVideoOff ? 'Camera off' : 'In call'}</p>
                  </div>
                  {p.isMuted && <MicOff className="w-4 h-4 text-red-400" />}
                </div>
              ))}
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

          <button
            onClick={() => setShowParticipantsPanel((v) => !v)}
            className={`p-4 rounded-full transition ${
              showParticipantsPanel ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            title="Participants"
          >
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
          meetingTitle={meetingTitle}
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
