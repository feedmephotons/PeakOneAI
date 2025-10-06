'use client'

import { useState, useEffect } from 'react'
import { Tag as TagIcon, Plus, Edit2, Trash2, X } from 'lucide-react'
import { Tag, tagManager, TAG_COLORS } from '@/lib/tags'

interface TagManagerProps {
  isOpen: boolean
  onClose: () => void
}

export default function TagManager({ isOpen, onClose }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formName, setFormName] = useState('')
  const [formColor, setFormColor] = useState(TAG_COLORS[0])

  useEffect(() => {
    if (isOpen) {
      loadTags()
    }
  }, [isOpen])

  const loadTags = () => {
    setTags(tagManager.getTags())
  }

  const handleCreate = () => {
    if (!formName.trim()) return

    tagManager.createTag(formName.trim(), formColor.value)
    loadTags()
    resetForm()
  }

  const handleUpdate = () => {
    if (!editingTag || !formName.trim()) return

    tagManager.updateTag(editingTag.id, {
      name: formName.trim(),
      color: formColor.value
    })
    loadTags()
    resetForm()
  }

  const handleDelete = (tagId: string) => {
    if (!confirm('Are you sure? This will remove the tag from all items.')) return

    tagManager.deleteTag(tagId)
    loadTags()
  }

  const resetForm = () => {
    setFormName('')
    setFormColor(TAG_COLORS[0])
    setEditingTag(null)
    setIsCreating(false)
  }

  const startEdit = (tag: Tag) => {
    setEditingTag(tag)
    setFormName(tag.name)
    setFormColor(TAG_COLORS.find(c => c.value === tag.color) || TAG_COLORS[0])
    setIsCreating(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TagIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Tags</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create and organize your tags</p>
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
          {/* Create/Edit Form */}
          {(isCreating || editingTag) && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {editingTag ? 'Edit Tag' : 'Create New Tag'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tag Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter tag name..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TAG_COLORS.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setFormColor(color)}
                        className={`w-8 h-8 rounded-full ${color.value} transition ${
                          formColor.value === color.value
                            ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-700 scale-110'
                            : 'hover:scale-105'
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={editingTag ? handleUpdate : handleCreate}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                  >
                    {editingTag ? 'Update' : 'Create'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Button */}
          {!isCreating && !editingTag && (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-purple-500 dark:hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Create New Tag</span>
            </button>
          )}

          {/* Tags List */}
          <div className="space-y-2">
            {tags.length === 0 ? (
              <div className="text-center py-12">
                <TagIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">No tags yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Create your first tag to get started
                </p>
              </div>
            ) : (
              tags.map(tag => {
                const colorObj = TAG_COLORS.find(c => c.value === tag.color) || TAG_COLORS[0]
                return (
                  <div
                    key={tag.id}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-sm transition group"
                  >
                    <div className={`w-4 h-4 rounded-full ${tag.color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {tag.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Created {new Date(tag.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => startEdit(tag)}
                        className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              {tags.length} {tags.length === 1 ? 'tag' : 'tags'} total
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
