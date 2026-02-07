import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Helper to get the next Monday at 8:55 AM EST for a given week offset
function getScheduledDateForWeek(weekNumber: number): Date {
  const today = new Date();
  let current = new Date(today);

  // Find next Monday
  const daysUntilMonday = (8 - current.getDay()) % 7 || 7;
  current.setDate(current.getDate() + daysUntilMonday);

  // Add weeks based on weekNumber (week 1 = next Monday, week 2 = Monday after that, etc.)
  current.setDate(current.getDate() + (weekNumber - 1) * 7);

  // Set to 8:55 AM EST (13:55 UTC during standard time)
  current.setUTCHours(13, 55, 0, 0);

  return current;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, weekNumber, sourceNoteContent, imageUrl, autoSchedule, status } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // If no weekNumber provided, always create a new post (e.g., from Magic Drafts)
    if (!weekNumber) {
      // Find the highest weekNumber for this user and add 1
      const highestPost = await prisma.post.findFirst({
        where: { userId: session.user.id },
        orderBy: { weekNumber: "desc" },
        select: { weekNumber: true },
      });
      const nextWeekNum = (highestPost?.weekNumber || 0) + 1;

      const post = await prisma.post.create({
        data: {
          userId: session.user.id,
          content,
          weekNumber: nextWeekNum,
          imageUrl: imageUrl || null,
          status: status || "DRAFT",
        },
      });

      return NextResponse.json({ post });
    }

    const weekNum = weekNumber;

    // Check if a post with this weekNumber already exists for this user
    const existingPost = await prisma.post.findFirst({
      where: {
        userId: session.user.id,
        weekNumber: weekNum,
      },
      include: {
        schedule: true,
      },
    });

    if (existingPost) {
      // Update existing post
      const updatedPost = await prisma.post.update({
        where: { id: existingPost.id },
        data: {
          content,
          imageUrl: imageUrl || null,
          status: autoSchedule ? "SCHEDULED" : existingPost.status,
        },
      });

      // Create or update schedule if autoSchedule is true
      if (autoSchedule) {
        const scheduledFor = getScheduledDateForWeek(weekNum);
        if (existingPost.schedule) {
          await prisma.schedule.update({
            where: { id: existingPost.schedule.id },
            data: {
              scheduledFor,
              status: "PENDING",
            },
          });
        } else {
          await prisma.schedule.create({
            data: {
              userId: session.user.id,
              postId: existingPost.id,
              scheduledFor,
              status: "PENDING",
            },
          });
        }
      }

      return NextResponse.json({ post: updatedPost });
    }

    // Create new post with specific weekNumber
    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        content,
        weekNumber: weekNum,
        imageUrl: imageUrl || null,
        status: autoSchedule ? "SCHEDULED" : "DRAFT",
      },
    });

    // Create schedule if autoSchedule is true
    if (autoSchedule) {
      const scheduledFor = getScheduledDateForWeek(weekNum);
      await prisma.schedule.create({
        data: {
          userId: session.user.id,
          postId: post.id,
          scheduledFor,
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Post creation error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      where: { userId: session.user.id },
      orderBy: { weekNumber: "asc" },
      select: {
        id: true,
        content: true,
        imageUrl: true,
        taggedContactIds: true,
        weekNumber: true,
        status: true,
        createdAt: true,
        schedule: {
          select: {
            id: true,
            scheduledFor: true,
            status: true,
          },
        },
        createdByAdmin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Check if LinkedIn is connected
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { linkedinAccessToken: true },
    });

    return NextResponse.json({
      posts,
      linkedInConnected: !!user?.linkedinAccessToken,
    });
  } catch (error) {
    console.error("Posts fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
