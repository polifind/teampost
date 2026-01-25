import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { regeneratePost } from "@/lib/claude";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the post
    const post = await prisma.post.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Parse request body for optional feedback
    let feedback: string | undefined;
    try {
      const body = await request.json();
      feedback = body.feedback;
    } catch {
      // No body provided, that's fine
    }

    // Fetch user's writing preferences
    const writingPreferences = await prisma.writingPreference.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { preference: true },
    });

    // Regenerate the post with writing preferences
    const newContent = await regeneratePost(post.content, feedback, writingPreferences);

    // Update the post
    await prisma.post.update({
      where: { id },
      data: {
        content: newContent,
        updatedAt: new Date(),
      },
    });

    // If feedback was provided, store it as a writing preference for future posts
    if (feedback && feedback.trim()) {
      await prisma.writingPreference.create({
        data: {
          userId: user.id,
          preference: feedback.trim(),
          category: "feedback",
          originalFeedback: feedback.trim(),
          exampleBefore: post.content,
          exampleAfter: newContent,
          isActive: true,
        },
      });
    }

    return NextResponse.json({
      content: newContent,
    });
  } catch (error) {
    console.error("Error regenerating post:", error);
    return NextResponse.json(
      { error: "Failed to regenerate post" },
      { status: 500 }
    );
  }
}
