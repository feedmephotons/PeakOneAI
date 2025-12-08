/**
 * Agent Session Manager
 * Implements the Gemini Computer Use agent loop pattern
 */

import puppeteer, { Browser, Page } from 'puppeteer'
import { prisma } from '@/lib/prisma'
import {
  ComputerUseClient,
  createComputerUseClient,
  ComputerUseResponse,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from './computer-use'
import { executeActions, ActionResult } from './action-handler'

// Session status
export type SessionStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'awaiting_confirmation'
  | 'completed'
  | 'failed'
  | 'cancelled'

// Log entry
export interface LogEntry {
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'success' | 'action'
  message: string
}

// Live view state
export interface LiveViewState {
  screenshot: string
  url: string
  status: SessionStatus
  currentAction?: string
  modelResponse?: string
  logs: LogEntry[]
}

// Session state
interface AgentSessionState {
  id: string
  workspaceId: string
  userId: string
  objective: string
  status: SessionStatus
  browser: Browser | null
  page: Page | null
  client: ComputerUseClient | null
  logs: LogEntry[]
  lastScreenshot: string
  lastUrl: string
  pendingConfirmation: {
    actions: Array<{ name: string; args: Record<string, unknown> }>
    explanation: string
  } | null
  turnCount: number
  maxTurns: number
  startedAt: Date
  completedAt?: Date
}

// Blocked URLs for security
const BLOCKED_URL_PATTERNS = [
  /^file:/i,
  /^ftp:/i,
  /^data:/i,
  /^javascript:/i,
  /^chrome:/i,
]

const INTERNAL_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^localhost$/i,
]

/**
 * Agent Session Manager
 * Manages browser agent sessions with proper agent loop
 */
class AgentSessionManager {
  private sessions: Map<string, AgentSessionState> = new Map()

  /**
   * Create a new agent session
   */
  async createSession(
    workspaceId: string,
    userId: string,
    objective: string,
    startUrl?: string
  ): Promise<{ sessionId: string; session: AgentSessionState }> {
    // Validate start URL if provided
    if (startUrl) {
      const validation = this.validateUrl(startUrl)
      if (!validation.allowed) {
        throw new Error(`Invalid start URL: ${validation.reason}`)
      }
    }

    // Create session in database
    const dbSession = await prisma.agentSession.create({
      data: {
        workspaceId,
        userId,
        objective,
        status: 'IDLE',
        startUrl,
      },
    })

    const sessionState: AgentSessionState = {
      id: dbSession.id,
      workspaceId,
      userId,
      objective,
      status: 'idle',
      browser: null,
      page: null,
      client: null,
      logs: [],
      lastScreenshot: '',
      lastUrl: startUrl || '',
      pendingConfirmation: null,
      turnCount: 0,
      maxTurns: 50, // Safety limit
      startedAt: new Date(),
    }

    this.sessions.set(dbSession.id, sessionState)
    this.addLog(dbSession.id, 'info', `Session created for objective: ${objective}`)

    return { sessionId: dbSession.id, session: sessionState }
  }

