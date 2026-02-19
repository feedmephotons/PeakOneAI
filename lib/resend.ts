import { Resend } from 'resend'

// Lazy-initialize Resend client (avoid build-time errors when env var is missing)
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

// Default from address - should match your verified domain in Resend
export const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@peakone.ai'
export const DEFAULT_FROM_NAME = process.env.RESEND_FROM_NAME || 'Peak One'

// Email types
export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export interface EmailResult {
  success: boolean
  id?: string
  error?: string
}

// Send a single email
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  try {
    const { to, subject, html, text, from, replyTo, cc, bcc, attachments } = options

    const result = await getResend().emails.send({
      from: from || `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || undefined,
      text: text || undefined,
      replyTo: replyTo || undefined,
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      attachments: attachments?.map(a => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    })

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    }
  }
}

// Send batch emails (up to 100 at a time)
export async function sendBatchEmails(
  emails: SendEmailOptions[]
): Promise<{ success: boolean; results: EmailResult[] }> {
  try {
    const batchEmails = emails.map(email => ({
      from: email.from || `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`,
      to: Array.isArray(email.to) ? email.to : [email.to],
      subject: email.subject,
      html: email.html || undefined,
      text: email.text || undefined,
      replyTo: email.replyTo || undefined,
    }))

    const result = await getResend().batch.send(batchEmails)

    if (result.error) {
      return {
        success: false,
        results: emails.map(() => ({ success: false, error: result.error?.message }))
      }
    }

    return {
      success: true,
      results: result.data?.data?.map(r => ({ success: true, id: r.id })) || []
    }
  } catch (error) {
    console.error('Failed to send batch emails:', error)
    return {
      success: false,
      results: emails.map(() => ({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      }))
    }
  }
}

// Convert HTML to plain text (simple version)
export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Replace personalization variables in email content
export function personalizeEmail(
  content: string,
  variables: Record<string, string>
): string {
  let result = content
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  return result
}
