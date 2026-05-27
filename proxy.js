import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const WINDOW_MS    = 60_000  // 1 minute
const MAX_REQUESTS = 60      // requests per window per IP

// In-memory rate limit store: IP → array of request timestamps within window.
// Per-instance limitation accepted for MVP — see research.md for upgrade path.
const store = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const timestamps = (store.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (timestamps.length >= MAX_REQUESTS) return true
  timestamps.push(now)
  store.set(ip, timestamps)
  return false
}

// Routes that require authentication. The booking routes don't exist yet but
// the protection pattern is established here so they're secured on creation.
const isProtected = createRouteMatcher(['/booking', '/booking/(.*)'])

export default clerkMiddleware(async (auth, request) => {
  // Protect booking routes — redirect unauthenticated users to /sign-in
  if (isProtected(request)) {
    await auth.protect()
  }

  // Rate-limit /mediators routes (IP not logged per constitution Principle I)
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/mediators')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'local'
    if (isRateLimited(ip)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': String(WINDOW_MS / 1000) },
      })
    }
  }
})

export const config = {
  matcher: [
    // Run on all routes except static files and Next.js internals
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/(.*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
