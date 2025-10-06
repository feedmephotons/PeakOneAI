'use client'

import { useState } from 'react'
import { GripVertical, Settings, X, Maximize2, Minimize2 } from 'lucide-react'
import { WidgetConfig } from '@/lib/dashboard'

interface WidgetContainerProps {
  widget: WidgetConfig
  onMove?: (widgetId: string, position: { x: number; y: number }) => void
  onResize?: (widgetId: string, size: { width: number; height: number }) => void
  onRemove?: (widgetId: string) => void
  onSettings?: (widgetId: string) => void
  children: React.ReactNode
  isDragging?: boolean
}

export default function WidgetContainer({
  widget,
  onMove,
  onResize,
  onRemove,
  onSettings,
  children,
  isDragging = false
}: WidgetContainerProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('widgetId', widget.id)
    e.dataTransfer.setData('widgetPosition', JSON.stringify(widget.position))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const widgetId = e.dataTransfer.getData('widgetId')
    if (widgetId && widgetId !== widget.id && onMove) {
      // Swap positions
      onMove(widgetId, widget.position)
    }
  }

  const gridRowSpan = isExpanded ? widget.size.height * 2 : widget.size.height
  const gridColSpan = isExpanded ? Math.min(widget.size.width * 2, 4) : widget.size.width

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'hover:shadow-lg'
      } ${isExpanded ? 'z-10' : ''}`}
      style={{
        gridColumn: `span ${gridColSpan}`,
        gridRow: `span ${gridRowSpan}`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            draggable
            onDragStart={handleDragStart}
            className="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            {widget.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition"
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          {onSettings && (
            <button
              onClick={() => onSettings(widget.id)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => onRemove(widget.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition"
              title="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-auto" style={{ maxHeight: isExpanded ? '600px' : '400px' }}>
        {children}
      </div>
    </div>
  )
}
