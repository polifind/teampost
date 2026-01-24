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

    // Check if LinkedIn is connected
    if (!user.linkedinAccessToken) {
      return NextResponse.json(
        { error: "LinkedIn not connected" },
        { status: 400 }
      );
    }

    const { schedules } = await request.json();

    if (!schedules || !Array.isArray(schedules)) {
      return NextResponse.json(
        { error: "Schedules array is required" },
        { status: 400 }
      );
    }

    // Create schedules for each post
    const createdSchedules = await Promise.all(
      schedules.map(async ({ postId, scheduledFor }: { postId: string; scheduledFor: string }) => {
        // Check if schedule already exists for this post
        const existingSchedule = await prisma.schedule.findUnique({
          where: { postId },
        });

        if (existingSchedule) {
          // Update existing schedule
          return prisma.schedule.update({
            where: { postId },
            data: {
              scheduledFor: new Date(scheduledFor),
              status: "PENDING",
            },
          });
        }

        // Create new schedule
        return prisma.schedule.create({
          data: {
            userId: user.id,
            postId,
            scheduledFor: new Date(scheduledFor),
            status: "PENDING",
          },
        });
      })
    );

    // Update post statuses to SCHEDULED
    await prisma.post.updateMany({
      where: {
        id: { in: schedules.map((s: { postId: string }) => s.postId) },
        userId: user.id,
      },
      data: {
        status: "SCHEDULED",
      },
    });

    return NextResponse.json({
      success: true,
      scheduledCount: createdSchedules.length,
    });
  } catch (error) {
    console.error("Error bulk scheduling posts:", error);
    return NextResponse.json(
      { error: "Failed to schedule posts" },
      { status: 500 }
    );
  }
}
