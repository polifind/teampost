import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the Slack integration
    await prisma.slackIntegration.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ message: "Slack disconnected successfully" });
  } catch (error) {
    console.error("Slack disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Slack" },
      { status: 500 }
    );
  }
}
