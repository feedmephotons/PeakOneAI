"use client"

import { useAppStore, NavStyle } from '@/stores/app-store'
import { LayoutGrid, PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NavStyleSwitcher() {
  const { navStyle, setNavStyle } = useAppStore()

  const options: { value: NavStyle; icon: React.ReactNode; label: string }[] = [
    { value: 'sidebar', icon: <PanelLeft className="h-4 w-4" />, label: 'Sidebar' },
    { value: 'megamenu', icon: <LayoutGrid className="h-4 w-4" />, label: 'Mega Menu' },
  ]

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setNavStyle(option.value)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
            navStyle === option.value
              ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
          )}
          title={option.label}
        >
          {option.icon}
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  )
}

export default NavStyleSwitcher
