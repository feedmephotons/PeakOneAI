'use client'

// The standalone /ai/assistant chat was a fake (always replied with a canned
// "feature is being actively developed" message and never called /api/ai/chat).
// Lisa is the single canonical AI chat surface, fully wired to the real
// streaming /api/ai/chat route. We retire this duplicate by redirecting to /lisa.
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export default function AIAssistantRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/lisa')
  }, [router])

  return (
    <div className="peak-os flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="peak-orb relative h-16 w-16 animate-peak-pulse-glow">
          <Sparkles className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-white" />
        </div>
        <div>
          <p className="text-lg font-semibold text-peak">Opening Lisa…</p>
          <p className="mt-1 text-sm text-peak-muted">Your AI orchestrator lives at /lisa.</p>
        </div>
      </div>
    </div>
  )
}
