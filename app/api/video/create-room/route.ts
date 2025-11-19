import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

/**
 * API Endpoint: Create Daily.co Video Room
 * POST /api/video/create-room
 *
 * Body: {
 *   meetingTitle?: string,
 *   privacy?: 'public' | 'private'
 * }
 */
export async function POST(request: Request) {
  try {
    // Multi-tenant authentication (optional - allowing unauthenticated access during development)
    let userId: string | null = null
    try {
      const authResult = await auth()
      userId = authResult.userId
    } catch (authError) {
      console.log('[CreateRoom] Auth unavailable, allowing unauthenticated access')
    }

    // TODO: Re-enable authentication requirement when Clerk is fully configured
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    const { meetingTitle, privacy = 'private', roomName } = await request.json()

    const apiKey = process.env.DAILY_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Daily.co API key not configured',
          details: 'Please add DAILY_API_KEY to your environment variables'
        },
        { status: 500 }
      )
    }

    // Use provided roomName or generate one from meetingTitle
    const dailyRoomName = roomName || (meetingTitle ?
      `${meetingTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}` :
      `meeting-${Date.now()}`)

    // Try to get existing room first (in case it already exists)
    const existingRoomResponse = await fetch(`https://api.daily.co/v1/rooms/${dailyRoomName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    // If room exists, return it
    if (existingRoomResponse.ok) {
      const existingRoom = await existingRoomResponse.json()
      console.log('[CreateRoom] Room already exists, joining existing:', existingRoom.name)
      return NextResponse.json({
        success: true,
        roomUrl: existingRoom.url,
        roomName: existingRoom.name,
        expiresAt: existingRoom.config.exp ? new Date(existingRoom.config.exp * 1000).toISOString() : null,
        isExisting: true
      })
    }

    // Create a new Daily.co room with the specific name
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        name: dailyRoomName,
        privacy,
        properties: {
          enable_screenshare: true,
          enable_chat: true,
          enable_knocking: privacy === 'private',
          enable_prejoin_ui: false,
          start_audio_off: false,
          start_video_off: false,
          // Auto-delete room after 1 hour of inactivity
          exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[CreateRoom] Daily.co API error:', error)
      return NextResponse.json(
        {
          error: 'Failed to create video room',
          details: error.error || 'Unknown error from Daily.co'
        },
        { status: response.status }
      )
    }

    const room = await response.json()

    console.log('[CreateRoom] Room created:', room.name)

    return NextResponse.json({
      success: true,
      roomUrl: room.url,
      roomName: room.name,
      expiresAt: new Date(room.config.exp * 1000).toISOString()
    })

  } catch (error) {
    console.error('[CreateRoom] Error:', error)

    return NextResponse.json(
      {
        error: 'Room creation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
