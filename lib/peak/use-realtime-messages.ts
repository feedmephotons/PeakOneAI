'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ONE browser client (and therefore one Realtime socket) for the whole session.
// Creating a fresh client per conversation-switch spawns competing sockets and
// breaks re-subscription, so we memoize it at module scope.
let _client: ReturnType<typeof createClient> | null = null
function getRealtimeClient() {
  if (!_client) _client = createClient()
  return _client
}
let _realtimeAuthed = false

// ----------------------------------------------------------------------------
// Supabase Realtime for the Messages page.
//
// ONE persistent channel for the whole session (`user:${userId}:messages`). The
// channel is created once (keyed on the user id) and stays alive across
// conversation switches — removing and recreating a per-conversation channel on
// every switch dropped the socket to zero channels, disconnected it, and made
// the next subscribe TIME_OUT. Three capabilities ride this single channel:
//   1. Live messages  — Postgres Changes (INSERT on public."Message") with NO
//      conversation filter; RLS scopes delivery to the user's conversations.
//      The page routes each row by its conversationId.
//   2. Typing         — Broadcast event 'typing' carrying { userId, name,
//      conversationId }; the page shows it only for the open conversation.
//   3. Presence       — channel.track() + presence sync/join/leave for online dots.
//
// Realtime is ONLY engaged for authenticated users (a real supabase.auth
// session). The demo / unauthenticated path stays purely optimistic + mock.
// ----------------------------------------------------------------------------

// The page's in-memory message shape (mirrors app/messages/page.tsx).
export interface RealtimeMessageShape {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file'
  fileUrl?: string
  fileName?: string
  isRead: boolean
  pending?: boolean
}

// Raw row as it arrives from Postgres Changes (DB column names).
interface MessageRow {
  id: string
  content: string | null
  senderId: string
  conversationId: string
  type: string | null
  fileUrl: string | null
  fileName: string | null
  createdAt: string
}

export interface TypingUser {
  userId: string
  name: string
  conversationId: string
}

interface CurrentUser {
  id: string
  name?: string
  email?: string
  avatarUrl?: string | null
}

interface UseRealtimeMessagesArgs {
  currentUser: CurrentUser | null
  // Resolve a sender's display name/avatar from the participants/messages the
  // page already has. Called for rows where the sender isn't the current user.
  resolveSender: (senderId: string) => { name: string; avatar?: string }
  // Append/reconcile an incoming realtime message (dedup + routing by
  // conversationId handled by the page).
  onMessage: (msg: RealtimeMessageShape) => void
  // Another user started typing in some conversation (already filtered to
  // exclude the current user). The page decides whether to surface it based on
  // the open conversation.
  onTyping: (user: TypingUser) => void
  // Drives the online dots / presence state for participants.
  onPresence: (onlineUserIds: string[]) => void
}

interface UseRealtimeMessagesResult {
  // Throttled (~1.5s) broadcast of a 'typing' event for the current user in the
  // given conversation.
  sendTyping: (conversationId: string) => void
  // Whether a live realtime channel is currently active (authenticated path).
  isLive: () => boolean
}

