import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getNextAvailableMonday(existingSchedules: Date[]): Date {
  const now = new Date();
  let candidate = new Date(now);

  // Find next Monday
  const daysUntilMonday = (8 - candidate.getDay()) % 7 || 7;
  candidate.setDate(candidate.getDate() + daysUntilMonday);

  // Set to 8:55 AM EST (13:55 UTC during standard time)
  candidate.setUTCHours(13, 55, 0, 0);

  // Check if this slot is taken, if so keep advancing by a week
  const existingDates = existingSchedules.map((d) => d.toISOString().split("T")[0]);

  while (existingDates.includes(candidate.toISOString().split("T")[0])) {
    candidate.setDate(candidate.getDate() + 7);
  }

  return candidate;
}

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

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Verify post belongs to user
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        userId: user.id,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get existing scheduled dates for this user
    const existingSchedules = await prisma.schedule.findMany({
      where: {
        userId: user.id,
        status: "PENDING",
      },
      select: {
        scheduledFor: true,
      },
    });

    const nextMonday = getNextAvailableMonday(
      existingSchedules.map((s) => s.scheduledFor)
    );

    // Check if schedule already exists for this post
    const existingSchedule = await prisma.schedule.findUnique({
      where: { postId },
    });

    if (existingSchedule) {
      // Update existing schedule
      await prisma.schedule.update({
        where: { postId },
        data: {
          scheduledFor: nextMonday,
          status: "PENDING",
        },
      });
    } else {
      // Create new schedule
      await prisma.schedule.create({
        data: {
          userId: user.id,
          postId,
          scheduledFor: nextMonday,
          status: "PENDING",
        },
      });
    }

    // Update post status
    await prisma.post.update({
      where: { id: postId },
      data: { status: "SCHEDULED" },
    });

    return NextResponse.json({
      success: true,
      scheduledFor: nextMonday.toISOString(),
    });
  } catch (error) {
    console.error("Error scheduling post:", error);
    return NextResponse.json(
      { error: "Failed to schedule post" },
      { status: 500 }
    );
  }
}
