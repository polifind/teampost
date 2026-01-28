import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateBulkVariations } from "@/lib/claude";
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

// POST - Create bulk variations for multiple employees
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

    const { sourceContent, targetMemberIds, variationContext } = await request.json();

    if (!sourceContent || !targetMemberIds || !targetMemberIds.length) {
      return NextResponse.json(
        { error: "Source content and target member IDs are required" },
        { status: 400 }
      );
    }

    // Get the target members and verify they belong to this org
    const members = await prisma.organizationMember.findMany({
      where: {
        id: { in: targetMemberIds },
        organizationId: orgId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            linkedinProfileContext: true,
            writingPreferences: {
              where: { isActive: true },
              select: { preference: true },
            },
          },
        },
      },
    });

    // Filter to only members with linked accounts
    const validMembers = members.filter((m) => m.userId && m.user);

    if (validMembers.length === 0) {
      return NextResponse.json(
        { error: "No valid members found. Target members must have signed up." },
        { status: 400 }
      );
    }

    // Prepare employee contexts for AI generation
    const employeeContexts = validMembers.map((m) => ({
      name: m.user!.name || m.email,
      linkedinProfileContext: m.user!.linkedinProfileContext || undefined,
      writingPreferences: m.user!.writingPreferences.map((p) => p.preference),
    }));

    // Generate variations using Claude
    const variations = await generateBulkVariations(
      sourceContent,
      employeeContexts,
      variationContext
    );

    // Generate a unique bulk draft group ID
    const bulkDraftGroupId = randomBytes(12).toString("hex");

    // Create posts for each employee with PENDING_APPROVAL status
    const createdPosts = [];

    for (let i = 0; i < validMembers.length; i++) {
      const member = validMembers[i];
      const content = variations[i];

      // Get the next week number for this user
      const lastPost = await prisma.post.findFirst({
        where: { userId: member.userId! },
        orderBy: { weekNumber: "desc" },
      });
      const weekNumber = (lastPost?.weekNumber || 0) + 1;

      const post = await prisma.post.create({
        data: {
          userId: member.userId!,
          content,
          weekNumber,
          status: "DRAFT",
          createdByAdminId: session.user.id,
          organizationId: orgId,
          bulkDraftGroupId,
          bulkDraftStatus: "PENDING_APPROVAL",
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
        },
      });

      createdPosts.push(post);
    }

    return NextResponse.json({
      bulkDraftGroupId,
      posts: createdPosts,
      originalContent: sourceContent,
    });
  } catch (error) {
    console.error("Error creating bulk variations:", error);
    return NextResponse.json(
      { error: "Failed to create bulk variations" },
      { status: 500 }
    );
  }
}
