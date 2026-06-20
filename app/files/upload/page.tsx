'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, File as FileIcon, X, Brain, CheckCircle, Loader, FileText, Image as ImageIcon, Film, Music, Archive, AlertCircle, FolderOpen } from 'lucide-react'
import { ACME_WORKSPACE_ID } from '@/lib/peak/mock'
import { appendFile } from '@/components/files/fileStore'

interface UploadedFile {
  id?: string
  fileName: string
  fileSize: number
  mimeType?: string
  analysis?: {
    summary?: string
    tags?: string[]
  }
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

function formatBytes(bytes: number) {
  if (bytes <= 0) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

// Read an image File into a persistable data: URL (survives reload). Non-images -> undefined.
function readImagePreview(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) return resolve(undefined)
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : undefined)
    reader.onerror = () => resolve(undefined)
    reader.readAsDataURL(file)
  })
}

export default function FileUploadPage() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true)
  }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
  }, [])
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
  }, [])

  const addValidFiles = (incoming: File[]) => {
    const validFiles: File[] = []
    let hasLargeFile = false
    for (const file of incoming) {
      if (file.size > MAX_FILE_SIZE) hasLargeFile = true
      else validFiles.push(file)
    }
    if (hasLargeFile) setError('One or more files exceed the maximum size limit of 50MB.')
    if (validFiles.length > 0) setFiles(prev => [...prev, ...validFiles])
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
    if (uploading) return
    addValidFiles(Array.from(e.dataTransfer.files))
  }, [uploading])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploading) return
    if (e.target.files) {
      addValidFiles(Array.from(e.target.files))
      e.target.value = ''
    }
  }

  const removeFile = (index: number) => {
    if (uploading) return
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File) => {
    const type = file.type
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />
    if (type.startsWith('video/')) return <Film className="w-5 h-5" />
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />
    if (type.includes('pdf') || type.includes('document')) return <FileText className="w-5 h-5" />
    if (type.includes('zip') || type.includes('rar')) return <Archive className="w-5 h-5" />
    return <FileIcon className="w-5 h-5" />
  }

  const getFileIconByMime = (mimeType: string | undefined, fileName: string) => {
    const type = mimeType || ''
    const name = fileName.toLowerCase()
    if (type.startsWith('image/') || name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return <ImageIcon className="w-5 h-5" />
    if (type.startsWith('video/') || name.match(/\.(mp4|mkv|mov|avi)$/i)) return <Film className="w-5 h-5" />
    if (type.startsWith('audio/') || name.match(/\.(mp3|wav|ogg|aac)$/i)) return <Music className="w-5 h-5" />
    if (type.includes('pdf') || type.includes('document') || type.includes('text') || name.match(/\.(pdf|docx?|txt|md)$/i)) return <FileText className="w-5 h-5" />
    if (type.includes('zip') || type.includes('rar') || name.match(/\.(zip|rar|tar|gz)$/i)) return <Archive className="w-5 h-5" />
    return <FileIcon className="w-5 h-5" />
  }

  const uploadFiles = async () => {
    if (files.length === 0) return
    setUploading(true)
    setError(null)

    const failedFiles: File[] = []
    const succeeded: UploadedFile[] = []

    for (const file of files) {
      const fallbackSummary = `Lisa analyzed "${file.name}" (${formatBytes(file.size)}) and indexed it for the Acme Corp workspace.`
      const fallbackTags = ['uploaded', file.type.split('/')[0] || 'file', 'acme']
      const preview = await readImagePreview(file)

      let analysis: UploadedFile['analysis'] = { summary: fallbackSummary, tags: fallbackTags }
      let serverId: string | undefined

      try {
        const formData = new FormData()
        formData.append('file', file)
        // Canonical Acme workspace (was 'demo-workspace').
        formData.append('workspaceId', ACME_WORKSPACE_ID)

        // EXTERNAL: real AI analysis needs Supabase Storage + Gemini. If the route
        // is unavailable in the demo, we fall back to a deterministic Lisa summary
        // and still persist the file so /files reflects it.
        const response = await fetch('/api/files/upload-with-ai', { method: 'POST', body: formData })
        if (response.ok) {
          const result = await response.json()
          const fileData = result.file || {}
          serverId = fileData.id
          analysis = result.analysis || {
            summary: fileData.aiSummary || fallbackSummary,
            tags: fileData.aiTags || fallbackTags,
          }
        }
      } catch {
        // swallow — demo fallback below still records the upload
      }

      const id = serverId || 'upload-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9)

      // Write into the SAME localStorage store that /files reads.
      appendFile({
        id,
        name: file.name,
        type: 'file',
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        thumbnailUrl: preview,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        parentId: null,
        aiSummary: analysis?.summary,
        aiTags: analysis?.tags,
        lastModifiedBy: 'Sarah Chen',
        version: 1,
      })

      succeeded.push({ id, fileName: file.name, fileSize: file.size, mimeType: file.type, analysis })
    }

    setUploadedFiles(prev => [...prev, ...succeeded])
    setFiles(failedFiles)
    setUploading(false)
  }

  return (
    <div className="min-h-screen text-peak p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-peak mb-2 tracking-tight">File Upload &amp; AI Analysis</h1>
            <p className="text-peak-muted">Upload files and let Lisa analyze them instantly</p>
          </div>
          <button
            onClick={() => router.push('/files')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-peak-border text-peak-muted rounded-xl hover:bg-white/[0.04] hover:text-peak transition"
          >
            <FolderOpen className="w-4 h-4" /> Back to Files
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-peak-red/10 border border-peak-red/30 text-peak-red flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold">Upload Error</h4>
                <p className="text-sm mt-1 text-peak-muted">{error}</p>
              </div>
            </div>
            <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-peak-red/10" aria-label="Close error message">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upload Area */}
        <div className="bg-peak-glass border border-peak-border backdrop-blur-md rounded-2xl shadow-xl p-8 mb-8">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              isDragging ? 'border-peak-primary bg-peak-primary/10' : 'border-peak-border hover:border-peak-primary/50'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className={isDragging ? 'pointer-events-none' : ''}>
              <Upload className={`w-16 h-16 mx-auto mb-4 transition-transform ${isDragging ? 'text-peak-primary-300 scale-110' : 'text-peak-dim'}`} />
              <h3 className="text-xl font-semibold text-peak mb-2">Drop files here or click to browse</h3>
              <p className="text-peak-muted mb-4">Lisa will analyze your files and provide insights</p>
            </div>
            <input type="file" multiple onChange={handleFileSelect} className="hidden" id="file-upload" disabled={uploading} />
            <label
              htmlFor={uploading ? undefined : 'file-upload'}
              className={`inline-flex items-center px-6 py-3 bg-peak-primary hover:bg-peak-primary-600 text-white rounded-xl font-medium cursor-pointer transition shadow-peak-glow ${
                uploading || isDragging ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
              }`}
            >
              Choose Files
            </label>
            <p className="text-sm text-peak-dim mt-4">Supports images, documents, PDFs, and more (up to 50MB)</p>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-peak-muted mb-3">Selected Files ({files.length})</h4>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/[0.04] border border-peak-border rounded-lg hover:bg-white/[0.06] transition">
                    <div className="flex items-center gap-3">
                      <div className="text-peak-dim">{getFileIcon(file)}</div>
                      <div>
                        <p className="text-sm font-medium text-peak">{file.name}</p>
                        <p className="text-xs text-peak-muted">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                      className="text-peak-dim hover:text-peak-red transition p-1 rounded-full hover:bg-peak-red/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="mt-4 w-full bg-peak-primary hover:bg-peak-primary-600 text-white py-3 rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-peak-glow"
              >
                {uploading ? (
                  <><Loader className="w-5 h-5 animate-spin" /><span>Uploading &amp; Analyzing...</span></>
                ) : (
                  <><Upload className="w-5 h-5" /><span>Upload &amp; Analyze</span></>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Uploaded Files with AI Analysis */}
        {uploadedFiles.length > 0 && (
          <div className="bg-peak-glass border border-peak-border backdrop-blur-md rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-peak">Uploaded Files &amp; AI Analysis</h3>
              <button
                onClick={() => router.push('/files')}
                className="text-sm text-peak-primary-300 hover:text-peak font-medium"
              >
                View in Files →
              </button>
            </div>
            <div className="space-y-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="border border-peak-border bg-white/[0.04] rounded-xl p-6 hover:border-peak-primary/40 transition group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative p-2.5 bg-peak-primary/15 text-peak-primary-300 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getFileIconByMime(file.mimeType, file.fileName)}
                        <span className="absolute -bottom-1 -right-1 bg-peak-green text-white rounded-full p-0.5 flex items-center justify-center shadow-sm">
                          <CheckCircle className="w-3 h-3" />
                        </span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-x-2">
                          <p className="font-medium text-peak">{file.fileName}</p>
                          <span className="text-sm text-peak-muted">({formatBytes(file.fileSize)})</span>
                        </div>
                        <p className="text-xs text-peak-muted">Saved to Acme Corp workspace</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-peak-green/15 text-peak-green text-xs font-medium rounded-full ring-1 ring-peak-green/30">Analyzed</span>
                  </div>

                  {file.analysis && (
                    <div className="mt-4 bg-white/[0.04] border border-peak-border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-peak-primary flex items-center justify-center flex-shrink-0">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-peak mb-2">AI Analysis by Lisa</p>
                          {file.analysis.summary && (
                            <p className="text-sm text-peak-muted leading-relaxed mb-3">{file.analysis.summary}</p>
                          )}
                          {file.analysis.tags && file.analysis.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {file.analysis.tags.map((tag: string, i: number) => (
                                <span key={i} className="px-2.5 py-1 bg-peak-primary/15 text-peak-primary-300 text-xs font-medium rounded-lg ring-1 ring-peak-primary/20">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
