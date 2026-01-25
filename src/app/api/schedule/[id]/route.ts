import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET a specific schedule
export async function GET(
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

    const schedule = await prisma.schedule.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        post: {
          select: {
            id: true,
            content: true,
            imageUrl: true,
            weekNumber: true,
            status: true,
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("Schedule fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}

// PATCH - update schedule (time and/or image)
export async function PATCH(
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

    const body = await request.json();
    const { scheduledFor, imageUrl } = body;

    // Verify schedule belongs to user
    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        post: true,
      },
    });

    if (!existingSchedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    // Update schedule time if provided
    if (scheduledFor) {
      const newScheduledFor = new Date(scheduledFor);
      if (newScheduledFor <= new Date()) {
        return NextResponse.json(
          { error: "Scheduled time must be in the future" },
          { status: 400 }
        );
      }

      await prisma.schedule.update({
        where: { id },
        data: { scheduledFor: newScheduledFor },
      });
    }

    // Update post image if provided
    if (imageUrl !== undefined) {
      await prisma.post.update({
        where: { id: existingSchedule.postId },
        data: { imageUrl },
      });
    }

    // Fetch updated schedule
    const updatedSchedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        post: {
          select: {
            id: true,
            content: true,
            imageUrl: true,
            weekNumber: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error("Schedule update error:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

// DELETE a scheduled post (removes schedule and sets post back to DRAFT)
export async function DELETE(
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

    // Verify schedule belongs to user
    const schedule = await prisma.schedule.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    // Delete the schedule
    await prisma.schedule.delete({
      where: { id },
    });

    // Set the post back to DRAFT status
    await prisma.post.update({
      where: { id: schedule.postId },
      data: { status: "DRAFT" },
    });

    return NextResponse.json({
      success: true,
      message: "Schedule deleted and post returned to drafts",
    });
  } catch (error) {
    console.error("Schedule delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
