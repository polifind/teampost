import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ADMIN_EMAIL = "rohan.pavuluri@gmail.com";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get date 30 days ago for charts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all stats in parallel
    const [
      totalUsers,
      totalPosts,
      totalScheduled,
      totalPosted,
      totalVoiceNotes,
      linkedInConnectedCount,
      onboardingCompletedCount,
      usersWithPosts,
      recentUsers,
      recentPosts,
      usersByDay,
      postsByDay,
    ] = await Promise.all([
      // Total counts
      prisma.user.count(),
      prisma.post.count(),
      prisma.schedule.count({ where: { status: "PENDING" } }),
      prisma.post.count({ where: { status: "POSTED" } }),
      prisma.voiceNote.count(),
      prisma.user.count({ where: { linkedinAccessToken: { not: null } } }),
      prisma.user.count({ where: { onboardingCompleted: true } }),
      prisma.user.count({ where: { posts: { some: {} } } }),

      // Recent users (last 10)
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          onboardingCompleted: true,
          linkedinAccessToken: true,
          _count: {
            select: {
              posts: true,
              voiceNotes: true,
            },
          },
        },
      }),

      // Recent posts (last 10)
      prisma.post.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      }),

      // Users by day (last 30 days)
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM "User"
        WHERE created_at >= ${thirtyDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,

      // Posts by day (last 30 days)
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM "Post"
        WHERE created_at >= ${thirtyDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    // Calculate engagement stats
    const postsWithEngagement = await prisma.post.aggregate({
      _sum: {
        likes: true,
        comments: true,
        shares: true,
      },
      where: {
        status: "POSTED",
      },
    });

    // Get top users by post count
    const topUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    // Posts by status breakdown
    const postsByStatus = await prisma.post.groupBy({
      by: ["status"],
      _count: true,
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        totalPosts,
        totalScheduled,
        totalPosted,
        totalVoiceNotes,
        linkedInConnectedCount,
        onboardingCompletedCount,
        usersWithPosts,
        avgPostsPerUser: totalUsers > 0 ? (totalPosts / totalUsers).toFixed(1) : 0,
      },
      engagement: {
        totalLikes: postsWithEngagement._sum.likes || 0,
        totalComments: postsWithEngagement._sum.comments || 0,
        totalShares: postsWithEngagement._sum.shares || 0,
      },
      charts: {
        usersByDay,
        postsByDay,
      },
      postsByStatus: postsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      topUsers,
      recentUsers: recentUsers.map((u) => ({
        ...u,
        hasLinkedIn: !!u.linkedinAccessToken,
        linkedinAccessToken: undefined,
      })),
      recentPosts: recentPosts.map((p) => ({
        ...p,
        contentPreview: p.content.substring(0, 100) + (p.content.length > 100 ? "..." : ""),
      })),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
