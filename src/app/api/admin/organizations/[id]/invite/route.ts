import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

const ADMIN_EMAIL = "rohan.pavuluri@gmail.com";

// Helper to check if user is super admin or org admin
async function isAuthorized(email: string, orgId: string): Promise<boolean> {
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return true;
  }

  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId: orgId,
      email: email.toLowerCase(),
      role: "ADMIN",
    },
  });

  return !!membership;
}

// Generate a secure invite token
function generateInviteToken(): string {
  return randomBytes(32).toString("hex");
}

// POST - Create invite link or send invite email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: orgId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorized = await isAuthorized(session.user.email, orgId);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, role = "MEMBER", sendEmail = false } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Get the organization
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check if member already exists
    let member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_email: {
          organizationId: orgId,
          email: normalizedEmail,
        },
      },
    });

    // Generate new token
    const inviteToken = generateInviteToken();
    const inviteTokenExpiry = new Date();
    inviteTokenExpiry.setDate(inviteTokenExpiry.getDate() + 7); // 7 days expiry

    // Get the inviter's user ID
    const inviter = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase() },
      select: { id: true, name: true },
    });

    if (member) {
      // If already accepted, don't allow re-invite
      if (member.inviteStatus === "ACCEPTED" && member.userId) {
        return NextResponse.json(
          { error: "This person is already a member of the organization" },
          { status: 400 }
        );
      }

      // Update existing invite with new token
      member = await prisma.organizationMember.update({
        where: { id: member.id },
        data: {
          inviteToken,
          inviteTokenExpiry,
          inviteStatus: "PENDING",
          role: role === "ADMIN" ? "ADMIN" : "MEMBER",
          invitedAt: new Date(),
          invitedById: inviter?.id || null,
        },
      });
    } else {
      // Check if user exists in the system
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      // Create new membership
      member = await prisma.organizationMember.create({
        data: {
          organizationId: orgId,
          email: normalizedEmail,
          userId: existingUser?.id || null,
          role: role === "ADMIN" ? "ADMIN" : "MEMBER",
          inviteToken,
          inviteTokenExpiry,
          inviteStatus: "PENDING",
          joinedAt: null, // Will be set when they accept
          invitedById: inviter?.id || null,
        },
      });
    }

    // Generate invite URL
    const baseUrl = process.env.NEXTAUTH_URL || "https://teampost.vercel.app";
    const inviteUrl = `${baseUrl}/invite/${inviteToken}`;

    // Send email if requested
    if (sendEmail) {
      // For now, we'll use a simple approach - in production you'd use a service like Resend, SendGrid, etc.
      // We'll create a placeholder that logs the email details
      console.log(`
        === INVITE EMAIL ===
        To: ${normalizedEmail}
        Subject: You've been invited to join ${organization.name} on TeamPost

        Hi,

        You've been invited to join ${organization.name} on TeamPost.

        Click here to accept the invitation:
        ${inviteUrl}

        This invite link will expire in 7 days.

        Best,
        The TeamPost Team
        ====================
      `);

      // TODO: Integrate with email service (Resend, SendGrid, etc.)
      // For now, we'll just return success with a note that email sending is simulated
    }

    return NextResponse.json({
      member,
      inviteUrl,
      emailSent: sendEmail,
      message: sendEmail
        ? "Invite created and email sent (simulated - integrate email service for production)"
        : "Invite link generated successfully",
    });
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }
}

// GET - Get all pending invites for the organization
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: orgId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorized = await isAuthorized(session.user.email, orgId);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingInvites = await prisma.organizationMember.findMany({
      where: {
        organizationId: orgId,
        inviteStatus: "PENDING",
      },
      select: {
        id: true,
        email: true,
        role: true,
        inviteToken: true,
        inviteTokenExpiry: true,
        invitedAt: true,
      },
      orderBy: { invitedAt: "desc" },
    });

    // Generate URLs for each invite
    const baseUrl = process.env.NEXTAUTH_URL || "https://teampost.vercel.app";
    const invitesWithUrls = pendingInvites.map((invite) => ({
      ...invite,
      inviteUrl: `${baseUrl}/invite/${invite.inviteToken}`,
      isExpired: invite.inviteTokenExpiry ? new Date() > invite.inviteTokenExpiry : false,
    }));

    return NextResponse.json({ invites: invitesWithUrls });
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json(
      { error: "Failed to fetch invites" },
      { status: 500 }
    );
  }
}

// DELETE - Revoke an invite
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: orgId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorized = await isAuthorized(session.user.email, orgId);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberId } = await request.json();

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    // Find the member and verify it belongs to this org
    const member = await prisma.organizationMember.findFirst({
      where: {
        id: memberId,
        organizationId: orgId,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // If they've already accepted, don't delete - use the members route instead
    if (member.inviteStatus === "ACCEPTED" && member.userId) {
      return NextResponse.json(
        { error: "This member has already accepted. Use remove member instead." },
        { status: 400 }
      );
    }

    // Delete the pending invite
    await prisma.organizationMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking invite:", error);
    return NextResponse.json(
      { error: "Failed to revoke invite" },
      { status: 500 }
    );
  }
}
