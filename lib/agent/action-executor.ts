import { browserManager } from './browser-manager'
import type {
  BrowserAction,
  ActionResult,
  AgentConfig
} from './types'

const DEFAULT_CONFIG: Partial<AgentConfig> = {
  maxRetries: 3,
  screenshotOnError: true,
  screenshotOnAction: false,
  maxSessionDuration: 30 * 60 * 1000 // 30 minutes
}

export class ActionExecutor {
  private config: AgentConfig

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = {
      browser: {
        headless: true,
        viewport: { width: 1280, height: 720 }
      },
      maxRetries: config.maxRetries ?? DEFAULT_CONFIG.maxRetries!,
      screenshotOnError: config.screenshotOnError ?? DEFAULT_CONFIG.screenshotOnError!,
      screenshotOnAction: config.screenshotOnAction ?? DEFAULT_CONFIG.screenshotOnAction!,
      maxSessionDuration: config.maxSessionDuration ?? DEFAULT_CONFIG.maxSessionDuration!,
      ...config
    }
  }

  async executeAction(
    sessionId: string,
    action: BrowserAction
  ): Promise<ActionResult> {
    const startTime = Date.now()
    let retries = 0
    const maxRetries = action.retryCount ?? this.config.maxRetries

    while (retries <= maxRetries) {
      try {
        const result = await this.performAction(sessionId, action)

        // Take screenshot if configured
        let screenshot: string | undefined
        if (this.config.screenshotOnAction) {
          screenshot = await browserManager.takeScreenshot(sessionId)
        }

        return {
          actionId: action.id,
          success: true,
          data: result,
          screenshot,
          duration: Date.now() - startTime,
          timestamp: new Date()
        }
      } catch (error) {
        retries++
        if (retries > maxRetries) {
          // Take screenshot on error if configured
          let screenshot: string | undefined
          if (this.config.screenshotOnError) {
            try {
              screenshot = await browserManager.takeScreenshot(sessionId)
            } catch {
              // Ignore screenshot errors
            }
          }

          return {
            actionId: action.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            screenshot,
            duration: Date.now() - startTime,
            timestamp: new Date()
          }
        }

        // Wait before retry
        await this.delay(1000 * retries)
      }
    }

    return {
      actionId: action.id,
      success: false,
      error: 'Max retries exceeded',
      duration: Date.now() - startTime,
      timestamp: new Date()
    }
  }

  private async performAction(
    sessionId: string,
    action: BrowserAction
  ): Promise<unknown> {
    const timeout = action.timeout ?? 30000

    switch (action.type) {
      case 'navigate':
        if (!action.value) throw new Error('Navigate action requires a URL')
        await Promise.race([
          browserManager.navigate(sessionId, action.value),
          this.timeoutPromise(timeout)
        ])
        return { url: action.value }

      case 'click':
        if (!action.selector) throw new Error('Click action requires a selector')
        await browserManager.click(sessionId, action.selector)

        // Wait for potential navigation or updates
        if (action.options?.waitFor) {
          if (typeof action.options.waitFor === 'number') {
            await this.delay(action.options.waitFor)
          } else {
            try {
              await browserManager.waitForNavigation(sessionId)
            } catch {
              // Navigation may not occur, that's OK
            }
          }
        }
        return { clicked: action.selector.value }

      case 'type':
        if (!action.selector) throw new Error('Type action requires a selector')
        if (action.value === undefined) throw new Error('Type action requires a value')
        await browserManager.type(
          sessionId,
          action.selector,
          action.value,
          action.options?.delay ?? 50
        )
        return { typed: action.value, into: action.selector.value }

      case 'scroll':
        const scrollAmount = action.options?.scrollAmount ?? 500
        await browserManager.scroll(sessionId, scrollAmount, 'down')
        return { scrolled: scrollAmount }

      case 'wait':
        if (action.selector) {
          await browserManager.waitForSelector(
            sessionId,
            action.selector,
            action.timeout
          )
          return { waitedFor: action.selector.value }
        } else if (action.options?.waitFor && typeof action.options.waitFor === 'number') {
          await this.delay(action.options.waitFor)
          return { waited: action.options.waitFor }
        }
        throw new Error('Wait action requires a selector or delay duration')

      case 'screenshot':
        const screenshot = await browserManager.takeScreenshot(sessionId)
        return { screenshot }

      case 'extract':
        if (!action.selector && !action.options?.extractFields) {
          throw new Error('Extract action requires a selector or extractFields')
        }

        if (action.selector) {
          const text = await browserManager.extractText(sessionId, action.selector)
          return { text }
        }

        // Full page analysis
        const analysis = await browserManager.analyzePage(sessionId)
        return { analysis }

      case 'hover':
        if (!action.selector) throw new Error('Hover action requires a selector')
        await browserManager.hover(sessionId, action.selector)
        return { hovered: action.selector.value }

      case 'select':
        if (!action.selector) throw new Error('Select action requires a selector')
        if (!action.value) throw new Error('Select action requires a value')
        await browserManager.select(sessionId, action.selector, action.value)
        return { selected: action.value }

      case 'press_key':
        if (!action.options?.key) throw new Error('Press key action requires a key')
        await browserManager.pressKey(sessionId, action.options.key)
        return { pressed: action.options.key }

      case 'drag':
        throw new Error('Drag action not yet implemented')

      case 'evaluate':
        if (!action.value) throw new Error('Evaluate action requires a script')
        const result = await browserManager.evaluate(
          sessionId,
          () => {
            // This is a placeholder - actual evaluation would need careful security handling
            return null
          }
        )
        return { result }

      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  async executeActions(
    sessionId: string,
    actions: BrowserAction[]
  ): Promise<ActionResult[]> {
    const results: ActionResult[] = []

    for (const action of actions) {
      const result = await this.executeAction(sessionId, action)
      results.push(result)

      // Stop execution if an action fails
      if (!result.success) {
        break
      }
    }

    return results
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Action timeout')), ms)
    )
  }
}

export const actionExecutor = new ActionExecutor()
export default actionExecutor
