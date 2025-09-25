import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/demo(.*)',
  '/test(.*)',
  '/devops(.*)',  // DevOps dashboard - no auth required
])

// Define routes that require organization selection
const isOrgProtectedRoute = createRouteMatcher([
  '/files(.*)',
  '/tasks(.*)',
  '/calendar(.*)',
  '/video(.*)',
  '/activity(.*)',
  '/lisa(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth()

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Redirect to sign-in if not authenticated
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // For organization-protected routes, ensure user has selected an org
  if (isOrgProtectedRoute(req) && !orgId) {
    const orgSelectionUrl = new URL('/org-selection', req.url)
    orgSelectionUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(orgSelectionUrl)
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