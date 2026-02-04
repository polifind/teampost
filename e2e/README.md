# E2E Tests

End-to-end tests using Playwright.

## Setup

```bash
# Install Playwright and browsers
npm install -D @playwright/test
npx playwright install
```

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run with headed browser (see the browser)
npx playwright test --headed
```

## Test Structure

- `auth.spec.ts` - Authentication flow tests
- `navigation.spec.ts` - Navigation and routing tests
- `posts.spec.ts` - Post management tests
- `magic-drafts.spec.ts` - AI draft generation tests
- `fixtures/auth.ts` - Authentication helpers

## Authenticated Tests

Many tests require an authenticated session. To set this up:

### Option 1: Test User in Database

1. Create a test user in your database
2. Update `e2e/fixtures/auth.ts` with login logic
3. Run `npx playwright test --project=setup` to generate auth state

### Option 2: Mock Session (Recommended for CI)

1. Create a test database with seeded user
2. Configure `DATABASE_URL` in CI environment
3. Use Prisma to seed test data before tests

### Option 3: Credentials Provider (Testing Only)

1. Add a credentials provider to NextAuth (dev only)
2. Use email/password login in tests

## Writing New Tests

```typescript
import { test, expect } from "@playwright/test";

test("should do something", async ({ page }) => {
  await page.goto("/some-page");
  await expect(page.getByRole("heading")).toBeVisible();
});
```

## CI Integration

Tests run automatically on every PR via GitHub Actions. See `.github/workflows/ci.yml`.

## Debugging

```bash
# Run with debug mode
PWDEBUG=1 npx playwright test

# View last test report
npx playwright show-report
```
