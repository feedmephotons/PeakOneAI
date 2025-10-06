export type TriggerType =
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'task_status_changed'
  | 'task_priority_changed'
  | 'file_uploaded'
  | 'file_shared'
  | 'message_received'
  | 'event_created'
  | 'tag_added'
  | 'due_date_approaching'
  | 'schedule'

export type ActionType =
  | 'create_task'
  | 'update_task'
  | 'send_notification'
  | 'send_email'
  | 'add_tag'
  | 'move_to_folder'
  | 'assign_to_user'
  | 'set_priority'
  | 'set_due_date'
  | 'create_event'
  | 'webhook'

export interface TriggerCondition {
  type: TriggerType
  field?: string
  operator?: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'not_equals'
  value?: unknown
}

export interface AutomationAction {
  type: ActionType
  params: Record<string, unknown>
}

export interface AutomationRule {
  id: string
  name: string
  description?: string
  enabled: boolean
  trigger: TriggerCondition
  conditions?: TriggerCondition[]
  actions: AutomationAction[]
  createdAt: Date
  updatedAt: Date
  lastRun?: Date
  runCount: number
}

export interface RuleExecution {
  ruleId: string
  timestamp: Date
  success: boolean
  error?: string
  context: Record<string, unknown>
}

class AutomationEngine {
  private rulesKey = 'automation_rules'
  private executionLogKey = 'automation_executions'
  private maxExecutions = 100

  getRules(): AutomationRule[] {
    const rules = localStorage.getItem(this.rulesKey)
    if (!rules) return []

    return JSON.parse(rules).map((r: AutomationRule) => ({
      ...r,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
      lastRun: r.lastRun ? new Date(r.lastRun) : undefined
    }))
  }

  getRule(id: string): AutomationRule | undefined {
    return this.getRules().find(r => r.id === id)
  }

  createRule(rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'runCount'>): AutomationRule {
    const rules = this.getRules()
    const newRule: AutomationRule = {
      ...rule,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
      runCount: 0
    }

    rules.push(newRule)
    localStorage.setItem(this.rulesKey, JSON.stringify(rules))
    return newRule
  }

  updateRule(id: string, updates: Partial<Omit<AutomationRule, 'id' | 'createdAt'>>): AutomationRule | undefined {
    const rules = this.getRules()
    const index = rules.findIndex(r => r.id === id)

    if (index === -1) return undefined

    rules[index] = {
      ...rules[index],
      ...updates,
      updatedAt: new Date()
    }

    localStorage.setItem(this.rulesKey, JSON.stringify(rules))
    return rules[index]
  }

  deleteRule(id: string): boolean {
    const rules = this.getRules()
    const filtered = rules.filter(r => r.id !== id)

    if (filtered.length === rules.length) return false

    localStorage.setItem(this.rulesKey, JSON.stringify(filtered))
    return true
  }

  toggleRule(id: string): boolean {
    const rule = this.getRule(id)
    if (!rule) return false

    this.updateRule(id, { enabled: !rule.enabled })
    return true
  }

  // Execute rules based on trigger
  async executeRules(triggerType: TriggerType, context: Record<string, unknown>): Promise<void> {
    const rules = this.getRules().filter(r =>
      r.enabled && r.trigger.type === triggerType
    )

    for (const rule of rules) {
      try {
        // Check trigger condition
        if (rule.trigger.field && rule.trigger.operator && rule.trigger.value !== undefined) {
          const fieldValue = context[rule.trigger.field]
          if (!this.evaluateCondition(fieldValue, rule.trigger.operator, rule.trigger.value)) {
            continue
          }
        }

        // Check additional conditions
        if (rule.conditions && rule.conditions.length > 0) {
          const allConditionsMet = rule.conditions.every(condition => {
            if (!condition.field) return true
            const fieldValue = context[condition.field]
            return this.evaluateCondition(
              fieldValue,
              condition.operator || 'equals',
              condition.value
            )
          })

          if (!allConditionsMet) continue
        }

        // Execute actions
        for (const action of rule.actions) {
          await this.executeAction(action, context)
        }

        // Log successful execution
        this.logExecution(rule.id, true, context)

        // Update rule stats
        this.updateRule(rule.id, {
          lastRun: new Date(),
          runCount: rule.runCount + 1
        })

      } catch (error) {
        this.logExecution(rule.id, false, context, error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }

  private evaluateCondition(
    fieldValue: unknown,
    operator: string,
    expectedValue: unknown
  ): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === expectedValue
      case 'not_equals':
        return fieldValue !== expectedValue
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(expectedValue).toLowerCase())
      case 'greater_than':
        return Number(fieldValue) > Number(expectedValue)
      case 'less_than':
        return Number(fieldValue) < Number(expectedValue)
      default:
        return false
    }
  }

