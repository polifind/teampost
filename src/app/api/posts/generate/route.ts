import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateLinkedInPosts } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's voice notes with transcriptions
    const voiceNotes = await prisma.voiceNote.findMany({
      where: {
        userId: session.user.id,
        transcription: { not: null },
      },
      orderBy: { questionIndex: "asc" },
    });

    if (voiceNotes.length === 0) {
      return NextResponse.json(
        { error: "No voice notes found. Please record at least one answer." },
        { status: 400 }
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    // Generate posts using Claude
    const generatedPosts = await generateLinkedInPosts(
      voiceNotes.map((vn) => ({
        questionIndex: vn.questionIndex,
        questionText: vn.questionText,
        transcription: vn.transcription!,
      })),
      user?.name || undefined
    );

    // Delete existing draft posts for this user
    await prisma.post.deleteMany({
      where: {
        userId: session.user.id,
        status: "DRAFT",
      },
    });

    // Create new posts
    const posts = await Promise.all(
      generatedPosts.map(async (content, index) => {
        const sourceNote = voiceNotes[index];
        return prisma.post.create({
          data: {
            userId: session.user.id,
            content,
            sourceNoteId: sourceNote?.id || null,
            weekNumber: index + 1,
            status: "DRAFT",
          },
        });
      })
    );

    // Mark onboarding as completed
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingCompleted: true },
    });

    return NextResponse.json({
      message: "Posts generated successfully",
      posts: posts.map((p) => ({
        id: p.id,
        content: p.content,
        weekNumber: p.weekNumber,
        status: p.status,
      })),
    });
  } catch (error) {
    console.error("Post generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate posts. Please try again." },
      { status: 500 }
    );
  }
}