export function useRealtimeMessages({
  currentUser,
  resolveSender,
  onMessage,
  onTyping,
  onPresence,
}: UseRealtimeMessagesArgs): UseRealtimeMessagesResult {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const lastTypingSentRef = useRef<number>(0)

  // Keep callbacks fresh without re-subscribing on every render.
  const resolveSenderRef = useRef(resolveSender)
  const onMessageRef = useRef(onMessage)
  const onTypingRef = useRef(onTyping)
  const onPresenceRef = useRef(onPresence)
  resolveSenderRef.current = resolveSender
  onMessageRef.current = onMessage
  onTypingRef.current = onTyping
  onPresenceRef.current = onPresence

  useEffect(() => {
    // No user → nothing to subscribe to.
    if (!currentUser) return

    let cancelled = false
    let channel: RealtimeChannel | null = null
    const supabase = getRealtimeClient()
    const userId = currentUser.id

    const setup = async () => {
      // Only engage realtime for a REAL Supabase session. The demo/unauth path
      // (no auth user) skips this entirely and stays optimistic + mock.
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (cancelled || !user) return
      // Authenticate the Realtime socket with the user's JWT (ONCE) so RLS-scoped
      // postgres_changes are delivered. Re-calling setAuth churns the socket, so
      // guard it.
      if (!_realtimeAuthed) {
        await supabase.realtime.setAuth(session!.access_token)
        _realtimeAuthed = true
      }

      const meId = currentUser.id
      const meName = currentUser.name || currentUser.email || 'You'

      // ONE persistent channel for the whole session — no per-conversation churn.
      channel = supabase.channel(`user:${userId}:messages`, {
        config: { presence: { key: meId } },
      })

      channel
        // 1. LIVE MESSAGES — Postgres Changes, NO conversation filter. RLS scopes
        //    delivery to the user's own conversations; the page routes each row
        //    by its conversationId.
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'Message',
          },
          (payload) => {
            const row = payload.new as MessageRow
            const isOwn = row.senderId === meId
            const resolved = isOwn
              ? { name: 'You', avatar: currentUser.avatarUrl || undefined }
              : resolveSenderRef.current(row.senderId)

            const mapped: RealtimeMessageShape = {
              id: row.id,
              conversationId: row.conversationId,
              senderId: row.senderId,
              senderName: resolved.name,
              senderAvatar: resolved.avatar,
              content: row.content || '',
              timestamp: new Date(row.createdAt),
              type: ((row.type as RealtimeMessageShape['type']) || 'text'),
              fileUrl: row.fileUrl || undefined,
              fileName: row.fileName || undefined,
              isRead: isOwn,
            }
            onMessageRef.current(mapped)
          }
        )
        // 2. TYPING — Broadcast from other users, carrying the conversationId so
        //    the page can scope the indicator to the open conversation.
        .on('broadcast', { event: 'typing' }, ({ payload }) => {
          if (!payload || payload.userId === meId || !payload.conversationId) return
          onTypingRef.current({
            userId: payload.userId,
            name: payload.name,
            conversationId: payload.conversationId,
          })
        })
        // 3. PRESENCE — online dots / online state for participants.
        .on('presence', { event: 'sync' }, () => {
          if (!channel) return
          const state = channel.presenceState()
          onPresenceRef.current(Object.keys(state))
        })
        .on('presence', { event: 'join' }, () => {
          if (!channel) return
          onPresenceRef.current(Object.keys(channel.presenceState()))
        })
        .on('presence', { event: 'leave' }, () => {
          if (!channel) return
          onPresenceRef.current(Object.keys(channel.presenceState()))
        })

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && channel) {
          await channel.track({
            userId: meId,
            name: meName,
            online_at: new Date().toISOString(),
          })
        }
      })

      if (cancelled) {
        supabase.removeChannel(channel)
        channel = null
        return
      }
      channelRef.current = channel
    }

    setup()

    // CLEAN LIFECYCLE — tear down only when the user changes / unmounts, NOT on
    // conversation switch (the channel persists for the whole session).
    return () => {
      cancelled = true
      const ch = channel || channelRef.current
      if (ch) {
        supabase.removeChannel(ch)
      }
      channelRef.current = null
    }
    // Keyed on user id ONLY — the channel is created once and stays alive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id])

  const sendTyping = (conversationId: string) => {
    const channel = channelRef.current
    if (!channel || !currentUser || !conversationId) return
    const now = Date.now()
    if (now - lastTypingSentRef.current < 1500) return // throttle ~1.5s
    lastTypingSentRef.current = now
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: currentUser.id,
        name: currentUser.name || currentUser.email || 'Someone',
        conversationId,
      },
    })
  }

  const isLive = () => channelRef.current !== null

  return { sendTyping, isLive }
}
