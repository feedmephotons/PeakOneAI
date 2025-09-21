# Vercel Environment Variables Setup

## Required Environment Variables for Vercel

Add these to your Vercel project settings under Settings > Environment Variables:

### 1. Supabase Variables (Already Added)
✅ **NEXT_PUBLIC_SUPABASE_URL**
```
https://yqegnqhxnpfgvpsgvhrj.supabase.co
```

✅ **NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxZWducWh4bnBmZ3Zwc2d2aHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MDczMjUsImV4cCI6MjA3Mzk4MzMyNX0.NROp6qacltdzaYlD3qR9jGpn4tBccempiaRCKLvJhNE
```

### 2. Service Role Key (Need to Add)
❗ **SUPABASE_SERVICE_ROLE_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxZWducWh4bnBmZ3Zwc2d2aHJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQwNzMyNSwiZXhwIjoyMDczOTgzMzI1fQ.Zt9ocg5V-aPJ8mUQifLvlG6lTCrzCCunZ0tpUi0i0lI
```

### 3. Database URL (Need Password)
❗ **DATABASE_URL**
```
postgresql://postgres.yqegnqhxnpfgvpsgvhrj:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres
```
⚠️ Replace `[YOUR-PASSWORD]` with your actual Supabase database password

### 4. OpenAI API Key (Need to Add)
❗ **OPENAI_API_KEY**
```
sk-... (your OpenAI API key)
```
Get from: https://platform.openai.com/api-keys

### 5. App URL (Optional but Recommended)
**NEXT_PUBLIC_APP_URL**
```
https://your-vercel-app.vercel.app
```
Update with your actual Vercel deployment URL

## How to Add in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Navigate to "Environment Variables" in the left sidebar
4. For each variable:
   - Enter the **Key** (e.g., `SUPABASE_SERVICE_ROLE_KEY`)
   - Enter the **Value** (the actual key/token)
   - Select environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

## Important Notes

1. **Service Role Key**: This is a sensitive key with full database access. Keep it secure and never expose it client-side.

2. **Database Password**: You need to get this from your Supabase dashboard:
   - Go to Settings > Database
   - Find your database password
   - Replace `[YOUR-PASSWORD]` in the DATABASE_URL

3. **OpenAI API Key**:
   - Sign up at https://platform.openai.com if you haven't
   - Create a new API key
   - Add billing information (required for GPT-4)

4. **After adding variables**:
   - Redeploy your Vercel app for changes to take effect
   - Variables are immediately available for new deployments

## Verification

After setting up, verify everything works:

1. Check deployment logs in Vercel for any errors
2. Test authentication at `/auth/login`
3. Monitor Supabase dashboard for API activity
4. Check browser console for any client-side errors

## Security Best Practices

- ✅ Service role key should NEVER be exposed client-side
- ✅ Use NEXT_PUBLIC_ prefix only for public variables
- ✅ Database URL should never be exposed to the client
- ✅ Regularly rotate your API keys
- ✅ Use different keys for development and production when possible