/**
 * Peak One — Create Studio templates + rich mock documents.
 *
 * `CREATE_TEMPLATES` is the gallery of things P1 can build. `getMockDocument`
 * returns a RICH, realistic DocumentSpec for any template id or DocType,
 * grounded in the same fixtures the rest of P1 uses (Acme Corp / Sarah Chen /
 * Launch Product X / the Q2 numbers). It is the universal fallback whenever the
 * live generator is unavailable.
 *
 * Pure / deterministic / SSR-safe — NO Date.now(), NO Math.random() in the
 * render path. Ids are derived from a stable seeded counter.
 */

import type {
  CreateTemplate,
  DashboardDoc,
  DocMeta,
  DocType,
  DocumentSpec,
  PresentationDoc,
  ReportDoc,
  SpreadsheetDoc,
} from './create-types'
import { getCompanyContext } from './create-context'

// ----------------------------------------------------------------------------
// Templates
// ----------------------------------------------------------------------------

export const CREATE_TEMPLATES: CreateTemplate[] = [
  {
    id: 'sales-report-q2',
    label: 'Q2 Sales Report',
    type: 'report',
    icon: 'TrendingUp',
    description: 'A board-ready quarterly sales report grounded in your pipeline, missions and metrics.',
    prompt: 'Build a Q2 sales report for Acme Corp summarizing pipeline, revenue, wins, and risks.',
  },
  {
    id: 'board-presentation',
    label: 'Board Presentation',
    type: 'presentation',
    icon: 'Presentation',
    description: 'A polished board deck covering progress, metrics, risks and the ask.',
    prompt: 'Create a board presentation covering company progress, key metrics, risks, and next quarter priorities.',
  },
  {
    id: 'financial-forecast',
    label: 'Financial Forecast',
    type: 'spreadsheet',
    icon: 'LineChart',
    description: 'A driver-based revenue and cash forecast as an editable, exportable spreadsheet.',
    prompt: 'Generate a 12-month financial forecast spreadsheet with revenue, expenses, and cash runway.',
  },
  {
    id: 'investor-deck',
    label: 'Investor Deck',
    type: 'presentation',
    icon: 'Rocket',
    description: 'A fundraising narrative deck: problem, solution, traction, market, ask.',
    prompt: 'Create an investor deck telling the Acme Corp story: problem, solution, traction, market, team, and the ask.',
  },
  {
    id: 'client-proposal',
    label: 'Client Proposal',
    type: 'proposal',
    icon: 'FileSignature',
    description: 'A persuasive, scoped proposal grounded in the relationship and prior notes.',
    prompt: 'Write a client proposal including scope, approach, timeline, pricing, and next steps.',
  },
  {
    id: 'project-status',
    label: 'Project Status Report',
    type: 'report',
    icon: 'ClipboardCheck',
    description: 'A crisp status report on a mission: progress, milestones, risks, asks.',
    prompt: 'Write a project status report for the Launch Product X mission with progress, milestones, risks, and asks.',
  },
  {
    id: 'hiring-report',
    label: 'Hiring Report',
    type: 'report',
    icon: 'Users',
    description: 'A hiring plan + pipeline report: open roles, funnel, and recommendations.',
    prompt: 'Create a hiring report covering open roles, candidate pipeline, time-to-hire, and recommendations.',
  },
  {
    id: 'marketing-dashboard',
    label: 'Marketing Dashboard',
    type: 'dashboard',
    variant: 'marketing',
    icon: 'BarChart3',
    description: 'Channel spend & ROI, conversion funnel, and campaign performance in one view.',
    prompt: 'Build a marketing dashboard with channel spend and ROI, a conversion funnel, and a campaign performance table.',
  },
  {
    id: 'social-dashboard',
    label: 'Social Media Dashboard',
    type: 'dashboard',
    variant: 'social',
    icon: 'Share2',
    description: 'Meta, Instagram & TikTok KPIs, follower growth, engagement, and top posts.',
    prompt: 'Build a social media dashboard across Meta, Instagram, and TikTok with KPIs, follower growth, engagement, and top posts.',
  },
  {
    id: 'qbr',
    label: 'Quarterly Business Review',
    type: 'presentation',
    icon: 'CalendarRange',
    description: 'A QBR deck: outcomes vs goals, health, wins, misses, and the plan.',
    prompt: 'Create a Quarterly Business Review deck: outcomes vs goals, account health, wins, misses, and next-quarter plan.',
  },
  {
    id: 'exec-summary',
    label: 'Executive Summary',
    type: 'summary',
    icon: 'FileText',
    description: 'A one-page executive summary distilled from everything P1 knows.',
    prompt: 'Write a one-page executive summary of the current state of the business, key risks, and recommended actions.',
  },
  {
    id: 'financial-model',
    label: 'Financial Model',
    type: 'spreadsheet',
    icon: 'Calculator',
    description: 'A multi-sheet financial model: assumptions, P&L, and unit economics.',
    prompt: 'Generate a financial model spreadsheet with assumptions, a P&L, and unit economics.',
  },
]

/** Lookup helper. */
export function getTemplate(id: string): CreateTemplate | undefined {
  return CREATE_TEMPLATES.find((t) => t.id === id)
}

