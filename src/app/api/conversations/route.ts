import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - List all conversations for user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: session.user.id,
        status: "IN_PROGRESS",
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        draftContent: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Conversations fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST - Create or update a conversation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, messages, draftContent, draftImageUrl } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Generate title from first user message
    const firstUserMessage = messages.find((m: { role: string }) => m.role === "user");
    const title = firstUserMessage
      ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "")
      : "New conversation";

    const messagesJson = JSON.stringify(messages);

    if (id) {
      // Update existing conversation
      const conversation = await prisma.conversation.update({
        where: {
          id,
          userId: session.user.id, // Ensure user owns this conversation
        },
        data: {
          messages: messagesJson,
          draftContent,
          draftImageUrl,
          title,
        },
      });

      return NextResponse.json({ conversation });
    } else {
      // Create new conversation
      const conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          title,
          messages: messagesJson,
          draftContent,
          draftImageUrl,
          status: "IN_PROGRESS",
        },
      });

      return NextResponse.json({ conversation });
    }
  } catch (error) {
    console.error("Conversation save error:", error);
    return NextResponse.json(
      { error: "Failed to save conversation" },
      { status: 500 }
    );
  }
}
