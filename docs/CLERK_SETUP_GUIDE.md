# Clerk Setup Guide - Multi-Tenant Authentication

This guide will walk you through setting up Clerk for Peak AI's multi-tenant authentication system.

## Why Clerk?

Clerk provides:
- **Built-in Organizations** (perfect for multi-tenancy)
- **Pre-built UI components** (SignIn, SignUp, UserButton, OrganizationSwitcher)
- **Member invitations** with email
- **Role-based access control** (admin, member, custom roles)
- **Session management** and JWT handling
- **OAuth integrations** (Google, Microsoft, GitHub, etc.)
- **MFA/2FA** support
- **SOC 2 Type II certified** security

**Cost**: Free for up to 5,000 monthly active users

## Step 1: Create a Clerk Account

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Sign up with your email or GitHub account
3. Create a new application
   - Name: "Peak AI" (or your preferred name)
   - Choose your authentication options (Email, Google, etc.)
   - Click "Create application"

## Step 2: Get Your API Keys

1. In the Clerk Dashboard, go to **API Keys**
2. You'll see two keys:
   - **Publishable Key** (starts with `pk_test_...`)
   - **Secret Key** (starts with `sk_test_...`) - Keep this secure!

3. Copy these keys and add them to your `.env.local` file:

```bash
# Replace the placeholder values in .env.local with your actual keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_key_here
```

## Step 3: Enable Organizations

**This is critical for multi-tenancy!**

1. In Clerk Dashboard, go to **Configure** → **Organizations**
2. Toggle **Enable organizations** to ON
3. Configure organization settings:
   - ✅ Enable organization creation
   - ✅ Allow users to create organizations
   - ✅ Enable member invitations
   - Set **Maximum number of organizations per user**: 10 (or your preference)
   - Set **Maximum number of members per organization**: 50 (or your preference)

4. Configure organization roles:
   - Keep default roles: `admin` and `basic_member`
   - Or create custom roles based on your needs

5. Save settings

## Step 4: Configure Sign-in and Sign-up Pages

1. In Clerk Dashboard, go to **Paths**
2. Set the following paths:
   - **Sign in path**: `/sign-in`
   - **Sign up path**: `/sign-up`
   - **After sign in**: `/files`
   - **After sign up**: `/files`

3. These paths are already configured in your `.env.local` file:

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/files
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/files
```

## Step 5: Configure Authentication Methods

1. In Clerk Dashboard, go to **User & Authentication** → **Email, Phone, Username**
2. Choose your authentication methods:
   - ✅ Email address (recommended)
   - ✅ Username (optional)
   - ✅ Phone number (optional)

3. Go to **Social Connections** to enable OAuth providers:
   - ✅ Google (recommended for business users)
   - ✅ Microsoft (for enterprise customers)
   - GitHub, LinkedIn, etc. (optional)

4. For each OAuth provider:
   - Click "Configure"
   - Follow the instructions to create OAuth credentials
   - Add the credentials to Clerk

## Step 6: Customize Appearance (Optional)

The application already has custom theming configured in `app/layout.tsx`, but you can customize further:

1. In Clerk Dashboard, go to **Customization** → **Theme**
2. Customize colors, fonts, and layout
3. Or keep the default theme (the app applies custom styling via code)

## Step 7: Test the Setup

1. Restart your development server:
```bash
npm run dev
```

2. Navigate to [http://localhost:3000](http://localhost:3000)

3. You should see:
   - Clerk authentication is active
   - Sign in/Sign up buttons work
   - Organization Switcher appears in the navigation
   - User profile button is functional

4. Test the flow:
   - Sign up for a new account
   - Create an organization (or select personal account)
   - Verify you're redirected to `/files`
   - Try switching organizations using the OrganizationSwitcher
   - Check that the user profile menu works

## Step 8: Verify Multi-Tenant Isolation

Test that tenant isolation is working:

1. Create a test organization
2. Use the Peak AI chat and upload a file
3. Switch to a different organization
4. Verify you can't see the previous organization's data

The middleware in `middleware.ts` ensures:
- All routes require authentication (except public routes)
- Organization-specific routes require an active organization
- API routes receive the correct `userId` and `orgId`

## Step 9: Deploy to Production

When ready to deploy:

1. **Create a production Clerk app**:
   - Go to Clerk Dashboard → Create new application
   - Choose "Production" environment
   - Get new production API keys (start with `pk_live_...` and `sk_live_...`)

2. **Add production keys to Vercel**:
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_your_key`
     - `CLERK_SECRET_KEY` = `sk_live_your_key`
   - Deploy!

3. **Configure production domain**:
   - In Clerk Dashboard → Production app → Settings → Domains
   - Add your production domain (e.g., `app.peakai.com`)
   - Verify the domain

## Troubleshooting

### Issue: "Clerk publishable key not found"

**Solution**: Check that your `.env.local` file has the correct keys and restart the dev server.

### Issue: "Organizations not appearing"

**Solution**:
1. Verify Organizations are enabled in Clerk Dashboard → Configure → Organizations
2. Ensure `hidePersonal={false}` in OrganizationSwitcher component
3. Try creating a new organization from the UI

### Issue: "Sign in redirects to wrong page"

**Solution**: Check the redirect URLs in `.env.local` match your Clerk Dashboard settings.

### Issue: "User can't access files/meetings/etc."

**Solution**: User needs to select an organization. The middleware redirects to `/select-organization` if no org is selected.

## Next Steps

Now that Clerk is configured:

1. ✅ **Multi-tenant authentication** is working
2. ✅ **Organization management** is handled by Clerk
3. ✅ **API routes** receive `userId` and `orgId` automatically
4. ✅ **RAG system** uses `orgId` for tenant isolation

Next features to implement:
- Custom organization onboarding flow
- Billing integration (Stripe + Clerk metadata)
- Advanced RBAC with custom permissions
- Clerk webhooks for syncing user data to your database

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Organizations Guide](https://clerk.com/docs/organizations/overview)
- [Clerk Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk API Reference](https://clerk.com/docs/reference/backend-api)

## Support

- Clerk Support: support@clerk.com
- Clerk Discord: [Join here](https://clerk.com/discord)
- Internal docs: See `docs/CLERK_VS_CUSTOM_AUTH.md` for decision rationale
