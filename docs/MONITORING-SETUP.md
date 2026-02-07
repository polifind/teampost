# Monitoring & Production Setup Guide

This guide covers setting up free monitoring tools for TeamPost.

## 1. Sentry Error Monitoring (Free: 5K errors/month)

### Setup
1. Create account at https://sentry.io
2. Create a new Next.js project
3. Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   SENTRY_ORG=your-org-slug
   SENTRY_PROJECT=teampost
   SENTRY_AUTH_TOKEN=sntrys_xxx (from Settings > Auth Tokens)
   ```

### What It Monitors
- Runtime JavaScript errors
- API route failures
- Unhandled promise rejections
- Performance issues

## 2. Upstash Rate Limiting (Free: 10K requests/day)

### Setup
1. Create account at https://upstash.com
2. Create a new Redis database (choose closest region)
3. Add to Vercel environment variables:
   ```
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=xxx
   ```

### Rate Limits Configured
- **API routes**: 60 requests/minute
- **AI generation**: 10 requests/minute
- **Auth**: 5 attempts/minute
- **Slack webhooks**: 100/minute

### Usage in API Routes
```typescript
import { withRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rateLimited = await withRateLimit(request, "api");
  if (rateLimited) return rateLimited;
  // ... rest of handler
}
```

## 3. Vercel Analytics (Free)

### Setup
1. Go to Vercel Dashboard > Your Project > Analytics
2. Click "Enable" - that's it!

Already integrated in the app via `@vercel/analytics`.

## 4. Vercel Speed Insights (Free)

### Setup
1. Go to Vercel Dashboard > Your Project > Speed Insights
2. Click "Enable"

Already integrated via `@vercel/speed-insights`.

## 5. Uptime Monitoring - BetterStack (Free: 5 monitors)

### Setup
1. Create account at https://betterstack.com/uptime
2. Add monitor for `https://teampost.ai`
3. Set check interval to 3 minutes
4. Add email/Slack alerts

### Recommended Monitors
- `https://teampost.ai` - Landing page
- `https://teampost.ai/api/health` - API health (you can create this)

## 6. Input Validation with Zod

Already set up in `src/lib/validations.ts`. Use in API routes:

```typescript
import { validateRequest, postSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = validateRequest(postSchema, body);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const { content, imageUrl } = result.data;
  // ... safe to use validated data
}
```

## Environment Variables Summary

Add these to Vercel (Settings > Environment Variables):

| Variable | Required | Source |
|----------|----------|--------|
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Sentry |
| `SENTRY_ORG` | Optional | Sentry |
| `SENTRY_PROJECT` | Optional | Sentry |
| `SENTRY_AUTH_TOKEN` | Optional | Sentry |
| `UPSTASH_REDIS_REST_URL` | Optional | Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Upstash |

All monitoring is optional - the app works without these variables.
