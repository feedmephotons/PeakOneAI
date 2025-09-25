'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Upload, FolderPlus, Search, Grid, List, Trash2, Share2,
  MoreHorizontal, File, Image as ImageIcon, FileText, Video, Music, Archive,
  ChevronRight, Home, Star, Clock, HardDrive
} from 'lucide-react'
import FilePreview from '@/components/files/FilePreview'
import CreateFolderModal from '@/components/files/CreateFolderModal'

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
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    // Load mock files
    setTimeout(() => {
      const mockFiles: FileItem[] = [
        {
          id: '1',
          name: 'Project Documents',
          type: 'folder',
          createdAt: new Date(Date.now() - 86400000 * 5),
          modifiedAt: new Date(Date.now() - 86400000),
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
          aiSummary: 'Quarterly sales report showing 23% YoY growth',
          aiTags: ['sales', 'q4', 'report'],
        },
        {
          id: '3',
          name: 'Product Screenshot.png',
          type: 'file',
          mimeType: 'image/png',
          size: 1843200,
          url: '/files/screenshot.png',
          thumbnailUrl: 'https://via.placeholder.com/200',
          createdAt: new Date(Date.now() - 86400000 * 3),
          modifiedAt: new Date(Date.now() - 86400000 * 2),
        },
        {
          id: '4',
          name: 'Marketing Assets',
          type: 'folder',
          createdAt: new Date(Date.now() - 86400000 * 10),
          modifiedAt: new Date(Date.now() - 86400000 * 3),
          starred: true,
        },
        {
          id: '5',
          name: 'Presentation.pptx',
          type: 'file',
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          size: 5242880,
          url: '/files/presentation.pptx',
          createdAt: new Date(Date.now() - 86400000),
          modifiedAt: new Date(Date.now() - 3600000),
          sharedWith: ['john@example.com', 'sarah@example.com'],
        },
      ]
      setFiles(mockFiles)
      setLoading(false)
    }, 500)
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9)

      // Start upload progress
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[fileId] || 0
          if (current >= 100) {
            clearInterval(interval)
            // Add file to list
            const newFile: FileItem = {
              id: fileId,
              name: file.name,
              type: 'file',
              mimeType: file.type,
              size: file.size,
              createdAt: new Date(),
              modifiedAt: new Date(),
              parentId: currentPath[currentPath.length - 1] || null,
            }
            setFiles(prevFiles => [...prevFiles, newFile])
            // Clean up progress
            const rest = Object.fromEntries(
              Object.entries(prev).filter(([key]) => key !== fileId)
            )
            return rest
          }
          return { ...prev, [fileId]: Math.min(current + 20, 100) }
        })
      }, 200)
    })
  }, [currentPath])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  })

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') return <FolderPlus className="w-5 h-5" />

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

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath([...currentPath, file.id])
    } else {
      setPreviewFile(file)
    }
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPath = !currentPath.length || file.parentId === currentPath[currentPath.length - 1]
    return matchesSearch && matchesPath
  })

  return (
    <div {...getRootProps()} className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <input {...getInputProps()} />

      {/* Upload overlay */}
      {isDragActive && (
        <div className="fixed inset-0 z-50 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <p className="text-xl font-semibold text-gray-900 dark:text-white">Drop files to upload</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Files will be uploaded to current folder</p>
          </div>
        </div>
      )}

      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition mb-6">
            <Upload className="w-4 h-4" />
            Upload Files
          </button>

          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">All Files</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Starred</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Recent</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Shared</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
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
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: '35%' }}></div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">3.5 GB of 10 GB used</p>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <Home className="w-4 h-4" />
                </button>
                {currentPath.length > 0 && (
                  <>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-medium">Folder Name</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreateFolderOpen(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
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
                <div className="text-gray-500">Loading files...</div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredFiles.map(file => (
                  <div
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className="group cursor-pointer"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition border border-gray-200 dark:border-gray-700">
                      <div className={`w-full h-32 mb-3 rounded flex items-center justify-center ${
                        file.type === 'folder' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-700'
                      }`}>
                        {file.thumbnailUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={file.thumbnailUrl} alt={file.name} className="w-full h-full object-cover rounded" />
                        ) : (
                          <div className={`${
                            file.type === 'folder' ? 'text-blue-500' : 'text-gray-400'
                          }`}>
                            {getFileIcon(file)}
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {file.type === 'folder' ? 'Folder' : formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Modified</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Size</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map(file => (
                    <tr
                      key={file.id}
                      onClick={() => handleFileClick(file)}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`${file.type === 'folder' ? 'text-blue-500' : 'text-gray-400'}`}>
                            {getFileIcon(file)}
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{file.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {file.modifiedAt.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {file.type === 'folder' ? '-' : formatFileSize(file.size)}
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
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
      </div>

      {/* Modals */}
      {isCreateFolderOpen && (
        <CreateFolderModal
          onClose={() => setIsCreateFolderOpen(false)}
          onCreate={(name) => {
            const newFolder: FileItem = {
              id: Date.now().toString(),
              name,
              type: 'folder',
              createdAt: new Date(),
              modifiedAt: new Date(),
              parentId: currentPath[currentPath.length - 1] || null,
            }
            setFiles([...files, newFolder])
            setIsCreateFolderOpen(false)
          }}
        />
      )}

      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  )
}