'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { useNotifications } from '@/components/notifications/NotificationProvider'
import { notifications } from '@/lib/notifications'
import {
  Upload, FolderPlus, Search, Grid, List, Trash2, Share2, Download,
  MoreVertical, File, Image as ImageIcon, FileText, Video, Music, Archive,
  ChevronRight, Home, Star, Clock, HardDrive, Link2, Users,
  Eye, Edit3, Copy, Move, X, FolderOpen, ChevronDown
} from 'lucide-react'
import FileContextPanel from '@/components/files/FileContextPanel'

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
}

interface BreadcrumbItem {
  id: string
  name: string
}

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
  const [sortBy] = useState<'name' | 'modified' | 'size'>('modified')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileItem } | null>(null)
  const [selectedFileForContext, setSelectedFileForContext] = useState<FileItem | null>(null)
  const [showContextPanel, setShowContextPanel] = useState(true)

  // Load files from localStorage
  useEffect(() => {
    const savedFiles = localStorage.getItem('fileManager')
    if (savedFiles) {
      const parsed = JSON.parse(savedFiles)
      setFiles(parsed.map((f: FileItem) => ({
        ...f,
        createdAt: new Date(f.createdAt),
        modifiedAt: new Date(f.modifiedAt)
      })))
    } else {
      // Initialize with sample files
      const mockFiles: FileItem[] = [
        {
          id: '1',
          name: 'Project Documents',
          type: 'folder',
          createdAt: new Date(Date.now() - 86400000 * 5),
          modifiedAt: new Date(Date.now() - 86400000),
          parentId: null,
        },
        {
          id: '2',
          name: 'Q4 Sales Report.pdf',
          type: 'file',
          mimeType: 'application/pdf',
          size: 2457600,
          url: '/files/report.pdf',
          createdAt: new Date(Date.now() - 86400000 * 2),
          modifiedAt: new Date(Date.now() - 86400000),
          starred: true,
          aiSummary: 'Quarterly sales report showing 23% YoY growth with detailed analysis of regional performance',
          aiTags: ['sales', 'q4', 'report', 'finance'],
          parentId: null,
          version: 3,
          lastModifiedBy: 'John Doe'
        },
        {
          id: '3',
          name: 'Product Screenshots',
          type: 'folder',
          createdAt: new Date(Date.now() - 86400000 * 10),
          modifiedAt: new Date(Date.now() - 86400000 * 3),
          starred: true,
          parentId: null,
        },
        {
          id: '4',
          name: 'Dashboard.png',
          type: 'file',
          mimeType: 'image/png',
          size: 1843200,
          url: '/files/dashboard.png',
          thumbnailUrl: 'https://via.placeholder.com/300x200',
          createdAt: new Date(Date.now() - 86400000 * 3),
          modifiedAt: new Date(Date.now() - 86400000 * 2),
          parentId: '3',
          sharedWith: ['team@example.com'],
          isPublic: true,
          shareLink: 'https://files.saasx.com/share/abc123'
        },
        {
          id: '5',
          name: 'Marketing Assets',
          type: 'folder',
          createdAt: new Date(Date.now() - 86400000 * 15),
          modifiedAt: new Date(Date.now() - 86400000 * 4),
          parentId: null,
        },
        {
          id: '6',
          name: 'Presentation.pptx',
          type: 'file',
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          size: 5242880,
          url: '/files/presentation.pptx',
          createdAt: new Date(Date.now() - 86400000),
          modifiedAt: new Date(Date.now() - 3600000),
          sharedWith: ['john@example.com', 'sarah@example.com'],
          parentId: '1',
          permissions: 'edit',
          version: 2
        },
        {
          id: '7',
          name: 'Budget 2025.xlsx',
          type: 'file',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 1048576,
          url: '/files/budget.xlsx',
          createdAt: new Date(Date.now() - 86400000 * 7),
          modifiedAt: new Date(Date.now() - 86400000 * 5),
          parentId: '1',
          permissions: 'view',
          aiSummary: 'Annual budget planning document with departmental allocations',
          aiTags: ['finance', 'budget', '2025']
        }
      ]
      setFiles(mockFiles)
      localStorage.setItem('fileManager', JSON.stringify(mockFiles))
    }
    setLoading(false)
  }, [])

  // Save files to localStorage when changed
  useEffect(() => {
    if (files.length > 0) {
      localStorage.setItem('fileManager', JSON.stringify(files))
    }
  }, [files])

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
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9)

      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[fileId] || 0
          if (current >= 100) {
            clearInterval(interval)

            const newFile: FileItem = {
              id: fileId,
              name: file.name,
              type: 'file',
              mimeType: file.type,
              size: file.size,
              createdAt: new Date(),
              modifiedAt: new Date(),
              parentId: currentFolderId,
              url: URL.createObjectURL(file),
              thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
              version: 1,
              lastModifiedBy: 'You'
            }

            setFiles(prevFiles => [...prevFiles, newFile])
            notifications.file.uploadSuccess(file.name)

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
    } else if (event?.shiftKey && selectedFiles.size > 0) {
      // Range select with Shift
      // Implementation would go here
    } else {
      // Single select or open
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

  const handleContextMenu = (event: React.MouseEvent, file: FileItem) => {
    event.preventDefault()
    setContextMenu({ x: event.clientX, y: event.clientY, file })
  }

  const handleDelete = (fileIds: string[]) => {
    if (confirm(`Delete ${fileIds.length} item(s)?`)) {
      const deletedFiles = files.filter(f => fileIds.includes(f.id))
      setFiles(files.filter(f => !fileIds.includes(f.id)))
      setSelectedFiles(new Set())
      deletedFiles.forEach(file => {
        notifications.file.deleteSuccess(file.name)
      })
    }
  }

  const handleShare = (file: FileItem) => {
    const link = `https://files.saasx.com/share/${file.id}`
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
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFolder = currentFolderId ? file.parentId === currentFolderId : file.parentId === null

    let matchesFilter = true
    switch (filterType) {
      case 'starred':
        matchesFilter = file.starred === true
        break
      case 'recent':
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
        matchesFilter = file.modifiedAt.getTime() > threeDaysAgo
        break
      case 'shared':
        matchesFilter = (file.sharedWith && file.sharedWith.length > 0) || file.isPublic === true
        break
      case 'trash':
        matchesFilter = false // Would need a trash flag
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

  // Calculate storage usage
  const totalStorage = 10 * 1024 * 1024 * 1024 // 10 GB
  const usedStorage = files.reduce((sum, file) => sum + (file.size || 0), 0)
  const storagePercent = (usedStorage / totalStorage) * 100

  return (
    <div {...getRootProps()} className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <input {...getInputProps()} />

      {/* Upload overlay */}
      {isDragActive && (
        <div className="fixed inset-0 z-50 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-bounce" />
            <p className="text-xl font-semibold text-gray-900 dark:text-white">Drop files to upload</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Files will be uploaded to current folder</p>
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
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 w-48"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => {
                setPreviewFile(contextMenu.file)
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" /> Open
            </button>
            <button
              onClick={() => {
                handleRename(contextMenu.file.id)
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" /> Rename
            </button>
            <button
              onClick={() => {
                handleShare(contextMenu.file)
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button
              onClick={() => {
                handleStarToggle(contextMenu.file.id)
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Star className="w-4 h-4" /> {contextMenu.file.starred ? 'Unstar' : 'Star'}
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(contextMenu.file.name)
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
            <button
              onClick={() => {
                const targetFolderId = prompt('Enter folder ID to move to (or leave empty for root):')
                const updated = files.map(f =>
                  f.id === contextMenu.file.id ? { ...f, parentId: targetFolderId || null } : f
                )
                setFiles(updated)
                setContextMenu(null)
                notifications.general.success('File moved successfully')
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
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
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download
            </button>
            <hr className="my-2 border-gray-200 dark:border-gray-700" />
            <button
              onClick={() => {
                handleDelete([contextMenu.file.id])
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </>
      )}

      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
          <label className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition mb-6 cursor-pointer">
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
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">All Files</span>
            </button>
            <button
              onClick={() => setFilterType('starred')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                filterType === 'starred'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Starred</span>
            </button>
            <button
              onClick={() => setFilterType('recent')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                filterType === 'recent'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Recent</span>
            </button>
            <button
              onClick={() => setFilterType('shared')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                filterType === 'shared'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Shared</span>
            </button>
            <button
              onClick={() => setFilterType('trash')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                filterType === 'trash'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Trash</span>
            </button>
          </nav>

          {/* Storage indicator */}
          <div className="mt-8 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Storage</span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(storagePercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {formatFileSize(usedStorage)} of {formatFileSize(totalStorage)} used
            </p>
          </div>
        </div>

        {/* Main content with context panel */}
        <div className="flex-1 flex">
          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentFolderId(null)
                    setFilterType('all')
                  }}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <Home className="w-4 h-4" />
                </button>
                {breadcrumbs.map((crumb) => (
                  <React.Fragment key={crumb.id}>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <button
                      onClick={() => setCurrentFolderId(crumb.id)}
                      className="text-gray-900 dark:text-white font-medium hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {selectedFiles.size > 0 && (
                  <>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedFiles.size} selected
                    </span>
                    <button
                      onClick={() => handleDelete(Array.from(selectedFiles))}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedFiles(new Set())}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsCreateFolderOpen(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  title="New folder"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
                <div className="relative">
                  <button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-1"
                  >
                    <span className="text-sm">{sortBy === 'name' ? 'Name' : sortBy === 'modified' ? 'Modified' : 'Size'}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  title={viewMode === 'grid' ? 'List view' : 'Grid view'}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Files grid/list */}
          <div className="flex-1 p-6 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading files...</p>
                </div>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">No files found</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Drop files here or click upload to get started
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredFiles.map(file => (
                  <div
                    key={file.id}
                    onClick={(e) => handleFileClick(file, e)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                    className={`group cursor-pointer ${
                      selectedFiles.has(file.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition border border-gray-200 dark:border-gray-700 relative">
                      {file.starred && (
                        <Star className="absolute top-2 right-2 w-4 h-4 text-yellow-500 fill-current" />
                      )}
                      {file.isPublic && (
                        <Link2 className="absolute top-2 left-2 w-4 h-4 text-blue-500" />
                      )}
                      <div className={`w-full h-32 mb-3 rounded flex items-center justify-center ${
                        file.type === 'folder' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-700'
                      }`}>
                        {file.thumbnailUrl ? (
                          <Image src={file.thumbnailUrl} alt={file.name} className="w-full h-full object-cover rounded" width={300} height={200} />
                        ) : (
                          <div className={`${
                            file.type === 'folder' ? 'text-blue-500' : 'text-gray-400'
                          }`}>
                            {getFileIcon(file)}
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {file.type === 'folder' ? 'Folder' : formatFileSize(file.size)}
                      </p>
                      {file.sharedWith && file.sharedWith.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{file.sharedWith.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      />
                    </th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Modified</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Size</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Shared</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map(file => (
                    <tr
                      key={file.id}
                      onClick={(e) => handleFileClick(file, e)}
                      onContextMenu={(e) => handleContextMenu(e, file)}
                      className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                        selectedFiles.has(file.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.id)}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`${file.type === 'folder' ? 'text-blue-500' : 'text-gray-400'}`}>
                            {getFileIcon(file)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                              {file.name}
                              {file.starred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                              {file.isPublic && <Link2 className="w-3 h-3 text-blue-500" />}
                            </p>
                            {file.aiSummary && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {file.aiSummary.substring(0, 50)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {file.modifiedAt.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {file.type === 'folder' ? '-' : formatFileSize(file.size)}
                      </td>
                      <td className="py-3 px-4">
                        {file.sharedWith && file.sharedWith.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {file.sharedWith.length}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShare(file)
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <Share2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStarToggle(file.id)
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <Star className={`w-4 h-4 ${file.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleContextMenu(e, file)
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
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
              <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-80 border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Uploading files</h3>
                {Object.entries(uploadProgress).map(([id, progress]) => (
                  <div key={id} className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">File {id.substring(0, 8)}...</span>
                      <span className="text-gray-600 dark:text-gray-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
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
            <div className="hidden xl:block w-96 flex-shrink-0 border-l border-gray-200 dark:border-gray-700">
              <div className="sticky top-0 h-screen overflow-y-auto bg-white dark:bg-gray-900 p-6">
                <FileContextPanel file={selectedFileForContext || undefined} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {isCreateFolderOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create New Folder
            </h3>
            <input
              type="text"
              placeholder="Folder name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white mb-4"
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
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
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
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{previewFile.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(previewFile.size)} • Modified {previewFile.modifiedAt.toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
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
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    {getFileIcon(previewFile)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Preview not available</p>
                  {previewFile.aiSummary && (
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-left max-w-2xl mx-auto">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">AI Summary</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{previewFile.aiSummary}</p>
                      {previewFile.aiTags && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {previewFile.aiTags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
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
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleShare(previewFile)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
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

import React from 'react'