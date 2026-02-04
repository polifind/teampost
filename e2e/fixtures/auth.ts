import { test as base, expect } from "@playwright/test";

/**
 * Authentication Fixtures
 *
 * Provides authenticated test contexts for E2E tests.
 * Uses stored auth state to avoid logging in for every test.
 */

// Path to store authenticated session
export const AUTH_FILE = "e2e/.auth/user.json";

/**
 * Extend base test with authenticated page fixture
 */
export const test = base.extend<{ authenticatedPage: typeof base }>({
  authenticatedPage: async ({ browser }, use) => {
    // Create context with stored auth state
    const context = await browser.newContext({
      storageState: AUTH_FILE,
    });
    const page = await context.newPage();
    await use(page as unknown as typeof base);
    await context.close();
  },
});

/**
 * Setup function to create authenticated session
 * Run this once before tests: npx playwright test --project=setup
 *
 * For OAuth providers, you'll need to either:
 * 1. Use a test account and handle the OAuth flow
 * 2. Mock the session in your test database
 * 3. Use NextAuth's credentials provider for testing
 */
export async function globalSetup() {
  // This would be implemented based on your auth strategy
  // For now, tests will use mocked auth or test the unauthenticated flows
  console.log("Auth setup: Configure test authentication in e2e/fixtures/auth.ts");
}

export { expect };
