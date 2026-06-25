import twilio from 'twilio'
import { TWILIO_PHONE_NUMBER, isE164Like, normalizeE164 } from '@/lib/twilio'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/twilio/voice
 *
 * The TwiML webhook the TwiML App (APe5cb...) hits when the BROWSER softphone
 * places an outbound call via device.connect({ params: { To } }).
 *
 * Twilio sends the connect params as application/x-www-form-urlencoded, so we
 * read `To` from the form body. We then return TwiML:
 *   - To looks like an E.164 PSTN number -> <Dial callerId={tollfree}><Number>
 *   - To looks like a client identity     -> <Dial><Client> (browser-to-browser)
 *   - To is empty                         -> friendly <Say>
 *
 * Response MUST be text/xml.
 */
export async function POST(request: Request) {
  const VoiceResponse = twilio.twiml.VoiceResponse
  const twiml = new VoiceResponse()

  let to = ''
  try {
    const form = await request.formData()
    to = (form.get('To') as string | null)?.trim() || ''
  } catch {
    // No/invalid form body — fall through to the empty-To branch.
  }

  if (!to) {
    twiml.say(
      { voice: 'Polly.Joanna' },
      'Thanks for using Peak One. No destination number was provided, so there is nothing to dial. Goodbye.'
    )
    return xml(twiml)
  }

  const callerId = TWILIO_PHONE_NUMBER || undefined
  const normalized = normalizeE164(to)

  if (isE164Like(normalized)) {
    // PSTN dial from the toll-free caller id.
    const dial = twiml.dial({ callerId, answerOnBridge: true })
    dial.number(normalized)
  } else {
    // Treat as a Voice SDK client identity (browser-to-browser).
    const dial = twiml.dial({ callerId })
    dial.client(to)
  }

  return xml(twiml)
}

function xml(twiml: { toString(): string }): Response {
  return new Response(twiml.toString(), {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}
