import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Get the next available week number
    const existingPosts = await prisma.post.count({
      where: { userId: user.id },
    });

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content,
        weekNumber: existingPosts + 1,
        status: "DRAFT",
      },
    });

    return NextResponse.json({
      postId: post.id,
      weekNumber: post.weekNumber,
    });
  } catch (error) {
    console.error("Error saving post:", error);
    return NextResponse.json(
      { error: "Failed to save post" },
      { status: 500 }
    );
  }
}
