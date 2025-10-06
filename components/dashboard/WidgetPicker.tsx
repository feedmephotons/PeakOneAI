'use client'

import { X } from 'lucide-react'
import * as Icons from 'lucide-react'
import { WIDGET_DEFINITIONS, WidgetType } from '@/lib/dashboard'

interface WidgetPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelectWidget: (type: WidgetType) => void
}

export default function WidgetPicker({ isOpen, onClose, onSelectWidget }: WidgetPickerProps) {
  if (!isOpen) return null

  const handleSelect = (type: WidgetType) => {
    onSelectWidget(type)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Widget</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choose a widget to add to your dashboard
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Widget Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.entries(WIDGET_DEFINITIONS) as [WidgetType, typeof WIDGET_DEFINITIONS[WidgetType]][]).map(([type, definition]) => {
              const IconComponent = (Icons as { [key: string]: React.ComponentType<{ className?: string }> })[definition.icon]

              return (
                <button
                  key={type}
                  onClick={() => handleSelect(type)}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-600 transition">
                      {IconComponent && (
                        <IconComponent className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-white transition" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {definition.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {definition.description}
                      </p>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                        Size: {definition.defaultSize.width}×{definition.defaultSize.height}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
