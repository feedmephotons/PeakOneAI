export type TemplateType = 'task' | 'message' | 'meeting' | 'email'

export interface Template {
  id: string
  name: string
  type: TemplateType
  content: string
  variables: string[] // e.g., ['name', 'date', 'project']
  metadata?: Record<string, unknown>
  isShared?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TaskTemplate extends Template {
  type: 'task'
  metadata?: {
    priority?: string
    status?: string
    tags?: string[]
  }
}

export interface MessageTemplate extends Template {
  type: 'message'
  metadata?: {
    subject?: string
    attachments?: boolean
  }
}

export interface MeetingTemplate extends Template {
  type: 'meeting'
  metadata?: {
    duration?: number
    agenda?: string[]
    participants?: string[]
  }
}

class TemplateManager {
  private storageKey = 'user_templates'

  getTemplates(type?: TemplateType): Template[] {
    const templates = localStorage.getItem(this.storageKey)
    if (!templates) return []

    const parsed = JSON.parse(templates).map((t: Template) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt)
    }))

    return type ? parsed.filter(t => t.type === type) : parsed
  }

  getTemplate(id: string): Template | undefined {
    return this.getTemplates().find(t => t.id === id)
  }

  createTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Template {
    const templates = this.getTemplates()
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    templates.push(newTemplate)
    localStorage.setItem(this.storageKey, JSON.stringify(templates))
    return newTemplate
  }

  updateTemplate(id: string, updates: Partial<Omit<Template, 'id' | 'createdAt'>>): Template | undefined {
    const templates = this.getTemplates()
    const index = templates.findIndex(t => t.id === id)

    if (index === -1) return undefined

    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date()
    }

    localStorage.setItem(this.storageKey, JSON.stringify(templates))
    return templates[index]
  }

  deleteTemplate(id: string): boolean {
    const templates = this.getTemplates()
    const filtered = templates.filter(t => t.id !== id)

    if (filtered.length === templates.length) return false

    localStorage.setItem(this.storageKey, JSON.stringify(filtered))
    return true
  }

  // Variable extraction and replacement
  extractVariables(content: string): string[] {
    const regex = /\{(\w+)\}/g
    const matches = content.matchAll(regex)
    const variables = new Set<string>()

    for (const match of matches) {
      variables.add(match[1])
    }

    return Array.from(variables)
  }

  applyTemplate(template: Template, values: Record<string, string>): string {
    let result = template.content

    template.variables.forEach(variable => {
      const value = values[variable] || `{${variable}}`
      result = result.replace(new RegExp(`\\{${variable}\\}`, 'g'), value)
    })

    return result
  }

  // Common template presets
  getPresetTemplates(type: TemplateType): Omit<Template, 'id' | 'createdAt' | 'updatedAt'>[] {
    const presets: Record<TemplateType, Omit<Template, 'id' | 'createdAt' | 'updatedAt'>[]> = {
      task: [
        {
          name: 'Daily Standup',
          type: 'task',
          content: 'Daily Standup - {date}\n\nWhat I did yesterday:\n- \n\nWhat I\'ll do today:\n- \n\nBlockers:\n- ',
          variables: ['date'],
          metadata: { priority: 'MEDIUM', status: 'TODO' }
        },
        {
          name: 'Bug Report',
          type: 'task',
          content: 'Bug: {title}\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected behavior:\n\n\nActual behavior:\n\n\nEnvironment: {environment}',
          variables: ['title', 'environment'],
          metadata: { priority: 'HIGH', status: 'TODO', tags: ['bug'] }
        },
        {
          name: 'Feature Request',
          type: 'task',
          content: 'Feature: {feature_name}\n\nDescription:\n{description}\n\nUser Story:\nAs a {user_type}, I want to {goal}, so that {benefit}.\n\nAcceptance Criteria:\n- \n- \n- ',
          variables: ['feature_name', 'description', 'user_type', 'goal', 'benefit'],
          metadata: { priority: 'MEDIUM', status: 'TODO', tags: ['feature'] }
        }
      ],
      message: [
        {
          name: 'Team Announcement',
          type: 'message',
          content: 'Hi Team,\n\nI wanted to share an update about {topic}.\n\n{details}\n\nPlease let me know if you have any questions.\n\nBest,\n{name}',
          variables: ['topic', 'details', 'name'],
          metadata: { subject: 'Team Update: {topic}' }
        },
        {
          name: 'Meeting Follow-up',
          type: 'message',
          content: 'Hi {recipient},\n\nThank you for joining the {meeting_name} meeting today.\n\nKey takeaways:\n- \n- \n\nAction items:\n- \n- \n\nNext steps:\n{next_steps}\n\nBest,\n{sender}',
          variables: ['recipient', 'meeting_name', 'next_steps', 'sender']
        }
      ],
      meeting: [
        {
          name: 'Sprint Planning',
          type: 'meeting',
          content: 'Sprint Planning - {sprint_name}\n\nAgenda:\n1. Review previous sprint\n2. Discuss sprint goals\n3. Estimate user stories\n4. Assign tasks\n\nDuration: {duration} minutes',
          variables: ['sprint_name', 'duration'],
          metadata: { duration: 60, agenda: ['Review', 'Goals', 'Estimation', 'Assignment'] }
        },
        {
          name: 'Client Demo',
          type: 'meeting',
          content: 'Client Demo - {client_name}\n\nAgenda:\n1. Introduction\n2. Demo new features\n3. Q&A\n4. Next steps\n\nFeatures to demo:\n- {features}',
          variables: ['client_name', 'features'],
          metadata: { duration: 30 }
        }
      ],
      email: [
        {
          name: 'Status Update',
          type: 'email',
          content: 'Subject: {project_name} - Status Update\n\nHi {recipient},\n\nHere\'s the latest update on {project_name}:\n\nProgress: {progress}%\nCompleted:\n- \n\nIn Progress:\n- \n\nUpcoming:\n- \n\nLet me know if you need any additional information.\n\nBest regards,\n{sender}',
          variables: ['project_name', 'recipient', 'progress', 'sender']
        }
      ]
    }

    return presets[type] || []
  }

  installPreset(preset: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Template {
    return this.createTemplate(preset)
  }
}

export const templateManager = new TemplateManager()
