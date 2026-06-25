import { NextResponse } from 'next/server'
import { sendSms, shapeTwilioError, isE164Like, normalizeE164 } from '@/lib/twilio'

export const runtime = 'nodejs'

/**
 * POST /api/twilio/sms
 * Body: { to: string, body: string }
 *
 * Sends an SMS via the server-side Twilio client.
 *  - Success -> 200 { sid, status, to }
 *  - Twilio error (e.g. trial recipient not verified, code 21608) -> 200
 *    { error, code, hint } so the UI can show an honest message instead of a
 *    fake success. We deliberately return HTTP 200 with the Twilio failure
 *    embedded (not 4xx/5xx) so the client can render it inline regardless of
 *    fetch error handling.
 *  - Bad input -> 400 { error }.
 */
export async function POST(request: Request) {
  let payload: { to?: unknown; body?: unknown }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const to = typeof payload.to === 'string' ? payload.to.trim() : ''
  const body = typeof payload.body === 'string' ? payload.body.trim() : ''

  if (!to) {
    return NextResponse.json({ error: 'Missing "to" phone number.' }, { status: 400 })
  }
  if (!body) {
    return NextResponse.json({ error: 'Message body cannot be empty.' }, { status: 400 })
  }
  if (body.length > 1600) {
    return NextResponse.json(
      { error: 'Message body too long (max 1600 characters).' },
      { status: 400 }
    )
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
    const result = await sendSms({ to: normalized, body })
    return NextResponse.json(result)
  } catch (err) {
    // Surface the real Twilio error (including trial "not verified") honestly.
    return NextResponse.json(shapeTwilioError(err))
  }
}
