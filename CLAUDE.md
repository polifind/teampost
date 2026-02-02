# TeamPost - Claude Code Memory

## Project Overview
TeamPost is a LinkedIn post scheduling and ghostwriting platform with:
- AI-powered post generation using Claude
- LinkedIn OAuth for posting
- Slack bot integration for creating posts via DM
- Organization/team features with admin roles

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with JWT strategy
- **AI**: Anthropic Claude API
- **Hosting**: Vercel
- **Storage**: Vercel Blob (for photos)

## Key Environment Variables

### Required in Vercel Production
```
# Auth (CRITICAL - must be set correctly)
NEXTAUTH_URL=https://teampost.vercel.app
NEXTAUTH_SECRET=<secure-random-string>

# Google OAuth
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=<from-linkedin-developers>
LINKEDIN_CLIENT_SECRET=<from-linkedin-developers>

# Slack Bot
SLACK_CLIENT_ID=<from-slack-api>
SLACK_CLIENT_SECRET=<from-slack-api>
SLACK_SIGNING_SECRET=<from-slack-api>

# Database
DATABASE_URL=<postgres-connection-string>

# Anthropic
ANTHROPIC_API_KEY=<api-key>

# Vercel Blob
BLOB_READ_WRITE_TOKEN=<token>
```

## OAuth Redirect URI Configuration

### Google Cloud Console
Add this exact redirect URI:
```
https://teampost.vercel.app/api/auth/callback/google
```

### LinkedIn Developer Portal
Add this exact redirect URL:
```
https://teampost.vercel.app/api/auth/callback/linkedin
```

### Slack App Settings
- **Events URL**: `https://teampost.vercel.app/api/slack/events`
- **Interactivity URL**: `https://teampost.vercel.app/api/slack/interactions`
- **Redirect URL**: `https://teampost.vercel.app/api/slack/callback`

## Common Auth Issues

### "error=Callback" on login
1. Check `NEXTAUTH_URL` is exactly `https://teampost.vercel.app` in Vercel
2. Check `NEXTAUTH_SECRET` is set in Vercel
3. Verify redirect URIs are configured in OAuth provider console
4. Ensure `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` or `LINKEDIN_CLIENT_ID`/`LINKEDIN_CLIENT_SECRET` are set in Vercel

### "error=OAuthAccountNotLinked" on login
This error occurs when NextAuth's OAuth flow fails during account linking. Understanding the flow is critical:

**CRITICAL: Prisma Adapter Version Compatibility**
- NextAuth v4.x requires `@next-auth/prisma-adapter` (NOT `@auth/prisma-adapter`)
- `@auth/prisma-adapter` v2.x is for Auth.js v5, which is NOT compatible with NextAuth v4
- If you see `OAuthAccountNotLinked` errors, verify the correct adapter is installed

**NextAuth OAuth Flow:**
1. `getUserByAccount(provider, providerAccountId)` → Finds user by OAuth account
2. If found → Signs them in (SUCCESS)
3. If NOT found → `getUserByEmail(email)` → Finds user by email
4. If user found by email AND `allowDangerousEmailAccountLinking: true` → Links account
5. If user NOT found → `createUser()` → Creates new user
6. Finally → `linkAccount()` → Creates/updates the Account record

**CRITICAL: Custom Adapter Rules**
The custom adapter in `auth.ts` relies on `allowDangerousEmailAccountLinking: true` on providers:

1. **`getUserByEmail` MUST return the real user** - Returning `null` breaks the flow by forcing NextAuth to create a new user when one already exists, causing duplicate account issues.

2. **`linkAccount` handles token updates** - It safely updates existing accounts if they exist, or creates new ones. It also handles the edge case where a user already has an account from the same provider with a different `providerAccountId`.

3. **Don't override `createUser`** - Let the default PrismaAdapter handle user creation.

**The `signIn` callback should only:**
- Store LinkedIn tokens on the User record (for posting API calls)
- Look up the existing user to set `user.id` for the JWT
- Handle auto-join organization logic

**It should NOT:**
- Create Account records (`prisma.account.create`)
- Update Account records (`prisma.account.update`)
- Return `null` from `getUserByEmail` (this breaks the flow!)

**Debug OAuth issues by checking Vercel logs for:**
- `[getUserByAccount]` - Should find existing account on second login
- `[getUserByEmail]` - Should find existing user by email
- `[linkAccount]` - Should update tokens for existing account

### Slack URL verification fails
The `/api/slack/events` endpoint handles URL verification BEFORE signature verification to allow Slack to verify the endpoint during setup.

