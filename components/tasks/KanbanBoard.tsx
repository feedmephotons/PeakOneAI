'use client'

import React, { useState } from 'react'
import { GripVertical, Plus, MoreVertical, Clock, User, Tag } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority?: 'low' | 'medium' | 'high'
  assignee?: string
  dueDate?: Date
  tags?: string[]
}

interface KanbanBoardProps {
  tasks: Task[]
  onTaskUpdate: (task: Task) => void
  onTaskCreate: (status: string) => void
}

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-yellow-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' }
]

export default function KanbanBoard({ tasks, onTaskUpdate, onTaskCreate }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: string) => {
    if (draggedTask) {
      onTaskUpdate({ ...draggedTask, status: status as Task['status'] })
      setDraggedTask(null)
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {columns.map(column => {
        const columnTasks = tasks.filter(task => task.status === column.id)

        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{column.title}</h3>
                <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              <button
                onClick={() => onTaskCreate(column.id)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
              >
                <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {columnTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  className="bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 cursor-move hover:shadow-md transition group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm flex-1">
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-1">
                      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
                        <GripVertical className="w-3 h-3 text-gray-400" />
                      </button>
                      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
                        <MoreVertical className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {task.priority && (
                      <span className={`px-2 py-0.5 text-xs rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    )}

                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    {task.assignee && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <User className="w-3 h-3" />
                        <span>{task.assignee}</span>
                      </div>
                    )}
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {task.tags.map(tag => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Add Task Button */}
              {columnTasks.length === 0 && (
                <button
                  onClick={() => onTaskCreate(column.id)}
                  className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-400 dark:text-gray-600 hover:border-gray-400 dark:hover:border-gray-600 hover:text-gray-500 dark:hover:text-gray-500 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add task</span>
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
