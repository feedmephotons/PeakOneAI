'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, MessageSquare, Paperclip, Flag, MoreHorizontal } from 'lucide-react'
import { Task } from '@/app/tasks/page'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

export default function TaskCard({ task, isDragging }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
      case 'HIGH': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'LOW': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const formatDueDate = (date: Date) => {
    const today = new Date()
    const dueDate = new Date(date)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600 dark:text-red-400' }
    if (diffDays === 0) return { text: 'Today', color: 'text-orange-600 dark:text-orange-400' }
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-yellow-600 dark:text-yellow-400' }
    if (diffDays <= 7) return { text: `${diffDays} days`, color: 'text-blue-600 dark:text-blue-400' }
    return { text: dueDate.toLocaleDateString(), color: 'text-gray-600 dark:text-gray-400' }
  }

  const isActuallyDragging = isDragging || isSortableDragging

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 cursor-move hover:shadow-md transition-all ${
        isActuallyDragging ? 'opacity-50 rotate-2 scale-105' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
          {task.title}
        </h4>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
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
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
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