### Slack bot not responding to DMs
1. Check that `im:read` scope is included in the Slack app scopes (required to receive `message.im` events)
2. Users must reconnect Slack if new scopes are added
3. Check for `x-slack-retry-num` header handling - Slack retries events if response takes >3s

### Slack photo uploads not working
1. Check that `files:read` scope is included - required to download photos from Slack
2. Users must reconnect Slack if this scope was added after their initial connection

### Slack scheduling shows wrong time
The `calculateScheduledDate` function in `interactions/route.ts` converts user's local time to UTC:
1. Gets current time in user's timezone to determine "today"
2. Calculates target date based on day of week
3. Converts the target time in user's timezone to UTC for storage
4. If times are still wrong, check that the user's timezone is set correctly in their profile

## Key Files

### Auth
- `/src/lib/auth.ts` - NextAuth configuration with LinkedIn/Google providers
- `/src/app/api/auth/[...nextauth]/route.ts` - Auth API routes

### Slack Integration
- `/src/app/api/slack/events/route.ts` - Handles DM messages and file uploads
- `/src/app/api/slack/interactions/route.ts` - Handles button clicks and modals
- `/src/app/api/slack/install/route.ts` - OAuth install flow
- `/src/app/api/slack/callback/route.ts` - OAuth callback
- `/src/lib/slack-claude.ts` - AI post generation for Slack
- `/src/lib/slack-blocks.ts` - Slack Block Kit message builders
- `/src/lib/slack-verify.ts` - Request signature verification

### Dashboard
- `/src/app/(dashboard)/` - Protected dashboard routes
- `/src/app/(dashboard)/settings/page.tsx` - User settings including Slack/LinkedIn connections
- `/src/app/(dashboard)/posts/page.tsx` - Post management

### Landing Page
- `/src/app/page.tsx` - Public landing page with Slack integration section

## Database Schema Notes
- `SlackIntegration` - One per user, stores bot token
- `SlackDraft` - Drafts created via Slack DM, linked to integration
- `User.slackIntegration` - One-to-one relation

## Slack Bot Features
- DM the bot with bullet points/ideas to generate LinkedIn posts
- Include scheduling like "Monday at 9am EST" for automatic scheduling
- Approve/regenerate buttons in Slack
- Photo upload support (saves to library, attaches to drafts)

## Slack OAuth Scopes
The bot requires these scopes (defined in `/src/app/api/slack/install/route.ts`):
- `chat:write` - Send messages
- `files:read` - Download photos from Slack
- `im:history` - Read DM history
- `im:read` - Receive DM events (required for message.im subscription)
- `im:write` - Send DMs
- `users:read` - Get user info
- `users:read.email` - Get user email for account matching

**Important**: If new scopes are added, existing users must disconnect and reconnect Slack to get the new permissions.

## Development Guidelines

### Verification Commands
Always verify changes work before considering them complete:
```bash
# Full pre-deploy check (tests + build) - USE THIS
npm run predeploy

# Or individually:
npm run test:run    # Run tests once
npm run build       # Type check + build
npm run lint        # Check for lint errors

# QA script for manual testing
npm run qa
```

### Code Style
- Use TypeScript strict mode
- Prefer async/await over .then() chains
- Use Prisma for all database operations (never raw SQL)
- API routes should validate request bodies before processing
- Always handle errors gracefully with try/catch

### Things Claude Should NOT Do
- Don't add console.log statements without cleaning them up
- Don't create new files when editing existing ones would work
- Don't add overly defensive error handling for impossible cases
- Don't add comments for self-documenting code
- Don't change code style (semicolons, quotes) inconsistently
- Don't add features that weren't requested

### Prisma/Database Rules
- Always run `npx prisma generate` after schema changes
- Run `npx prisma db push` to apply schema changes to dev database
- Use transactions for multi-step operations that must be atomic
- Include related records with `include:` rather than separate queries

### API Route Patterns
- Use `NextRequest` and `NextResponse` from `next/server`
- Verify authentication with `getServerSession(authOptions)`
- Return appropriate HTTP status codes (400, 401, 404, 500)
- Parse request body with `await request.json()`

### Common Mistakes to Avoid
1. **OAuth callback errors**: Always check redirect URIs match exactly in provider console
2. **Slack signature verification**: Must verify AFTER parsing body but BEFORE processing
3. **Session issues**: Check `NEXTAUTH_SECRET` is set in production
4. **Prisma errors**: Run `npx prisma generate` after pulling schema changes
5. **Build failures**: Run `npm run build` to catch TypeScript errors before deploying
6. **Slack content too long**: Slack block text has 3000 char limit - use `truncateForSlack()` in `slack-blocks.ts`
7. **Slack scopes missing**: If adding new Slack features, check if new OAuth scopes are needed
