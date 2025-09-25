'use client'

import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { Plus, Search, Filter } from 'lucide-react'
import TaskColumn from '@/components/tasks/TaskColumn'
import TaskCard from '@/components/tasks/TaskCard'
import CreateTaskModal from '@/components/tasks/CreateTaskModal'

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
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    // Load mock tasks
    setTimeout(() => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Design new landing page',
          description: 'Create mockups for the new marketing landing page',
          status: 'TODO',
          priority: 'HIGH',
          assignee: {
            id: '1',
            name: 'John Smith',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
          },
          dueDate: new Date(Date.now() + 86400000 * 2),
          tags: ['design', 'marketing'],
          attachments: 3,
          comments: 5,
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Implement authentication',
          description: 'Add OAuth and email authentication',
          status: 'IN_PROGRESS',
          priority: 'URGENT',
          assignee: {
            id: '2',
            name: 'Sarah Johnson',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          },
          dueDate: new Date(Date.now() + 86400000),
          tags: ['backend', 'security'],
          attachments: 1,
          comments: 12,
          createdAt: new Date(Date.now() - 86400000 * 3),
          updatedAt: new Date(),
        },
        {
          id: '3',
          title: 'Write API documentation',
          description: 'Document all REST endpoints',
          status: 'IN_REVIEW',
          priority: 'MEDIUM',
          assignee: {
            id: '3',
            name: 'Mike Wilson',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
          },
          tags: ['documentation'],
          attachments: 2,
          comments: 3,
          createdAt: new Date(Date.now() - 86400000 * 2),
          updatedAt: new Date(),
        },
        {
          id: '4',
          title: 'Fix payment processing bug',
          description: 'Investigate and fix Stripe webhook issues',
          status: 'COMPLETED',
          priority: 'URGENT',
          tags: ['bug', 'payments'],
          attachments: 0,
          comments: 8,
          createdAt: new Date(Date.now() - 86400000 * 5),
          updatedAt: new Date(),
        },
        {
          id: '5',
          title: 'Optimize database queries',
          status: 'TODO',
          priority: 'LOW',
          tags: ['performance'],
          attachments: 0,
          comments: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
      setTasks(mockTasks)
      setLoading(false)
    }, 500)
  }, [])

  const handleDragStart = (event: { active: { id: string } }) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: { active: { id: string }, over: { id: string } | null }) => {
    const { active, over } = event

    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    // Check if dropped on a column
    if (COLUMNS.find(col => col.id === over.id)) {
      setTasks(tasks.map(task =>
        task.id === active.id
          ? { ...task, status: over.id as Task['status'] }
          : task
      ))
    }

    setActiveId(null)
  }

  const handleCreateTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title || 'New Task',
      description: taskData.description,
      status: taskData.status || 'TODO',
      priority: taskData.priority || 'MEDIUM',
      assignee: taskData.assignee,
      dueDate: taskData.dueDate,
      tags: taskData.tags || [],
      attachments: 0,
      comments: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTasks([...tasks, newTask])
    setIsCreateModalOpen(false)
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    return matchesSearch && matchesPriority
  })

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage and track your team&apos;s work
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

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

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading tasks...</div>
        </div>
      ) : (
        <div className="p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {COLUMNS.map(column => (
                <TaskColumn
                  key={column.id}
                  column={column}
                  tasks={filteredTasks.filter(t => t.status === column.id)}
                />
              ))}
            </div>
            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <CreateTaskModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  )
}