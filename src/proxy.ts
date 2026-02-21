import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic in-memory rate limiting map for basic DDOS protection.
// Note: In serverless applications (like Vercel Edge), this is ephemeral and local per-isolate.
// For production scale, it's recommended to back this with Upstash Redis or Vercel KV.
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_COUNT = 100; // max requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window

export function proxy(request: NextRequest) {
    // 1. IP Rate Limiting Simulation
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const limiter = rateLimitMap.get(ip);

    if (ip !== 'unknown') {
        if (limiter && now - limiter.timestamp < RATE_LIMIT_WINDOW) {
            limiter.count++;
            if (limiter.count > RATE_LIMIT_COUNT) {
                return new NextResponse(
                    JSON.stringify({ error: 'Too Many Requests from this IP' }),
                    { status: 429, headers: { 'content-type': 'application/json' } }
                );
            }
        } else {
            rateLimitMap.set(ip, { count: 1, timestamp: now });
        }
    }

    // 2. Anti-CSRF Validation for Mutation Methods
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const origin = request.headers.get('origin');
        const host = request.headers.get('host');

        // Reject mutations that originate from strange or external domains.
        if (origin && host) {
            try {
                const originUrl = new URL(origin);
                if (originUrl.host !== host) {
                    return new NextResponse(
                        JSON.stringify({ error: 'CSRF Violation: Origin does not match Host' }),
                        { status: 403, headers: { 'content-type': 'application/json' } }
                    );
                }
            } catch (err) {
                return new NextResponse(
                    JSON.stringify({ error: 'Bad Request: Invalid Origin' }),
                    { status: 400, headers: { 'content-type': 'application/json' } }
                );
            }
        }
    }

    const response = NextResponse.next();
    return response;
}

export const config = {
    // Apply the middleware to all routes except Next.js internals and static files
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
