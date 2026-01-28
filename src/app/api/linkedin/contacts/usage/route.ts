import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST - Update usage count for contacts (called when a post is created with tags)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { contactIds } = body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: "Contact IDs array is required" },
        { status: 400 }
      );
    }

    // Update usage count and lastUsedAt for all specified contacts
    await prisma.linkedInContact.updateMany({
      where: {
        id: { in: contactIds },
        userId: session.user.id, // Ensure user owns these contacts
      },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update contact usage error:", error);
    return NextResponse.json(
      { error: "Failed to update contact usage" },
      { status: 500 }
    );
  }
}
