import { NextResponse } from 'next/server'

const WINDOW_MS    = 60_000  // 1 minute
const MAX_REQUESTS = 60      // requests per window per IP

// In-memory store: IP → array of request timestamps within the current window.
//
// Limitation (accepted for MVP): each Lambda/Edge instance has its own store,
// so limits are per-instance rather than global. Concurrent Lambda invocations
// could each allow MAX_REQUESTS before the user is throttled. Upgrade to
// Upstash Redis (@upstash/ratelimit) for a shared global window when traffic
// warrants it (see research.md §8 and constitution § Graduation Paths).
const store = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const timestamps = (store.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)

  if (timestamps.length >= MAX_REQUESTS) return true

  timestamps.push(now)
  store.set(ip, timestamps)
  return false
}

export function middleware(request) {
  // x-forwarded-for is set by the load balancer / CDN in production.
  // Falls back to a placeholder in local dev where the header is absent.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'local'

  if (isRateLimited(ip)) {
    // IP is not included in the response or logged — PII consideration
    // per constitution Principle I (no PII in logs/responses).
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': String(WINDOW_MS / 1000) },
    })
  }

  return NextResponse.next()
}

export const config = {
  // Only run on /mediators routes — avoids overhead on other paths.
  matcher: ['/mediators', '/mediators/:path*'],
}
