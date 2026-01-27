import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"];

export async function POST(request: NextRequest) {
  try {
    // Check for Blob token early
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN is not configured");
      return NextResponse.json(
        { error: "Photo storage is not configured. Please contact support." },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Please select an image." },
        { status: 400 }
      );
    }

    // Validate content type is an image
    const fileType = file.type.toLowerCase();
    if (!fileType.startsWith("image/") && !ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: "Only image files are allowed (JPEG, PNG, GIF, WebP)" },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Check file has content
    if (file.size === 0) {
      return NextResponse.json(
        { error: "File is empty. Please select a valid image." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9]/g, "_") // Sanitize
      .substring(0, 50); // Limit length
    const pathname = `posts/${session.user.id}/${timestamp}-${randomSuffix}-${sanitizedName}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
    });

    if (!blob.url) {
      return NextResponse.json(
        { error: "Upload failed - no URL returned from storage" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageUrl: blob.url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to upload file: ${errorMessage}` },
      { status: 500 }
    );
  }
}
