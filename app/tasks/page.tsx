'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import TaskColumn from '@/components/tasks/TaskColumn'
import CreateTaskModal from '@/components/tasks/CreateTaskModal'
import { useNotifications } from '@/components/notifications/NotificationProvider'
import { notifications } from '@/lib/notifications'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignee?: {
    id: string
    name: string
    avatar?: string
  }
  dueDate?: Date
  tags: string[]
  attachments: number
  comments: number
  createdAt: Date
  updatedAt: Date
}

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'bg-gray-500' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'bg-yellow-500' },
  { id: 'COMPLETED', title: 'Completed', color: 'bg-green-500' },
]

export default function TasksPage() {
  const { showNotification } = useNotifications()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Load tasks from localStorage
  useEffect(() => {
    const loadTasks = () => {
      try {
        const savedTasks = localStorage.getItem('tasks')
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks)
          setTasks(parsedTasks.map((task: Task) => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt)
          })))
        } else {
          // Sample tasks for demo
          const sampleTasks: Task[] = [
            {
              id: '1',
              title: 'Design new landing page',
              description: 'Create wireframes and mockups for the new marketing site',
              status: 'IN_PROGRESS',
              priority: 'HIGH',
              assignee: { id: '1', name: 'John Doe' },
              dueDate: new Date(Date.now() + 86400000 * 3),
              tags: ['design', 'marketing'],
              attachments: 3,
              comments: 5,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: '2',
              title: 'Fix authentication bug',
              description: 'Users unable to login with Google OAuth',
              status: 'TODO',
              priority: 'URGENT',
              tags: ['bug', 'auth'],
              attachments: 0,
              comments: 2,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: '3',
              title: 'Code review: Payment integration',
              status: 'IN_REVIEW',
              priority: 'MEDIUM',
              assignee: { id: '2', name: 'Jane Smith' },
              tags: ['review', 'payments'],
              attachments: 1,
              comments: 8,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: '4',
              title: 'Update documentation',
              description: 'Add API endpoints documentation',
              status: 'COMPLETED',
              priority: 'LOW',
              tags: ['docs'],
              attachments: 0,
              comments: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
          setTasks(sampleTasks)
        }
      } catch (error) {
        console.error('Error loading tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (!loading && tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }
  }, [tasks, loading])

  const handleCreateTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'comments'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      attachments: 0,
      comments: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setTasks([...tasks, task])
    notifications.task.created(newTask.title)
  }

  const handleUpdateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === taskId)
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, status: newStatus, updatedAt: new Date() }
        : task
    ))
    if (task && newStatus === 'COMPLETED') {
      notifications.task.completed(task.title)
    }
  }

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    setTasks(tasks.filter(task => task.id !== taskId))
    if (task) {
      showNotification({
        type: 'success',
        title: 'Task deleted',
        message: `"${task.title}" has been removed`
      })
    }
  }

  // Filter tasks based on search and priority
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    return matchesSearch && matchesPriority
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Task Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organize and track your team&apos;s work
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Create button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map(column => (
            <TaskColumn
              key={column.id}
              column={column}
              tasks={filteredTasks.filter(task => task.status === column.id)}
              onUpdateStatus={handleUpdateTaskStatus}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        {/* Create Task Modal */}
        {isCreateModalOpen && (
          <CreateTaskModal
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreateTask}
          />
        )}
      </div>
    </div>
  )
}