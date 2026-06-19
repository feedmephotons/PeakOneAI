# E2E Test Suite Architectural Blueprint

This document details the architecture, configuration, and capabilities of the E2E test suite designed for the SaasX platform.

---

## 1. Directory Structure

All E2E test assets are located in the `tests/` directory at the project root:

```
tests/
├── run-all.ts      # Main entry point and lifecycle manager
├── helpers.ts      # Browser setup, API mocks, and server control utilities
├── tier1.ts        # Tier 1 E2E tests: Core Feature Coverage (20 cases)
├── tier2.ts        # Tier 2 E2E tests: Boundary and Corner Cases (20 cases)
├── tier3.ts        # Tier 3 E2E tests: Cross-Feature Combinations (4 cases)
└── tier4.ts        # Tier 4 E2E tests: Real-World Scenarios (5 cases)
```

---

## 2. System Architecture

The test suite runs using **Puppeteer** in a headless Chrome environment. It communicates directly with the Next.js dev server on port `3001` (running via `server.js`).

```
  +-------------------------------------------------------------+
  |                   [ run-all.ts Runner ]                     |
  +------------------------------+------------------------------+
                                 |
           +---------------------+---------------------+
           |                                           |
           v                                           v
+----------------------+                     +------------------+
|   Server Lifecycle   |                     | Puppeteer Page / |
|   (port 3001 status) |                     |  Browser Instance|
+----------+-----------+                     +--------+---------+
           |                                          |
           v (If Port Inactive)                       v (Actions)
+----------------------+                     +------------------+
| spawn('npm run dev') |                     |  Click / Type /  |
|                      |                     |  Drag & Drop /   |
| Next.js Dev Server   | <================== |  Select/Navigate |
+----------------------+                     +--------+---------+
                                                      |
                                                      v (API Interception)
                                             +------------------+
                                             |  helpers.ts Mock |
                                             |  Request Handler |
                                             +------------------+
```

### Server Lifecycle Management
The runner checks whether port `3001` is already active.
- If **active**: It runs the tests against the existing instance.
- If **inactive**: It spawns a background subprocess executing `npm run dev` and polls the port until the server is fully ready. After execution completes, it shuts down the spawned process tree.

### Request Interception & Mocking
To bypass external dependencies (like remote databases or real Gemini/OpenAI API keys) and verify boundary errors, the suite uses Puppeteer's `page.setRequestInterception(true)`. We intercept all backend endpoints:
- `/api/test/db`
- `/api/test/storage`
- `/api/test/ai`
- `/api/ai/chat` (streams EventStream chunks using standard SSE headers)
- `/api/files/upload-with-ai`

---

## 3. Test Tiers and Case Definitions

### Tier 1: Core Feature Coverage
Validates the standard happy-path behavior of the four primary features:
1. **Lisa AI Chat (`/lisa`)**
   - Message Sending
   - Streaming response formatting
   - Fallback simulated response
   - File attachment listing and send
   - Scrollbar automatic scrolling
2. **File Upload & AI Analysis (`/files/upload`)**
   - File input upload selection list
   - Drag & Drop zone drop detection
   - Upload action & summary display
   - AI generated tags rendering
   - Queue file removal
3. **Kanban Tasks (`/tasks`)**
   - Task card creation
   - Drag & Drop status transition
   - Full search text filter
   - Priority filter
   - Individual task deletion
4. **Integration Diagnostics (`/test`)**
   - Initial state and run action
   - Loading spinners
   - Database green check circle
   - Storage green check circle
   - AI response green check circle

### Tier 2: Boundary and Corner Cases
Tests input boundaries, failures, and structural edge cases:
1. **Lisa AI Chat (`/lisa`)**
   - Empty input disable send
   - Long text body handling (2500 chars)
   - Unsupported file type (.exe) selection queue
   - Typing -> clearing input button state
   - Rapid successive message dispatch order
2. **File Upload & AI Analysis (`/files/upload`)**
   - Multi-file queue selection
   - Zero-file selected upload block
   - Filename with special characters (`!@#$%^&()_+.txt`)
   - 0-byte file handling
   - Large file uploading spinner state
3. **Kanban Tasks (`/tasks`)**
   - Validation on empty title submission
   - Multi-line description text wrapping layout
   - Task select checkbox state
   - Bulk delete action selection and confirmation
   - Reload persistence (localStorage check)
