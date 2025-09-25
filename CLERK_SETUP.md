# Clerk Setup Guide for SaasX Platform

## 1. Create Clerk Account
1. Go to https://clerk.com
2. Sign up for a free account
3. Create a new application called "SaasX Platform"

## 2. Get Your API Keys
In the Clerk Dashboard:
1. Go to **API Keys** in the left sidebar
2. Copy these values:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

## 3. Configure Authentication Methods
1. Go to **User & Authentication** > **Email, Phone, Username**
2. Enable:
   - ✅ Email address
   - ✅ Password
   - ✅ Email verification code

## 4. Set Up Social Login (Google OAuth)
1. Go to **User & Authentication** > **Social Connections**
2. Click **Google**
3. Toggle it ON
4. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. Click **Save**

## 5. Enable Organizations (Multi-tenancy)
1. Go to **Organizations** in the left sidebar
2. Click **Enable organizations**
3. Configure:
   - ✅ Allow users to create organizations
   - ✅ Allow users to delete organizations
   - ✅ Enable organization invitations
   - Set **Maximum memberships per user**: 10
   - Set **Maximum invitations per organization**: 100

## 6. Configure Roles & Permissions
1. In **Organizations** > **Roles**
2. Create these roles:
   - **Owner**: Can manage everything
   - **Admin**: Can manage members and settings
   - **Member**: Can access all features
   - **Viewer**: Read-only access

## 7. Set Up Webhooks (For Database Sync)
1. Go to **Webhooks** in the left sidebar
2. Click **Add Endpoint**
3. Set URL: `https://your-domain.vercel.app/api/webhooks/clerk`
4. Select events:
   - ✅ user.created
   - ✅ user.updated
   - ✅ organization.created
   - ✅ organization.updated
   - ✅ organizationMembership.created
   - ✅ organizationMembership.deleted
5. Copy the **Webhook Secret** (starts with `whsec_`)

## 8. Configure Session Settings
1. Go to **Sessions**
2. Set:
   - **Inactivity timeout**: 30 days
   - **Maximum lifetime**: 90 days

## 9. Customize Appearance (Optional)
1. Go to **Customization** > **Theme**
2. Set brand colors:
   - Primary: `#6B46C1` (Purple)
   - Accent: `#3B82F6` (Blue)

## 10. Environment Variables
Add these to your `.env.local` file:

```bash
# Clerk Core
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/files
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Webhook Secret (for database sync)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 11. Deploy to Vercel
Add the same environment variables to your Vercel project:
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add all the Clerk variables

## 12. Test the Integration
1. Sign up for a new account
2. Create an organization
3. Invite team members
4. Check that data syncs to your database

## Production Checklist
- [ ] Switch to production Clerk instance
- [ ] Update API keys (from `test` to `live`)
- [ ] Update webhook URL to production domain
- [ ] Enable email verification
- [ ] Set up custom domain (optional)
- [ ] Configure rate limiting
- [ ] Enable 2FA for organization owners

## Support
- Clerk Documentation: https://clerk.com/docs
- Clerk Discord: https://discord.com/invite/b5rXHjAg7A
- Support Email: support@clerk.com