'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import VideoCallWithDaily from '@/components/video/VideoCallWithDaily'
import { Loader2 } from 'lucide-react'

export default function VideoRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()
  const [roomUrl, setRoomUrl] = useState<string | null>(null)
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const meetingId = Array.isArray(params.id) ? params.id[0] : params.id

  // Create Daily.co room when component mounts
  useEffect(() => {
    const createRoom = async () => {
      // Wait for Clerk to load
      if (!isLoaded) return

      // Redirect to sign in if not authenticated
      if (!isSignedIn) {
        router.push(`/sign-in?redirect_url=/video/room/${meetingId}`)
        return
      }

      setIsCreatingRoom(true)
      setError(null)

      try {
        const response = await fetch('/api/video/create-room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingTitle: `Meeting ${meetingId}`,
            privacy: 'private'
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create room')
        }

        const data = await response.json()
        setRoomUrl(data.roomUrl)
      } catch (err) {
        console.error('Failed to create room:', err)
        setError(err instanceof Error ? err.message : 'Failed to create room')
      } finally {
        setIsCreatingRoom(false)
      }
    }

    createRoom()
  }, [isLoaded, isSignedIn, meetingId, router])

  const handleLeave = () => {
    router.push('/video')
  }

  // Show loading while Clerk loads
  if (!isLoaded || isCreatingRoom) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">
            {!isLoaded ? 'Loading...' : 'Creating your meeting room...'}
          </p>
        </div>
      </div>
    )
  }

  // Show error if room creation failed
  if (error) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-red-500/20 border border-red-500 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Failed to Join Meeting</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <button
            onClick={() => router.push('/video')}
            className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Show video call when room URL is ready
  if (roomUrl) {
    return (
      <VideoCallWithDaily
        meetingId={meetingId}
        roomUrl={roomUrl}
        onLeave={handleLeave}
      />
    )
  }

  return null
}