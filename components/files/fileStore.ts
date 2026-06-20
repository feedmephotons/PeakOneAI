'use client'

/**
 * Shared file-manager store used by /files and /files/upload so the two pages
 * read and write the SAME localStorage record ('fileManager').
 *
 * Seeds from the canonical Acme Corp MOCK_FILES fixture (real owners, mission
 * links, inline SVG thumbnails — never a dead remote host). Deterministic.
 */

import { MOCK_FILES } from '@/lib/peak/mock'
import type { FileItem as PeakFileItem } from '@/lib/peak/types'

export const FILE_STORE_KEY = 'fileManager'

/** UI-facing file row. Dates are ISO strings on disk, rehydrated to Date in the page. */
export interface StoredFile {
  id: string
  name: string
  type: 'file' | 'folder'
  mimeType?: string
  size?: number
  url?: string
  thumbnailUrl?: string
  createdAt: string
  modifiedAt: string
  starred?: boolean
  sharedWith?: string[]
  parentId?: string | null
  aiSummary?: string
  aiTags?: string[]
  isPublic?: boolean
  shareLink?: string
  permissions?: 'view' | 'edit' | 'admin'
  version?: number
  lastModifiedBy?: string
  deleted?: boolean
  missionId?: string | null
}

const KIND_MIME: Record<string, string> = {
  document: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  spreadsheet: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  presentation: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  pdf: 'application/pdf',
  image: 'image/png',
  folder: 'application/x-directory',
  other: 'application/octet-stream',
}

function peakToStored(f: PeakFileItem): StoredFile {
  return {
    id: f.id,
    name: f.name,
    type: f.kind === 'folder' ? 'folder' : 'file',
    mimeType: f.mimeType || KIND_MIME[f.kind] || 'application/octet-stream',
    size: f.size,
    // Canonical files are demo records; no downloadable blob, the inline SVG is the preview.
    thumbnailUrl: f.thumbnailDataUri || undefined,
    createdAt: f.createdAt,
    modifiedAt: f.updatedAt,
    starred: f.starred,
    sharedWith: f.missionId ? [`${f.owner.name}`] : undefined,
    parentId: f.folderId || null,
    aiSummary: f.aiSummary || undefined,
    aiTags: f.aiTags,
    deleted: !!f.deleted,
    missionId: f.missionId || null,
    lastModifiedBy: f.owner.name,
    version: 1,
  }
}

/** The canonical seed set, mapped into the page's StoredFile shape. */
export function seedFiles(): StoredFile[] {
  return MOCK_FILES.map(peakToStored)
}

/** Read the store, seeding it on first access. SSR-safe (returns [] off-window). */
export function loadFiles(): StoredFile[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(FILE_STORE_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as StoredFile[]
      // Drop any legacy blob: URLs persisted by older builds (invalid after reload).
      return parsed.map((f) => ({
        ...f,
        url: f.url?.startsWith('blob:') ? undefined : f.url,
        thumbnailUrl: f.thumbnailUrl?.startsWith('blob:') ? undefined : f.thumbnailUrl,
      }))
    } catch {
      // fall through to reseed
    }
  }
  const seeded = seedFiles()
  window.localStorage.setItem(FILE_STORE_KEY, JSON.stringify(seeded))
  return seeded
}

export function saveFiles(files: StoredFile[]): void {
  if (typeof window === 'undefined') return
  // Never persist blob: URLs — they are invalid after a reload.
  const safe = files.map((f) => ({
    ...f,
    url: f.url?.startsWith('blob:') ? undefined : f.url,
    thumbnailUrl: f.thumbnailUrl?.startsWith('blob:') ? undefined : f.thumbnailUrl,
  }))
  window.localStorage.setItem(FILE_STORE_KEY, JSON.stringify(safe))
}

/** Append a freshly-uploaded file (used by /files/upload to feed /files). */
export function appendFile(file: StoredFile): void {
  const current = loadFiles()
  saveFiles([...current, file])
}
