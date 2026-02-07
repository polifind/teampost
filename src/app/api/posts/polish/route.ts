import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { formatWritingSamplesForPrompt } from "@/lib/writing-samples";
import { formatStyleForPrompt } from "@/lib/writing-styles";

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

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Post content is required" },
        { status: 400 }
      );
    }

    // Fetch user's writing context
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        writingStyleId: true,
        ghostwriterGuidelines: {
          select: { content: true },
        },
        writingPreferences: {
          select: { preference: true },
        },
        writingSamples: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { content: true, source: true },
        },
      },
    });

    // Build context sections
    let contextSection = "";

    if (user?.writingStyleId) {
      const stylePrompt = formatStyleForPrompt(user.writingStyleId);
      if (stylePrompt) {
        contextSection += `\n${stylePrompt}\n`;
      }
    }

    if (user?.ghostwriterGuidelines && user.ghostwriterGuidelines.length > 0) {
      const guidelines = user.ghostwriterGuidelines
        .map((g) => `- ${g.content}`)
        .join("\n");
      contextSection += `\n**GHOSTWRITER GUIDELINES (follow these strictly):**\n${guidelines}\n`;
    }

    if (user?.writingPreferences && user.writingPreferences.length > 0) {
      const preferences = user.writingPreferences
        .map((p) => `- ${p.preference}`)
        .join("\n");
      contextSection += `\n**LEARNED WRITING PREFERENCES:**\n${preferences}\n`;
    }

    if (user?.writingSamples && user.writingSamples.length > 0) {
      contextSection += `\n${formatWritingSamplesForPrompt(user.writingSamples)}\n`;
    }

    const prompt = `You are a LinkedIn ghostwriter. Polish this post to make it more engaging, authentic, and impactful.

ORIGINAL POST:
${content}
${contextSection}
POLISH REQUIREMENTS:
- Keep EVERY fact, detail, number, name, and piece of information IDENTICAL — do NOT add, remove, or change any facts
- Improve sentence structure for punchiness and readability
- Break long paragraphs into shorter ones with more line breaks
- Use ultra-short sentences where they add impact (2-7 words)
- Strengthen the opening hook to stop scrollers
- End with a punchy takeaway, question, or mic-drop line
- NO corporate jargon, NO hashtags, NO emojis, NO signatures
- Keep the overall length similar to the original (don't drastically expand or shrink)
- Write like someone sharing a real story, not a LinkedIn influencer
- If the user has a writing style defined above, match it closely

Return ONLY the polished post content, nothing else. No preamble, no explanation.`;

    const response = await getAnthropicClient().messages.create({
      model: "claude-opus-4-5-20251101",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const polished =
      response.content[0].type === "text"
        ? response.content[0].text.trim()
        : "";

    return NextResponse.json({ content: polished });
  } catch (error) {
    console.error("Polish post error:", error);
    return NextResponse.json(
      { error: "Failed to polish post" },
      { status: 500 }
    );
  }
}
