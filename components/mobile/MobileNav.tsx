'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  Home, Video, MessageSquare, FolderOpen, CheckSquare,
  Phone, Calendar, Shield,
} from 'lucide-react'
import { useAppStore, type UIMode } from '@/stores/app-store'

interface MobileNavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  path: string
  modes?: UIMode[]
}

const NAV_ITEMS: MobileNavItem[] = [
  { icon: Home, label: 'Home', path: '/' },
  // Personal
  { icon: Phone, label: 'Calls', path: '/calls', modes: ['personal'] },
  { icon: Calendar, label: 'Calendar', path: '/calendar', modes: ['personal'] },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks', modes: ['personal'] },
  { icon: FolderOpen, label: 'Files', path: '/files', modes: ['personal'] },
  // Team
  { icon: MessageSquare, label: 'Threads', path: '/messages', modes: ['team'] },
  { icon: Video, label: 'Meetings', path: '/meeting', modes: ['team'] },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks', modes: ['team'] },
  { icon: FolderOpen, label: 'Files', path: '/files', modes: ['team'] },
  // Enterprise
  { icon: MessageSquare, label: 'Threads', path: '/messages', modes: ['enterprise'] },
  { icon: Video, label: 'Meetings', path: '/meeting', modes: ['enterprise'] },
  { icon: Shield, label: 'Admin', path: '/settings/org', modes: ['enterprise'] },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks', modes: ['enterprise'] },
]

export default function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { uiMode } = useAppStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentMode = mounted ? uiMode : 'team'
  const filteredItems = NAV_ITEMS.filter(item => !item.modes || item.modes.includes(currentMode))

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-around px-1 py-1.5 safe-area-bottom">
          {filteredItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <button
                key={`${item.label}-${item.path}`}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-lg transition-colors ${
                  active
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
