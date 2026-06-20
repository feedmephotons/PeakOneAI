'use client'

import Link from 'next/link'
import { Keyboard, Command, ArrowLeft } from 'lucide-react'
import { GlassPanel, SectionLabel } from '@/components/peak'

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
    <div className="p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-peak-muted hover:text-peak transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-peak-primary/15 rounded-2xl flex items-center justify-center ring-1 ring-peak-primary/20">
            <Keyboard className="w-7 h-7 text-peak-primary-300" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-peak">Keyboard Shortcuts</h1>
            <p className="text-peak-muted">Speed up your workflow with these shortcuts</p>
          </div>
        </div>

        {/* Quick Search */}
        <GlassPanel className="p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-peak-border rounded-xl">
              <Command className="w-4 h-4 text-peak-dim" />
              <span className="text-peak-muted">+</span>
              <span className="text-peak font-mono">K</span>
            </div>
            <div>
              <p className="font-medium text-peak">Pro Tip: Use Command Palette</p>
              <p className="text-sm text-peak-muted">
                Press ⌘K to quickly access any feature or page
              </p>
            </div>
          </div>
        </GlassPanel>

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SHORTCUTS.map(section => (
            <GlassPanel key={section.category} className="p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-peak-border">
                <SectionLabel>{section.category}</SectionLabel>
              </div>
              <div className="divide-y divide-peak-border">
                {section.items.map((shortcut, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between">
                    <span className="text-peak-muted">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span key={keyIdx}>
                          <kbd className="px-2 py-1 bg-white/[0.05] text-peak rounded text-sm font-mono border border-peak-border">
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-peak-dim mx-1">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          ))}
        </div>

        {/* Customize Note */}
        <div className="mt-8 text-center">
          <p className="text-peak-muted text-sm">
            Keyboard shortcuts cannot be customized at this time.
          </p>
        </div>
      </div>
    </div>
  )
}
