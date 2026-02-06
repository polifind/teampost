import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
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

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, hasDraft } = await request.json();

    // Fetch user's writing preferences
    const writingPreferences = await prisma.writingPreference.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10, // Limit to most recent 10 preferences
    });

    // Fetch user's ghostwriter guidelines
    const guidelines = await prisma.ghostwriterGuideline.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch user's LinkedIn profile context
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { linkedinProfileContext: true },
    });

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Build writing preferences section if any exist
    let preferencesSection = "";
    if (writingPreferences.length > 0) {
      const preferencesList = writingPreferences
        .map((p) => `- ${p.preference}`)
        .join("\n");
      preferencesSection = `

**USER'S PERSONAL WRITING PREFERENCES (VERY IMPORTANT - apply these to EVERY post):**
${preferencesList}

These are specific preferences this user has provided based on their feedback on previous posts. Always apply these preferences when drafting posts for them.
`;
    }

    // Build ghostwriter guidelines section
    let guidelinesSection = "";
    if (guidelines.length > 0) {
      const guidelinesList = guidelines.map((g) => `- ${g.content}`).join("\n");
      guidelinesSection = `

**USER'S GHOSTWRITER GUIDELINES (ALWAYS FOLLOW THESE):**
${guidelinesList}

These are persistent instructions the user has set for their ghostwriter. Always follow these guidelines when drafting posts.
`;
    }

    // Build profile context section
    let profileSection = "";
    if (user?.linkedinProfileContext) {
      profileSection = `

**USER'S PROFESSIONAL BACKGROUND:**
${user.linkedinProfileContext}

Use this background to make posts more personalized and authentic to their professional identity.
`;
    }

    // Build the system prompt for the ghostwriter
    const systemPrompt = `You are a LinkedIn ghostwriter having a conversation with someone to help them create a viral post. Your job is to:

1. LISTEN to their story/idea
2. ASK follow-up questions to get more specific details, emotions, and context
3. When you have enough detail, GENERATE a draft post

CONVERSATION STYLE:
- Be casual and friendly, like texting a friend
- Ask ONE focused follow-up question at a time
- Look for: specific numbers, names, emotions, turning points, dialogue, timeline details
- Don't be generic - dig into THEIR specific story

WHEN TO ASK FOLLOW-UPS (do this 1-2 times before drafting):
- "What was the exact moment when...?"
- "How did that make you feel?"
- "What did they actually say?"
- "What were you thinking right before...?"
- "What's a specific detail you remember?"
- "Can you give me a specific number or amount?"

WHEN TO DRAFT A POST:
- After 2-3 exchanges with good detail
- If the user says something like "that's it" or "make the post"
- If you have enough specific details for a compelling story

POST STYLE (when drafting) - THIS IS CRITICAL:
- Start with a PUNCHY hook line that grabs attention. Examples:
  - "I'm a Harvard dropout."
  - "We lost our first customer."
  - "I got turned down for a job at Chick-fil-A."
  - "Someone stole my idea."
- ULTRA SHORT sentences. 2-7 words max per line. One thought per line.
- Every line should have a line break after it
- Use specific details: exact numbers, real names, actual places, specific days
- Build TENSION with each line - make reader want to keep scrolling
- The payoff should be surprising or emotionally resonant
- End with a punchy takeaway, question, or mic-drop line
- DON'T add any signature or tagline at the end
- NO corporate jargon, NO hashtags, NO emojis, NO "I'm excited to announce"
- NEVER use em-dashes (—). Use periods, commas, or line breaks instead. Em-dashes are associated with AI writing.
- 150-250 words ideal
- Write like someone telling a story at a bar, not a LinkedIn influencer

EXAMPLE POST STRUCTURE:
Hook (shocking/surprising statement)
↓
Context (2-3 lines setting scene)
↓
Rising tension (build the conflict/challenge)
↓
Turning point (what changed)
↓
Resolution/lesson (short, punchy)

RESPONSE FORMAT:
- If asking a follow-up: Just respond naturally with your question
- If generating a draft: Start with a brief message like "Love this story. Here's a draft:" then include the draft wrapped in <draft> tags

Example draft:
"This is powerful. Here's your draft:

<draft>
I got rejected from Chick-fil-A.

Yes, that Chick-fil-A.

I was 16.
Needed spending money.
Walked in with my best polo shirt.

The manager said I wasn't 'customer service material.'

Fast forward 15 years.
I just closed a $50M Series B.

That same manager?
He applied to work for me last month.

I didn't hire him.

Just kidding.
I did.

Because talent is talent.
And everyone deserves a second chance.

Even the guy who said I wasn't customer service material.

</draft>

What do you think?"
${preferencesSection}${guidelinesSection}${profileSection}`;

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const response = await getAnthropicClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Check if response contains a draft
    const draftMatch = responseText.match(/<draft>([\s\S]*?)<\/draft>/);
    let draft = null;
    let message = responseText;

    if (draftMatch) {
      draft = draftMatch[1].trim();
      // Remove the draft tags from the message
      message = responseText.replace(/<draft>[\s\S]*?<\/draft>/, "").trim();
    }

    return NextResponse.json({
      message,
      draft,
    });
  } catch (error) {
    console.error("Conversation error:", error);
    return NextResponse.json(
      { error: "Failed to process conversation" },
      { status: 500 }
    );
  }
}
