import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove LinkedIn tokens from user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        linkedinAccessToken: null,
        linkedinRefreshToken: null,
        linkedinTokenExpiry: null,
        linkedinUserId: null,
      },
    });

    // Update any scheduled posts back to draft
    await prisma.post.updateMany({
      where: {
        userId: session.user.id,
        status: "SCHEDULED",
      },
      data: {
        status: "DRAFT",
      },
    });

    // Delete schedules
    await prisma.schedule.deleteMany({
      where: {
        userId: session.user.id,
        status: "PENDING",
      },
    });

    return NextResponse.json({ message: "LinkedIn disconnected successfully" });
  } catch (error) {
    console.error("LinkedIn disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect LinkedIn" },
      { status: 500 }
    );
  }
}
