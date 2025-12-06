import { NextResponse } from 'next/server'
import { sendEmail, sendBatchEmails, personalizeEmail, htmlToText } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type = 'single', emails, to, subject, html, text, from, replyTo, variables } = body

    // Batch send multiple emails
    if (type === 'batch' && emails && Array.isArray(emails)) {
      const processedEmails = emails.map((email: {
        to: string | string[]
        subject: string
        html?: string
        text?: string
        from?: string
        replyTo?: string
        variables?: Record<string, string>
      }) => {
        let processedHtml = email.html || ''
        let processedSubject = email.subject

        // Apply personalization variables
        if (email.variables) {
          processedHtml = personalizeEmail(processedHtml, email.variables)
          processedSubject = personalizeEmail(processedSubject, email.variables)
        }

        return {
          to: email.to,
          subject: processedSubject,
          html: processedHtml,
          text: email.text || htmlToText(processedHtml),
          from: email.from,
          replyTo: email.replyTo,
        }
      })

      const result = await sendBatchEmails(processedEmails)

      return NextResponse.json({
        success: result.success,
        sent: result.results.filter(r => r.success).length,
        failed: result.results.filter(r => !r.success).length,
        results: result.results
      })
    }

    // Single email send
    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject' },
        { status: 400 }
      )
    }

    let processedHtml = html || ''
    let processedSubject = subject

    // Apply personalization variables
    if (variables) {
      processedHtml = personalizeEmail(processedHtml, variables)
      processedSubject = personalizeEmail(processedSubject, variables)
    }

    const result = await sendEmail({
      to,
      subject: processedSubject,
      html: processedHtml,
      text: text || htmlToText(processedHtml),
      from,
      replyTo,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      message: 'Email sent successfully'
    })

  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
