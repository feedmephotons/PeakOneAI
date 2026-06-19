# Peak One — Build Spec (Phase 2 / "Operating System" redesign)

Single source of truth for the team building Evan's June 17–18 roadmap. Every agent reads this file first.
Full vision: `../evan-comms/EVAN-VISION-ORGANIZED.md` · Reference mockups: `../evan-comms/ui-mockups/`.

## What we're building (Tier 1)
1. **Design system** — navy/purple "operating system" look (Concept B: Arc x Notion).
2. **Daily Brief** — new homepage (`/` → Daily Brief). Most important screen.
3. **P1 Memory** (`/memory`) — My Brain / Team Brain / Company Brain + Notes + auto-connections.
4. **Mission Control** (`/missions`, `/missions/[id]`) — missions with progress, objectives, risks, Lisa recs.
5. **Relationship Intelligence** (`/people`) — each person = intelligence profile + "Relationship Brief."
6. **Lisa upgrade** — global "Ask Lisa anything" command bar; memory search + relationship brief generation.

Do NOT build: P1 Student (Phase 3), Operators beyond architecture stubs.

---

## DESIGN TOKENS (locked — from mockups)

Dark navy base, electric purple primary, soft white type, very limited accents. Defined as CSS vars in `globals.css` and Tailwind theme keys under `peak`.

```
--peak-bg:            #090A12   /* app background, deep navy-black */
--peak-bg-2:          #0D0E1A   /* sidebar / slightly raised */
--peak-panel:         #13141F   /* solid panel base */
--peak-glass:         rgba(255,255,255,0.035)  /* glass panel fill */
--peak-glass-hover:   rgba(255,255,255,0.06)
--peak-border:        rgba(255,255,255,0.07)   /* hairline borders */
--peak-primary:       #8B5CF6   /* electric purple (violet-500) */
--peak-primary-600:   #7C3AED
--peak-primary-300:   #C4B5FD   /* light purple text/accents */
--peak-glow:          rgba(139,92,246,0.45)    /* purple glow for halos */
--peak-text:          #F4F5FA   /* soft white */
--peak-text-muted:    #9498AD   /* muted gray-violet */
--peak-text-dim:      #6B6F85
/* status accents — use sparingly */
--peak-green:  #34D399  (on track)
--peak-amber:  #FBBF24  (slightly behind / warning)
--peak-red:    #F87171  (at risk / no response)
--peak-blue:   #60A5FA  (info, some icons)
```

Tailwind: add to `theme.extend.colors.peak = { bg, bg2, panel, glass, border, primary, 'primary-600', 'primary-300', text, muted, dim, green, amber, red, blue }` and `boxShadow.peak` (soft) + `boxShadow['peak-glow']`. Add keyframes: `peak-float`, `peak-pulse-glow`, `peak-fade-up`.

### Visual rules
- **Glass panels:** `bg-peak-glass border border-peak-border rounded-2xl backdrop-blur-xl` + soft shadow. Subtle top-edge highlight. Avoid hard borders elsewhere — prefer spacing + elevation.
- **Typography-first:** page H1 (greeting) = `text-5xl/text-6xl font-semibold tracking-tight`, soft white with the name in purple. Section labels = `text-xs font-medium uppercase tracking-wider text-peak-muted`.
- **Purple is the ONLY brand color.** Accents (green/amber/red) only for status. No multi-color gradients. Allowed: a single purple→transparent glow/aurora behind hero panels.
- **Depth + motion:** floating panels, soft shadows, subtle hover lifts, smooth 150–250ms transitions, the "cosmic orb / aurora" purple glow in the Lisa briefing area. Nothing gimmicky.
- **Mood:** Mission Control, not task management. Remove boxes-within-boxes; more whitespace.

---

## APP SHELL (owned by design-system agent)

Left sidebar (navy, `--peak-bg-2`), logo "PEAK ONE" with purple mark at top. Nav order (matches mockups):
`Daily Brief` (default/home) · `Home` · `Missions` · `Memory` · `Tasks` · `Calendar` · `Messages` · `Calls` · `Files` · `Analytics` · `Automations` · `Integrations`.
Bottom of sidebar: user chip (avatar + name + company) and an **"Ask Lisa AI ⌘K"** entry. Active item = purple glass pill with left accent + glow.
Top bar (per page, not global): right-aligned `Ask Lisa anything… ⌘K` search/command field + notifications + avatar. Routes that are net-new get the navy shell; existing pages keep working inside the shell.

`Daily Brief` route = `/` (rework `app/page.tsx`). Keep a `/home` alias to the old dashboard if needed.

---

## SHARED PRIMITIVES — `components/peak/` (built by design-system agent; pages import these)

Build these with the exact look from the mockups. Page agents code against these prop contracts:

- `PeakShell({children})` — wraps a page in the navy bg + aurora; provides max-width content area.
- `GlassPanel({children, className, glow?})` — the standard floating panel.
- `SectionLabel({children})` — uppercase muted label.
- `StatTile({icon, value, label, sublabel, tone?})` — the "3 Priorities / 2 Meetings / 5 Tasks / 1 at risk" tiles.
- `ProgressRing({value, size, label, sublabel, tone})` — the 72% mission ring with purple glow.
- `MissionTimeline({steps})` — horizontal milestone timeline with check/active/upcoming nodes.
- `LisaBriefingCard({lines, onView})` — the briefing panel with the cosmic purple orb/aurora art (CSS-only orb: radial-gradient + rings + blur). Lines support emphasis spans (purple / red).
- `PriorityList({items})`, `ActivityFeed({items})`, `UpcomingMeetings({items})`, `QuickActions({actions})` — right-rail + footer blocks.
- `ContextPanel({sections})` — Memory's right-side "Related to this note" connections panel.
- `AskLisaBar({placeholder})` — the top command field; opens the existing CommandPalette (wire to it).
- `LisaInsight({title, body, cta})` — small purple insight card used across pages.

