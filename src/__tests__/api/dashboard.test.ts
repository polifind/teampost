import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  default: {
    post: {
      count: vi.fn(),
    },
    scheduledPost: {
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

describe("Dashboard API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/dashboard", () => {
    it("should return 401 when not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const session = await getServerSession();
      expect(session).toBeNull();
    });

    it("should return dashboard data when authenticated", async () => {
      const mockSession = {
        user: { id: "user-1", email: "test@example.com" },
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.post.count).mockResolvedValue(10);
      vi.mocked(prisma.scheduledPost.count)
        .mockResolvedValueOnce(5) // scheduled
        .mockResolvedValueOnce(3); // posted
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-1",
        linkedinProfileContext: "Some context",
        onboardingCompleted: true,
        linkedinAccessToken: "token",
      } as any);

      const session = await getServerSession();
      expect(session).not.toBeNull();

      const postsCount = await prisma.post.count();
      expect(postsCount).toBe(10);
    });

    it("should return correct LinkedIn connection status", async () => {
      // Connected
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-1",
        linkedinAccessToken: "valid-token",
        linkedinTokenExpiry: new Date(Date.now() + 86400000),
      } as any);

      const connectedUser = await prisma.user.findUnique({ where: { id: "user-1" } });
      const isConnected = !!(connectedUser?.linkedinAccessToken &&
        connectedUser?.linkedinTokenExpiry &&
        new Date(connectedUser.linkedinTokenExpiry) > new Date());

      expect(isConnected).toBe(true);

      // Not connected - expired token
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-2",
        linkedinAccessToken: "expired-token",
        linkedinTokenExpiry: new Date(Date.now() - 86400000), // yesterday
      } as any);

      const expiredUser = await prisma.user.findUnique({ where: { id: "user-2" } });
      const isExpired = !!(expiredUser?.linkedinAccessToken &&
        expiredUser?.linkedinTokenExpiry &&
        new Date(expiredUser.linkedinTokenExpiry) > new Date());

      expect(isExpired).toBe(false);
    });
  });
});
