'use client'

export default function FeatureInventoryPage() {
  return (
    <div className="inventory-page bg-white text-gray-900 min-h-screen">
      <style jsx global>{`
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .inventory-page { padding: 0 !important; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
          table { font-size: 11px; }
          h1 { font-size: 22px; }
          h2 { font-size: 16px; }
          h3 { font-size: 13px; }
          .status-badge { border: 1px solid #ccc !important; }
        }
      `}</style>

      <div className="max-w-[1100px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="border-b-2 border-gray-900 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">PeakOne AI — Feature Inventory</h1>
              <p className="text-gray-500 mt-1 text-sm">Comprehensive audit of all pages, features, and functionality</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p className="font-mono">Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p>Platform Version: Next.js 15 / React 19</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-xs border border-gray-200 rounded-lg p-3 bg-gray-50 avoid-break">
          <span className="font-semibold text-gray-700 mr-2">STATUS KEY:</span>
          <Badge status="complete">Complete</Badge>
          <Badge status="partial">Partial</Badge>
          <Badge status="placeholder">Placeholder</Badge>
          <Badge status="testing">Testing Only</Badge>
          <span className="ml-4 font-semibold text-gray-700 mr-2">DECISION:</span>
          <span className="inline-flex items-center gap-1"><span className="w-4 h-4 border border-gray-400 inline-block" /> Keep</span>
          <span className="inline-flex items-center gap-1"><span className="w-4 h-4 border border-gray-400 inline-block" /> Revise</span>
          <span className="inline-flex items-center gap-1"><span className="w-4 h-4 border border-gray-400 inline-block" /> Remove</span>
        </div>

        {/* Executive Summary */}
        <section className="mb-8 avoid-break">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">Executive Summary</h2>
          <div className="grid grid-cols-4 gap-3 text-center">
            <StatBox label="Total Pages" value="60+" />
            <StatBox label="API Routes" value="25+" />
            <StatBox label="Components" value="87" />
            <StatBox label="DB Models" value="28" />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3 text-center">
            <StatBox label="Complete Features" value="10" color="green" />
            <StatBox label="Partial Features" value="20+" color="yellow" />
            <StatBox label="Placeholders" value="10+" color="red" />
          </div>
          <p className="text-sm text-gray-600 mt-3">
            <strong>Overall Completion: ~45-50%.</strong> Core features (dashboard, tasks, files, AI chat, video, brand voice) are functional.
            Many secondary pages are UI shells without backend integration. Authentication is in demo mode for investor showcases.
          </p>
        </section>

        {/* ============================== */}
        {/* SECTION 1: CORE PAGES */}
        {/* ============================== */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">1. Dashboard & Home</h2>
          <FeatureTable rows={[
            { route: '/', name: 'Main Dashboard', status: 'complete',
              description: '3 switchable views: PeakDashboard (premium), AppleDashboard (minimal), CustomizableDashboard (widgets). Demo mode toggle bypasses auth. Animated stats, activity feed, quick actions.',
              components: 'PeakDashboard, AppleDashboard, CustomizableDashboard, LandingPage, DashboardWidgets',
              apis: 'None (client-side)' },
            { route: '/demo', name: 'Demo Page', status: 'partial',
              description: 'Investor demo/presentation page. Shows mockup UI layouts.',
              components: 'Mockup components', apis: 'None' },
            { route: '/mockups', name: 'UI Mockups', status: 'partial',
              description: 'Visual prototypes (Mockup1-8, HomepageMockup1-8). Design exploration page.',
              components: '16 Mockup components', apis: 'None' },
            { route: '/devops', name: 'DevOps Dashboard', status: 'complete',
              description: 'Internal Kanban for feature requests, bugs, revisions. No auth required. LocalStorage persistence.',
              components: 'Self-contained', apis: 'None (localStorage)' },
            { route: '/landing', name: 'Landing Page', status: 'partial',
              description: 'Public-facing marketing landing page.',
              components: 'LandingPage', apis: 'None' },
          ]} />
        </section>

        {/* SECTION 2: AUTH */}
        <section className="mb-8 avoid-break">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">2. Authentication & Onboarding</h2>
          <FeatureTable rows={[
            { route: '/sign-in/[[...sign-in]]', name: 'Clerk Sign-In', status: 'partial',
              description: 'Clerk-hosted sign-in redirect page. Dual auth system (Clerk + Supabase) exists.',
              components: 'Clerk components', apis: '/api/auth/*' },
            { route: '/sign-up/[[...sign-up]]', name: 'Clerk Sign-Up', status: 'partial',
              description: 'Clerk-hosted sign-up redirect page.',
              components: 'Clerk components', apis: '/api/auth/*' },
            { route: '/auth/login', name: 'Custom Login', status: 'partial',
              description: 'Custom login form (alternative to Clerk). Supabase auth integration.',
              components: 'Custom form', apis: '/api/auth/login' },
            { route: '/auth/register', name: 'Custom Register', status: 'partial',
              description: 'Custom registration form with Supabase auth.',
              components: 'Custom form', apis: '/api/auth/register' },
            { route: '/auth/callback', name: 'Auth Callback', status: 'complete',
              description: 'Supabase OAuth callback handler (API route).',
              components: 'N/A', apis: 'Route handler' },
            { route: '/onboarding', name: 'Onboarding Flow', status: 'partial',
              description: 'New user setup wizard. OnboardingFlow component.',
              components: 'OnboardingFlow', apis: 'None' },
            { route: '/org-selection', name: 'Workspace Selector', status: 'partial',
              description: 'Multi-tenant workspace/organization selection screen.',
              components: 'Org selector UI', apis: 'None' },
          ]} />
          <Note>Auth is currently disabled (demo mode). Dual auth system (Clerk + Supabase) needs consolidation — pick one.</Note>
        </section>

        {/* SECTION 3: AI Features */}
        <section className="mb-8 page-break">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">3. AI Features (Lisa)</h2>
          <FeatureTable rows={[
            { route: '/lisa', name: 'Lisa AI Chat', status: 'complete',
              description: 'Main AI assistant. Streaming responses via Gemini 2.5 Flash. File upload + image analysis. Quick action buttons. Chat history. Fallback responses when API unavailable. RAG support for contextual answers.',
              components: 'PeakAIAssistant, chat UI', apis: '/api/ai/chat' },
            { route: '/agent', name: 'Computer Use Agent', status: 'partial',
              description: 'Browser automation agent. Session management, live screenshot viewer, action logs. Puppeteer-based. Core models in DB but execution engine incomplete.',
              components: 'Agent controls, state viewer', apis: '/api/agent/sessions/*' },
            { route: '/ai/assistant', name: 'AI Assistant Hub', status: 'placeholder',
              description: 'Umbrella page for AI features. UI shell only.', components: '-', apis: '-' },
            { route: '/ai/automation', name: 'AI Automation', status: 'placeholder',
              description: 'AI-powered workflow automation. UI shell only.', components: '-', apis: '-' },
            { route: '/ai/documents', name: 'AI Documents', status: 'placeholder',
              description: 'Document analysis with AI. UI shell only.', components: '-', apis: '-' },
            { route: '/ai/meetings', name: 'AI Meetings', status: 'placeholder',
              description: 'Meeting intelligence. UI shell only.', components: '-', apis: '-' },
            { route: '/ai/analytics', name: 'AI Analytics', status: 'placeholder',
              description: 'AI-driven analytics dashboard. UI shell only.', components: '-', apis: '-' },
            { route: '/ai/insights', name: 'AI Insights', status: 'placeholder',
              description: 'AI-generated business insights. UI shell only.', components: '-', apis: '-' },
            { route: '/ai/productivity', name: 'AI Productivity', status: 'placeholder',
              description: 'Productivity recommendations. UI shell only.', components: '-', apis: '-' },
            { route: '/ai/reports', name: 'AI Reports', status: 'placeholder',
              description: 'AI report generation. UI shell only.', components: '-', apis: '-' },
            { route: '/ai/suggestions', name: 'AI Suggestions', status: 'placeholder',
              description: 'AI suggestion engine. UI shell only.', components: '-', apis: '-' },
            { route: '/ai/team', name: 'AI Team Insights', status: 'placeholder',
              description: 'Team performance AI insights. UI shell only.', components: '-', apis: '-' },
            { route: '/ai/time', name: 'AI Time Management', status: 'placeholder',
              description: 'Time management AI. UI shell only.', components: '-', apis: '-' },
          ]} />
          <Note>10 AI sub-pages are empty placeholders (/ai/*). Consider consolidating into Lisa or removing.</Note>
        </section>

        {/* SECTION 4: Task Management */}
        <section className="mb-8 avoid-break">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">4. Task & Project Management</h2>
          <FeatureTable rows={[
            { route: '/tasks', name: 'Kanban Board', status: 'complete',
              description: 'Full Kanban with 4 columns (TODO, IN_PROGRESS, IN_REVIEW, COMPLETED). Drag-drop (JS-based), tag filtering, bulk operations, automation triggers, AI task suggestions. LocalStorage persistence.',
              components: 'KanbanBoard, TaskColumn, TaskCard, CreateTaskModal, TagFilter, AISuggestionsPanel, BulkActionBar, AdvancedSearch, AutomationManager',
              apis: '/api/ai/chat (suggestions)' },
            { route: '/projects/tasks', name: 'Project Tasks', status: 'partial',
              description: 'Project-specific task view. Basic structure.',
              components: '-', apis: '-' },
            { route: '/automation', name: 'Automation Engine', status: 'complete',
              description: 'Workflow automation builder. Trigger/action patterns (schedules, events, conditions). Supports messages, emails, tasks, team notifications, AI actions. Mock automations with status management.',
              components: 'AutomationManager', apis: 'None (client-side)' },
          ]} />
        </section>

        {/* SECTION 5: Communication */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">5. Communication & Video</h2>
          <FeatureTable rows={[
            { route: '/video/room/[id]', name: 'Video Call Room', status: 'complete',
              description: 'Daily.co WebRTC video rooms. Real-time AI transcription via Gemini audio. Meeting summaries, action item extraction. Dynamic room creation/joining.',
              components: 'VideoCallWithDaily, AICallWidget', apis: '/api/video/create-room, /api/transcribe, /api/meetings/summary' },
            { route: '/video', name: 'Video Hub', status: 'partial',
              description: 'Video conferencing lobby/landing page.', components: 'Video UI', apis: '/api/video/create-room' },
            { route: '/video/demo', name: 'Video Demo', status: 'partial',
              description: 'Demo video meeting page.', components: 'Demo video UI', apis: '-' },
            { route: '/messages', name: 'Messaging', status: 'partial',
              description: 'Direct messaging UI. Socket.io configured in package.json but messaging is UI-only — no real-time backend.',
              components: 'Messaging UI', apis: 'None' },
            { route: '/calls', name: 'Call History', status: 'partial',
              description: 'Call listing page. Shows call history.', components: 'Call list', apis: '-' },
            { route: '/calls/summary/[id]', name: 'Call Summary', status: 'partial',
              description: 'Post-call AI summary and analysis view.', components: 'CallSummaryPage', apis: '/api/meetings/analyze' },
            { route: '/meeting/[id]', name: 'Meeting Details', status: 'partial',
              description: 'Meeting details page.', components: 'Meeting details', apis: '-' },
            { route: '/phone', name: 'Phone Calls', status: 'placeholder',
              description: 'Phone calling interface. UI structure only — no telephony integration.',
              components: 'Phone UI', apis: 'None' },
          ]} />
          <Note>Messaging has no real-time backend. Phone is UI-only. Video calling is the most complete communication feature.</Note>
        </section>

        {/* SECTION 6: File Management */}
        <section className="mb-8 page-break avoid-break">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">6. File Management & Storage</h2>
          <FeatureTable rows={[
            { route: '/files', name: 'File Manager', status: 'complete',
              description: 'Full file manager: grid/list view, drag-drop upload, folder hierarchy, search, filtering (starred/recent/shared/trash), file sharing, AI summaries via Gemini Vision, version tracking. Context panel with file details. LocalStorage persistence.',
              components: 'FileContextPanel, CreateFolderModal, FilePreview',
              apis: '/api/files/upload, /api/files/upload-with-ai' },
            { route: '/files/upload', name: 'File Upload', status: 'partial',
              description: 'Dedicated upload page with AI analysis.', components: 'Upload UI', apis: '/api/files/upload-with-ai' },
            { route: '/storage/files', name: 'Cloud Storage', status: 'partial',
              description: 'Cloud storage view. Separate from file manager.', components: 'Storage view', apis: '-' },
          ]} />
        </section>

        {/* SECTION 7: Calendar & Email */}
        <section className="mb-8 avoid-break">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">7. Calendar & Email</h2>
          <FeatureTable rows={[
            { route: '/calendar', name: 'Calendar', status: 'partial',
              description: 'Month/week/day views, event creation, recurring events. LocalStorage persistence. No backend sync.',
              components: 'AgendaView, WeekView, RecurringEventForm', apis: 'None (localStorage)' },
            { route: '/email', name: 'Email Inbox', status: 'partial',
              description: 'Email interface/inbox. UI structure with Resend integration scaffolded.',
              components: 'Email UI', apis: '/api/email/send' },
            { route: '/email/outreach', name: 'AI Email Outreach', status: 'partial',
              description: 'AI-powered email campaign builder. Generates outreach sequences.',
              components: 'Outreach UI', apis: '/api/ai/email-outreach' },
          ]} />
        </section>

        {/* SECTION 8: Analytics & Search */}
        <section className="mb-8 avoid-break">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">8. Analytics, Search & Activity</h2>
          <FeatureTable rows={[
            { route: '/analytics', name: 'Analytics Dashboard', status: 'partial',
              description: 'Charts and visualizations (Bar, Line, Pie, Heatmap). Data integration pending — currently shows mock data.',
              components: 'BarChart, LineChart, PieChart, ActivityHeatmap', apis: '-' },
            { route: '/search', name: 'Global Search', status: 'partial',
              description: 'Search across all content. Advanced filters. AI-powered RAG search.',
              components: 'AdvancedSearch, GlobalSearch', apis: '/api/ai/chat (RAG)' },
            { route: '/activity', name: 'Activity Feed', status: 'partial',
              description: 'Activity log/feed. UI structure.', components: 'Activity feed UI', apis: '-' },
          ]} />
        </section>

        {/* SECTION 9: Settings */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">9. Settings</h2>
          <FeatureTable rows={[
            { route: '/settings', name: 'Main Settings', status: 'partial',
              description: 'Profile editor, tabbed settings interface.',
              components: 'Settings tabs', apis: '-' },
            { route: '/settings/brand-voice', name: 'Brand Voice', status: 'complete',
              description: 'Brand voice enforcement system. 4 enforcement levels (spell-check to auto-rewrite). Brand guideline extraction from PDFs via Gemini Vision. Approved/forbidden terms. Messaging rules. Real-time text analysis and rewriting.',
              components: 'BrandVoiceTextarea, guideline manager',
              apis: '/api/brand-voice/guidelines, /api/brand-voice/analyze, /api/brand-voice/rewrite' },
            { route: '/settings/integrations', name: 'Integrations', status: 'partial',
              description: 'Third-party integration manager.', components: 'Integration UI', apis: '-' },
            { route: '/settings/notifications', name: 'Notification Prefs', status: 'partial',
              description: 'Notification preferences.', components: 'Settings UI', apis: '-' },
            { route: '/settings/billing', name: 'Billing', status: 'partial',
              description: 'Subscription and billing management.', components: 'Billing UI', apis: '-' },
            { route: '/settings/security', name: 'Security', status: 'partial',
              description: '2FA, login alerts, trusted devices.', components: 'Security UI', apis: '-' },
            { route: '/settings/org', name: 'Organization', status: 'partial',
              description: 'Workspace/org management.', components: 'Org settings', apis: '-' },
            { route: '/settings/shortcuts', name: 'Keyboard Shortcuts', status: 'partial',
              description: 'Keyboard shortcuts reference.', components: 'Shortcuts UI', apis: '-' },
          ]} />
        </section>

        {/* SECTION 10: Utility & Content Pages */}
        <section className="mb-8 page-break">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">10. Utility & Content Pages</h2>
          <FeatureTable rows={[
            { route: '/deck', name: 'Presentation Deck', status: 'partial',
              description: 'Presentation/slide deck view.', components: '-', apis: '-' },
            { route: '/templates', name: 'Template Library', status: 'partial',
              description: 'Template library and manager.', components: 'TemplateManager, TemplateSelector', apis: '-' },
            { route: '/favorites', name: 'Favorites', status: 'partial',
              description: 'Starred/favorite items view.', components: '-', apis: '-' },
            { route: '/notifications', name: 'Notification Center', status: 'partial',
              description: 'Notification listing page.', components: 'NotificationProvider', apis: '-' },
            { route: '/help', name: 'Help Center', status: 'partial',
              description: 'Help/support documentation.', components: '-', apis: '-' },
            { route: '/support', name: 'Support Page', status: 'partial',
              description: 'Support/contact page.', components: '-', apis: '-' },
            { route: '/docs', name: 'Documentation', status: 'partial',
              description: 'Product documentation.', components: '-', apis: '-' },
            { route: '/offline', name: 'Offline Fallback', status: 'partial',
              description: 'PWA offline fallback page.', components: '-', apis: '-' },
            { route: '/test', name: 'Test Page', status: 'testing',
              description: 'Development testing page.', components: '-', apis: '-' },
          ]} />
        </section>

        {/* SECTION 11: API Routes */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">11. API Routes</h2>

          <h3 className="text-base font-semibold mt-4 mb-2 text-gray-700">Authentication APIs</h3>
          <ApiTable rows={[
            { route: '/api/auth/login', method: 'POST', status: 'partial', description: 'User login endpoint' },
            { route: '/api/auth/register', method: 'POST', status: 'partial', description: 'User registration' },
            { route: '/api/auth/signin', method: 'POST', status: 'partial', description: 'Sign-in handler' },
            { route: '/api/auth/signup', method: 'POST', status: 'partial', description: 'Sign-up handler' },
            { route: '/api/auth/signout', method: 'POST', status: 'partial', description: 'Sign-out handler' },
            { route: '/api/webhooks/clerk', method: 'POST', status: 'partial', description: 'Clerk webhook sync events' },
          ]} />

          <h3 className="text-base font-semibold mt-4 mb-2 text-gray-700">AI & Chat APIs</h3>
          <ApiTable rows={[
            { route: '/api/ai/chat', method: 'POST', status: 'complete', description: 'Lisa AI chat — streaming, RAG, multi-modal (text + image), Supabase auth' },
            { route: '/api/ai/email-outreach', method: 'POST', status: 'partial', description: 'AI email campaign generator' },
          ]} />

          <h3 className="text-base font-semibold mt-4 mb-2 text-gray-700">Video & Meeting APIs</h3>
          <ApiTable rows={[
            { route: '/api/video/create-room', method: 'POST', status: 'complete', description: 'Daily.co room creation with public rooms' },
            { route: '/api/transcribe', method: 'POST', status: 'complete', description: 'Real-time audio transcription via Gemini 2.5' },
            { route: '/api/meetings/summary', method: 'POST', status: 'partial', description: 'AI meeting summary generation' },
            { route: '/api/meetings/analyze', method: 'POST', status: 'partial', description: 'Meeting analysis and action item extraction' },
          ]} />

          <h3 className="text-base font-semibold mt-4 mb-2 text-gray-700">File APIs</h3>
          <ApiTable rows={[
            { route: '/api/files/upload', method: 'POST', status: 'partial', description: 'Basic file upload to Supabase Storage' },
            { route: '/api/files/upload-with-ai', method: 'POST', status: 'complete', description: 'File upload with AI analysis (summary, tags, embeddings)' },
          ]} />

          <h3 className="text-base font-semibold mt-4 mb-2 text-gray-700">Brand Voice APIs</h3>
          <ApiTable rows={[
            { route: '/api/brand-voice/guidelines', method: 'GET/POST', status: 'complete', description: 'Fetch/create brand guidelines with PDF extraction' },
            { route: '/api/brand-voice/analyze', method: 'POST', status: 'complete', description: 'Analyze text against brand voice guidelines' },
            { route: '/api/brand-voice/rewrite', method: 'POST', status: 'complete', description: 'Rewrite text to match brand voice' },
          ]} />

          <h3 className="text-base font-semibold mt-4 mb-2 text-gray-700">Other APIs</h3>
          <ApiTable rows={[
            { route: '/api/tasks/create', method: 'POST', status: 'partial', description: 'Create task (Prisma integration ready)' },
            { route: '/api/email/send', method: 'POST', status: 'partial', description: 'Send emails via Resend' },
            { route: '/api/agent/sessions', method: 'GET/POST', status: 'partial', description: 'Agent session management' },
            { route: '/api/agent/sessions/[id]', method: 'GET/PUT', status: 'partial', description: 'Individual session operations' },
            { route: '/api/agent/sessions/[id]/live', method: 'GET', status: 'partial', description: 'Live session updates (streaming)' },
            { route: '/api/test/db', method: 'GET', status: 'testing', description: 'Database connection test' },
            { route: '/api/test/storage', method: 'GET', status: 'testing', description: 'Storage connection test' },
            { route: '/api/test/ai', method: 'GET', status: 'testing', description: 'AI API connection test' },
          ]} />
        </section>

        {/* SECTION 12: Database Models */}
        <section className="mb-8 page-break">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">12. Database Schema (28 Models)</h2>

          <div className="grid grid-cols-2 gap-4">
            <ModelGroup title="Core" models={[
              { name: 'User', fields: '23 fields', description: 'User accounts with Clerk + Supabase IDs, profile info' },
              { name: 'Workspace', fields: '6 fields', description: 'Organization/team container (multi-tenant)' },
              { name: 'UserWorkspace', fields: 'Junction', description: 'Membership with roles: Owner, Admin, Member, Viewer' },
            ]} />
            <ModelGroup title="Files & Storage" models={[
              { name: 'File', fields: '12+ fields', description: 'File metadata, AI summary, tags, version tracking' },
              { name: 'Folder', fields: 'Self-ref', description: 'Hierarchical folders with parent/child relations' },
              { name: 'FileVersion', fields: '5 fields', description: 'Version history for files' },
            ]} />
            <ModelGroup title="Tasks" models={[
              { name: 'Project', fields: '8 fields', description: 'Projects with status (Planning → Cancelled)' },
              { name: 'Task', fields: '15+ fields', description: 'Tasks with priority, AI-suggested flag, position' },
              { name: 'TaskAssignment', fields: 'Junction', description: 'Task-to-user assignment mapping' },
              { name: 'Comment', fields: '5 fields', description: 'Task comments/discussion' },
            ]} />
            <ModelGroup title="Communication" models={[
              { name: 'Conversation', fields: '5 fields', description: '1-to-1 or group conversations' },
              { name: 'ConversationParticipant', fields: 'Junction', description: 'Conversation membership' },
              { name: 'Message', fields: '7 fields', description: 'Messages with edit tracking' },
            ]} />
            <ModelGroup title="Calls & Calendar" models={[
              { name: 'Call', fields: '12 fields', description: 'Phone/video calls with recording, transcription, AI summary' },
              { name: 'CallParticipant', fields: 'Junction', description: 'Call participation tracking' },
              { name: 'CalendarEvent', fields: '14 fields', description: 'Events with recurrence, color, attendees' },
              { name: 'EventAttendee', fields: 'Junction', description: 'Event RSVPs (pending/accepted/declined)' },
            ]} />
            <ModelGroup title="AI" models={[
              { name: 'AIConversation', fields: '5 fields', description: 'Chat history with Lisa' },
              { name: 'AIMessage', fields: '6 fields', description: 'AI messages (user/assistant/system/function)' },
              { name: 'Activity', fields: '8 fields', description: 'Activity feed (polymorphic entity tracking)' },
            ]} />
            <ModelGroup title="Brand Voice (6 models)" models={[
              { name: 'BrandGuideline', fields: '12 fields', description: 'Organization brand voice, tones, personality' },
              { name: 'BrandApprovedTerm', fields: '5 fields', description: 'Approved terminology with context' },
              { name: 'BrandForbiddenTerm', fields: '6 fields', description: 'Prohibited terms with severity levels' },
              { name: 'BrandMessagingRule', fields: '7 fields', description: 'Communication rules with examples' },
              { name: 'BrandVoiceUserSetting', fields: '6 fields', description: 'Per-user enforcement levels (1-4)' },
              { name: 'BrandVoiceSuggestion', fields: '8 fields', description: 'AI suggestions with confidence scores' },
            ]} />
            <ModelGroup title="Computer Use Agent (5 models)" models={[
              { name: 'AgentSession', fields: '10 fields', description: 'Browser automation sessions with status' },
              { name: 'AgentTask', fields: '10 fields', description: 'Individual automation tasks' },
              { name: 'AgentScreenshot', fields: '8 fields', description: 'Session screenshots with annotations' },
              { name: 'AgentLog', fields: '6 fields', description: 'Session logs with severity levels' },
              { name: 'AgentWorkflow', fields: '9 fields', description: 'Reusable automation templates' },
            ]} />
          </div>
        </section>

        {/* SECTION 13: Tech Stack */}
        <section className="mb-8 avoid-break">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">13. Tech Stack & Dependencies</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="font-semibold text-gray-800 mb-2">Frontend</h3>
              <ul className="space-y-1 text-gray-600">
                <li>Next.js 15.5.7 (App Router)</li>
                <li>React 19</li>
                <li>Tailwind CSS 3.4.17</li>
                <li>Lucide Icons</li>
                <li>Framer Motion (animations)</li>
                <li>Zustand (state management)</li>
                <li>TanStack React Query</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="font-semibold text-gray-800 mb-2">Backend & Data</h3>
              <ul className="space-y-1 text-gray-600">
                <li>Next.js API Routes</li>
                <li>Prisma ORM (28 models)</li>
                <li>PostgreSQL (Supabase)</li>
                <li>Supabase Storage</li>
                <li>Socket.io (configured, not active)</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="font-semibold text-gray-800 mb-2">AI & Services</h3>
              <ul className="space-y-1 text-gray-600">
                <li>Google Gemini 2.5 Flash (chat, vision, audio)</li>
                <li>OpenAI SDK (fallback)</li>
                <li>RAG with vector embeddings</li>
                <li>Daily.co WebRTC (video)</li>
                <li>Resend (email)</li>
                <li>Puppeteer (browser automation)</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="font-semibold text-gray-800 mb-2">Auth & DevOps</h3>
              <ul className="space-y-1 text-gray-600">
                <li>Clerk 6.33.7 (multi-tenant auth)</li>
                <li>Supabase Auth (SSR)</li>
                <li>Sentry (error tracking)</li>
                <li>TypeScript 5</li>
                <li>PWA support (service worker, manifest)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 14: Key Issues & Recommendations */}
        <section className="mb-8 page-break avoid-break">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">14. Key Issues & Observations</h2>
          <div className="space-y-3 text-sm">
            <IssueItem severity="high" title="Dual Authentication System">
              Both Clerk and Supabase Auth are integrated. Need to pick one and remove the other to avoid confusion and maintenance burden.
            </IssueItem>
            <IssueItem severity="high" title="Auth Disabled for Demo">
              Middleware bypasses all auth. Every route is publicly accessible. Must re-enable before any production use.
            </IssueItem>
            <IssueItem severity="medium" title="10 Empty AI Sub-Pages">
              /ai/analytics, /ai/insights, /ai/productivity, /ai/reports, /ai/suggestions, /ai/team, /ai/time, /ai/assistant, /ai/automation, /ai/documents — all are empty UI shells. Consolidate into Lisa or build out the most valuable ones.
            </IssueItem>
            <IssueItem severity="medium" title="LocalStorage Persistence">
              Tasks, files, calendar all use LocalStorage. No backend sync means data is lost across devices/browsers. Need to connect to Prisma/Supabase.
            </IssueItem>
            <IssueItem severity="medium" title="Messaging Has No Backend">
              Socket.io is a dependency but messaging is UI-only. No real-time message delivery.
            </IssueItem>
            <IssueItem severity="low" title="Phone Page is a Placeholder">
              No telephony provider integrated. Consider removing or replacing with a VoIP integration.
            </IssueItem>
            <IssueItem severity="low" title="Duplicate Page Structures">
              Multiple auth flows (Clerk sign-in + custom auth), multiple file views (/files + /storage/files), and overlapping navigation patterns.
            </IssueItem>
            <IssueItem severity="low" title="Agent Feature Incomplete">
              Browser automation (Puppeteer) has DB models and API routes but the execution engine is not wired up.
            </IssueItem>
          </div>
        </section>

        {/* SECTION 15: Decision Matrix */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">15. Decision Matrix — Feature-by-Feature</h2>
          <p className="text-sm text-gray-600 mb-3">Use the checkboxes to mark each feature as Keep, Revise, or Remove.</p>

          <DecisionTable category="Core Features" rows={[
            { feature: 'Dashboard (3 views)', status: 'complete', notes: 'Fully functional. 3 view modes may be excessive — consider keeping 1-2.' },
            { feature: 'Lisa AI Chat', status: 'complete', notes: 'Core differentiator. Streaming, RAG, multi-modal all working.' },
            { feature: 'Task Management (Kanban)', status: 'complete', notes: 'Feature-rich. Needs backend persistence (currently localStorage).' },
            { feature: 'File Manager', status: 'complete', notes: 'Full-featured. AI summaries work. Needs backend persistence.' },
            { feature: 'Video Conferencing', status: 'complete', notes: 'Daily.co integration with real-time transcription. Working well.' },
            { feature: 'Brand Voice System', status: 'complete', notes: 'Sophisticated 4-level enforcement. PDF extraction. Unique differentiator.' },
            { feature: 'Automation Engine', status: 'complete', notes: 'UI complete with triggers/actions. Client-side only.' },
            { feature: 'Calendar', status: 'partial', notes: 'Month/week/day views work. No backend sync.' },
          ]} />

          <DecisionTable category="Communication" rows={[
            { feature: 'Messaging / Chat', status: 'partial', notes: 'UI exists, no real-time backend. Socket.io unused.' },
            { feature: 'Phone Calls', status: 'placeholder', notes: 'No telephony integration. UI shell only.' },
            { feature: 'Call History', status: 'partial', notes: 'Basic listing. No real data source.' },
            { feature: 'Meeting Summaries', status: 'partial', notes: 'API exists, connected to video rooms.' },
          ]} />

          <DecisionTable category="AI Sub-Features" rows={[
            { feature: '/ai/assistant', status: 'placeholder', notes: 'Empty hub page — duplicates /lisa.' },
            { feature: '/ai/automation', status: 'placeholder', notes: 'Empty — duplicates /automation.' },
            { feature: '/ai/documents', status: 'placeholder', notes: 'Empty — could merge into /files AI features.' },
            { feature: '/ai/meetings', status: 'placeholder', notes: 'Empty — could merge into video/call summaries.' },
            { feature: '/ai/analytics', status: 'placeholder', notes: 'Empty — could merge into /analytics.' },
            { feature: '/ai/insights', status: 'placeholder', notes: 'Empty shell.' },
            { feature: '/ai/productivity', status: 'placeholder', notes: 'Empty shell.' },
            { feature: '/ai/reports', status: 'placeholder', notes: 'Empty shell.' },
            { feature: '/ai/suggestions', status: 'placeholder', notes: 'Empty shell.' },
            { feature: '/ai/team', status: 'placeholder', notes: 'Empty shell.' },
            { feature: '/ai/time', status: 'placeholder', notes: 'Empty shell.' },
            { feature: 'Computer Use Agent', status: 'partial', notes: 'DB models exist, execution engine incomplete.' },
          ]} />

          <DecisionTable category="Settings & Config" rows={[
            { feature: 'Main Settings', status: 'partial', notes: 'Profile editor works, tabs scaffolded.' },
            { feature: 'Brand Voice Settings', status: 'complete', notes: 'Fully implemented with API.' },
            { feature: 'Integrations', status: 'partial', notes: 'UI only — no actual integrations connected.' },
            { feature: 'Billing', status: 'partial', notes: 'UI only — no Stripe or payment provider.' },
            { feature: 'Security Settings', status: 'partial', notes: 'UI only — no 2FA implemented.' },
            { feature: 'Organization Settings', status: 'partial', notes: 'UI only.' },
            { feature: 'Notification Prefs', status: 'partial', notes: 'UI only.' },
            { feature: 'Keyboard Shortcuts', status: 'partial', notes: 'Reference page. Shortcuts may or may not be wired.' },
          ]} />

          <DecisionTable category="Content & Utility" rows={[
            { feature: 'Email / Inbox', status: 'partial', notes: 'UI with Resend scaffolded. No inbox sync.' },
            { feature: 'AI Email Outreach', status: 'partial', notes: 'Campaign builder UI with AI generation.' },
            { feature: 'Analytics Dashboard', status: 'partial', notes: 'Charts built. Mock data only.' },
            { feature: 'Global Search', status: 'partial', notes: 'UI + RAG search scaffolded.' },
            { feature: 'Template Library', status: 'partial', notes: 'Template manager component exists.' },
            { feature: 'Favorites', status: 'partial', notes: 'Basic starred items view.' },
            { feature: 'Notifications Center', status: 'partial', notes: 'Listing page.' },
            { feature: 'Help / Support / Docs', status: 'partial', notes: '3 separate pages with similar purpose.' },
            { feature: 'Presentation Deck', status: 'partial', notes: 'Slide viewer.' },
            { feature: 'DevOps Dashboard', status: 'complete', notes: 'Internal dev tool. Keep for development, remove for production.' },
            { feature: 'Onboarding Flow', status: 'partial', notes: 'New user wizard scaffolded.' },
            { feature: 'PWA Support', status: 'partial', notes: 'Service worker, manifest, offline page.' },
          ]} />
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-900 pt-4 mt-8 text-sm text-gray-500">
          <div className="flex justify-between">
            <span>PeakOne AI — Feature Inventory Audit</span>
            <span>Page generated for print/PDF export</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== Sub-Components ====================

function Badge({ status, children }: { status: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    complete: 'bg-green-100 text-green-800 border-green-300',
    partial: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    placeholder: 'bg-red-100 text-red-800 border-red-300',
    testing: 'bg-blue-100 text-blue-800 border-blue-300',
  }
  return (
    <span className={`status-badge inline-block px-2 py-0.5 text-xs font-medium rounded border ${colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
      {children}
    </span>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  const borderColors: Record<string, string> = {
    green: 'border-green-400',
    yellow: 'border-yellow-400',
    red: 'border-red-400',
  }
  return (
    <div className={`border ${color ? borderColors[color] : 'border-gray-200'} rounded-lg p-3 bg-white`}>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
      <strong>Note:</strong> {children}
    </div>
  )
}

type FeatureRow = {
  route: string
  name: string
  status: string
  description: string
  components: string
  apis: string
}

function FeatureTable({ rows }: { rows: FeatureRow[] }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-700">
          <th className="border border-gray-200 px-2 py-1.5 w-36">Route</th>
          <th className="border border-gray-200 px-2 py-1.5 w-28">Page</th>
          <th className="border border-gray-200 px-2 py-1.5 w-20">Status</th>
          <th className="border border-gray-200 px-2 py-1.5">Description</th>
          <th className="border border-gray-200 px-2 py-1.5 w-40">Key Components</th>
          <th className="border border-gray-200 px-2 py-1.5 w-32">API Routes</th>
          <th className="border border-gray-200 px-2 py-1.5 w-16 text-center">K / R / X</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="align-top hover:bg-gray-50">
            <td className="border border-gray-200 px-2 py-1.5 font-mono text-xs text-gray-600">{row.route}</td>
            <td className="border border-gray-200 px-2 py-1.5 font-medium text-gray-900">{row.name}</td>
            <td className="border border-gray-200 px-2 py-1.5"><Badge status={row.status}>{row.status}</Badge></td>
            <td className="border border-gray-200 px-2 py-1.5 text-gray-700 text-xs">{row.description}</td>
            <td className="border border-gray-200 px-2 py-1.5 text-xs text-gray-500">{row.components}</td>
            <td className="border border-gray-200 px-2 py-1.5 text-xs text-gray-500 font-mono">{row.apis}</td>
            <td className="border border-gray-200 px-2 py-1.5 text-center">
              <div className="flex justify-center gap-1">
                <span className="w-3 h-3 border border-gray-400 inline-block" />
                <span className="w-3 h-3 border border-gray-400 inline-block" />
                <span className="w-3 h-3 border border-gray-400 inline-block" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

type ApiRow = {
  route: string
  method: string
  status: string
  description: string
}

function ApiTable({ rows }: { rows: ApiRow[] }) {
  return (
    <table className="w-full text-sm border-collapse mb-3">
      <thead>
        <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-700">
          <th className="border border-gray-200 px-2 py-1.5">Endpoint</th>
          <th className="border border-gray-200 px-2 py-1.5 w-20">Method</th>
          <th className="border border-gray-200 px-2 py-1.5 w-20">Status</th>
          <th className="border border-gray-200 px-2 py-1.5">Description</th>
          <th className="border border-gray-200 px-2 py-1.5 w-16 text-center">K / R / X</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50">
            <td className="border border-gray-200 px-2 py-1.5 font-mono text-xs">{row.route}</td>
            <td className="border border-gray-200 px-2 py-1.5 text-xs font-mono font-semibold">{row.method}</td>
            <td className="border border-gray-200 px-2 py-1.5"><Badge status={row.status}>{row.status}</Badge></td>
            <td className="border border-gray-200 px-2 py-1.5 text-xs text-gray-700">{row.description}</td>
            <td className="border border-gray-200 px-2 py-1.5 text-center">
              <div className="flex justify-center gap-1">
                <span className="w-3 h-3 border border-gray-400 inline-block" />
                <span className="w-3 h-3 border border-gray-400 inline-block" />
                <span className="w-3 h-3 border border-gray-400 inline-block" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

type DecisionRow = {
  feature: string
  status: string
  notes: string
}

function DecisionTable({ category, rows }: { category: string; rows: DecisionRow[] }) {
  return (
    <div className="mb-4 avoid-break">
      <h3 className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1.5 border border-gray-200 border-b-0 rounded-t">
        {category}
      </h3>
      <table className="w-full text-sm border-collapse mb-0">
        <thead>
          <tr className="text-left text-xs font-semibold text-gray-600">
            <th className="border border-gray-200 px-2 py-1.5 w-48">Feature</th>
            <th className="border border-gray-200 px-2 py-1.5 w-20">Status</th>
            <th className="border border-gray-200 px-2 py-1.5">Notes / Assessment</th>
            <th className="border border-gray-200 px-2 py-1.5 w-14 text-center">Keep</th>
            <th className="border border-gray-200 px-2 py-1.5 w-14 text-center">Revise</th>
            <th className="border border-gray-200 px-2 py-1.5 w-14 text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="align-top hover:bg-gray-50">
              <td className="border border-gray-200 px-2 py-1.5 font-medium text-gray-900">{row.feature}</td>
              <td className="border border-gray-200 px-2 py-1.5"><Badge status={row.status}>{row.status}</Badge></td>
              <td className="border border-gray-200 px-2 py-1.5 text-xs text-gray-700">{row.notes}</td>
              <td className="border border-gray-200 px-2 py-1.5 text-center"><span className="w-4 h-4 border border-gray-400 inline-block" /></td>
              <td className="border border-gray-200 px-2 py-1.5 text-center"><span className="w-4 h-4 border border-gray-400 inline-block" /></td>
              <td className="border border-gray-200 px-2 py-1.5 text-center"><span className="w-4 h-4 border border-gray-400 inline-block" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type Model = { name: string; fields: string; description: string }

function ModelGroup({ title, models }: { title: string; models: Model[] }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 avoid-break">
      <h3 className="font-semibold text-gray-800 text-sm mb-2">{title}</h3>
      <ul className="space-y-1.5 text-xs">
        {models.map((m, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-mono font-semibold text-purple-700 shrink-0 w-44">{m.name}</span>
            <span className="text-gray-400 shrink-0">({m.fields})</span>
            <span className="text-gray-600">{m.description}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function IssueItem({ severity, title, children }: { severity: string; title: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    high: 'border-l-red-500 bg-red-50',
    medium: 'border-l-yellow-500 bg-yellow-50',
    low: 'border-l-blue-500 bg-blue-50',
  }
  const labels: Record<string, string> = {
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
  }
  return (
    <div className={`border-l-4 ${colors[severity]} p-3 rounded-r-lg`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
          severity === 'high' ? 'bg-red-200 text-red-800' :
          severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
          'bg-blue-200 text-blue-800'
        }`}>{labels[severity]}</span>
        <span className="font-semibold text-gray-900">{title}</span>
      </div>
      <p className="text-gray-700 text-xs">{children}</p>
    </div>
  )
}
