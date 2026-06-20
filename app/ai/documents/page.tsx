'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText, Search, Bot, Star, MoreVertical,
  FileCode, FileSpreadsheet, Presentation, Image as ImageIcon, Upload, Sparkles, Loader2,
} from 'lucide-react'
import {
  MOCK_FILES,
  FIXED_TODAY,
  ACME_COMPANY,
} from '@/lib/peak/mock'
import type { FileItem, FileKind } from '@/lib/peak/types'

interface AnalyzedDocument {
  id: string
  name: string
  kind: FileKind
  summary: string
  keyPoints: string[]
  owner: string
  analyzedAt: string
  starred: boolean
}

/** Turn a canonical FileItem into the analyzed-document card shape. */
function toDoc(f: FileItem): AnalyzedDocument {
  // Derive 3 key points from the AI summary by splitting on sentences/clauses.
  const summary = f.aiSummary || 'No AI summary available.'
  const keyPoints =
    (f.aiTags && f.aiTags.length > 0
      ? f.aiTags.slice(0, 4).map((t) => t.charAt(0).toUpperCase() + t.slice(1))
      : summary.split(/[;.]\s+/).filter(Boolean).slice(0, 3))
  return {
    id: f.id,
    name: f.name,
    kind: f.kind,
    summary,
    keyPoints,
    owner: f.owner.name,
    analyzedAt: f.updatedAt,
    starred: !!f.starred,
  }
}

