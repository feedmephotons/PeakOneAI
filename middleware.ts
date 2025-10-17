import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/about',
  '/pricing',
  '/api/webhooks(.*)',
])

// Define routes that require organization membership
const isOrgRoute = createRouteMatcher([
  '/files(.*)',
  '/meetings(.*)',
  '/tasks(.*)',
  '/chat(.*)',
  '/api/ai(.*)',
  '/api/files(.*)',
  '/api/meetings(.*)',
  '/api/tasks(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Get auth info
  const { userId, orgId } = await auth()

  // Protect all other routes - require authentication
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // For organization-specific routes, ensure user has selected an organization
  if (isOrgRoute(req) && !orgId) {
    // Redirect to organization selection page
    const orgSelectUrl = new URL('/select-organization', req.url)
    orgSelectUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(orgSelectUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}