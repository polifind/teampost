import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";
import { verifySlackRequest } from "@/lib/slack-verify";
import { generateSlackPost, parseScheduleFromMessage } from "@/lib/slack-claude";
import { buildDraftMessage, buildGeneratingMessage, buildErrorMessage, buildWelcomeMessage, buildPhotoAddedMessage } from "@/lib/slack-blocks";

interface SlackFile {
  id: string;
  name: string;
  mimetype: string;
  url_private: string;
  url_private_download?: string;
}

interface SlackEvent {
  type: string;
  challenge?: string;
  event?: {
    type: string;
    user?: string;
    channel?: string;
    text?: string;
    ts?: string;
    thread_ts?: string;
    channel_type?: string;
    bot_id?: string;
    files?: SlackFile[];
    subtype?: string;
  };
}

// Send a message to Slack
async function sendSlackMessage(
  botToken: string,
  channel: string,
  message: { text: string; blocks?: unknown[] },
  threadTs?: string
): Promise<{ ok: boolean; ts?: string; error?: string }> {
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel,
      text: message.text,
      blocks: message.blocks,
      thread_ts: threadTs,
    }),
  });

  return response.json();
}

// Update a message in Slack
async function updateSlackMessage(
  botToken: string,
  channel: string,
  ts: string,
  message: { text: string; blocks?: unknown[] }
): Promise<{ ok: boolean; error?: string }> {
  const response = await fetch("https://slack.com/api/chat.update", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel,
      ts,
      text: message.text,
      blocks: message.blocks,
    }),
  });

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const timestamp = request.headers.get("x-slack-request-timestamp");
    const signature = request.headers.get("x-slack-signature");

    // Verify request signature
    if (!verifySlackRequest(body, timestamp, signature)) {
      console.error("Invalid Slack signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event: SlackEvent = JSON.parse(body);

    // Handle URL verification challenge
    if (event.type === "url_verification") {
      return NextResponse.json({ challenge: event.challenge });
    }

    // Handle events
    if (event.type === "event_callback" && event.event) {
      const slackEvent = event.event;

      // Ignore bot messages to prevent loops
      if (slackEvent.bot_id) {
        return NextResponse.json({ ok: true });
      }

      // Handle DM messages
      if (slackEvent.type === "message" && slackEvent.channel_type === "im") {
        // Check if this is a file upload (photo)
        if (slackEvent.files && slackEvent.files.length > 0) {
          // Handle file upload - attach to existing draft if in thread, or just save to library
          handleFileUpload(slackEvent).catch(console.error);
          return NextResponse.json({ ok: true });
        }

        // Process text message asynchronously and return immediately (Slack expects response within 3s)
        handleDMMessage(slackEvent).catch(console.error);
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Slack events error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * Handle file uploads from Slack - download the file, save to photo library,
 * and attach to current draft if in a thread
 */
async function handleFileUpload(event: {
  user?: string;
  channel?: string;
  ts?: string;
  thread_ts?: string;
  files?: SlackFile[];
}) {
  const { user: slackUserId, channel, ts, thread_ts, files } = event;

  if (!slackUserId || !channel || !files || files.length === 0) {
    console.error("Missing required fields for file upload");
    return;
  }

  // Find the Slack integration for this user
  const integration = await prisma.slackIntegration.findFirst({
    where: { slackUserId, isActive: true },
    include: { user: true },
  });

  if (!integration) {
    console.log(`No integration found for Slack user ${slackUserId}`);
    return;
  }

  const { botToken, user } = integration;

  // Process only image files
  const imageFiles = files.filter((f) => f.mimetype?.startsWith("image/"));
  if (imageFiles.length === 0) {
    await sendSlackMessage(
      botToken,
      channel,
      { text: "I can only process image files. Please upload a photo (PNG, JPG, GIF, etc.)." },
      ts
    );
    return;
  }

  try {
    // Download the first image from Slack
    const file = imageFiles[0];
    const downloadUrl = file.url_private_download || file.url_private;

    const fileResponse = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${botToken}` },
    });

    if (!fileResponse.ok) {
      throw new Error(`Failed to download file: ${fileResponse.status}`);
    }

    const fileBuffer = await fileResponse.arrayBuffer();

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 50);
    const filename = `photos/${user.id}/${timestamp}-${randomSuffix}-${sanitizedName}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, fileBuffer, {
      access: "public",
      contentType: file.mimetype,
    });

    // Save to user's photo library
    const photo = await prisma.photoLibrary.create({
      data: {
        userId: user.id,
        imageUrl: blob.url,
        filename: file.name,
      },
    });

    // Check if this is a reply to an existing draft thread
    const threadIdentifier = thread_ts || ts;
    const existingDraft = await prisma.slackDraft.findFirst({
      where: {
        slackIntegrationId: integration.id,
        slackThreadTs: threadIdentifier,
        status: "DRAFTING",
      },
    });

    if (existingDraft) {
      // Update the draft with the image
      await prisma.slackDraft.update({
        where: { id: existingDraft.id },
        data: { imageUrl: blob.url },
      });

      // Send confirmation in thread
      await sendSlackMessage(
        botToken,
        channel,
        buildPhotoAddedMessage(blob.url, true),
        threadIdentifier
      );
    } else {
      // No existing draft - just confirm photo was saved to library
      await sendSlackMessage(
        botToken,
        channel,
        buildPhotoAddedMessage(blob.url, false),
        ts
      );
    }
  } catch (error) {
    console.error("Error handling file upload:", error);
    await sendSlackMessage(
      botToken,
      channel,
      buildErrorMessage("Failed to process the photo. Please try again."),
      ts
    );
  }
}

async function handleDMMessage(event: {
  user?: string;
  channel?: string;
  text?: string;
  ts?: string;
}) {
  const { user: slackUserId, channel, text, ts } = event;

  if (!slackUserId || !channel || !text || !ts) {
    console.error("Missing required event fields");
    return;
  }

  // Find the Slack integration for this user
  const integration = await prisma.slackIntegration.findFirst({
    where: {
      slackUserId,
      isActive: true,
    },
    include: {
      user: {
        include: {
          writingPreferences: { where: { isActive: true } },
          ghostwriterGuidelines: { where: { isActive: true } },
        },
      },
    },
  });

  if (!integration) {
    // User hasn't connected their TeamPost account
    // We can't send a message without a bot token, so just log
    console.log(`No integration found for Slack user ${slackUserId}`);
    return;
  }

  const { botToken, user } = integration;

  // Check for simple greetings
  const lowerText = text.toLowerCase().trim();
  if (lowerText === "hi" || lowerText === "hello" || lowerText === "hey" || lowerText === "help") {
    await sendSlackMessage(botToken, channel, buildWelcomeMessage());
    return;
  }

  // Send "generating" message
  const genResult = await sendSlackMessage(
    botToken,
    channel,
    buildGeneratingMessage()
  );

  if (!genResult.ok || !genResult.ts) {
    console.error("Failed to send generating message:", genResult.error);
    return;
  }

  try {
    // Parse scheduling info from the message (e.g., "Monday at 8:55am EST")
    const parsedSchedule = await parseScheduleFromMessage(text);

    // Generate the post
    const draftContent = await generateSlackPost(
      text,
      user.name || undefined,
      user.writingPreferences,
      user.ghostwriterGuidelines,
      user.linkedinProfileContext || undefined
    );

    // Create draft in database with parsed schedule
    const draft = await prisma.slackDraft.create({
      data: {
        slackIntegrationId: integration.id,
        slackChannelId: channel,
        slackThreadTs: ts,
        originalInput: text,
        draftContent,
        scheduleDayOfWeek: parsedSchedule.dayOfWeek,
        scheduleTime: parsedSchedule.time,
        scheduleTimezone: parsedSchedule.timezone,
        status: "DRAFTING",
      },
    });

    // Update message with draft and action buttons
    await updateSlackMessage(
      botToken,
      channel,
      genResult.ts,
      buildDraftMessage(draft.id, draftContent, parsedSchedule)
    );
  } catch (error) {
    console.error("Error generating post:", error);

    // Update message with error
    await updateSlackMessage(
      botToken,
      channel,
      genResult.ts,
      buildErrorMessage("Failed to generate post. Please try again.")
    );
  }
}