// ----------------------------------------------------------------------------
// Deterministic id + meta helpers (SSR-safe)
// ----------------------------------------------------------------------------

/** Stable per-process counter so ids differ without Math.random/Date.now. */
let __seq = 0
function nextId(prefix: string): string {
  __seq += 1
  return `${prefix}-${__seq.toString(36)}`
}

/** A fixed timestamp keeps SSR output stable; callers can override on save. */
const FIXED_NOW = '2026-06-18T09:00:00.000Z'

function baseMeta(type: DocType, title: string, subtitle?: string): DocMeta {
  const ctx = getCompanyContext()
  return {
    id: nextId('doc'),
    type,
    title,
    subtitle,
    createdAt: FIXED_NOW,
    author: ctx.user.name,
    company: ctx.company,
    sourceContext: ctx.sourceContext,
  }
}

// ----------------------------------------------------------------------------
// Rich mock builders, per document kind
// ----------------------------------------------------------------------------

function mockSalesReport(): ReportDoc {
  return {
    ...baseMeta('report', 'Q2 2026 Sales Report', 'Acme Corp · Quarter ending June 30, 2026'),
    type: 'report',
    executiveSummary:
      'Q2 was a momentum quarter for Acme Corp. Qualified pipeline is tracking **18% above target** on the strength of the Product X launch motion, and three of four active missions are on track. The single open risk is the legal/compliance review on Launch Product X, which is at 45% with six weeks to the June 30 launch. Net: revenue and pipeline are healthy; the priority is unblocking legal and closing the loop with Brian Miller on pricing before the board update.',
    sections: [
      {
        heading: 'Headline Numbers',
        metrics: [
          { label: 'Qualified Pipeline', value: '$4.2M', delta: '+18% vs target', trend: 'up' },
          { label: 'Closed Won (Q2)', value: '$1.18M', delta: '+24% QoQ', trend: 'up' },
          { label: 'Win Rate', value: '31%', delta: '+4 pts', trend: 'up' },
          { label: 'Avg Deal Size', value: '$42K', delta: '+9%', trend: 'up' },
        ],
      },
      {
        heading: 'What Drove the Quarter',
        body: 'The Q2 marketing campaign is the standout. Lifecycle email plus in-product nudges and design-partner case studies pushed MQLs **18% above plan**, feeding a fuller top of funnel for the Product X launch.',
        bullets: [
          'Product X beta is at 85% feature completeness, accelerating late-stage deals.',
          'Design-partner program: 6 of the first 10 partners onboarded and referenceable.',
          'BrightPath co-marketing partnership signed — first joint webinar scheduled.',
          'Pricing anchored at $49/seat with an annual discount is holding in negotiations.',
        ],
      },
      {
        heading: 'Pipeline by Stage',
        metrics: [
          { label: 'Discovery', value: '$1.6M', trend: 'up' },
          { label: 'Evaluation', value: '$1.3M', trend: 'up' },
          { label: 'Proposal', value: '$0.8M', trend: 'flat' },
          { label: 'Closing', value: '$0.5M', trend: 'up' },
        ],
        body: 'Coverage on the Q3 number is **3.1x**, healthy heading into the launch quarter.',
      },
      {
        heading: 'Risks & Watch Items',
        bullets: [
          'HIGH — Legal/compliance review on Launch Product X is at 45%; outside counsel flagged by Tom Becker. Could push launch 2-3 weeks.',
          'MED — Engineering bandwidth split with a support escalation is slowing the beta bug burn-down.',
          'Brian Miller (Summit Ventures) has not responded to the pricing follow-up in 4 days — unresolved margin concern.',
        ],
      },
      {
        heading: 'Recommended Actions',
        bullets: [
          'Engage outside counsel this week to de-risk the June 30 launch date.',
          'Send Brian the 18%-above-target pipeline result plus a one-page pricing rationale.',
          'Reallocate David Kim back to Product X now that the support escalation is resolved.',
          'Lock the launch-week comms calendar with Lisa Park.',
        ],
      },
    ],
  }
}

