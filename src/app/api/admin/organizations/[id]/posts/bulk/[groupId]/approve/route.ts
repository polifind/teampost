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

interface ApprovalItem {
  postId: string;
  approved: boolean;
  content?: string; // Optional updated content
  scheduledFor?: string; // Optional schedule time
}

// POST - Approve or reject bulk drafts
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: orgId, groupId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorized = await isAuthorized(session.user.email, orgId);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { approvals } = await request.json() as { approvals: ApprovalItem[] };

    if (!approvals || !approvals.length) {
      return NextResponse.json(
        { error: "Approvals array is required" },
        { status: 400 }
      );
    }

    // Verify all posts belong to this bulk group and org
    const posts = await prisma.post.findMany({
      where: {
        id: { in: approvals.map((a) => a.postId) },
        organizationId: orgId,
        bulkDraftGroupId: groupId,
      },
    });

    if (posts.length !== approvals.length) {
      return NextResponse.json(
        { error: "Some posts were not found or don't belong to this group" },
        { status: 400 }
      );
    }

    const results = [];

    for (const approval of approvals) {
      if (approval.approved) {
        // Update the post
        const updateData: any = {
          bulkDraftStatus: "APPROVED",
        };

        // Update content if provided
        if (approval.content) {
          updateData.content = approval.content;
        }

        // Set status based on whether we're scheduling
        if (approval.scheduledFor) {
          const scheduledDate = new Date(approval.scheduledFor);
          if (scheduledDate <= new Date()) {
            return NextResponse.json(
              { error: `Scheduled time for post ${approval.postId} must be in the future` },
              { status: 400 }
            );
          }
          updateData.status = "SCHEDULED";
        }

        const post = await prisma.post.update({
          where: { id: approval.postId },
          data: updateData,
          include: {
            user: true,
          },
        });

        // Create schedule if scheduling
        if (approval.scheduledFor) {
          const scheduledDate = new Date(approval.scheduledFor);

          // Check if schedule already exists
          const existingSchedule = await prisma.schedule.findUnique({
            where: { postId: post.id },
          });

          if (existingSchedule) {
            await prisma.schedule.update({
              where: { id: existingSchedule.id },
              data: { scheduledFor: scheduledDate },
            });
          } else {
            await prisma.schedule.create({
              data: {
                userId: post.userId,
                postId: post.id,
                scheduledFor: scheduledDate,
                status: "PENDING",
              },
            });
          }
        }

        results.push({ postId: approval.postId, status: "approved" });
      } else {
        // Reject - delete the post
        await prisma.post.delete({
          where: { id: approval.postId },
        });

        results.push({ postId: approval.postId, status: "rejected" });
      }
    }

    // Fetch remaining posts in the group
    const remainingPosts = await prisma.post.findMany({
      where: {
        organizationId: orgId,
        bulkDraftGroupId: groupId,
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
    });

    return NextResponse.json({
      results,
      remainingPosts,
    });
  } catch (error) {
    console.error("Error approving bulk drafts:", error);
    return NextResponse.json(
      { error: "Failed to approve bulk drafts" },
      { status: 500 }
    );
  }
}
