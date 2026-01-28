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

// GET - Get organization notes
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

    // Any member can view notes
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: orgId,
        email: session.user.email.toLowerCase(),
      },
    });

    const isSuperAdmin = session.user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    if (!membership && !isSuperAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notes = await prisma.organizationNote.findMany({
      where: { organizationId: orgId },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST - Create organization note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: orgId } = await params;

    if (!session?.user?.email || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorized = await isAuthorized(session.user.email, orgId);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, weekStart, isPinned = false } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const note = await prisma.organizationNote.create({
      data: {
        organizationId: orgId,
        title,
        content,
        weekStart: weekStart ? new Date(weekStart) : null,
        isPinned,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}

// PATCH - Update note
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

    const { noteId, title, content, weekStart, isPinned } = await request.json();

    if (!noteId) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    const note = await prisma.organizationNote.update({
      where: { id: noteId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(weekStart !== undefined && { weekStart: weekStart ? new Date(weekStart) : null }),
        ...(isPinned !== undefined && { isPinned }),
      },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

// DELETE - Delete note
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

    const { noteId } = await request.json();

    if (!noteId) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    await prisma.organizationNote.delete({
      where: { id: noteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
