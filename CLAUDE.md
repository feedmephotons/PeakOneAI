# SaaSX Platform - Claude Development Notes

## Project Overview
AI-integrated communication and productivity platform combining messaging, video conferencing, AI assistant, project management, and cloud storage. Features an Apple-inspired design with "Lisa" AI assistant as the core differentiator.

## GitHub Configuration
- Repository: https://github.com/feedmephotons/PeakOneAI
- Username: feedmephotons
- Email: folx2.0@gmail.com
- PAT: ghp_uwZ1pTkHlux

## Supabase Configuration
- Project ID: yqegnqhxnpfgvpsgvhrj
- Project URL: https://yqegnqhxnpfgvpsgvhrj.supabase.co
- Database Host: aws-1-us-east-2.pooler.supabase.com
- Database Port: 5432
- Database Name: postgres
- Database User: postgres.yqegnqhxnpfgvpsgvhrj

## Environment Variables (Already in Vercel)
- NEXT_PUBLIC_SUPABASE_URL: https://yqegnqhxnpfgvpsgvhrj.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY: (set in Vercel)
- SUPABASE_SERVICE_ROLE_KEY: (needs to be added to Vercel)
- DATABASE_URL: (needs password added)
- OPENAI_API_KEY: (needs to be added)

## Key Features Implemented
1. **Authentication System** - Supabase Auth with login/register pages
2. **Database Schema** - Complete Prisma schema with 20+ models
3. **AI Integration** - Lisa AI assistant with OpenAI GPT-4
4. **File Storage** - Supabase Storage with AI analysis
5. **API Routes** - Complete REST API structure

## Tech Stack
- **Frontend**: Next.js 15.5.3, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **AI**: OpenAI GPT-4
- **Real-time**: Socket.io (ready to implement)

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
- Service role key for Vercel env: Use SUPABASE_SERVICE_ROLE_KEY as the key name
- Database password needs to be added to DATABASE_URL in .env.local and Vercel
- OpenAI API key needs to be obtained and added
- .env.local is gitignored for security

## DevOps Dashboard
- URL: `/devops` (no authentication required)
- Purpose: Internal development tracking and client feedback
- Features: Kanban board for feature requests, bugs, revisions
- Data: Stored in localStorage (no database needed)
- **IMPORTANT**: Update the completed features list in `/app/devops/page.tsx` as new features are added