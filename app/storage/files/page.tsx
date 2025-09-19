import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function FilesPage() {
  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cloud Storage</h1>
            <p className="text-gray-500 mt-1">Manage and organize your files with AI-powered tagging</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <span>📁</span>
              <span>New Folder</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
              <span>⬆️</span>
              <span>Upload Files</span>
            </button>
          </div>
        </div>

        {/* Storage Stats */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-indigo-100 text-sm">Total Storage</p>
              <p className="text-2xl font-bold">100 GB</p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm">Used</p>
              <p className="text-2xl font-bold">24.5 GB</p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm">Available</p>
              <p className="text-2xl font-bold">75.5 GB</p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm">Files</p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: '24.5%' }}></div>
            </div>
          </div>
        </div>

        {/* File Browser */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <button className="text-sm text-gray-600 hover:text-gray-900">📁 Root</button>
              <span className="text-gray-400">/</span>
              <button className="text-sm text-gray-600 hover:text-gray-900">📁 Projects</button>
              <span className="text-gray-400">/</span>
              <span className="text-sm text-gray-900 font-medium">Q4 2024</span>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Folders */}
              {['Documents', 'Images', 'Videos', 'Archives'].map((folder) => (
                <div key={folder} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-4xl">📁</span>
                    <p className="text-sm font-medium text-gray-900">{folder}</p>
                    <p className="text-xs text-gray-500">12 items</p>
                  </div>
                </div>
              ))}

              {/* Files */}
              {[
                { name: 'Presentation.pptx', icon: '📊', size: '2.4 MB', modified: '2 hours ago' },
                { name: 'Report_Q4.pdf', icon: '📄', size: '1.2 MB', modified: '1 day ago' },
                { name: 'Meeting_Recording.mp4', icon: '🎬', size: '124 MB', modified: '3 days ago' },
                { name: 'Budget_2024.xlsx', icon: '📈', size: '456 KB', modified: '1 week ago' },
              ].map((file) => (
                <div key={file.name} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-4xl">{file.icon}</span>
                    <p className="text-sm font-medium text-gray-900 truncate w-full text-center">{file.name}</p>
                    <div className="text-xs text-gray-500">
                      <p>{file.size}</p>
                      <p>{file.modified}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Tags Section */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">AI-Generated Tags</h3>
            <div className="flex flex-wrap gap-2">
              {['Q4-2024', 'Financial', 'Marketing', 'Important', 'Review-Required', 'Client-Facing'].map((tag) => (
                <span key={tag} className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full cursor-pointer hover:bg-indigo-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}