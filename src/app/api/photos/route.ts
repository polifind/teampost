import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { put, del } from "@vercel/blob";

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"];

// GET - List all photos in user's library
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const photos = await prisma.photoLibrary.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

// POST - Upload new photo(s) to library
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    // Support both "files" (multiple) and "file" (single) field names
    let files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    if (singleFile && files.length === 0) {
      files = [singleFile];
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided. Please select at least one image." },
        { status: 400 }
      );
    }

    const uploadedPhotos = [];
    const errors: string[] = [];

    for (const file of files) {
      // Validate file is an image
      const fileType = file.type.toLowerCase();
      if (!fileType.startsWith("image/") && !ALLOWED_TYPES.includes(fileType)) {
        errors.push(`${file.name}: Not a valid image file`);
        continue;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large (max 10MB)`);
        continue;
      }

      // Check file has content
      if (file.size === 0) {
        errors.push(`${file.name}: File is empty`);
        continue;
      }

      try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const sanitizedName = file.name
          .replace(/\.[^/.]+$/, '') // Remove extension
          .replace(/[^a-zA-Z0-9]/g, "_") // Sanitize
          .substring(0, 50); // Limit length
        const filename = `photos/${session.user.id}/${timestamp}-${randomSuffix}-${sanitizedName}.${extension}`;

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
          access: "public",
          contentType: file.type,
        });

        if (!blob.url) {
          errors.push(`${file.name}: Upload failed - no URL returned`);
          continue;
        }

        // Save to database
        const photo = await prisma.photoLibrary.create({
          data: {
            userId: session.user.id,
            imageUrl: blob.url,
            filename: file.name,
          },
        });

        uploadedPhotos.push(photo);
      } catch (uploadError) {
        console.error(`Failed to upload ${file.name}:`, uploadError);
        errors.push(`${file.name}: Upload failed`);
      }
    }

    // Return appropriate response based on results
    if (uploadedPhotos.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          error: "All uploads failed",
          details: errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: `${uploadedPhotos.length} photo(s) uploaded successfully`,
      photos: uploadedPhotos,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error uploading photos:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to upload photos: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// DELETE - Remove photo from library
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { photoId } = await request.json();

    if (!photoId) {
      return NextResponse.json(
        { error: "Photo ID required" },
        { status: 400 }
      );
    }

    // Find the photo and verify ownership
    const photo = await prisma.photoLibrary.findFirst({
      where: {
        id: photoId,
        userId: session.user.id,
      },
    });

    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    // Delete from Vercel Blob
    try {
      await del(photo.imageUrl);
    } catch (blobError) {
      console.error("Error deleting from blob:", blobError);
      // Continue with DB deletion even if blob deletion fails
    }

    // Delete from database
    await prisma.photoLibrary.delete({
      where: { id: photoId },
    });

    return NextResponse.json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
