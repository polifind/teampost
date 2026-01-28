import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Post fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, imageUrl } = body;

    // Build update data object - at least one field must be provided
    const updateData: { content?: string; imageUrl?: string | null; updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (content !== undefined) {
      if (typeof content !== "string") {
        return NextResponse.json(
          { error: "Content must be a string" },
          { status: 400 }
        );
      }
      updateData.content = content;
    }

    if (imageUrl !== undefined) {
      // imageUrl can be a string (to set) or null (to remove)
      updateData.imageUrl = imageUrl;
    }

    // Check that at least one field is being updated
    if (updateData.content === undefined && updateData.imageUrl === undefined) {
      return NextResponse.json(
        { error: "Content or imageUrl is required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.updateMany({
      where: {
        id,
        userId: session.user.id,
      },
      data: updateData,
    });

    if (post.count === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Post updated successfully" });
  } catch (error) {
    console.error("Post update error:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (post.count === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Post delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
