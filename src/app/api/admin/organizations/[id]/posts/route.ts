import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

// GET - List all admin-created posts for organization
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // DRAFT, SCHEDULED, POSTED, etc.
    const bulkDraftStatus = searchParams.get("bulkDraftStatus"); // PENDING_APPROVAL, APPROVED, REJECTED

    const posts = await prisma.post.findMany({
      where: {
        organizationId: orgId,
        createdByAdminId: { not: null },
        ...(status && { status: status as any }),
        ...(bulkDraftStatus && { bulkDraftStatus: bulkDraftStatus as any }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            linkedinAccessToken: true,
          },
        },
        createdByAdmin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        schedule: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching org posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST - Create a post for an employee
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: orgId } = await params;

    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorized = await isAuthorized(session.user.email, orgId);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetMemberId, content, imageUrl, scheduledFor } = await request.json();

    if (!targetMemberId || !content) {
      return NextResponse.json(
        { error: "Target member and content are required" },
        { status: 400 }
      );
    }

    // Get the target member and verify they belong to this org
    const member = await prisma.organizationMember.findFirst({
      where: {
        id: targetMemberId,
        organizationId: orgId,
      },
      include: {
        user: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found in organization" },
        { status: 404 }
      );
    }

    if (!member.userId || !member.user) {
      return NextResponse.json(
        { error: "This member hasn't signed up yet. They need to create an account first." },
        { status: 400 }
      );
    }

    // Get the next week number for this user
    const lastPost = await prisma.post.findFirst({
      where: { userId: member.userId },
      orderBy: { weekNumber: "desc" },
    });
    const weekNumber = (lastPost?.weekNumber || 0) + 1;

    // Create the post for the employee
    const post = await prisma.post.create({
      data: {
        userId: member.userId,
        content,
        imageUrl,
        weekNumber,
        status: scheduledFor ? "SCHEDULED" : "DRAFT",
        createdByAdminId: session.user.id,
        organizationId: orgId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        createdByAdmin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If scheduled, create the schedule record
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);

      if (scheduledDate <= new Date()) {
        // Clean up the post we just created
        await prisma.post.delete({ where: { id: post.id } });
        return NextResponse.json(
          { error: "Scheduled time must be in the future" },
          { status: 400 }
        );
      }

      await prisma.schedule.create({
        data: {
          userId: member.userId,
          postId: post.id,
          scheduledFor: scheduledDate,
          status: "PENDING",
        },
      });
    }

    // Fetch the complete post with schedule
    const completePost = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            linkedinAccessToken: true,
          },
        },
        createdByAdmin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        schedule: true,
      },
    });

    return NextResponse.json({ post: completePost });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
