import { browserManager } from './browser-manager'
import { actionExecutor } from './action-executor'
import { taskPlanner } from './task-planner'
import { prisma } from '@/lib/prisma'
import type {
  AgentSession,
  AgentTask,
  AgentStatus,
  LiveViewState,
  AgentMessage,
  AgentConfig
} from './types'

const DEFAULT_CONFIG: Partial<AgentConfig> = {
  browser: {
    headless: true,
    viewport: { width: 1280, height: 720 }
  },
  maxRetries: 3,
  screenshotOnError: true,
  screenshotOnAction: true,
  maxSessionDuration: 30 * 60 * 1000 // 30 minutes
}

interface SessionState {
  session: AgentSession
  tasks: AgentTask[]
  messages: AgentMessage[]
  logs: { timestamp: Date; level: 'info' | 'warn' | 'error' | 'success'; message: string }[]
  isPaused: boolean
  isCancelled: boolean
}

class SessionManager {
  private sessions: Map<string, SessionState> = new Map()
  private config: AgentConfig

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as AgentConfig
  }

  async createSession(
    workspaceId: string,
    userId: string,
    objective: string,
    startUrl?: string
  ): Promise<AgentSession> {
    // Create session in database
    const dbSession = await prisma.agentSession.create({
      data: {
        workspaceId,
        userId,
        objective,
        status: 'PLANNING',
        startUrl
      }
    })

    const session: AgentSession = {
      id: dbSession.id,
      workspaceId,
      userId,
      status: 'planning',
      objective,
      tasks: [],
      currentUrl: startUrl,
      startedAt: new Date()
    }

    const state: SessionState = {
      session,
      tasks: [],
      messages: [],
      logs: [],
      isPaused: false,
      isCancelled: false
    }

    this.sessions.set(session.id, state)
    this.addLog(session.id, 'info', `Session created with objective: ${objective}`)

    return session
  }

  async startSession(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (!state) throw new Error(`Session not found: ${sessionId}`)

    try {
      // Initialize browser
      await browserManager.createSession(sessionId, this.config.browser)
      this.addLog(sessionId, 'info', 'Browser initialized')

      // Navigate to start URL if provided
      if (state.session.currentUrl) {
        await browserManager.navigate(sessionId, state.session.currentUrl)
        this.addLog(sessionId, 'info', `Navigated to ${state.session.currentUrl}`)
      }

      // Create initial plan
      await this.updateStatus(sessionId, 'planning')
      const pageAnalysis = await browserManager.analyzePage(sessionId)

      const plan = await taskPlanner.createPlan({
        objective: state.session.objective,
        currentUrl: state.session.currentUrl,
        pageAnalysis
      })

      this.addLog(sessionId, 'info', `Plan created with ${plan.tasks.length} tasks`)

      // Create tasks from plan
      for (let i = 0; i < plan.tasks.length; i++) {
        const planTask = plan.tasks[i]
        const task: AgentTask = {
          id: `task-${sessionId}-${i}`,
          sessionId,
          description: planTask.description,
          status: 'pending',
          actions: [],
          results: [],
          order: i,
          createdAt: new Date()
        }
        state.tasks.push(task)

        // Save to database
        await prisma.agentTask.create({
          data: {
            sessionId,
            description: planTask.description,
            status: 'PENDING',
            actions: [],
            results: [],
            order: i
          }
        })
      }

      // Start execution
      await this.executeSession(sessionId)

    } catch (error) {
      this.addLog(sessionId, 'error', `Session start failed: ${error}`)
      await this.updateStatus(sessionId, 'failed')
      throw error
    }
  }

  private async executeSession(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (!state) throw new Error(`Session not found: ${sessionId}`)

    await this.updateStatus(sessionId, 'executing')

    for (const task of state.tasks) {
      // Check for pause/cancel
      if (state.isPaused) {
        this.addLog(sessionId, 'info', 'Session paused')
        await this.updateStatus(sessionId, 'paused')
        return
      }

      if (state.isCancelled) {
        this.addLog(sessionId, 'info', 'Session cancelled')
        await this.updateStatus(sessionId, 'failed')
        return
      }

      // Execute task
      await this.executeTask(sessionId, task)

      if (task.status === 'failed') {
        this.addLog(sessionId, 'error', `Task failed: ${task.description}`)
        // Continue with next task or fail session based on config
      }
    }

    // Session complete
    await this.updateStatus(sessionId, 'completed')
    this.addLog(sessionId, 'success', 'Session completed successfully')

    // Take final screenshot
    try {
      const screenshot = await browserManager.takeScreenshot(sessionId)
      await prisma.agentScreenshot.create({
        data: {
          sessionId,
          imageData: screenshot,
          pageUrl: await browserManager.getCurrentUrl(sessionId),
          description: 'Final session screenshot'
        }
      })
    } catch {
      // Ignore screenshot errors
    }
  }

  private async executeTask(sessionId: string, task: AgentTask): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (!state) return

    this.addLog(sessionId, 'info', `Starting task: ${task.description}`)
    task.status = 'in_progress'
    state.session.currentTaskId = task.id

    await prisma.agentTask.updateMany({
      where: { sessionId, order: task.order },
      data: { status: 'IN_PROGRESS' }
    })

    try {
      // Get current page analysis
      const pageAnalysis = await browserManager.analyzePage(sessionId)

      // Generate actions for this task
      const actions = await taskPlanner.generateActionsForTask(
        sessionId,
        task.description,
        pageAnalysis
      )

      task.actions = actions
      this.addLog(sessionId, 'info', `Generated ${actions.length} actions for task`)

      // Execute each action using index-based iteration to safely handle dynamic additions
      let actionIndex = 0
      while (actionIndex < task.actions.length) {
        if (state.isPaused || state.isCancelled) break

        const action = task.actions[actionIndex]
        this.addLog(sessionId, 'info', `Executing: ${action.description}`)

        const result = await actionExecutor.executeAction(sessionId, action)
        task.results.push(result)

        if (result.success) {
          this.addLog(sessionId, 'success', `Completed: ${action.description}`)
        } else {
          this.addLog(sessionId, 'error', `Failed: ${action.description} - ${result.error}`)
        }

        // Save screenshot if available
        if (result.screenshot) {
          await prisma.agentScreenshot.create({
            data: {
              sessionId,
              taskId: task.id,
              actionId: action.id,
              imageData: result.screenshot,
              pageUrl: await browserManager.getCurrentUrl(sessionId),
              description: action.description
            }
          })
        }

        // Check if we need to re-plan
        const analysis = await taskPlanner.analyzeAndPlanNextStep(
          sessionId,
          state.session,
          task,
          result
        )

        if (analysis.isTaskComplete) {
          this.addLog(sessionId, 'info', 'Task determined to be complete')
          break
        }

        if (analysis.nextActions && analysis.nextActions.length > 0) {
          // Add new actions to the task (will be picked up by while loop)
          task.actions.push(...analysis.nextActions)
          this.addLog(sessionId, 'info', `Added ${analysis.nextActions.length} new actions`)
        }

        actionIndex++
      }

      task.status = 'completed'
      task.completedAt = new Date()

      await prisma.agentTask.updateMany({
        where: { sessionId, order: task.order },
        data: {
          status: 'COMPLETED',
          actions: task.actions as unknown as Parameters<typeof prisma.agentTask.update>[0]['data']['actions'],
          results: task.results as unknown as Parameters<typeof prisma.agentTask.update>[0]['data']['results']
        }
      })

    } catch (error) {
      task.status = 'failed'
      this.addLog(sessionId, 'error', `Task error: ${error}`)

      await prisma.agentTask.updateMany({
        where: { sessionId, order: task.order },
        data: { status: 'FAILED' }
      })
    }
  }

  async pauseSession(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (!state) throw new Error(`Session not found: ${sessionId}`)

    state.isPaused = true
    await this.updateStatus(sessionId, 'paused')
    this.addLog(sessionId, 'info', 'Session paused by user')
  }

  async resumeSession(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (!state) throw new Error(`Session not found: ${sessionId}`)

    state.isPaused = false
    this.addLog(sessionId, 'info', 'Session resumed by user')

    // Continue execution from where we left off (only pending tasks)
    await this.continueExecution(sessionId)
  }

  // Continue execution from current position (for resume)
  private async continueExecution(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (!state) throw new Error(`Session not found: ${sessionId}`)

    await this.updateStatus(sessionId, 'executing')

    // Find remaining tasks (pending or in_progress)
    const remainingTasks = state.tasks.filter(
      t => t.status === 'pending' || t.status === 'in_progress'
    )

    if (remainingTasks.length === 0) {
      // All tasks complete
      await this.updateStatus(sessionId, 'completed')
      this.addLog(sessionId, 'success', 'Session completed - no remaining tasks')
      return
    }

    for (const task of remainingTasks) {
      // Check for pause/cancel
      if (state.isPaused) {
        this.addLog(sessionId, 'info', 'Session paused')
        await this.updateStatus(sessionId, 'paused')
        return
      }

      if (state.isCancelled) {
        this.addLog(sessionId, 'info', 'Session cancelled')
        await this.updateStatus(sessionId, 'failed')
        return
      }

      // Execute task
      await this.executeTask(sessionId, task)

      if (task.status === 'failed') {
        this.addLog(sessionId, 'error', `Task failed: ${task.description}`)
      }
    }

    // Session complete
    await this.updateStatus(sessionId, 'completed')
    this.addLog(sessionId, 'success', 'Session completed successfully')

    // Take final screenshot
    try {
      const screenshot = await browserManager.takeScreenshot(sessionId)
      await prisma.agentScreenshot.create({
        data: {
          sessionId,
          imageData: screenshot,
          pageUrl: await browserManager.getCurrentUrl(sessionId),
          description: 'Final session screenshot'
        }
      })
    } catch {
      // Ignore screenshot errors
    }
  }

  async cancelSession(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (!state) throw new Error(`Session not found: ${sessionId}`)

    state.isCancelled = true
    state.isPaused = false
    await this.updateStatus(sessionId, 'failed')
    this.addLog(sessionId, 'warn', 'Session cancelled by user')

    // Close browser
    await browserManager.closeSession(sessionId)
  }

  async closeSession(sessionId: string): Promise<void> {
    await browserManager.closeSession(sessionId)
    this.sessions.delete(sessionId)

    await prisma.agentSession.update({
      where: { id: sessionId },
      data: { endedAt: new Date() }
    })
  }

  async getLiveViewState(sessionId: string): Promise<LiveViewState | null> {
    const state = this.sessions.get(sessionId)
    if (!state) return null

    let screenshot = ''
    let url = ''

    try {
      screenshot = await browserManager.takeScreenshot(sessionId)
      url = await browserManager.getCurrentUrl(sessionId)
    } catch {
      // Browser might be closed
    }

    const currentTask = state.tasks.find(t => t.status === 'in_progress')
    const completedTasks = state.tasks.filter(t => t.status === 'completed').length

    return {
      screenshot,
      url,
      status: state.session.status,
      currentAction: currentTask?.actions[currentTask.actions.length - 1]?.description,
      progress: {
        completedTasks,
        totalTasks: state.tasks.length,
        currentTask: currentTask?.description
      },
      logs: state.logs.slice(-50) // Last 50 logs
    }
  }

  async addMessage(
    sessionId: string,
    role: 'user' | 'agent' | 'system',
    content: string
  ): Promise<AgentMessage> {
    const state = this.sessions.get(sessionId)
    if (!state) throw new Error(`Session not found: ${sessionId}`)

    const message: AgentMessage = {
      id: `msg-${Date.now()}`,
      sessionId,
      role,
      content,
      timestamp: new Date()
    }

    state.messages.push(message)

    await prisma.agentLog.create({
      data: {
        sessionId,
        level: 'info',
        message: `[${role.toUpperCase()}] ${content}`
      }
    })

    return message
  }

  getMessages(sessionId: string): AgentMessage[] {
    const state = this.sessions.get(sessionId)
    return state?.messages || []
  }

  private addLog(
    sessionId: string,
    level: 'info' | 'warn' | 'error' | 'success',
    message: string
  ): void {
    const state = this.sessions.get(sessionId)
    if (!state) return

    state.logs.push({
      timestamp: new Date(),
      level,
      message
    })

    // Also save to database
    prisma.agentLog.create({
      data: {
        sessionId,
        level,
        message
      }
    }).catch(console.error)
  }

  private async updateStatus(sessionId: string, status: AgentStatus): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (state) {
      state.session.status = status
    }

    // Convert to Prisma enum format (uppercase)
    const prismaStatus = status.toUpperCase() as 'IDLE' | 'INITIALIZING' | 'PLANNING' | 'RUNNING' | 'EXECUTING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

    await prisma.agentSession.update({
      where: { id: sessionId },
      data: { status: prismaStatus }
    })
  }

  async sendUserInstruction(
    sessionId: string,
    instruction: string
  ): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (!state) throw new Error(`Session not found: ${sessionId}`)

    await this.addMessage(sessionId, 'user', instruction)

    // If session is paused, interpret instruction and continue
    if (state.isPaused || state.session.status === 'paused') {
      // Get current page state
      const pageAnalysis = await browserManager.analyzePage(sessionId)

      // Generate new plan based on instruction
      const plan = await taskPlanner.createPlan({
        objective: instruction,
        currentUrl: await browserManager.getCurrentUrl(sessionId),
        pageAnalysis,
        previousActions: state.tasks.flatMap(t => t.actions),
        previousResults: state.tasks.flatMap(t => t.results)
      })

      // Add new tasks
      const baseOrder = state.tasks.length
      for (let i = 0; i < plan.tasks.length; i++) {
        const planTask = plan.tasks[i]
        const task: AgentTask = {
          id: `task-${sessionId}-${baseOrder + i}`,
          sessionId,
          description: planTask.description,
          status: 'pending',
          actions: [],
          results: [],
          order: baseOrder + i,
          createdAt: new Date()
        }
        state.tasks.push(task)
      }

      // Resume execution
      await this.resumeSession(sessionId)
    }
  }

  getSession(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId)
  }
}

export const sessionManager = new SessionManager()
export default sessionManager