function mockProjectStatus(): ReportDoc {
  return {
    ...baseMeta('report', 'Project Status — Launch Product X', 'Mission update · 72% complete · target June 30, 2026'),
    type: 'report',
    executiveSummary:
      'Launch Product X is **ON TRACK at 72%** with a health score of 81. Engineering and marketing are ahead of plan; the one at-risk objective is the legal & compliance review at 45%. With focused action on legal this week, the June 30 launch remains achievable.',
    sections: [
      {
        heading: 'Status at a Glance',
        metrics: [
          { label: 'Progress', value: '72%', delta: '+6 pts this week', trend: 'up' },
          { label: 'Health Score', value: '81/100', trend: 'flat' },
          { label: 'Budget Used', value: '$184K / $250K', delta: '74%', trend: 'flat' },
          { label: 'Velocity', value: '34', delta: 'pts/sprint', trend: 'up' },
        ],
      },
      {
        heading: 'Objectives',
        bullets: [
          'Finalize product spec & roadmap — 100% (Completed)',
          'Ship core feature set to beta — 85% (On track)',
          'Complete legal & compliance review — 45% (At risk)',
          'Launch Q2 marketing campaign — 70% (On track)',
          'Onboard first 10 design partners — 60% (On track)',
        ],
      },
      {
        heading: 'Milestones',
        bullets: [
          'Kickoff — Done (Jan 15)',
          'Spec Locked — Done (Feb 20)',
          'Beta Release — Done (Apr 10)',
          'GA Candidate — Active (Jun 1)',
          'Launch — Upcoming (Jun 30)',
        ],
      },
      {
        heading: 'Risks',
        body: 'Legal review delay is the only HIGH risk. Tom Becker flagged contract terms requiring outside counsel; at 45% with six weeks left, this could push launch 2-3 weeks if not addressed now.',
        bullets: [
          'HIGH — Legal review delay (likely): could push launch 2-3 weeks.',
          'MED — Engineering bandwidth (possible): slower beta bug burn-down.',
          'LOW — Market competition (unlikely near term): pricing pressure post-launch.',
        ],
      },
      {
        heading: 'Asks',
        bullets: [
          'Approve engaging outside counsel to unblock the compliance review.',
          'Confirm David Kim returns full-time to Product X.',
          'Sign off on the launch-week comms calendar.',
        ],
      },
    ],
  }
}

function mockHiringReport(): ReportDoc {
  return {
    ...baseMeta('report', 'Hiring Report — Q2 2026', 'Acme Corp · Talent & Org'),
    type: 'report',
    executiveSummary:
      'Acme Corp is hiring into the Product X launch. Five roles are open across Engineering, Marketing and Customer Success. Pipeline is healthiest in Engineering and thinnest in senior Marketing. Recommended focus: accelerate the two engineering offers and open a backfill for the support escalation that pulled David Kim off Product X.',
    sections: [
      {
        heading: 'Hiring Snapshot',
        metrics: [
          { label: 'Open Roles', value: '5', trend: 'up' },
          { label: 'Active Candidates', value: '37', delta: '+12 MoM', trend: 'up' },
          { label: 'Avg Time-to-Hire', value: '38 days', delta: '-5 days', trend: 'up' },
          { label: 'Offer Accept Rate', value: '82%', trend: 'flat' },
        ],
      },
      {
        heading: 'Open Roles',
        bullets: [
          'Senior Backend Engineer — 4 in final loop (Eng, David Kim)',
          'Product Engineer — 2 in onsite (Eng)',
          'Growth Marketing Manager — 1 in screen (Mktg, Lisa Park)',
          'Customer Success Lead — sourcing (CS)',
          'Compliance Specialist — sourcing (Legal, Tom Becker)',
        ],
      },
      {
        heading: 'Pipeline Funnel',
        metrics: [
          { label: 'Applied', value: '214' },
          { label: 'Screened', value: '61' },
          { label: 'Onsite', value: '18' },
          { label: 'Offer', value: '6' },
        ],
      },
      {
        heading: 'Recommendations',
        bullets: [
          'Extend the two backend offers this week to relieve engineering bandwidth.',
          'Prioritize the Compliance Specialist to de-risk the Product X legal review.',
          'Engage a retained recruiter for the senior Growth Marketing role.',
        ],
      },
    ],
  }
}

function mockExecSummary(): ReportDoc {
  return {
    ...baseMeta('summary', 'Executive Summary', 'Acme Corp · State of the business · June 2026'),
    type: 'summary',
    executiveSummary:
      'Acme Corp is in a strong position heading into the Product X launch. Pipeline is 18% above target, the flagship mission is 72% complete and on track, and three of four missions are healthy. The business has one concentrated risk — the legal/compliance review — and one open relationship loop with lead investor Brian Miller on pricing. Both are addressable this week.',
    sections: [
      {
        heading: 'The One-Liner',
        body: '**Momentum is real; the job is to protect the June 30 launch date by unblocking legal and reaffirming investor confidence on pricing.**',
      },
      {
        heading: 'What Is Going Well',
        bullets: [
          'Q2 campaign tracking 18% above target on qualified pipeline.',
          'Launch Product X at 72%, health 81, with engineering and marketing ahead of plan.',
          'BrightPath co-marketing partnership signed; first 6 design partners onboarded.',
        ],
      },
      {
        heading: 'What Needs Attention',
        bullets: [
          'Legal/compliance review at 45% — the only HIGH risk to launch.',
          'Brian Miller has not replied to the pricing follow-up in 4 days.',
          'Engineering bandwidth split with a support escalation (now resolved).',
        ],
      },
      {
        heading: 'Recommended Actions This Week',
        bullets: [
          'Engage outside counsel to unblock compliance.',
          'Send Brian the pipeline result and a pricing one-pager; book a 20-min sync.',
          'Move David Kim back to Product X; lock the launch comms calendar.',
        ],
      },
    ],
  }
}

