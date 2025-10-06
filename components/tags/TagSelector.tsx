'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Plus, Tag as TagIcon } from 'lucide-react'
import { Tag, tagManager, TAG_COLORS } from '@/lib/tags'

interface TagSelectorProps {
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
  placeholder?: string
  className?: string
}

export default function TagSelector({ selectedTagIds, onChange, placeholder = 'Add tags...', className = '' }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadTags()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsCreating(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadTags = () => {
    setAllTags(tagManager.getTags())
  }

  const selectedTags = allTags.filter(tag => selectedTagIds.includes(tag.id))
  const availableTags = allTags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    const notSelected = !selectedTagIds.includes(tag.id)
    return matchesSearch && notSelected
  })

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId))
    } else {
      onChange([...selectedTagIds, tagId])
    }
  }

  const handleCreateTag = () => {
    if (!newTagName.trim()) return

    const newTag = tagManager.createTag(newTagName.trim(), selectedColor.value)
    loadTags()
    onChange([...selectedTagIds, newTag.id])
    setNewTagName('')
    setIsCreating(false)
    setSearchQuery('')
  }

  const getColorClasses = (color: string) => {
    const colorObj = TAG_COLORS.find(c => c.value === color) || TAG_COLORS[0]
    return colorObj
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Selected Tags */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg min-h-[42px] cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition"
      >
        {selectedTags.length === 0 ? (
          <span className="text-gray-400 dark:text-gray-500 text-sm py-1">{placeholder}</span>
        ) : (
          selectedTags.map(tag => {
            const colorClasses = getColorClasses(tag.color)
            return (
              <span
                key={tag.id}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${colorClasses.light} ${colorClasses.dark}`}
              >
                <TagIcon className="w-3 h-3" />
                {tag.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleTag(tag.id)
                  }}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          })
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or create tags..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              autoFocus
            />
          </div>

          {/* Available Tags */}
          <div className="flex-1 overflow-y-auto p-2">
            {availableTags.length > 0 ? (
              <div className="space-y-1">
                {availableTags.map(tag => {
                  const colorClasses = getColorClasses(tag.color)
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleToggleTag(tag.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition"
                    >
                      <div className={`w-3 h-3 rounded-full ${tag.color}`} />
                      <span className="text-gray-900 dark:text-white">{tag.name}</span>
                    </button>
                  )
                })}
              </div>
            ) : searchQuery && !isCreating ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No tags found</p>
                <button
                  onClick={() => {
                    setIsCreating(true)
                    setNewTagName(searchQuery)
                  }}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Create &quot;{searchQuery}&quot;
                </button>
              </div>
            ) : null}

            {/* Create New Tag Form */}
            {isCreating && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="mb-3">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Tag name"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Choose color:</p>
                  <div className="flex flex-wrap gap-2">
                    {TAG_COLORS.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setSelectedColor(color)}
                        className={`w-6 h-6 rounded-full ${color.value} ${
                          selectedColor.value === color.value ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-700' : ''
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTag}
                    className="flex-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false)
                      setNewTagName('')
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Create Button */}
          {!isCreating && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition"
              >
                <Plus className="w-4 h-4" />
                Create new tag
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
