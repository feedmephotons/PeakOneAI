'use client'

/**
 * use-softphone.ts — browser softphone hook built on @twilio/voice-sdk.
 *
 * The Twilio Voice SDK is BROWSER-ONLY (it touches `window`, `navigator`,
 * WebRTC). We therefore dynamic-import it inside an effect/handler and guard on
 * `typeof window`. Never import '@twilio/voice-sdk' at module top — that breaks
 * SSR for any page using this hook.
 *
 * Lifecycle:
 *   1. ensureDevice() — GET /api/twilio/voice/token, `new Device(token)`,
 *      register(). Cached for the component's lifetime.
 *   2. call(number)   — device.connect({ params: { To } }); tracks live state.
 *   3. mute()/hangup()— act on the active Call object.
 *
 * State machine: idle -> connecting -> ringing -> in-call -> ended (-> idle)
 * with an `error` channel for surfaced Twilio messages.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

export type SoftphoneStatus =
  | 'idle'
  | 'initializing'
  | 'ready'
  | 'connecting'
  | 'ringing'
  | 'in-call'
  | 'ended'
  | 'error'

export interface SoftphoneState {
  status: SoftphoneStatus
  /** Seconds elapsed since the call connected (live ticking while in-call). */
  durationSec: number
  muted: boolean
  /** Human-readable error (Twilio message when available). */
  error: string | null
  /** The number/identity currently being dialed. */
  activeNumber: string | null
}

// Minimal structural types so we don't need the SDK's types at module scope.
type TwilioCall = {
  on: (event: string, handler: (...args: unknown[]) => void) => void
  disconnect: () => void
  mute: (shouldMute: boolean) => void
  isMuted?: () => boolean
}
type TwilioDevice = {
  register: () => Promise<void>
  connect: (opts: { params: Record<string, string> }) => Promise<TwilioCall>
  destroy: () => void
  on: (event: string, handler: (...args: unknown[]) => void) => void
}

const INITIAL: SoftphoneState = {
  status: 'idle',
  durationSec: 0,
  muted: false,
  error: null,
  activeNumber: null,
}

export function useSoftphone() {
  const [state, setState] = useState<SoftphoneState>(INITIAL)

  const deviceRef = useRef<TwilioDevice | null>(null)
  const callRef = useRef<TwilioCall | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const identityRef = useRef<string | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    timerRef.current = setInterval(() => {
      setState((s) => ({ ...s, durationSec: s.durationSec + 1 }))
    }, 1000)
  }, [clearTimer])

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      clearTimer()
      try {
        callRef.current?.disconnect()
      } catch {
        /* noop */
      }
      try {
        deviceRef.current?.destroy()
      } catch {
        /* noop */
      }
      deviceRef.current = null
      callRef.current = null
    }
  }, [clearTimer])

  /** Lazily fetch a token + construct/register the Device (browser-only). */
  const ensureDevice = useCallback(async (): Promise<TwilioDevice> => {
    if (typeof window === 'undefined') {
      throw new Error('Softphone is only available in the browser.')
    }
    if (deviceRef.current) return deviceRef.current

    setState((s) => ({ ...s, status: 'initializing', error: null }))

    const res = await fetch('/api/twilio/voice/token', { cache: 'no-store' })
    const data = await res.json()
    if (!res.ok || !data?.token) {
      throw new Error(data?.error || 'Could not get a voice token.')
    }
    identityRef.current = data.identity || null

    // Dynamic import — keeps the SDK out of the SSR bundle.
    const { Device } = await import('@twilio/voice-sdk')
    const device = new Device(data.token, {
      // Prefer Opus for quality; fall back to PCMU.
      codecPreferences: ['opus', 'pcmu'] as unknown as never,
    }) as unknown as TwilioDevice

    device.on('error', (err: unknown) => {
      const message =
        (err as { message?: string })?.message || 'Voice device error.'
      setState((s) => ({ ...s, status: 'error', error: message }))
    })

    await device.register()
    deviceRef.current = device
    setState((s) => ({ ...s, status: 'ready', error: null }))
    return device
  }, [])

  /** Place an outbound call to an E.164 number or client identity. */
  const call = useCallback(
    async (to: string) => {
      const target = to.trim()
      if (!target) {
        setState((s) => ({
          ...s,
          status: 'error',
          error: 'Enter a number to call.',
        }))
        return
      }
      try {
        const device = await ensureDevice()
        setState((s) => ({
          ...s,
          status: 'connecting',
          durationSec: 0,
          muted: false,
          error: null,
          activeNumber: target,
        }))

        const activeCall = await device.connect({ params: { To: target } })
        callRef.current = activeCall

        activeCall.on('ringing', () => {
          setState((s) => ({ ...s, status: 'ringing' }))
        })
        activeCall.on('accept', () => {
          setState((s) => ({ ...s, status: 'in-call', durationSec: 0 }))
          startTimer()
        })
        activeCall.on('disconnect', () => {
          clearTimer()
          callRef.current = null
          setState((s) => ({ ...s, status: 'ended' }))
        })
        activeCall.on('cancel', () => {
          clearTimer()
          callRef.current = null
          setState((s) => ({ ...s, status: 'ended' }))
        })
        activeCall.on('reject', () => {
          clearTimer()
          callRef.current = null
          setState((s) => ({ ...s, status: 'ended' }))
        })
        activeCall.on('error', (err: unknown) => {
          clearTimer()
          const message =
            (err as { message?: string })?.message || 'Call failed.'
          setState((s) => ({ ...s, status: 'error', error: message }))
        })
      } catch (err) {
        clearTimer()
        const message =
          (err as { message?: string })?.message || 'Could not place the call.'
        setState((s) => ({ ...s, status: 'error', error: message }))
      }
    },
    [ensureDevice, startTimer, clearTimer]
  )

  /** Hang up the active call. */
  const hangup = useCallback(() => {
    try {
      callRef.current?.disconnect()
    } catch {
      /* noop */
    }
    clearTimer()
    callRef.current = null
    setState((s) => ({ ...s, status: 'ended' }))
  }, [clearTimer])

  /** Toggle mute on the active call. */
  const toggleMute = useCallback(() => {
    const c = callRef.current
    if (!c) return
    setState((s) => {
      const next = !s.muted
      try {
        c.mute(next)
      } catch {
        /* noop */
      }
      return { ...s, muted: next }
    })
  }, [])

  /** Reset back to idle (e.g. after an ended/errored call). */
  const reset = useCallback(() => {
    clearTimer()
    setState((s) => ({
      ...INITIAL,
      // Keep device "ready" if it's already registered.
      status: deviceRef.current ? 'ready' : 'idle',
    }))
  }, [clearTimer])

  const isBusy =
    state.status === 'connecting' ||
    state.status === 'ringing' ||
    state.status === 'in-call'

  return {
    ...state,
    identity: identityRef.current,
    isBusy,
    call,
    hangup,
    toggleMute,
    reset,
    ensureDevice,
  }
}

/** Format seconds as M:SS (or H:MM:SS past an hour). */
export function formatCallDuration(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec))
  const hours = Math.floor(s / 3600)
  const mins = Math.floor((s % 3600) / 60)
  const secs = s % 60
  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${mins}:${String(secs).padStart(2, '0')}`
}
