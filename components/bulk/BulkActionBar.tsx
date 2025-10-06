'use client'

import { useState, useEffect } from 'react'
import {
  Trash2, FolderInput, Tag as TagIcon, Archive, Star,
  Share2, Download, X, Undo, Loader
} from 'lucide-react'
import { bulkOpsManager, UndoableOperation } from '@/lib/bulk-operations'

interface BulkActionBarProps {
  selectedCount: number
  onClearSelection: () => void
  onDelete?: () => void | Promise<void>
  onMove?: () => void | Promise<void>
  onTag?: () => void | Promise<void>
  onArchive?: () => void | Promise<void>
  onStar?: () => void | Promise<void>
  onShare?: () => void | Promise<void>
  onDownload?: () => void | Promise<void>
  itemType?: string
}

export default function BulkActionBar({
  selectedCount,
  onClearSelection,
  onDelete,
  onMove,
  onTag,
  onArchive,
  onStar,
  onShare,
  onDownload,
  itemType = 'item'
}: BulkActionBarProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastOperation, setLastOperation] = useState<UndoableOperation | null>(null)
  const [showUndo, setShowUndo] = useState(false)

  useEffect(() => {
    if (lastOperation && bulkOpsManager.canUndo(lastOperation.id)) {
      setShowUndo(true)
      const timeout = setTimeout(() => {
        setShowUndo(false)
        setLastOperation(null)
      }, 30000)
      return () => clearTimeout(timeout)
    }
  }, [lastOperation])

  const handleAction = async (action: () => void | Promise<void>, actionType: string) => {
    if (isProcessing) return

    setIsProcessing(true)
    try {
      await action()
      const op = await bulkOpsManager.executeBulkOperation({
        type: actionType as 'delete',
        itemIds: []
      })
      setLastOperation(op)
    } catch (error) {
      console.error('Bulk action failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (selectedCount === 0) return null

  return (
    <>
      {/* Main Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-4">
            {/* Selection count */}
            <div className="flex items-center gap-3 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <div className="flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full text-xs font-bold">
                {selectedCount}
              </div>
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                {selectedCount} {itemType}{selectedCount > 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              {onDelete && (
                <button
                  onClick={() => handleAction(onDelete, 'delete')}
                  disabled={isProcessing}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
                  title="Delete"
                >
                  {isProcessing ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              )}

              {onMove && (
                <button
                  onClick={() => handleAction(onMove, 'move')}
                  disabled={isProcessing}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
                  title="Move"
                >
                  <FolderInput className="w-5 h-5" />
                </button>
              )}

              {onTag && (
                <button
                  onClick={() => handleAction(onTag, 'tag')}
                  disabled={isProcessing}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
                  title="Add Tags"
                >
                  <TagIcon className="w-5 h-5" />
                </button>
              )}

              {onArchive && (
                <button
                  onClick={() => handleAction(onArchive, 'archive')}
                  disabled={isProcessing}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
                  title="Archive"
                >
                  <Archive className="w-5 h-5" />
                </button>
              )}

              {onStar && (
                <button
                  onClick={() => handleAction(onStar, 'star')}
                  disabled={isProcessing}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
                  title="Star"
                >
                  <Star className="w-5 h-5" />
                </button>
              )}

              {onShare && (
                <button
                  onClick={() => handleAction(onShare, 'share')}
                  disabled={isProcessing}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}

              {onDownload && (
                <button
                  onClick={() => handleAction(onDownload, 'download')}
                  disabled={isProcessing}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

            {/* Close */}
            <button
              onClick={onClearSelection}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              title="Clear selection"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Undo Toast */}
      {showUndo && lastOperation && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-gray-900 dark:bg-gray-700 text-white rounded-lg shadow-xl p-4 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm">Action completed</span>
            </div>
            <button
              onClick={() => {
                // Handle undo logic here
                setShowUndo(false)
                setLastOperation(null)
              }}
              className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition text-sm font-medium"
            >
              <Undo className="w-4 h-4" />
              Undo
            </button>
          </div>
        </div>
      )}
    </>
  )
}
