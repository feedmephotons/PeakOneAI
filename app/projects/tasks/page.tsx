'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Legacy duplicate of the task board. The canonical, fully-wired board now
 * lives at /tasks (navy Peak design, seeded from MOCK_TASKS). This page is a
 * thin redirect so old links/bookmarks land on the real board.
 */
export default function ProjectsTasksRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/tasks')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-peak-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-peak-muted">Redirecting to Tasks…</p>
      </div>
    </div>
  )
}
