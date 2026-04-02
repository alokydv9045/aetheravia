import { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a single Upstash Redis instance (reuse across requests)
const redis = Redis.fromEnv();

// Configure a rate limiter: 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 s'),
  analytics: true,
});

export async function rateLimit(request: NextRequest) {
  // Use IP address as the identifier
  const ip =
    request.ip ||
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    '127.0.0.1';
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);
  return { success, limit, remaining, reset };
}
