export type WidgetType =
  | 'tasks_overview'
  | 'calendar'
  | 'activity_feed'
  | 'quick_stats'
  | 'recent_files'
  | 'upcoming_meetings'
  | 'task_progress'
  | 'team_activity'
  | 'notifications'
  | 'quick_actions'
  | 'weather'
  | 'notes'
  | 'analytics'
  | 'ai_assistant'
  | 'bookmarks'

export interface WidgetConfig {
  id: string
  type: WidgetType
  title: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  settings?: Record<string, unknown>
  isVisible: boolean
}

export interface DashboardLayout {
  id: string
  name: string
  widgets: WidgetConfig[]
  createdAt: Date
  updatedAt: Date
  isDefault?: boolean
}

export const WIDGET_DEFINITIONS: Record<WidgetType, {
  title: string
  description: string
  icon: string
  defaultSize: { width: number; height: number }
  minSize: { width: number; height: number }
  maxSize: { width: number; height: number }
}> = {
  tasks_overview: {
    title: 'Tasks Overview',
    description: 'View your tasks by status',
    icon: 'CheckSquare',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 4, height: 4 }
  },
  calendar: {
    title: 'Calendar',
    description: 'View upcoming events',
    icon: 'Calendar',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 4, height: 4 }
  },
  activity_feed: {
    title: 'Activity Feed',
    description: 'Recent team activity',
    icon: 'Activity',
    defaultSize: { width: 2, height: 3 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 2, height: 4 }
  },
  quick_stats: {
    title: 'Quick Stats',
    description: 'Key metrics at a glance',
    icon: 'BarChart2',
    defaultSize: { width: 4, height: 1 },
    minSize: { width: 2, height: 1 },
    maxSize: { width: 4, height: 2 }
  },
  recent_files: {
    title: 'Recent Files',
    description: 'Recently accessed files',
    icon: 'File',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 3, height: 3 }
  },
  upcoming_meetings: {
    title: 'Upcoming Meetings',
    description: 'Your next meetings',
    icon: 'Video',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 1 },
    maxSize: { width: 3, height: 3 }
  },
  task_progress: {
    title: 'Task Progress',
    description: 'Track task completion',
    icon: 'TrendingUp',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 3, height: 3 }
  },
  team_activity: {
    title: 'Team Activity',
    description: 'What your team is working on',
    icon: 'Users',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 3, height: 3 }
  },
  notifications: {
    title: 'Notifications',
    description: 'Recent notifications',
    icon: 'Bell',
    defaultSize: { width: 1, height: 2 },
    minSize: { width: 1, height: 2 },
    maxSize: { width: 2, height: 3 }
  },
  quick_actions: {
    title: 'Quick Actions',
    description: 'Common actions',
    icon: 'Zap',
    defaultSize: { width: 2, height: 1 },
    minSize: { width: 2, height: 1 },
    maxSize: { width: 4, height: 2 }
  },
  weather: {
    title: 'Weather',
    description: 'Current weather',
    icon: 'Cloud',
    defaultSize: { width: 1, height: 1 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 2, height: 2 }
  },
  notes: {
    title: 'Quick Notes',
    description: 'Scratchpad for quick notes',
    icon: 'StickyNote',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 3, height: 4 }
  },
  analytics: {
    title: 'Analytics',
    description: 'Performance charts',
    icon: 'PieChart',
    defaultSize: { width: 3, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 4, height: 3 }
  },
  ai_assistant: {
    title: 'AI Assistant',
    description: 'Quick access to Lisa',
    icon: 'Sparkles',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 3, height: 4 }
  },
  bookmarks: {
    title: 'Bookmarks',
    description: 'Quick links',
    icon: 'Bookmark',
    defaultSize: { width: 1, height: 2 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 2, height: 3 }
  }
}

class DashboardManager {
  private layoutsKey = 'dashboard_layouts'
  private activeLayoutKey = 'active_dashboard_layout'

  getLayouts(): DashboardLayout[] {
    const layouts = localStorage.getItem(this.layoutsKey)
    if (!layouts) {
      const defaultLayout = this.createDefaultLayout()
      this.saveLayout(defaultLayout)
      return [defaultLayout]
    }

    return JSON.parse(layouts).map((l: DashboardLayout) => ({
      ...l,
      createdAt: new Date(l.createdAt),
      updatedAt: new Date(l.updatedAt)
    }))
  }

  getActiveLayout(): DashboardLayout {
    const activeId = localStorage.getItem(this.activeLayoutKey)
    const layouts = this.getLayouts()

    if (activeId) {
      const layout = layouts.find(l => l.id === activeId)
      if (layout) return layout
    }

    return layouts.find(l => l.isDefault) || layouts[0]
  }

