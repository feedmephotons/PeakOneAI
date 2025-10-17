'use client'

import { useState } from 'react'
import { CheckSquare, X, Calendar, User, Flag, Sparkles, ArrowRight } from 'lucide-react'
import { aiContext } from '@/lib/ai-context'

interface ActionItem {
  id: string
  text: string
  assignee?: string
  dueDate?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  context?: string
  timestamp?: string
}

interface MeetingToTaskConverterProps {
  meetingId: string
  meetingTitle: string
  actionItems: ActionItem[]
  onClose: () => void
  onTasksCreated: (count: number) => void
}

export default function MeetingToTaskConverter({
  meetingId,
  meetingTitle,
  actionItems,
  onClose,
  onTasksCreated
}: MeetingToTaskConverterProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(actionItems.map(item => item.id))
  )
  const [taskData, setTaskData] = useState<Record<string, Partial<ActionItem>>>(
    Object.fromEntries(actionItems.map(item => [item.id, {
      assignee: item.assignee,
      dueDate: item.dueDate,
      priority: item.priority || 'MEDIUM'
    }]))
  )

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const updateTaskData = (id: string, field: string, value: string) => {
    setTaskData({
      ...taskData,
      [id]: {
        ...taskData[id],
        [field]: value
      }
    })
  }

  const handleCreateTasks = () => {
    const selectedActionItems = actionItems.filter(item => selectedItems.has(item.id))

    selectedActionItems.forEach(item => {
      const data = taskData[item.id]

      // Create task entity in context system
      const taskEntity = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'task' as const,
        title: item.text,
        createdAt: new Date(),
        metadata: {
          priority: data.priority,
          assignee: data.assignee,
          dueDate: data.dueDate,
          sourceType: 'meeting',
          sourceId: meetingId
        }
      }

      aiContext.registerEntity(taskEntity)

      // Create reference from meeting to task
      aiContext.createReference({
        sourceEntity: {
          id: meetingId,
          type: 'meeting',
          title: meetingTitle,
          createdAt: new Date()
        },
        targetEntity: taskEntity,
        context: item.context || `Action item from ${meetingTitle}`,
        timestamp: new Date(),
        speaker: item.assignee,
        confidence: 95
      })

      // Add AI insight
      aiContext.addInsight({
        entityId: taskEntity.id,
        entityType: 'task',
        insightType: 'action',
        text: `Created from ${meetingTitle}`,
        confidence: 100,
        timestamp: new Date(),
        relatedEntities: [meetingId]
      })

      // In a real app, you would also create the task in your task management system
      // For now, we'll just save to localStorage
      const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]')
      existingTasks.push({
        id: taskEntity.id,
        title: item.text,
        description: `From meeting: ${meetingTitle}\n\n${item.context || ''}`,
        status: 'TODO',
        priority: data.priority,
        assignee: data.assignee ? {
          id: data.assignee,
          name: data.assignee
        } : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        tags: ['from-meeting'],
        attachments: 0,
        comments: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      localStorage.setItem('tasks', JSON.stringify(existingTasks))
    })

    onTasksCreated(selectedItems.size)
    onClose()
  }

  const priorityColors = {
    LOW: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Convert to Tasks</h2>
                  <p className="text-sm text-white/80">From: {meetingTitle}</p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4 bg-white/10 backdrop-blur-xl rounded-lg px-4 py-3">
            <CheckSquare className="w-5 h-5 text-white" />
            <span className="text-white font-medium">
              {selectedItems.size} of {actionItems.length} action items selected
            </span>
          </div>
        </div>

        {/* Action Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {actionItems.map((item) => {
              const isSelected = selectedItems.has(item.id)
              const data = taskData[item.id] || {}

              return (
                <div
                  key={item.id}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <label className="flex items-center cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItem(item.id)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                    </label>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      {/* Task Title */}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {item.text}
                        </h3>
                        {item.context && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.context}
                          </p>
                        )}
                        {item.timestamp && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Mentioned at {item.timestamp}
                          </p>
                        )}
                      </div>

                      {/* Task Properties */}
                      {isSelected && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          {/* Assignee */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Assignee
                            </label>
                            <input
                              type="text"
                              value={data.assignee || ''}
                              onChange={(e) => updateTaskData(item.id, 'assignee', e.target.value)}
                              placeholder="Enter name..."
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                          </div>

                          {/* Due Date */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due Date
                            </label>
                            <input
                              type="date"
                              value={data.dueDate || ''}
                              onChange={(e) => updateTaskData(item.id, 'dueDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                          </div>

                          {/* Priority */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                              <Flag className="w-3 h-3" />
                              Priority
                            </label>
                            <select
                              value={data.priority || 'MEDIUM'}
                              onChange={(e) => updateTaskData(item.id, 'priority', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                              <option value="LOW">Low</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HIGH">High</option>
                              <option value="URGENT">Urgent</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Priority Badge */}
                    {isSelected && data.priority && (
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[data.priority as keyof typeof priorityColors]}`}>
                        {data.priority}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Tasks will be created with links back to this meeting</p>
              <p className="text-xs mt-1">You can find them in the Tasks page with the "from-meeting" tag</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTasks}
                disabled={selectedItems.size === 0}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                Create {selectedItems.size} Task{selectedItems.size !== 1 ? 's' : ''}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
