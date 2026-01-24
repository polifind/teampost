import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPost, feedback, questionText, originalContent } = await request.json();

    if (!currentPost || !feedback) {
      return NextResponse.json(
        { error: "Current post and feedback are required" },
        { status: 400 }
      );
    }

    // Get user's existing writing preferences and profile context
    const [preferences, user] = await Promise.all([
      prisma.writingPreference.findMany({
        where: { userId: session.user.id, isActive: true },
        select: { preference: true, category: true },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { linkedinProfileContext: true },
      }),
    ]);

    const preferencesText = preferences.length > 0
      ? `\n\nIMPORTANT - User's writing preferences (learned from past feedback):\n${preferences.map(p => `- ${p.preference}`).join('\n')}`
      : '';

    const profileContext = user?.linkedinProfileContext
      ? `\n\nAUTHOR'S PROFESSIONAL BACKGROUND:\n${user.linkedinProfileContext}\n`
      : '';

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // First, regenerate the post based on feedback
    const regeneratePrompt = `You are a LinkedIn ghostwriter helping a user improve their post.
${profileContext}
CURRENT POST:
"""
${currentPost}
"""

USER'S FEEDBACK:
"${feedback}"

ORIGINAL CONTEXT (what the user shared):
"${originalContent || 'Not provided'}"

QUESTION THEY WERE ANSWERING:
"${questionText || 'Not provided'}"
${preferencesText}

Based on the user's feedback, rewrite the post. Apply their feedback precisely.

STYLE REQUIREMENTS:
1. Use very short sentences. One thought per line. Many line breaks.
2. Tell specific stories with concrete details.
3. Build tension - show the struggle before the win.
4. End sections with short, punchy lines.
5. Write like it was spoken, not written. Casual. Direct. Real.
6. NO hashtags, NO emojis, NO corporate jargon
7. 150-300 words
8. End with a single powerful line or question.

Return ONLY the revised post content, nothing else.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: regeneratePrompt,
        },
      ],
    });

    const newPostContent =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Now, extract any preferences/rules from the feedback to remember
    const extractPreferencesPrompt = `Analyze this user feedback about a LinkedIn post and extract any writing preferences or rules that should be remembered for future posts.

USER FEEDBACK: "${feedback}"

BEFORE: "${currentPost.substring(0, 200)}..."
AFTER APPLYING FEEDBACK: "${newPostContent.substring(0, 200)}..."

Extract 0-2 clear, actionable preferences. Only extract if there's a clear rule to remember.

Examples of good preferences:
- "Don't use emojis"
- "Keep posts under 200 words"
- "Avoid corporate jargon like 'synergy'"
- "Don't start posts with 'I'"
- "Include specific numbers and dates"
- "End with a question, not a statement"

Respond in JSON format:
{
  "preferences": [
    {"preference": "the rule", "category": "style|tone|length|content|avoid|structure"}
  ]
}

If no clear preferences can be extracted, return: {"preferences": []}`;

    const preferencesMessage = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: extractPreferencesPrompt,
        },
      ],
    });

    const preferencesText2 =
      preferencesMessage.content[0].type === "text"
        ? preferencesMessage.content[0].text
        : "{}";

    // Parse and save preferences
    let extractedPreferences: { preference: string; category: string }[] = [];
    try {
      const parsed = JSON.parse(preferencesText2);
      extractedPreferences = parsed.preferences || [];
    } catch {
      // If parsing fails, just continue without saving preferences
    }

    // Save new preferences to database
    if (extractedPreferences.length > 0) {
      await Promise.all(
        extractedPreferences.map((pref) =>
          prisma.writingPreference.create({
            data: {
              userId: session.user.id,
              preference: pref.preference,
              category: pref.category || "style",
              originalFeedback: feedback,
              exampleBefore: currentPost.substring(0, 500),
              exampleAfter: newPostContent.substring(0, 500),
            },
          })
        )
      );
    }

    return NextResponse.json({
      content: newPostContent.trim(),
      learnedPreferences: extractedPreferences,
    });
  } catch (error) {
    console.error("Error regenerating post:", error);
    return NextResponse.json(
      { error: "Failed to regenerate post" },
      { status: 500 }
    );
  }
}
