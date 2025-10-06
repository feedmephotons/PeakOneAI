'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, Trash2, X, Copy } from 'lucide-react'
import { Snippet, snippetManager } from '@/lib/commands'

interface SnippetManagerProps {
  isOpen: boolean
  onClose: () => void
}

export default function SnippetManager({ isOpen, onClose }: SnippetManagerProps) {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newSnippet, setNewSnippet] = useState({
    trigger: '',
    content: '',
    description: ''
  })

  useEffect(() => {
    if (isOpen) {
      loadSnippets()
    }
  }, [isOpen])

  const loadSnippets = () => {
    setSnippets(snippetManager.getSnippets())
  }

  const handleCreate = () => {
    if (!newSnippet.trigger.trim() || !newSnippet.content.trim()) return

    snippetManager.createSnippet(
      newSnippet.trigger.startsWith('/') ? newSnippet.trigger : `/${newSnippet.trigger}`,
      newSnippet.content,
      newSnippet.description || undefined
    )

    loadSnippets()
    setNewSnippet({ trigger: '', content: '', description: '' })
    setIsCreating(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this snippet?')) return

    snippetManager.deleteSnippet(id)
    loadSnippets()
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Snippet Manager</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Create reusable text snippets with triggers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Create New */}
          {isCreating ? (
            <div className="mb-6 p-4 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Create New Snippet</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trigger (e.g., /email)
                  </label>
                  <input
                    type="text"
                    value={newSnippet.trigger}
                    onChange={(e) => setNewSnippet({ ...newSnippet, trigger: e.target.value })}
                    placeholder="/email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content
                  </label>
                  <textarea
                    value={newSnippet.content}
                    onChange={(e) => setNewSnippet({ ...newSnippet, content: e.target.value })}
                    placeholder="Enter snippet content..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={newSnippet.description}
                    onChange={(e) => setNewSnippet({ ...newSnippet, description: e.target.value })}
                    placeholder="Email signature template"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsCreating(false)
                      setNewSnippet({ trigger: '', content: '', description: '' })
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                  >
                    Create Snippet
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-purple-500 dark:hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">New Snippet</span>
            </button>
          )}

          {/* Snippets List */}
          {snippets.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No snippets yet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create snippets to quickly insert commonly used text
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {snippets.map((snippet) => (
                <div
                  key={snippet.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm font-mono">
                          {snippet.trigger}
                        </code>
                        {snippet.description && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {snippet.description}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {snippet.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition ml-4">
                      <button
                        onClick={() => handleCopy(snippet.content)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(snippet.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use triggers in the command bar to quickly insert snippets
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
