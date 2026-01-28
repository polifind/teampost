import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all guidelines for the user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const guidelines = await prisma.ghostwriterGuideline.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ guidelines });
  } catch (error) {
    console.error("Error fetching guidelines:", error);
    return NextResponse.json(
      { error: "Failed to fetch guidelines" },
      { status: 500 }
    );
  }
}

// POST - Create a new guideline
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Guideline content is required" },
        { status: 400 }
      );
    }

    const guideline = await prisma.ghostwriterGuideline.create({
      data: {
        userId: session.user.id,
        content: content.trim(),
        isActive: true,
      },
    });

    return NextResponse.json({ guideline });
  } catch (error) {
    console.error("Error creating guideline:", error);
    return NextResponse.json(
      { error: "Failed to create guideline" },
      { status: 500 }
    );
  }
}

// PATCH - Update a guideline
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, content, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Guideline ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.ghostwriterGuideline.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Guideline not found" },
        { status: 404 }
      );
    }

    const updateData: { content?: string; isActive?: boolean } = {};
    if (content !== undefined) updateData.content = content.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    const guideline = await prisma.ghostwriterGuideline.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ guideline });
  } catch (error) {
    console.error("Error updating guideline:", error);
    return NextResponse.json(
      { error: "Failed to update guideline" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a guideline
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Guideline ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.ghostwriterGuideline.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Guideline not found" },
        { status: 404 }
      );
    }

    await prisma.ghostwriterGuideline.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting guideline:", error);
    return NextResponse.json(
      { error: "Failed to delete guideline" },
      { status: 500 }
    );
  }
}
