import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// This endpoint is called by a cron job (e.g., Vercel Cron) to process scheduled posts
// Run every hour: 0 * * * *

async function postToLinkedIn(
  accessToken: string,
  linkedinUserId: string,
  content: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:person:${linkedinUserId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: content,
            },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || "Failed to post to LinkedIn",
      };
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.id,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to connect to LinkedIn",
    };
  }
}

export async function GET(request: NextRequest) {
  // Verify cron secret (for security)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find all pending schedules that are due
    const dueSchedules = await prisma.schedule.findMany({
      where: {
        status: "PENDING",
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        post: true,
        user: {
          select: {
            linkedinAccessToken: true,
            linkedinUserId: true,
            linkedinTokenExpiry: true,
          },
        },
      },
      take: 10, // Process max 10 at a time to avoid timeout
    });

    if (dueSchedules.length === 0) {
      return NextResponse.json({ message: "No posts to process", processed: 0 });
    }

    const results = {
      processed: 0,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const schedule of dueSchedules) {
      results.processed++;

      // Mark as processing
      await prisma.schedule.update({
        where: { id: schedule.id },
        data: { status: "PROCESSING" },
      });

      // Check LinkedIn credentials
      if (!schedule.user.linkedinAccessToken || !schedule.user.linkedinUserId) {
        await prisma.schedule.update({
          where: { id: schedule.id },
          data: {
            status: "FAILED",
            error: "LinkedIn not connected",
          },
        });
        await prisma.post.update({
          where: { id: schedule.postId },
          data: { status: "FAILED" },
        });
        results.failed++;
        results.errors.push(`Schedule ${schedule.id}: LinkedIn not connected`);
        continue;
      }

      // Check token expiry
      if (
        schedule.user.linkedinTokenExpiry &&
        now > schedule.user.linkedinTokenExpiry
      ) {
        await prisma.schedule.update({
          where: { id: schedule.id },
          data: {
            status: "FAILED",
            error: "LinkedIn token expired",
          },
        });
        await prisma.post.update({
          where: { id: schedule.postId },
          data: { status: "FAILED" },
        });
        results.failed++;
        results.errors.push(`Schedule ${schedule.id}: Token expired`);
        continue;
      }

      // Post to LinkedIn
      const postResult = await postToLinkedIn(
        schedule.user.linkedinAccessToken,
        schedule.user.linkedinUserId,
        schedule.post.content
      );

      if (postResult.success) {
        await prisma.schedule.update({
          where: { id: schedule.id },
          data: {
            status: "COMPLETED",
            postedAt: now,
          },
        });
        await prisma.post.update({
          where: { id: schedule.postId },
          data: {
            status: "POSTED",
            linkedinPostId: postResult.postId,
          },
        });
        results.success++;
      } else {
        await prisma.schedule.update({
          where: { id: schedule.id },
          data: {
            status: "FAILED",
            error: postResult.error,
          },
        });
        await prisma.post.update({
          where: { id: schedule.postId },
          data: { status: "FAILED" },
        });
        results.failed++;
        results.errors.push(`Schedule ${schedule.id}: ${postResult.error}`);
      }
    }

    return NextResponse.json({
      message: "Cron job completed",
      ...results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
