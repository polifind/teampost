import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Get invite details (public - no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Invalid invite link" }, { status: 400 });
    }

    const member = await prisma.organizationMember.findUnique({
      where: { inviteToken: token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
            logoUrl: true,
          },
        },
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // Check if expired
    if (member.inviteTokenExpiry && new Date() > member.inviteTokenExpiry) {
      return NextResponse.json(
        { error: "This invite link has expired", expired: true },
        { status: 410 }
      );
    }

    // Check if already accepted
    if (member.inviteStatus === "ACCEPTED") {
      return NextResponse.json(
        { error: "This invite has already been accepted", alreadyAccepted: true },
        { status: 410 }
      );
    }

    return NextResponse.json({
      organization: member.organization,
      email: member.email,
      role: member.role,
      invitedBy: member.invitedBy,
    });
  } catch (error) {
    console.error("Error fetching invite:", error);
    return NextResponse.json(
      { error: "Failed to fetch invite" },
      { status: 500 }
    );
  }
}

// POST - Accept the invite (requires auth)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { token } = await params;

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to accept an invite", requiresAuth: true },
        { status: 401 }
      );
    }

    if (!token) {
      return NextResponse.json({ error: "Invalid invite link" }, { status: 400 });
    }

    const member = await prisma.organizationMember.findUnique({
      where: { inviteToken: token },
      include: {
        organization: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // Check if expired
    if (member.inviteTokenExpiry && new Date() > member.inviteTokenExpiry) {
      return NextResponse.json(
        { error: "This invite link has expired" },
        { status: 410 }
      );
    }

    // Check if already accepted
    if (member.inviteStatus === "ACCEPTED") {
      return NextResponse.json(
        { error: "This invite has already been accepted" },
        { status: 410 }
      );
    }

    // Verify the email matches (optional - could allow any logged in user)
    // For now, we'll allow any logged in user to accept if they have the link
    // but we'll update the email to their account email

    // Check if user is already a member of this org with a different invite
    const existingMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: member.organizationId,
        userId: session.user.id,
        id: { not: member.id },
      },
    });

    if (existingMembership) {
      // Delete the pending invite since user is already a member
      await prisma.organizationMember.delete({
        where: { id: member.id },
      });

      return NextResponse.json(
        { error: "You are already a member of this organization" },
        { status: 400 }
      );
    }

    // Accept the invite
    const updatedMember = await prisma.organizationMember.update({
      where: { id: member.id },
      data: {
        userId: session.user.id,
        email: session.user.email.toLowerCase(), // Update to their actual email
        inviteStatus: "ACCEPTED",
        joinedAt: new Date(),
        inviteToken: null, // Clear the token
        inviteTokenExpiry: null,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      organization: updatedMember.organization,
      message: `Welcome to ${updatedMember.organization.name}!`,
    });
  } catch (error) {
    console.error("Error accepting invite:", error);
    return NextResponse.json(
      { error: "Failed to accept invite" },
      { status: 500 }
    );
  }
}
