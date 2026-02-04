import { test, expect } from "@playwright/test";

/**
 * Authentication E2E Tests
 *
 * Tests the login flow and protected route access.
 * Note: OAuth tests require mock or test accounts.
 */

test.describe("Authentication", () => {
  test("should redirect unauthenticated users to login", async ({ page }) => {
    // Try to access protected route
    await page.goto("/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("should display login page correctly", async ({ page }) => {
    await page.goto("/login");

    // Check for login elements
    await expect(page.getByRole("heading", { name: /sign in|log in|welcome/i })).toBeVisible();

    // Check for OAuth buttons (Google and/or LinkedIn)
    const googleButton = page.getByRole("button", { name: /google/i });
    const linkedInButton = page.getByRole("button", { name: /linkedin/i });

    // At least one OAuth provider should be available
    const hasGoogle = await googleButton.isVisible().catch(() => false);
    const hasLinkedIn = await linkedInButton.isVisible().catch(() => false);
    expect(hasGoogle || hasLinkedIn).toBeTruthy();
  });

  test("should protect posts page", async ({ page }) => {
    await page.goto("/posts");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should protect settings page", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should protect magic-drafts page", async ({ page }) => {
    await page.goto("/magic-drafts");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Public Pages", () => {
  test("should display landing page", async ({ page }) => {
    await page.goto("/");

    // Landing page should be accessible
    await expect(page).toHaveURL("/");

    // Should have some content about the product
    const body = await page.textContent("body");
    expect(body?.toLowerCase()).toMatch(/linkedin|post|schedule|team/i);
  });

  test("landing page should have CTA buttons", async ({ page }) => {
    await page.goto("/");

    // Should have a way to get started
    const ctaButton = page.getByRole("link", { name: /get started|sign up|try|start/i });
    await expect(ctaButton.first()).toBeVisible();
  });
});
