import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const DAYS_MAP: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

function getNextDayOfWeek(date: Date, dayOfWeek: number): Date {
  const result = new Date(date);
  const currentDay = result.getDay();
  const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7 || 7;
  result.setDate(result.getDate() + daysUntilTarget);
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { dayOfWeek, time, startDate } = body;

    if (!dayOfWeek || !time || !startDate) {
      return NextResponse.json(
        { error: "Day of week, time, and start date are required" },
        { status: 400 }
      );
    }

    // Check if LinkedIn is connected
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { linkedinAccessToken: true },
    });

    if (!user?.linkedinAccessToken) {
      return NextResponse.json(
        { error: "Please connect your LinkedIn account first" },
        { status: 400 }
      );
    }

    // Get draft posts
    const draftPosts = await prisma.post.findMany({
      where: {
        userId: session.user.id,
        status: "DRAFT",
      },
      orderBy: { weekNumber: "asc" },
    });

    if (draftPosts.length === 0) {
      return NextResponse.json(
        { error: "No draft posts to schedule" },
        { status: 400 }
      );
    }

    // Parse time
    const [hours, minutes] = time.split(":").map(Number);
    const dayNumber = DAYS_MAP[dayOfWeek];

    // Calculate schedule dates
    let currentDate = new Date(startDate);
    currentDate = getNextDayOfWeek(currentDate, dayNumber);

    // Delete existing schedules for these posts
    await prisma.schedule.deleteMany({
      where: {
        postId: { in: draftPosts.map((p) => p.id) },
      },
    });

    // Create schedules
    const schedules = [];
    for (let i = 0; i < draftPosts.length; i++) {
      const post = draftPosts[i];
      const scheduledFor = new Date(currentDate);
      scheduledFor.setHours(hours, minutes, 0, 0);

      const schedule = await prisma.schedule.create({
        data: {
          userId: session.user.id,
          postId: post.id,
          scheduledFor,
          status: "PENDING",
        },
      });

      // Update post status
      await prisma.post.update({
        where: { id: post.id },
        data: { status: "SCHEDULED" },
      });

      schedules.push(schedule);

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return NextResponse.json({
      message: "Posts scheduled successfully",
      scheduledCount: schedules.length,
    });
  } catch (error) {
    console.error("Schedule creation error:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}
