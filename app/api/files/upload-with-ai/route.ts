import { openai } from '@/lib/openai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Demo mode - no authentication required for testing

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // For demo - we'll analyze without actually storing the file
    console.log('Analyzing file:', file.name, 'Type:', file.type, 'Size:', file.size)

    // Extract content for AI analysis
    let aiSummary: string | null = null
    let aiTags: string[] = []

    if (file.type.includes('text') || file.type.includes('pdf') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      try {
        const fileContent = await file.text()
        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are Lisa, an AI assistant. Analyze this document and provide a brief summary and 3-5 relevant tags for organization.'
            },
            {
              role: 'user',
              content: `Analyze this document:\n\n${fileContent.substring(0, 4000)}`
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })

        const analysis = response.choices[0].message.content
        if (analysis) {
          // Simple parsing
          const lines = analysis.split('\n')
          aiSummary = lines[0] || 'Document analyzed successfully'

          // Extract tags
          const tagsLine = lines.find(line => line.toLowerCase().includes('tag'))
          if (tagsLine) {
            aiTags = tagsLine
              .replace(/tags?:?/i, '')
              .split(/[,;]/)
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0)
              .slice(0, 5)
          }
        }
      } catch (error) {
        console.error('Text analysis error:', error)
        aiSummary = 'Text document uploaded successfully'
        aiTags = ['document', 'text']
      }
    } else if (file.type.includes('image') || file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      // For images, use vision API
      try {
        const base64 = await fileToBase64(file)
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Describe this image briefly and suggest 3-5 relevant tags for organization.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${file.type};base64,${base64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 300,
        })

        const imageAnalysis = response.choices[0].message.content
        if (imageAnalysis) {
          // Parse the response
          const lines = imageAnalysis.split('\n')
          aiSummary = lines[0] || 'Image analyzed successfully'

          // Extract tags
          const tagsLine = lines.find(line => line.toLowerCase().includes('tag'))
          if (tagsLine) {
            aiTags = tagsLine
              .replace(/tags?:?/i, '')
              .split(/[,;]/)
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0)
              .slice(0, 5)
          } else {
            aiTags = ['image', 'visual']
          }
        }
      } catch (error) {
        console.error('Image analysis error:', error)
        aiSummary = 'Image uploaded successfully'
        aiTags = ['image', 'media']
      }
    } else {
      // For other file types
      aiSummary = `${file.name} uploaded successfully`
      aiTags = [file.type.split('/')[0] || 'file', 'upload']
    }

    // Return demo response without database storage
    return NextResponse.json({
      file: {
        id: `demo-${Date.now()}`,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        aiSummary,
        aiTags,
      },
      analysis: {
        summary: aiSummary || 'File processed successfully',
        tags: aiTags.length > 0 ? aiTags : ['uploaded', 'file'],
      },
      message: 'File analyzed successfully with Lisa AI!',
    })
  } catch (error) {
    console.error('Upload with AI error:', error)
    return NextResponse.json(
      { error: 'Failed to upload and analyze file' },
      { status: 500 }
    )
  }
}

async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  return buffer.toString('base64')
}