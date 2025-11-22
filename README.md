# PeakOne AI Platform - AI-Powered Communication & Productivity Suite

A comprehensive SaaS platform combining communication tools, AI assistance, project management, and cloud storage - powered by Google Gemini 2.5 for cutting-edge AI capabilities.

## Key Features

### AI Assistant - Lisa (Powered by Gemini 2.5)
- Real-time meeting transcription with native audio understanding
- Automatic action item extraction
- Meeting summaries and key takeaways
- Document and image analysis
- Context-aware chat with RAG support
- Multi-modal understanding (text, audio, images)

### Video Conferencing
- HD video calls with Daily.co integration
- Multi-party rooms with up to 50 participants
- Real-time AI transcription during calls
- Automatic meeting notes and summaries
- Recording support with AI analysis

### Task Management
- Kanban boards with drag-and-drop
- Priority levels (Low, Medium, High, Urgent)
- Tags and filtering
- Bulk operations
- AI-powered task suggestions
- Automation rules
- Templates for recurring tasks

### File Management
- Cloud storage with Supabase
- AI-powered file analysis and tagging
- Image analysis with Gemini Vision
- Smart organization and search

### Communication
- Direct messaging
- Group channels
- Real-time notifications

## Tech Stack

- **Framework**: Next.js 15.5 with App Router
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI**: Google Gemini 2.5 (Chat, Vision, Audio)
- **Video**: Daily.co WebRTC
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: Clerk (multi-tenant)
- **Storage**: Supabase Storage
- **Real-time**: Socket.io

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Gemini API key (from Google AI Studio)
- Daily.co API key (for video calls)
- Clerk account (for authentication)
- Supabase project (for database/storage)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/feedmephotons/PeakOneAI.git
cd PeakOneAI
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment template:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
   - `GEMINI_API_KEY` - Get from https://aistudio.google.com/app/apikey
   - `DAILY_API_KEY` - Get from https://dashboard.daily.co
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Get from Clerk dashboard
   - `CLERK_SECRET_KEY` - Get from Clerk dashboard
   - Database credentials from Supabase

5. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3001](http://localhost:3001) in your browser

## AI Features (Gemini 2.5)

### Chat with Lisa AI
The Lisa AI assistant uses Gemini 2.5 Flash for fast, intelligent responses:
- Context-aware conversations
- RAG integration for organization knowledge base
- File and image analysis
- Meeting insights

### Voice Transcription
Native audio understanding with Gemini 2.5:
- Real-time meeting transcription
- Action item detection
- Multi-language support
- No separate Whisper API needed

### Document Analysis
Gemini 2.5 analyzes uploaded documents:
- Automatic summarization
- Tag suggestions
- Key insight extraction
- OCR for images

## Project Structure

```
PeakOneAI/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   │   ├── ai/chat/       # AI chat endpoint
│   │   ├── transcribe/    # Audio transcription
│   │   ├── video/         # Video room management
│   │   └── meetings/      # Meeting analysis
│   ├── video/             # Video conferencing
│   ├── tasks/             # Task management
│   ├── files/             # File management
│   ├── lisa/              # AI assistant
│   └── ...
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── gemini.ts         # Gemini AI client
│   ├── meeting-analyzer.ts # Meeting analysis
│   └── rag/              # RAG service
├── prisma/               # Database schema
└── docs/                 # Documentation
```

## Environment Variables

See `.env.example` for all required variables:

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |
| `DAILY_API_KEY` | Daily.co API key for video |
| `NEXT_PUBLIC_CLERK_*` | Clerk authentication |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_*` | Supabase configuration |

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Demo Features

For investor demos, these features are fully functional:
- Video calls with AI transcription
- Task management with Kanban boards
- File upload with AI analysis
- Lisa AI chat assistant

## License

Private - Peak One AI

## Support

For support or questions about the PeakOne AI platform, please contact the development team.
