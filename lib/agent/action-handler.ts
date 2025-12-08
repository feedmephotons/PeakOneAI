/**
 * Action Handler for Gemini Computer Use
 * Executes browser actions returned by the Computer Use model
 */

import { Page } from 'puppeteer'
import {
  ComputerUseAction,
  denormalizeCoordinates,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from './computer-use'

export interface ActionResult {
  name: string
  success: boolean
  error?: string
  screenshot?: string
  url?: string
}

/**
 * Execute a single Computer Use action
 */
export async function executeAction(
  page: Page,
  action: ComputerUseAction,
  screenWidth: number = SCREEN_WIDTH,
  screenHeight: number = SCREEN_HEIGHT
): Promise<ActionResult> {
  const { name, args } = action

  console.log(`Executing action: ${name}`, args)

  try {
    switch (name) {
      case 'open_web_browser':
        // Browser is already open, no-op
        break

      case 'wait_5_seconds':
        await new Promise((resolve) => setTimeout(resolve, 5000))
        break

      case 'go_back':
        await page.goBack({ waitUntil: 'networkidle2' })
        break

      case 'go_forward':
        await page.goForward({ waitUntil: 'networkidle2' })
        break

      case 'search':
        await page.goto('https://www.google.com', { waitUntil: 'networkidle2' })
        break

      case 'navigate': {
        const url = args.url as string
        if (!url) throw new Error('Navigate action requires url argument')

        // Security check - only allow http/https
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          throw new Error('Only HTTP/HTTPS URLs are allowed')
        }

        await page.goto(url, { waitUntil: 'networkidle2' })
        break
      }

      case 'click_at': {
        const x = args.x as number
        const y = args.y as number
        if (x === undefined || y === undefined) {
          throw new Error('click_at requires x and y coordinates')
        }

        const coords = denormalizeCoordinates(x, y, screenWidth, screenHeight)
        await page.mouse.click(coords.x, coords.y)

        // Wait for potential navigation or render
        await waitForPageStable(page)
        break
      }

      case 'hover_at': {
        const x = args.x as number
        const y = args.y as number
        if (x === undefined || y === undefined) {
          throw new Error('hover_at requires x and y coordinates')
        }

        const coords = denormalizeCoordinates(x, y, screenWidth, screenHeight)
        await page.mouse.move(coords.x, coords.y)

        // Wait a bit for hover effects
        await new Promise((resolve) => setTimeout(resolve, 500))
        break
      }

      case 'type_text_at': {
        const x = args.x as number
        const y = args.y as number
        const text = args.text as string
        const pressEnter = args.press_enter !== false // default true
        const clearFirst = args.clear_before_typing !== false // default true

        if (x === undefined || y === undefined || !text) {
          throw new Error('type_text_at requires x, y, and text arguments')
        }

        const coords = denormalizeCoordinates(x, y, screenWidth, screenHeight)

        // Click to focus
        await page.mouse.click(coords.x, coords.y)
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Clear existing text if needed
        if (clearFirst) {
          // Select all and delete
          await page.keyboard.down('Control')
          await page.keyboard.press('a')
          await page.keyboard.up('Control')
          await page.keyboard.press('Backspace')
        }

        // Type the text
        await page.keyboard.type(text, { delay: 50 })

        // Press Enter if requested
        if (pressEnter) {
          await page.keyboard.press('Enter')
          await waitForPageStable(page)
        }
        break
      }

      case 'key_combination': {
        const keys = args.keys as string
        if (!keys) throw new Error('key_combination requires keys argument')

        // Parse key combination (e.g., "Control+A", "Enter")
        const keyParts = keys.split('+').map((k) => k.trim())

        // Press modifier keys
        for (const key of keyParts.slice(0, -1)) {
          await page.keyboard.down(normalizeKeyName(key))
        }

        // Press the main key
        const mainKey = keyParts[keyParts.length - 1]
        await page.keyboard.press(normalizeKeyName(mainKey))

        // Release modifier keys
        for (const key of keyParts.slice(0, -1).reverse()) {
          await page.keyboard.up(normalizeKeyName(key))
        }

        await waitForPageStable(page)
        break
      }

      case 'scroll_document': {
        const direction = args.direction as string
        if (!direction) throw new Error('scroll_document requires direction argument')

        const scrollAmount = 500 // pixels

        switch (direction.toLowerCase()) {
          case 'up':
            await page.evaluate((amount) => window.scrollBy(0, -amount), scrollAmount)
            break
          case 'down':
            await page.evaluate((amount) => window.scrollBy(0, amount), scrollAmount)
            break
          case 'left':
            await page.evaluate((amount) => window.scrollBy(-amount, 0), scrollAmount)
            break
          case 'right':
            await page.evaluate((amount) => window.scrollBy(amount, 0), scrollAmount)
            break
          default:
            throw new Error(`Unknown scroll direction: ${direction}`)
        }

        await new Promise((resolve) => setTimeout(resolve, 300))
        break
      }

      case 'scroll_at': {
        const x = args.x as number
        const y = args.y as number
        const direction = args.direction as string
        const magnitude = (args.magnitude as number) || 800

        if (x === undefined || y === undefined || !direction) {
          throw new Error('scroll_at requires x, y, and direction arguments')
        }

        const coords = denormalizeCoordinates(x, y, screenWidth, screenHeight)
        const scrollAmount = Math.round((magnitude / 1000) * screenHeight)

        // Move mouse to position
        await page.mouse.move(coords.x, coords.y)

        // Scroll using mouse wheel
        let deltaX = 0
        let deltaY = 0

        switch (direction.toLowerCase()) {
          case 'up':
            deltaY = -scrollAmount
            break
          case 'down':
            deltaY = scrollAmount
            break
          case 'left':
            deltaX = -scrollAmount
            break
          case 'right':
            deltaX = scrollAmount
            break
        }

        await page.mouse.wheel({ deltaX, deltaY })
        await new Promise((resolve) => setTimeout(resolve, 300))
        break
      }

      case 'drag_and_drop': {
        const x = args.x as number
        const y = args.y as number
        const destX = args.destination_x as number
        const destY = args.destination_y as number

        if (x === undefined || y === undefined || destX === undefined || destY === undefined) {
          throw new Error('drag_and_drop requires x, y, destination_x, and destination_y')
        }

        const startCoords = denormalizeCoordinates(x, y, screenWidth, screenHeight)
        const endCoords = denormalizeCoordinates(destX, destY, screenWidth, screenHeight)

        await page.mouse.move(startCoords.x, startCoords.y)
        await page.mouse.down()
        await page.mouse.move(endCoords.x, endCoords.y, { steps: 10 })
        await page.mouse.up()

        await waitForPageStable(page)
        break
      }

      default:
        console.warn(`Unknown action: ${name}`)
        return {
          name,
          success: false,
          error: `Unknown action: ${name}`,
        }
    }

    // Take screenshot after action
    const screenshot = await page.screenshot({
      encoding: 'base64',
      fullPage: false,
    })

    const url = page.url()

    return {
      name,
      success: true,
      screenshot: screenshot as string,
      url,
    }
  } catch (error) {
    console.error(`Action ${name} failed:`, error)

    // Try to get screenshot even on error
    let screenshot: string | undefined
    let url: string | undefined

    try {
      screenshot = (await page.screenshot({ encoding: 'base64' })) as string
      url = page.url()
    } catch {
      // Ignore screenshot errors
    }

    return {
      name,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      screenshot,
      url,
    }
  }
}

