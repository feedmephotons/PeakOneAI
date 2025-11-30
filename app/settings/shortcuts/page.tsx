'use client'

import { Keyboard, Search, Command } from 'lucide-react'

const SHORTCUTS = [
  { category: 'Navigation', items: [
    { keys: ['⌘', 'K'], description: 'Open command palette' },
    { keys: ['⌘', '/'], description: 'Open search' },
    { keys: ['⌘', '1'], description: 'Go to Messages' },
    { keys: ['⌘', '2'], description: 'Go to Calendar' },
    { keys: ['⌘', '3'], description: 'Go to Tasks' },
    { keys: ['⌘', '4'], description: 'Go to Files' },
  ]},
  { category: 'Messaging', items: [
    { keys: ['⌘', 'N'], description: 'New message' },
    { keys: ['⌘', 'Enter'], description: 'Send message' },
    { keys: ['⌘', 'Shift', 'E'], description: 'Add emoji' },
    { keys: ['@'], description: 'Mention someone' },
  ]},
  { category: 'Tasks', items: [
    { keys: ['⌘', 'Shift', 'T'], description: 'Create new task' },
    { keys: ['⌘', 'D'], description: 'Mark task done' },
    { keys: ['⌘', 'E'], description: 'Edit task' },
  ]},
  { category: 'General', items: [
    { keys: ['⌘', 'Shift', 'L'], description: 'Toggle dark mode' },
    { keys: ['⌘', ','], description: 'Open settings' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
    { keys: ['Esc'], description: 'Close modal/dialog' },
  ]},
]

export default function ShortcutsSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Keyboard className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h1>
            <p className="text-gray-600 dark:text-gray-400">Speed up your workflow with these shortcuts</p>
          </div>
        </div>

        {/* Quick Search */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <Command className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">+</span>
              <span className="text-gray-900 dark:text-white font-mono">K</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Pro Tip: Use Command Palette</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Press ⌘K to quickly access any feature or page
              </p>
            </div>
          </div>
        </div>

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SHORTCUTS.map(section => (
            <div key={section.category} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">{section.category}</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {section.items.map((shortcut, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span key={keyIdx}>
                          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-mono border border-gray-200 dark:border-gray-600">
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-gray-400 mx-1">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Customize Note */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Keyboard shortcuts cannot be customized at this time.
          </p>
        </div>
      </div>
    </div>
  )
}
