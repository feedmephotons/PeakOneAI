'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Brain, TrendingUp, TrendingDown, Users, Clock, Target,
  Lightbulb, AlertTriangle, ChevronRight, BarChart3, Sparkles,
} from 'lucide-react'
import {
  MOCK_INSIGHT,
  MOCK_MISSION,
  MOCK_MISSIONS,
  MOCK_MISSION_RECOMMENDATIONS,
  ACME_COMPANY,
} from '@/lib/peak/mock'

type InsightType = 'productivity' | 'collaboration' | 'opportunity' | 'warning'
type Impact = 'high' | 'medium' | 'low'

interface Insight {
  id: string
  type: InsightType
  title: string
  description: string
  impact: Impact
  actionable: boolean
  /** Where "Take Action" should send the user. */
  actionHref: string
  /** If set, send this as a Lisa prompt instead of navigating to a page. */
  lisaPrompt?: string
  metric?: {
    value: string
    change: number
    trend: 'up' | 'down'
  }
}

/** Map mission risk levels to insight impact. */
const RISK_IMPACT: Record<string, Impact> = { HIGH: 'high', MED: 'medium', LOW: 'low' }
/** Map mission-recommendation tone to an insight type. */
const TONE_TYPE: Record<string, InsightType> = {
  red: 'warning',
  amber: 'opportunity',
  green: 'productivity',
  primary: 'collaboration',
}

/**
 * Insights are derived deterministically from the canonical Acme Corp world:
 *  - Lisa's Insight of the Day (MOCK_INSIGHT)
 *  - the Launch Product X mission risks (MOCK_MISSION.risks)
 *  - Lisa's mission recommendations (MOCK_MISSION_RECOMMENDATIONS)
 *  - the at-risk mission (Q2 Growth Engine) progress
 * No Date.now()/random — SSR-safe.
 */
function buildInsights(): Insight[] {
  const out: Insight[] = []

  // 1. Insight of the Day — Brian Miller / pricing.
  out.push({
    id: MOCK_INSIGHT.id,
    type: 'warning',
    title: MOCK_INSIGHT.title,
    description: MOCK_INSIGHT.body,
    impact: 'high',
    actionable: true,
    actionHref: MOCK_INSIGHT.cta?.href || '/people/contact-brian-miller',
  })

  // 2. Mission risks → warning/opportunity insights.
  ;(MOCK_MISSION.risks || []).forEach((risk) => {
    out.push({
      id: `insight-${risk.id}`,
      type: risk.level === 'HIGH' ? 'warning' : 'opportunity',
      title: `${risk.title} — ${MOCK_MISSION.name}`,
      description: `${risk.note} (Impact: ${risk.impact}; probability: ${risk.probability}.)`,
      impact: RISK_IMPACT[risk.level] ?? 'medium',
      actionable: true,
      actionHref: `/missions/${MOCK_MISSION.id}`,
      lisaPrompt: `What's at risk on ${MOCK_MISSION.name} and how do I unblock "${risk.title}"?`,
    })
  })

  // 3. Q2 Growth Engine momentum (campaign 18% above target = opportunity).
  const q2 = MOCK_MISSIONS.find((m) => m.id === 'mission-q2-growth')
  if (q2) {
    out.push({
      id: 'insight-q2-momentum',
      type: 'opportunity',
      title: 'Q2 campaign is tracking 18% above target',
      description:
        'The Q2 Growth Engine campaign is outperforming on qualified pipeline. Now is a good time to lock the launch-week comms sequence with Lisa Park.',
      impact: 'high',
      actionable: true,
      actionHref: `/missions/${q2.id}`,
      metric: { value: '+18%', change: 18, trend: 'up' },
    })
  }

  // 4. Lisa recommendations → actionable insights routed to Lisa.
  MOCK_MISSION_RECOMMENDATIONS.forEach((rec) => {
    out.push({
      id: `insight-${rec.id}`,
      type: TONE_TYPE[rec.tone || 'primary'] ?? 'collaboration',
      title: rec.title,
      description: rec.body,
      impact: rec.tone === 'red' ? 'high' : rec.tone === 'amber' ? 'medium' : 'low',
      actionable: true,
      actionHref: '/lisa',
      lisaPrompt: rec.title,
    })
  })

  return out
}

