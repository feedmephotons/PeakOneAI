'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Mic, MicOff, Video, VideoOff, Phone, Settings,
  Users, MessageSquare, ScreenShare, MoreVertical,
  Grid, Maximize2, Loader2
} from 'lucide-react'
import { useDaily } from '@/hooks/useDaily'
import AICallWidget from './AICallWidget'

interface VideoCallWithDailyProps {
  meetingId: string
  roomUrl: string | null
  onLeave: () => void
}

export default function VideoCallWithDaily({ meetingId, roomUrl, onLeave }: VideoCallWithDailyProps) {
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showAIWidget, setShowAIWidget] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid')
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  // Generate temporary user info (TODO: Use Clerk when configured)
  const userName = 'Guest-' + Math.random().toString(36).substr(2, 5)
  const userId = 'user-' + Math.random().toString(36).substr(2, 9)

  // Daily.co hook
  const {
    isJoining,
    isJoined,
    participants,
    error,
    localStream,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    leaveCall,
    callObject
  } = useDaily(roomUrl, userName)

  // Update video elements when participants change
  useEffect(() => {
    participants.forEach((participant) => {
      const videoElement = videoRefs.current[participant.id]
      if (videoElement && participant.videoTrack) {
        const stream = new MediaStream([participant.videoTrack])
        if (participant.audioTrack) {
          stream.addTrack(participant.audioTrack)
        }
        videoElement.srcObject = stream
      }
    })
  }, [participants])

  const handleToggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare()
      setIsScreenSharing(false)
    } else {
      startScreenShare()
      setIsScreenSharing(true)
    }
  }

  const handleLeave = () => {
    leaveCall()
    onLeave()
  }

  // Get local participant
  const localParticipant = participants.find(p => p.isLocal)
  const remoteParticipants = participants.filter(p => !p.isLocal && !p.isScreenShare)

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500 rounded-2xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Connection Error</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <button
            onClick={onLeave}
            className="w-full px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (isJoining || !isJoined) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
        <h2 className="text-2xl font-semibold text-white mb-2">
          {isJoining ? 'Joining meeting...' : 'Connecting...'}
        </h2>
        <p className="text-gray-400">Please wait while we set up your video call</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">Meeting ID: {meetingId}</h2>
          <p className="text-gray-400 text-sm">{participants.length} participant{participants.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
            title={viewMode === 'grid' ? 'Speaker view' : 'Grid view'}
          >
            {viewMode === 'grid' ? <Maximize2 className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className={`h-full ${viewMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-4'}`}>
          {/* Local Video */}
          {localParticipant && (
            <div className="relative bg-gray-800 rounded-lg overflow-hidden group">
              <video
                ref={(el) => {
                  videoRefs.current[localParticipant.id] = el
                }}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {localParticipant.isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/50 px-3 py-1 rounded-lg text-white text-sm">
                You {localParticipant.isMuted && <span className="ml-2">🔇</span>}
              </div>
            </div>
          )}

          {/* Remote Participants */}
          {remoteParticipants.map((participant) => (
            <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden group">
              {participant.isVideoOff ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              ) : (
                <video
                  ref={(el) => {
                    videoRefs.current[participant.id] = el
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-3 left-3 bg-black/50 px-3 py-1 rounded-lg text-white text-sm">
                {participant.name} {participant.isMuted && <span className="ml-2">🔇</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition ${
              localParticipant?.isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            title={localParticipant?.isMuted ? 'Unmute' : 'Mute'}
          >
            {localParticipant?.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition ${
              localParticipant?.isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            title={localParticipant?.isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {localParticipant?.isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>

          <button
            onClick={handleToggleScreenShare}
            className={`p-4 rounded-full transition ${
              isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <ScreenShare className="w-6 h-6" />
          </button>

          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition"
            title="Participants"
          >
            <Users className="w-6 h-6" />
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition"
            title="Chat"
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          <button
            onClick={() => setShowAIWidget(!showAIWidget)}
            className={`p-4 rounded-full transition ${
              showAIWidget ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            title="Peak AI Assistant"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>

          <button className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition">
            <MoreVertical className="w-6 h-6" />
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

      {/* Chat Panel */}
      {showChat && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-white font-semibold">Chat</h3>
            <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">
              ×
            </button>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <p className="text-gray-500 text-sm text-center">No messages yet</p>
          </div>
          <div className="p-4 border-t border-gray-700">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Participants Panel */}
      {showParticipants && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-white font-semibold">Participants ({participants.length})</h3>
            <button onClick={() => setShowParticipants(false)} className="text-gray-400 hover:text-white">
              ×
            </button>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <div className="space-y-2">
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-700">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                    participant.isLocal ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-green-500 to-teal-600'
                  }`}>
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white flex-1">
                    {participant.name} {participant.isLocal && '(You)'}
                  </span>
                  {participant.isMuted && <MicOff className="w-4 h-4 text-red-400" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Call Widget */}
      {showAIWidget && localStream && (
        <AICallWidget
          meetingId={meetingId}
          userId={userId}
          userName={userName}
          audioStream={localStream}
          onClose={() => setShowAIWidget(false)}
        />
      )}
    </div>
  )
}
