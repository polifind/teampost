import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

// Lazy initialization to avoid build errors when OPENAI_API_KEY is not set
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { questionIndex, questionText, audioData, duration } = body;

    if (questionIndex === undefined || !questionText) {
      return NextResponse.json(
        { error: "Question index and text are required" },
        { status: 400 }
      );
    }

    let transcription = "";

    // Transcribe audio if provided and OpenAI API key is available
    const openai = getOpenAIClient();
    if (audioData && openai) {
      try {
        // Convert base64 to buffer
        const audioBuffer = Buffer.from(audioData, "base64");

        // Create a File object for the OpenAI API
        const audioFile = new File([audioBuffer], "audio.webm", {
          type: "audio/webm",
        });

        const transcriptionResponse = await openai.audio.transcriptions.create({
          file: audioFile,
          model: "whisper-1",
          language: "en",
        });

        transcription = transcriptionResponse.text;
      } catch (transcriptionError) {
        console.error("Transcription error:", transcriptionError);
        // Continue without transcription if it fails
      }
    }

    // Upsert voice note (update if exists, create if not)
    const voiceNote = await prisma.voiceNote.upsert({
      where: {
        userId_questionIndex: {
          userId: session.user.id,
          questionIndex,
        },
      },
      update: {
        questionText,
        audioData: audioData || null,
        transcription: transcription || null,
        duration: duration || null,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        questionIndex,
        questionText,
        audioData: audioData || null,
        transcription: transcription || null,
        duration: duration || null,
      },
    });

    return NextResponse.json({
      id: voiceNote.id,
      questionIndex: voiceNote.questionIndex,
      transcription: voiceNote.transcription,
      duration: voiceNote.duration,
    });
  } catch (error) {
    console.error("Voice save error:", error);
    return NextResponse.json(
      { error: "Failed to save voice note" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const voiceNotes = await prisma.voiceNote.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        questionIndex: true,
        questionText: true,
        transcription: true,
        duration: true,
        createdAt: true,
      },
      orderBy: { questionIndex: "asc" },
    });

    return NextResponse.json({ voiceNotes });
  } catch (error) {
    console.error("Voice fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch voice notes" },
      { status: 500 }
    );
  }
}
