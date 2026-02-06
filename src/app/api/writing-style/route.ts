import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { WRITING_STYLES, STYLE_QUIZ_QUESTIONS, calculateStyleFromQuiz } from "@/lib/writing-styles";

// Get user's writing style and available styles
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        writingStyleId: true,
        writingStyleQuizAnswers: true,
      },
    });

    return NextResponse.json({
      currentStyleId: user?.writingStyleId || null,
      quizAnswers: user?.writingStyleQuizAnswers || null,
      availableStyles: Object.values(WRITING_STYLES).map((style) => ({
        id: style.id,
        name: style.name,
        description: style.description,
        characteristics: style.characteristics,
        exampleOpener: style.exampleOpener,
        bestFor: style.bestFor,
      })),
      quizQuestions: STYLE_QUIZ_QUESTIONS,
    });
  } catch (error) {
    console.error("Error fetching writing style:", error);
    return NextResponse.json(
      { error: "Failed to fetch writing style" },
      { status: 500 }
    );
  }
}

// Set user's writing style directly
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { styleId } = body;

    if (!styleId || !WRITING_STYLES[styleId]) {
      return NextResponse.json(
        { error: "Invalid style ID" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { writingStyleId: styleId },
    });

    return NextResponse.json({
      success: true,
      styleId,
      style: WRITING_STYLES[styleId],
    });
  } catch (error) {
    console.error("Error setting writing style:", error);
    return NextResponse.json(
      { error: "Failed to set writing style" },
      { status: 500 }
    );
  }
}

// Submit quiz answers to determine writing style
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { answers } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Quiz answers are required" },
        { status: 400 }
      );
    }

    // Calculate the primary style from quiz answers
    const { primaryStyle, scores } = calculateStyleFromQuiz(answers);

    // Save both the calculated style and the quiz answers
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        writingStyleId: primaryStyle,
        writingStyleQuizAnswers: answers,
      },
    });

    return NextResponse.json({
      success: true,
      primaryStyle,
      scores,
      style: WRITING_STYLES[primaryStyle],
    });
  } catch (error) {
    console.error("Error processing writing style quiz:", error);
    return NextResponse.json(
      { error: "Failed to process quiz" },
      { status: 500 }
    );
  }
}
