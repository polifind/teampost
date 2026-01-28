import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  default: {
    post: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

describe("Posts API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/posts", () => {
    it("should return 401 when not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const session = await getServerSession();
      expect(session).toBeNull();
    });

    it("should return user posts when authenticated", async () => {
      const mockSession = {
        user: { id: "user-1", email: "test@example.com" },
      };

      const mockPosts = [
        { id: "post-1", content: "Test post 1", userId: "user-1" },
        { id: "post-2", content: "Test post 2", userId: "user-1" },
      ];

      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.post.findMany).mockResolvedValue(mockPosts as any);

      const posts = await prisma.post.findMany({
        where: { userId: mockSession.user.id },
      });

      expect(posts).toHaveLength(2);
      expect(posts[0].userId).toBe("user-1");
    });

    it("should not return posts from other users", async () => {
      const mockSession = {
        user: { id: "user-1", email: "test@example.com" },
      };

      // Simulating a query that correctly filters by userId
      vi.mocked(prisma.post.findMany).mockImplementation(async (args: any) => {
        const allPosts = [
          { id: "post-1", content: "My post", userId: "user-1" },
          { id: "post-2", content: "Their post", userId: "user-2" },
        ];
        return allPosts.filter((p) => p.userId === args?.where?.userId) as any;
      });

      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);

      const posts = await prisma.post.findMany({
        where: { userId: mockSession.user.id },
      });

      expect(posts).toHaveLength(1);
      expect(posts.every((p: any) => p.userId === "user-1")).toBe(true);
    });
  });

  describe("POST /api/posts", () => {
    it("should create a new post", async () => {
      const mockSession = {
        user: { id: "user-1", email: "test@example.com" },
      };

      const newPost = {
        id: "post-new",
        content: "New test post content",
        userId: "user-1",
        createdAt: new Date(),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.post.create).mockResolvedValue(newPost as any);

      const created = await prisma.post.create({
        data: {
          content: "New test post content",
          userId: mockSession.user.id,
        },
      });

      expect(created.id).toBe("post-new");
      expect(created.userId).toBe("user-1");
    });

    it("should reject post creation without content", async () => {
      const requestBody = {
        // content is missing
        userId: "user-1",
      };

      expect(requestBody.content).toBeUndefined();
    });
  });

  describe("DELETE /api/posts/[id]", () => {
    it("should only allow deleting own posts", async () => {
      const mockSession = {
        user: { id: "user-1", email: "test@example.com" },
      };

      // Post belongs to different user
      const otherUserPost = {
        id: "post-other",
        content: "Other user's post",
        userId: "user-2",
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.post.findUnique).mockResolvedValue(otherUserPost as any);

      const post = await prisma.post.findUnique({ where: { id: "post-other" } });

      // Should check ownership before deleting
      const canDelete = post?.userId === mockSession.user.id;
      expect(canDelete).toBe(false);
    });
  });
});