4. **Integration Diagnostics (`/test`)**
   - Rapid double test run click
   - Mock API timeouts (shows red X icon)
   - Mock database failure (shows red X icon)
   - Mock storage bucket failure (shows red X icon)
   - Mock AI key failure (shows red X icon)

### Tier 3: Cross-Feature Combinations
Asserts interaction across multiple pages and features:
1. **File Upload + Kanban Task**: Upload a file, extract tags, and create a task using the same tags.
2. **Lisa Chat + Kanban Navigation**: Interact with Lisa, navigate via sidebar to Tasks, modify board, and return back.
3. **Command Palette Global Navigation**: Open Command Palette via `/` shortcut, search pages, navigate to Lisa Chat, and then to Kanban Board.
4. **Integration Diagnostics + DevOps Sync**: Run all integration tests, verify all are green, then navigate to `/devops` design document dashboard.
5. **Real-Time Messages (`/messages`)**: Send message -> verify immediate rendering; switch channels -> verify message feed swap.
6. **Email Outreach (`/email/outreach`)**: Configure campaign prompt -> generate sequence -> modify template -> send test email.
7. **Automations Builder (`/automation`)**: Create task trigger -> check action execution; toggle rule status -> verify state preservation.
8. **Browser Agent Console (`/agent`)**: Initialize Puppeteer agent -> view live viewport screenshot stream -> verify action confirmation safety pop-up.
9. **Phone Call Softphone (`/phone`)**: Dial number -> start mock call -> click play recording -> view transcription and AI insights block.
10. **Calendar Schedule (`/calendar`)**: Create event -> edit time -> delete event -> verify database persistence; switch between Month/Week/Day views.

### Tier 2: Boundary and Corner Cases
Tests input boundaries, failures, and structural edge cases:
1. **Lisa AI Chat (`/lisa`)**
   - Empty input disable send
   - Long text body handling (2500 chars)
   - Unsupported file type (.exe) selection queue
   - Typing -> clearing input button state
   - Rapid successive message dispatch order
2. **File Upload & AI Analysis (`/files/upload`)**
   - Multi-file queue selection
   - Zero-file selected upload block
   - Filename with special characters (`!@#$%^&()_+.txt`)
   - 0-byte file handling
   - Large file uploading spinner state
3. **Kanban Tasks (`/tasks`)**
   - Validation on empty title submission
   - Multi-line description text wrapping layout
   - Task select checkbox state
   - Bulk delete action selection and confirmation
   - Reload persistence (localStorage check)
4. **Integration Diagnostics (`/test`)**
   - Rapid double test run click
   - Mock API timeouts (shows red X icon)
   - Mock database failure (shows red X icon)
   - Mock storage bucket failure (shows red X icon)
   - Mock AI key failure (shows red X icon)
5. **Real-Time Messages (`/messages`)**
   - Socket server disconnection (verify offline banner, queue outgoing, retry reconnections)
   - Blank message sending restriction (verify button state)
   - Sending overly long message content
6. **Email Outreach (`/email/outreach`)**
   - Missing target audience fields (verify generate button disabled)
   - Variable replacement edge cases (e.g. empty `{{firstName}}` handles fallback)
7. **Automations Engine (`/automation`)**
   - Cyclic triggers detection (verifies rules preventing infinite loops of Task Create -> Task Update -> Task Create)
   - Execution failure error logging (simulate exception in webhook action, verify log entries)
8. **Browser Agent (`/agent`)**
   - SSRF Loopback block: Navigate to `http://127.0.0.1:3000` or `localhost`, verify "Navigation blocked: Internal/private addresses are not allowed" error.
   - Non-HTTP protocols block: Navigate to `file:///etc/passwd` or `javascript:alert(1)`, verify protocol validation error.
   - Max Turns boundary: Verify agent stops gracefully and reports failure upon reaching 50 turn limit.
9. **Phone Call Softphone (`/phone`)**
   - Dial invalid characters (`abc-123`), verify formatting validation.
   - Interrupted call (browser closed mid-call, check auto-save log state).
10. **Calendar Schedule (`/calendar`)**
    - High-density overlap: Schedule 5 meetings in the same hour, verify grid column division layout.
    - Multi-day recurring boundary (weekly recurrence crossing daylight saving shifts).

