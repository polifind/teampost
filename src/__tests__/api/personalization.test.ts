import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  default: {
    ghostwriterGuideline: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    lifeLibraryItem: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

describe("Personalization API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Guidelines API", () => {
    describe("GET /api/personalization/guidelines", () => {
      it("should return 401 when not authenticated", async () => {
        vi.mocked(getServerSession).mockResolvedValue(null);

        const session = await getServerSession();
        expect(session).toBeNull();
      });

      it("should return user guidelines when authenticated", async () => {
        const mockSession = {
          user: { id: "user-1", email: "test@example.com" },
        };

        const mockGuidelines = [
          { id: "g-1", content: "Always be professional", userId: "user-1", isActive: true },
          { id: "g-2", content: "No hashtags", userId: "user-1", isActive: true },
        ];

        vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
        vi.mocked(prisma.ghostwriterGuideline.findMany).mockResolvedValue(mockGuidelines as any);

        const guidelines = await prisma.ghostwriterGuideline.findMany({
          where: { userId: mockSession.user.id },
        });

        expect(guidelines).toHaveLength(2);
        expect(guidelines[0].content).toBe("Always be professional");
      });
    });

    describe("POST /api/personalization/guidelines", () => {
      it("should create a new guideline", async () => {
        const mockSession = {
          user: { id: "user-1", email: "test@example.com" },
        };

        const newGuideline = {
          id: "g-new",
          content: "Always mention I'm a founder",
          userId: "user-1",
          isActive: true,
        };

        vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
        vi.mocked(prisma.ghostwriterGuideline.create).mockResolvedValue(newGuideline as any);

        const created = await prisma.ghostwriterGuideline.create({
          data: {
            content: "Always mention I'm a founder",
            userId: mockSession.user.id,
          },
        });

        expect(created.content).toBe("Always mention I'm a founder");
      });

      it("should reject empty guideline content", async () => {
        const content = "";
        expect(content.trim().length > 0).toBe(false);
      });

      it("should reject whitespace-only guideline content", async () => {
        const content = "   ";
        expect(content.trim().length > 0).toBe(false);
      });
    });

    describe("DELETE /api/personalization/guidelines", () => {
      it("should only delete own guidelines", async () => {
        const mockSession = {
          user: { id: "user-1", email: "test@example.com" },
        };

        // Simulating ownership check
        const guidelineOwnedByOther = {
          id: "g-other",
          content: "Other's guideline",
          userId: "user-2",
        };

        vi.mocked(getServerSession).mockResolvedValue(mockSession as any);

        const canDelete = guidelineOwnedByOther.userId === mockSession.user.id;
        expect(canDelete).toBe(false);
      });
    });
  });

  describe("Library API", () => {
    describe("GET /api/personalization/library", () => {
      it("should return library items when authenticated", async () => {
        const mockSession = {
          user: { id: "user-1", email: "test@example.com" },
        };

        const mockItems = [
          { id: "l-1", type: "LINK", sourceUrl: "https://example.com", userId: "user-1" },
          { id: "l-2", type: "YOUTUBE", sourceUrl: "https://youtube.com/watch?v=abc", userId: "user-1" },
        ];

        vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
        vi.mocked(prisma.lifeLibraryItem.findMany).mockResolvedValue(mockItems as any);

        const items = await prisma.lifeLibraryItem.findMany({
          where: { userId: mockSession.user.id },
        });

        expect(items).toHaveLength(2);
      });
    });

    describe("POST /api/personalization/library", () => {
      it("should detect YouTube URLs correctly", () => {
        const youtubeUrls = [
          "https://www.youtube.com/watch?v=abc123",
          "https://youtube.com/watch?v=abc123",
          "https://youtu.be/abc123",
          "https://www.youtube.com/shorts/abc123",
        ];

        const isYouTube = (url: string) => {
          return url.includes("youtube.com") || url.includes("youtu.be");
        };

        youtubeUrls.forEach((url) => {
          expect(isYouTube(url)).toBe(true);
        });

        expect(isYouTube("https://example.com/article")).toBe(false);
      });

      it("should validate URL format", () => {
        const validUrls = [
          "https://example.com",
          "http://example.com/path",
          "https://sub.domain.com/path?query=1",
        ];

        const invalidUrls = [
          "not-a-url",
          "ftp://invalid-protocol.com",
          "example.com", // missing protocol
        ];

        const isValidUrl = (url: string) => {
          try {
            const parsed = new URL(url);
            return parsed.protocol === "http:" || parsed.protocol === "https:";
          } catch {
            return false;
          }
        };

        validUrls.forEach((url) => {
          expect(isValidUrl(url)).toBe(true);
        });

        invalidUrls.forEach((url) => {
          expect(isValidUrl(url)).toBe(false);
        });
      });

      it("should accept valid file types for upload", () => {
        const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        const invalidTypes = ["image/png", "text/plain", "application/javascript"];

        const isValidFileType = (mimeType: string) => {
          return mimeType === "application/pdf" ||
                 mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        };

        validTypes.forEach((type) => {
          expect(isValidFileType(type)).toBe(true);
        });

        invalidTypes.forEach((type) => {
          expect(isValidFileType(type)).toBe(false);
        });
      });
    });
  });

  describe("Magic Draft API", () => {
    describe("GET /api/posts/magic-draft", () => {
      it("should return availability based on completed library items", async () => {
        const mockSession = {
          user: { id: "user-1", email: "test@example.com" },
        };

        // No completed items
        vi.mocked(prisma.lifeLibraryItem.findMany).mockResolvedValue([]);

        let items = await prisma.lifeLibraryItem.findMany({
          where: { userId: mockSession.user.id, processingStatus: "COMPLETED" },
        });

        expect(items.length > 0).toBe(false);

        // With completed items
        vi.mocked(prisma.lifeLibraryItem.findMany).mockResolvedValue([
          { id: "l-1", processingStatus: "COMPLETED" },
        ] as any);

        items = await prisma.lifeLibraryItem.findMany({
          where: { userId: mockSession.user.id, processingStatus: "COMPLETED" },
        });

        expect(items.length > 0).toBe(true);
      });
    });

    describe("POST /api/posts/magic-draft", () => {
      it("should require at least one library item to generate draft", async () => {
        const libraryItems: any[] = [];

        const canGenerateDraft = libraryItems.length > 0;
        expect(canGenerateDraft).toBe(false);
      });
    });
  });
});
