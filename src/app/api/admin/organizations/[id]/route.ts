import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ADMIN_EMAIL = "rohan.pavuluri@gmail.com";

// GET - Get organization details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email || session.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
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
          orderBy: [{ role: "asc" }, { createdAt: "asc" }],
        },
        notes: {
          orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
          include: {
            createdBy: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}

// PATCH - Update organization
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email || session.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await request.json();

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

// DELETE - Delete organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email || session.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.organization.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}
