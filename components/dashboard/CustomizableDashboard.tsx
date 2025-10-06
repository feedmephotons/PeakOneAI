'use client'

import { useState, useEffect } from 'react'
import { Plus, Layout, Save, Settings } from 'lucide-react'
import { dashboardManager, WidgetConfig, WidgetType } from '@/lib/dashboard'
import WidgetContainer from './WidgetContainer'
import WidgetPicker from './WidgetPicker'
import TasksOverviewWidget from './widgets/TasksOverviewWidget'
import QuickStatsWidget from './widgets/QuickStatsWidget'
import ActivityFeedWidget from './widgets/ActivityFeedWidget'
import AnalyticsWidget from './widgets/AnalyticsWidget'

export default function CustomizableDashboard() {
  const [layout, setLayout] = useState<ReturnType<typeof dashboardManager.getActiveLayout> | null>(null)
  const [isWidgetPickerOpen, setIsWidgetPickerOpen] = useState(false)
  const [draggingWidget, setDraggingWidget] = useState<string | null>(null)

  useEffect(() => {
    setLayout(dashboardManager.getActiveLayout())
  }, [])

  const handleAddWidget = (type: WidgetType) => {
    if (!layout) return
    const widget = dashboardManager.addWidget(layout.id, type)
    setLayout(dashboardManager.getActiveLayout())
  }

  const handleRemoveWidget = (widgetId: string) => {
    if (!layout) return
    dashboardManager.removeWidget(layout.id, widgetId)
    setLayout(dashboardManager.getActiveLayout())
  }

  const handleMoveWidget = (widgetId: string, newPosition: { x: number; y: number }) => {
    if (!layout) return
    dashboardManager.updateWidget(layout.id, widgetId, { position: newPosition })
    setLayout(dashboardManager.getActiveLayout())
  }

  const renderWidget = (widget: WidgetConfig) => {
    switch (widget.type) {
      case 'tasks_overview':
        return <TasksOverviewWidget />
      case 'quick_stats':
        return <QuickStatsWidget />
      case 'activity_feed':
        return <ActivityFeedWidget />
      case 'analytics':
        return <AnalyticsWidget />
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-sm">Widget: {widget.type}</p>
          </div>
        )
    }
  }

  if (!layout) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Customize your workspace with widgets
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                dashboardManager.saveLayout(layout)
                alert('Dashboard layout saved!')
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Layout</span>
            </button>

            <button
              onClick={() => setIsWidgetPickerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add Widget</span>
            </button>
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-4 gap-4 auto-rows-[minmax(200px,auto)]">
          {layout.widgets.map((widget) => (
            <WidgetContainer
              key={widget.id}
              widget={widget}
              onMove={handleMoveWidget}
              onRemove={handleRemoveWidget}
              isDragging={draggingWidget === widget.id}
            >
              {renderWidget(widget)}
            </WidgetContainer>
          ))}
        </div>

        {/* Empty State */}
        {layout.widgets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
              <Layout className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No widgets yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add widgets to customize your dashboard
            </p>
            <button
              onClick={() => setIsWidgetPickerOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Widget</span>
            </button>
          </div>
        )}

        {/* Widget Picker Modal */}
        <WidgetPicker
          isOpen={isWidgetPickerOpen}
          onClose={() => setIsWidgetPickerOpen(false)}
          onSelectWidget={handleAddWidget}
        />
      </div>
    </div>
  )
}