function mockProposal(): ReportDoc {
  return {
    ...baseMeta('proposal', 'Proposal — Product X Design Partnership', 'Prepared for a prospective design partner'),
    type: 'proposal',
    executiveSummary:
      'Acme Corp invites you to join the Product X design-partner program. You get early access, direct influence over the roadmap, and white-glove onboarding — in exchange for structured feedback and a reference. This proposal outlines scope, approach, timeline, pricing, and next steps.',
    sections: [
      {
        heading: 'Why Now',
        body: 'Product X is in beta at 85% feature completeness with a June 30 GA target. Design partners shape the final mile of the product and lock in preferred pricing ahead of launch.',
      },
      {
        heading: 'Scope',
        bullets: [
          'Full access to Product X beta and the upcoming GA build.',
          'A dedicated onboarding specialist and a guided 3-step setup.',
          'Bi-weekly roadmap input sessions with the product team.',
          'Co-developed case study at launch (optional).',
        ],
      },
      {
        heading: 'Approach & Timeline',
        bullets: [
          'Week 1 — Kickoff, environment setup, success criteria.',
          'Weeks 2-4 — Guided rollout to your team; weekly check-ins.',
          'Weeks 5-8 — Roadmap input + measurement against success criteria.',
          'Launch — Optional joint case study and reference.',
        ],
      },
      {
        heading: 'Pricing',
        metrics: [
          { label: 'List Price', value: '$49 / seat / mo' },
          { label: 'Design-Partner Price', value: '$29 / seat / mo', delta: 'locked 12 mo', trend: 'down' },
          { label: 'Onboarding', value: 'Included' },
        ],
        body: 'Design-partner pricing is locked for 12 months from signing, with an annual-commit discount available.',
      },
      {
        heading: 'Next Steps',
        bullets: [
          'Confirm interest and target start date.',
          'Counter-sign the design-partner MOU.',
          'Schedule the kickoff and provision your workspace.',
        ],
      },
    ],
  }
}

function mockFinancialForecast(): SpreadsheetDoc {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const revenueBase = [180, 195, 212, 230, 251, 278, 310, 345, 382, 420, 462, 510] // $K
  const cogsRate = 0.28
  const opexBase = [120, 124, 128, 133, 138, 144, 151, 158, 166, 174, 183, 192]

  let cash = 1200 // $K starting cash
  const rows = months.map((m, i) => {
    const revenue = revenueBase[i]
    const cogs = Math.round(revenue * cogsRate)
    const gross = revenue - cogs
    const opex = opexBase[i]
    const netBurn = gross - opex
    cash += netBurn
    return {
      Month: m,
      Revenue: revenue,
      COGS: cogs,
      'Gross Profit': gross,
      OpEx: opex,
      'Net Burn/Profit': netBurn,
      'Cash Balance': cash,
    }
  })

  return {
    ...baseMeta('spreadsheet', 'Financial Forecast — FY2026', 'Acme Corp · Driver-based 12-month forecast ($ in thousands)'),
    type: 'spreadsheet',
    sheets: [
      {
        name: 'Monthly Forecast',
        columns: [
          { key: 'Month', label: 'Month', type: 'text' },
          { key: 'Revenue', label: 'Revenue', type: 'currency' },
          { key: 'COGS', label: 'COGS', type: 'currency' },
          { key: 'Gross Profit', label: 'Gross Profit', type: 'currency' },
          { key: 'OpEx', label: 'OpEx', type: 'currency' },
          { key: 'Net Burn/Profit', label: 'Net Burn/Profit', type: 'currency' },
          { key: 'Cash Balance', label: 'Cash Balance', type: 'currency' },
        ],
        rows,
        totals: {
          Month: 'FY Total',
          Revenue: revenueBase.reduce((a, b) => a + b, 0),
          COGS: rows.reduce((a, r) => a + (r.COGS as number), 0),
          'Gross Profit': rows.reduce((a, r) => a + (r['Gross Profit'] as number), 0),
          OpEx: opexBase.reduce((a, b) => a + b, 0),
          'Net Burn/Profit': rows.reduce((a, r) => a + (r['Net Burn/Profit'] as number), 0),
          'Cash Balance': rows[rows.length - 1]['Cash Balance'] as number,
        },
      },
      {
        name: 'Assumptions',
        columns: [
          { key: 'Driver', label: 'Driver', type: 'text' },
          { key: 'Value', label: 'Value', type: 'text' },
          { key: 'Notes', label: 'Notes', type: 'text' },
        ],
        rows: [
          { Driver: 'Starting Cash', Value: '$1,200K', Notes: 'As of Jan 1, 2026' },
          { Driver: 'MoM Revenue Growth', Value: '~8-11%', Notes: 'Accelerates post Product X launch' },
          { Driver: 'COGS Rate', Value: '28%', Notes: 'Hosting + support' },
          { Driver: 'Price / seat', Value: '$49/mo', Notes: '$29 design-partner; annual discount' },
          { Driver: 'OpEx Growth', Value: '~4%/mo', Notes: 'Hiring into launch' },
        ],
      },
    ],
  }
}

