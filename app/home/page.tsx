'use client'

// /home — alias to the original Peak One dashboard. The new Daily Brief lives
// at "/" (reworked by the daily-brief agent); this preserves the legacy
// dashboard so the sidebar "Home" link always resolves.
import PeakDashboard from '@/components/dashboard/PeakDashboard'

export default function HomeAliasPage() {
  return <PeakDashboard />
}
