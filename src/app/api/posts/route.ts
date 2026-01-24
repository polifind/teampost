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

    const posts = await prisma.post.findMany({
      where: { userId: session.user.id },
      orderBy: { weekNumber: "asc" },
      select: {
        id: true,
        content: true,
        weekNumber: true,
        status: true,
        createdAt: true,
        schedule: {
          select: {
            scheduledFor: true,
            status: true,
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
