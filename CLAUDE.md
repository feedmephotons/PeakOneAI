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

## Environment Variables
Copy these to your `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yqegnqhxnpfgvpsgvhrj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxZWducWh4bnBmZ3Zwc2d2aHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MDczMjUsImV4cCI6MjA3Mzk4MzMyNX0.NROp6qacltdzaYlD3qR9jGpn4tBccempiaRCKLvJhNE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxZWducWh4bnBmZ3Zwc2d2aHJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQwNzMyNSwiZXhwIjoyMDczOTgzMzI1fQ.Zt9ocg5V-aPJ8mUQifLvlG6lTCrzCCunZ0tpUi0i0lI

# Database (Prisma)
DATABASE_URL=postgresql://postgres.yqegnqhxnpfgvpsgvhrj:wouldntyouliketoknow12!@aws-1-us-east-2.pooler.supabase.com:5432/postgres

# Google Gemini AI
GEMINI_API_KEY=AIzaSyAZustE1i_CXFUUvhBDYYEKZasqlT3BIkQ

# Daily.co Video
DAILY_API_KEY=a85da5619972c12811c2d03516efc2a979b952a5a4a61457eada19ea24d7e832

# OpenAI (legacy - ask partner for key if needed)
# OPENAI_API_KEY=your_openai_key_here

# Clerk Auth
CLERK_SECRET_KEY=sk_test_NBC1kZS8uyqWE7KJQ032UpuJxzcWziDJSywY68FIEE

# App URL (change for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

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