export default function AIInsightsPage() {
  const router = useRouter()
  const insights = useMemo(() => buildInsights(), [])
  const [filter, setFilter] = useState<'all' | InsightType>('all')

  const filteredInsights = filter === 'all' ? insights : insights.filter((i) => i.type === filter)

  const takeAction = (insight: Insight) => {
    if (insight.lisaPrompt) {
      // Hand the intent to Lisa via the canonical chat surface.
      router.push(`/lisa?prompt=${encodeURIComponent(insight.lisaPrompt)}`)
    } else {
      router.push(insight.actionHref)
    }
  }

  const getTypeIcon = (type: InsightType) => {
    const icons = {
      productivity: TrendingUp,
      collaboration: Users,
      opportunity: Lightbulb,
      warning: AlertTriangle,
    }
    return icons[type]
  }

  const getTypeColor = (type: InsightType) => {
    const colors = {
      productivity: 'text-peak-green bg-peak-green/15',
      collaboration: 'text-peak-blue bg-peak-blue/15',
      opportunity: 'text-amber-300 bg-amber-400/15',
      warning: 'text-peak-red bg-peak-red/15',
    }
    return colors[type]
  }

  const getImpactColor = (impact: Impact) => {
    const colors = {
      high: 'bg-peak-red/15 text-peak-red',
      medium: 'bg-amber-400/15 text-amber-300',
      low: 'bg-peak-green/15 text-peak-green',
    }
    return colors[impact]
  }

  return (
    <div className="peak-os min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-peak-primary/15">
            <Brain className="h-7 w-7 text-peak-primary-300" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-peak">Insights</h1>
            <p className="text-sm text-peak-muted">
              Lisa&rsquo;s observations across {ACME_COMPANY}&rsquo;s missions, risks, and momentum
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Brain, label: 'Total Insights', value: insights.length, color: 'text-peak-primary-300' },
            { icon: AlertTriangle, label: 'Warnings', value: insights.filter((i) => i.type === 'warning').length, color: 'text-peak-red' },
            { icon: Lightbulb, label: 'Opportunities', value: insights.filter((i) => i.type === 'opportunity').length, color: 'text-amber-300' },
            { icon: Target, label: 'Actionable', value: insights.filter((i) => i.actionable).length, color: 'text-peak-green' },
          ].map((card) => (
            <div key={card.label} className="peak-glass p-4">
              <div className="mb-2 flex items-center gap-2">
                <card.icon className={`h-4 w-4 ${card.color}`} />
                <span className="text-sm text-peak-muted">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-peak">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
          {(['all', 'productivity', 'collaboration', 'opportunity', 'warning'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === f
                  ? 'bg-peak-primary text-white'
                  : 'border border-peak-border bg-white/[0.03] text-peak-muted hover:bg-white/[0.06]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Insights List */}
        <div className="space-y-4">
          {filteredInsights.map((insight) => {
            const Icon = getTypeIcon(insight.type)
            const colorClass = getTypeColor(insight.type)

            return (
              <div key={insight.id} className="peak-glass peak-glass-hover p-6 transition">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-peak">{insight.title}</h3>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${getImpactColor(insight.impact)}`}>
                        {insight.impact} impact
                      </span>
                    </div>
                    <p className="mb-4 text-sm leading-relaxed text-peak-muted">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {insight.metric && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-peak">{insight.metric.value}</span>
                            <span className={`flex items-center text-sm ${insight.metric.trend === 'up' ? 'text-peak-green' : 'text-peak-red'}`}>
                              {insight.metric.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              {Math.abs(insight.metric.change)}%
                            </span>
                          </div>
                        )}
                      </div>
                      {insight.actionable && (
                        <button
                          onClick={() => takeAction(insight)}
                          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-peak-primary-300 transition hover:bg-peak-primary/10"
                        >
                          {insight.lisaPrompt ? <Sparkles className="h-4 w-4" /> : null}
                          Take Action
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link href="/ai/reports" className="peak-glass peak-glass-hover flex items-center gap-3 p-4 transition">
            <BarChart3 className="h-5 w-5 text-peak-primary-300" />
            <span className="font-medium text-peak">View Reports</span>
          </Link>
          <Link href="/analytics" className="peak-glass peak-glass-hover flex items-center gap-3 p-4 transition">
            <Clock className="h-5 w-5 text-peak-primary-300" />
            <span className="font-medium text-peak">Analytics</span>
          </Link>
          <Link href="/lisa" className="peak-glass peak-glass-hover flex items-center gap-3 p-4 transition">
            <Brain className="h-5 w-5 text-peak-primary-300" />
            <span className="font-medium text-peak">Ask Lisa</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