  /**
   * Start the agent session
   */
  async startSession(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (!state) throw new Error(`Session not found: ${sessionId}`)

    try {
      this.addLog(sessionId, 'info', 'Starting browser...')

      // Launch browser
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          `--window-size=${SCREEN_WIDTH},${SCREEN_HEIGHT}`,
        ],
      })

      const page = await browser.newPage()
      await page.setViewport({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT })

      state.browser = browser
      state.page = page

      // Navigate to start URL or Google
      const startUrl = state.lastUrl || 'https://www.google.com'
      this.addLog(sessionId, 'info', `Navigating to ${startUrl}`)
      await page.goto(startUrl, { waitUntil: 'networkidle2' })

      state.lastUrl = page.url()
      state.lastScreenshot = (await page.screenshot({ encoding: 'base64' })) as string

      // Create Computer Use client
      state.client = createComputerUseClient()

      // Update status
      state.status = 'running'
      await this.updateDbStatus(sessionId, 'RUNNING')

      this.addLog(sessionId, 'info', 'Browser initialized, starting agent loop')

      // Start the agent loop
      await this.runAgentLoop(sessionId)
    } catch (error) {
      this.addLog(sessionId, 'error', `Failed to start session: ${error}`)
      state.status = 'failed'
      await this.updateDbStatus(sessionId, 'FAILED')
      throw error
    }
  }

  /**
   * Run the agent loop
   */
  private async runAgentLoop(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (!state || !state.client || !state.page) return

    try {
      // Initialize with objective and screenshot
      this.addLog(sessionId, 'info', 'Sending objective to AI model...')

      let response = await state.client.initializeSession(
        state.objective,
        state.lastScreenshot,
        state.lastUrl
      )

      // Agent loop
      while (
        state.status === 'running' &&
        state.turnCount < state.maxTurns
      ) {
        state.turnCount++
        this.addLog(sessionId, 'info', `Turn ${state.turnCount}`)

        // Check if model returned text (might be done or communicating)
        if (response.text) {
          this.addLog(sessionId, 'info', `AI: ${response.text}`)
        }

        // Check if task is complete
        if (response.isComplete) {
          this.addLog(sessionId, 'success', 'Task completed!')
          state.status = 'completed'
          state.completedAt = new Date()
          await this.updateDbStatus(sessionId, 'COMPLETED')
          break
        }

        // Check if confirmation is required
        if (response.requiresConfirmation) {
          this.addLog(
            sessionId,
            'warn',
            `Safety check: ${response.confirmationExplanation}`
          )
          state.status = 'awaiting_confirmation'
          state.pendingConfirmation = {
            actions: response.actions.map((a) => ({ name: a.name, args: a.args })),
            explanation: response.confirmationExplanation || 'Confirmation required',
          }
          await this.updateDbStatus(sessionId, 'PAUSED')
          return // Wait for user confirmation
        }

        // Execute actions
        if (response.actions.length > 0) {
          this.addLog(
            sessionId,
            'action',
            `Executing ${response.actions.length} action(s): ${response.actions
              .map((a) => a.name)
              .join(', ')}`
          )

          const results = await executeActions(
            state.page,
            response.actions,
            SCREEN_WIDTH,
            SCREEN_HEIGHT
          )

          // Log results
          for (const result of results) {
            if (result.success) {
              this.addLog(sessionId, 'success', `${result.name} completed`)
            } else {
              this.addLog(sessionId, 'error', `${result.name} failed: ${result.error}`)
            }
          }

          // Get latest screenshot and URL
          const lastResult = results[results.length - 1]
          if (lastResult.screenshot) {
            state.lastScreenshot = lastResult.screenshot
          }
          if (lastResult.url) {
            state.lastUrl = lastResult.url
          }

          // Send results back to model
          response = await state.client.sendActionResults(
            results.map((r) => ({
              name: r.name,
              screenshotBase64: r.screenshot || state.lastScreenshot,
              currentUrl: r.url || state.lastUrl,
              error: r.error,
            }))
          )
        } else {
          // No actions but not complete - might be thinking or stuck
          this.addLog(sessionId, 'warn', 'No actions received, retrying...')

          // Send current state back
          response = await state.client.sendActionResults([
            {
              name: 'wait_5_seconds',
              screenshotBase64: state.lastScreenshot,
              currentUrl: state.lastUrl,
            },
          ])
        }

        // Check for pause/cancel
        if (state.status === 'paused' || state.status === 'cancelled') {
          break
        }
      }

      // Check if we hit turn limit
      if (state.turnCount >= state.maxTurns) {
        this.addLog(sessionId, 'warn', 'Reached maximum turns limit')
        state.status = 'completed'
        state.completedAt = new Date()
        await this.updateDbStatus(sessionId, 'COMPLETED')
      }
    } catch (error) {
      this.addLog(sessionId, 'error', `Agent loop error: ${error}`)
      state.status = 'failed'
      await this.updateDbStatus(sessionId, 'FAILED')
    }
  }

  /**
   * Confirm pending action (user approved)
   */
  async confirmAction(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (!state) throw new Error(`Session not found: ${sessionId}`)
    if (state.status !== 'awaiting_confirmation' || !state.pendingConfirmation) {
      throw new Error('No pending confirmation')
    }

    if (!state.page || !state.client) {
      throw new Error('Session not properly initialized')
    }

    this.addLog(sessionId, 'info', 'User confirmed action')

    // Execute the pending actions with safety acknowledged
    const actions = state.pendingConfirmation.actions.map((a) => ({
      name: a.name,
      args: a.args,
    }))

    const results = await executeActions(
      state.page,
      actions,
      SCREEN_WIDTH,
      SCREEN_HEIGHT
    )

    // Update state
    const lastResult = results[results.length - 1]
    if (lastResult.screenshot) state.lastScreenshot = lastResult.screenshot
    if (lastResult.url) state.lastUrl = lastResult.url

    state.pendingConfirmation = null
    state.status = 'running'
    await this.updateDbStatus(sessionId, 'RUNNING')

    // Send results back with safety acknowledgement
    const response = await state.client.sendActionResults(
      results.map((r) => ({
        name: r.name,
        screenshotBase64: r.screenshot || state.lastScreenshot,
        currentUrl: r.url || state.lastUrl,
        error: r.error,
        safetyAcknowledged: true,
      }))
    )

    // Continue the agent loop
    // Store response and continue
    await this.continueAgentLoop(sessionId, response)
  }

  /**
   * Deny pending action (user rejected)
   */
  async denyAction(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (!state) throw new Error(`Session not found: ${sessionId}`)

    this.addLog(sessionId, 'warn', 'User denied action, stopping session')

    state.pendingConfirmation = null
    state.status = 'cancelled'
    state.completedAt = new Date()
    await this.updateDbStatus(sessionId, 'CANCELLED')
  }

  /**
   * Continue agent loop after confirmation
   */
  private async continueAgentLoop(
    sessionId: string,
    initialResponse: ComputerUseResponse
  ): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (!state || !state.client || !state.page) return

    let response = initialResponse

    try {
      while (
        state.status === 'running' &&
        state.turnCount < state.maxTurns
      ) {
        state.turnCount++

        if (response.text) {
          this.addLog(sessionId, 'info', `AI: ${response.text}`)
        }

        if (response.isComplete) {
          this.addLog(sessionId, 'success', 'Task completed!')
          state.status = 'completed'
          state.completedAt = new Date()
          await this.updateDbStatus(sessionId, 'COMPLETED')
          break
        }

        if (response.requiresConfirmation) {
          state.status = 'awaiting_confirmation'
          state.pendingConfirmation = {
            actions: response.actions.map((a) => ({ name: a.name, args: a.args })),
            explanation: response.confirmationExplanation || 'Confirmation required',
          }
          await this.updateDbStatus(sessionId, 'PAUSED')
          return
        }

        if (response.actions.length > 0) {
          const results = await executeActions(
            state.page,
            response.actions,
            SCREEN_WIDTH,
            SCREEN_HEIGHT
          )

          const lastResult = results[results.length - 1]
          if (lastResult.screenshot) state.lastScreenshot = lastResult.screenshot
          if (lastResult.url) state.lastUrl = lastResult.url

          response = await state.client.sendActionResults(
            results.map((r) => ({
              name: r.name,
              screenshotBase64: r.screenshot || state.lastScreenshot,
              currentUrl: r.url || state.lastUrl,
              error: r.error,
            }))
          )
        } else {
          break
        }
      }
    } catch (error) {
      this.addLog(sessionId, 'error', `Error: ${error}`)
      state.status = 'failed'
      await this.updateDbStatus(sessionId, 'FAILED')
    }
  }

  /**
   * Pause session
   */
  async pauseSession(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (!state) throw new Error(`Session not found: ${sessionId}`)

    state.status = 'paused'
    await this.updateDbStatus(sessionId, 'PAUSED')
    this.addLog(sessionId, 'info', 'Session paused')
  }

  /**
   * Resume session
   */
  async resumeSession(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (!state) throw new Error(`Session not found: ${sessionId}`)
    if (!state.page || !state.client) {
      throw new Error('Session not properly initialized')
    }

    state.status = 'running'
    await this.updateDbStatus(sessionId, 'RUNNING')
    this.addLog(sessionId, 'info', 'Session resumed')

    // Take new screenshot and continue
    state.lastScreenshot = (await state.page.screenshot({ encoding: 'base64' })) as string
    state.lastUrl = state.page.url()

    // Send current state to model and continue
    const response = await state.client.sendActionResults([
      {
        name: 'wait_5_seconds',
        screenshotBase64: state.lastScreenshot,
        currentUrl: state.lastUrl,
      },
    ])

    await this.continueAgentLoop(sessionId, response)
  }

  /**
   * Cancel session
   */
  async cancelSession(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (!state) throw new Error(`Session not found: ${sessionId}`)

    state.status = 'cancelled'
    state.completedAt = new Date()
    await this.updateDbStatus(sessionId, 'CANCELLED')
    this.addLog(sessionId, 'warn', 'Session cancelled')

    await this.closeSession(sessionId)
  }

  /**
   * Close and cleanup session
   */
  async closeSession(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId)
    if (!state) return

    try {
      if (state.browser) {
        await state.browser.close()
      }
    } catch {
      // Ignore close errors
    }

    state.browser = null
    state.page = null

    await prisma.agentSession.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    })
  }

  /**
   * Get live view state
   */
  async getLiveViewState(sessionId: string): Promise<LiveViewState | null> {
    const state = this.sessions.get(sessionId)
    if (!state) return null

    return {
      screenshot: state.lastScreenshot,
      url: state.lastUrl,
      status: state.status,
      currentAction: state.pendingConfirmation
        ? `Awaiting confirmation: ${state.pendingConfirmation.explanation}`
        : undefined,
      logs: state.logs.slice(-50),
    }
  }

  /**
   * Get session state
   */
  getSession(sessionId: string): AgentSessionState | undefined {
    return this.sessions.get(sessionId)
  }

  /**
   * Get logs
   */
  getLogs(sessionId: string): LogEntry[] {
    const state = this.sessions.get(sessionId)
    return state?.logs || []
  }

  /**
   * Validate URL for security
   */
  private validateUrl(url: string): { allowed: boolean; reason?: string } {
    try {
      const parsed = new URL(url)

      for (const pattern of BLOCKED_URL_PATTERNS) {
        if (pattern.test(url)) {
          return { allowed: false, reason: `Blocked protocol: ${parsed.protocol}` }
        }
      }

      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { allowed: false, reason: `Only HTTP/HTTPS allowed` }
      }

      for (const pattern of INTERNAL_IP_PATTERNS) {
        if (pattern.test(parsed.hostname)) {
          return { allowed: false, reason: `Internal addresses blocked` }
        }
      }

      return { allowed: true }
    } catch {
      return { allowed: false, reason: 'Invalid URL' }
    }
  }

  /**
   * Add log entry
   */
  private addLog(
    sessionId: string,
    level: LogEntry['level'],
    message: string
  ): void {
    const state = this.sessions.get(sessionId)
    if (!state) return

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
    }

    state.logs.push(entry)

    // Also save to database
    prisma.agentLog
      .create({
        data: {
          sessionId,
          level,
          message,
        },
      })
      .catch(console.error)
  }

  /**
   * Update database status
   */
  private async updateDbStatus(
    sessionId: string,
    status: string
  ): Promise<void> {
    await prisma.agentSession.update({
      where: { id: sessionId },
      data: { status: status as 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED' },
    })
  }
}

// Singleton instance
export const agentSessionManager = new AgentSessionManager()
export default agentSessionManager
