import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { formatWritingSamplesForPrompt } from "@/lib/writing-samples";

// This endpoint is called by a cron job to generate drafts based on user cadences
// Run every hour: 0 * * * *

// Lazy initialization for Anthropic
let _anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _anthropic;
}

// Send a message to Slack DM
async function sendSlackMessage(
  botToken: string,
  channelId: string,
  text: string,
  blocks?: object[]
): Promise<boolean> {
  try {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({
        channel: channelId,
        text,
        blocks,
      }),
    });

    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error("Failed to send Slack message:", error);
    return false;
  }
}

// Open a DM channel with a user
async function openSlackDM(botToken: string, userId: string): Promise<string | null> {
  try {
    const response = await fetch("https://slack.com/api/conversations.open", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({
        users: userId,
      }),
    });

    const data = await response.json();
    if (data.ok && data.channel?.id) {
      return data.channel.id;
    }
    return null;
  } catch (error) {
    console.error("Failed to open Slack DM:", error);
    return null;
  }
}

// Generate a magic draft for a user
async function generateMagicDraft(
  userId: string,
  selectedItemIds: string[]
): Promise<{ draft: string; sourcedFrom: { id: string; title: string; type: string }[] } | null> {
  try {
    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    if (selectedItemIds.length > 0) {
      libraryItems = await prisma.lifeLibraryItem.findMany({
        where: {
          id: { in: selectedItemIds },
          userId,
          processingStatus: "COMPLETED",
        },
      });
    } else {
      // Use all completed items if none specified
      const allItems = await prisma.lifeLibraryItem.findMany({
        where: {
          userId,
          processingStatus: "COMPLETED",
        },
      });

      if (allItems.length === 0) {
        return null;
      }

      // Randomly select 1-3 items
      const numItems = Math.min(3, allItems.length);
      const shuffled = allItems.sort(() => 0.5 - Math.random());
      libraryItems = shuffled.slice(0, numItems);
    }

    if (libraryItems.length === 0) {
      return null;
    }

    // Build the prompt (same as in magic-draft route)
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

    const systemPrompt = `You are a LinkedIn ghostwriter creating a post based on the user's personal library of content. Your job is to:

1. Read through the source material from their library
2. Find an interesting story, insight, or lesson
3. Create a viral LinkedIn post in their voice

${profileContext}
${guidelinesContext}
${preferencesContext}
${samplesContext}

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

    // Update usage counts
    await prisma.lifeLibraryItem.updateMany({
      where: { id: { in: libraryItems.map((i) => i.id) } },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    return {
      draft: draft.trim(),
      sourcedFrom: libraryItems.map((i) => ({
        id: i.id,
        title: i.title || "Untitled",
        type: i.type,
      })),
    };
  } catch (error) {
    console.error("Failed to generate magic draft:", error);
    return null;
  }
}

// Build Slack blocks for the draft message
function buildCadenceDraftBlocks(
  draftContent: string,
  sourcedFrom: { id: string; title: string; type: string }[],
  postId: string
): object[] {
  // Truncate content for Slack (3000 char limit)
  const displayContent =
    draftContent.length > 2900
      ? draftContent.substring(0, 2900) + "\n\n_[Content truncated]_"
      : draftContent;

  const sourcesText = sourcedFrom
    .map((s) => `• ${s.type}: ${s.title}`)
    .join("\n");

  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "✨ *Your scheduled Magic Draft is ready!*\n\nI've generated a new LinkedIn post based on your library:",
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: displayContent,
      },
    },
    {
      type: "divider",
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `📚 *Sources used:*\n${sourcesText}`,
        },
      ],
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "✅ Approve Draft",
            emoji: true,
          },
          style: "primary",
          action_id: "approve_cadence_draft",
          value: postId,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "🗑️ Discard",
            emoji: true,
          },
          action_id: "discard_cadence_draft",
          value: postId,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "📝 View in TeamPost",
            emoji: true,
          },
          url: `${process.env.NEXTAUTH_URL || "https://teampost.vercel.app"}/posts`,
          action_id: "view_in_teampost",
        },
      ],
    },
  ];
}

// Calculate next generation time
function calculateNextGenerationTime(
  frequency: string,
  dayOfWeek: string | null,
  dayOfMonth: number | null,
  timeOfDay: string,
  timezone: string
): Date {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(":").map(Number);

  // Get current time in user's timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const currentYear = parseInt(parts.find((p) => p.type === "year")?.value || "2024");
  const currentMonth = parseInt(parts.find((p) => p.type === "month")?.value || "1") - 1;
  const currentDay = parseInt(parts.find((p) => p.type === "day")?.value || "1");

  let targetDate = new Date(currentYear, currentMonth, currentDay, hours, minutes, 0);

  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentDayOfWeek = new Date(currentYear, currentMonth, currentDay).getDay();

  switch (frequency) {
    case "DAILY":
      targetDate.setDate(targetDate.getDate() + 1);
      break;

    case "WEEKLY":
      if (dayOfWeek) {
        const targetDayIndex = daysOfWeek.indexOf(dayOfWeek.toLowerCase());
        let daysUntilTarget = targetDayIndex - currentDayOfWeek;
        if (daysUntilTarget <= 0) daysUntilTarget += 7;
        targetDate.setDate(targetDate.getDate() + daysUntilTarget);
      }
      break;

    case "BIWEEKLY":
      if (dayOfWeek) {
        const targetDayIndex = daysOfWeek.indexOf(dayOfWeek.toLowerCase());
        let daysUntilTarget = targetDayIndex - currentDayOfWeek;
        if (daysUntilTarget <= 0) daysUntilTarget += 14;
        else daysUntilTarget += 7;
        targetDate.setDate(targetDate.getDate() + daysUntilTarget);
      }
      break;

    case "MONTHLY":
      if (dayOfMonth) {
        targetDate.setMonth(targetDate.getMonth() + 1);
        targetDate.setDate(dayOfMonth);
      }
      break;
  }

  return targetDate;
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find all active cadences that are due
    const dueCadences = await prisma.draftCadence.findMany({
      where: {
        isActive: true,
        nextGenerationAt: {
          lte: now,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            timezone: true,
            slackIntegration: {
              select: {
                botToken: true,
                slackUserId: true,
                isActive: true,
              },
            },
          },
        },
      },
      take: 10, // Process max 10 at a time to avoid timeout
    });

    if (dueCadences.length === 0) {
      return NextResponse.json({ message: "No cadences to process", processed: 0 });
    }

    const results = {
      processed: 0,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const cadence of dueCadences) {
      results.processed++;

      try {
        // Generate the draft
        const draftResult = await generateMagicDraft(
          cadence.userId,
          cadence.selectedLibraryItemIds
        );

        if (!draftResult) {
          results.failed++;
          results.errors.push(`Cadence ${cadence.id}: No library content available`);

          // Update next generation time anyway
          const nextTime = calculateNextGenerationTime(
            cadence.frequency,
            cadence.dayOfWeek,
            cadence.dayOfMonth,
            cadence.timeOfDay,
            cadence.user.timezone
          );

          await prisma.draftCadence.update({
            where: { id: cadence.id },
            data: {
              lastGeneratedAt: now,
              nextGenerationAt: nextTime,
            },
          });

          continue;
        }

        // Create a post as draft
        const post = await prisma.post.create({
          data: {
            userId: cadence.userId,
            content: draftResult.draft,
            status: "DRAFT",
            weekNumber: 0, // Not part of week-based scheduling
          },
        });

        // Deliver based on method
        if (
          cadence.deliveryMethod === "SLACK" &&
          cadence.user.slackIntegration?.isActive &&
          cadence.user.slackIntegration.botToken
        ) {
          // Send to Slack
          const channelId = await openSlackDM(
            cadence.user.slackIntegration.botToken,
            cadence.user.slackIntegration.slackUserId
          );

          if (channelId) {
            const blocks = buildCadenceDraftBlocks(
              draftResult.draft,
              draftResult.sourcedFrom,
              post.id
            );

            await sendSlackMessage(
              cadence.user.slackIntegration.botToken,
              channelId,
              "Your scheduled Magic Draft is ready!",
              blocks
            );
          }
        }

        // Calculate next generation time
        const nextTime = calculateNextGenerationTime(
          cadence.frequency,
          cadence.dayOfWeek,
          cadence.dayOfMonth,
          cadence.timeOfDay,
          cadence.user.timezone
        );

        // Update cadence
        await prisma.draftCadence.update({
          where: { id: cadence.id },
          data: {
            lastGeneratedAt: now,
            nextGenerationAt: nextTime,
          },
        });

        results.success++;
      } catch (error) {
        console.error(`Error processing cadence ${cadence.id}:`, error);
        results.failed++;
        results.errors.push(
          `Cadence ${cadence.id}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return NextResponse.json({
      message: "Cadence cron job completed",
      ...results,
    });
  } catch (error) {
    console.error("Cadence cron job error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
