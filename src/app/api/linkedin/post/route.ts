import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Post to LinkedIn using Share API
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
      console.error("LinkedIn post error:", errorData);
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
    console.error("LinkedIn API error:", error);
    return {
      success: false,
      error: "Failed to connect to LinkedIn",
    };
  }
}

// Manual post endpoint
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    // Get user's LinkedIn credentials
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        linkedinAccessToken: true,
        linkedinUserId: true,
        linkedinTokenExpiry: true,
      },
    });

    if (!user?.linkedinAccessToken || !user?.linkedinUserId) {
      return NextResponse.json(
        { error: "LinkedIn not connected" },
        { status: 400 }
      );
    }

    // Check token expiry
    if (user.linkedinTokenExpiry && new Date() > user.linkedinTokenExpiry) {
      return NextResponse.json(
        { error: "LinkedIn token expired. Please reconnect your account." },
        { status: 400 }
      );
    }

    // Get the post
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        userId: session.user.id,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Post to LinkedIn
    const result = await postToLinkedIn(
      user.linkedinAccessToken,
      user.linkedinUserId,
      post.content
    );

    if (!result.success) {
      // Update post status to failed
      await prisma.post.update({
        where: { id: postId },
        data: { status: "FAILED" },
      });

      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Update post status
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: "POSTED",
        linkedinPostId: result.postId,
      },
    });

    // Update schedule if exists
    await prisma.schedule.updateMany({
      where: { postId },
      data: {
        status: "COMPLETED",
        postedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Posted to LinkedIn successfully",
      linkedinPostId: result.postId,
    });
  } catch (error) {
    console.error("Post to LinkedIn error:", error);
    return NextResponse.json(
      { error: "Failed to post to LinkedIn" },
      { status: 500 }
    );
  }
}
