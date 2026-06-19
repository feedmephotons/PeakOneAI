# Project: SaasX Platform Completion

## Architecture
- **Frontend**: Next.js (App Router), Tailwind CSS, Lucide icons, Apple-inspired UI.
- **Database**: PostgreSQL (via Supabase), Prisma ORM.
- **Storage**: Supabase Storage Buckets (`files`, `avatars`, `recordings`).
- **AI Services**: Google Gemini (via `@google/genai`), OpenAI GPT (as fallback/alternative).
- **Endpoints**:
  - `/api/ai/chat` -> Streaming AI assistant.
  - `/api/files/upload-with-ai` -> File upload and AI analysis.
  - `/api/tasks` -> Tasks CRUD operations (needs implementation).
  - `/api/test/*` -> System integration tests.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | E2E Testing Track | Create E2E test suite covering Lisa chat, file upload, Kanban tasks, integration tests, and navigation | None | DONE |
| 2 | Lisa AI Chat Assistant | Complete streaming chat interface with mock fallbacks and attachments | None | DONE |
| 3 | File Upload UI & AI | Connect file upload page to upload-with-ai API, show tags and summaries | None | DONE |
| 4 | Kanban Tasks DB Sync | Implement task APIs (GET, POST, PUT, DELETE) and update task page to synchronize with database | None | DONE |
| 5 | DevOps & Navigation | Implement DevOps tracking dashboard, command palette, and sidebar navigation | M2, M3, M4 | DONE |
| 6 | E2E Test & Build Verification | Run E2E test suite, verify production build, run Forensic Audit | All | DONE |
| 7 | Real-time Messages | Real-time workspace chat with Socket.io server and channel messages persistence | None | IN_PROGRESS |
| 8 | Email Outreach | Cold email sequencing using Gemini and Resend email sending api | None | DONE |
| 9 | Automations Engine | General business rule triggers and automation action executor with execution log | None | TODO |
| 10 | Browser Agent | Autonomous web automation with Puppeteer, safety confirmations, and Gemini Computer Use | None | TODO |
| 11 | Phone Dialer | Quick dial calling, speech-to-text transcription, and Gemini call insights | None | TODO |
| 12 | Calendar CRUD | Interactive scheduling calendar with event CRUD, recurring events, and agenda views | None | TODO |
| 13 | E2E Integration and Forensic Verification | Comprehensive E2E tests for Milestones 7-12, build verification, and forensic audit | M7, M8, M9, M10, M11, M12 | TODO |

## Interface Contracts
### Tasks API (GET/POST/PUT/DELETE `/api/tasks`)
- GET `/api/tasks` -> Returns all tasks for the authenticated user/org.
- POST `/api/tasks` -> Creates a task. Body: `{ title, description, status, priority, dueDate, tags }`
- PUT `/api/tasks` -> Updates task details or status. Body: `{ id, status, priority, title, description, tags, dueDate }`
- DELETE `/api/tasks?id=<id>` -> Deletes a task.

### Email & Outreach API
- POST `/api/email/send` -> Sends email via Resend. Body: `{ to, subject, html, variables }`
- POST `/api/ai/email-outreach` -> Generates sequence using Gemini. Body: `{ targetAudience, tone, goal, emailCount }`

### Automations API
- GET `/api/automation/rules` -> Fetch rules for workspace.
- POST `/api/automation/rules` -> Create a new trigger/action rule.
- PUT `/api/automation/rules` -> Update a rule or toggle enabled state.
- DELETE `/api/automation/rules?id=<id>` -> Delete a rule.

### Browser Agent API
- GET `/api/agent/sessions?workspaceId=<id>` -> List agent sessions for workspace.
- POST `/api/agent/sessions` -> Create session. Body: `{ workspaceId, objective, startUrl }`
- GET `/api/agent/sessions/[id]` -> Fetch session details & history logs.
- POST `/api/agent/sessions/[id]` -> Send control action. Body: `{ action: 'start' | 'pause' | 'resume' | 'cancel' | 'confirm' | 'deny' }`
- GET `/api/agent/sessions/[id]/live` -> Fetch real-time screenshot, URL, current action, and logs.

### Phone Dialer API
- GET `/api/calls` -> List call logs for the workspace.
- POST `/api/calls` -> Log a new incoming/outgoing call.
- POST `/api/calls/analyze` -> Performs speech-to-text transcription and Gemini summarization/sentiment analysis.

### Calendar API
- GET `/api/calendar/events` -> List events in date range.
- POST `/api/calendar/events` -> Create event. Body: `{ title, description, date, startTime, endTime, type, location, participants, color, isAllDay, recurring }`
- PUT `/api/calendar/events` -> Update an event's schedule or metadata.
- DELETE `/api/calendar/events?id=<id>` -> Delete an event.

## Code Layout
- `app/lisa/page.tsx` - Lisa Chat Page
- `app/files/upload/page.tsx` - File Upload Page
- `app/tasks/page.tsx` - Kanban Tasks Page
- `app/devops/page.tsx` - DevOps Dashboard / Design Doc
- `app/test/page.tsx` - System Integration Test Page
- `components/commands/CommandPalette.tsx` - Command Bar
- `components/Navigation.tsx` - Sidebar Navigation
- `app/api/tasks/route.ts` - Tasks API (GET, POST, PUT, DELETE)

### Messages & Socket Server
- `server.js` - Main Express & Socket.io server
- `app/messages/page.tsx` - Messaging UI client

### Email & Outreach
- `lib/resend.ts` - Core email client abstraction using Resend SDK
- `app/api/email/send/route.ts` - Send email endpoint
- `app/api/ai/email-outreach/route.ts` - AI Cold email outreach sequence generator via Gemini
- `app/email/page.tsx` - Email inbox and composers UI
- `app/email/outreach/page.tsx` - Outreach composer campaigns UI

### Automations
- `lib/automation.ts` - Client-side workflow automation engine (in-memory & localStorage execution)
- `app/automation/page.tsx` - Workflow rules overview dashboard UI

### Browser Agent
- `lib/agent/browser-manager.ts` - Puppeteer secure browser instance wrapper
- `lib/agent/computer-use.ts` - Gemini 2.5 Computer Use preview model connector
- `lib/agent/action-handler.ts` - Puppeteer coordinate action execution handler
- `lib/agent/agent-session.ts` - Browser agent main runtime loop manager
- `app/agent/page.tsx` - Browser agent chat & live viewer page
- `app/api/agent/sessions/route.ts` - Sessions collection route (GET/POST)
- `app/api/agent/sessions/[id]/route.ts` - Single session control route (GET/POST/DELETE)
- `app/api/agent/sessions/[id]/live/route.ts` - Live state poller route (GET)

### Phone Dialer
- `app/phone/page.tsx` - Dialer pad, transcripts overview, and call insights client UI

### Calendar
- `app/calendar/page.tsx` - Calendar grid UI (Month, Week, Day, and Agenda views)
- `components/calendar/AgendaView.tsx` - Calendar Agenda List component
- `components/calendar/WeekView.tsx` - Calendar Weekly view layout
- `components/calendar/RecurringEventForm.tsx` - Recurring recurrence config editor

