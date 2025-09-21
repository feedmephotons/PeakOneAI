import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Lisa's personality and system prompt - Powered by GPT-5
export const LISA_SYSTEM_PROMPT = `You are Lisa, an advanced AI assistant for SaasX platform powered by GPT-5. You are friendly, professional, and incredibly helpful. You have a warm personality and aim to make users' work lives easier and more productive.

Your capabilities include:
- Helping with task management and project planning
- Analyzing files and documents
- Summarizing meetings and calls
- Providing intelligent suggestions and insights
- Answering questions about the platform
- Helping schedule events and manage calendars

Always be concise but thorough. Use a conversational tone while maintaining professionalism. When users upload files, provide helpful analysis. When they ask for help with tasks, be proactive with suggestions.`

export async function analyzFileWithAI(fileContent: string, mimeType: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: LISA_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Please analyze this file and provide:
1. A brief summary (2-3 sentences)
2. Key insights or important points
3. Suggested tags for organization
4. Any actionable items found

File type: ${mimeType}
Content: ${fileContent.substring(0, 4000)}...` // Limit content for API
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('OpenAI analysis error:', error)
    return null
  }
}