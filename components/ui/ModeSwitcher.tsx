'use client'

import { useAppStore, type UIMode } from '@/stores/app-store'
import { UI_MODE_META } from '@/config/navigation'
import { User, Users, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const MODE_ICONS: Record<UIMode, React.ComponentType<{ className?: string }>> = {
  personal: User,
  team: Users,
  enterprise: Building2,
}

const MODES: UIMode[] = ['personal', 'team', 'enterprise']

interface ModeSwitcherProps {
  /** Compact variant for embedding in menus */
  variant?: 'pill' | 'inline'
  className?: string
}

export function ModeSwitcher({ variant = 'pill', className }: ModeSwitcherProps) {
  const { uiMode, setUIMode } = useAppStore()

  if (variant === 'inline') {
    return (
      <div className={cn('space-y-1', className)}>
        <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1 mb-1.5">
          Mode
        </p>
        {MODES.map((mode) => {
          const Icon = MODE_ICONS[mode]
          const meta = UI_MODE_META[mode]
          const active = uiMode === mode

          return (
            <button
              key={mode}
              onClick={() => setUIMode(mode)}
              className={cn(
                'flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 text-left">
                <span className="font-medium">{meta.label}</span>
              </div>
              {active && (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // Pill variant - compact toggle for nav bar
  return (
    <div
      className={cn(
        'flex items-center gap-0.5 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg',
        className
      )}
    >
      {MODES.map((mode) => {
        const Icon = MODE_ICONS[mode]
        const meta = UI_MODE_META[mode]
        const active = uiMode === mode

        return (
          <button
            key={mode}
            onClick={() => setUIMode(mode)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all',
              active
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
            title={meta.description}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{meta.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default ModeSwitcher
