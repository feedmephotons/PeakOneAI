/**
 * Peak One — Create Studio generation endpoint.
 *
 * POST { type?, templateId?, prompt } → a DocumentSpec grounded in the company
 * context P1 already stores. Sends a strong, JSON-only system prompt to Gemini.
 * On any failure (no API key, model error, unparseable JSON, schema mismatch),
 * it falls back to a rich mock document. It NEVER returns 500 — mirroring the
 * fallback behavior of /api/ai/chat.
 */

import { NextResponse } from 'next/server'
import { gemini, GEMINI_MODEL } from '@/lib/gemini'
import { assembleCompanyContext } from '@/lib/peak/create-context'
import { getMockDocument, getTemplate } from '@/lib/peak/create-mock'
import type { DocType, DocumentSpec, GenerateResponse } from '@/lib/peak/create-types'

interface GenerateBody {
  type?: DocType
  templateId?: string
  prompt?: string
}

const VALID_TYPES: DocType[] = [
  'report',
  'proposal',
  'summary',
  'spreadsheet',
  'presentation',
  'dashboard',
]

/** Per-type JSON shape guidance handed to the model. */
function shapeForType(type: DocType): string {
  switch (type) {
    case 'report':
    case 'proposal':
    case 'summary':
      return `{
  "type": "${type}",
  "title": string, "subtitle"?: string,
  "executiveSummary"?: string,
  "sections": [ { "heading": string, "body"?: markdown string, "bullets"?: string[], "metrics"?: [ { "label": string, "value": string, "delta"?: string, "trend"?: "up"|"down"|"flat" } ] } ]
}`
    case 'spreadsheet':
      return `{
  "type": "spreadsheet",
  "title": string, "subtitle"?: string,
  "sheets": [ { "name": string, "columns": [ { "key": string, "label": string, "type"?: "text"|"number"|"currency"|"percent"|"date" } ], "rows": [ { <columnKey>: string|number } ], "totals"?: { <columnKey>: string|number } } ]
}`
    case 'presentation':
      return `{
  "type": "presentation",
  "title": string, "subtitle"?: string,
  "slides": [ { "title": string, "subtitle"?: string, "bullets"?: string[], "notes"?: string, "kpis"?: [ { "label": string, "value": string, "delta"?: string, "trend"?: "up"|"down"|"flat" } ], "chart"?: { "type": "bar"|"line"|"area"|"pie"|"donut", "title"?: string, "series": string[], "data": [ { "name": string, [seriesKey]: number } ] } } ]
}`
    case 'dashboard':
      return `{
  "type": "dashboard",
  "title": string, "subtitle"?: string, "variant"?: "marketing"|"social"|"general",
  "kpis": [ { "label": string, "value": string, "delta"?: string, "trend"?: "up"|"down"|"flat" } ],
  "charts": [ { "type": "bar"|"line"|"area"|"pie"|"donut", "title"?: string, "series": string[], "data": [ { "name": string, [seriesKey]: number } ] } ],
  "tables"?: [ { "name": string, "columns": [ { "key": string, "label": string, "type"?: string } ], "rows": [ object ] } ],
  "connections"?: [ { "provider": "meta"|"tiktok"|"google"|"instagram", "connected": boolean } ]
}`
  }
}

/** Best-effort: strip code fences and pull the first JSON object out of text. */
function extractJson(text: string): unknown {
  let t = text.trim()
  // Strip ```json ... ``` fences.
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) throw new Error('no JSON object found')
  return JSON.parse(t.slice(start, end + 1))
}

