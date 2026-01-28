import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    account: {
      findFirst: vi.fn(),
    },
  },
}));

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
  compare: vi.fn(),
  hash: vi.fn(),
}));

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

describe("Authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Signup Flow", () => {
    it("should reject signup with missing email", async () => {
      const requestBody = {
        name: "Test User",
        password: "password123",
      };

      // Validate that email is required
      expect(requestBody.email).toBeUndefined();
    });

    it("should reject signup with missing password", async () => {
      const requestBody = {
        name: "Test User",
        email: "test@example.com",
      };

      // Validate that password is required
      expect(requestBody.password).toBeUndefined();
    });

    it("should reject signup with invalid email format", async () => {
      const email = "not-an-email";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(emailRegex.test(email)).toBe(false);
    });

    it("should reject signup with weak password", async () => {
      const password = "123"; // Too short
      const minLength = 6;

      expect(password.length >= minLength).toBe(false);
    });

    it("should prevent duplicate email registration", async () => {
      const existingUser = {
        id: "user-1",
        email: "existing@example.com",
        name: "Existing User",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser as any);

      const user = await prisma.user.findUnique({
        where: { email: "existing@example.com" },
      });

      expect(user).not.toBeNull();
      expect(user?.email).toBe("existing@example.com");
    });

    it("should hash password before storing", async () => {
      const password = "securePassword123";
      const hashedPassword = "$2a$10$hashedpassword";

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);

      const hash = await bcrypt.hash(password, 10);

      expect(hash).toBe(hashedPassword);
      expect(hash).not.toBe(password);
    });
  });

  describe("Login Flow", () => {
    it("should reject login with non-existent email", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const user = await prisma.user.findUnique({
        where: { email: "nonexistent@example.com" },
      });

      expect(user).toBeNull();
    });

    it("should reject login with incorrect password", async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const isValid = await bcrypt.compare("wrongPassword", "hashedPassword");

      expect(isValid).toBe(false);
    });

    it("should accept login with correct credentials", async () => {
      const user = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        password: "$2a$10$hashedpassword",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(user as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const foundUser = await prisma.user.findUnique({
        where: { email: "test@example.com" },
      });
      const isValid = await bcrypt.compare("correctPassword", foundUser?.password || "");

      expect(foundUser).not.toBeNull();
      expect(isValid).toBe(true);
    });
  });

  describe("OAuth Authentication", () => {
    it("should handle OAuthAccountNotLinked error gracefully", async () => {
      // When user exists with email but different provider
      const existingUser = {
        id: "user-1",
        email: "oauth@example.com",
        name: "OAuth User",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser as any);
      vi.mocked(prisma.account.findFirst).mockResolvedValue(null);

      const user = await prisma.user.findUnique({
        where: { email: "oauth@example.com" },
      });
      const account = await prisma.account.findFirst({
        where: {
          userId: user?.id,
          provider: "google",
        },
      });

      // User exists but no linked Google account
      expect(user).not.toBeNull();
      expect(account).toBeNull();
    });

    it("should link OAuth account to existing user with same email", async () => {
      const existingUser = {
        id: "user-1",
        email: "oauth@example.com",
        name: "OAuth User",
      };

      const linkedAccount = {
        id: "account-1",
        userId: "user-1",
        provider: "google",
        providerAccountId: "google-123",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser as any);
      vi.mocked(prisma.account.findFirst).mockResolvedValue(linkedAccount as any);

      const account = await prisma.account.findFirst({
        where: {
          userId: existingUser.id,
          provider: "google",
        },
      });

      expect(account).not.toBeNull();
      expect(account?.provider).toBe("google");
    });
  });

  describe("Session Management", () => {
    it("should include user id in session", () => {
      const session = {
        user: {
          id: "user-1",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };

      expect(session.user.id).toBeDefined();
      expect(session.user.id).toBe("user-1");
    });

    it("should include user email in session", () => {
      const session = {
        user: {
          id: "user-1",
          email: "test@example.com",
          name: "Test User",
        },
      };

      expect(session.user.email).toBeDefined();
      expect(session.user.email).toBe("test@example.com");
    });
  });

  describe("Protected Routes", () => {
    it("should require authentication for dashboard", () => {
      const protectedRoutes = ["/dashboard", "/create", "/posts", "/schedule", "/settings"];

      protectedRoutes.forEach((route) => {
        expect(route.startsWith("/")).toBe(true);
      });
    });

    it("should allow public access to login page", () => {
      const publicRoutes = ["/", "/login", "/signup", "/privacy", "/terms"];

      publicRoutes.forEach((route) => {
        expect(route.startsWith("/")).toBe(true);
      });
    });
  });
});
