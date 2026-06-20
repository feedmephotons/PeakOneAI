'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { useNotifications } from '@/components/notifications/NotificationProvider'
import { notifications, notify } from '@/lib/notifications'
import {
  Upload, FolderPlus, Search, Grid, List, Trash2, Share2, Download,
  MoreVertical, File, Image as ImageIcon, FileText, Video, Music, Archive,
  ChevronRight, Home, Star, Clock, HardDrive, Link2, Users,
  Eye, Edit3, Copy, Move, X, FolderOpen, ChevronDown, RotateCcw, Check
} from 'lucide-react'
import FileContextPanel from '@/components/files/FileContextPanel'
import { loadFiles, saveFiles, type StoredFile } from '@/components/files/fileStore'

// Pinned "now" for deterministic relative-time math (avoids hydration #418).
const PEAK_NOW = Date.parse('2026-06-18T09:00:00.000Z')

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  mimeType?: string
  size?: number
  url?: string
  thumbnailUrl?: string
  createdAt: Date
  modifiedAt: Date
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

interface BreadcrumbItem {
  id: string
  name: string
}

type SortKey = 'name' | 'modified' | 'size'

export default function FilesPage() {
  const { } = useNotifications()
  const [files, setFiles] = useState<FileItem[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [filterType, setFilterType] = useState<'all' | 'starred' | 'recent' | 'shared' | 'trash'>('all')
  const [sortBy, setSortBy] = useState<SortKey>('modified')
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileItem } | null>(null)
  const [selectedFileForContext, setSelectedFileForContext] = useState<FileItem | null>(null)
  const [showContextPanel] = useState(true)
  const [lastClickedId, setLastClickedId] = useState<string | null>(null)
  const [moveModal, setMoveModal] = useState<{ ids: string[] } | null>(null)

  const hydrate = (rows: StoredFile[]): FileItem[] =>
    rows.map((f) => ({
      ...f,
      createdAt: new Date(f.createdAt),
      modifiedAt: new Date(f.modifiedAt),
    }))

  // Load files from the shared canonical store (seeds from MOCK_FILES on first run).
  useEffect(() => {
    setFiles(hydrate(loadFiles()))
    setLoading(false)
  }, [])

  // Persist files to the shared store when changed (ISO strings, no blob URLs).
  useEffect(() => {
    if (loading) return
    const serialized: StoredFile[] = files.map((f) => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
      modifiedAt: f.modifiedAt.toISOString(),
    }))
    saveFiles(serialized)
  }, [files, loading])

  // Update breadcrumbs when folder changes
  useEffect(() => {
    const buildBreadcrumbs = () => {
      const crumbs: BreadcrumbItem[] = []
      let folderId = currentFolderId

      while (folderId) {
        const folder = files.find(f => f.id === folderId)
        if (folder) {
          crumbs.unshift({ id: folder.id, name: folder.name })
          folderId = folder.parentId || null
        } else {
          break
        }
      }

      setBreadcrumbs(crumbs)
    }

    buildBreadcrumbs()
  }, [currentFolderId, files])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const fileId = 'upload-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9)

      // For images, read a persistable data: URL so the thumbnail survives reload
      // (blob: URLs are revoked/invalid after a refresh — the store strips them).
      const readPreview = (): Promise<string | undefined> =>
        new Promise((resolve) => {
          if (!file.type.startsWith('image/')) return resolve(undefined)
          const reader = new FileReader()
          reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : undefined)
          reader.onerror = () => resolve(undefined)
          reader.readAsDataURL(file)
        })

      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[fileId] || 0
          if (current >= 100) {
            clearInterval(interval)

            void readPreview().then((dataUrl) => {
              const newFile: FileItem = {
                id: fileId,
                name: file.name,
                type: 'file',
                mimeType: file.type,
                size: file.size,
                createdAt: new Date(),
                modifiedAt: new Date(),
                parentId: currentFolderId,
                thumbnailUrl: dataUrl,
                version: 1,
                lastModifiedBy: 'Sarah Chen',
              }
              setFiles(prevFiles => [...prevFiles, newFile])
              notifications.file.uploadSuccess(file.name)
            })

            const rest = Object.fromEntries(
              Object.entries(prev).filter(([key]) => key !== fileId)
            )
            return rest
          }
          return { ...prev, [fileId]: Math.min(current + 10, 100) }
        })
      }, 100)
    })
  }, [currentFolderId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  })

  const handleFileClick = (file: FileItem, event?: React.MouseEvent) => {
    if (event?.ctrlKey || event?.metaKey) {
      // Multi-select with Ctrl/Cmd
      const newSelection = new Set(selectedFiles)
      if (newSelection.has(file.id)) {
        newSelection.delete(file.id)
      } else {
        newSelection.add(file.id)
      }
      setSelectedFiles(newSelection)
      setLastClickedId(file.id)
    } else if (event?.shiftKey && lastClickedId) {
      // Range select with Shift — select everything between the last click and here.
      const order = filteredFiles.map((f) => f.id)
      const a = order.indexOf(lastClickedId)
      const b = order.indexOf(file.id)
      if (a !== -1 && b !== -1) {
        const [start, end] = a < b ? [a, b] : [b, a]
        const range = order.slice(start, end + 1)
        const newSelection = new Set(selectedFiles)
        range.forEach((id) => newSelection.add(id))
        setSelectedFiles(newSelection)
      }
    } else {
      // Single select or open
      setLastClickedId(file.id)
      if (file.type === 'folder') {
        setCurrentFolderId(file.id)
        setSelectedFiles(new Set())
        setSelectedFileForContext(null)
      } else {
        setPreviewFile(file)
        setSelectedFileForContext(file)
      }
    }
  }

  const toggleSelect = (fileId: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev)
      if (next.has(fileId)) next.delete(fileId)
      else next.add(fileId)
      return next
    })
    setLastClickedId(fileId)
  }

  const moveFiles = (ids: string[], targetFolderId: string | null) => {
    setFiles(files.map((f) => (ids.includes(f.id) ? { ...f, parentId: targetFolderId, modifiedAt: new Date() } : f)))
    setMoveModal(null)
    setSelectedFiles(new Set())
    notify.success('Moved', `Moved ${ids.length} item(s)`)
  }

  const handleContextMenu = (event: React.MouseEvent, file: FileItem) => {
    event.preventDefault()
    setContextMenu({ x: event.clientX, y: event.clientY, file })
  }

  const handleDelete = (fileIds: string[]) => {
    // In Trash, "delete" is permanent; elsewhere it's a soft-delete (restorable).
    const permanent = filterType === 'trash'
    if (confirm(permanent ? `Permanently delete ${fileIds.length} item(s)?` : `Move ${fileIds.length} item(s) to Trash?`)) {
      const affected = files.filter(f => fileIds.includes(f.id))
      if (permanent) {
        setFiles(files.filter(f => !fileIds.includes(f.id)))
      } else {
        setFiles(files.map(f => fileIds.includes(f.id) ? { ...f, deleted: true } : f))
      }
      setSelectedFiles(new Set())
      affected.forEach(file => {
        notifications.file.deleteSuccess(file.name)
      })
    }
  }

  const handleRestore = (fileIds: string[]) => {
    setFiles(files.map(f => fileIds.includes(f.id) ? { ...f, deleted: false } : f))
    setSelectedFiles(new Set())
    notify.success('Restored', `Restored ${fileIds.length} item(s)`)
  }

  const handleShare = (file: FileItem) => {
    const link = `https://files.acmecorp.com/share/${file.id}`
    const updated = files.map(f =>
      f.id === file.id ? { ...f, isPublic: true, shareLink: link } : f
    )
    setFiles(updated)
    navigator.clipboard.writeText(link)
    notifications.file.shareSuccess(file.name)
    notifications.general.copied()
  }

  const handleStarToggle = (fileId: string) => {
    setFiles(files.map(f =>
      f.id === fileId ? { ...f, starred: !f.starred } : f
    ))
  }

  const handleRename = (fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (file) {
      const newName = prompt('Enter new name:', file.name)
      if (newName && newName !== file.name) {
        setFiles(files.map(f =>
          f.id === fileId ? { ...f, name: newName, modifiedAt: new Date() } : f
        ))
      }
    }
  }

  const handleCreateFolder = (name: string) => {
    const newFolder: FileItem = {
      id: Date.now().toString(),
      name,
      type: 'folder',
      createdAt: new Date(),
      modifiedAt: new Date(),
      parentId: currentFolderId,
    }
    setFiles([...files, newFolder])
    setIsCreateFolderOpen(false)
  }

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') return <FolderOpen className="w-5 h-5" />

    const mimeType = file.mimeType || ''
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5" />
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5" />
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5" />
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  // Filter and sort files
  const filteredFiles = files.filter(file => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.aiSummary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.aiTags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    // Trash ignores folder scoping (it's a flat list of everything deleted).
    if (filterType === 'trash') {
      return file.deleted === true && matchesSearch
    }

    // Every non-trash view hides soft-deleted files.
    if (file.deleted) return false

    const matchesFolder = currentFolderId ? file.parentId === currentFolderId : (file.parentId === null || file.parentId === undefined)

    let matchesFilter = true
    switch (filterType) {
      case 'starred':
        matchesFilter = file.starred === true
        break
      case 'recent': {
        const threeDaysAgo = PEAK_NOW - (3 * 24 * 60 * 60 * 1000)
        matchesFilter = file.modifiedAt.getTime() > threeDaysAgo
        break
      }
      case 'shared':
        matchesFilter = (file.sharedWith && file.sharedWith.length > 0) || file.isPublic === true
        break
    }

    return matchesSearch && matchesFolder && matchesFilter
  })

  // Sort files
  filteredFiles.sort((a, b) => {
    // Folders first
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1
    }

    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'modified':
        return b.modifiedAt.getTime() - a.modifiedAt.getTime()
      case 'size':
        return (b.size || 0) - (a.size || 0)
      default:
        return 0
    }
  })

  // Calculate storage usage — canonical 100 GB plan (matches /storage/files).
  const totalStorage = 100 * 1024 * 1024 * 1024 // 100 GB
  const usedStorage = files.filter(f => !f.deleted).reduce((sum, file) => sum + (file.size || 0), 0)
  const storagePercent = (usedStorage / totalStorage) * 100

  return (
    <div {...getRootProps()} className="text-peak">
      <input {...getInputProps()} />

      {/* Upload overlay */}
      {isDragActive && (
        <div className="fixed inset-0 z-50 bg-peak-primary/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-peak-glass border border-peak-border rounded-2xl shadow-2xl p-8 text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-peak-primary-300 animate-bounce" />
            <p className="text-xl font-semibold text-peak">Drop files to upload</p>
            <p className="text-peak-muted mt-2">Files will be uploaded to current folder</p>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-peak-glass border border-peak-border rounded-xl shadow-xl py-2 w-48 backdrop-blur-xl"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => {
                setPreviewFile(contextMenu.file)
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-sm text-peak-muted hover:bg-white/[0.04] hover:text-peak flex items-center gap-2"
            >
              <Eye className="w-4 h-4" /> Open
            </button>
            <button
              onClick={() => {
                handleRename(contextMenu.file.id)
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-sm text-peak-muted hover:bg-white/[0.04] hover:text-peak flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" /> Rename
            </button>
            <button
              onClick={() => {
                handleShare(contextMenu.file)
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-sm text-peak-muted hover:bg-white/[0.04] hover:text-peak flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button
              onClick={() => {
                handleStarToggle(contextMenu.file.id)
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-sm text-peak-muted hover:bg-white/[0.04] hover:text-peak flex items-center gap-2"
            >
              <Star className="w-4 h-4" /> {contextMenu.file.starred ? 'Unstar' : 'Star'}
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(contextMenu.file.name)
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-sm text-peak-muted hover:bg-white/[0.04] hover:text-peak flex items-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
            <button
              onClick={() => {
                setMoveModal({ ids: [contextMenu.file.id] })
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-sm text-peak-muted hover:bg-white/[0.04] hover:text-peak flex items-center gap-2"
            >
              <Move className="w-4 h-4" /> Move
            </button>
            <button
              onClick={() => {
                if (contextMenu.file.url) {
                  const link = document.createElement('a')
                  link.href = contextMenu.file.url
                  link.download = contextMenu.file.name
                  link.click()
                }
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-sm text-peak-muted hover:bg-white/[0.04] hover:text-peak flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download
            </button>
            <hr className="my-2 border-peak-border" />
            <button
              onClick={() => {
                handleDelete([contextMenu.file.id])
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-sm text-peak-red hover:bg-peak-red/10 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </>
      )}

      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-peak-glass border-r border-peak-border p-4">
          <label className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-peak-primary text-white rounded-xl hover:bg-peak-primary-600 transition mb-6 cursor-pointer shadow-peak-glow">
            <Upload className="w-4 h-4" />
            <span>Upload Files</span>
            <input
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  onDrop(Array.from(e.target.files))
                }
              }}
              className="hidden"
            />
          </label>

          <nav className="space-y-1">
            <button
              onClick={() => {
                setFilterType('all')
                setCurrentFolderId(null)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                filterType === 'all' && !currentFolderId
                  ? 'bg-peak-primary/20 text-peak-primary-300'
                  : 'text-peak-muted hover:bg-white/[0.04] hover:text-peak'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">All Files</span>
            </button>
            <button
              onClick={() => setFilterType('starred')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                filterType === 'starred'
                  ? 'bg-peak-primary/20 text-peak-primary-300'
                  : 'text-peak-muted hover:bg-white/[0.04] hover:text-peak'
              }`}
            >
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Starred</span>
            </button>
            <button
              onClick={() => setFilterType('recent')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                filterType === 'recent'
                  ? 'bg-peak-primary/20 text-peak-primary-300'
                  : 'text-peak-muted hover:bg-white/[0.04] hover:text-peak'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Recent</span>
            </button>
            <button
              onClick={() => setFilterType('shared')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                filterType === 'shared'
                  ? 'bg-peak-primary/20 text-peak-primary-300'
                  : 'text-peak-muted hover:bg-white/[0.04] hover:text-peak'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Shared</span>
            </button>
            <button
              onClick={() => setFilterType('trash')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                filterType === 'trash'
                  ? 'bg-peak-primary/20 text-peak-primary-300'
                  : 'text-peak-muted hover:bg-white/[0.04] hover:text-peak'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Trash</span>
            </button>
          </nav>

          {/* Storage indicator */}
          <div className="mt-8 p-3 bg-white/[0.04] border border-peak-border rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-peak-muted" />
              <span className="text-xs font-medium text-peak-muted">Storage</span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-2 mb-2">
              <div
                className="bg-peak-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.min(storagePercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-peak-muted">
              {formatFileSize(usedStorage)} of {formatFileSize(totalStorage)} used
            </p>
          </div>
        </div>

        {/* Main content with context panel */}
        <div className="flex-1 flex">
          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="bg-peak-glass border-b border-peak-border px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentFolderId(null)
                    setFilterType('all')
                  }}
                  className="text-peak-muted hover:text-peak"
                >
                  <Home className="w-4 h-4" />
                </button>
                {breadcrumbs.map((crumb) => (
                  <React.Fragment key={crumb.id}>
                    <ChevronRight className="w-4 h-4 text-peak-dim" />
                    <button
                      onClick={() => setCurrentFolderId(crumb.id)}
                      className="text-peak font-medium hover:text-peak-primary-300"
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {selectedFiles.size > 0 && (
                  <>
                    <span className="text-sm text-peak-muted">
                      {selectedFiles.size} selected
                    </span>
                    {filterType === 'trash' ? (
                      <button
                        onClick={() => handleRestore(Array.from(selectedFiles))}
                        className="p-2 text-peak-primary-300 hover:bg-peak-primary/10 rounded-lg transition"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setMoveModal({ ids: Array.from(selectedFiles) })}
                        className="p-2 text-peak-muted hover:bg-white/[0.04] hover:text-peak rounded-lg transition"
                        title="Move"
                      >
                        <Move className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(Array.from(selectedFiles))}
                      className="p-2 text-peak-red hover:bg-peak-red/10 rounded-lg transition"
                      title={filterType === 'trash' ? 'Delete permanently' : 'Move to Trash'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedFiles(new Set())}
                      className="p-2 text-peak-muted hover:bg-white/[0.04] hover:text-peak rounded-lg transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsCreateFolderOpen(true)}
                  className="p-2 text-peak-muted hover:bg-white/[0.04] hover:text-peak rounded-lg transition"
                  title="New folder"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setSortMenuOpen((o) => !o)}
                    className="p-2 text-peak-muted hover:bg-white/[0.04] hover:text-peak rounded-lg transition flex items-center gap-1"
                  >
                    <span className="text-sm">{sortBy === 'name' ? 'Name' : sortBy === 'modified' ? 'Modified' : 'Size'}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {sortMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setSortMenuOpen(false)} />
                      <div className="absolute right-0 mt-1 z-50 w-40 bg-peak-glass border border-peak-border rounded-xl shadow-xl py-1 backdrop-blur-xl">
                        {([
                          { key: 'name', label: 'Name' },
                          { key: 'modified', label: 'Modified' },
                          { key: 'size', label: 'Size' },
                        ] as { key: SortKey; label: string }[]).map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => { setSortBy(opt.key); setSortMenuOpen(false) }}
                            className="w-full px-4 py-2 text-left text-sm text-peak-muted hover:bg-white/[0.04] hover:text-peak flex items-center justify-between"
                          >
                            {opt.label}
                            {sortBy === opt.key && <Check className="w-4 h-4 text-peak-primary-300" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 text-peak-muted hover:bg-white/[0.04] hover:text-peak rounded-lg transition"
                  title={viewMode === 'grid' ? 'List view' : 'Grid view'}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-peak-dim" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/[0.04] border border-peak-border rounded-xl text-peak placeholder:text-peak-dim focus:outline-none focus:border-peak-primary/50"
              />
            </div>
          </div>

          {/* Files grid/list */}
          <div className="flex-1 p-6 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-peak-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-peak-muted">Loading files...</p>
                </div>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <FolderOpen className="w-16 h-16 text-peak-dim mb-4" />
                <p className="text-peak-muted mb-2">No files found</p>
                <p className="text-sm text-peak-dim">
                  Drop files here or click upload to get started
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredFiles.map(file => (
                  <div
                    key={file.id}
                    onClick={(e) => handleFileClick(file, e)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                    className={`group cursor-pointer ${
                      selectedFiles.has(file.id) ? 'ring-2 ring-peak-primary rounded-2xl' : ''
                    }`}
                  >
                    <div className="bg-peak-glass rounded-2xl p-3 hover:bg-white/[0.04] transition border border-peak-border flex items-center gap-3">
                      {/* Icon/Thumbnail */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        file.type === 'folder' ? 'bg-peak-primary/15' : 'bg-white/[0.04]'
                      }`}>
                        {file.thumbnailUrl ? (
                          <Image src={file.thumbnailUrl} alt={file.name} className="w-full h-full object-cover rounded-xl" width={40} height={40} />
                        ) : (
                          <div className={`${
                            file.type === 'folder' ? 'text-peak-primary-300' : 'text-peak-dim'
                          }`}>
                            {getFileIcon(file)}
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-peak truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-peak-muted">
                          {file.type === 'folder' ? 'Folder' : formatFileSize(file.size)}
                          {file.sharedWith && file.sharedWith.length > 0 && (
                            <span className="ml-2 inline-flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {file.sharedWith.length}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Status Icons */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {file.starred && (
                          <Star className="w-4 h-4 text-peak-amber fill-current" />
                        )}
                        {file.isPublic && (
                          <Link2 className="w-4 h-4 text-peak-primary-300" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-peak-border">
                    <th className="text-left py-2 px-4 text-xs font-medium uppercase tracking-wider text-peak-muted">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFiles(new Set(filteredFiles.map(f => f.id)))
                          } else {
                            setSelectedFiles(new Set())
                          }
                        }}
                        checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                        className="accent-peak-primary"
                      />
                    </th>
                    <th className="text-left py-2 px-4 text-xs font-medium uppercase tracking-wider text-peak-muted">Name</th>
                    <th className="text-left py-2 px-4 text-xs font-medium uppercase tracking-wider text-peak-muted">Modified</th>
                    <th className="text-left py-2 px-4 text-xs font-medium uppercase tracking-wider text-peak-muted">Size</th>
                    <th className="text-left py-2 px-4 text-xs font-medium uppercase tracking-wider text-peak-muted">Shared</th>
                    <th className="text-left py-2 px-4 text-xs font-medium uppercase tracking-wider text-peak-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map(file => (
                    <tr
                      key={file.id}
                      onClick={(e) => handleFileClick(file, e)}
                      onContextMenu={(e) => handleContextMenu(e, file)}
                      className={`border-b border-peak-border hover:bg-white/[0.04] cursor-pointer ${
                        selectedFiles.has(file.id) ? 'bg-peak-primary/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.id)}
                          onChange={() => toggleSelect(file.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="accent-peak-primary"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`${file.type === 'folder' ? 'text-peak-primary-300' : 'text-peak-dim'}`}>
                            {getFileIcon(file)}
                          </div>
                          <div>
                            <p className="text-sm text-peak flex items-center gap-2">
                              {file.name}
                              {file.starred && <Star className="w-3 h-3 text-peak-amber fill-current" />}
                              {file.isPublic && <Link2 className="w-3 h-3 text-peak-primary-300" />}
                            </p>
                            {file.aiSummary && (
                              <p className="text-xs text-peak-muted mt-0.5">
                                {file.aiSummary.substring(0, 50)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-peak-muted">
                        {file.modifiedAt.toLocaleDateString('en-US', { timeZone: 'UTC' })}
                      </td>
                      <td className="py-3 px-4 text-sm text-peak-muted">
                        {file.type === 'folder' ? '-' : formatFileSize(file.size)}
                      </td>
                      <td className="py-3 px-4">
                        {file.sharedWith && file.sharedWith.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-peak-dim" />
                            <span className="text-sm text-peak-muted">
                              {file.sharedWith.length}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-peak-dim">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShare(file)
                            }}
                            className="p-1 hover:bg-white/[0.04] rounded"
                          >
                            <Share2 className="w-4 h-4 text-peak-dim" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStarToggle(file.id)
                            }}
                            className="p-1 hover:bg-white/[0.04] rounded"
                          >
                            <Star className={`w-4 h-4 ${file.starred ? 'text-peak-amber fill-current' : 'text-peak-dim'}`} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleContextMenu(e, file)
                            }}
                            className="p-1 hover:bg-white/[0.04] rounded"
                          >
                            <MoreVertical className="w-4 h-4 text-peak-dim" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Upload progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="fixed bottom-4 right-4 bg-peak-glass rounded-2xl shadow-xl p-4 w-80 border border-peak-border backdrop-blur-xl">
                <h3 className="font-medium text-peak mb-3">Uploading files</h3>
                {Object.entries(uploadProgress).map(([id, progress]) => (
                  <div key={id} className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-peak-muted">File {id.substring(0, 8)}...</span>
                      <span className="text-peak-muted">{progress}%</span>
                    </div>
                    <div className="w-full bg-white/[0.06] rounded-full h-2">
                      <div
                        className="bg-peak-primary h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>

          {/* File Context Panel Sidebar */}
          {showContextPanel && (
            <div className="hidden xl:block w-96 flex-shrink-0 border-l border-peak-border">
              <div className="sticky top-0 h-screen overflow-y-auto bg-peak-glass p-6">
                <FileContextPanel file={selectedFileForContext || undefined} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Move Modal — pick a destination folder (replaces the raw prompt) */}
      {moveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-peak-glass border border-peak-border rounded-2xl shadow-2xl w-full max-w-md p-6 backdrop-blur-xl">
            <h3 className="text-xl font-semibold text-peak mb-4">
              Move {moveModal.ids.length} item{moveModal.ids.length > 1 ? 's' : ''}
            </h3>
            <div className="space-y-1 max-h-64 overflow-auto mb-4">
              <button
                onClick={() => moveFiles(moveModal.ids, null)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-peak-muted hover:bg-white/[0.04] hover:text-peak transition"
              >
                <Home className="w-4 h-4" /> All Files (root)
              </button>
              {files
                .filter((f) => f.type === 'folder' && !f.deleted && !moveModal.ids.includes(f.id))
                .map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => moveFiles(moveModal.ids, folder.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-peak-muted hover:bg-white/[0.04] hover:text-peak transition"
                  >
                    <FolderOpen className="w-4 h-4 text-peak-primary-300" /> {folder.name}
                  </button>
                ))}
              {files.filter((f) => f.type === 'folder' && !f.deleted && !moveModal.ids.includes(f.id)).length === 0 && (
                <p className="text-sm text-peak-dim px-3 py-2">No other folders. Create one first.</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setMoveModal(null)}
                className="px-6 py-2 border border-peak-border text-peak-muted rounded-xl hover:bg-white/[0.04] hover:text-peak transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {isCreateFolderOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-peak-glass border border-peak-border rounded-2xl shadow-2xl w-full max-w-md p-6 backdrop-blur-xl">
            <h3 className="text-xl font-semibold text-peak mb-4">
              Create New Folder
            </h3>
            <input
              type="text"
              placeholder="Folder name"
              className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border rounded-xl text-peak placeholder:text-peak-dim focus:outline-none focus:border-peak-primary/50 mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement
                  if (input.value.trim()) {
                    handleCreateFolder(input.value.trim())
                  }
                }
              }}
              autoFocus
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsCreateFolderOpen(false)}
                className="px-6 py-2 border border-peak-border text-peak-muted rounded-xl hover:bg-white/[0.04] hover:text-peak transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement
                  if (input?.value.trim()) {
                    handleCreateFolder(input.value.trim())
                  }
                }}
                className="px-6 py-2 bg-peak-primary text-white rounded-xl hover:bg-peak-primary-600 transition shadow-peak-glow"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-peak-glass border border-peak-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden backdrop-blur-xl">
            <div className="flex items-center justify-between p-4 border-b border-peak-border">
              <div>
                <h3 className="text-lg font-semibold text-peak">{previewFile.name}</h3>
                <p className="text-sm text-peak-muted">
                  {formatFileSize(previewFile.size)} • Modified {previewFile.modifiedAt.toLocaleDateString('en-US', { timeZone: 'UTC' })}
                </p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 text-peak-muted hover:bg-white/[0.04] hover:text-peak rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 overflow-auto max-h-[calc(90vh-80px)]">
              {previewFile.thumbnailUrl || previewFile.mimeType?.startsWith('image/') ? (
                <div className="relative w-full min-h-[400px]">
                  <Image
                    src={previewFile.thumbnailUrl || previewFile.url || ''}
                    alt={previewFile.name}
                    className="max-w-full mx-auto rounded-lg"
                    width={800}
                    height={600}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-white/[0.04] border border-peak-border rounded-full flex items-center justify-center mx-auto mb-4 text-peak-dim">
                    {getFileIcon(previewFile)}
                  </div>
                  <p className="text-peak-muted mb-4">Preview not available</p>
                  {previewFile.aiSummary && (
                    <div className="bg-white/[0.04] border border-peak-border rounded-2xl p-4 text-left max-w-2xl mx-auto">
                      <h4 className="text-sm font-semibold text-peak mb-2">Summary</h4>
                      <p className="text-sm text-peak-muted">{previewFile.aiSummary}</p>
                      {previewFile.aiTags && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {previewFile.aiTags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-peak-primary/15 text-peak-primary-300 text-xs rounded-full ring-1 ring-peak-primary/20">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-3 mt-6">
                    <button
                      onClick={() => {
                        if (previewFile.url) {
                          const link = document.createElement('a')
                          link.href = previewFile.url
                          link.download = previewFile.name
                          link.click()
                        }
                      }}
                      className="px-4 py-2 bg-peak-primary text-white rounded-xl hover:bg-peak-primary-600 transition flex items-center gap-2 shadow-peak-glow"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleShare(previewFile)}
                      className="px-4 py-2 border border-peak-border text-peak-muted rounded-xl hover:bg-white/[0.04] hover:text-peak transition flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}