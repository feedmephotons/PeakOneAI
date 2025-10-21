import { useEffect, useRef, useState } from 'react'
import DailyIframe, {
  DailyCall,
  DailyEventObjectParticipant,
  DailyEventObjectParticipants
} from '@daily-co/daily-js'

export interface DailyParticipant {
  id: string
  name: string
  isLocal: boolean
  isScreenShare: boolean
  audioTrack?: MediaStreamTrack
  videoTrack?: MediaStreamTrack
  isMuted: boolean
  isVideoOff: boolean
}

export function useDaily(roomUrl: string | null, userName: string) {
  const callRef = useRef<DailyCall | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [participants, setParticipants] = useState<DailyParticipant[]>([])
  const [error, setError] = useState<string | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    if (!roomUrl) return

    const joinCall = async () => {
      try {
        setIsJoining(true)
        setError(null)

        // Create Daily call object
        const daily = DailyIframe.createCallObject({
          audioSource: true,
          videoSource: true
        })

        callRef.current = daily

        // Set up event listeners
        daily
          .on('joined-meeting', handleJoinedMeeting)
          .on('participant-joined', handleParticipantUpdate)
          .on('participant-updated', handleParticipantUpdate)
          .on('participant-left', handleParticipantUpdate)
          .on('error', handleError)

        // Join the room
        await daily.join({
          url: roomUrl,
          userName
        })

        setIsJoining(false)
        setIsJoined(true)

      } catch (err) {
        console.error('Failed to join call:', err)
        setError(err instanceof Error ? err.message : 'Failed to join call')
        setIsJoining(false)
      }
    }

    joinCall()

    return () => {
      if (callRef.current) {
        callRef.current.destroy()
        callRef.current = null
      }
    }
  }, [roomUrl, userName])

  const handleJoinedMeeting = () => {
    console.log('[Daily] Joined meeting')
    if (callRef.current) {
      // Get local stream
      const localParticipant = callRef.current.participants().local
      if (localParticipant?.tracks?.audio?.persistentTrack) {
        const audioTrack = localParticipant.tracks.audio.persistentTrack
        const stream = new MediaStream([audioTrack])
        setLocalStream(stream)
      }
      updateParticipants()
    }
  }

  const handleParticipantUpdate = () => {
    updateParticipants()
  }

  const handleError = (error: any) => {
    console.error('[Daily] Error:', error)
    setError(error.errorMsg || 'An error occurred')
  }

  const updateParticipants = () => {
    if (!callRef.current) return

    const dailyParticipants = callRef.current.participants()
    const participantList: DailyParticipant[] = []

    Object.entries(dailyParticipants).forEach(([id, participant]) => {
      if (!participant) return

      participantList.push({
        id: participant.session_id,
        name: participant.user_name || 'Guest',
        isLocal: participant.local,
        isScreenShare: participant.screen || false,
        audioTrack: participant.tracks?.audio?.persistentTrack,
        videoTrack: participant.tracks?.video?.persistentTrack,
        isMuted: !participant.audio,
        isVideoOff: !participant.video
      })
    })

    setParticipants(participantList)
  }

  const toggleMute = () => {
    if (callRef.current) {
      callRef.current.setLocalAudio(!callRef.current.localAudio())
    }
  }

  const toggleVideo = () => {
    if (callRef.current) {
      callRef.current.setLocalVideo(!callRef.current.localVideo())
    }
  }

  const startScreenShare = () => {
    if (callRef.current) {
      callRef.current.startScreenShare()
    }
  }

  const stopScreenShare = () => {
    if (callRef.current) {
      callRef.current.stopScreenShare()
    }
  }

  const leaveCall = () => {
    if (callRef.current) {
      callRef.current.leave()
      callRef.current.destroy()
      callRef.current = null
      setIsJoined(false)
    }
  }

  return {
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
    callObject: callRef.current
  }
}
