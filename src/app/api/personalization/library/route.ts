import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { put, del } from "@vercel/blob";

// Helper to detect YouTube URLs
function isYouTubeUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=/,
    /^https?:\/\/youtu\.be\//,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\//,
  ];
  return patterns.some((p) => p.test(url));
}

// Helper to extract YouTube video ID
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// GET all library items for the user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const where: { userId: string; type?: "LINK" | "YOUTUBE" | "PDF" | "DOCX" } = {
      userId: session.user.id,
    };
    if (type && ["LINK", "YOUTUBE", "PDF", "DOCX"].includes(type)) {
      where.type = type as "LINK" | "YOUTUBE" | "PDF" | "DOCX";
    }

    const items = await prisma.lifeLibraryItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Count by type
    const counts = await prisma.lifeLibraryItem.groupBy({
      by: ["type"],
      where: { userId: session.user.id },
      _count: true,
    });

    const typeCounts = counts.reduce(
      (acc, c) => {
        acc[c.type] = c._count;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      items,
      counts: typeCounts,
      total: items.length,
    });
  } catch (error) {
    console.error("Error fetching library items:", error);
    return NextResponse.json(
      { error: "Failed to fetch library items" },
      { status: 500 }
    );
  }
}

// POST - Create a new library item (URL or file upload)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    // Handle file uploads (multipart form data)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      // Determine file type
      const fileName = file.name.toLowerCase();
      let type: "PDF" | "DOCX";
      if (fileName.endsWith(".pdf")) {
        type = "PDF";
      } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
        type = "DOCX";
      } else {
        return NextResponse.json(
          { error: "Unsupported file type. Only PDF and DOCX files are allowed." },
          { status: 400 }
        );
      }

      // Upload to Vercel Blob
      const blob = await put(
        `library/${session.user.id}/${Date.now()}-${file.name}`,
        file,
        { access: "public" }
      );

      // Create the library item
      const item = await prisma.lifeLibraryItem.create({
        data: {
          userId: session.user.id,
          type,
          fileName: file.name,
          fileUrl: blob.url,
          title: file.name.replace(/\.(pdf|docx?)$/i, ""),
          processingStatus: "PENDING",
        },
      });

      // Trigger extraction synchronously
      try {
        const extractRes = await fetch(
          `${request.nextUrl.origin}/api/personalization/library/${item.id}/extract`,
          { method: "POST", headers: { "Content-Type": "application/json" } }
        );

        if (extractRes.ok) {
          const updatedItem = await prisma.lifeLibraryItem.findUnique({
            where: { id: item.id }
          });
          return NextResponse.json({ item: updatedItem || item });
        }
      } catch (extractError) {
        console.error("Extraction error:", extractError);
      }

      return NextResponse.json({ item });
    }

    // Handle JSON (URL submission or raw text)
    const { url, text, title: textTitle } = await request.json();

    // Handle raw text submission
    if (text) {
      const item = await prisma.lifeLibraryItem.create({
        data: {
          userId: session.user.id,
          type: "TEXT",
          title: textTitle || `Text note - ${new Date().toLocaleDateString()}`,
          extractedContent: text,
          extractedSummary: text.substring(0, 500) + (text.length > 500 ? "..." : ""),
          processingStatus: "COMPLETED",
        },
      });
      return NextResponse.json({ item });
    }

    if (!url) {
      return NextResponse.json({ error: "URL or text is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Determine if YouTube or regular link
    const isYouTube = isYouTubeUrl(url);
    const type = isYouTube ? "YOUTUBE" : "LINK";

    // Extract title from URL for now
    let title = url;
    if (isYouTube) {
      const videoId = extractYouTubeId(url);
      title = `YouTube Video: ${videoId}`;
    } else {
      try {
        const urlObj = new URL(url);
        title = urlObj.hostname + urlObj.pathname.substring(0, 50);
      } catch {
        // Keep url as title
      }
    }

    // Create the library item
    const item = await prisma.lifeLibraryItem.create({
      data: {
        userId: session.user.id,
        type,
        sourceUrl: url,
        title,
        processingStatus: "PENDING",
      },
    });

    // Trigger extraction synchronously - serverless doesn't support fire-and-forget well
    try {
      const extractionUrl = `${request.nextUrl.origin}/api/personalization/library/${item.id}/extract`;
      const extractRes = await fetch(extractionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (extractRes.ok) {
        // Get updated item with extracted content
        const updatedItem = await prisma.lifeLibraryItem.findUnique({
          where: { id: item.id }
        });
        return NextResponse.json({ item: updatedItem || item });
      }
    } catch (extractError) {
      console.error("Extraction error:", extractError);
      // Item is still created, just not extracted yet
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error creating library item:", error);
    return NextResponse.json(
      { error: "Failed to create library item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a library item
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership and get item details
    const item = await prisma.lifeLibraryItem.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete file from Vercel Blob if it exists
    if (item.fileUrl) {
      try {
        await del(item.fileUrl);
      } catch (blobError) {
        console.error("Failed to delete blob:", blobError);
        // Continue with database deletion even if blob deletion fails
      }
    }

    // Delete from database
    await prisma.lifeLibraryItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting library item:", error);
    return NextResponse.json(
      { error: "Failed to delete library item" },
      { status: 500 }
    );
  }
}
