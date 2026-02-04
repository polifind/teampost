import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

/**
 * Rate Limiting with Upstash Redis
 *
 * Free tier: 10,000 requests/day
 *
 * Setup:
 * 1. Create account at https://upstash.com
 * 2. Create a Redis database
 * 3. Add to Vercel env vars:
 *    - UPSTASH_REDIS_REST_URL
 *    - UPSTASH_REDIS_REST_TOKEN
 */

// Create Redis client (only if credentials exist)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Different rate limiters for different use cases
export const rateLimiters = {
  // General API: 60 requests per minute
  api: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        analytics: true,
        prefix: "ratelimit:api",
      })
    : null,

  // AI Generation: 10 requests per minute (expensive operations)
  ai: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        analytics: true,
        prefix: "ratelimit:ai",
      })
    : null,

  // Auth: 5 attempts per minute (prevent brute force)
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        analytics: true,
        prefix: "ratelimit:auth",
      })
    : null,

  // Slack webhooks: 100 per minute
  slack: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        analytics: true,
        prefix: "ratelimit:slack",
      })
    : null,
};

export type RateLimitType = keyof typeof rateLimiters;

/**
 * Get identifier for rate limiting
 * Uses IP address or user ID if available
 */
export function getIdentifier(request: NextRequest, userId?: string): string {
  if (userId) return `user:${userId}`;

  // Get IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfIp = request.headers.get("cf-connecting-ip");

  const ip = forwarded?.split(",")[0] || realIp || cfIp || "unknown";
  return `ip:${ip}`;
}

/**
 * Check rate limit and return response if exceeded
 *
 * Usage:
 * ```ts
 * const rateLimitResponse = await checkRateLimit(request, "api");
 * if (rateLimitResponse) return rateLimitResponse;
 * ```
 */
export async function checkRateLimit(
  request: NextRequest,
  type: RateLimitType = "api",
  userId?: string
): Promise<NextResponse | null> {
  const limiter = rateLimiters[type];

  // If rate limiting is not configured, allow the request
  if (!limiter) {
    return null;
  }

  const identifier = getIdentifier(request, userId);
  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  if (!success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Please slow down and try again later",
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null;
}

/**
 * Middleware-style rate limiter for API routes
 *
 * Usage:
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const rateLimited = await withRateLimit(request, "ai");
 *   if (rateLimited) return rateLimited;
 *   // ... rest of handler
 * }
 * ```
 */
export const withRateLimit = checkRateLimit;
