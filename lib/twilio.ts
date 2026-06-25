/**
 * lib/twilio.ts — server-side Twilio REST client + helpers.
 *
 * This file is SERVER-ONLY. It reads secrets from process.env and must never be
 * imported into a client component. The browser only ever receives a short-lived
 * Voice Access Token minted in app/api/twilio/voice/token/route.ts.
 *
 * Env vars (set in Vercel + local .env):
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN   — REST auth
 *   TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET — Voice SDK Access Tokens
 *   TWILIO_PHONE_NUMBER                      — toll-free caller id / SMS from
 *   TWILIO_MESSAGING_SERVICE_SID            — preferred SMS sender (optional)
 *   TWILIO_TWIML_APP_SID                    — TwiML App for browser outbound voice
 *
 * NOTE: this is a Twilio TRIAL account. Outbound SMS/voice only succeed to
 * VERIFIED recipient numbers. Unverified recipients return a real Twilio error
 * (SMS code 21608, voice 'unverified'/13224 etc.). Helpers surface those errors
 * instead of faking success so the UI can show an honest message.
 */
import twilio from 'twilio'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || ''
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || ''
export const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID || ''
export const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET || ''
export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || ''
export const TWILIO_MESSAGING_SERVICE_SID =
  process.env.TWILIO_MESSAGING_SERVICE_SID || ''
export const TWILIO_TWIML_APP_SID = process.env.TWILIO_TWIML_APP_SID || ''

/**
 * Public base URL of the app, used to build absolute webhook URLs that Twilio's
 * servers can reach (e.g. the TwiML for a REST-placed call). Falls back to the
 * production domain. NEXT_PUBLIC_APP_URL may include a trailing slash — trim it.
 */
export function getPublicBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'https://www.peakone.ai'
  return raw.replace(/\/$/, '')
}

/** Throws a clear error if core REST credentials are missing. */
function assertConfigured() {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error(
      'Twilio is not configured: TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN missing from the environment.'
    )
  }
}

// ---------------------------------------------------------------------------
// REST client (lazy singleton)
// ---------------------------------------------------------------------------
let _client: twilio.Twilio | null = null

/** Returns the shared Twilio REST client (account SID + auth token). */
export function getTwilioClient(): twilio.Twilio {
  assertConfigured()
  if (!_client) {
    _client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  }
  return _client
}

// ---------------------------------------------------------------------------
// E.164 normalization
// ---------------------------------------------------------------------------
/**
 * Best-effort normalize a user-typed number to E.164 (+15551234567).
 * - Strips spaces, dashes, parens, dots.
 * - Keeps a leading '+'.
 * - 10 digits  -> assume US, prefix +1.
 * - 11 digits starting with 1 -> prefix +.
 * - Already-+ numbers pass through (digits only after the +).
 * Returns the cleaned string; callers should still expect Twilio to be the
 * final validator (it will reject anything truly malformed).
 */
export function normalizeE164(num: string): string {
  if (!num) return ''
  const trimmed = num.trim()

  // Client identities (Voice SDK) are not phone numbers — pass through untouched.
  // Heuristic: contains a non phone char (letters) and no leading +digits pattern.
  if (/[a-zA-Z]/.test(trimmed) && !trimmed.startsWith('+')) {
    return trimmed
  }

  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/[^\d]/g, '')

  if (hasPlus) return `+${digits}`
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  // Fallback: assume already-international without the +.
  return `+${digits}`
}

/** True if the value looks like an E.164 PSTN number (vs a client identity). */
export function isE164Like(value: string): boolean {
  return /^\+\d{7,15}$/.test(value.trim())
}

// ---------------------------------------------------------------------------
// SMS
// ---------------------------------------------------------------------------
export interface SendSmsArgs {
  to: string
  body: string
}

export interface SendSmsResult {
  sid: string
  status: string
  to: string
}

/**
 * Send an SMS. Prefers the Messaging Service if configured, else falls back to
 * the toll-free TWILIO_PHONE_NUMBER as the from number.
 *
 * Throws on failure (including trial "recipient not verified" — Twilio error
 * code 21608). Callers should catch and surface `error.code` / `error.message`.
 */
