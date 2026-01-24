import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { audioData } = await request.json();

    if (!audioData) {
      return NextResponse.json(
        { error: "Audio data is required" },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioData, "base64");

    // Create a File object for OpenAI
    const audioFile = new File([audioBuffer], "audio.webm", {
      type: "audio/webm",
    });

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
    });

    return NextResponse.json({
      transcription: transcription.text,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