function mockFinancialModel(): SpreadsheetDoc {
  return {
    ...baseMeta('spreadsheet', 'Financial Model — Acme Corp', 'Assumptions · P&L · Unit Economics ($ in thousands unless noted)'),
    type: 'spreadsheet',
    sheets: [
      {
        name: 'Assumptions',
        columns: [
          { key: 'Assumption', label: 'Assumption', type: 'text' },
          { key: 'Value', label: 'Value', type: 'text' },
        ],
        rows: [
          { Assumption: 'ARPU (annual)', Value: '$588' },
          { Assumption: 'Gross Margin', Value: '72%' },
          { Assumption: 'CAC', Value: '$1,100' },
          { Assumption: 'Logo Churn (annual)', Value: '9%' },
          { Assumption: 'Sales Cycle', Value: '46 days' },
          { Assumption: 'New Logos / mo', Value: '24' },
        ],
      },
      {
        name: 'P&L (Quarterly)',
        columns: [
          { key: 'Line', label: 'Line Item', type: 'text' },
          { key: 'Q1', label: 'Q1', type: 'currency' },
          { key: 'Q2', label: 'Q2', type: 'currency' },
          { key: 'Q3', label: 'Q3 (F)', type: 'currency' },
          { key: 'Q4', label: 'Q4 (F)', type: 'currency' },
        ],
        rows: [
          { Line: 'Revenue', Q1: 587, Q2: 759, Q3: 1037, Q4: 1392 },
          { Line: 'COGS', Q1: 164, Q2: 213, Q3: 290, Q4: 390 },
          { Line: 'Gross Profit', Q1: 423, Q2: 546, Q3: 747, Q4: 1002 },
          { Line: 'Sales & Marketing', Q1: 210, Q2: 248, Q3: 300, Q4: 360 },
          { Line: 'R&D', Q1: 180, Q2: 196, Q3: 220, Q4: 250 },
          { Line: 'G&A', Q1: 95, Q2: 102, Q3: 112, Q4: 124 },
          { Line: 'Operating Income', Q1: -62, Q2: 0, Q3: 115, Q4: 268 },
        ],
        totals: { Line: 'FY Revenue', Q1: '', Q2: '', Q3: '', Q4: 3775 },
      },
      {
        name: 'Unit Economics',
        columns: [
          { key: 'Metric', label: 'Metric', type: 'text' },
          { key: 'Value', label: 'Value', type: 'text' },
          { key: 'Benchmark', label: 'Benchmark', type: 'text' },
        ],
        rows: [
          { Metric: 'LTV', Value: '$4,704', Benchmark: 'good' },
          { Metric: 'CAC', Value: '$1,100', Benchmark: 'healthy' },
          { Metric: 'LTV:CAC', Value: '4.3x', Benchmark: '>3x target' },
          { Metric: 'Payback Period', Value: '7.5 mo', Benchmark: '<12 mo target' },
          { Metric: 'Net Revenue Retention', Value: '114%', Benchmark: '>100% target' },
        ],
      },
    ],
  }
}

function mockBoardPresentation(): PresentationDoc {
  return {
    ...baseMeta('presentation', 'Board Presentation — Q2 2026', 'Acme Corp · Board of Directors'),
    type: 'presentation',
    slides: [
      {
        title: 'Acme Corp — Q2 2026 Board Update',
        subtitle: 'Prepared by Sarah Chen, Founder & CEO',
        bullets: ['Strong quarter into the Product X launch', 'Pipeline 18% above target', 'One concentrated risk: legal review'],
      },
      {
        title: 'The Headline',
        bullets: [
          'Qualified pipeline tracking 18% above target',
          'Launch Product X on track at 72%, health 81',
          'BrightPath co-marketing partnership signed',
          'Recommended ask: approve outside counsel to protect the June 30 launch',
        ],
        kpis: [
          { label: 'Pipeline', value: '$4.2M', delta: '+18%', trend: 'up' },
          { label: 'Closed Won', value: '$1.18M', delta: '+24% QoQ', trend: 'up' },
          { label: 'Win Rate', value: '31%', delta: '+4 pts', trend: 'up' },
        ],
      },
      {
        title: 'Revenue Trajectory',
        subtitle: 'Monthly recurring revenue, $K',
        chart: {
          type: 'line',
          title: 'MRR by Month',
          series: ['MRR'],
          data: [
            { name: 'Jan', MRR: 180 },
            { name: 'Feb', MRR: 195 },
            { name: 'Mar', MRR: 212 },
            { name: 'Apr', MRR: 230 },
            { name: 'May', MRR: 251 },
            { name: 'Jun', MRR: 278 },
          ],
        },
        notes: 'Acceleration expected post-launch in Q3.',
      },
      {
        title: 'Mission Health',
        bullets: [
          'Launch Product X — 72%, On Track',
          'Q2 Growth Engine — 48%, At Risk',
          'Platform Reliability 99.9% — 88%, On Track',
        ],
        chart: {
          type: 'bar',
          title: 'Mission Progress (%)',
          series: ['Progress'],
          data: [
            { name: 'Launch Product X', Progress: 72 },
            { name: 'Q2 Growth Engine', Progress: 48 },
            { name: 'Platform Reliability', Progress: 88 },
          ],
        },
      },
      {
        title: 'Risks',
        bullets: [
          'HIGH — Legal/compliance review at 45% (could push launch 2-3 weeks)',
          'MED — Engineering bandwidth (support escalation, now resolved)',
          'LOW — Market competition (1-2 quarters behind)',
        ],
      },
      {
        title: 'The Ask & Next Quarter',
        bullets: [
          'Approve engaging outside counsel this week',
          'Endorse the $49 anchor / annual-discount pricing',
          'Q3 priorities: ship GA, scale design partners to 20, launch lifecycle program',
        ],
      },
    ],
  }
}

