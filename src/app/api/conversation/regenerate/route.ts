import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

// Lazy initialization to avoid build errors when ANTHROPIC_API_KEY is not set
let _anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _anthropic;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentDraft, messages } = await request.json();

    if (!currentDraft || !messages) {
      return NextResponse.json(
        { error: "Current draft and messages are required" },
        { status: 400 }
      );
    }

    // Extract the conversation context
    const conversationContext = messages
      .filter((m: { role: string }) => m.role === "user")
      .map((m: { content: string }) => m.content)
      .join("\n\n");

    const prompt = `You are a LinkedIn ghostwriter. Rewrite this post with a COMPLETELY DIFFERENT angle, hook, or narrative structure.

ORIGINAL STORY/CONTEXT from the conversation:
${conversationContext}

CURRENT DRAFT (don't copy this structure):
${currentDraft}

REQUIREMENTS:
- Use the SAME story/content but tell it differently
- Try a DIFFERENT hook - start with a shocking/surprising first line
- ULTRA SHORT sentences. 2-7 words max per line.
- Every line should have a line break after it
- Use specific details: exact numbers, real names, actual places, specific days
- Build TENSION with each line - make reader want to keep scrolling
- End with a punchy takeaway, question, or mic-drop line
- NO corporate jargon, NO hashtags, NO emojis, NO signatures
- 150-250 words
- Write like someone telling a story at a bar, not a LinkedIn influencer

Return ONLY the new post, nothing else.`;

    const response = await getAnthropicClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const draft =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";

    return NextResponse.json({ draft });
  } catch (error) {
    console.error("Regenerate error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate post" },
      { status: 500 }
    );
  }
}
