import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Add an example post as a ghostwriter guideline
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { postContent, description } = body;

    if (!postContent) {
      return NextResponse.json(
        { error: "Post content is required" },
        { status: 400 }
      );
    }

    // Format the example post as a guideline
    const guidelineContent = `EXAMPLE POST FOR VOICE/STYLE REFERENCE:
---
${postContent}
---
${description ? `Note: ${description}` : "Use this as a reference for tone, structure, and style."}`;

    // Create a new guideline with this example post
    const guideline = await prisma.ghostwriterGuideline.create({
      data: {
        userId: session.user.id,
        content: guidelineContent,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      guideline: {
        id: guideline.id,
        content: guideline.content,
      },
      message: "Example post added as style reference",
    });
  } catch (error) {
    console.error("Error adding example post:", error);
    return NextResponse.json(
      { error: "Failed to add example post" },
      { status: 500 }
    );
  }
}

// Get all example posts (guidelines that contain example posts)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const guidelines = await prisma.ghostwriterGuideline.findMany({
      where: {
        userId: session.user.id,
        content: { contains: "EXAMPLE POST FOR VOICE/STYLE REFERENCE" },
        isActive: true,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      examplePosts: guidelines,
    });
  } catch (error) {
    console.error("Error fetching example posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch example posts" },
      { status: 500 }
    );
  }
}

// Delete an example post guideline
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const guidelineId = searchParams.get("id");

    if (!guidelineId) {
      return NextResponse.json(
        { error: "Guideline ID is required" },
        { status: 400 }
      );
    }

    await prisma.ghostwriterGuideline.delete({
      where: {
        id: guidelineId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting example post:", error);
    return NextResponse.json(
      { error: "Failed to delete example post" },
      { status: 500 }
    );
  }
}
