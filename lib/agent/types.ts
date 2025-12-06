// Agent Types for Computer Use Agent

export type AgentStatus = 'idle' | 'planning' | 'executing' | 'paused' | 'completed' | 'failed'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
export type ActionType =
  | 'navigate'
  | 'click'
  | 'type'
  | 'scroll'
  | 'wait'
  | 'screenshot'
  | 'extract'
  | 'hover'
  | 'select'
  | 'press_key'
  | 'drag'
  | 'evaluate'

export interface BrowserConfig {
  headless: boolean
  viewport: {
    width: number
    height: number
  }
  userAgent?: string
  timeout?: number
}

export interface ElementSelector {
  type: 'css' | 'xpath' | 'text' | 'aria' | 'id'
  value: string
  description?: string
}

export interface BrowserAction {
  id: string
  type: ActionType
  selector?: ElementSelector
  value?: string // For type, navigate, select actions
  options?: {
    delay?: number
    button?: 'left' | 'right' | 'middle'
    clickCount?: number
    key?: string // For press_key
    scrollAmount?: number
    waitFor?: 'load' | 'networkidle' | 'domcontentloaded' | number
    extractFields?: string[]
  }
  description: string
  retryCount?: number
  timeout?: number
}

export interface ActionResult {
  actionId: string
  success: boolean
  data?: unknown
  error?: string
  screenshot?: string // Base64 encoded
  duration: number
  timestamp: Date
}

export interface AgentTask {
  id: string
  sessionId: string
  description: string
  status: TaskStatus
  actions: BrowserAction[]
  results: ActionResult[]
  startUrl?: string
  extractedData?: Record<string, unknown>
  order: number
  parentTaskId?: string
  createdAt: Date
  completedAt?: Date
}

export interface AgentSession {
  id: string
  workspaceId: string
  userId: string
  status: AgentStatus
  objective: string
  tasks: AgentTask[]
  currentTaskId?: string
  currentUrl?: string
  liveViewUrl?: string
  metadata?: Record<string, unknown>
  startedAt: Date
  completedAt?: Date
  error?: string
}

export interface PageAnalysis {
  url: string
  title: string
  elements: InteractiveElement[]
  forms: FormAnalysis[]
  navigation: NavigationElement[]
  content: ContentExtract
  screenshot: string
}

export interface InteractiveElement {
  selector: ElementSelector
  type: 'button' | 'link' | 'input' | 'select' | 'checkbox' | 'radio' | 'textarea'
  text?: string
  ariaLabel?: string
  placeholder?: string
  value?: string
  isVisible: boolean
  isEnabled: boolean
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface FormAnalysis {
  selector: ElementSelector
  action?: string
  method?: string
  fields: InteractiveElement[]
  submitButton?: InteractiveElement
}

export interface NavigationElement {
  text: string
  href: string
  selector: ElementSelector
  isExternal: boolean
}

export interface ContentExtract {
  headings: { level: number; text: string }[]
  paragraphs: string[]
  tables: { headers: string[]; rows: string[][] }[]
  lists: string[][]
  images: { src: string; alt: string }[]
}

export interface TaskPlan {
  objective: string
  estimatedSteps: number
  tasks: {
    description: string
    actions: Partial<BrowserAction>[]
    expectedOutcome: string
  }[]
  fallbackStrategies?: string[]
}

export interface AgentMessage {
  id: string
  sessionId: string
  role: 'user' | 'agent' | 'system'
  content: string
  attachments?: {
    type: 'screenshot' | 'data' | 'error'
    data: unknown
  }[]
  timestamp: Date
}

export interface LiveViewState {
  screenshot: string
  url: string
  status: AgentStatus
  currentAction?: string
  progress: {
    completedTasks: number
    totalTasks: number
    currentTask?: string
  }
  logs: {
    timestamp: Date
    level: 'info' | 'warn' | 'error' | 'success'
    message: string
  }[]
}

export interface AgentConfig {
  browser: BrowserConfig
  maxRetries: number
  screenshotOnError: boolean
  screenshotOnAction: boolean
  maxSessionDuration: number // in milliseconds
  allowedDomains?: string[]
  blockedDomains?: string[]
  extractionRules?: {
    pattern: string
    fields: string[]
  }[]
}