Keep them presentational; accept data via props. Provide sensible mock data in stories/usage so pages render immediately.

---

## DATA LAYER (owned by data-layer agent)

Add Prisma models (additive — don't break existing). Provide localStorage/in-memory fallback because the Supabase "PEAK One" project may be paused.

- **Memory:** `Note` (id, workspaceId, authorId, brain: enum MY|TEAM|COMPANY, type: NOTE|JOURNAL|RESEARCH|VOICE|IDEA|DRAFT|DECISION|BOOKMARK, title, body Json/rich, tags String[], pinned, starred, createdAt, updatedAt) · `NoteConnection` (noteId ↔ entityType PERSON|COMPANY|PROJECT|MEETING|TASK|NOTE, entityId, autoLinked bool) · optional `VoiceNote`.
- **Missions:** `Mission` (id, workspaceId, ownerId, name, description, status: ON_TRACK|AT_RISK|BEHIND|COMPLETED, progress Int, targetDate, budgetUsed/budgetTotal, healthScore, velocity) · `MissionObjective` (missionId, title, progress, status) · `MissionMilestone` (missionId, label, date, state: DONE|ACTIVE|UPCOMING) · `MissionRisk` (missionId, title, level: HIGH|MED|LOW, impact, probability, note) · `MissionMember` (missionId, userId, role) · link tasks/meetings/files/contacts to a mission (join or missionId FK where simple).
- **Relationships:** reuse existing `Contact`; add a derived "RelationshipProfile" service that aggregates meetings/messages/tasks/notes/files for a person and a `relationship brief` generator (Gemini via existing `lib/gemini.ts`, with mock fallback).

APIs (App Router, with mock fallback when DB unavailable):
- `app/api/memory/notes` GET/POST, `/notes/[id]` GET/PUT/DELETE, `/notes/[id]/connections` GET, `/memory/search` GET.
- `app/api/missions` GET/POST, `/missions/[id]` GET/PUT/DELETE, `/missions/[id]/(objectives|risks|milestones)`.
- `app/api/relationships/[contactId]` GET (profile), `/relationships/[contactId]/brief` POST (Lisa brief).

Export shared TS types + mock fixtures in `lib/peak/types.ts` and `lib/peak/mock.ts` so page agents can render before APIs are wired. Mock data should mirror the mockups (Sarah Chen / Acme Corp, "Launch Product X" 72%, Q2 Marketing Strategy note, Brian Miller, etc.).

---

## PAGES (one agent each; import peak primitives + lib/peak types & mock)

Match the mockups closely. All navy/purple. Full-width content with right rail where shown.

- **Daily Brief — `app/page.tsx`** (agent: daily-brief): "Good morning, {name}." + "Here's what matters today." → Today's Focus stat row (3/2/5/1) → Lisa's Briefing card (orb + 3 emphasis lines + View full briefing) → Mission Progress (72% ring + timeline) + Upcoming Meetings (two-up) → right rail: Top Priorities, Activity Feed, Quick Actions, Insight of the Day.
- **P1 Memory — `app/memory/`** (agent: memory): left mini-nav (My/Team/Company Brain, Notes, Voice Notes, Projects, People, Companies, Meetings, Files, Decisions) · center notes list (Pinned/Recent) + rich note view (title, tags, sections, metric cards, comment bar) · right ContextPanel ("Related to this note": People/Projects/Files/Meetings + Lisa Insight + Recent activity). Calmer/cleaner than the rest (hybrid B+A). Include `app/memory/company/` Company Brain view (knowledge categories grid, recently updated, popular, knowledge graph placeholder, AI assistant rail).
- **Mission Control — `app/missions/` + `app/missions/[id]/`** (agent: missions): list/grid of missions (progress, status) → detail: big title + 72% ring + Target/Budget/Velocity/Health, tabs (Overview/Objectives/Timeline/Dependencies/Risks/Docs/Team/Reports), Objectives w/ progress bars, Mission Timeline, Key Metrics, Dependencies flow; right rail: Top Risks, Mission Team, Upcoming Milestones, Lisa Recommendations. Feel: Bloomberg/NASA (Concept C).
- **Relationship Intelligence — `app/people/`** (agent: relationships): people list → person profile that connects meetings/notes/tasks/files/messages/CRM; prominent **"Prepare me for {name}"** → Lisa Relationship Brief (summary, open items, recent interactions, risks, opportunities). Build on existing `app/contacts` data/model.
- **Lisa + Command — `app/lisa/` + command bar** (agent: lisa): make `AskLisaBar` open the existing `components/commands/CommandPalette`; add Lisa actions for memory search ("what do I know about X") and relationship brief; ensure Lisa page matches navy theme. Architect Lisa calls as an **orchestrator** (a `lib/peak/lisa-orchestrator.ts` with pluggable "operator" handlers — stub a MeetingOperator) so future operators slot in.

---

## CONVENTIONS
- Next.js 15 App Router, TS, Tailwind, lucide-react icons. `'use client'` where interactive.
- Dark-navy native (don't rely on `dark:` toggle for new pages — they're always navy).
- Reuse existing components where sensible; don't break existing routes.
- Every page must compile: run `npm run build` clean before declaring done. Fix your own TS/lint errors.
- Avoid editing another agent's files. Shared files owned by: design-system → `globals.css`, `tailwind.config.ts`, `components/peak/*`, sidebar/shell. data-layer → `prisma/schema.prisma`, `app/api/(memory|missions|relationships)/*`, `lib/peak/*`.
- Final design test for every screen: "Looks like the OS my company runs on," not "another productivity app."
