import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscription, FREE_POST_LIMIT } from "@/lib/stripe";

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
      select: {
        id: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check subscription status
    const scheduledPostCount = await prisma.schedule.count({
      where: { userId: user.id },
    });

    const isSubscribed = hasActiveSubscription(user);

    // If user has hit the free limit and isn't subscribed, block scheduling
    if (scheduledPostCount >= FREE_POST_LIMIT && !isSubscribed) {
      return NextResponse.json(
        {
          error: "subscription_required",
          message: "You've used all 10 free posts. Please subscribe to continue.",
          scheduledPostCount,
          freePostLimit: FREE_POST_LIMIT,
        },
        { status: 402 }
      );
    }

    const { postId, scheduledFor: customScheduledFor, imageUrl } = await request.json();

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

    // Use custom scheduledFor if provided, otherwise calculate next available Monday
    let scheduledForDate: Date;

    if (customScheduledFor) {
      scheduledForDate = new Date(customScheduledFor);
      // Validate the date is in the future
      if (scheduledForDate <= new Date()) {
        return NextResponse.json(
          { error: "Scheduled time must be in the future" },
          { status: 400 }
        );
      }
    } else {
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

      scheduledForDate = getNextAvailableMonday(
        existingSchedules.map((s) => s.scheduledFor)
      );
    }

    // Check if schedule already exists for this post
    const existingSchedule = await prisma.schedule.findUnique({
      where: { postId },
    });

    if (existingSchedule) {
      // Update existing schedule
      await prisma.schedule.update({
        where: { postId },
        data: {
          scheduledFor: scheduledForDate,
          status: "PENDING",
        },
      });
    } else {
      // Create new schedule
      await prisma.schedule.create({
        data: {
          userId: user.id,
          postId,
          scheduledFor: scheduledForDate,
          status: "PENDING",
        },
      });
    }

    // Update post status and optionally the image
    const postUpdateData: { status: "SCHEDULED"; imageUrl?: string } = {
      status: "SCHEDULED"
    };

    if (imageUrl !== undefined) {
      postUpdateData.imageUrl = imageUrl;
    }

    await prisma.post.update({
      where: { id: postId },
      data: postUpdateData,
    });

    return NextResponse.json({
      success: true,
      scheduledFor: scheduledForDate.toISOString(),
    });
  } catch (error) {
    console.error("Error scheduling post:", error);
    return NextResponse.json(
      { error: "Failed to schedule post" },
      { status: 500 }
    );
  }
}
