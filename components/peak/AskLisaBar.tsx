'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'

export interface AskLisaBarProps {
  placeholder?: string
  /** Override the open behavior. By default it opens the global command palette. */
  onOpen?: () => void
  className?: string
}

/**
 * The top "Ask Lisa anything… ⌘K" command field. Opens the existing global
 * CommandPalette by dispatching a Cmd/Ctrl+K keydown (handled by
 * KeyboardShortcutsProvider), so it works anywhere in the shell.
 */
export default function AskLisaBar({
  placeholder = 'Ask Lisa anything…',
  onOpen,
  className = '',
}: AskLisaBarProps) {
  const open = () => {
    if (onOpen) {
      onOpen()
      return
    }
    // Trigger the global Cmd+K command palette.
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true }),
    )
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true }),
    )
  }

  return (
    <button
      onClick={open}
      className={[
        'group flex w-full items-center gap-3 rounded-xl border border-peak-border bg-white/[0.03] px-4 py-2.5 text-left transition-colors hover:bg-white/[0.06]',
        className,
      ].join(' ')}
    >
      <Sparkles className="h-4 w-4 shrink-0 text-peak-primary-300" />
      <span className="flex-1 truncate text-sm text-peak-muted">{placeholder}</span>
      <kbd className="hidden shrink-0 rounded border border-peak-border bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-peak-dim sm:inline">
        ⌘ K
      </kbd>
    </button>
  )
}