function mockInvestorDeck(): PresentationDoc {
  return {
    ...baseMeta('presentation', 'Acme Corp — Investor Deck', 'Series A · 2026'),
    type: 'presentation',
    slides: [
      { title: 'Acme Corp', subtitle: 'Software that turns company knowledge into action', bullets: ['Series A · $8M raise', 'Led by Sarah Chen, Founder & CEO'] },
      { title: 'The Problem', bullets: ['Teams drown in scattered tools and lose context', 'Knowledge lives in heads, not systems', 'Decisions are slow because the signal is buried'] },
      { title: 'The Solution', bullets: ['Product X unifies knowledge, work, and AI in one place', 'Grounded AI that actually knows your company', 'From insight to action in one surface'] },
      {
        title: 'Traction',
        kpis: [
          { label: 'Pipeline', value: '$4.2M', delta: '+18% vs plan', trend: 'up' },
          { label: 'NRR', value: '114%', trend: 'up' },
          { label: 'LTV:CAC', value: '4.3x', trend: 'up' },
        ],
        chart: {
          type: 'area',
          title: 'Revenue Run-Rate ($K)',
          series: ['Revenue'],
          data: [
            { name: 'Q1', Revenue: 587 },
            { name: 'Q2', Revenue: 759 },
            { name: 'Q3', Revenue: 1037 },
            { name: 'Q4', Revenue: 1392 },
          ],
        },
      },
      { title: 'Market', bullets: ['$28B knowledge-work software TAM', 'Tailwind: AI making grounded copilots viable', 'Wedge: design-partner-led GTM'] },
      { title: 'Team', bullets: ['Sarah Chen — Founder & CEO', 'Mike Wilson — Head of Product', 'David Kim — Engineering Lead', 'Lisa Park — Marketing Lead'] },
      { title: 'The Ask', bullets: ['Raising $8M Series A', 'Use of funds: GA launch, GTM, and platform reliability', '18 months runway to $5M ARR'] },
    ],
  }
}

function mockQBR(): PresentationDoc {
  return {
    ...baseMeta('presentation', 'Quarterly Business Review — Q2 2026', 'Acme Corp · QBR'),
    type: 'presentation',
    slides: [
      { title: 'Q2 2026 QBR', subtitle: 'Outcomes vs goals · health · plan', bullets: ['Acme Corp', 'Presented by Sarah Chen'] },
      {
        title: 'Outcomes vs Goals',
        kpis: [
          { label: 'Pipeline vs Target', value: '118%', delta: '+18%', trend: 'up' },
          { label: 'Launch Readiness', value: '72%', trend: 'up' },
          { label: 'NRR', value: '114%', trend: 'up' },
        ],
        chart: {
          type: 'bar',
          title: 'Goal Attainment (%)',
          series: ['Attainment'],
          data: [
            { name: 'Pipeline', Attainment: 118 },
            { name: 'Revenue', Attainment: 104 },
            { name: 'Launch Prep', Attainment: 72 },
            { name: 'Partners', Attainment: 60 },
          ],
        },
      },
      { title: 'Wins', bullets: ['Campaign 18% above target', 'BrightPath partnership signed', '6 of 10 design partners live'] },
      { title: 'Misses', bullets: ['Legal review behind at 45%', 'Q2 Growth Engine slipped to At Risk (48%)', 'Senior marketing hire still open'] },
      { title: 'Account Health', bullets: ['Brian Miller (investor) — needs pricing follow-up', 'Mike Wilson — strong, aligned on beta quality', 'BrightPath — new, momentum building'] },
      { title: 'Next-Quarter Plan', bullets: ['Ship Product X GA on June 30', 'Unblock legal via outside counsel', 'Scale design partners to 20', 'Close two engineering offers'] },
    ],
  }
}

