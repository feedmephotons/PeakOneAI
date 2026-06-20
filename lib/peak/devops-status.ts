// Living functionality tracker for the Peak One build.
// Source of truth for the /devops status board. Update as work lands.
export type AreaState = 'done' | 'demo-ready' | 'needs-service' | 'in-progress'

export interface DevOpsArea {
  area: string
  state: AreaState
  detail: string
  routes: string[]
}

export interface DevOpsExternal {
  service: string
  blocks: string
  routes: string[]
  note: string
}

export const DEVOPS_UPDATED = '2026-06-20'

// Primary login for the seeded Acme world (real DB data after sign-in).
export const DEVOPS_LOGIN = 'sarah.chen@acmecorp.com / Demo123!'

export const DEVOPS_PHASES: { title: string; done: boolean; detail: string }[] = [
  { title: 'Navy/purple OS redesign', done: true, detail: 'Design system + shell + 5 Tier-1 pages (Daily Brief, Missions, Memory, People, Lisa).' },
  { title: 'All nav pages converted to navy', done: true, detail: 'Tasks, Calendar, Messages, Calls, Files, Analytics, Automation, Integrations, Home.' },
  { title: 'Create Studio', done: true, detail: 'Context-aware reports/decks/spreadsheets/dashboards w/ real .xlsx/.pptx export, grounded in P1 data.' },
  { title: 'Page-by-page functional audit', done: true, detail: '74 routes inventoried, 72-item backlog (placeholder / wire-up / broken / external).' },
  { title: 'Canonical Acme Corp dataset', done: true, detail: 'One coherent world (Sarah Chen @ Acme) across tasks/files/threads/calls/emails/calendar/notifications/activity/missions.' },
  { title: 'Reseed + wire every page', done: true, detail: 'Placeholder data replaced; dead controls wired; broken items fixed across the app.' },
  { title: 'End-to-end test pass', done: true, detail: '48 routes: 0 placeholders remaining, 0 hydration errors, 0 empty pages.' },
  { title: 'Live DB seeded + real login', done: true, detail: 'prisma db push (additive) + idempotent seed of the Acme world into Supabase. Sign in as sarah.chen@acmecorp.com / Demo123! to see persistent DB data.' },
  { title: 'Settings pages restyled to navy', done: true, detail: 'All settings sub-pages converted to the Peak design; one canonical Acme/Sarah identity.' },
]

