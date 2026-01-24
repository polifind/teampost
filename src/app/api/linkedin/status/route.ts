import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        linkedinAccessToken: true,
        linkedinTokenExpiry: true,
        linkedinUserId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isConnected = !!(
      user.linkedinAccessToken &&
      user.linkedinTokenExpiry &&
      new Date(user.linkedinTokenExpiry) > new Date()
    );

    return NextResponse.json({
      connected: isConnected,
      hasToken: !!user.linkedinAccessToken,
      linkedinUserId: user.linkedinUserId,
    });
  } catch (error) {
    console.error("Error checking LinkedIn status:", error);
    return NextResponse.json(
      { error: "Failed to check LinkedIn status" },
      { status: 500 }
    );
  }
}