export async function sendSms({ to, body }: SendSmsArgs): Promise<SendSmsResult> {
  assertConfigured()
  const client = getTwilioClient()
  const toE164 = normalizeE164(to)

  const payload: {
    to: string
    body: string
    messagingServiceSid?: string
    from?: string
  } = { to: toE164, body }

  if (TWILIO_MESSAGING_SERVICE_SID) {
    payload.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID
  } else if (TWILIO_PHONE_NUMBER) {
    payload.from = TWILIO_PHONE_NUMBER
  } else {
    throw new Error(
      'No SMS sender configured: set TWILIO_MESSAGING_SERVICE_SID or TWILIO_PHONE_NUMBER.'
    )
  }

  const msg = await client.messages.create(payload)
  return { sid: msg.sid, status: msg.status, to: toE164 }
}

// ---------------------------------------------------------------------------
// Voice — REST click-to-call
// ---------------------------------------------------------------------------
export interface PlaceCallArgs {
  /** Destination PSTN number to dial. */
  to: string
  /**
   * Optional number to bridge the call to once the destination answers.
   * If omitted, the call just plays a short <Say> announcement.
   */
  bridgeTo?: string
  /** Optional spoken message before any bridge. */
  message?: string
}

export interface PlaceCallResult {
  sid: string
  status: string
  to: string
}

/**
 * Place an outbound call via the Twilio REST API (click-to-call). Twilio dials
 * `to` from the toll-free caller id, then fetches TwiML from our voice webhook
 * (which <Say>s a short message and optionally <Dial>s a bridge number).
 *
 * Throws on failure (trial accounts reject unverified recipients with a real
 * Twilio error — callers should surface it honestly).
 */
export async function placeCall({
  to,
  bridgeTo,
  message,
}: PlaceCallArgs): Promise<PlaceCallResult> {
  assertConfigured()
  if (!TWILIO_PHONE_NUMBER) {
    throw new Error('TWILIO_PHONE_NUMBER (caller id) is not configured.')
  }
  const client = getTwilioClient()
  const toE164 = normalizeE164(to)

  // Build absolute TwiML webhook URL with the spoken message + optional bridge.
  const base = getPublicBaseUrl()
  const url = new URL(`${base}/api/twilio/call/twiml`)
  if (message) url.searchParams.set('message', message)
  if (bridgeTo) url.searchParams.set('bridgeTo', normalizeE164(bridgeTo))

  const call = await client.calls.create({
    to: toE164,
    from: TWILIO_PHONE_NUMBER,
    url: url.toString(),
    method: 'POST',
  })

  return { sid: call.sid, status: call.status, to: toE164 }
}

// ---------------------------------------------------------------------------
// Error shaping
// ---------------------------------------------------------------------------
export interface ShapedTwilioError {
  error: string
  code?: number | string
  status?: number
  /** Human-friendly hint for known trial-account errors. */
  hint?: string
}

/**
 * Normalize an unknown thrown value (Twilio REST errors carry `.code`,
 * `.status`, `.message`) into a JSON-safe shape the UI can render.
 */
export function shapeTwilioError(err: unknown): ShapedTwilioError {
  const e = err as {
    message?: string
    code?: number | string
    status?: number
  }
  const code = e?.code
  let hint: string | undefined

  // Known trial-account / common errors — give the UI an honest explanation.
  if (code === 21608) {
    hint =
      'This Twilio account is in trial mode — SMS can only be sent to verified numbers. Verify the recipient in the Twilio Console (Phone Numbers → Verified Caller IDs).'
  } else if (code === 21211) {
    hint = 'Invalid "To" phone number — check the format (use E.164, e.g. +15551234567).'
  } else if (code === 13224 || code === 21219) {
    hint =
      'This Twilio account is in trial mode — calls can only be placed to verified numbers. Verify the recipient in the Twilio Console.'
  } else if (code === 21606 || code === 21659) {
    hint = 'The "from" number is not a valid, SMS-capable Twilio number on this account.'
  }

  return {
    error: e?.message || 'Twilio request failed',
    code,
    status: e?.status,
    hint,
  }
}
