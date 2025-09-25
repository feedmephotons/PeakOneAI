import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple middleware that allows all routes when Clerk is not configured
export default function middleware(req: NextRequest) {
  // For now, allow all routes since Clerk is not configured
  // When Clerk is set up, this file will need to be updated with proper auth middleware
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}