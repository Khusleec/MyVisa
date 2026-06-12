import { NextResponse } from 'next/server';

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

// Simple in-memory cache store. Note: for production serverless deployments (Vercel),
// a database or Redis-based store (e.g., Upstash Redis) is recommended.
const memoryStore = new Map<string, RateLimitTracker>();
const MAX_STORE_ENTRIES = 10_000;

function pruneExpiredEntries(now: number) {
  if (memoryStore.size <= MAX_STORE_ENTRIES) return;
  for (const [key, tracker] of memoryStore) {
    if (now > tracker.resetTime) {
      memoryStore.delete(key);
    }
  }
}

export function checkRateLimit(ip: string, limit: number, durationMs: number) {
  const now = Date.now();
  pruneExpiredEntries(now);
  const tracker = memoryStore.get(ip) || { count: 0, resetTime: now + durationMs };

  if (now > tracker.resetTime) {
    tracker.count = 1;
    tracker.resetTime = now + durationMs;
  } else {
    tracker.count++;
  }

  memoryStore.set(ip, tracker);

  const remaining = Math.max(0, limit - tracker.count);
  const isBlocked = tracker.count > limit;

  return {
    isBlocked,
    limit,
    remaining,
    resetTime: tracker.resetTime,
  };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

export function handleRateLimitResponse(limitData: ReturnType<typeof checkRateLimit>) {
  const headers = {
    'X-RateLimit-Limit': String(limitData.limit),
    'X-RateLimit-Remaining': String(limitData.remaining),
    'X-RateLimit-Reset': String(limitData.resetTime),
  };

  if (limitData.isBlocked) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers }
    );
  }

  return { headers };
}