  private async executeAction(action: AutomationAction, context: Record<string, unknown>): Promise<void> {
    switch (action.type) {
      case 'create_task':
        this.createTaskAction(action.params, context)
        break
      case 'send_notification':
        this.sendNotificationAction(action.params, context)
        break
      case 'add_tag':
        this.addTagAction(action.params, context)
        break
      case 'set_priority':
        this.setPriorityAction(action.params, context)
        break
      case 'assign_to_user':
        this.assignToUserAction(action.params, context)
        break
      default:
        console.log(`Action ${action.type} not yet implemented`)
    }
  }

  private createTaskAction(params: Record<string, unknown>, context: Record<string, unknown>): void {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    const newTask = {
      id: Date.now().toString(),
      title: String(params.title || 'Automated Task'),
      description: String(params.description || ''),
      status: params.status || 'TODO',
      priority: params.priority || 'MEDIUM',
      tags: params.tags || [],
      attachments: 0,
      comments: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    tasks.push(newTask)
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }

  private sendNotificationAction(params: Record<string, unknown>, context: Record<string, unknown>): void {
    // In a real app, this would trigger the notification system
    console.log('Notification:', params.message)

    // For now, we'll show a browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(String(params.title || 'Automation'), {
        body: String(params.message || '')
      })
    }
  }

  private addTagAction(params: Record<string, unknown>, context: Record<string, unknown>): void {
    if (!context.itemId || !context.itemType) return

    const tagId = String(params.tagId)
    const itemId = String(context.itemId)
    const itemType = String(context.itemType)

    // This would integrate with the tag manager
    const mapping = JSON.parse(localStorage.getItem('item_tags_mapping') || '{}')
    const key = `${itemType}:${itemId}`
    mapping[key] = mapping[key] || []
    if (!mapping[key].includes(tagId)) {
      mapping[key].push(tagId)
      localStorage.setItem('item_tags_mapping', JSON.stringify(mapping))
    }
  }

  private setPriorityAction(params: Record<string, unknown>, context: Record<string, unknown>): void {
    if (!context.taskId) return

    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    const taskIndex = tasks.findIndex((t: { id: string }) => t.id === context.taskId)

    if (taskIndex !== -1) {
      tasks[taskIndex].priority = params.priority
      tasks[taskIndex].updatedAt = new Date()
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }
  }

  private assignToUserAction(params: Record<string, unknown>, context: Record<string, unknown>): void {
    if (!context.taskId) return

    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    const taskIndex = tasks.findIndex((t: { id: string }) => t.id === context.taskId)

    if (taskIndex !== -1) {
      tasks[taskIndex].assignee = params.user
      tasks[taskIndex].updatedAt = new Date()
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }
  }

  private logExecution(ruleId: string, success: boolean, context: Record<string, unknown>, error?: string): void {
    const executions = this.getExecutions()
    const execution: RuleExecution = {
      ruleId,
      timestamp: new Date(),
      success,
      error,
      context
    }

    executions.unshift(execution)

    // Keep only recent executions
    const trimmed = executions.slice(0, this.maxExecutions)
    localStorage.setItem(this.executionLogKey, JSON.stringify(trimmed))
  }

  getExecutions(ruleId?: string): RuleExecution[] {
    const executions = localStorage.getItem(this.executionLogKey)
    if (!executions) return []

    const parsed = JSON.parse(executions).map((e: RuleExecution) => ({
      ...e,
      timestamp: new Date(e.timestamp)
    }))

    return ruleId ? parsed.filter((e: RuleExecution) => e.ruleId === ruleId) : parsed
  }

  clearExecutions(): void {
    localStorage.removeItem(this.executionLogKey)
  }

  // Preset rules
  getPresetRules(): Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'runCount'>[] {
    return [
      {
        name: 'Auto-tag urgent tasks',
        description: 'Automatically add "urgent" tag to high priority tasks',
        enabled: true,
        trigger: {
          type: 'task_created'
        },
        conditions: [{
          type: 'task_created',
          field: 'priority',
          operator: 'equals',
          value: 'URGENT'
        }],
        actions: [{
          type: 'add_tag',
          params: { tagId: 'urgent' }
        }]
      },
      {
        name: 'Notify on task completion',
        description: 'Send notification when a task is marked as completed',
        enabled: true,
        trigger: {
          type: 'task_completed'
        },
        actions: [{
          type: 'send_notification',
          params: {
            title: 'Task Completed',
            message: 'A task has been marked as completed!'
          }
        }]
      },
      {
        name: 'Create follow-up task',
        description: 'Create a follow-up task when high priority task is completed',
        enabled: false,
        trigger: {
          type: 'task_completed'
        },
        conditions: [{
          type: 'task_completed',
          field: 'priority',
          operator: 'equals',
          value: 'HIGH'
        }],
        actions: [{
          type: 'create_task',
          params: {
            title: 'Follow up on completed high priority task',
            status: 'TODO',
            priority: 'MEDIUM'
          }
        }]
      }
    ]
  }

  installPreset(preset: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'runCount'>): AutomationRule {
    return this.createRule(preset)
  }
}

export const automationEngine = new AutomationEngine()
