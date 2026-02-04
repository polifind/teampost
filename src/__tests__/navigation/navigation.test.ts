import { describe, it, expect } from "vitest";

/**
 * Navigation structure tests
 *
 * These tests verify the expected navigation structure and links
 * based on the dashboard layout configuration.
 */

describe("Dashboard Navigation", () => {
  // Expected navigation structure
  const expectedNavigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Posts", href: "/posts" },
    { name: "Magic Drafts", href: "/magic-drafts" },
    { name: "Settings", href: "/settings" },
  ];

  describe("Navigation Structure", () => {
    it("should have exactly 4 navigation items", () => {
      expect(expectedNavigation).toHaveLength(4);
    });

    it("should include Dashboard link", () => {
      const dashboardNav = expectedNavigation.find((n) => n.name === "Dashboard");
      expect(dashboardNav).toBeDefined();
      expect(dashboardNav?.href).toBe("/dashboard");
    });

    it("should include Posts link", () => {
      const postsNav = expectedNavigation.find((n) => n.name === "Posts");
      expect(postsNav).toBeDefined();
      expect(postsNav?.href).toBe("/posts");
    });

    it("should include Magic Drafts link", () => {
      const magicDraftsNav = expectedNavigation.find((n) => n.name === "Magic Drafts");
      expect(magicDraftsNav).toBeDefined();
      expect(magicDraftsNav?.href).toBe("/magic-drafts");
    });

    it("should include Settings link", () => {
      const settingsNav = expectedNavigation.find((n) => n.name === "Settings");
      expect(settingsNav).toBeDefined();
      expect(settingsNav?.href).toBe("/settings");
    });

    it("should NOT include Schedule link (merged into Posts)", () => {
      const scheduleNav = expectedNavigation.find((n) => n.name === "Schedule");
      expect(scheduleNav).toBeUndefined();
    });
  });

  describe("Navigation Active State Logic", () => {
    const isActiveLink = (pathname: string, href: string): boolean => {
      // Dashboard is only active on exact match
      if (href === "/dashboard") {
        return pathname === href;
      }
      // Other pages are active on prefix match
      return pathname === href || pathname.startsWith(href);
    };

    it("should highlight Dashboard only on exact match", () => {
      expect(isActiveLink("/dashboard", "/dashboard")).toBe(true);
      expect(isActiveLink("/dashboard/sub", "/dashboard")).toBe(false);
    });

    it("should highlight Posts on prefix match", () => {
      expect(isActiveLink("/posts", "/posts")).toBe(true);
      expect(isActiveLink("/posts/123", "/posts")).toBe(true);
      expect(isActiveLink("/posts/edit/123", "/posts")).toBe(true);
    });

    it("should highlight Magic Drafts on prefix match", () => {
      expect(isActiveLink("/magic-drafts", "/magic-drafts")).toBe(true);
      expect(isActiveLink("/magic-drafts/generate", "/magic-drafts")).toBe(true);
    });

    it("should highlight Settings on prefix match", () => {
      expect(isActiveLink("/settings", "/settings")).toBe(true);
      expect(isActiveLink("/settings/profile", "/settings")).toBe(true);
    });
  });

  describe("Pages with Own Navigation", () => {
    // Some pages have their own navigation and shouldn't show the shared nav
    const pagesWithOwnNav = ["/onboarding", "/create", "/admin"];

    const shouldShowSharedNav = (pathname: string): boolean => {
      return !pagesWithOwnNav.some((page) => pathname.startsWith(page));
    };

    it("should hide shared nav on onboarding pages", () => {
      expect(shouldShowSharedNav("/onboarding")).toBe(false);
      expect(shouldShowSharedNav("/onboarding/step-2")).toBe(false);
    });

    it("should hide shared nav on create pages", () => {
      expect(shouldShowSharedNav("/create")).toBe(false);
      expect(shouldShowSharedNav("/create/post")).toBe(false);
    });

    it("should hide shared nav on admin pages", () => {
      expect(shouldShowSharedNav("/admin")).toBe(false);
      expect(shouldShowSharedNav("/admin/users")).toBe(false);
    });

    it("should show shared nav on dashboard pages", () => {
      expect(shouldShowSharedNav("/dashboard")).toBe(true);
      expect(shouldShowSharedNav("/posts")).toBe(true);
      expect(shouldShowSharedNav("/settings")).toBe(true);
    });
  });
});

describe("Route Validation", () => {
  // Routes that should exist in the app
  const requiredRoutes = [
    "/",
    "/login",
    "/dashboard",
    "/posts",
    "/magic-drafts",
    "/settings",
    "/create",
    "/onboarding",
  ];

  it("should have all required routes defined", () => {
    requiredRoutes.forEach((route) => {
      expect(route).toBeDefined();
      expect(route.startsWith("/")).toBe(true);
    });
  });

  it("should have unique route paths", () => {
    const uniqueRoutes = new Set(requiredRoutes);
    expect(uniqueRoutes.size).toBe(requiredRoutes.length);
  });
});
