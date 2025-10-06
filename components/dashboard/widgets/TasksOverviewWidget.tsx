'use client'

import { CheckSquare, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Task {
  id: string
  title: string
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

export default function TasksOverviewWidget() {
  // Load tasks from localStorage
  const tasks: Task[] = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('tasks') || '[]')
    : []

  const stats = {
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    inReview: tasks.filter(t => t.status === 'IN_REVIEW').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length
  }

  const total = tasks.length

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CheckSquare className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">To Do</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todo}</p>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-blue-600 dark:text-blue-400">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.inProgress}</p>
        </div>

        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-xs text-yellow-600 dark:text-yellow-400">In Review</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.inReview}</p>
        </div>

        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-600 dark:text-green-400">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.completed}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {total > 0 ? Math.round((stats.completed / total) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${total > 0 ? (stats.completed / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Recent Tasks */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recent Tasks</h4>
        <div className="space-y-2">
          {tasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 ${
                task.status === 'COMPLETED' ? 'bg-green-500' :
                task.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                task.status === 'IN_REVIEW' ? 'bg-yellow-500' :
                'bg-gray-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white truncate">{task.title}</p>
                <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                  task.priority === 'URGENT' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No tasks yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
