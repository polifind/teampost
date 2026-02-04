import { test, expect } from "@playwright/test";

/**
 * Posts E2E Tests
 *
 * Tests the post management functionality.
 * Note: Full tests require authenticated session.
 *
 * To run authenticated tests:
 * 1. Set up test user in database
 * 2. Configure auth fixture in e2e/fixtures/auth.ts
 * 3. Run: npx playwright test e2e/posts.spec.ts
 */

test.describe("Posts Page - Unauthenticated", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/posts");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Posts Page - Structure", () => {
  // These tests would run with an authenticated session
  // For now, we test the redirect behavior

  test("should protect post creation route", async ({ page }) => {
    await page.goto("/create");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should protect post review route", async ({ page }) => {
    await page.goto("/posts/review");
    await expect(page).toHaveURL(/\/login/);
  });
});

/**
 * Authenticated Post Tests
 *
 * Uncomment and configure auth fixture to run these tests.
 * See e2e/fixtures/auth.ts for setup instructions.
 */

// import { test as authTest, AUTH_FILE } from "./fixtures/auth";
//
// authTest.describe("Posts Page - Authenticated", () => {
//   authTest.use({ storageState: AUTH_FILE });
//
//   authTest("should display posts page with navigation", async ({ page }) => {
//     await page.goto("/posts");
//
//     // Should stay on posts page
//     await expect(page).toHaveURL("/posts");
//
//     // Should have navigation
//     await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
//     await expect(page.getByRole("link", { name: /posts/i })).toBeVisible();
//     await expect(page.getByRole("link", { name: /magic drafts/i })).toBeVisible();
//     await expect(page.getByRole("link", { name: /settings/i })).toBeVisible();
//   });
//
//   authTest("should show New Post button", async ({ page }) => {
//     await page.goto("/posts");
//
//     const newPostButton = page.getByRole("link", { name: /new post/i });
//     await expect(newPostButton).toBeVisible();
//   });
//
//   authTest("should navigate to create page", async ({ page }) => {
//     await page.goto("/posts");
//
//     await page.getByRole("link", { name: /new post/i }).click();
//     await expect(page).toHaveURL("/create");
//   });
//
//   authTest("should show bulk schedule button when drafts exist", async ({ page }) => {
//     await page.goto("/posts");
//
//     // This button only shows when there are drafts AND LinkedIn is connected
//     const scheduleButton = page.getByRole("button", { name: /schedule all/i });
//     // Button may or may not be visible depending on state
//     // Just verify page loads without error
//     await expect(page.locator("body")).toBeVisible();
//   });
// });