export default function AIDocumentsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [documents, setDocuments] = useState<AnalyzedDocument[]>(() => MOCK_FILES.map(toDoc))
  const [searchQuery, setSearchQuery] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const filteredDocs = useMemo(
    () =>
      documents.filter(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.summary.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [documents, searchQuery],
  )

  const getDocIcon = (kind: FileKind) => {
    const icons: Record<string, typeof FileText> = {
      pdf: FileText,
      document: FileText,
      spreadsheet: FileSpreadsheet,
      presentation: Presentation,
      image: ImageIcon,
      code: FileCode,
    }
    return icons[kind] || FileText
  }

  const getDocColor = (kind: FileKind) => {
    const colors: Record<string, string> = {
      pdf: 'text-peak-red bg-peak-red/15',
      document: 'text-peak-blue bg-peak-blue/15',
      spreadsheet: 'text-peak-green bg-peak-green/15',
      presentation: 'text-amber-300 bg-amber-400/15',
      image: 'text-peak-primary-300 bg-peak-primary/15',
      code: 'text-peak-primary-300 bg-peak-primary/15',
    }
    return colors[kind] || 'text-peak-blue bg-peak-blue/15'
  }

  const formatTime = (iso: string) => {
    const date = new Date(iso)
    const now = new Date(FIXED_TODAY)
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const kindFromName = (name: string): FileKind => {
    const ext = name.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'pdf'
    if (ext === 'xlsx' || ext === 'csv' || ext === 'xls') return 'spreadsheet'
    if (ext === 'pptx' || ext === 'ppt' || ext === 'key') return 'presentation'
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image'
    return 'document'
  }

  // Wire the upload input. In the demo we synthesize a Lisa-style analysis and
  // prepend it. A real backend call would POST to /api/files/upload-with-ai.
  // EXTERNAL: needs /api/files/upload-with-ai (Gemini file analysis) for true summaries.
  const handleUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setAnalyzing(true)
    const file = files[0]
    // Simulate the analysis returning on the next tick (no real network in demo).
    setTimeout(() => {
      const newDoc: AnalyzedDocument = {
        id: `upload-${file.name}-${file.size}`,
        name: file.name,
        kind: kindFromName(file.name),
        summary: `Lisa analyzed "${file.name}". This document has been added to your ${ACME_COMPANY} workspace and linked to relevant missions. Open it in Files for the full breakdown.`,
        keyPoints: ['Auto-summary generated', 'Indexed for search', 'Available to your team'],
        owner: 'Sarah Chen',
        analyzedAt: FIXED_TODAY,
        starred: false,
      }
      setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)])
      setAnalyzing(false)
    }, 600)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const toggleStar = (id: string) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, starred: !d.starred } : d)))
  }

  const removeDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    setOpenMenuId(null)
  }

  return (
    <div className="peak-os min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-peak-primary/15">
              <FileText className="h-7 w-7 text-peak-primary-300" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-peak">AI Document Analysis</h1>
              <p className="text-sm text-peak-muted">Lisa summaries and insights from your {ACME_COMPANY} documents</p>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={analyzing}
            className="flex items-center gap-2 rounded-xl bg-peak-primary px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_var(--peak-glow)] transition hover:bg-peak-primary-600 disabled:opacity-60"
          >
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {analyzing ? 'Analyzing…' : 'Analyze Document'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.pptx"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-peak-muted" />
          <input
            type="text"
            placeholder="Search analyzed documents…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-peak-border bg-white/[0.03] py-3 pl-12 pr-4 text-peak placeholder:text-peak-muted focus:border-peak-primary/50 focus:outline-none"
          />
        </div>

        {/* Documents */}
        {filteredDocs.length === 0 ? (
          <div className="peak-glass py-16 text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 text-peak-dim" />
            <p className="text-lg font-medium text-peak">No documents found</p>
            <p className="mt-2 text-sm text-peak-muted">Try a different search, or analyze a new document.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocs.map((doc) => {
              const Icon = getDocIcon(doc.kind)
              const colorClass = getDocColor(doc.kind)
              return (
                <div key={doc.id} className="peak-glass peak-glass-hover p-6 transition">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-peak">{doc.name}</h3>
                          <div className="mt-1 flex items-center gap-2">
                            <Bot className="h-3 w-3 text-peak-primary-300" />
                            <span className="text-xs text-peak-muted">
                              Analyzed {formatTime(doc.analyzedAt)} · {doc.owner}
                            </span>
                          </div>
                        </div>
                        <div className="relative flex items-center gap-1">
                          <button
                            onClick={() => toggleStar(doc.id)}
                            title={doc.starred ? 'Unstar' : 'Star'}
                            className="rounded-lg p-2 transition hover:bg-white/[0.06]"
                          >
                            <Star className={`h-4 w-4 ${doc.starred ? 'fill-current text-amber-300' : 'text-peak-muted'}`} />
                          </button>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                            title="More"
                            className="rounded-lg p-2 transition hover:bg-white/[0.06]"
                          >
                            <MoreVertical className="h-4 w-4 text-peak-muted" />
                          </button>
                          {openMenuId === doc.id && (
                            <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-peak-border bg-peak-2 py-1 shadow-xl">
                              <button
                                onClick={() => {
                                  setOpenMenuId(null)
                                  router.push('/files')
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-peak transition hover:bg-white/[0.06]"
                              >
                                <FileText className="h-4 w-4 text-peak-muted" /> Open in Files
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuId(null)
                                  router.push(`/lisa?prompt=${encodeURIComponent(`Summarize ${doc.name}`)}`)
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-peak transition hover:bg-white/[0.06]"
                              >
                                <Sparkles className="h-4 w-4 text-peak-primary-300" /> Ask Lisa
                              </button>
                              <button
                                onClick={() => removeDoc(doc.id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-peak-red transition hover:bg-peak-red/10"
                              >
                                <MoreVertical className="h-4 w-4" /> Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="mb-4 rounded-lg border border-peak-border bg-white/[0.02] p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-peak-muted" />
                          <span className="text-sm font-medium text-peak-muted">Summary</span>
                        </div>
                        <p className="text-sm text-peak">{doc.summary}</p>
                      </div>

                      {/* Key Points */}
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-peak-muted">Key Points</h4>
                        <ul className="space-y-1">
                          {doc.keyPoints.map((point, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-peak-muted">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-peak-primary-300" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
