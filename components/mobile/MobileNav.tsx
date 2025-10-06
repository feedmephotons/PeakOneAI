'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, CheckSquare, File, Calendar, MessageSquare, Menu } from 'lucide-react'

export default function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: File, label: 'Files', path: '/files' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' }
  ]

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Bottom Navigation */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-2xl">
        <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                  active
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Icon className={`w-6 h-6 transition-transform ${active ? 'scale-110' : ''}`} />
                <span className={`text-xs mt-1 font-medium ${active ? 'text-purple-600 dark:text-purple-400' : ''}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
