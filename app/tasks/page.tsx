'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Search, Filter, Settings, Star } from 'lucide-react'
import TaskColumn from '@/components/tasks/TaskColumn'
import CreateTaskModal from '@/components/tasks/CreateTaskModal'
import { useNotifications } from '@/components/notifications/NotificationProvider'
import { notifications } from '@/lib/notifications'
import TagFilter from '@/components/tags/TagFilter'
import TagManager from '@/components/tags/TagManager'
import { tagManager } from '@/lib/tags'
import BulkActionBar from '@/components/bulk/BulkActionBar'
import { bulkOperationUtils } from '@/lib/bulk-operations'
import TemplateManager from '@/components/templates/TemplateManager'
import AdvancedSearch from '@/components/search/AdvancedSearch'
import SavedSearches from '@/components/search/SavedSearches'
import { SearchQuery, advancedSearch, SearchableItem } from '@/lib/search'
import AutomationManager from '@/components/automation/AutomationManager'
import { automationEngine } from '@/lib/automation'
import AISuggestionsPanel from '@/components/tasks/AISuggestionsPanel'
import { createClient } from '@/lib/supabase/client'

interface SyncAction {
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  taskId: string
  data?: any
  timestamp: number
}

function mergePendingActions(baseTasks: Task[], pendingActions: SyncAction[]): Task[] {
  let merged = [...baseTasks]
  const sortedActions = [...pendingActions].sort((a, b) => a.timestamp - b.timestamp)

  for (const action of sortedActions) {
    if (action.type === 'CREATE') {
      if (!merged.some(t => t.id === action.taskId)) {
        const newTask: Task = {
          ...action.data,
          id: action.taskId,
          attachments: action.data?.attachments || 0,
          comments: action.data?.comments || 0,
          createdAt: action.data?.createdAt ? new Date(action.data.createdAt) : new Date(action.timestamp),
          updatedAt: action.data?.updatedAt ? new Date(action.data.updatedAt) : new Date(action.timestamp),
          dueDate: action.data?.dueDate ? new Date(action.data.dueDate) : undefined
        }
        merged.push(newTask)
      }
    } else if (action.type === 'UPDATE') {
      merged = merged.map(t => {
        if (t.id === action.taskId) {
          return {
            ...t,
            ...action.data,
            dueDate: action.data?.dueDate ? new Date(action.data.dueDate) : t.dueDate,
            updatedAt: new Date(action.timestamp)
          }
        }
        return t
      })
    } else if (action.type === 'DELETE') {
      merged = merged.filter(t => t.id !== action.taskId)
    }
  }
  return merged
}


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
  const [filterTagIds, setFilterTagIds] = useState<string[]>([])
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false)
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false)
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false)
  const [isSavedSearchesOpen, setIsSavedSearchesOpen] = useState(false)
  const [isAutomationManagerOpen, setIsAutomationManagerOpen] = useState(false)
  const [activeSearchQuery, setActiveSearchQuery] = useState<SearchQuery | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'demo'>('demo')

  const isSyncingRef = useRef(false)
  const tabIdRef = useRef(Math.random().toString(36).substr(2, 9))

  const hasQueue = () => {
    try {
      const saved = localStorage.getItem('pending_sync_actions')
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.length > 0
      }
    } catch {}
    return false
  }

  const checkAuthAndLoad = useCallback(async () => {
    let isAuth = false
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      isAuth = !!session
      setIsAuthenticated(isAuth)
      setSyncStatus(isAuth ? 'synced' : 'demo')
    } catch (error) {
      console.error('Auth check error:', error)
    }

    if (isAuth) {
      try {
        const res = await fetch('/api/tasks')
        if (res.ok) {
          const data = await res.json()
          const serverTasks = data.tasks.map((task: any) => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt)
          }))

          let localUnsyncedTasks: Task[] = []
          try {
            const savedTasks = localStorage.getItem('tasks')
            if (savedTasks) {
              const parsedTasks = JSON.parse(savedTasks)
              localUnsyncedTasks = parsedTasks
                .filter((t: any) => t && t.id && (t.id.startsWith('temp-') || t.id.startsWith('task_')))
                .map((t: any) => ({
                  ...t,
                  dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
                  createdAt: new Date(t.createdAt),
                  updatedAt: new Date(t.updatedAt)
                }))
            }
          } catch (e) {
            console.error('Error parsing localStorage tasks in sync merge:', e)
          }

          const serverTaskIds = new Set(serverTasks.map((t: any) => t.id))
          const mergedBaseTasks = [
            ...serverTasks,
            ...localUnsyncedTasks.filter((t) => !serverTaskIds.has(t.id))
          ]

          let pendingActions: SyncAction[] = []
          try {
            const savedActions = localStorage.getItem('pending_sync_actions')
            if (savedActions) {
              pendingActions = JSON.parse(savedActions)
            }
          } catch (e) {
            console.error('Error parsing pending sync actions in load:', e)
          }

          const mergedTasks = mergePendingActions(mergedBaseTasks, pendingActions)

          setTasks(mergedTasks)
          setLoading(false)
          return
        }
      } catch (error) {
        console.error('API fetch failed, falling back to localStorage:', error)
      }
    }

    // Fallback to localStorage
    try {
      const savedTasks = localStorage.getItem('tasks')
      let baseTasks: Task[] = []
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks)
        baseTasks = parsedTasks.map((task: Task) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        }))
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
        baseTasks = sampleTasks
      }

      let pendingActions: SyncAction[] = []
      try {
        const savedActions = localStorage.getItem('pending_sync_actions')
        if (savedActions) {
          pendingActions = JSON.parse(savedActions)
        }
      } catch (e) {
        console.error('Error parsing pending sync actions in fallback:', e)
      }

      const mergedTasks = mergePendingActions(baseTasks, pendingActions)
      setTasks(mergedTasks)
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error)
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  const syncPendingActions = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.onLine) return
    if (isSyncingRef.current) return

    // Mutex lock check/acquire
    const checkAndAcquireLock = (): boolean => {
      try {
        const lockStr = localStorage.getItem('tasks_sync_lock')
        const now = Date.now()
        if (lockStr) {
          const lock = JSON.parse(lockStr)
          if (lock.ownerId !== tabIdRef.current && (now - lock.timestamp) < 10000) {
            console.log('[SyncOutbox] Lock held by another tab:', lock.ownerId)
            return false
          }
        }
        localStorage.setItem('tasks_sync_lock', JSON.stringify({
          ownerId: tabIdRef.current,
          timestamp: now
        }))
        return true
      } catch (e) {
        console.error('[SyncOutbox] Error acquiring lock:', e)
        return false
      }
    }

    const releaseLock = () => {
      try {
        const lockStr = localStorage.getItem('tasks_sync_lock')
        if (lockStr) {
          const lock = JSON.parse(lockStr)
          if (lock.ownerId === tabIdRef.current) {
            localStorage.removeItem('tasks_sync_lock')
          }
        }
      } catch (e) {
        console.error('[SyncOutbox] Error releasing lock:', e)
      }
    }

    if (!checkAndAcquireLock()) {
      return
    }

    isSyncingRef.current = true

    try {
      while (true) {
        // Renew lease
        localStorage.setItem('tasks_sync_lock', JSON.stringify({
          ownerId: tabIdRef.current,
          timestamp: Date.now()
        }))

        const savedActions = localStorage.getItem('pending_sync_actions')
        if (!savedActions) break
        let actions: SyncAction[] = []
        try {
          actions = JSON.parse(savedActions)
        } catch (e) {
          console.error('Error parsing pending sync actions, clearing corrupt queue:', e)
          localStorage.removeItem('pending_sync_actions')
          break
        }
        if (!Array.isArray(actions)) {
          console.error('Corrupt outbox queue (not an array), clearing queue')
          localStorage.removeItem('pending_sync_actions')
          break
        }
        if (actions.length === 0) break

        const action = actions[0]
        try {
          if (action.type === 'CREATE') {
            const url = action.data?.meetingId ? '/api/tasks/create' : '/api/tasks'
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action.data)
            })
            if (!res.ok) {
              if (res.status >= 400 && res.status < 500 && res.status !== 401 && res.status !== 403) {
                showNotification({
                  type: 'error',
                  title: 'Sync Action Failed',
                  message: `Permanent error executing sync action for task: ${action.data?.title || action.taskId}`
                })
                const latestSaved = localStorage.getItem('pending_sync_actions')
                const latestActions: SyncAction[] = latestSaved ? JSON.parse(latestSaved) : []
                const updatedActions = latestActions.filter(act => {
                  const isTargetAction = act.timestamp === action.timestamp && act.type === action.type && act.taskId === action.taskId
                  const isDependentAction = act.taskId === action.taskId
                  return !isTargetAction && !isDependentAction
                })
                localStorage.setItem('pending_sync_actions', JSON.stringify(updatedActions))
                setTasks(prev => prev.filter(t => t.id !== action.taskId))
                continue
              } else if (res.status === 401 || res.status === 403) {
                showNotification({
                  type: 'error',
                  title: 'Authentication Expired',
                  message: 'Your session has expired. Please sign in again to sync changes.'
                })
                throw new Error('Authentication expired or unauthorized')
              }
              throw new Error(`CREATE failed with status ${res.status}`)
            }

            const data = await res.json()
            const serverTask = data.task
            const serverId = serverTask.id
            const tempId = action.taskId

            // Update client state
            setTasks(prev => prev.map(t => t.id === tempId ? {
              ...serverTask,
              dueDate: serverTask.dueDate ? new Date(serverTask.dueDate) : undefined,
              createdAt: new Date(serverTask.createdAt),
              updatedAt: new Date(serverTask.updatedAt)
            } : t))

            if (action.data.tags && action.data.tags.length > 0) {
              tagManager.setItemTags(serverId, 'task', action.data.tags)
            }

            // Remove processed action and update subsequent references to tempId in the queue
            const latestSaved = localStorage.getItem('pending_sync_actions')
            const latestActions: SyncAction[] = latestSaved ? JSON.parse(latestSaved) : []
            const idx = latestActions.findIndex(act => act.timestamp === action.timestamp && act.type === action.type && act.taskId === action.taskId)
            if (idx !== -1) {
              latestActions.splice(idx, 1)
            }
            const updatedActions = latestActions.map(act => {
              if (act.taskId === tempId) {
                return { ...act, taskId: serverId }
              }
              return act
            })
            localStorage.setItem('pending_sync_actions', JSON.stringify(updatedActions))

          } else if (action.type === 'UPDATE') {
            const res = await fetch(`/api/tasks?id=${action.taskId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action.data)
            })
            if (!res.ok) {
              if (res.status >= 400 && res.status < 500 && res.status !== 401 && res.status !== 403) {
                showNotification({
                  type: 'error',
                  title: 'Sync Action Failed',
                  message: `Permanent error executing sync action for task ID: ${action.taskId}`
                })
                const latestSaved = localStorage.getItem('pending_sync_actions')
                const latestActions: SyncAction[] = latestSaved ? JSON.parse(latestSaved) : []
                const updatedActions = latestActions.filter(act => {
                  return !(act.timestamp === action.timestamp && act.type === action.type && act.taskId === action.taskId)
                })
                localStorage.setItem('pending_sync_actions', JSON.stringify(updatedActions))
                await checkAuthAndLoad()
                continue
              } else if (res.status === 401 || res.status === 403) {
                showNotification({
                  type: 'error',
                  title: 'Authentication Expired',
                  message: 'Your session has expired. Please sign in again to sync changes.'
                })
                throw new Error('Authentication expired or unauthorized')
              }
              throw new Error(`UPDATE failed with status ${res.status}`)
            }

            // Remove processed action
            const latestSaved = localStorage.getItem('pending_sync_actions')
            const latestActions: SyncAction[] = latestSaved ? JSON.parse(latestSaved) : []
            const idx = latestActions.findIndex(act => act.timestamp === action.timestamp && act.type === action.type && act.taskId === action.taskId)
            if (idx !== -1) {
              latestActions.splice(idx, 1)
            }
            localStorage.setItem('pending_sync_actions', JSON.stringify(latestActions))

          } else if (action.type === 'DELETE') {
            const res = await fetch(`/api/tasks?id=${action.taskId}`, {
              method: 'DELETE'
            })
            if (!res.ok) {
              if (res.status >= 400 && res.status < 500 && res.status !== 401 && res.status !== 403) {
                showNotification({
                  type: 'error',
                  title: 'Sync Action Failed',
                  message: `Permanent error executing sync action for task ID: ${action.taskId}`
                })
                const latestSaved = localStorage.getItem('pending_sync_actions')
                const latestActions: SyncAction[] = latestSaved ? JSON.parse(latestSaved) : []
                const updatedActions = latestActions.filter(act => {
                  return !(act.timestamp === action.timestamp && act.type === action.type && act.taskId === action.taskId)
                })
                localStorage.setItem('pending_sync_actions', JSON.stringify(updatedActions))
                await checkAuthAndLoad()
                continue
              } else if (res.status === 401 || res.status === 403) {
                showNotification({
                  type: 'error',
                  title: 'Authentication Expired',
                  message: 'Your session has expired. Please sign in again to sync changes.'
                })
                throw new Error('Authentication expired or unauthorized')
              }
              throw new Error(`DELETE failed with status ${res.status}`)
            }

            // Remove processed action
            const latestSaved = localStorage.getItem('pending_sync_actions')
            const latestActions: SyncAction[] = latestSaved ? JSON.parse(latestSaved) : []
            const idx = latestActions.findIndex(act => act.timestamp === action.timestamp && act.type === action.type && act.taskId === action.taskId)
            if (idx !== -1) {
              latestActions.splice(idx, 1)
            }
            localStorage.setItem('pending_sync_actions', JSON.stringify(latestActions))
          }
        } catch (itemError) {
          console.error('[SyncOutbox] Failed to sync action:', action, itemError)
          break
        }
      }
    } catch (e) {
      console.error('[SyncOutbox] Error during sync loop:', e)
    } finally {
      isSyncingRef.current = false
      releaseLock()
    }
  }, [showNotification, checkAuthAndLoad, tabIdRef])

  // Listen for online/offline events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (navigator.onLine) {
        syncPendingActions()
      }

      const handleOnline = () => {
        console.log('[SyncOutbox] Reconnected online, running sync...')
        syncPendingActions()
      }

      window.addEventListener('online', handleOnline)
      return () => window.removeEventListener('online', handleOnline)
    }
  }, [syncPendingActions])

  // Load tasks (API with localStorage fallback)
  useEffect(() => {
    checkAuthAndLoad()

    // Listen for storage events to reload when tasks are added from other components (like video calls)
    const handleStorageChange = () => {
      console.log('[TasksPage] Storage changed, reloading tasks...')
      checkAuthAndLoad()
      if (typeof window !== 'undefined' && navigator.onLine) {
        syncPendingActions()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [checkAuthAndLoad, syncPendingActions])

  // Save tasks to localStorage whenever they change (for offline/demo cache)
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('tasks', JSON.stringify(tasks))
      } catch (error) {
        console.error('Failed to save tasks to localStorage:', error)
      }
    }
  }, [tasks, loading])

  const handleCreateTask = async (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'comments'>) => {
    const tempId = isAuthenticated ? `temp-${Date.now()}` : `task-${Date.now()}`
    const task: Task = {
      ...newTask,
      id: tempId,
      attachments: 0,
      comments: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const previousTasks = [...tasks]
    setTasks([...tasks, task])

    if (newTask.tags && newTask.tags.length > 0) {
      tagManager.setItemTags(tempId, 'task', newTask.tags)
    }

    notifications.task.created(newTask.title)

    // Trigger automation
    automationEngine.executeRules('task_created', {
      taskId: task.id,
      title: task.title,
      priority: task.priority,
      status: task.status,
      itemId: tempId,
      itemType: 'task'
    })

    if (isAuthenticated) {
      if (hasQueue()) {
        const newAction: SyncAction = {
          type: 'CREATE',
          taskId: tempId,
          data: newTask,
          timestamp: Date.now()
        }
        try {
          const savedActions = localStorage.getItem('pending_sync_actions')
          const actions: SyncAction[] = savedActions ? JSON.parse(savedActions) : []
          actions.push(newAction)
          localStorage.setItem('pending_sync_actions', JSON.stringify(actions))
        } catch (e) {
          console.error('Failed to queue offline task:', e)
        }
        showNotification({
          type: 'info',
          title: 'Sync Queued',
          message: 'Task creation queued to sync behind other offline updates.'
        })
        syncPendingActions()
        return
      }

      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask),
        })

        if (!res.ok) {
          throw new Error('Failed to create task on server')
        }

        const data = await res.json()
        const createdTask = {
          ...data.task,
          dueDate: data.task.dueDate ? new Date(data.task.dueDate) : undefined,
          createdAt: new Date(data.task.createdAt),
          updatedAt: new Date(data.task.updatedAt)
        }

        setTasks(prev => prev.map(t => t.id === tempId ? createdTask : t))
        if (newTask.tags && newTask.tags.length > 0) {
          tagManager.setItemTags(createdTask.id, 'task', newTask.tags)
        }
      } catch (error) {
        console.error('Failed to sync new task, queuing offline action:', error)
        
        const newAction: SyncAction = {
          type: 'CREATE',
          taskId: tempId,
          data: newTask,
          timestamp: Date.now()
        }
        try {
          const savedActions = localStorage.getItem('pending_sync_actions')
          const actions: SyncAction[] = savedActions ? JSON.parse(savedActions) : []
          actions.push(newAction)
          localStorage.setItem('pending_sync_actions', JSON.stringify(actions))
        } catch (e) {
          console.error('Failed to save pending sync actions:', e)
        }

        showNotification({
          type: 'warning',
          title: 'Offline Task Created',
          message: 'Task created locally. It will sync automatically when online.'
        })
      }
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const originalStatus = task.status
    const previousTasks = [...tasks]

    // Optimistic Update
    setTasks(tasks.map(t =>
      t.id === taskId
        ? { ...t, status: newStatus, updatedAt: new Date() }
        : t
    ))

    if (newStatus === 'COMPLETED') {
      notifications.task.completed(task.title)

      // Trigger completion automation
      automationEngine.executeRules('task_completed', {
        taskId: task.id,
        title: task.title,
        priority: task.priority,
        status: newStatus
      })
    }

    // Trigger status change automation
    automationEngine.executeRules('task_status_changed', {
      taskId: task.id,
      title: task.title,
      priority: task.priority,
      status: newStatus,
      oldStatus: task.status
    })

    if (isAuthenticated) {
      if (hasQueue()) {
        const newAction: SyncAction = {
          type: 'UPDATE',
          taskId,
          data: { status: newStatus },
          timestamp: Date.now()
        }
        try {
          const savedActions = localStorage.getItem('pending_sync_actions')
          const actions: SyncAction[] = savedActions ? JSON.parse(savedActions) : []
          actions.push(newAction)
          localStorage.setItem('pending_sync_actions', JSON.stringify(actions))
        } catch (e) {
          console.error('Failed to queue offline update:', e)
        }
        showNotification({
          type: 'info',
          title: 'Sync Queued',
          message: 'Task status update queued to sync behind other offline updates.'
        })
        syncPendingActions()
        return
      }

      try {
        const res = await fetch(`/api/tasks?id=${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })

        if (!res.ok) {
          throw new Error('Failed to update task status on server')
        }
      } catch (error) {
        console.error('Failed to sync task status update, queuing offline action:', error)
        
        const newAction: SyncAction = {
          type: 'UPDATE',
          taskId,
          data: { status: newStatus },
          timestamp: Date.now()
        }
        try {
          const savedActions = localStorage.getItem('pending_sync_actions')
          const actions: SyncAction[] = savedActions ? JSON.parse(savedActions) : []
          actions.push(newAction)
          localStorage.setItem('pending_sync_actions', JSON.stringify(actions))
        } catch (e) {
          console.error('Failed to save pending sync actions to localStorage:', e)
        }

        showNotification({
          type: 'warning',
          title: 'Offline Update Saved',
          message: 'Changes saved locally. They will sync automatically when online.'
        })
      }
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const previousTasks = [...tasks]

    // Optimistic Update
    setTasks(tasks.filter(t => t.id !== taskId))

    showNotification({
      type: 'success',
      title: 'Task deleted',
      message: `"${task.title}" has been removed`
    })

    if (isAuthenticated) {
      if (hasQueue()) {
        const newAction: SyncAction = {
          type: 'DELETE',
          taskId,
          timestamp: Date.now()
        }
        try {
          const savedActions = localStorage.getItem('pending_sync_actions')
          const actions: SyncAction[] = savedActions ? JSON.parse(savedActions) : []
          actions.push(newAction)
          localStorage.setItem('pending_sync_actions', JSON.stringify(actions))
        } catch (e) {
          console.error('Failed to queue offline deletion:', e)
        }
        showNotification({
          type: 'info',
          title: 'Sync Queued',
          message: 'Task deletion queued to sync behind other offline updates.'
        })
        syncPendingActions()
        return
      }

      try {
        const res = await fetch(`/api/tasks?id=${taskId}`, {
          method: 'DELETE'
        })

        if (!res.ok) {
          throw new Error('Failed to delete task on server')
        }
      } catch (error) {
        console.error('Failed to sync task deletion, queuing offline action:', error)
        
        const newAction: SyncAction = {
          type: 'DELETE',
          taskId,
          timestamp: Date.now()
        }
        try {
          const savedActions = localStorage.getItem('pending_sync_actions')
          const actions: SyncAction[] = savedActions ? JSON.parse(savedActions) : []
          actions.push(newAction)
          localStorage.setItem('pending_sync_actions', JSON.stringify(actions))
        } catch (e) {
          console.error('Failed to save pending sync actions to localStorage:', e)
        }

        showNotification({
          type: 'warning',
          title: 'Offline Deletion Saved',
          message: 'Task deletion queued locally. It will sync automatically when online.'
        })
      }
    }
  }

  // Bulk operations
  const handleToggleSelectTask = (taskId: string) => {
    const newSelection = new Set(selectedTasks)
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId)
    } else {
      newSelection.add(taskId)
    }
    setSelectedTasks(newSelection)
  }

  const handleBulkDelete = async () => {
    if (!bulkOperationUtils.confirmDelete(selectedTasks.size)) return

    const previousTasks = [...tasks]
    const idsToDelete = Array.from(selectedTasks)

    // Optimistic Update
    setTasks(tasks.filter(t => !selectedTasks.has(t.id)))
    setSelectedTasks(new Set())

    showNotification({
      type: 'success',
      title: 'Tasks deleted',
      message: `${idsToDelete.length} task(s) removed`
    })

    if (isAuthenticated) {
      if (hasQueue()) {
        try {
          const savedActions = localStorage.getItem('pending_sync_actions')
          const actions: SyncAction[] = savedActions ? JSON.parse(savedActions) : []
          idsToDelete.forEach(id => {
            actions.push({
              type: 'DELETE',
              taskId: id,
              timestamp: Date.now()
            })
          })
          localStorage.setItem('pending_sync_actions', JSON.stringify(actions))
        } catch (e) {
          console.error('Failed to queue offline bulk deletions:', e)
        }
        showNotification({
          type: 'info',
          title: 'Sync Queued',
          message: `${idsToDelete.length} task(s) deletion queued to sync behind other offline updates.`
        })
        syncPendingActions()
        return
      }

      try {
        const res = await fetch('/api/tasks', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: idsToDelete })
        })

        if (!res.ok) {
          throw new Error('Failed to delete tasks on server')
        }
      } catch (error) {
        console.error('Failed to sync bulk task deletion, queuing offline actions:', error)
        
        try {
          const savedActions = localStorage.getItem('pending_sync_actions')
          const actions: SyncAction[] = savedActions ? JSON.parse(savedActions) : []
          idsToDelete.forEach(id => {
            actions.push({
              type: 'DELETE',
              taskId: id,
              timestamp: Date.now()
            })
          })
          localStorage.setItem('pending_sync_actions', JSON.stringify(actions))
        } catch (e) {
          console.error('Failed to save pending sync actions:', e)
        }

        showNotification({
          type: 'warning',
          title: 'Offline Bulk Deletion Saved',
          message: `${idsToDelete.length} task(s) queued for deletion. They will sync automatically when online.`
        })
      }
    }
  }

  const handleBulkTag = () => {
    setIsTagManagerOpen(true)
  }

  const handleAdvancedSearch = (query: SearchQuery) => {
    setActiveSearchQuery(query)
    setIsAdvancedSearchOpen(false)
  }

  const handleSavedSearchSelect = (query: SearchQuery) => {
    setActiveSearchQuery(query)
  }

  const clearAdvancedSearch = () => {
    setActiveSearchQuery(null)
    setSearchQuery('')
  }

  // Filter tasks based on search and priority
  const filteredTasks = activeSearchQuery
    ? advancedSearch.search(tasks as SearchableItem[], activeSearchQuery) as Task[]
    : tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              task.description?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesPriority = filterPriority === 'all' || task.priority === filterPriority

        // Tag filtering
        const matchesTags = filterTagIds.length === 0 ||
          (task.tags && task.tags.some(tagId => filterTagIds.includes(tagId)))

        return matchesSearch && matchesPriority && matchesTags
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
      <div className="w-full">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Task Management
              </h1>
              {syncStatus === 'synced' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Cloud Synced
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Organize and track your team&apos;s work
            </p>
          </div>
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

            {/* Tag Filter */}
            <TagFilter
              selectedTagIds={filterTagIds}
              onChange={setFilterTagIds}
            />

            {/* Tag Manager */}
            <button
              onClick={() => setIsTagManagerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              title="Manage Tags"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Advanced Search */}
            <button
              onClick={() => setIsAdvancedSearchOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              title="Advanced Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Saved Searches */}
            <button
              onClick={() => setIsSavedSearchesOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              title="Saved Searches"
            >
              <Star className="w-4 h-4" />
            </button>

            {/* Automation */}
            <button
              onClick={() => setIsAutomationManagerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
              title="Automation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>

            {/* Create button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Main Content with Sidebar Layout */}
        <div className="flex gap-6">
          {/* Kanban Board */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {COLUMNS.map(column => (
                <TaskColumn
                  key={column.id}
                  column={column}
                  tasks={filteredTasks.filter(task => task.status === column.id)}
                  onUpdateStatus={handleUpdateTaskStatus}
                  onDeleteTask={handleDeleteTask}
                  selectedTasks={selectedTasks}
                  onToggleSelect={handleToggleSelectTask}
                />
              ))}
            </div>
          </div>

          {/* Suggestions Sidebar */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <AISuggestionsPanel />
            </div>
          </div>
        </div>

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selectedTasks.size}
          onClearSelection={() => setSelectedTasks(new Set())}
          onDelete={handleBulkDelete}
          onTag={handleBulkTag}
          itemType="task"
        />

        {/* Create Task Modal */}
        {isCreateModalOpen && (
          <CreateTaskModal
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreateTask}
          />
        )}

        {/* Tag Manager Modal */}
        <TagManager
          isOpen={isTagManagerOpen}
          onClose={() => setIsTagManagerOpen(false)}
        />

        {/* Template Manager Modal */}
        <TemplateManager
          isOpen={isTemplateManagerOpen}
          onClose={() => setIsTemplateManagerOpen(false)}
          type="task"
        />

        {/* Advanced Search Modal */}
        <AdvancedSearch
          isOpen={isAdvancedSearchOpen}
          onClose={() => setIsAdvancedSearchOpen(false)}
          onSearch={handleAdvancedSearch}
          entityType="task"
        />

        {/* Saved Searches Modal */}
        <SavedSearches
          isOpen={isSavedSearchesOpen}
          onClose={() => setIsSavedSearchesOpen(false)}
          onSelectSearch={handleSavedSearchSelect}
          entityType="task"
        />

        {/* Automation Manager Modal */}
        <AutomationManager
          isOpen={isAutomationManagerOpen}
          onClose={() => setIsAutomationManagerOpen(false)}
        />
      </div>
    </div>
  )
}