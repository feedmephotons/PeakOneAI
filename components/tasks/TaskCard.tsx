'use client'

import { Calendar, MessageSquare, Paperclip, Flag, MoreHorizontal, ChevronRight, Trash2 } from 'lucide-react'
import { Task } from '@/app/tasks/page'
import { useState } from 'react'

interface TaskCardProps {
  task: Task
  onUpdateStatus: (taskId: string, newStatus: Task['status']) => void
  onDelete: (taskId: string) => void
  isSelected?: boolean
  onToggleSelect?: (taskId: string) => void
}

export default function TaskCard({ task, onUpdateStatus, onDelete, isSelected, onToggleSelect }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'URGENT': return 'text-peak-red bg-peak-red/15 ring-1 ring-peak-red/30'
      case 'HIGH': return 'text-peak-amber bg-peak-amber/15 ring-1 ring-peak-amber/30'
      case 'MEDIUM': return 'text-peak-amber bg-peak-amber/15 ring-1 ring-peak-amber/30'
      case 'LOW': return 'text-peak-muted bg-white/[0.06] ring-1 ring-peak-border'
      default: return 'text-peak-muted bg-white/[0.06] ring-1 ring-peak-border'
    }
  }

  const formatDueDate = (date: Date) => {
    const today = new Date()
    const dueDate = new Date(date)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { text: 'Overdue', color: 'text-peak-red' }
    if (diffDays === 0) return { text: 'Today', color: 'text-peak-amber' }
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-peak-amber' }
    if (diffDays <= 7) return { text: `${diffDays} days`, color: 'text-peak-primary-300' }
    return { text: dueDate.toLocaleDateString(), color: 'text-peak-muted' }
  }

  const nextStatus = {
    'TODO': 'IN_PROGRESS' as const,
    'IN_PROGRESS': 'IN_REVIEW' as const,
    'IN_REVIEW': 'COMPLETED' as const,
    'COMPLETED': 'TODO' as const
  }

  const isTemp = task.id.startsWith('temp-')

  const handleDragStart = (e: React.DragEvent) => {
    if (isTemp) {
      e.preventDefault()
      return
    }
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('taskId', task.id)
  }

  return (
    <div
      draggable={!isTemp}
      onDragStart={handleDragStart}
      className={`bg-peak-glass rounded-xl p-4 border transition-all group relative ${
        isTemp ? 'animate-pulse opacity-60 cursor-default' : 'cursor-move hover:bg-white/[0.04]'
      } ${
        isSelected ? 'border-peak-primary ring-2 ring-peak-primary/30' : 'border-peak-border'
      }`}
    >
      {/* Selection checkbox */}
      {onToggleSelect && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            disabled={isTemp}
            onChange={() => onToggleSelect(task.id)}
            onClick={(e) => e.stopPropagation()}
            className={`w-4 h-4 text-peak-primary bg-white/[0.04] border-peak-border rounded focus:ring-peak-primary focus:ring-2 ${
              isTemp ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
          />
        </div>
      )}

      {/* Header */}
      <div className={`flex items-start justify-between mb-2 ${onToggleSelect ? 'ml-6' : ''}`}>
        <h4 className="font-medium text-peak text-sm line-clamp-2">
          {task.title}
        </h4>
        <div className="relative">
          {isTemp ? (
            <div className="flex items-center justify-center text-peak-dim py-1">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-peak-dim hover:text-peak opacity-0 group-hover:opacity-100 transition"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}

          {showMenu && (
            <div className="absolute right-0 top-6 z-10 bg-peak-glass rounded-xl shadow-lg border border-peak-border py-1 w-40">
              <button
                onClick={() => {
                  onUpdateStatus(task.id, nextStatus[task.status])
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-peak hover:bg-white/[0.04] flex items-center gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                Move to {nextStatus[task.status].replace('_', ' ').toLowerCase()}
              </button>
              <button
                onClick={() => {
                  onDelete(task.id)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-white/[0.04] flex items-center gap-2 text-peak-red"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-peak-muted mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-white/[0.06] text-peak-muted rounded ring-1 ring-peak-border"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Priority & Due Date */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
          <Flag className="w-3 h-3" />
          {task.priority.toLowerCase()}
        </span>

        {task.dueDate && (
          <span className={`text-xs flex items-center gap-1 ${formatDueDate(task.dueDate).color}`}>
            <Calendar className="w-3 h-3" />
            {formatDueDate(task.dueDate).text}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-peak-muted">
          {task.attachments > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              {task.attachments}
            </span>
          )}
          {task.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {task.comments}
            </span>
          )}
        </div>

        {/* Assignee */}
        {task.assignee && (
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={task.assignee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee.name}`}
              alt={task.assignee.name}
              className="w-6 h-6 rounded-full"
            />
          </div>
        )}
      </div>
    </div>
  )
}