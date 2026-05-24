'use client'

import { useState, useCallback } from 'react'
import { Upload, File as FileIcon, X, Brain, CheckCircle, Loader, FileText, Image, Film, Music, Archive, AlertCircle } from 'lucide-react'

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

export default function FileUploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (uploading) return

    const droppedFiles = Array.from(e.dataTransfer.files)
    const validFiles: File[] = []
    let hasLargeFile = false

    for (const file of droppedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        hasLargeFile = true
      } else {
        validFiles.push(file)
      }
    }

    if (hasLargeFile) {
      setError('One or more files exceed the maximum size limit of 50MB.')
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
    }
  }, [uploading])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploading) return
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      const validFiles: File[] = []
      let hasLargeFile = false

      for (const file of selectedFiles) {
        if (file.size > MAX_FILE_SIZE) {
          hasLargeFile = true
        } else {
          validFiles.push(file)
        }
      }

      if (hasLargeFile) {
        setError('One or more files exceed the maximum size limit of 50MB.')
      }

      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles])
      }
      e.target.value = ''
    }
  }

  const removeFile = (index: number) => {
    if (uploading) return
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File) => {
    const type = file.type
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />
    if (type.startsWith('video/')) return <Film className="w-5 h-5" />
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />
    if (type.includes('pdf') || type.includes('document')) return <FileText className="w-5 h-5" />
    if (type.includes('zip') || type.includes('rar')) return <Archive className="w-5 h-5" />
    return <FileIcon className="w-5 h-5" />
  }

  const getFileIconByMime = (mimeType: string | undefined, fileName: string) => {
    const type = mimeType || ''
    const name = fileName.toLowerCase()
    if (type.startsWith('image/') || name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return <Image className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
    }
    if (type.startsWith('video/') || name.match(/\.(mp4|mkv|mov|avi)$/i)) {
      return <Film className="w-5 h-5 text-blue-500 dark:text-blue-400" />
    }
    if (type.startsWith('audio/') || name.match(/\.(mp3|wav|ogg|aac)$/i)) {
      return <Music className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
    }
    if (
      type.includes('pdf') ||
      type.includes('document') ||
      type.includes('text') ||
      name.endsWith('.pdf') ||
      name.endsWith('.docx') ||
      name.endsWith('.doc') ||
      name.endsWith('.txt') ||
      name.endsWith('.md')
    ) {
      return <FileText className="w-5 h-5 text-amber-500 dark:text-amber-400" />
    }
    if (
      type.includes('zip') ||
      type.includes('rar') ||
      name.endsWith('.zip') ||
      name.endsWith('.rar') ||
      name.endsWith('.tar') ||
      name.endsWith('.gz')
    ) {
      return <Archive className="w-5 h-5 text-rose-500 dark:text-rose-400" />
    }
    return <FileIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes <= 0) return '0 B'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
  }

  const uploadFiles = async () => {
    if (files.length === 0) return
    setUploading(true)
    setError(null)

    const failedFiles: File[] = []
    let hasError = false
    let errorMessage = ''

    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('workspaceId', 'demo-workspace')

        const response = await fetch('/api/files/upload-with-ai', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const result = await response.json()
          const fileData = result.file || {}
          setUploadedFiles(prev => [...prev, {
            id: fileData.id || `demo-${Date.now()}`,
            fileName: fileData.name || file.name,
            fileSize: fileData.size || file.size,
            mimeType: fileData.mimeType || file.type,
            analysis: result.analysis || {
              summary: fileData.aiSummary || 'File uploaded and analyzed successfully',
              tags: fileData.aiTags || ['uploaded', 'file']
            }
          }])
        } else {
          hasError = true
          errorMessage = `Failed to upload "${file.name}": Server returned ${response.status} ${response.statusText}`
          failedFiles.push(file)
        }
      } catch (err) {
        console.error('Upload error:', err)
        hasError = true
        errorMessage = `Failed to upload "${file.name}": ${err instanceof Error ? err.message : String(err)}`
        failedFiles.push(file)
      }
    }

    setFiles(failedFiles)
    if (hasError) {
      setError(errorMessage || 'An error occurred during file upload.')
    }
    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8 transition-colors duration-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            File Upload & AI Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload files and let Lisa analyze them instantly
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 backdrop-blur-lg border border-rose-500/30 text-rose-200 shadow-lg flex items-start justify-between space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-rose-100">Upload Error</h4>
                <p className="text-sm text-rose-200/90 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 transition-colors p-1 rounded-full hover:bg-rose-900/40"
              aria-label="Close error message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upload Area */}
        <div className="bg-white/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 backdrop-blur-md rounded-2xl shadow-xl dark:shadow-2xl/10 p-8 mb-8 transition-all duration-300 hover:shadow-2xl dark:hover:shadow-3xl/5">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              isDragging
                ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/20'
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className={isDragging ? 'pointer-events-none' : ''}>
              <Upload className={`w-16 h-16 mx-auto mb-4 transition-transform duration-300 ${
                isDragging ? 'text-violet-500 scale-110' : 'text-gray-400 dark:text-gray-500 hover:scale-105'
              }`} />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Drop files here or click to browse
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Lisa will analyze your files and provide insights
              </p>
            </div>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label
              htmlFor={uploading ? undefined : "file-upload"}
              className={`inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-medium cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow ${
                uploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
              } ${isDragging ? 'pointer-events-none' : ''}`}
            >
              Choose Files
            </label>
            <div className={isDragging ? 'pointer-events-none' : ''}>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">
                Supports images, documents, PDFs, and more (up to 50MB)
              </p>
            </div>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Selected Files ({files.length})
              </h4>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/80 rounded-lg hover:bg-white dark:hover:bg-gray-800/80 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-500 dark:text-gray-400">{getFileIcon(file)}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                      className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="mt-4 w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white py-3 rounded-xl font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-2 shadow-sm hover:shadow"
              >
                {uploading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Uploading & Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Upload & Analyze</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Uploaded Files with AI Analysis */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 backdrop-blur-md rounded-2xl shadow-xl dark:shadow-2xl/10 p-8 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Uploaded Files & AI Analysis
            </h3>
            <div className="space-y-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl p-6 hover:shadow-md dark:hover:shadow-2xl/5 hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-[2px] transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative p-2.5 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getFileIconByMime(file.mimeType, file.fileName)}
                        <span className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 flex items-center justify-center shadow-sm">
                          <CheckCircle className="w-3 h-3 fill-green-500 text-white" />
                        </span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-x-2">
                          <p className="font-medium text-gray-900 dark:text-white">{file.fileName}</p>
                          <span className="text-sm text-gray-500 dark:text-gray-400">({formatFileSize(file.fileSize)})</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded just now</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full transition-all duration-150">
                      Analyzed
                    </span>
                  </div>

                  {file.analysis && (
                    <div className="mt-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-100 dark:border-gray-800 transition-all duration-300">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">AI Analysis by Lisa</p>
                          {file.analysis.summary && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{file.analysis.summary}</p>
                          )}
                          {file.analysis.tags && file.analysis.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {file.analysis.tags.map((tag: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1 bg-white dark:bg-gray-800 text-violet-700 dark:text-violet-400 text-xs font-medium rounded-lg border border-violet-200 dark:border-violet-900/50 transition-all duration-150 hover:scale-105 active:scale-95 cursor-default hover:bg-violet-50 dark:hover:bg-violet-950/20"
                                >
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