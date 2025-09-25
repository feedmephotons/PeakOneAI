'use client'

import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { Plus, CheckCircle2, Bug, Lightbulb, RefreshCw, User, Clock, X } from 'lucide-react'

interface DevTask {
  id: string
  title: string
  description: string
  status: 'feature' | 'bug' | 'revision' | 'done'
  createdAt: string
  createdBy: string
}

const COLUMNS = [
  { id: 'feature', title: 'Feature Requests', color: 'bg-blue-500', icon: Lightbulb },
  { id: 'bug', title: 'Bug Reports', color: 'bg-red-500', icon: Bug },
  { id: 'revision', title: 'Revision Requests', color: 'bg-yellow-500', icon: RefreshCw },
  { id: 'done', title: 'Completed', color: 'bg-green-500', icon: CheckCircle2 },
]

const COMPLETED_FEATURES = [
  { date: '2024-01-24', feature: 'Clerk Authentication System', description: 'Multi-tenant auth with organizations' },
  { date: '2024-01-24', feature: 'Task Management System', description: 'Kanban board with drag-and-drop' },
  { date: '2024-01-24', feature: 'File Manager', description: 'Drag-drop uploads with AI analysis' },
  { date: '2024-01-24', feature: 'Global Search (Cmd+K)', description: 'Quick search across all modules' },
  { date: '2024-01-24', feature: 'Dark Mode', description: 'System preference detection + toggle' },
  { date: '2024-01-24', feature: 'Activity Dashboard', description: 'Real-time activity tracking' },
  { date: '2024-01-24', feature: 'Sentry Error Tracking', description: 'Production error monitoring' },
  { date: '2024-01-24', feature: 'Lisa AI Integration', description: 'GPT-4 powered assistant' },
  { date: '2024-01-24', feature: 'Multi-tenant Architecture', description: 'Complete data isolation per org' },
  { date: '2024-01-24', feature: 'Onboarding Flow', description: '3-step org creation wizard' },
]

export default function DevOpsPage() {
  const [tasks, setTasks] = useState<DevTask[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', createdBy: '' })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('devops-tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('devops-tasks', JSON.stringify(tasks))
  }, [tasks])

  const handleDragStart = (event: { active: { id: string } }) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: { active: { id: string }, over: { id: string } | null }) => {
    const { active, over } = event
    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    if (COLUMNS.find(col => col.id === over.id)) {
      setTasks(tasks.map(task =>
        task.id === active.id
          ? { ...task, status: over.id as DevTask['status'] }
          : task
      ))
    }

    setActiveId(null)
  }

  const handleAddTask = () => {
    if (!newTask.title || !newTask.createdBy) return

    const task: DevTask = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: 'feature',
      createdAt: new Date().toISOString(),
      createdBy: newTask.createdBy,
    }

    setTasks([...tasks, task])
    setNewTask({ title: '', description: '', createdBy: '' })
    setIsAddingTask(false)
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🚀 SaasX DevOps Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Internal development tracking - Feature requests, bugs, and progress
          </p>
        </div>

        {/* Feature Request Board */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Client Feedback Board
            </h2>
            <button
              onClick={() => setIsAddingTask(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              Add Request
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {COLUMNS.map(column => {
                const Icon = column.icon
                const columnTasks = tasks.filter(t => t.status === column.id)

                return (
                  <div
                    key={column.id}
                    className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 min-h-[400px]"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-8 h-8 ${column.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {column.title}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {columnTasks.map(task => (
                        <div
                          key={task.id}
                          className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-600 cursor-move group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {task.title}
                            </h4>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {task.createdBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <DragOverlay>
              {activeTask ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-xl border border-gray-200 dark:border-gray-600 opacity-80">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {activeTask.title}
                  </h4>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Completed Features List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            ✅ Completed Features
          </h2>

          <div className="space-y-3">
            {COMPLETED_FEATURES.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {item.feature}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {item.date}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Task Modal */}
        {isAddingTask && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Add New Request
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={newTask.createdBy}
                    onChange={(e) => setNewTask({ ...newTask, createdBy: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Add video calling feature"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Provide more details..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsAddingTask(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
                >
                  Add Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}