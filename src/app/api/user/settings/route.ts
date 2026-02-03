import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        timezone: true,
        linkedinAccessToken: true,
        linkedinUserId: true,
        slackIntegration: {
          select: {
            id: true,
            teamName: true,
            isActive: true,
          },
        },
        organizationMemberships: {
          select: {
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if LinkedIn is connected (has access token)
    const linkedInConnected = Boolean(user.linkedinAccessToken);

    // Format organizations for the response
    const organizations = user.organizationMemberships.map((member) => ({
      id: member.organization.id,
      name: member.organization.name,
      role: member.role,
    }));

    return NextResponse.json({
      name: user.name || "",
      email: user.email || "",
      timezone: user.timezone || "America/New_York",
      linkedInConnected,
      linkedInUserId: user.linkedinUserId,
      organizations,
      slackIntegration: user.slackIntegration,
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { timezone } = body;

    if (timezone && typeof timezone !== "string") {
      return NextResponse.json(
        { error: "Invalid timezone format" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(timezone && { timezone }),
      },
      select: {
        timezone: true,
      },
    });

    return NextResponse.json({
      timezone: updatedUser.timezone,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