### Tier 3: Cross-Feature Combinations
Asserts interaction across multiple pages and features:
1. **File Upload + Kanban Task**: Upload a file, extract tags, and create a task using the same tags.
2. **Lisa Chat + Kanban Navigation**: Interact with Lisa, navigate via sidebar to Tasks, modify board, and return back.
3. **Command Palette Global Navigation**: Open Command Palette via `/` shortcut, search pages, navigate to Lisa Chat, and then to Kanban Board.
4. **Integration Diagnostics + DevOps Sync**: Run all integration tests, verify all are green, then navigate to `/devops` design document dashboard.
5. **Call Summary to Task Action**: Log a completed call with action items -> trigger automation rule -> verify follow-up Kanban task is automatically created in "TODO" column.
6. **Email Outreach to Calendar Booking**: Intercept outreach test email, extract simulated calendar booking link, navigate to link, schedule slot, verify event added in Calendar.
7. **Automations Email Event Link**: Automations rule detects calendar event -> executes email outreach dispatch -> registers email log.

### Tier 4: Real-World Scenarios
Tests end-to-end user workflows:
1. **End-to-End Task Management Lifecycle**: Create task -> search filter -> check selection -> drag-and-drop column change -> page reload -> delete task.
2. **AI-Assisted Document Synthesis**: Upload file -> extract summary -> paste in Lisa chat -> prompt refinement -> verify refined response.
3. **System Setup & Diagnostic Audit**: Run integration tests -> verify all green -> navigate via command palette -> check DevOps Design Document.
4. **Multi-turn Chat Workspace Session**: Upload file -> ask for analysis -> check response -> ask follow-up question -> verify ordered history preservation.
5. **Global Workspace Transition & Navigation Stress Test**: Home -> Command Palette -> Files -> Upload File -> Command Palette -> Tasks -> Create Task -> Command Palette -> Lisa Chat -> Chat -> Test -> Verify active nav links.
6. **Autonomous Lead Acquisition & Outreach Pipeline**: Initialize Browser Agent session to scrape dummy contact -> Automation rule triggers on contact creation -> AI Email Outreach composer compiles sequence -> Resend sends invitation email -> Lead books demo on Calendar -> Call Dialer registers upcoming session.

---

## 4. Key Execution & Recovery Strategies

- **Native Dialog Handling**: Puppeteer intercepts browser confirmation prompts (`window.confirm`) using `page.on('dialog')` to accept deletes automatically during tests.
- **State Cleanliness**: Before each test starts, `clearState` navigates to home and executes `localStorage.clear()` and `sessionStorage.clear()`.
- **Viewport Dimensioning**: Fixed to `1280x800` to prevent fluid web design layouts from folding elements into hamburger menus.

---

## 5. Mocking Specifications for Milestones 7-13

To ensure stable test execution without hitting live endpoints, the testing framework implements the following mocking strategies:

### Real-Time Socket Mock (`server.js` integration)
- Intercept HTTP requests to `/socket.io/*` and mock connection states using standard WebSockets libraries.
- Simulate broadcast events like `message_received` and workspace joins to test client state reactions.

### Resend Email Client Mock
- Intercept `POST /api/email/send` and return `{ success: true, id: "mock-email-uuid" }` after verifying correct payload formats (`to`, `subject`, `html`).
- Intercept `POST /api/ai/email-outreach` and return static 3-email cold sequence arrays to skip Gemini API calls during standard runs.

### Gemini Computer Use & Puppeteer Mock
- Intercept `/api/agent/sessions` collection routes.
- Mock agent session creation, return hardcoded test session UUIDs.
- Intercept `/api/agent/sessions/[id]/live` polling route to stream base64 encoded static mock screenshots and test logs representing successful navigation actions (e.g. typing, clicking).
- Intercept execution control actions (`start`, `confirm`, `deny`), update local test states immediately.

### call/transcript Speech-to-Text Mock
- Intercept `POST /api/calls/analyze`, bypassing Twilio and Gemini calls.
- Return mock transcription payload and structured AI call summaries with action items and sentiment scores.

### Calendar Sync Mock
- Mock external Google/Microsoft auth/sync redirect endpoints.
- Return mock success payloads and persist local events in standard RFC-5545 format formats.

