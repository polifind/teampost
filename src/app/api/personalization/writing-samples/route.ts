import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const MAX_SAMPLES = 10;
const MAX_CONTENT_LENGTH = 5000;

// GET all writing samples for the user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const samples = await prisma.writingSample.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ samples });
  } catch (error) {
    console.error("Error fetching writing samples:", error);
    return NextResponse.json(
      { error: "Failed to fetch writing samples" },
      { status: 500 }
    );
  }
}

// POST - Create a new writing sample
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, source } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Sample content is required" },
        { status: 400 }
      );
    }

    if (!source || !source.trim()) {
      return NextResponse.json(
        { error: "Sample source is required" },
        { status: 400 }
      );
    }

    if (content.trim().length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Sample content must be under ${MAX_CONTENT_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Check sample count limit
    const existingCount = await prisma.writingSample.count({
      where: { userId: session.user.id },
    });

    if (existingCount >= MAX_SAMPLES) {
      return NextResponse.json(
        { error: `You can have up to ${MAX_SAMPLES} writing samples. Delete one to add another.` },
        { status: 400 }
      );
    }

    const sample = await prisma.writingSample.create({
      data: {
        userId: session.user.id,
        content: content.trim(),
        source: source.trim(),
        isActive: true,
      },
    });

    return NextResponse.json({ sample });
  } catch (error) {
    console.error("Error creating writing sample:", error);
    return NextResponse.json(
      { error: "Failed to create writing sample" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a writing sample
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Sample ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.writingSample.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Writing sample not found" },
        { status: 404 }
      );
    }

    await prisma.writingSample.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting writing sample:", error);
    return NextResponse.json(
      { error: "Failed to delete writing sample" },
      { status: 500 }
    );
  }
}
