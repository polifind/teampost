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
    const retryNum = request.headers.get("x-slack-retry-num");
    const retryReason = request.headers.get("x-slack-retry-reason");

    // Ignore Slack retries to prevent duplicate processing
    // Slack retries if it doesn't get a 200 response within 3 seconds
    if (retryNum) {
      console.log(`[Slack Events] Ignoring retry #${retryNum}, reason: ${retryReason}`);
      return NextResponse.json({ ok: true });
    }

    // Parse the body first to check for URL verification
    const event: SlackEvent = JSON.parse(body);

    // Handle URL verification challenge BEFORE signature verification
    // This allows Slack to verify the endpoint during initial setup
    if (event.type === "url_verification") {
      return NextResponse.json({ challenge: event.challenge });
    }

    // Verify request signature for all other requests
    if (!verifySlackRequest(body, timestamp, signature)) {
      console.error("Invalid Slack signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Handle events
    if (event.type === "event_callback" && event.event) {
      const slackEvent = event.event;
      console.log(`[Slack Events] Received event: ${slackEvent.type}, subtype: ${slackEvent.subtype}, channel_type: ${slackEvent.channel_type}, user: ${slackEvent.user}`);

      // Ignore bot messages to prevent loops
      if (slackEvent.bot_id) {
        console.log("[Slack Events] Ignoring bot message");
        return NextResponse.json({ ok: true });
      }

      // Ignore message subtypes we don't want to process (edits, deletes, etc.)
      // Only process regular messages (no subtype) or file_share
      if (slackEvent.subtype && slackEvent.subtype !== "file_share") {
        console.log(`[Slack Events] Ignoring message subtype: ${slackEvent.subtype}`);
        return NextResponse.json({ ok: true });
      }

      // Handle DM messages
      if (slackEvent.type === "message" && slackEvent.channel_type === "im") {
        console.log(`[Slack Events] Processing DM from ${slackEvent.user}: "${slackEvent.text?.substring(0, 50)}..."`);
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

  console.log(`[Slack DM] START handleDMMessage - slackUserId=${slackUserId}, channel=${channel}, ts=${ts}, text="${text?.substring(0, 50)}..."`);

  if (!slackUserId || !channel || !text || !ts) {
    console.error("[Slack DM] Missing required event fields:", { slackUserId, channel, text: !!text, ts });
    return;
  }

  // Database-level deduplication using SlackDraft with unique constraint on slackThreadTs
  // Check if we've already processed this message (exists in database)
  console.log(`[Slack DM] Checking for existing draft...`);
  const existingDraft = await prisma.slackDraft.findFirst({
    where: {
      slackChannelId: channel,
      slackThreadTs: ts,
    },
  });

  if (existingDraft) {
    console.log(`[Slack DM] Skipping already processed message: ${channel}:${ts}`);
    return;
  }
  console.log(`[Slack DM] No existing draft found, proceeding...`);

  // Find the Slack integration for this user
  console.log(`[Slack DM] Looking up integration for slackUserId: ${slackUserId}`);

  // First, let's see ALL integrations for this user (including inactive) for debugging
  const allIntegrations = await prisma.slackIntegration.findMany({
    where: { slackUserId },
    select: { id: true, slackUserId: true, isActive: true, userId: true, workspaceId: true },
  });
  console.log(`[Slack DM] Found ${allIntegrations.length} total integrations for slackUserId ${slackUserId}:`, JSON.stringify(allIntegrations));

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
    console.error(`[Slack DM] NO ACTIVE INTEGRATION found for Slack user ${slackUserId}. Total integrations found: ${allIntegrations.length}. User may need to reconnect Slack.`);
    return;
  }

  console.log(`[Slack DM] Found active integration: id=${integration.id}, userId=${integration.userId}, email=${integration.user.email}, botToken exists=${!!integration.botToken}`);

  const { botToken, user } = integration;

  // Check for simple greetings - ONLY exact matches or very short greeting messages
  // We want to be conservative - only treat as greeting if it's CLEARLY just a greeting
  const lowerText = text.toLowerCase().trim();
  const exactGreetings = ["hi", "hello", "hey", "help", "hey there", "hi there", "hello there", "what can you do", "how does this work", "get started"];
  const isExactGreeting = exactGreetings.includes(lowerText);

  // Also match greetings with punctuation like "hi!" or "hello?"
  const greetingWithPunctuation = exactGreetings.some(g =>
    lowerText === g + "!" || lowerText === g + "?" || lowerText === g + "."
  );

  const isGreeting = isExactGreeting || greetingWithPunctuation;

  console.log(`[Slack DM] Message analysis: length=${text.length}, text="${lowerText.substring(0, 30)}", isGreeting=${isGreeting}`);

  if (isGreeting) {
    console.log(`[Slack DM] Detected greeting, sending welcome message to channel=${channel}`);
    try {
      const welcomeMsg = buildWelcomeMessage();
      console.log(`[Slack DM] Welcome message built, sending to Slack...`);
      const result = await sendSlackMessage(botToken, channel, welcomeMsg);
      console.log(`[Slack DM] Welcome message result:`, result.ok ? "success" : `error: ${result.error}`);
      if (!result.ok) {
        console.error(`[Slack DM] Failed to send welcome message:`, JSON.stringify(result));
      }
    } catch (err) {
      console.error(`[Slack DM] Exception sending welcome message:`, err);
    }
    return;
  }

  console.log(`[Slack DM] Not a greeting, proceeding to generate post for: "${text.substring(0, 50)}..."`);

  // Create a placeholder draft IMMEDIATELY to prevent duplicate processing
  // This acts as a lock - other requests will see this draft exists and skip
  let draft;
  try {
    draft = await prisma.slackDraft.create({
      data: {
        slackIntegrationId: integration.id,
        slackChannelId: channel,
        slackThreadTs: ts,
        originalInput: text,
        draftContent: "", // Will be filled in later
        status: "GENERATING", // New status to indicate in-progress
      },
    });
    console.log(`[Slack DM] Created placeholder draft: ${draft.id}`);
  } catch (createError) {
    // If creation fails due to unique constraint, another request is already processing
    console.log(`[Slack DM] Draft already being processed for ${channel}:${ts}`);
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
    // Clean up the draft we created
    await prisma.slackDraft.delete({ where: { id: draft.id } }).catch(() => {});
    return;
  }

  // Store the Slack message timestamp for later updates
  await prisma.slackDraft.update({
    where: { id: draft.id },
    data: { slackMessageTs: genResult.ts },
  }).catch(() => {});

  try {
    // Run both API calls in parallel to stay within Vercel's timeout
    console.log(`[Slack DM] Starting parallel API calls for post generation`);
    const startTime = Date.now();

    const [parsedSchedule, draftContent] = await Promise.all([
      // Parse scheduling info from the message (e.g., "Monday at 8:55am EST")
      parseScheduleFromMessage(text),
      // Generate the post
      generateSlackPost(
        text,
        user.name || undefined,
        user.writingPreferences,
        user.ghostwriterGuidelines,
        user.linkedinProfileContext || undefined,
        (user as { writingStyleId?: string | null }).writingStyleId || undefined
      ),
    ]);

    const elapsed = Date.now() - startTime;
    console.log(`[Slack DM] API calls completed in ${elapsed}ms, draft length: ${draftContent.length}`);

    // Update the draft with the actual content
    await prisma.slackDraft.update({
      where: { id: draft.id },
      data: {
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
    console.log(`[Slack DM] Successfully updated Slack message with draft`);
  } catch (error) {
    console.error("[Slack DM] Error generating post:", error);

    // Mark draft as failed
    await prisma.slackDraft.update({
      where: { id: draft.id },
      data: { status: "FAILED" },
    }).catch(() => {});

    // Update message with error
    const updateResult = await updateSlackMessage(
      botToken,
      channel,
      genResult.ts,
      buildErrorMessage("Failed to generate post. Please try again.")
    );
    console.log(`[Slack DM] Error message update result:`, updateResult.ok ? "success" : updateResult.error);
  }
}
