import puppeteer, { Browser, Page, ElementHandle } from 'puppeteer'
import type {
  BrowserConfig,
  PageAnalysis,
  InteractiveElement,
  FormAnalysis,
  NavigationElement,
  ContentExtract,
  ElementSelector
} from './types'

const DEFAULT_CONFIG: BrowserConfig = {
  headless: true,
  viewport: {
    width: 1280,
    height: 720
  },
  timeout: 30000
}

class BrowserManager {
  private browsers: Map<string, Browser> = new Map()
  private pages: Map<string, Page> = new Map()

  async createSession(
    sessionId: string,
    config: Partial<BrowserConfig> = {}
  ): Promise<{ browser: Browser; page: Page }> {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config }

    const browser = await puppeteer.launch({
      headless: mergedConfig.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        `--window-size=${mergedConfig.viewport.width},${mergedConfig.viewport.height}`
      ]
    })

    const page = await browser.newPage()
    await page.setViewport(mergedConfig.viewport)

    if (mergedConfig.userAgent) {
      await page.setUserAgent(mergedConfig.userAgent)
    }

    // Set default timeout
    page.setDefaultTimeout(mergedConfig.timeout || 30000)

    this.browsers.set(sessionId, browser)
    this.pages.set(sessionId, page)

    return { browser, page }
  }

  getPage(sessionId: string): Page | undefined {
    return this.pages.get(sessionId)
  }

  getBrowser(sessionId: string): Browser | undefined {
    return this.browsers.get(sessionId)
  }

  async closeSession(sessionId: string): Promise<void> {
    const browser = this.browsers.get(sessionId)
    if (browser) {
      await browser.close()
      this.browsers.delete(sessionId)
      this.pages.delete(sessionId)
    }
  }

  async navigate(sessionId: string, url: string): Promise<void> {
    const page = this.pages.get(sessionId)
    if (!page) throw new Error(`No page found for session ${sessionId}`)

    await page.goto(url, { waitUntil: 'networkidle2' })
  }

  async takeScreenshot(sessionId: string): Promise<string> {
    const page = this.pages.get(sessionId)
    if (!page) throw new Error(`No page found for session ${sessionId}`)

    const screenshot = await page.screenshot({
      encoding: 'base64',
      fullPage: false
    })
    return screenshot as string
  }

  async takeFullPageScreenshot(sessionId: string): Promise<string> {
    const page = this.pages.get(sessionId)
    if (!page) throw new Error(`No page found for session ${sessionId}`)

    const screenshot = await page.screenshot({
      encoding: 'base64',
      fullPage: true
    })
    return screenshot as string
  }

  async findElement(
    sessionId: string,
    selector: ElementSelector
  ): Promise<ElementHandle | null> {
    const page = this.pages.get(sessionId)
    if (!page) throw new Error(`No page found for session ${sessionId}`)

    switch (selector.type) {
      case 'css':
        return await page.$(selector.value)
      case 'xpath':
        // Use $$ with ::-p-xpath pseudo-selector for XPath in modern Puppeteer
        const xpathElements = await page.$$(`xpath/${selector.value}`)
        return xpathElements[0] || null
      case 'text':
        return await page.$(`text/${selector.value}`)
      case 'aria':
        return await page.$(`aria/${selector.value}`)
      case 'id':
        return await page.$(`#${selector.value}`)
      default:
        return await page.$(selector.value)
    }
  }

  async click(sessionId: string, selector: ElementSelector): Promise<void> {
    const element = await this.findElement(sessionId, selector)
    if (!element) throw new Error(`Element not found: ${selector.value}`)
    await element.click()
  }

  async type(
    sessionId: string,
    selector: ElementSelector,
    text: string,
    delay: number = 50
  ): Promise<void> {
    const element = await this.findElement(sessionId, selector)
    if (!element) throw new Error(`Element not found: ${selector.value}`)
    await element.type(text, { delay })
  }

  async scroll(
    sessionId: string,
    amount: number,
    direction: 'up' | 'down' = 'down'
  ): Promise<void> {
    const page = this.pages.get(sessionId)
    if (!page) throw new Error(`No page found for session ${sessionId}`)

    const scrollY = direction === 'down' ? amount : -amount
    await page.evaluate((y) => window.scrollBy(0, y), scrollY)
  }

  async waitForNavigation(sessionId: string): Promise<void> {
    const page = this.pages.get(sessionId)
    if (!page) throw new Error(`No page found for session ${sessionId}`)
    await page.waitForNavigation({ waitUntil: 'networkidle2' })
  }

  async waitForSelector(
    sessionId: string,
    selector: ElementSelector,
    timeout: number = 30000
  ): Promise<void> {
    const page = this.pages.get(sessionId)
    if (!page) throw new Error(`No page found for session ${sessionId}`)

    if (selector.type === 'css' || selector.type === 'id') {
      const sel = selector.type === 'id' ? `#${selector.value}` : selector.value
      await page.waitForSelector(sel, { timeout })
    } else if (selector.type === 'xpath') {
      // Use waitForSelector with xpath/ prefix in modern Puppeteer
      await page.waitForSelector(`xpath/${selector.value}`, { timeout })
    }
  }

  async select(
    sessionId: string,
    selector: ElementSelector,
    value: string
  ): Promise<void> {
    const page = this.pages.get(sessionId)
    if (!page) throw new Error(`No page found for session ${sessionId}`)

    const sel = selector.type === 'id' ? `#${selector.value}` : selector.value
    await page.select(sel, value)
  }

  async pressKey(sessionId: string, key: string): Promise<void> {
    const page = this.pages.get(sessionId)
    if (!page) throw new Error(`No page found for session ${sessionId}`)
    await page.keyboard.press(key as any)
  }

  async hover(sessionId: string, selector: ElementSelector): Promise<void> {
    const element = await this.findElement(sessionId, selector)
    if (!element) throw new Error(`Element not found: ${selector.value}`)
    await element.hover()
  }

  async evaluate<T>(sessionId: string, fn: () => T): Promise<T> {
    const page = this.pages.get(sessionId)
    if (!page) throw new Error(`No page found for session ${sessionId}`)
    return await page.evaluate(fn)
  }

  async extractText(
    sessionId: string,
    selector: ElementSelector
  ): Promise<string> {
    const page = this.pages.get(sessionId)
    if (!page) throw new Error(`No page found for session ${sessionId}`)

    const sel = selector.type === 'id' ? `#${selector.value}` : selector.value
    return await page.$eval(sel, (el) => el.textContent || '')
  }

  async analyzePage(sessionId: string): Promise<PageAnalysis> {
    const page = this.pages.get(sessionId)
    if (!page) throw new Error(`No page found for session ${sessionId}`)

    const url = page.url()
    const title = await page.title()
    const screenshot = await this.takeScreenshot(sessionId)

    // Extract interactive elements
    const elements = await page.evaluate(() => {
      const getSelector = (el: Element): { type: 'css'; value: string } => {
        if (el.id) return { type: 'css', value: `#${el.id}` }
        if (el.className && typeof el.className === 'string') {
          const classes = el.className.split(' ').filter(Boolean).join('.')
          if (classes) return { type: 'css', value: `.${classes}` }
        }
        // Fallback to tag name with nth-child
        const parent = el.parentElement
        if (parent) {
          const index = Array.from(parent.children).indexOf(el) + 1
          return {
            type: 'css',
            value: `${el.tagName.toLowerCase()}:nth-child(${index})`
          }
        }
        return { type: 'css', value: el.tagName.toLowerCase() }
      }

      const interactiveElements: InteractiveElement[] = []

      // Buttons
      document.querySelectorAll('button, [role="button"]').forEach((el) => {
        const rect = el.getBoundingClientRect()
        interactiveElements.push({
          selector: getSelector(el),
          type: 'button',
          text: el.textContent?.trim() || undefined,
          ariaLabel: el.getAttribute('aria-label') || undefined,
          isVisible: rect.width > 0 && rect.height > 0,
          isEnabled: !(el as HTMLButtonElement).disabled,
          boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
        })
      })

      // Links
      document.querySelectorAll('a[href]').forEach((el) => {
        const rect = el.getBoundingClientRect()
        interactiveElements.push({
          selector: getSelector(el),
          type: 'link',
          text: el.textContent?.trim() || undefined,
          value: (el as HTMLAnchorElement).href,
          isVisible: rect.width > 0 && rect.height > 0,
          isEnabled: true,
          boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
        })
      })

      // Inputs
      document.querySelectorAll('input:not([type="hidden"])').forEach((el) => {
        const input = el as HTMLInputElement
        const rect = el.getBoundingClientRect()
        const inputType = input.type || 'text'
        let elType: InteractiveElement['type'] = 'input'
        if (inputType === 'checkbox') elType = 'checkbox'
        if (inputType === 'radio') elType = 'radio'

        interactiveElements.push({
          selector: getSelector(el),
          type: elType,
          placeholder: input.placeholder || undefined,
          value: input.value || undefined,
          ariaLabel: input.getAttribute('aria-label') || undefined,
          isVisible: rect.width > 0 && rect.height > 0,
          isEnabled: !input.disabled,
          boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
        })
      })

      // Selects
      document.querySelectorAll('select').forEach((el) => {
        const select = el as HTMLSelectElement
        const rect = el.getBoundingClientRect()
        interactiveElements.push({
          selector: getSelector(el),
          type: 'select',
          value: select.value || undefined,
          isVisible: rect.width > 0 && rect.height > 0,
          isEnabled: !select.disabled,
          boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
        })
      })

      // Textareas
      document.querySelectorAll('textarea').forEach((el) => {
        const textarea = el as HTMLTextAreaElement
        const rect = el.getBoundingClientRect()
        interactiveElements.push({
          selector: getSelector(el),
          type: 'textarea',
          placeholder: textarea.placeholder || undefined,
          value: textarea.value || undefined,
          isVisible: rect.width > 0 && rect.height > 0,
          isEnabled: !textarea.disabled,
          boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
        })
      })

      return interactiveElements
    })

    // Extract forms
    const forms = await page.evaluate(() => {
      const getSelector = (el: Element): { type: 'css'; value: string } => {
        if (el.id) return { type: 'css', value: `#${el.id}` }
        return { type: 'css', value: el.tagName.toLowerCase() }
      }

      const formElements: FormAnalysis[] = []
      document.querySelectorAll('form').forEach((form) => {
        const formEl = form as HTMLFormElement
        formElements.push({
          selector: getSelector(form),
          action: formEl.action || undefined,
          method: formEl.method || 'get',
          fields: [],
          submitButton: undefined
        })
      })
      return formElements
    })

    // Extract navigation
    const navigation = await page.evaluate(() => {
      const getSelector = (el: Element): { type: 'css'; value: string } => {
        if (el.id) return { type: 'css', value: `#${el.id}` }
        return { type: 'css', value: 'a' }
      }

      const navElements: NavigationElement[] = []
      document.querySelectorAll('nav a, header a, [role="navigation"] a').forEach((el) => {
        const anchor = el as HTMLAnchorElement
        const currentHost = window.location.host
        let isExternal = false
        try {
          isExternal = new URL(anchor.href).host !== currentHost
        } catch {
          isExternal = false
        }
        navElements.push({
          text: anchor.textContent?.trim() || '',
          href: anchor.href,
          selector: getSelector(el),
          isExternal
        })
      })
      return navElements
    })

    // Extract content
    const content = await page.evaluate(() => {
      const contentData: ContentExtract = {
        headings: [],
        paragraphs: [],
        tables: [],
        lists: [],
        images: []
      }

      // Headings
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el) => {
        const level = parseInt(el.tagName.charAt(1))
        contentData.headings.push({
          level,
          text: el.textContent?.trim() || ''
        })
      })

      // Paragraphs
      document.querySelectorAll('p').forEach((el) => {
        const text = el.textContent?.trim()
        if (text && text.length > 10) {
          contentData.paragraphs.push(text)
        }
      })

      // Tables
      document.querySelectorAll('table').forEach((table) => {
        const headers: string[] = []
        const rows: string[][] = []

        table.querySelectorAll('th').forEach((th) => {
          headers.push(th.textContent?.trim() || '')
        })

        table.querySelectorAll('tbody tr').forEach((tr) => {
          const row: string[] = []
          tr.querySelectorAll('td').forEach((td) => {
            row.push(td.textContent?.trim() || '')
          })
          if (row.length > 0) rows.push(row)
        })

        if (headers.length > 0 || rows.length > 0) {
          contentData.tables.push({ headers, rows })
        }
      })

      // Lists
      document.querySelectorAll('ul, ol').forEach((list) => {
        const items: string[] = []
        list.querySelectorAll('li').forEach((li) => {
          const text = li.textContent?.trim()
          if (text) items.push(text)
        })
        if (items.length > 0) contentData.lists.push(items)
      })

      // Images
      document.querySelectorAll('img').forEach((img) => {
        const imgEl = img as HTMLImageElement
        contentData.images.push({
          src: imgEl.src,
          alt: imgEl.alt || ''
        })
      })

      return contentData
    })

    return {
      url,
      title,
      elements,
      forms,
      navigation,
      content,
      screenshot
    }
  }

  async getCurrentUrl(sessionId: string): Promise<string> {
    const page = this.pages.get(sessionId)
    if (!page) throw new Error(`No page found for session ${sessionId}`)
    return page.url()
  }

  async getPageTitle(sessionId: string): Promise<string> {
    const page = this.pages.get(sessionId)
    if (!page) throw new Error(`No page found for session ${sessionId}`)
    return await page.title()
  }
}

// Singleton instance
export const browserManager = new BrowserManager()
export default browserManager