  setActiveLayout(layoutId: string): void {
    localStorage.setItem(this.activeLayoutKey, layoutId)
  }

  saveLayout(layout: DashboardLayout): DashboardLayout {
    const layouts = this.getLayouts()
    const index = layouts.findIndex(l => l.id === layout.id)

    const updatedLayout = {
      ...layout,
      updatedAt: new Date()
    }

    if (index === -1) {
      layouts.push(updatedLayout)
    } else {
      layouts[index] = updatedLayout
    }

    localStorage.setItem(this.layoutsKey, JSON.stringify(layouts))
    return updatedLayout
  }

  createLayout(name: string): DashboardLayout {
    const layout: DashboardLayout = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      widgets: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false
    }

    return this.saveLayout(layout)
  }

  deleteLayout(layoutId: string): boolean {
    const layouts = this.getLayouts()
    const filtered = layouts.filter(l => l.id !== layoutId)

    if (filtered.length === layouts.length) return false

    localStorage.setItem(this.layoutsKey, JSON.stringify(filtered))

    // If deleted layout was active, switch to default
    const activeId = localStorage.getItem(this.activeLayoutKey)
    if (activeId === layoutId) {
      const defaultLayout = filtered.find(l => l.isDefault) || filtered[0]
      this.setActiveLayout(defaultLayout.id)
    }

    return true
  }

  addWidget(layoutId: string, type: WidgetType): WidgetConfig {
    const layout = this.getLayouts().find(l => l.id === layoutId)
    if (!layout) throw new Error('Layout not found')

    const definition = WIDGET_DEFINITIONS[type]
    const widget: WidgetConfig = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      title: definition.title,
      position: this.findNextPosition(layout.widgets),
      size: definition.defaultSize,
      isVisible: true
    }

    layout.widgets.push(widget)
    this.saveLayout(layout)

    return widget
  }

  updateWidget(layoutId: string, widgetId: string, updates: Partial<WidgetConfig>): void {
    const layout = this.getLayouts().find(l => l.id === layoutId)
    if (!layout) return

    const widget = layout.widgets.find(w => w.id === widgetId)
    if (!widget) return

    Object.assign(widget, updates)
    this.saveLayout(layout)
  }

  removeWidget(layoutId: string, widgetId: string): void {
    const layout = this.getLayouts().find(l => l.id === layoutId)
    if (!layout) return

    layout.widgets = layout.widgets.filter(w => w.id !== widgetId)
    this.saveLayout(layout)
  }

  private findNextPosition(widgets: WidgetConfig[]): { x: number; y: number } {
    if (widgets.length === 0) return { x: 0, y: 0 }

    // Find the position with the most available space
    const gridCols = 4
    const occupiedCells = new Set<string>()

    widgets.forEach(w => {
      for (let x = w.position.x; x < w.position.x + w.size.width; x++) {
        for (let y = w.position.y; y < w.position.y + w.size.height; y++) {
          occupiedCells.add(`${x},${y}`)
        }
      }
    })

    // Find first available position
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < gridCols; x++) {
        if (!occupiedCells.has(`${x},${y}`)) {
          return { x, y }
        }
      }
    }

    return { x: 0, y: widgets.length }
  }

  private createDefaultLayout(): DashboardLayout {
    return {
      id: 'default',
      name: 'Default Layout',
      widgets: [
        {
          id: 'tasks-1',
          type: 'tasks_overview',
          title: 'Tasks Overview',
          position: { x: 0, y: 0 },
          size: { width: 2, height: 2 },
          isVisible: true
        },
        {
          id: 'calendar-1',
          type: 'calendar',
          title: 'Calendar',
          position: { x: 2, y: 0 },
          size: { width: 2, height: 2 },
          isVisible: true
        },
        {
          id: 'quick-stats-1',
          type: 'quick_stats',
          title: 'Quick Stats',
          position: { x: 0, y: 2 },
          size: { width: 4, height: 1 },
          isVisible: true
        },
        {
          id: 'activity-1',
          type: 'activity_feed',
          title: 'Activity Feed',
          position: { x: 0, y: 3 },
          size: { width: 2, height: 2 },
          isVisible: true
        },
        {
          id: 'recent-files-1',
          type: 'recent_files',
          title: 'Recent Files',
          position: { x: 2, y: 3 },
          size: { width: 2, height: 2 },
          isVisible: true
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: true
    }
  }

  duplicateLayout(layoutId: string, newName: string): DashboardLayout {
    const layout = this.getLayouts().find(l => l.id === layoutId)
    if (!layout) throw new Error('Layout not found')

    const duplicate: DashboardLayout = {
      ...layout,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: newName,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      widgets: layout.widgets.map(w => ({ ...w, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) }))
    }

    return this.saveLayout(duplicate)
  }
}

export const dashboardManager = new DashboardManager()
