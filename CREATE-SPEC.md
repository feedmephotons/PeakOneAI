# Peak One — Create Studio (context-aware document generation) — Build Spec

Evan's vision: not "another AI doc generator" — P1 turns the company knowledge it already stores (Memory, Lisa, Operators, CRM/people, meetings, tasks, missions, files, metrics) into polished business outputs. "Build me a Q2 sales report" / "Create a board deck" / "Generate a financial forecast" / "Make a marketing + social dashboard" → it just handles it, grounded in P1 data so the output is dramatically better than starting from scratch.

This is the **Create Studio**. Navy/purple Peak design (see PEAK-BUILD-SPEC.md tokens + components/peak/*). Always-navy pages inside the Peak shell.

## Output types (DocType)
`report` · `proposal` · `summary` (text docs) · `spreadsheet` (Excel) · `presentation` (PowerPoint/deck) · `dashboard` (marketing/social/general).

## Type contract — `lib/peak/create-types.ts` (engine agent creates; everyone imports)
```ts
export type DocType = 'report'|'proposal'|'summary'|'spreadsheet'|'presentation'|'dashboard'
export interface DocMeta { id:string; type:DocType; title:string; subtitle?:string; createdAt:string; author:string; company:string; sourceContext:string[] } // sourceContext = which P1 data it used, e.g. ['Q2 Marketing Strategy note','Launch Product X mission','12 meetings']
export interface DocMetric { label:string; value:string; delta?:string; trend?:'up'|'down'|'flat' }
export interface ReportSection { heading:string; body?:string /*markdown*/; bullets?:string[]; metrics?:DocMetric[] }
export interface ReportDoc extends DocMeta { type:'report'|'proposal'|'summary'; executiveSummary?:string; sections:ReportSection[] }
export interface SheetColumn { key:string; label:string; type?:'text'|'number'|'currency'|'percent'|'date' }
export interface Sheet { name:string; columns:SheetColumn[]; rows:Record<string,string|number>[]; totals?:Record<string,string|number> }
export interface SpreadsheetDoc extends DocMeta { type:'spreadsheet'; sheets:Sheet[] }
export type ChartType = 'bar'|'line'|'area'|'pie'|'donut'
export interface ChartSpec { type:ChartType; title?:string; series:string[] /*data keys*/; data:Array<{name:string;[k:string]:string|number}> }
export interface Slide { title:string; subtitle?:string; bullets?:string[]; notes?:string; kpis?:DocMetric[]; chart?:ChartSpec }
export interface PresentationDoc extends DocMeta { type:'presentation'; slides:Slide[] }
export type Provider='meta'|'tiktok'|'google'|'instagram'
export interface DashboardDoc extends DocMeta { type:'dashboard'; variant?:'marketing'|'social'|'general'; kpis:DocMetric[]; charts:ChartSpec[]; tables?:Sheet[]; connections?:Array<{provider:Provider;connected:boolean}> }
export type DocumentSpec = ReportDoc|SpreadsheetDoc|PresentationDoc|DashboardDoc
export interface CreateTemplate { id:string; label:string; type:DocType; description:string; icon:string /*lucide name*/; prompt:string; variant?:string }
```

## Templates — `CREATE_TEMPLATES` in `lib/peak/create-mock.ts` (engine)
Evan's list (+ marketing/social): `sales-report-q2` (report), `board-presentation` (presentation), `financial-forecast` (spreadsheet), `investor-deck` (presentation), `client-proposal` (proposal), `project-status` (report), `hiring-report` (report), `marketing-dashboard` (dashboard, variant 'marketing'), `social-dashboard` (dashboard, variant 'social'), `qbr` (presentation), `exec-summary` (summary), `financial-model` (spreadsheet). Each has a good default `prompt` and `icon`.

## Engine — `lib/peak/` + API (engine agent)
- `lib/peak/create-context.ts` → `assembleCompanyContext()` builds a compact grounding string/object from lib/peak/mock (MOCK_USER/company, MOCK_MISSION(S), MOCK_STATS, MOCK_DAILY_BRIEF, MOCK_MEETINGS, MOCK_PEOPLE/CRM, MOCK_NOTES, MOCK_PRIORITIES). This is "what P1 knows about the company."
- `lib/peak/create-mock.ts` → `CREATE_TEMPLATES`, `getMockDocument(templateOrType, prompt?)` returning a RICH, realistic DocumentSpec per type (Acme Corp / Sarah Chen / Launch Product X / Q2 numbers consistent with the mockups). Marketing dashboard: channels (Paid/Organic/Email/Social) spend+ROI, conversion funnel, campaign table. Social dashboard: Meta+Instagram+TikTok KPIs (followers, reach, engagement rate, watch time), follower-growth line, engagement-by-platform bar, top-posts table, connections=[{meta,false},{tiktok,false},{instagram,false}].
- `lib/peak/create-store.ts` → localStorage CRUD: `listDocs()`, `getDoc(id)`, `saveDoc(doc)`, `deleteDoc(id)` (key `p1-create-docs`), SSR-safe (guard `typeof window`).
- `app/api/create/generate/route.ts` POST `{ type?, templateId?, prompt }` → assembleCompanyContext + a strong system prompt instructing Gemini to return ONLY JSON matching the DocumentSpec for the requested type → parse/validate → `{ doc, source:'gemini' }`. On no GEMINI_API_KEY / error / unparseable → `{ doc: getMockDocument(...), source:'mock' }`. NEVER 500. (Mirror app/api/ai/chat fallback style; use lib/gemini `gemini`/`GEMINI_MODEL`.)
- Extend `lib/peak/lisa-orchestrator.ts`: add `DocumentOperator` (PeakOperator, status 'available') that handles a new `create` intent — steps: Gather company context → Generate {type} → Format → Ready; `parseIntent` recognizes build/create/generate + report/deck/presentation/spreadsheet/forecast/proposal/dashboard/model. Register it in `defaultRegistry`.

## Pages + renderers
- `app/create/page.tsx` (studio agent): hero "What would you like to create?" big input (+ type chips) → on submit POST generate, saveDoc, router.push(`/create/${id}`). Template gallery (CREATE_TEMPLATES grid, grouped). "Recent documents" from listDocs(). A "Powered by P1 Memory · Lisa · Operators" line. Navy Peak.
- `app/create/[id]/page.tsx` (viewer agent): getDoc(id) from store (fallback: getMockDocument); render the right view by `doc.type`; header with title, "Regenerate", "Export" menu, and a "Sources" chip row (doc.sourceContext). If not found → redirect /create.
- `components/create/DocumentView.tsx` (viewer agent): report/proposal/summary — executive summary, sections (markdown headings/bullets, metric rows as StatTiles), print-to-PDF (window.print with print CSS) + copy/download .md.
- `components/create/SpreadsheetView.tsx` (viewer agent): tabbed sheets, styled navy table, totals row; export **.xlsx via `xlsx` (SheetJS)** and CSV. Editable cells optional.
- `components/create/DeckView.tsx` (deck agent): slide viewer (prev/next + thumbnail strip), renders bullets/kpis/chart per slide; export **.pptx via `pptxgenjs`** + print-to-PDF.
- `components/create/DashboardView.tsx` (dashboard agent): KPIs row (DocMetric → StatTile), charts via **`recharts`** (bar/line/area/pie/donut) themed navy/purple, optional table; for `variant:'social'`/'marketing' show "Connect Meta / TikTok / Instagram" affordance from `connections` (placeholder buttons — live OAuth is out of scope V1). Recharts must be client-only (this file is 'use client').

## Wire-in (wire agent)
- Add **Create** to `components/peak/PeakSidebar.tsx` nav (icon Sparkles/FilePlus, href `/create`) — place sensibly (e.g. after Files).
- Add commands to `components/commands/CommandPalette.tsx`: "Create document", "Create report", "Build a deck", "Generate spreadsheet", "Marketing dashboard" → route to `/create` (optionally `/create?template=...`).
- `app/lisa/page.tsx`: add a quick-action chip "Build a Q2 sales report" that routes to `/create?template=sales-report-q2` (or sends the prompt). Don't break chat.

## Deps (engine agent only — others must NOT touch package.json)
`npm install xlsx pptxgenjs recharts` (all pure-JS/React, no native). Then they're importable.

## Conventions
Navy Peak tokens + components/peak primitives. SSR-safe (no Date.now()/random in render path; pin if needed). Each agent edits ONLY its files. The orchestrator adds `/create` to PEAK_OS_ROUTES (do not edit AppLayout yourselves). Build must stay green; do NOT run `npm run build` (orchestrator builds once). Generation works for real on the deployed preview (GEMINI key is set) and falls back to rich mock everywhere else.
