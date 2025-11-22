# PeakOne AI Platform - Claude Development Notes

## Project Overview
AI-integrated communication and productivity platform combining messaging, video conferencing, AI assistant, project management, and cloud storage. Powered by Google Gemini 2.5 with "Lisa" AI assistant as the core differentiator.

## GitHub Configuration
- Repository: https://github.com/feedmephotons/PeakOneAI
- Username: feedmephotons
- Email: folx2.0@gmail.com

## Supabase Configuration
- Project ID: yqegnqhxnpfgvpsgvhrj
- Project URL: https://yqegnqhxnpfgvpsgvhrj.supabase.co
- Database Host: aws-1-us-east-2.pooler.supabase.com
- Database Port: 5432
- Database Name: postgres
- Database User: postgres.yqegnqhxnpfgvpsgvhrj

## Environment Variables (For Vercel)
- NEXT_PUBLIC_SUPABASE_URL: https://yqegnqhxnpfgvpsgvhrj.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY: (set in Vercel)
- SUPABASE_SERVICE_ROLE_KEY: (needs to be added to Vercel)
- DATABASE_URL: (needs password added)
- GEMINI_API_KEY: (needs to be added) - Get from https://aistudio.google.com/app/apikey
- DAILY_API_KEY: (for video conferencing)

## Key Features Implemented
1. **Authentication System** - Clerk multi-tenant auth with login/register pages
2. **Database Schema** - Complete Prisma schema with 20+ models
3. **AI Integration** - Lisa AI assistant with Google Gemini 2.5
4. **Voice Transcription** - Gemini 2.5 native audio understanding
5. **File Storage** - Supabase Storage with AI analysis
6. **Video Calling** - Daily.co WebRTC with AI transcription
7. **Task Management** - Kanban boards with automation
8. **API Routes** - Complete REST API structure

## Tech Stack
- **Frontend**: Next.js 15.5.3, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Auth**: Clerk (multi-tenant)
- **Storage**: Supabase Storage
- **AI**: Google Gemini 2.5 (Chat, Vision, Audio)
- **Video**: Daily.co WebRTC
- **Real-time**: Socket.io

## AI Features (Gemini 2.5)
- **lib/gemini.ts** - Core Gemini client and utilities
- **api/ai/chat** - Streaming chat with RAG support
- **api/transcribe** - Audio transcription with native Gemini audio
- **api/files/upload-with-ai** - File and image analysis
- **lib/meeting-analyzer.ts** - Action item extraction

## Development Commands
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run development server
npm run dev

# Open Prisma Studio
npx prisma studio
```

## Important Notes
- Gemini API key needs to be added to .env.local and Vercel
- Database password needs to be added to DATABASE_URL
- Daily.co API key required for multi-party video
- .env.local is gitignored for security

## DevOps Dashboard
- URL: `/devops` (no authentication required)
- Purpose: Internal development tracking and client feedback
- Features: Kanban board for feature requests, bugs, revisions
- Data: Stored in localStorage (no database needed)

## Demo Pages for Investors
- `/video/room/[id]` - Multi-party video with AI transcription
- `/tasks` - Kanban task management
- `/lisa` - AI chat assistant
- `/files` - File management with AI analysis
