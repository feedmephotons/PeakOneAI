import { NextResponse } from 'next/server'
import {
  placeCall,
  shapeTwilioError,
  isE164Like,
  normalizeE164,
} from '@/lib/twilio'

export const runtime = 'nodejs'

/**
 * POST /api/twilio/call
 * Body: { to: string, bridgeTo?: string, message?: string }
 *
 * REST click-to-call. Twilio dials `to` from the toll-free caller id, then
 * fetches TwiML from /api/twilio/call/twiml which plays a short <Say> and
 * optionally <Dial>s a bridge number.
 *
 *  - Success -> 200 { sid, status, to }
 *  - Twilio error (e.g. trial recipient not verified) -> 200 { error, code, hint }
 *  - Bad input -> 400 { error }
 */
export async function POST(request: Request) {
  let payload: { to?: unknown; bridgeTo?: unknown; message?: unknown }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const to = typeof payload.to === 'string' ? payload.to.trim() : ''
  const bridgeTo =
    typeof payload.bridgeTo === 'string' ? payload.bridgeTo.trim() : undefined
  const message =
    typeof payload.message === 'string' ? payload.message.trim() : undefined

  if (!to) {
    return NextResponse.json({ error: 'Missing "to" phone number.' }, { status: 400 })
  }

  const normalized = normalizeE164(to)
  if (!isE164Like(normalized)) {
    return NextResponse.json(
      {
        error: `"${to}" is not a valid phone number. Use E.164 format, e.g. +15551234567.`,
      },
      { status: 400 }
    )
  }

  try {
    const result = await placeCall({ to: normalized, bridgeTo, message })
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(shapeTwilioError(err))
  }
}
