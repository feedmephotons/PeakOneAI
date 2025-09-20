"use client";

import React, { useState } from 'react';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified: string;
  icon: string;
  shared?: boolean;
  starred?: boolean;
  tags?: string[];
  owner?: string;
  fileType?: string;
}

interface ViewMode {
  type: 'grid' | 'list';
  icon: React.ReactNode;
}

export default function FilesPage() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const files: FileItem[] = [
    { id: '1', name: 'Q4 Reports', type: 'folder', modified: '2 hours ago', icon: '📁', shared: true, tags: ['Reports', 'Q4'] },
    { id: '2', name: 'Team Photos', type: 'folder', modified: '1 day ago', icon: '📁', starred: true, tags: ['Media'] },
    { id: '3', name: 'Client Presentations', type: 'folder', modified: '3 days ago', icon: '📁', shared: true, tags: ['Client'] },
    { id: '4', name: 'Product Designs', type: 'folder', modified: '1 week ago', icon: '📁', tags: ['Design'] },
    { id: '5', name: 'Financial Report Q4.pdf', type: 'file', size: '2.4 MB', modified: '2 hours ago', icon: '📄', fileType: 'PDF', shared: true, tags: ['Finance', 'Q4'] },
    { id: '6', name: 'Marketing Strategy.pptx', type: 'file', size: '8.7 MB', modified: '5 hours ago', icon: '📊', fileType: 'PowerPoint', starred: true, tags: ['Marketing'] },
    { id: '7', name: 'Team Meeting Recording.mp4', type: 'file', size: '124 MB', modified: '1 day ago', icon: '🎬', fileType: 'Video', tags: ['Meeting', 'Recording'] },
    { id: '8', name: 'Budget 2025.xlsx', type: 'file', size: '456 KB', modified: '2 days ago', icon: '📈', fileType: 'Excel', tags: ['Finance', 'Budget'] },
    { id: '9', name: 'Product Roadmap.pdf', type: 'file', size: '3.2 MB', modified: '3 days ago', icon: '📄', fileType: 'PDF', shared: true, tags: ['Product'] },
    { id: '10', name: 'Brand Guidelines.sketch', type: 'file', size: '45 MB', modified: '1 week ago', icon: '🎨', fileType: 'Sketch', tags: ['Design', 'Brand'] },
  ];

  const recentFiles = files.filter(f => f.type === 'file').slice(0, 4);

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const FileGridItem = ({ file }: { file: FileItem }) => (
    <div
      className={`group relative bg-white rounded-xl border ${
        selectedFiles.includes(file.id) ? 'border-violet-500 shadow-md' : 'border-gray-200'
      } p-6 hover:shadow-lg transition-all duration-200 cursor-pointer`}
      onClick={() => handleFileSelect(file.id)}
    >
      {/* Selection checkbox */}
      <div className={`absolute top-3 left-3 w-5 h-5 rounded border-2 ${
        selectedFiles.includes(file.id)
          ? 'bg-violet-500 border-violet-500'
          : 'border-gray-300 bg-white'
      } flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}>
        {selectedFiles.includes(file.id) && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Star indicator */}
      {file.starred && (
        <div className="absolute top-3 right-3">
          <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </div>
      )}

      <div className="flex flex-col items-center">
        <span className="text-5xl mb-3">{file.icon}</span>
        <h3 className="text-sm font-medium text-gray-900 text-center truncate w-full">
          {file.name}
        </h3>

        <div className="mt-2 space-y-1">
          <p className="text-xs text-gray-500">{file.modified}</p>
          {file.size && <p className="text-xs text-gray-500">{file.size}</p>}
        </div>

        {file.shared && (
          <div className="mt-2 flex items-center text-xs text-blue-600">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
            </svg>
            Shared
          </div>
        )}
      </div>
    </div>
  );

  const FileListItem = ({ file }: { file: FileItem }) => (
    <div
      className={`group flex items-center p-3 rounded-lg hover:bg-gray-50 ${
        selectedFiles.includes(file.id) ? 'bg-violet-50' : ''
      } transition-colors cursor-pointer`}
      onClick={() => handleFileSelect(file.id)}
    >
      <div className={`w-5 h-5 rounded border-2 ${
        selectedFiles.includes(file.id)
          ? 'bg-violet-500 border-violet-500'
          : 'border-gray-300 bg-white'
      } flex items-center justify-center mr-3`}>
        {selectedFiles.includes(file.id) && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <span className="text-2xl mr-3">{file.icon}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-gray-900 truncate">{file.name}</h3>
          {file.starred && (
            <svg className="w-4 h-4 text-yellow-400 fill-current ml-2" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          )}
        </div>
        <div className="flex items-center mt-1 text-xs text-gray-500 space-x-4">
          <span>{file.modified}</span>
          {file.size && <span>{file.size}</span>}
          {file.fileType && <span>{file.fileType}</span>}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {file.shared && (
          <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
            Shared
          </div>
        )}
        <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 rounded transition-all">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Files & Docs</h1>

              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <button className="hover:text-gray-700">Home</button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <button className="hover:text-gray-700">Projects</button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900 font-medium">Q4 2024</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500 focus:bg-white transition-colors"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Actions */}
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                New Folder
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all text-sm font-medium"
              >
                Upload Files
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Storage Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Storage Overview</h2>
              <p className="text-sm text-gray-500 mt-1">24.5 GB of 100 GB used</p>
            </div>
            <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              Upgrade Storage
            </button>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 h-3 rounded-full" style={{ width: '24.5%' }}></div>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span>Documents (8.2 GB)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span>Media (12.3 GB)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                <span>Other (4 GB)</span>
              </div>
            </div>
            <span>75.5 GB available</span>
          </div>
        </div>

        {/* Quick Access */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {recentFiles.map(file => (
              <div
                key={file.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{file.icon}</span>
                  {file.starred && (
                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-900 truncate">{file.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{file.modified}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main File Browser */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Files</h2>
            {selectedFiles.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">{selectedFiles.length} selected</span>
                <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">Share</button>
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">Delete</button>
              </div>
            )}
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map(file => (
                <FileGridItem key={file.id} file={file} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="divide-y divide-gray-200">
                {files.map(file => (
                  <FileListItem key={file.id} file={file} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Integration */}
        <div className="mt-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold flex items-center">
                <span className="mr-2">🤖</span>
                Lisa's File Intelligence
              </h3>
              <p className="text-violet-100 mt-1">
                AI-powered organization and insights for your documents
              </p>
            </div>
            <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors text-sm font-medium">
              View Insights
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm font-medium mb-1">Auto-categorized</p>
              <p className="text-2xl font-bold">847 files</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm font-medium mb-1">Duplicates found</p>
              <p className="text-2xl font-bold">23 files</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm font-medium mb-1">Space saved</p>
              <p className="text-2xl font-bold">3.2 GB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upload Files</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
              <p className="text-sm text-gray-400">Support for all file types up to 5GB</p>

              <button className="mt-6 px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all text-sm font-medium">
                Select Files
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Files are encrypted and secure
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}