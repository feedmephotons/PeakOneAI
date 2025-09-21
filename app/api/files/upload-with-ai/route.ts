import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { analyzFileWithAI, openai } from '@/lib/openai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const workspaceId = formData.get('workspaceId') as string
    const folderId = formData.get('folderId') as string | null

    if (!file || !workspaceId) {
      return NextResponse.json(
        { error: 'File and workspace ID are required' },
        { status: 400 }
      )
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('files')
      .upload(fileName, file)

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 400 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('files')
      .getPublicUrl(fileName)

    // Extract text content for AI analysis (for text files)
    let aiSummary = null
    let aiTags: string[] = []

    if (file.type.includes('text') || file.type.includes('pdf')) {
      const fileContent = await file.text()
      const analysis = await analyzFileWithAI(fileContent, file.type)

      if (analysis) {
        // Parse AI response for summary and tags
        aiSummary = analysis.split('Key insights')[0].trim()

        // Extract tags from analysis
        const tagsMatch = analysis.match(/Suggested tags:([^\n]*)/i)
        if (tagsMatch) {
          aiTags = tagsMatch[1]
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
        }
      }
    } else if (file.type.includes('image')) {
      // For images, use vision API
      try {
        const base64 = await fileToBase64(file)
        const response = await openai.chat.completions.create({
          model: 'gpt-4-vision-preview',
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
          aiSummary = imageAnalysis.split('Tags:')[0].trim()
          const tagsSection = imageAnalysis.split('Tags:')[1]
          if (tagsSection) {
            aiTags = tagsSection
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0)
          }
        }
      } catch (error) {
        console.error('Image analysis error:', error)
      }
    }

    // Save file metadata to database with AI enhancements
    const fileRecord = await prisma.file.create({
      data: {
        name: file.name,
        mimeType: file.type,
        size: file.size,
        url: publicUrl,
        uploaderId: user.id,
        workspaceId,
        folderId,
        aiSummary,
        aiTags,
      },
    })

    // Track activity
    await prisma.activity.create({
      data: {
        type: 'UPLOADED',
        entityType: 'file',
        entityId: fileRecord.id,
        description: `Uploaded file: ${file.name}`,
        userId: user.id,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          hasAiAnalysis: !!aiSummary,
        },
      },
    })

    return NextResponse.json({
      file: fileRecord,
      analysis: {
        summary: aiSummary,
        tags: aiTags,
      },
      message: 'File uploaded and analyzed successfully!',
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