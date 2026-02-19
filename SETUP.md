# Peak One Platform Setup Guide

Complete setup instructions for all services and integrations.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Add your API keys to .env.local (see below)

# 4. Run database migrations
npx prisma db push

# 5. Start development server
npm run dev
```

Server will be running at **http://localhost:3001**

---

## Required Services

### 1. Clerk Authentication (REQUIRED)

**Sign up**: https://dashboard.clerk.com

**Steps:**
1. Create a new application
2. Go to **API Keys** section
3. Copy these keys to `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   ```

**Test it:**
- Go to http://localhost:3001/sign-in
- You should see Clerk's sign-in page

---

### 2. Google Gemini API (REQUIRED for AI features)

**Sign up**: https://aistudio.google.com

**Steps:**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API key"
3. Copy the key to `.env.local`:
   ```
   GEMINI_API_KEY=your-gemini-api-key
   ```

**What it's used for:**
- Real-time meeting transcription (Gemini 2.5 native audio)
- Action item detection (Gemini 2.5)
- Meeting summaries (Gemini 2.5)
- Lisa AI assistant (Gemini 2.5 Flash)
- Document and image analysis (Gemini Vision)

**Cost estimate:**
- Gemini 2.5 Flash: Very cost-effective
- Typical hour-long meeting: ~$0.10-0.50
- Much cheaper than OpenAI alternatives

**Test it:**
1. Start a video call at http://localhost:3001/video/room/test
2. Click the AI assistant button
3. Speak into your microphone
4. Watch for real-time transcripts

---

### 3. Daily.co Video (REQUIRED for multi-party calls)

**Sign up**: https://dashboard.daily.co

**Steps:**
1. Create a new account
2. Go to **Developers** -> **API Keys**
3. Copy your API key to `.env.local`:
   ```
   DAILY_API_KEY=xxxxx
   ```

**Free tier:**
- 10,000 minutes/month FREE
- Up to 20 participants per call
- Perfect for demos and small teams

**Test it:**
1. Make sure Daily API key is in `.env.local`
2. Go to http://localhost:3001/video/room/test
3. Open in another browser/incognito window
4. Both users should see each other!

**Note:** If you skip this step, local video will still work but you won't see other participants.

---

### 4. Database (Already configured)

Your Supabase PostgreSQL is already set up:
- **Host**: `aws-1-us-east-2.pooler.supabase.com`
- **Database**: `postgres`
- **User**: `postgres.yqegnqhxnpfgvpsgvhrj`

**You need to add the password:**

1. Get password from Supabase dashboard
2. Update `.env.local`:
   ```
   DATABASE_URL=postgresql://postgres.yqegnqhxnpfgvpsgvhrj:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
   ```

3. Run migrations:
   ```bash
   npx prisma db push
   ```

---

## Complete .env.local Template

```env
# Clerk (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Database (REQUIRED)
DATABASE_URL=postgresql://postgres.yqegnqhxnpfgvpsgvhrj:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.yqegnqhxnpfgvpsgvhrj:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yqegnqhxnpfgvpsgvhrj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini (REQUIRED for AI)
GEMINI_API_KEY=your-gemini-api-key

# Daily.co (REQUIRED for multi-party video)
DAILY_API_KEY=xxxxx

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development

# Suppress Sentry warning
SENTRY_SUPPRESS_INSTRUMENTATION_FILE_WARNING=1
```

---

## Testing the AI Meeting Assistant

### Local Demo (No Daily.co needed)

1. **Start the server**: `npm run dev`
2. **Go to video call**: http://localhost:3001/video/room/demo
3. **Enable AI widget**: Click the purple AI button
4. **Speak into your mic**: Say things like:
   - "John needs to send the proposal by Friday"
   - "We should follow up with the client next week"
   - "I'll review the budget tomorrow"

5. **Watch the magic**:
   - Real-time transcripts appear (powered by Gemini 2.5)
   - Action items auto-detected
   - Click "Add to Task Board" to create tasks

### Multi-Party Demo (Daily.co required)

1. **Add Daily API key** to `.env.local`
2. **Start meeting**: http://localhost:3001/video/room/client-demo
3. **Join from another device**: Open same URL on phone/tablet
4. **Both see**:
   - Each other's video
   - Same real-time transcripts
   - Same action items
   - Synchronized experience!

---

## Troubleshooting

### "Unauthorized" errors
**Fix**: Make sure Clerk keys are in `.env.local` and restart server

### "Daily.co API key not configured"
**Fix**: Add `DAILY_API_KEY` to `.env.local`

### Transcription not working
**Check**:
1. Gemini API key is correct
2. Microphone permissions granted
3. Check browser console for errors

### Video not working
**Check**:
1. Browser permissions for camera/microphone
2. Using HTTPS or localhost (required for WebRTC)
3. Daily API key is correct (for multi-party)

### Port 3001 already in use
```bash
# Kill the process
lsof -ti:3001 | xargs kill -9

# Start again
npm run dev
```

---

## Demo Script for Investors

**"Let me show you our AI Meeting Assistant..."**

1. **Start meeting**: "This is our video call interface"
2. **Enable AI**: "Click this purple button to activate Lisa AI"
3. **Talk naturally**: *Say action items aloud*
4. **Show transcripts**: "Watch - it transcribes in real-time using Gemini 2.5"
5. **Show action items**: "The AI automatically detects tasks"
6. **Create task**: "One click to add to your project board"
7. **Show search**: "After the meeting, searchable transcripts"

**Key talking points:**
- Powered by Google Gemini 2.5 - latest AI technology
- Native audio understanding - no separate transcription service needed
- Real-time action item detection
- Integrated task management
- Multi-tenant architecture ready for enterprise

---

## What You Get

### Working Features

- **Authentication**: Full Clerk integration with sign-in/sign-up
- **Local Video**: Camera, mic, screen sharing works immediately
- **Multi-Party Video**: Real WebRTC calls with Daily.co
- **AI Transcription**: Gemini 2.5 native audio every 5 seconds
- **Action Item Detection**: Automatic task extraction
- **One-Click Task Creation**: Directly to your Kanban board
- **Searchable Transcripts**: Full-text search with highlighting
- **Meeting Summaries**: AI-generated after each call
- **Lisa AI Chat**: Context-aware assistant
- **File Analysis**: AI-powered document understanding
- **Task Management**: Full Kanban with automation

### Coming Soon (if needed)

- Meeting recording
- Calendar integration
- Email notifications for action items
- Export to PDF/Word
- Integration with Slack/Teams

---

## Support

**Issues?** Check the logs:
```bash
# Server logs
npm run dev

# Browser console
F12 -> Console tab
```

**Still stuck?** Create an issue at:
https://github.com/feedmephotons/PeakOneAI/issues

---

## Production Deployment

When ready to deploy:

1. **Set production env vars** in Vercel/hosting platform
2. **Update URLs**:
   ```
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```
3. **Update Clerk**:
   - Add production domain to Clerk dashboard
   - Use production keys
4. **Daily.co**:
   - Production rooms auto-delete after use
   - Monitor usage in Dashboard
5. **Gemini API**:
   - Consider Vertex AI for enterprise features
   - Set up billing alerts

---

**You're all set!**

Start with local testing, add Daily.co when ready for multi-party, and you'll have a production-ready AI meeting platform powered by Google Gemini 2.5!
