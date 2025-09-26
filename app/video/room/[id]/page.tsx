'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Mic, MicOff, Video, VideoOff, Monitor, PhoneOff,
  Users, MessageSquare, Settings, Grid, Maximize2,
  Copy, Check
} from 'lucide-react'

interface Participant {
  id: string
  name: string
  isMuted: boolean
  isVideoOn: boolean
  isScreenSharing: boolean
  isSpeaking: boolean
}

export default function VideoRoomPage() {
  const params = useParams()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [layoutMode, setLayoutMode] = useState<'grid' | 'speaker'>('grid')
  const [stream, setStream] = useState<MediaStream | null>(null)

  const meetingLink = typeof window !== 'undefined'
    ? `${window.location.origin}/video/room/${params.id}`
    : ''

  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'You', isMuted: false, isVideoOn: true, isScreenSharing: false, isSpeaking: false },
    { id: '2', name: 'John Doe', isMuted: true, isVideoOn: true, isScreenSharing: false, isSpeaking: false },
    { id: '3', name: 'Jane Smith', isMuted: false, isVideoOn: false, isScreenSharing: false, isSpeaking: true },
  ])

  const [messages, setMessages] = useState([
    { id: '1', sender: 'John Doe', message: 'Hey everyone!', time: '10:30 AM' },
    { id: '2', sender: 'Jane Smith', message: 'Hi! Ready to start?', time: '10:31 AM' },
  ])

  useEffect(() => {
    // Get user media
    const initMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (error) {
        console.error('Error accessing media devices:', error)
        setIsVideoOn(false)
      }
    }

    initMedia()

    return () => {
      // Cleanup stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted
      })
    }
    setIsMuted(!isMuted)
  }

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOn
      })
    }
    setIsVideoOn(!isVideoOn)
  }

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        })
        setIsScreenSharing(true)
        // In a real app, you'd broadcast this stream to other participants
      } catch (error) {
        console.error('Error sharing screen:', error)
      }
    } else {
      setIsScreenSharing(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(meetingLink)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    router.push('/video')
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Video Grid */}
        <div className={`h-full p-4 ${layoutMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 gap-4' : 'flex items-center justify-center'}`}>
          {/* Self Video */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${!isVideoOn ? 'hidden' : ''}`}
            />
            {!isVideoOn && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                  Y
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">You</span>
              {isMuted && <MicOff className="w-4 h-4 text-red-500" />}
            </div>
            {isScreenSharing && (
              <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded">
                Sharing Screen
              </div>
            )}
          </div>

          {/* Other Participants */}
          {participants.slice(1).map((participant) => (
            <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
              {participant.isVideoOn ? (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <div className="text-white text-6xl opacity-20">
                    <Video />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                    {participant.name.charAt(0)}
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                  {participant.name}
                </span>
                {participant.isMuted && <MicOff className="w-4 h-4 text-red-500" />}
              </div>
              {participant.isSpeaking && (
                <div className="absolute inset-0 border-4 border-green-500 rounded-lg pointer-events-none animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* Meeting Info Overlay */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-4 text-white">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Recording</span>
          </div>
          <div className="text-sm">Room: {params.id}</div>
          <button
            onClick={copyLink}
            className="flex items-center gap-2 text-sm hover:text-blue-400 transition"
          >
            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {isCopied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Layout Toggle */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-1 flex gap-1">
          <button
            onClick={() => setLayoutMode('grid')}
            className={`p-2 rounded ${layoutMode === 'grid' ? 'bg-white/20' : 'hover:bg-white/10'} transition`}
          >
            <Grid className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setLayoutMode('speaker')}
            className={`p-2 rounded ${layoutMode === 'speaker' ? 'bg-white/20' : 'hover:bg-white/10'} transition`}
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition ${
                isMuted
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition ${
                !isVideoOn
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isVideoOn ? (
                <Video className="w-5 h-5 text-white" />
              ) : (
                <VideoOff className="w-5 h-5 text-white" />
              )}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-full transition ${
                isScreenSharing
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Monitor className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Center - End Call */}
          <button
            onClick={endCall}
            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition flex items-center gap-2"
          >
            <PhoneOff className="w-5 h-5" />
            End Call
          </button>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition relative"
            >
              <Users className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {participants.length}
              </span>
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition"
            >
              <MessageSquare className="w-5 h-5 text-white" />
            </button>

            <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition">
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Side Panels */}
      {/* Participants Panel */}
      {showParticipants && (
        <div className="absolute right-0 top-0 bottom-20 w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Participants ({participants.length})</h3>
            <button
              onClick={() => setShowParticipants(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-2 rounded hover:bg-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                    {participant.name.charAt(0)}
                  </div>
                  <span className="text-white text-sm">{participant.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {participant.isMuted ? (
                    <MicOff className="w-4 h-4 text-red-500" />
                  ) : (
                    <Mic className="w-4 h-4 text-gray-400" />
                  )}
                  {!participant.isVideoOn && (
                    <VideoOff className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {showChat && (
        <div className="absolute right-0 top-0 bottom-20 w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Meeting Chat</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-medium text-blue-400">{msg.sender}</span>
                  <span className="text-xs text-gray-500">{msg.time}</span>
                </div>
                <p className="text-gray-300">{msg.message}</p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement
                    if (input.value.trim()) {
                      setMessages([...messages, {
                        id: Date.now().toString(),
                        sender: 'You',
                        message: input.value,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }])
                      input.value = ''
                    }
                  }
                }}
              />
              <button className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}