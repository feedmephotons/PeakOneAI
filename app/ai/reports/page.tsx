'use client'

import { useMemo, useState } from 'react'
import { BarChart3, Download, Calendar, FileText, Bot, Loader2 } from 'lucide-react'
import {
  MOCK_MISSIONS,
  MOCK_MISSION,
  MOCK_STATS,
  MOCK_PRIORITIES,
  getMockAnalytics,
  FIXED_TODAY,
  ACME_COMPANY,
} from '@/lib/peak/mock'

type ReportType = 'weekly' | 'monthly' | 'quarterly' | 'mission' | 'board'

interface Report {
  id: string
  name: string
  type: ReportType
  generatedAt: string
  /** Multi-line text body, rendered into the downloaded file. */
  body: string
}

/** Build the canonical Acme Corp report body for a given type. Deterministic. */
function buildReportBody(type: ReportType): string {
  const a = getMockAnalytics()
  const lines: string[] = []
  lines.push(`${ACME_COMPANY} — ${reportTitle(type)}`)
  lines.push(`Generated: ${new Date(FIXED_TODAY).toDateString()} by Lisa AI`)
  lines.push('')
  lines.push('TODAY AT A GLANCE')
  MOCK_STATS.forEach((s) => lines.push(`  • ${s.value} ${s.label} — ${s.sublabel}`))
  lines.push('')
  lines.push('MISSIONS')
  MOCK_MISSIONS.forEach((m) =>
    lines.push(`  • ${m.name}: ${m.progress}% (${m.status.replace('_', ' ').toLowerCase()})`),
  )
  lines.push('')
  lines.push('TOP PRIORITIES')
  MOCK_PRIORITIES.forEach((p) => lines.push(`  • [${p.priority}] ${p.title} — ${p.detail}`))
  lines.push('')
  lines.push('TASK PERFORMANCE')
  lines.push(`  • Total: ${a.tasksTotal}  Completed: ${a.tasksCompleted}  In progress: ${a.tasksInProgress}  Overdue: ${a.tasksOverdue}`)
  lines.push(`  • Completion rate: ${a.completionRate}%`)
  lines.push('')
  lines.push('KEY RISK')
  const highRisk = MOCK_MISSION.risks?.find((r) => r.level === 'HIGH')
  if (highRisk) lines.push(`  • ${highRisk.title}: ${highRisk.note}`)
  lines.push('')
  if (MOCK_MISSION.keyMetrics?.revenueImpact) {
    lines.push(`Revenue impact (Launch Product X): ${MOCK_MISSION.keyMetrics.revenueImpact}`)
  }
  return lines.join('\n')
}

function reportTitle(type: ReportType): string {
  switch (type) {
    case 'weekly':
      return 'Weekly Activity Summary'
    case 'monthly':
      return 'Monthly Productivity Report'
    case 'quarterly':
      return 'Q2 Team Performance'
    case 'mission':
      return 'Launch Product X — Mission Report'
    case 'board':
      return 'Q2 Board Update'
  }
}

/** Seed reports from the canonical Acme world (deterministic dates off FIXED_TODAY). */
function seedReports(): Report[] {
  const today = new Date(FIXED_TODAY).getTime()
  const day = 86400000
  const types: { type: ReportType; ageDays: number }[] = [
    { type: 'weekly', ageDays: 1 },
    { type: 'board', ageDays: 1 },
    { type: 'mission', ageDays: 3 },
    { type: 'quarterly', ageDays: 14 },
    { type: 'monthly', ageDays: 18 },
  ]
  return types.map(({ type, ageDays }, i) => ({
    id: `report-${i + 1}`,
    name: reportTitle(type),
    type,
    generatedAt: new Date(today - ageDays * day).toISOString(),
    body: buildReportBody(type),
  }))
}

export default function AIReportsPage() {
  const [reports, setReports] = useState<Report[]>(() => seedReports())
  const [generating, setGenerating] = useState(false)

  const downloadReport = (report: Report) => {
    const blob = new Blob([report.body], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const slug = report.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    a.download = `acme-${slug}-${FIXED_TODAY.split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Wire "Generate Report": synthesize a fresh weekly report from live canon
  // data and prepend it. Deterministic content; SSR-safe (only runs on click).
  const generateReport = () => {
    setGenerating(true)
    setTimeout(() => {
      const id = `report-gen-${reports.length + 1}`
      const newReport: Report = {
        id,
        name: 'Weekly Activity Summary',
        type: 'weekly',
        generatedAt: FIXED_TODAY,
        body: buildReportBody('weekly'),
      }
      setReports((prev) => [newReport, ...prev])
      setGenerating(false)
    }, 700)
  }

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })

  const reportCount = reports.length
  const summaryCards = useMemo(
    () => [
      { icon: FileText, label: 'Total Reports', value: String(reportCount), color: 'text-peak-primary-300' },
      { icon: Calendar, label: 'Auto-generation', value: 'Weekly', color: 'text-peak-blue' },
      { icon: Bot, label: 'Powered by', value: 'Lisa AI', color: 'text-peak-green' },
    ],
    [reportCount],
  )

  return (
    <div className="peak-os min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-peak-primary/15">
              <BarChart3 className="h-7 w-7 text-peak-primary-300" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-peak">Reports</h1>
              <p className="text-sm text-peak-muted">Auto-generated {ACME_COMPANY} reports and analytics</p>
            </div>
          </div>
          <button
            onClick={generateReport}
            disabled={generating}
            className="flex items-center gap-2 rounded-xl bg-peak-primary px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_var(--peak-glow)] transition hover:bg-peak-primary-600 disabled:opacity-60"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
            {generating ? 'Generating…' : 'Generate Report'}
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.label} className="peak-glass p-6">
              <card.icon className={`mb-3 h-8 w-8 ${card.color}`} />
              <p className="text-2xl font-bold text-peak">{card.value}</p>
              <p className="text-sm text-peak-muted">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="peak-glass overflow-hidden p-0">
          <div className="border-b border-peak-border p-4">
            <h2 className="font-semibold text-peak">Recent Reports</h2>
          </div>
          <div className="divide-y divide-[var(--peak-border)]">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 transition hover:bg-white/[0.03]">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-peak-primary/15">
                    <FileText className="h-5 w-5 text-peak-primary-300" />
                  </div>
                  <div>
                    <p className="font-medium text-peak">{report.name}</p>
                    <p className="text-sm text-peak-muted">Generated {fmtDate(report.generatedAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => downloadReport(report)}
                  className="flex items-center gap-2 rounded-lg border border-peak-border px-3 py-1.5 text-sm text-peak-muted transition hover:bg-white/[0.06] hover:text-peak"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
