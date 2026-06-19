'use client'

import { useState } from 'react'
import TaskCard from './TaskCard'
import { Task } from '@/app/tasks/page'

interface TaskColumnProps {
  column: {
    id: string
    title: string
    color: string
  }
  tasks: Task[]
  onUpdateStatus: (taskId: string, newStatus: Task['status']) => void
  onDeleteTask: (taskId: string) => void
  selectedTasks?: Set<string>
  onToggleSelect?: (taskId: string) => void
}

export default function TaskColumn({ column, tasks, onUpdateStatus, onDeleteTask, selectedTasks, onToggleSelect }: TaskColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      onUpdateStatus(taskId, column.id as Task['status'])
    }
  }

  return (
    <div
      className={`bg-peak-glass border border-peak-border rounded-2xl p-4 min-h-[600px] transition-colors ${
        isDragOver ? 'ring-2 ring-peak-primary bg-peak-primary/[0.08]' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 ${column.color} rounded-full`} />
          <h3 className="font-semibold text-peak">
            {column.title}
          </h3>
          <span className="text-xs text-peak-muted bg-white/[0.06] ring-1 ring-peak-border px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdateStatus={onUpdateStatus}
            onDelete={onDeleteTask}
            isSelected={selectedTasks?.has(task.id)}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center h-32 text-peak-dim">
          <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">No tasks</p>
        </div>
      )}
    </div>
  )
}