function mockMarketingDashboard(): DashboardDoc {
  return {
    ...baseMeta('dashboard', 'Marketing Dashboard', 'Acme Corp · Q2 2026 performance'),
    type: 'dashboard',
    variant: 'marketing',
    kpis: [
      { label: 'Marketing Spend', value: '$148K', delta: '+12% QoQ', trend: 'up' },
      { label: 'Blended ROI', value: '4.6x', delta: '+0.4x', trend: 'up' },
      { label: 'MQLs', value: '1,284', delta: '+18% vs target', trend: 'up' },
      { label: 'CPL', value: '$115', delta: '-9%', trend: 'up' },
      { label: 'Pipeline Influenced', value: '$2.7M', delta: '+22%', trend: 'up' },
    ],
    charts: [
      {
        type: 'bar',
        title: 'Spend & ROI by Channel',
        series: ['Spend', 'ROI'],
        data: [
          { name: 'Paid', Spend: 62, ROI: 3.8 },
          { name: 'Organic', Spend: 18, ROI: 7.2 },
          { name: 'Email', Spend: 22, ROI: 6.1 },
          { name: 'Social', Spend: 46, ROI: 4.0 },
        ],
      },
      {
        type: 'area',
        title: 'Conversion Funnel',
        series: ['Count'],
        data: [
          { name: 'Visitors', Count: 48200 },
          { name: 'Leads', Count: 6100 },
          { name: 'MQLs', Count: 1284 },
          { name: 'SQLs', Count: 412 },
          { name: 'Won', Count: 96 },
        ],
      },
      {
        type: 'donut',
        title: 'Spend Mix',
        series: ['value'],
        data: [
          { name: 'Paid', value: 62 },
          { name: 'Social', value: 46 },
          { name: 'Email', value: 22 },
          { name: 'Organic', value: 18 },
        ],
      },
    ],
    tables: [
      {
        name: 'Campaign Performance',
        columns: [
          { key: 'Campaign', label: 'Campaign', type: 'text' },
          { key: 'Channel', label: 'Channel', type: 'text' },
          { key: 'Spend', label: 'Spend', type: 'currency' },
          { key: 'Leads', label: 'Leads', type: 'number' },
          { key: 'CPL', label: 'CPL', type: 'currency' },
          { key: 'ROI', label: 'ROI', type: 'text' },
        ],
        rows: [
          { Campaign: 'Product X Launch Teaser', Channel: 'Paid', Spend: 28000, Leads: 612, CPL: 46, ROI: '4.2x' },
          { Campaign: 'Design Partner Case Studies', Channel: 'Organic', Spend: 6000, Leads: 488, CPL: 12, ROI: '8.1x' },
          { Campaign: 'Lifecycle Nurture', Channel: 'Email', Spend: 9000, Leads: 356, CPL: 25, ROI: '6.4x' },
          { Campaign: 'Founder Thought-Leadership', Channel: 'Social', Spend: 21000, Leads: 402, CPL: 52, ROI: '3.9x' },
          { Campaign: 'Retargeting', Channel: 'Paid', Spend: 14000, Leads: 274, CPL: 51, ROI: '4.0x' },
        ],
        totals: { Campaign: 'Total', Channel: '', Spend: 78000, Leads: 2132, CPL: 37, ROI: '4.6x' },
      },
    ],
    connections: [
      { provider: 'meta', connected: false },
      { provider: 'google', connected: false },
      { provider: 'tiktok', connected: false },
    ],
  }
}

function mockSocialDashboard(): DashboardDoc {
  return {
    ...baseMeta('dashboard', 'Social Media Dashboard', 'Acme Corp · Meta · Instagram · TikTok'),
    type: 'dashboard',
    variant: 'social',
    kpis: [
      { label: 'Total Followers', value: '128.4K', delta: '+6.2K MoM', trend: 'up' },
      { label: 'Reach (30d)', value: '2.1M', delta: '+14%', trend: 'up' },
      { label: 'Engagement Rate', value: '5.8%', delta: '+0.7 pts', trend: 'up' },
      { label: 'Watch Time', value: '38.2K hrs', delta: '+21%', trend: 'up' },
      { label: 'Profile Visits', value: '94.6K', delta: '+11%', trend: 'up' },
    ],
    charts: [
      {
        type: 'line',
        title: 'Follower Growth by Platform',
        series: ['Meta', 'Instagram', 'TikTok'],
        data: [
          { name: 'Jan', Meta: 41000, Instagram: 32000, TikTok: 18000 },
          { name: 'Feb', Meta: 42200, Instagram: 33800, TikTok: 21500 },
          { name: 'Mar', Meta: 43100, Instagram: 35600, TikTok: 26200 },
          { name: 'Apr', Meta: 44000, Instagram: 37900, TikTok: 31800 },
          { name: 'May', Meta: 44800, Instagram: 40100, TikTok: 38400 },
          { name: 'Jun', Meta: 45600, Instagram: 42300, TikTok: 46500 },
        ],
      },
      {
        type: 'bar',
        title: 'Engagement by Platform (avg per post)',
        series: ['Engagement'],
        data: [
          { name: 'Meta', Engagement: 4.1 },
          { name: 'Instagram', Engagement: 6.3 },
          { name: 'TikTok', Engagement: 8.7 },
        ],
      },
      {
        type: 'donut',
        title: 'Audience Mix',
        series: ['value'],
        data: [
          { name: 'Meta', value: 45600 },
          { name: 'Instagram', value: 42300 },
          { name: 'TikTok', value: 46500 },
        ],
      },
    ],
    tables: [
      {
        name: 'Top Posts',
        columns: [
          { key: 'Post', label: 'Post', type: 'text' },
          { key: 'Platform', label: 'Platform', type: 'text' },
          { key: 'Reach', label: 'Reach', type: 'number' },
          { key: 'Engagement', label: 'Engagement', type: 'number' },
          { key: 'Rate', label: 'Eng. Rate', type: 'text' },
        ],
        rows: [
          { Post: 'Product X teaser reel', Platform: 'TikTok', Reach: 412000, Engagement: 38400, Rate: '9.3%' },
          { Post: 'Founder story: why we built Acme', Platform: 'Instagram', Reach: 188000, Engagement: 14200, Rate: '7.6%' },
          { Post: 'Design partner spotlight', Platform: 'Meta', Reach: 142000, Engagement: 6100, Rate: '4.3%' },
          { Post: 'Behind the beta', Platform: 'TikTok', Reach: 96000, Engagement: 8800, Rate: '9.2%' },
          { Post: 'Launch countdown', Platform: 'Instagram', Reach: 121000, Engagement: 9300, Rate: '7.7%' },
        ],
      },
    ],
    connections: [
      { provider: 'meta', connected: false },
      { provider: 'tiktok', connected: false },
      { provider: 'instagram', connected: false },
    ],
  }
}

