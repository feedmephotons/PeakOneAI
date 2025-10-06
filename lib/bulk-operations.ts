export interface BulkOperation {
  type: 'delete' | 'move' | 'tag' | 'archive' | 'star' | 'share' | 'download'
  itemIds: string[]
  metadata?: Record<string, unknown>
}

export interface UndoableOperation extends BulkOperation {
  id: string
  timestamp: Date
  undoData?: unknown
}

class BulkOperationsManager {
  private undoHistory: UndoableOperation[] = []
  private maxHistorySize = 10
  private undoTimeoutMs = 30000 // 30 seconds to undo

  async executeBulkOperation(operation: BulkOperation): Promise<UndoableOperation> {
    const undoableOp: UndoableOperation = {
      ...operation,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }

    // Add to history
    this.undoHistory.unshift(undoableOp)
    if (this.undoHistory.length > this.maxHistorySize) {
      this.undoHistory.pop()
    }

    // Set timeout to remove from undo history
    setTimeout(() => {
      this.removeFromHistory(undoableOp.id)
    }, this.undoTimeoutMs)

    return undoableOp
  }

  canUndo(operationId: string): boolean {
    const op = this.undoHistory.find(o => o.id === operationId)
    if (!op) return false

    const elapsed = Date.now() - op.timestamp.getTime()
    return elapsed < this.undoTimeoutMs
  }

  getUndoableOperations(): UndoableOperation[] {
    const now = Date.now()
    return this.undoHistory.filter(op => {
      const elapsed = now - op.timestamp.getTime()
      return elapsed < this.undoTimeoutMs
    })
  }

  removeFromHistory(operationId: string): void {
    this.undoHistory = this.undoHistory.filter(op => op.id !== operationId)
  }

  clearHistory(): void {
    this.undoHistory = []
  }
}

export const bulkOpsManager = new BulkOperationsManager()

// Utility functions for common bulk operations
export const bulkOperationUtils = {
  confirmDelete: (count: number): boolean => {
    return confirm(`Are you sure you want to delete ${count} item${count > 1 ? 's' : ''}? This action cannot be undone.`)
  },

  formatProgress: (current: number, total: number): string => {
    const percentage = Math.round((current / total) * 100)
    return `${current} of ${total} (${percentage}%)`
  },

  estimateTime: (itemsProcessed: number, totalItems: number, elapsedMs: number): number => {
    if (itemsProcessed === 0) return 0
    const avgTimePerItem = elapsedMs / itemsProcessed
    const remainingItems = totalItems - itemsProcessed
    return Math.round((remainingItems * avgTimePerItem) / 1000) // in seconds
  }
}
