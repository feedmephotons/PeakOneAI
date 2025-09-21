# SaasX Platform Setup Instructions

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Supabase provides this)
- OpenAI API key
- Supabase account

## Setup Steps

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Save your project URL and anon key
4. Go to Settings > Database and copy the connection string

### 2. Configure Environment Variables

Update the `.env.local` file with your actual values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (for Prisma) - from Supabase dashboard
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Socket.io (for future real-time features)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 3. Set up Supabase Storage

1. In Supabase dashboard, go to Storage
2. Create a new bucket called "files"
3. Set it to public (or configure RLS policies)

### 4. Initialize Database with Prisma

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Optional: Open Prisma Studio to view your database
npx prisma studio
```

### 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Key Features Implemented

### ✅ Foundation
- Database schema with Prisma
- Supabase authentication
- API route structure
- Authentication middleware

### ✅ AI Integration
- OpenAI integration for Lisa
- Chat API with streaming responses
- File analysis with AI
- Image analysis capabilities

### ✅ File Management
- File upload to Supabase Storage
- AI-powered file analysis
- Automatic tagging and summarization
- Version tracking support

### ✅ Authentication
- Login/Register pages
- Protected routes
- Session management

## Next Steps to Implement

### 1. Real-time Features
- Socket.io server setup
- Live chat messaging
- Real-time notifications
- Presence indicators

### 2. Video/Phone Calls
- WebRTC integration (Daily.co/Agora)
- Twilio for phone calls
- Call recording and transcription

### 3. Task Management
- Drag-and-drop Kanban boards
- AI task suggestions
- Project timelines

### 4. Calendar
- Event creation and management
- Google/Outlook sync
- Smart scheduling with Lisa

### 5. Enhanced UI Components
- File preview modal
- Rich text editor
- Video player
- Audio player

## Testing the Current Implementation

### 1. Test Authentication
- Go to `/auth/register` to create an account
- Go to `/auth/login` to sign in
- Protected routes will redirect to login if not authenticated

### 2. Test File Upload with AI (via API)
```bash
# Upload a file with AI analysis
curl -X POST http://localhost:3000/api/files/upload-with-ai \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/file.pdf" \
  -F "workspaceId=workspace123" \
  -F "folderId=folder456"
```

### 3. Test AI Chat (via API)
```bash
# Send a message to Lisa
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Hello Lisa, how can you help me today?"}'
```

## Troubleshooting

### Database Connection Issues
- Ensure your DATABASE_URL is correct
- Check if Supabase project is active
- Verify network connectivity

### Authentication Issues
- Check Supabase Auth settings
- Ensure email confirmations are configured
- Verify redirect URLs in Supabase dashboard

### File Upload Issues
- Check Supabase Storage bucket exists
- Verify bucket permissions
- Ensure file size limits are configured

### AI Features Not Working
- Verify OpenAI API key is valid
- Check API rate limits
- Ensure proper error handling

## Production Deployment

1. Set up environment variables in your hosting platform
2. Run database migrations
3. Configure custom domain
4. Set up SSL certificates
5. Configure rate limiting
6. Set up monitoring and logging
7. Configure backup strategies

## Support

For issues or questions:
- Check Supabase documentation
- Review Prisma documentation
- Check Next.js documentation
- Review OpenAI API documentation