function mockGeneralDashboard(): DashboardDoc {
  return {
    ...baseMeta('dashboard', 'Business Dashboard', 'Acme Corp · Company overview'),
    type: 'dashboard',
    variant: 'general',
    kpis: [
      { label: 'Pipeline', value: '$4.2M', delta: '+18%', trend: 'up' },
      { label: 'Launch Readiness', value: '72%', trend: 'up' },
      { label: 'NRR', value: '114%', trend: 'up' },
      { label: 'Open Risks', value: '1 HIGH', trend: 'flat' },
    ],
    charts: [
      {
        type: 'line',
        title: 'MRR ($K)',
        series: ['MRR'],
        data: [
          { name: 'Jan', MRR: 180 },
          { name: 'Feb', MRR: 195 },
          { name: 'Mar', MRR: 212 },
          { name: 'Apr', MRR: 230 },
          { name: 'May', MRR: 251 },
          { name: 'Jun', MRR: 278 },
        ],
      },
      {
        type: 'bar',
        title: 'Mission Progress (%)',
        series: ['Progress'],
        data: [
          { name: 'Launch Product X', Progress: 72 },
          { name: 'Q2 Growth', Progress: 48 },
          { name: 'Reliability', Progress: 88 },
        ],
      },
    ],
  }
}

// ----------------------------------------------------------------------------
// Resolver
// ----------------------------------------------------------------------------

type Builder = () => DocumentSpec

const TEMPLATE_BUILDERS: Record<string, Builder> = {
  'sales-report-q2': mockSalesReport,
  'board-presentation': mockBoardPresentation,
  'financial-forecast': mockFinancialForecast,
  'investor-deck': mockInvestorDeck,
  'client-proposal': mockProposal,
  'project-status': mockProjectStatus,
  'hiring-report': mockHiringReport,
  'marketing-dashboard': mockMarketingDashboard,
  'social-dashboard': mockSocialDashboard,
  qbr: mockQBR,
  'exec-summary': mockExecSummary,
  'financial-model': mockFinancialModel,
}

const TYPE_BUILDERS: Record<DocType, Builder> = {
  report: mockSalesReport,
  proposal: mockProposal,
  summary: mockExecSummary,
  spreadsheet: mockFinancialForecast,
  presentation: mockBoardPresentation,
  dashboard: mockGeneralDashboard,
}

/**
 * Resolve a rich mock DocumentSpec from a template id, a DocType, or a free
 * prompt. The optional `prompt` lightly steers ambiguous cases (e.g. a prompt
 * mentioning "social" yields the social dashboard). Always returns a valid doc.
 */
export function getMockDocument(templateOrType?: string, prompt?: string): DocumentSpec {
  const key = (templateOrType || '').trim().toLowerCase()
  const p = (prompt || '').toLowerCase()

  // 1) Exact template id match.
  if (key && TEMPLATE_BUILDERS[key]) return TEMPLATE_BUILDERS[key]()

  // 2) Exact DocType match — but refine dashboards/reports by the prompt.
  if (key === 'dashboard') {
    if (p.includes('social') || p.includes('instagram') || p.includes('tiktok') || p.includes('follower')) {
      return mockSocialDashboard()
    }
    if (p.includes('marketing') || p.includes('campaign') || p.includes('roi') || p.includes('channel')) {
      return mockMarketingDashboard()
    }
    return mockGeneralDashboard()
  }
  if ((['report', 'proposal', 'summary', 'spreadsheet', 'presentation'] as string[]).includes(key)) {
    return TYPE_BUILDERS[key as DocType]()
  }

  // 3) Prompt-driven inference when only free text was provided.
  const text = `${key} ${p}`
  if (/\bsocial|instagram|tiktok|follower\b/.test(text)) return mockSocialDashboard()
  if (/\bmarketing dashboard|campaign|channel|roi\b/.test(text)) return mockMarketingDashboard()
  if (/\bdashboard\b/.test(text)) return mockGeneralDashboard()
  if (/\bforecast|model|spreadsheet|excel|cash\b/.test(text)) return mockFinancialForecast()
  if (/\bdeck|presentation|slides|board|investor|qbr\b/.test(text)) return mockBoardPresentation()
  if (/\bproposal\b/.test(text)) return mockProposal()
  if (/\bsummary\b/.test(text)) return mockExecSummary()
  if (/\bhiring|recruit\b/.test(text)) return mockHiringReport()
  if (/\bstatus|mission|project\b/.test(text)) return mockProjectStatus()

  // 4) Default: the flagship sales report.
  return mockSalesReport()
}
