import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        linkedinAccessToken: true,
        onboardingCompleted: true,
        linkedinProfileContext: true,
      },
    });

    // Get post counts
    const [postsCount, scheduledCount, postedCount] = await Promise.all([
      prisma.post.count({ where: { userId: session.user.id } }),
      prisma.post.count({
        where: { userId: session.user.id, status: "SCHEDULED" },
      }),
      prisma.post.count({
        where: { userId: session.user.id, status: "POSTED" },
      }),
    ]);

    return NextResponse.json({
      postsCount,
      scheduledCount,
      postedCount,
      linkedInConnected: !!user?.linkedinAccessToken,
      onboardingCompleted: user?.onboardingCompleted || false,
      hasLinkedInProfile: !!user?.linkedinProfileContext,
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
