import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ADMIN_EMAIL = "rohan.pavuluri@gmail.com";

// Helper to check if user is super admin or org admin
async function isAuthorized(email: string, orgId: string): Promise<boolean> {
  // Super admin has access to everything
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return true;
  }

  // Check if user is an org admin
  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId: orgId,
      email: email.toLowerCase(),
      role: "ADMIN",
    },
  });

  return !!membership;
}

// POST - Add member to organization
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

    const { email, role = "MEMBER" } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if member already exists
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_email: {
          organizationId: orgId,
          email: normalizedEmail,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "This email is already a member of the organization" },
        { status: 400 }
      );
    }

    // Check if user exists in the system
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Create membership
    const member = await prisma.organizationMember.create({
      data: {
        organizationId: orgId,
        email: normalizedEmail,
        userId: existingUser?.id || null,
        role: role === "ADMIN" ? "ADMIN" : "MEMBER",
        joinedAt: existingUser ? new Date() : null,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            onboardingCompleted: true,
            linkedinAccessToken: true,
            _count: {
              select: { posts: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ member });
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}

// DELETE - Remove member from organization
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

    await prisma.organizationMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}

// PATCH - Update member role
export async function PATCH(
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

    const { memberId, role } = await request.json();

    if (!memberId || !role) {
      return NextResponse.json({ error: "Member ID and role are required" }, { status: 400 });
    }

    const member = await prisma.organizationMember.update({
      where: { id: memberId },
      data: { role: role === "ADMIN" ? "ADMIN" : "MEMBER" },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ member });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}
