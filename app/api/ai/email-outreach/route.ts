import { gemini, GEMINI_MODEL } from '@/lib/gemini'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { targetAudience, tone, goal, emailCount = 3 } = await request.json()

    if (!targetAudience) {
      return NextResponse.json(
        { error: 'Target audience is required' },
        { status: 400 }
      )
    }

    const toneDescriptions = {
      formal: 'professional, business-appropriate, and respectful',
      neutral: 'balanced, friendly yet professional',
      casual: 'warm, conversational, and approachable'
    }

    const toneDesc = toneDescriptions[tone as keyof typeof toneDescriptions] || toneDescriptions.neutral

    const prompt = `You are an expert cold email copywriter. Generate a ${emailCount}-email outreach sequence for the following:

Target Audience: ${targetAudience}
Tone: ${toneDesc}
${goal ? `Goal: ${goal}` : 'Goal: Start a conversation and book a meeting'}

Requirements:
1. Each email should be concise (under 150 words)
2. Use personalization variables: {{firstName}}, {{lastName}}, {{company}}, {{senderName}}, {{calendar_link}}
3. First email is the initial outreach
4. Subsequent emails are follow-ups with different angles
5. Include compelling subject lines
6. Focus on value proposition, not features
7. Include a clear call-to-action

Respond in JSON format with this structure:
{
  "emails": [
    {
      "subject": "Subject line here",
      "body": "Email body here",
      "delay": 0
    },
    {
      "subject": "Follow-up subject",
      "body": "Follow-up body",
      "delay": 3
    }
  ]
}

The delay is the number of days after the previous email. First email has delay 0.`

    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.8,
        maxOutputTokens: 2000,
      }
    })

    const text = response.text || ''

    // Extract JSON from the response
    let emailSequence
    try {
      // Try to find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        emailSequence = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // Return a fallback response
      emailSequence = {
        emails: [
          {
            subject: `Quick question about ${targetAudience.split(' ')[0].toLowerCase()}`,
            body: `Hi {{firstName}},\n\nI noticed you're working with ${targetAudience.toLowerCase()} and wanted to reach out.\n\n${goal ? `We've been helping similar teams ${goal.toLowerCase()}.` : 'We specialize in solving the challenges your team faces daily.'}\n\nWould you be open to a quick 15-minute call?\n\nBest,\n{{senderName}}`,
            delay: 0
          },
          {
            subject: 'Following up',
            body: `Hi {{firstName}},\n\nJust following up on my previous email. I know how busy things get!\n\nI'd love to share how we've helped similar ${targetAudience.split(' ')[0].toLowerCase()} achieve great results.\n\nWould next week work for a quick chat?\n\nBest,\n{{senderName}}`,
            delay: 3
          },
          {
            subject: 'Last note from me',
            body: `Hi {{firstName}},\n\nI'll keep this brief - I don't want to clutter your inbox.\n\nIf now isn't the right time, no worries. But if you ever want to chat, I'm here: {{calendar_link}}\n\nBest,\n{{senderName}}`,
            delay: 5
          }
        ]
      }
    }

    // Add IDs to each email
    const emailsWithIds = emailSequence.emails.map((email: { subject: string; body: string; delay: number }, index: number) => ({
      id: (index + 1).toString(),
      subject: email.subject,
      body: email.body,
      delay: email.delay,
      generated: true
    }))

    return NextResponse.json({
      success: true,
      emails: emailsWithIds,
      metadata: {
        targetAudience,
        tone,
        goal,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Email outreach generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate email sequence' },
      { status: 500 }
    )
  }
}
