'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, Video, MessageSquare, FolderOpen, CheckSquare } from 'lucide-react'

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: MessageSquare, label: 'Threads', path: '/messages' },
  { icon: Video, label: 'Meetings', path: '/meeting' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: FolderOpen, label: 'Files', path: '/files' },
]

export default function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-around px-1 py-1.5 safe-area-bottom">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <button
                key={item.path}
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