/**
 * Execute multiple actions in sequence
 */
export async function executeActions(
  page: Page,
  actions: ComputerUseAction[],
  screenWidth: number = SCREEN_WIDTH,
  screenHeight: number = SCREEN_HEIGHT
): Promise<ActionResult[]> {
  const results: ActionResult[] = []

  for (const action of actions) {
    const result = await executeAction(page, action, screenWidth, screenHeight)
    results.push(result)

    // Stop on error
    if (!result.success) {
      break
    }
  }

  return results
}

/**
 * Wait for page to stabilize after an action
 */
async function waitForPageStable(page: Page, timeout: number = 5000): Promise<void> {
  try {
    await Promise.race([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout }),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ])
  } catch {
    // Timeout is expected if no navigation occurs
  }
}

/**
 * Normalize key names for Puppeteer
 */
function normalizeKeyName(key: string): string {
  const keyMap: Record<string, string> = {
    'control': 'Control',
    'ctrl': 'Control',
    'alt': 'Alt',
    'shift': 'Shift',
    'meta': 'Meta',
    'command': 'Meta',
    'cmd': 'Meta',
    'enter': 'Enter',
    'return': 'Enter',
    'tab': 'Tab',
    'escape': 'Escape',
    'esc': 'Escape',
    'backspace': 'Backspace',
    'delete': 'Delete',
    'arrowup': 'ArrowUp',
    'arrowdown': 'ArrowDown',
    'arrowleft': 'ArrowLeft',
    'arrowright': 'ArrowRight',
    'home': 'Home',
    'end': 'End',
    'pageup': 'PageUp',
    'pagedown': 'PageDown',
    'space': 'Space',
    ' ': 'Space',
  }

  const normalized = keyMap[key.toLowerCase()]
  return normalized || key
}

export default { executeAction, executeActions }
