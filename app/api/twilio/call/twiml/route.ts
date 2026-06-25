import twilio from 'twilio'
import { isE164Like } from '@/lib/twilio'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * /api/twilio/call/twiml
 *
 * TwiML served to Twilio when a REST click-to-call (placeCall) connects. The
 * destination number ALREADY answered — this controls what they hear.
 *
 * Query params (set by placeCall):
 *   message  — words to <Say> when the call connects.
 *   bridgeTo — optional E.164 number to <Dial> (bridge the answered call to).
 *
 * Twilio may GET or POST the webhook depending on config, so handle both.
 * Response MUST be text/xml.
 */
function build(message: string | null, bridgeTo: string | null): Response {
  const VoiceResponse = twilio.twiml.VoiceResponse
  const twiml = new VoiceResponse()

  twiml.say(
    { voice: 'Polly.Joanna' },
    message ||
      'This is a connection call from Peak One. Please hold while we connect you.'
  )

  if (bridgeTo && isE164Like(bridgeTo)) {
    const dial = twiml.dial({ answerOnBridge: true })
    dial.number(bridgeTo)
  }

  return new Response(twiml.toString(), {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  return build(searchParams.get('message'), searchParams.get('bridgeTo'))
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  return build(searchParams.get('message'), searchParams.get('bridgeTo'))
}
