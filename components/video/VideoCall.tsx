'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Mic, MicOff, Video, VideoOff, Phone, Settings,
  Users, MessageSquare, ScreenShare, MoreVertical,
  Grid, Maximize2
} from 'lucide-react'

interface Participant {
  id: string
  name: string
  isMuted: boolean
  isVideoOff: boolean
}

interface VideoCallProps {
  meetingId: string
  onLeave: () => void
}

export default function VideoCall({ meetingId, onLeave }: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid')

  // Mock participants for demo
  const [participants] = useState<Participant[]>([
    { id: '1', name: 'John Doe', isMuted: false, isVideoOff: false },
    { id: '2', name: 'Jane Smith', isMuted: true, isVideoOff: false },
    { id: '3', name: 'Bob Johnson', isMuted: false, isVideoOff: true },
  ])

  useEffect(() => {
    // Get user media (camera and microphone)
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
      // Cleanup: stop all tracks when component unmounts
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

        // Replace video track with screen share
        const videoTrack = screenStream.getVideoTracks()[0]
        if (localStream && localVideoRef.current) {
          const sender = localStream.getVideoTracks()[0]
          localStream.removeTrack(sender)
          localStream.addTrack(videoTrack)
          localVideoRef.current.srcObject = localStream
        }

        setIsScreenSharing(true)

        // Listen for screen share stop
        videoTrack.onended = () => {
          setIsScreenSharing(false)
        }
      } catch (error) {
        console.error('Error sharing screen:', error)
      }
    } else {
      // Stop screen sharing and switch back to camera
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
      })

      const videoTrack = cameraStream.getVideoTracks()[0]
      if (localStream && localVideoRef.current) {
        const screenTrack = localStream.getVideoTracks()[0]
        localStream.removeTrack(screenTrack)
        localStream.addTrack(videoTrack)
        localVideoRef.current.srcObject = localStream
      }

      setIsScreenSharing(false)
    }
  }

  const handleLeave = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    onLeave()
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
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
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className={`h-full ${viewMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-4'}`}>
          {/* Local Video */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden group">
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
            <div className="absolute bottom-3 left-3 bg-black/50 px-3 py-1 rounded-lg text-white text-sm">
              You {isMuted && <span className="ml-2">🔇</span>}
            </div>
          </div>

          {/* Remote Participants (Mock) */}
          {participants.map((participant) => (
            <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden group">
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
            <h3 className="text-white font-semibold">Participants ({participants.length + 1})</h3>
            <button onClick={() => setShowParticipants(false)} className="text-gray-400 hover:text-white">
              ×
            </button>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-700">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full" />
                <span className="text-white flex-1">You</span>
                {isMuted && <MicOff className="w-4 h-4 text-red-400" />}
              </div>
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-700">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full" />
                  <span className="text-white flex-1">{participant.name}</span>
                  {participant.isMuted && <MicOff className="w-4 h-4 text-red-400" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