export const DEVOPS_AREAS: DevOpsArea[] = [
  { area: 'Daily Brief / Home', state: 'done', detail: 'Greeting, focus, Lisa briefing, mission ring, priorities, activity, quick actions — all canon.', routes: ['/', '/home'] },
  { area: 'Mission Control', state: 'done', detail: 'List + detail with full objectives/milestones/risks/team/keyMetrics for all 3 missions.', routes: ['/missions', '/missions/[id]'] },
  { area: 'P1 Memory', state: 'done', detail: 'My/Team/Company Brain, notes (persist), connections, Company Brain seeded from canon.', routes: ['/memory', '/memory/company'] },
  { area: 'Relationship Intelligence', state: 'done', detail: 'People directory + profiles; "Prepare me for X" brief for all contacts.', routes: ['/people', '/people/[id]', '/contacts'] },
  { area: 'Create Studio', state: 'done', detail: 'Reports/decks/spreadsheets/dashboards; real Gemini generation + .xlsx/.pptx export.', routes: ['/create', '/create/[id]'] },
  { area: 'Tasks', state: 'demo-ready', detail: 'Kanban seeded from 29 canon tasks, assignee picker, tags, bulk-tag, drag persistence (localStorage).', routes: ['/tasks', '/projects/tasks'] },
  { area: 'Calendar', state: 'demo-ready', detail: 'Month/week/day from canon events, Join links, schedule modal; sync route is a no-op success.', routes: ['/calendar'] },
  { area: 'Messages', state: 'demo-ready', detail: 'Canon threads (#product-x, #general, DMs), compose, pin/mute; live typing/receipts need socket.io.', routes: ['/messages'] },
  { area: 'Calls', state: 'demo-ready', detail: 'Per-id call summaries with transcripts/action items; live telephony needs Twilio.', routes: ['/calls', '/calls/summary/[id]', '/phone'] },
  { area: 'Files', state: 'demo-ready', detail: 'Canon files w/ inline-SVG thumbnails, sort/upload→store; AI analysis needs Gemini (configured).', routes: ['/files', '/storage/files', '/files/upload'] },
  { area: 'Email', state: 'demo-ready', detail: 'Inbox/Sent/Archive/Trash/Starred fixed; reply/forward/star wired; live send needs Resend.', routes: ['/email', '/email/outreach'] },
  { area: 'Notifications & Activity', state: 'done', detail: 'Deterministic canon feeds with deep-link navigation.', routes: ['/notifications', '/activity'] },
  { area: 'Search / Favorites / Templates', state: 'demo-ready', detail: 'Canon-backed, query filtering, templates usable.', routes: ['/search', '/favorites', '/templates'] },
  { area: 'Analytics & Automation', state: 'done', detail: 'Metrics derived from canon (never zero); automations retargeted to Acme.', routes: ['/analytics', '/automation'] },
  { area: 'AI sub-pages', state: 'demo-ready', detail: 'Insights/meetings/reports/suggestions/documents seeded from canon; /ai/assistant routes to real Lisa.', routes: ['/ai/insights', '/ai/meetings', '/ai/reports', '/ai/suggestions', '/ai/documents', '/ai/assistant'] },
  { area: 'Teams', state: 'demo-ready', detail: 'Canon team/workspaces; create/invite/open wired (local).', routes: ['/teams'] },
  { area: 'Settings', state: 'demo-ready', detail: 'One Acme/Sarah identity across profile/org/billing; brand voice seeded; toggles persist (localStorage).', routes: ['/settings', '/settings/billing', '/settings/org', '/settings/security', '/settings/brand-voice', '/settings/notifications', '/settings/integrations'] },
  { area: 'Lisa assistant', state: 'demo-ready', detail: 'On-world keyless fallback + real Gemini stream; command palette + Document Operator.', routes: ['/lisa'] },
  { area: 'Video rooms', state: 'demo-ready', detail: 'Daily.co configured (DAILY_API_KEY) — live multi-party rooms create + join; meetings hub, scheduling, recordings all canon.', routes: ['/video', '/video/room/[id]', '/meeting/[id]'] },
  { area: 'Browser Agent', state: 'needs-service', detail: 'Shell renders; real automation needs Supabase auth + server Puppeteer/Chromium.', routes: ['/agent'] },
]

export const DEVOPS_EXTERNAL: DevOpsExternal[] = [
  { service: 'socket.io server (NEXT_PUBLIC_SOCKET_URL — NOT set yet)', blocks: 'Live typing indicators + read receipts in Messages', routes: ['/messages'], note: 'No socket URL is configured in the env yet. Optimistic send/receive + persistence work without it; flip on by deploying a socket server and setting NEXT_PUBLIC_SOCKET_URL.' },
  { service: 'Twilio', blocks: 'Real outbound telephony + recording playback', routes: ['/phone', '/calls'], note: 'Call history, transcripts, and AI summaries are canon; dialing simulates.' },
  { service: 'OAuth (Meta / TikTok / Instagram / Google)', blocks: 'Live social/marketing analytics + integration connect', routes: ['/create (social dashboard)', '/settings/integrations'], note: 'Connect buttons + realistic mock data present; tokens/ingestion are V2.' },
  { service: 'Puppeteer / Chromium on server', blocks: 'Browser Agent actions', routes: ['/agent'], note: 'Needs Supabase auth + Prisma migration + headless Chromium in the runtime.' },
]

export const DEVOPS_FOLLOWUPS: string[] = [
  'Stand up a socket.io server and set NEXT_PUBLIC_SOCKET_URL to enable live typing indicators + read receipts in Messages.',
  'Add Twilio (telephony) and Meta/TikTok/Google OAuth when ready — Calls and the social dashboard already render canon data + connect affordances.',
  'Wire real send paths (Resend email is configured; Gemini email-outreach regenerate) — currently demo-safe.',
  'Browser Agent (/agent) needs server-side Puppeteer/Chromium in the runtime to run live automations.',
]
