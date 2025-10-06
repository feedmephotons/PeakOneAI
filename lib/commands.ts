// Calculator
export function calculate(expression: string): string | null {
  try {
    // Remove spaces and validate expression
    const sanitized = expression.replace(/\s/g, '')

    // Only allow numbers, operators, parentheses, and decimal points
    if (!/^[\d+\-*/().]+$/.test(sanitized)) {
      return null
    }

    // Evaluate the expression safely
    const result = Function('"use strict"; return (' + sanitized + ')')()

    if (typeof result === 'number' && !isNaN(result)) {
      return result.toString()
    }

    return null
  } catch {
    return null
  }
}

// Unit Converter
interface Conversion {
  from: string
  to: string
  value: number
}

const CONVERSIONS: Record<string, Record<string, number>> = {
  // Length
  length: {
    'm_ft': 3.28084,
    'ft_m': 0.3048,
    'km_mi': 0.621371,
    'mi_km': 1.60934,
    'cm_in': 0.393701,
    'in_cm': 2.54
  },
  // Weight
  weight: {
    'kg_lb': 2.20462,
    'lb_kg': 0.453592,
    'g_oz': 0.035274,
    'oz_g': 28.3495
  },
  // Temperature
  temperature: {
    'c_f': (v: number) => (v * 9/5) + 32,
    'f_c': (v: number) => (v - 32) * 5/9,
    'c_k': (v: number) => v + 273.15,
    'k_c': (v: number) => v - 273.15
  },
  // Volume
  volume: {
    'l_gal': 0.264172,
    'gal_l': 3.78541,
    'ml_oz': 0.033814,
    'oz_ml': 29.5735
  },
  // Speed
  speed: {
    'kmh_mph': 0.621371,
    'mph_kmh': 1.60934,
    'ms_kmh': 3.6,
    'kmh_ms': 0.277778
  }
}

export function convert(value: number, from: string, to: string): number | null {
  const key = `${from}_${to}`

  // Check all conversion categories
  for (const conversions of Object.values(CONVERSIONS)) {
    if (key in conversions) {
      const converter = conversions[key]
      if (typeof converter === 'function') {
        return converter(value)
      } else {
        return value * converter
      }
    }
  }

  return null
}

export function parseConversionQuery(query: string): { value: number; from: string; to: string } | null {
  // Match patterns like "10 km to mi", "100 c to f", "5 ft to m"
  const match = query.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)\s+(?:to|in)\s+([a-z]+)$/i)

  if (!match) return null

  return {
    value: parseFloat(match[1]),
    from: match[2].toLowerCase(),
    to: match[3].toLowerCase()
  }
}

// Text Snippets
export interface Snippet {
  id: string
  trigger: string
  content: string
  description?: string
  createdAt: Date
}

class SnippetManager {
  private storageKey = 'text_snippets'

  getSnippets(): Snippet[] {
    const snippets = localStorage.getItem(this.storageKey)
    if (!snippets) return this.getDefaultSnippets()

    return JSON.parse(snippets).map((s: Snippet) => ({
      ...s,
      createdAt: new Date(s.createdAt)
    }))
  }

  getSnippet(trigger: string): Snippet | undefined {
    return this.getSnippets().find(s => s.trigger === trigger)
  }

  createSnippet(trigger: string, content: string, description?: string): Snippet {
    const snippets = this.getSnippets()
    const snippet: Snippet = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      trigger,
      content,
      description,
      createdAt: new Date()
    }

    snippets.push(snippet)
    localStorage.setItem(this.storageKey, JSON.stringify(snippets))
    return snippet
  }

  deleteSnippet(id: string): boolean {
    const snippets = this.getSnippets()
    const filtered = snippets.filter(s => s.id !== id)

    if (filtered.length === snippets.length) return false

    localStorage.setItem(this.storageKey, JSON.stringify(filtered))
    return true
  }

  private getDefaultSnippets(): Snippet[] {
    return [
      {
        id: '1',
        trigger: '/email',
        content: 'Best regards,\n\n[Your Name]',
        description: 'Email signature',
        createdAt: new Date()
      },
      {
        id: '2',
        trigger: '/meeting',
        content: 'Hi team,\n\nLet\'s schedule a meeting to discuss:\n- \n- \n- \n\nPlease share your availability.',
        description: 'Meeting request template',
        createdAt: new Date()
      },
      {
        id: '3',
        trigger: '/addr',
        content: '123 Main Street\nCity, State 12345',
        description: 'Address template',
        createdAt: new Date()
      }
    ]
  }

  expandSnippet(text: string): string {
    const snippets = this.getSnippets()

    for (const snippet of snippets) {
      if (text.includes(snippet.trigger)) {
        text = text.replace(snippet.trigger, snippet.content)
      }
    }

    return text
  }
}

export const snippetManager = new SnippetManager()

// Command History
class CommandHistory {
  private storageKey = 'command_history'
  private maxHistory = 50

  getHistory(): string[] {
    const history = localStorage.getItem(this.storageKey)
    return history ? JSON.parse(history) : []
  }

  addCommand(command: string): void {
    if (!command.trim()) return

    let history = this.getHistory()

    // Remove duplicates
    history = history.filter(c => c !== command)

    // Add to beginning
    history.unshift(command)

    // Limit size
    history = history.slice(0, this.maxHistory)

    localStorage.setItem(this.storageKey, JSON.stringify(history))
  }

  clearHistory(): void {
    localStorage.removeItem(this.storageKey)
  }

  searchHistory(query: string): string[] {
    const history = this.getHistory()
    return history.filter(cmd =>
      cmd.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10)
  }
}

export const commandHistory = new CommandHistory()

// System Actions
export interface SystemAction {
  id: string
  title: string
  description: string
  icon: string
  action: () => void
  shortcut?: string
}

export function getSystemActions(theme: string, setTheme: (theme: string) => void): SystemAction[] {
  return [
    {
      id: 'toggle-theme',
      title: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      description: 'Toggle between light and dark themes',
      icon: theme === 'dark' ? 'Sun' : 'Moon',
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      shortcut: '⌘+Shift+L'
    },
    {
      id: 'clear-cache',
      title: 'Clear Cache',
      description: 'Clear browser cache and reload',
      icon: 'Trash2',
      action: () => {
        if (confirm('Clear all local cache?')) {
          localStorage.clear()
          window.location.reload()
        }
      }
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'View all keyboard shortcuts',
      icon: 'Keyboard',
      action: () => {
        // This would open a shortcuts modal
        alert('Keyboard shortcuts modal would open here')
      },
      shortcut: '?'
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download all your data',
      icon: 'Download',
      action: () => {
        const data = {
          tasks: localStorage.getItem('tasks'),
          files: localStorage.getItem('files'),
          snippets: localStorage.getItem('text_snippets'),
          // Add more data exports as needed
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `saasx-export-${new Date().toISOString()}.json`
        a.click()
      }
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      description: 'Help us improve',
      icon: 'MessageCircle',
      action: () => {
        window.open('mailto:feedback@saasx.com', '_blank')
      }
    }
  ]
}
