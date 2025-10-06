'use client'

import { useState, useEffect } from 'react'
import { Tag as TagIcon, X } from 'lucide-react'
import { Tag, tagManager } from '@/lib/tags'

interface TagFilterProps {
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
  className?: string
}

export default function TagFilter({ selectedTagIds, onChange, className = '' }: TagFilterProps) {
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setAllTags(tagManager.getTags())
  }, [])

  const selectedTags = allTags.filter(tag => selectedTagIds.includes(tag.id))

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId))
    } else {
      onChange([...selectedTagIds, tagId])
    }
  }

  const handleClearAll = () => {
    onChange([])
  }

  const getColorClass = (color: string) => {
    return color.replace('bg-', 'text-')
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition ${
          selectedTagIds.length > 0
            ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-500 dark:hover:border-purple-400'
        }`}
      >
        <TagIcon className="w-4 h-4" />
        <span>Tags {selectedTagIds.length > 0 && `(${selectedTagIds.length})`}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filter by Tags</h3>
              {selectedTagIds.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto p-2">
              {allTags.length === 0 ? (
                <div className="text-center py-6">
                  <TagIcon className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No tags yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Create tags to organize your items</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {allTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => handleToggleTag(tag.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded transition ${
                        selectedTagIds.includes(tag.id)
                          ? 'bg-purple-50 dark:bg-purple-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${tag.color}`} />
                      <span className="flex-1 text-left text-gray-900 dark:text-white">{tag.name}</span>
                      {selectedTagIds.includes(tag.id) && (
                        <div className="w-4 h-4 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedTags.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map(tag => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                    >
                      <div className={`w-2 h-2 rounded-full ${tag.color}`} />
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
