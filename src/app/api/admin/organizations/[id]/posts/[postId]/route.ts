import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ADMIN_EMAIL = "rohan.pavuluri@gmail.com";

// Helper to check if user is super admin or org admin
async function isAuthorized(email: string, orgId: string): Promise<boolean> {
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return true;
  }

  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId: orgId,
      email: email.toLowerCase(),
      role: "ADMIN",
    },
  });

  return !!membership;
}

// PATCH - Update an admin-created post
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: orgId, postId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorized = await isAuthorized(session.user.email, orgId);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the post belongs to this org
    const existingPost = await prisma.post.findFirst({
      where: {
        id: postId,
        organizationId: orgId,
      },
      include: { schedule: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const { content, imageUrl, scheduledFor } = await request.json();

    // Update the post
    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    // Handle schedule changes
    if (scheduledFor !== undefined) {
      if (scheduledFor === null) {
        // Remove schedule and set back to DRAFT
        if (existingPost.schedule) {
          await prisma.schedule.delete({
            where: { id: existingPost.schedule.id },
          });
        }
        updateData.status = "DRAFT";
      } else {
        const scheduledDate = new Date(scheduledFor);
        if (scheduledDate <= new Date()) {
          return NextResponse.json(
            { error: "Scheduled time must be in the future" },
            { status: 400 }
          );
        }

        if (existingPost.schedule) {
          // Update existing schedule
          await prisma.schedule.update({
            where: { id: existingPost.schedule.id },
            data: { scheduledFor: scheduledDate },
          });
        } else {
          // Create new schedule
          await prisma.schedule.create({
            data: {
              userId: existingPost.userId,
              postId: existingPost.id,
              scheduledFor: scheduledDate,
              status: "PENDING",
            },
          });
        }
        updateData.status = "SCHEDULED";
      }
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            linkedinAccessToken: true,
          },
        },
        createdByAdmin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        schedule: true,
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an admin-created post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: orgId, postId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorized = await isAuthorized(session.user.email, orgId);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the post belongs to this org
    const existingPost = await prisma.post.findFirst({
      where: {
        id: postId,
        organizationId: orgId,
      },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Can only delete DRAFT or SCHEDULED posts (not POSTED)
    if (existingPost.status === "POSTED") {
      return NextResponse.json(
        { error: "Cannot delete a post that has already been published" },
        { status: 400 }
      );
    }

    // Delete the post (schedule will cascade delete)
    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