/** Minimal structural validation so we never hand the UI a malformed doc. */
function validateDoc(raw: unknown, type: DocType): boolean {
  if (!raw || typeof raw !== 'object') return false
  const d = raw as Record<string, unknown>
  if (typeof d.title !== 'string' || !d.title.trim()) return false
  switch (type) {
    case 'report':
    case 'proposal':
    case 'summary':
      return Array.isArray(d.sections) && d.sections.length > 0
    case 'spreadsheet':
      return Array.isArray(d.sheets) && d.sheets.length > 0
    case 'presentation':
      return Array.isArray(d.slides) && d.slides.length > 0
    case 'dashboard':
      return Array.isArray(d.kpis) && Array.isArray(d.charts)
    default:
      return false
  }
}

export async function POST(request: Request) {
  let body: GenerateBody = {}
  try {
    body = (await request.json()) as GenerateBody
  } catch {
    body = {}
  }

  const templateId = body.templateId
  const template = templateId ? getTemplate(templateId) : undefined
  const prompt = (body.prompt || template?.prompt || '').trim()

  // Resolve the target type: explicit type > template type > 'report'.
  const type: DocType =
    (body.type && VALID_TYPES.includes(body.type) ? body.type : undefined) ||
    (template?.type as DocType | undefined) ||
    'report'

  // Always have a rich fallback ready.
  const fallback = (): NextResponse<GenerateResponse> =>
    NextResponse.json({
      doc: getMockDocument(templateId || type, prompt),
      source: 'mock',
    })

  // No key → mock immediately (no model call, no 500).
  if (!process.env.GEMINI_API_KEY) {
    return fallback()
  }

  try {
    const context = assembleCompanyContext()
    const variantHint = template?.variant ? ` (variant: "${template.variant}")` : ''

    const systemPrompt = `You are Peak One's Create Studio engine. You turn the company's stored knowledge into a polished, board-ready ${type}${variantHint}.

You are grounded in this company context. USE IT — reference the real company, people, missions, metrics, and notes so the document is dramatically better than a generic template:

--- COMPANY CONTEXT (what P1 knows) ---
${context}
--- END CONTEXT ---

USER REQUEST: ${prompt || `Create a ${type}.`}

Return ONLY a single valid JSON object (no prose, no markdown fences) that EXACTLY matches this TypeScript-ish shape for a "${type}":
${shapeForType(type)}

Rules:
- Output JSON only. No commentary before or after.
- "type" MUST be "${type}".
- Be specific and realistic: use the company's actual names, numbers, and context above.
- For charts: every object in "data" must have a "name" plus one numeric value per key in "series".
- For dashboards with variant "social", include Meta, Instagram and TikTok KPIs, a follower-growth line chart, an engagement bar chart, a top-posts table, and connections=[{"provider":"meta","connected":false},{"provider":"tiktok","connected":false},{"provider":"instagram","connected":false}].
- For dashboards with variant "marketing", include channel spend/ROI, a conversion funnel, and a campaign performance table.
- Keep it rich but valid JSON.`

    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      config: {
        temperature: 0.6,
        maxOutputTokens: 8000,
        responseMimeType: 'application/json',
      },
    })

    const text = response.text
    if (!text) return fallback()

    const parsed = extractJson(text)
    if (!validateDoc(parsed, type)) return fallback()

    // Stamp metadata so the doc is complete + consistent with the store contract.
    const mockMeta = getMockDocument(templateId || type, prompt)
    const doc = {
      ...(parsed as Record<string, unknown>),
      type,
      id: mockMeta.id,
      createdAt: mockMeta.createdAt,
      author: (parsed as Record<string, unknown>).author || mockMeta.author,
      company: (parsed as Record<string, unknown>).company || mockMeta.company,
      sourceContext:
        Array.isArray((parsed as Record<string, unknown>).sourceContext) &&
        ((parsed as Record<string, unknown>).sourceContext as unknown[]).length
          ? (parsed as Record<string, unknown>).sourceContext
          : mockMeta.sourceContext,
    } as unknown as DocumentSpec

    return NextResponse.json({ doc, source: 'gemini' } satisfies GenerateResponse)
  } catch (error) {
    console.error('Create generate error:', error)
    return fallback()
  }
}
