import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { formatWritingSamplesForPrompt } from "@/lib/writing-samples";

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

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { selectedLibraryItemIds: itemIds, customInstructions } = await request.json();

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        linkedinProfileContext: true,
        ghostwriterGuidelines: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
        writingPreferences: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        writingSamples: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { content: true, source: true },
        },
      },
    });

    // Fetch library items
    let libraryItems;
    if (itemIds && Array.isArray(itemIds) && itemIds.length > 0) {
      // Use specific items if provided
      libraryItems = await prisma.lifeLibraryItem.findMany({
        where: {
          id: { in: itemIds },
          userId: session.user.id,
          processingStatus: "COMPLETED",
        },
      });
    } else {
      // Otherwise, randomly select from completed items
      const allItems = await prisma.lifeLibraryItem.findMany({
        where: {
          userId: session.user.id,
          processingStatus: "COMPLETED",
        },
      });

      if (allItems.length === 0) {
        return NextResponse.json(
          { error: "No library content available. Upload some content first!" },
          { status: 400 }
        );
      }

      // Randomly select 1-3 items
      const numItems = Math.min(3, allItems.length);
      const shuffled = allItems.sort(() => 0.5 - Math.random());
      libraryItems = shuffled.slice(0, numItems);
    }

    if (libraryItems.length === 0) {
      return NextResponse.json(
        { error: "No valid library items found" },
        { status: 400 }
      );
    }

    // Build the prompt
    let profileContext = "";
    if (user?.linkedinProfileContext) {
      profileContext = `
USER'S PROFESSIONAL BACKGROUND:
${user.linkedinProfileContext}
`;
    }

    let guidelinesContext = "";
    if (user?.ghostwriterGuidelines && user.ghostwriterGuidelines.length > 0) {
      guidelinesContext = `
USER'S GHOSTWRITER GUIDELINES (ALWAYS FOLLOW THESE):
${user.ghostwriterGuidelines.map((g) => `- ${g.content}`).join("\n")}
`;
    }

    let preferencesContext = "";
    if (user?.writingPreferences && user.writingPreferences.length > 0) {
      preferencesContext = `
USER'S WRITING PREFERENCES:
${user.writingPreferences.map((p) => `- ${p.preference}`).join("\n")}
`;
    }

    const samplesContext = formatWritingSamplesForPrompt(user?.writingSamples || []);

    const libraryContent = libraryItems
      .map(
        (item) => `
SOURCE: ${item.type} - "${item.title}"
CONTENT:
${item.extractedContent || item.extractedSummary || "No content extracted"}
`
      )
      .join("\n---\n");

    // Build custom instructions section if provided
    let customInstructionsContext = "";
    if (customInstructions && customInstructions.trim()) {
      customInstructionsContext = `
CUSTOM INSTRUCTIONS FROM USER (PRIORITIZE THESE):
${customInstructions.trim()}

`;
    }

    const systemPrompt = `You are a LinkedIn ghostwriter creating a post based on the user's personal library of content. Your job is to:

1. Read through the source material from their library
2. Find an interesting story, insight, or lesson
3. Create a viral LinkedIn post in their voice

${profileContext}
${guidelinesContext}
${preferencesContext}
${samplesContext}
${customInstructionsContext}
POST STYLE - THIS IS CRITICAL:
- Start with a PUNCHY hook line that grabs attention. Examples:
  - "I'm a Harvard dropout."
  - "We lost our first customer."
  - "I got turned down for a job at Chick-fil-A."
  - "Someone stole my idea."
- ULTRA SHORT sentences. 2-7 words max per line. One thought per line.
- Every line should have a line break after it
- Use specific details from the source: exact numbers, real names, actual places
- Build TENSION with each line - make reader want to keep scrolling
- The payoff should be surprising or emotionally resonant
- End with a punchy takeaway, question, or mic-drop line
- DON'T add any signature or tagline at the end
- NO corporate jargon, NO hashtags, NO emojis, NO "I'm excited to announce"
- NEVER use em-dashes (—). Use periods, commas, or line breaks instead.
- 150-250 words ideal
- Write like someone telling a story at a bar, not a LinkedIn influencer

IMPORTANT:
- Only use information that is ACTUALLY in the source material
- NO HALLUCINATION - don't make up facts, numbers, or details
- If the source is about someone else, reframe it as the user sharing the insight or lesson they learned

Return ONLY the post content, nothing else.`;

    const response = await getAnthropicClient().messages.create({
      model: "claude-opus-4-5-20251101",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Create a LinkedIn post based on this source material from my library:

${libraryContent}

Create a compelling post that draws from this content. The post should feel authentic to me and follow all the style guidelines.`,
        },
      ],
    });

    const draft =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Update usage counts for the items used
    await prisma.lifeLibraryItem.updateMany({
      where: { id: { in: libraryItems.map((i) => i.id) } },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    return NextResponse.json({
      draft: draft.trim(),
      sourcedFrom: libraryItems.map((i) => ({
        id: i.id,
        title: i.title,
        type: i.type,
      })),
    });
  } catch (error) {
    console.error("Magic draft error:", error);
    return NextResponse.json(
      { error: "Failed to generate magic draft" },
      { status: 500 }
    );
  }
}

// GET - Get library items count for Magic Draft availability
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await prisma.lifeLibraryItem.count({
      where: {
        userId: session.user.id,
        processingStatus: "COMPLETED",
      },
    });

    return NextResponse.json({
      available: count > 0,
      count,
    });
  } catch (error) {
    console.error("Error checking magic draft availability:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
