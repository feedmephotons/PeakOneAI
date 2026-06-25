import { NextResponse } from 'next/server'
import twilio from 'twilio'
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY_SID,
  TWILIO_API_KEY_SECRET,
  TWILIO_TWIML_APP_SID,
} from '@/lib/twilio'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/twilio/voice/token
 *
 * Mints a short-lived Twilio Voice Access Token for the browser softphone.
 * The token is signed with the API Key (NOT the auth token) and carries a
 * VoiceGrant that lets the browser place outbound calls through our TwiML App
 * and receive inbound client calls.
 *
 * The browser never sees any Twilio secret — only this ~1h JWT.
 *
 * Returns { token, identity } or { error } (500) if not configured.
 */
export async function GET() {
  if (
    !TWILIO_ACCOUNT_SID ||
    !TWILIO_API_KEY_SID ||
    !TWILIO_API_KEY_SECRET ||
    !TWILIO_TWIML_APP_SID
  ) {
    return NextResponse.json(
      {
        error:
          'Twilio Voice is not configured: TWILIO_ACCOUNT_SID / TWILIO_API_KEY_SID / TWILIO_API_KEY_SECRET / TWILIO_TWIML_APP_SID required.',
      },
      { status: 500 }
    )
  }

  // Identity = current user. Voice SDK identities must be URL-safe; sanitize.
  let identity = 'peakone-demo'
  try {
    const user = await getCurrentUser()
    const raw =
      (user && (user.id || user.email || user.name)) || 'peakone-demo'
    identity = String(raw).replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 121)
  } catch {
    // Fall back to demo identity if auth/context lookup fails.
  }

  const AccessToken = twilio.jwt.AccessToken
  const VoiceGrant = AccessToken.VoiceGrant

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: TWILIO_TWIML_APP_SID,
    incomingAllow: true,
  })

  const token = new AccessToken(
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY_SID,
    TWILIO_API_KEY_SECRET,
    { identity, ttl: 3600 }
  )
  token.addGrant(voiceGrant)

  return NextResponse.json({ token: token.toJwt(), identity })
}
