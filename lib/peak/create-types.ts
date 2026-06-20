/**
 * Peak One — Create Studio type contract.
 *
 * P1 turns the company knowledge it already stores (Memory, Lisa, Operators,
 * CRM/people, meetings, tasks, missions, metrics) into polished business
 * documents. This file is the single source of truth for the shapes every
 * Create Studio surface (engine, API, pages, viewers) imports.
 *
 * Engine agent owns this file; everyone else imports from it.
 */

// ----------------------------------------------------------------------------
// Document kinds
// ----------------------------------------------------------------------------

/** The output types the Create Studio can produce. */
export type DocType =
  | 'report'
  | 'proposal'
  | 'summary'
  | 'spreadsheet'
  | 'presentation'
  | 'dashboard'

/**
 * Shared metadata on every generated document.
 * `sourceContext` is the human-readable list of P1 data the doc was grounded in,
 * e.g. ['Q2 Marketing Strategy note', 'Launch Product X mission', '12 meetings'].
 */
export interface DocMeta {
  id: string
  type: DocType
  title: string
  subtitle?: string
  createdAt: string
  author: string
  company: string
  sourceContext: string[]
}

// ----------------------------------------------------------------------------
// Metrics (shared by reports, slides, dashboards)
// ----------------------------------------------------------------------------

export interface DocMetric {
  label: string
  value: string
  delta?: string
  trend?: 'up' | 'down' | 'flat'
}

// ----------------------------------------------------------------------------
// Text documents — report / proposal / summary
// ----------------------------------------------------------------------------

export interface ReportSection {
  heading: string
  /** Markdown body. */
  body?: string
  bullets?: string[]
  metrics?: DocMetric[]
}

export interface ReportDoc extends DocMeta {
  type: 'report' | 'proposal' | 'summary'
  executiveSummary?: string
  sections: ReportSection[]
}

// ----------------------------------------------------------------------------
// Spreadsheet — Excel-style sheets
// ----------------------------------------------------------------------------

export interface SheetColumn {
  key: string
  label: string
  type?: 'text' | 'number' | 'currency' | 'percent' | 'date'
}

export interface Sheet {
  name: string
  columns: SheetColumn[]
  rows: Record<string, string | number>[]
  totals?: Record<string, string | number>
}

export interface SpreadsheetDoc extends DocMeta {
  type: 'spreadsheet'
  sheets: Sheet[]
}

// ----------------------------------------------------------------------------
// Charts (shared by slides + dashboards)
// ----------------------------------------------------------------------------

export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'donut'

export interface ChartSpec {
  type: ChartType
  title?: string
  /** Data keys to plot (each becomes a series). */
  series: string[]
  data: Array<{ name: string; [k: string]: string | number }>
}

// ----------------------------------------------------------------------------
// Presentation — slide deck
// ----------------------------------------------------------------------------

export interface Slide {
  title: string
  subtitle?: string
  bullets?: string[]
  notes?: string
  kpis?: DocMetric[]
  chart?: ChartSpec
}

export interface PresentationDoc extends DocMeta {
  type: 'presentation'
  slides: Slide[]
}

// ----------------------------------------------------------------------------
// Dashboard — marketing / social / general
// ----------------------------------------------------------------------------

export type Provider = 'meta' | 'tiktok' | 'google' | 'instagram'

export interface DashboardConnection {
  provider: Provider
  connected: boolean
}

export interface DashboardDoc extends DocMeta {
  type: 'dashboard'
  variant?: 'marketing' | 'social' | 'general'
  kpis: DocMetric[]
  charts: ChartSpec[]
  tables?: Sheet[]
  connections?: DashboardConnection[]
}

// ----------------------------------------------------------------------------
// Union + templates
// ----------------------------------------------------------------------------

export type DocumentSpec = ReportDoc | SpreadsheetDoc | PresentationDoc | DashboardDoc

export interface CreateTemplate {
  id: string
  label: string
  type: DocType
  description: string
  /** lucide-react icon name. */
  icon: string
  /** Good default prompt for the generator. */
  prompt: string
  /** For dashboards: 'marketing' | 'social' | 'general'. */
  variant?: string
}

/** Response shape from POST /api/create/generate. */
export interface GenerateResponse {
  doc: DocumentSpec
  source: 'gemini' | 'mock'
}
