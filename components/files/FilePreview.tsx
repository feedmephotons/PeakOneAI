'use client'

import { X, Download, Share2, Trash2, Star, ExternalLink, FileText, Tag } from 'lucide-react'

interface FilePreviewProps {
  file: {
    id: string
    name: string
    type: string
    mimeType?: string
    size?: number
    url?: string
    thumbnailUrl?: string
    createdAt: Date
    modifiedAt: Date
    starred?: boolean
    aiSummary?: string
    aiTags?: string[]
  }
  onClose: () => void
}

export default function FilePreview({ file, onClose }: FilePreviewProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const isImage = file.mimeType?.startsWith('image/')
  const isPDF = file.mimeType?.includes('pdf')

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-peak-glass border border-peak-border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex">
        {/* Preview area */}
        <div className="flex-1 bg-white/[0.04] rounded-l-2xl flex items-center justify-center p-8">
          {isImage && file.thumbnailUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={file.thumbnailUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          ) : isPDF ? (
            <div className="text-center">
              <FileText className="w-24 h-24 text-peak-dim mx-auto mb-4" />
              <p className="text-peak-muted">PDF Preview</p>
              <button className="mt-4 px-4 py-2 bg-peak-primary text-white rounded-lg hover:bg-peak-primary-600 transition">
                Open in viewer
              </button>
            </div>
          ) : (
            <div className="text-center">
              <FileText className="w-24 h-24 text-peak-dim mx-auto mb-4" />
              <p className="text-peak-muted">No preview available</p>
            </div>
          )}
        </div>

        {/* Details panel */}
        <div className="w-96 p-6 border-l border-peak-border overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-peak truncate">{file.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/[0.04] rounded-lg transition"
            >
              <X className="w-5 h-5 text-peak-muted" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mb-6">
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-peak-primary text-white rounded-lg hover:bg-peak-primary-600 transition">
              <Download className="w-4 h-4" />
              Download
            </button>
            <button className="p-2 border border-peak-border rounded-lg hover:bg-white/[0.04] transition text-peak-muted">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 border border-peak-border rounded-lg hover:bg-white/[0.04] transition text-peak-muted">
              <Star className={`w-4 h-4 ${file.starred ? 'fill-peak-amber text-peak-amber' : ''}`} />
            </button>
            <button className="p-2 border border-peak-border rounded-lg hover:bg-white/[0.04] transition text-peak-red">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* AI Analysis */}
          {(file.aiSummary || file.aiTags) && (
            <div className="mb-6 p-4 bg-peak-primary/[0.08] rounded-lg border border-peak-primary/30">
              <h3 className="font-semibold text-peak-primary-300 mb-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-peak-primary rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                Lisa Analysis
              </h3>
              {file.aiSummary && (
                <p className="text-sm text-peak-muted mb-3">{file.aiSummary}</p>
              )}
              {file.aiTags && file.aiTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {file.aiTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/30 rounded text-xs"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* File info */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-peak-muted uppercase tracking-wider mb-1">
                File Information
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-peak-muted">Type</span>
                  <span className="text-sm text-peak">{file.mimeType || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-peak-muted">Size</span>
                  <span className="text-sm text-peak">{formatFileSize(file.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-peak-muted">Created</span>
                  <span className="text-sm text-peak">
                    {file.createdAt.toLocaleDateString(undefined, { timeZone: 'UTC' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-peak-muted">Modified</span>
                  <span className="text-sm text-peak">
                    {file.modifiedAt.toLocaleDateString(undefined, { timeZone: 'UTC' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Share settings */}
            <div className="pt-3 border-t border-peak-border">
              <p className="text-xs font-medium text-peak-muted uppercase tracking-wider mb-3">
                Sharing
              </p>
              <button className="w-full flex items-center justify-between px-4 py-2 border border-peak-border rounded-lg hover:bg-white/[0.04] transition">
                <span className="text-sm text-peak-muted">Get shareable link</span>
                <ExternalLink className="w-4 h-4 text-peak-dim" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}