import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySlackRequest, parseSlackBody } from "@/lib/slack-verify";
import { regenerateSlackPost } from "@/lib/slack-claude";
import {
  buildDraftMessage,
  buildScheduleModal,
  buildFeedbackModal,
  buildConfirmationMessage,
  buildErrorMessage,
  buildSavingMessage,
  buildSchedulingMessage,
  buildRegeneratingMessage,
} from "@/lib/slack-blocks";

interface SlackInteraction {
  type: string;
  user: { id: string };
  trigger_id: string;
  actions?: Array<{
    action_id: string;
    value?: string;
  }>;
  view?: {
    callback_id: string;
    private_metadata: string;
    state: {
      values: Record<string, Record<string, {
        value?: string;
        selected_option?: { value: string };
        selected_date?: string;  // For datepicker elements
        selected_time?: string;  // For timepicker elements
      }>>;
    };
  };
  channel?: { id: string };
  message?: { ts: string };
}

// Open a modal in Slack
async function openSlackModal(
  botToken: string,
  triggerId: string,
  view: unknown
): Promise<{ ok: boolean; error?: string }> {
  const response = await fetch("https://slack.com/api/views.open", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      trigger_id: triggerId,
      view,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const timestamp = request.headers.get("x-slack-request-timestamp");
    const signature = request.headers.get("x-slack-signature");
    const contentType = request.headers.get("content-type");

    // Verify request signature
    if (!verifySlackRequest(body, timestamp, signature)) {
      console.error("Invalid Slack signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const interaction = parseSlackBody(body, contentType) as SlackInteraction;

    // Handle block actions (button clicks)
    if (interaction.type === "block_actions" && interaction.actions) {
      const action = interaction.actions[0];
      const slackUserId = interaction.user.id;

      // Get integration for this user
      const integration = await prisma.slackIntegration.findFirst({
        where: { slackUserId, isActive: true },
        include: { user: true },
      });

      if (!integration) {
        return new Response("", { status: 200 });
      }

      if (action.action_id === "approve_post") {
        // Get the draft to check if it has a pre-parsed schedule
        const draftId = action.value;
        const draft = await prisma.slackDraft.findUnique({
          where: { id: draftId! },
        });

        if (draft?.scheduleDayOfWeek || draft?.scheduleTime) {
          // Show immediate feedback by updating the message
          if (interaction.channel?.id && interaction.message?.ts) {
            await updateSlackMessage(
              integration.botToken,
              interaction.channel.id,
              interaction.message.ts,
              buildSavingMessage()
            );
          }
          // Draft has a parsed schedule - approve immediately with that schedule
          handleApproveWithParsedSchedule(
            integration,
            draft,
            interaction.channel?.id,
            interaction.message?.ts
          ).catch(console.error);
        } else {
          // No parsed schedule - open modal to let user choose
          await openSlackModal(
            integration.botToken,
            interaction.trigger_id,
            buildScheduleModal(draftId!, integration.user.timezone)
          );
        }
      } else if (action.action_id === "regenerate_post") {
        // Open feedback modal
        const draftId = action.value;
        await openSlackModal(
          integration.botToken,
          interaction.trigger_id,
          buildFeedbackModal(draftId!)
        );
      } else if (action.action_id === "approve_cadence_draft") {
        // Approve a cadence-generated draft (just save it as draft, no scheduling)
        const postId = action.value;
        handleApproveCadenceDraft(
          integration,
          postId!,
          interaction.channel?.id,
          interaction.message?.ts
        ).catch(console.error);
      } else if (action.action_id === "discard_cadence_draft") {
        // Discard a cadence-generated draft
        const postId = action.value;
        handleDiscardCadenceDraft(
          integration,
          postId!,
          interaction.channel?.id,
          interaction.message?.ts
        ).catch(console.error);
      }

      return new Response("", { status: 200 });
    }

    // Handle modal submissions
    if (interaction.type === "view_submission" && interaction.view) {
      const { callback_id, private_metadata, state } = interaction.view;
      const slackUserId = interaction.user.id;

      const integration = await prisma.slackIntegration.findFirst({
        where: { slackUserId, isActive: true },
        include: {
          user: {
            include: {
              writingPreferences: { where: { isActive: true } },
            },
          },
        },
      });

      if (!integration) {
        return new Response("", { status: 200 });
      }

      if (callback_id === "schedule_post") {
        // Handle schedule submission
        const metadata = JSON.parse(private_metadata);
        const draftId = metadata.draftId;

        const scheduleType = state.values.schedule_type?.schedule_type_select?.selected_option?.value;
        // Date comes from datepicker as "YYYY-MM-DD" string
        const scheduleDate = state.values.schedule_date?.date_select?.selected_date;
        // Time comes from timepicker as "HH:MM" string
        const scheduleTime = state.values.schedule_time?.time_select?.selected_time;

        // Process asynchronously
        handleScheduleSubmission(
          integration,
          draftId,
          scheduleType || "draft",
          scheduleDate,
          scheduleTime
        ).catch(console.error);

        // Close modal immediately
        return new Response("", { status: 200 });
      }

      if (callback_id === "regenerate_with_feedback") {
        // Handle regeneration
        const metadata = JSON.parse(private_metadata);
        const draftId = metadata.draftId;
        const feedback = state.values.feedback_input?.feedback_text?.value || "";

        // Process asynchronously
        handleRegeneration(integration, draftId, feedback).catch(console.error);

        // Close modal immediately
        return new Response("", { status: 200 });
      }
    }

    return new Response("", { status: 200 });
  } catch (error) {
    console.error("Slack interactions error:", error);
    return new Response("", { status: 200 }); // Always return 200 to Slack
  }
}

/**
 * Handle approval when the draft already has a parsed schedule from the message
 */
async function handleApproveWithParsedSchedule(
  integration: {
    botToken: string;
    user: { id: string; timezone: string };
  },
  draft: {
    id: string;
    draftContent: string;
    slackChannelId: string;
    slackThreadTs: string;
    scheduleDayOfWeek: string | null;
    scheduleTime: string | null;
    scheduleTimezone: string | null;
    imageUrl: string | null;
  },
  channelId?: string,
  messageTs?: string
) {
  const hasSchedule = draft.scheduleDayOfWeek || draft.scheduleTime;

  // Create the post (include image if attached)
  const post = await prisma.post.create({
    data: {
      userId: integration.user.id,
      content: draft.draftContent,
      imageUrl: draft.imageUrl,
      weekNumber: 1,
      status: hasSchedule ? "SCHEDULED" : "DRAFT",
    },
  });

  // Update draft with post link
  await prisma.slackDraft.update({
    where: { id: draft.id },
    data: {
      postId: post.id,
      status: hasSchedule ? "SCHEDULED" : "SAVED",
    },
  });

  // If we have scheduling info, create the schedule
  let scheduledForDisplay: string | undefined;
  if (hasSchedule && draft.scheduleDayOfWeek && draft.scheduleTime) {
    // Use the timezone from the message, fall back to user's timezone
    const timezone = draft.scheduleTimezone || integration.user.timezone;
    const scheduledFor = calculateScheduledDate(
      draft.scheduleDayOfWeek,
      draft.scheduleTime,
      timezone
    );

    await prisma.schedule.create({
      data: {
        userId: integration.user.id,
        postId: post.id,
        scheduledFor,
        status: "PENDING",
      },
    });

    scheduledForDisplay = formatScheduleDisplay(scheduledFor, integration.user.timezone);
  }

  // Send confirmation message
  await sendSlackMessage(
    integration.botToken,
    draft.slackChannelId,
    buildConfirmationMessage(post.id, !!hasSchedule, scheduledForDisplay),
    draft.slackThreadTs
  );
}

async function handleScheduleSubmission(
  integration: {
    botToken: string;
    user: { id: string; timezone: string };
  },
  draftId: string,
  scheduleType: string,
  scheduleDate?: string,  // "YYYY-MM-DD" format from datepicker
  scheduleTime?: string   // "HH:MM" format from timepicker
) {
  const draft = await prisma.slackDraft.findUnique({
    where: { id: draftId },
  });

  if (!draft) {
    console.error("Draft not found:", draftId);
    return;
  }

  const isScheduled = !!(scheduleType === "scheduled" && scheduleDate && scheduleTime);

  // Send immediate feedback that we're processing
  await sendSlackMessage(
    integration.botToken,
    draft.slackChannelId,
    isScheduled ? buildSchedulingMessage() : buildSavingMessage(),
    draft.slackThreadTs
  );

  // Create the post (include image if attached)
  const post = await prisma.post.create({
    data: {
      userId: integration.user.id,
      content: draft.draftContent,
      imageUrl: draft.imageUrl,
      weekNumber: 1, // Will be updated when scheduled
      status: isScheduled ? "SCHEDULED" : "DRAFT",
    },
  });

  // Update draft with post link
  await prisma.slackDraft.update({
    where: { id: draftId },
    data: {
      postId: post.id,
      status: isScheduled ? "SCHEDULED" : "SAVED",
    },
  });

  // If scheduling, create schedule record
  let scheduledForDisplay: string | undefined;
  if (isScheduled) {
    const scheduledFor = calculateScheduledDateTime(
      scheduleDate,
      scheduleTime,
      integration.user.timezone
    );

    await prisma.schedule.create({
      data: {
        userId: integration.user.id,
        postId: post.id,
        scheduledFor,
        status: "PENDING",
      },
    });

    scheduledForDisplay = formatScheduleDisplay(scheduledFor, integration.user.timezone);
  }

  // Send confirmation message
  await sendSlackMessage(
    integration.botToken,
    draft.slackChannelId,
    buildConfirmationMessage(post.id, isScheduled, scheduledForDisplay),
    draft.slackThreadTs
  );
}

async function handleRegeneration(
  integration: {
    botToken: string;
    user: {
      id: string;
      writingPreferences: Array<{ preference: string }>;
    };
  },
  draftId: string,
  feedback: string
) {
  const draft = await prisma.slackDraft.findUnique({
    where: { id: draftId },
  });

  if (!draft) {
    console.error("Draft not found:", draftId);
    return;
  }

  // Send "regenerating" message immediately for user feedback
  await sendSlackMessage(
    integration.botToken,
    draft.slackChannelId,
    buildRegeneratingMessage(),
    draft.slackThreadTs
  );

  try {
    // Regenerate with feedback
    const newContent = await regenerateSlackPost(
      draft.draftContent,
      feedback,
      integration.user.writingPreferences
    );

    // Update draft
    const updatedDraft = await prisma.slackDraft.update({
      where: { id: draftId },
      data: {
        draftContent: newContent,
        feedback: { push: feedback },
      },
    });

    // Send new draft message (preserve schedule info)
    const parsedSchedule = draft.scheduleDayOfWeek || draft.scheduleTime
      ? {
          dayOfWeek: draft.scheduleDayOfWeek,
          time: draft.scheduleTime,
          timezone: draft.scheduleTimezone,
        }
      : null;

    await sendSlackMessage(
      integration.botToken,
      draft.slackChannelId,
      buildDraftMessage(updatedDraft.id, newContent, parsedSchedule),
      draft.slackThreadTs
    );
  } catch (error) {
    console.error("Error regenerating post:", error);
    await sendSlackMessage(
      integration.botToken,
      draft.slackChannelId,
      buildErrorMessage("Failed to regenerate post. Please try again."),
      draft.slackThreadTs
    );
  }
}

/**
 * Calculate the scheduled date based on day of week and time in user's timezone
 * Returns a Date object representing the correct UTC moment
 */
function calculateScheduledDate(
  day: string,
  time: string,
  timezone: string
): Date {
  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const targetDay = dayMap[day.toLowerCase()];
  const [hours, minutes] = time.split(":").map(Number);

  // Get current time in user's timezone to determine "today" from their perspective
  const now = new Date();
  const nowInTzStr = now.toLocaleString("en-US", { timeZone: timezone });
  const nowInTz = new Date(nowInTzStr);
  const currentDayInTz = nowInTz.getDay();

  // Calculate days until target day (from user's perspective)
  let daysUntil = targetDay - currentDayInTz;
  if (daysUntil <= 0) {
    daysUntil += 7; // Next week
  }

  // Calculate the target date in user's timezone
  const targetDateInTz = new Date(nowInTz);
  targetDateInTz.setDate(nowInTz.getDate() + daysUntil);
  targetDateInTz.setHours(hours, minutes, 0, 0);

  // Now we need to convert this "local time in timezone" to UTC
  // Strategy: Find what UTC time corresponds to this local time in the given timezone
  // We do this by creating a reference point and calculating the offset

  // Get the timezone offset at the target date by comparing local and UTC representations
  const targetYear = targetDateInTz.getFullYear();
  const targetMonth = targetDateInTz.getMonth();
  const targetDayOfMonth = targetDateInTz.getDate();

  // Create a date object for the target time, treating it as UTC first
  const asIfUtc = new Date(Date.UTC(targetYear, targetMonth, targetDayOfMonth, hours, minutes, 0, 0));

  // Get what this UTC time looks like in the user's timezone
  const utcInTzStr = asIfUtc.toLocaleString("en-US", { timeZone: timezone });
  const utcInTz = new Date(utcInTzStr);

  // Calculate the offset: how many ms ahead/behind is the timezone from UTC?
  // If timezone shows 9 AM when UTC is 2 PM, the timezone is UTC-5, offset = -5 hours
  const offset = utcInTz.getTime() - asIfUtc.getTime();

  // Apply the offset to get the actual UTC time
  // If user wants 9 AM EST (UTC-5), UTC time should be 2 PM
  const scheduledUtc = new Date(asIfUtc.getTime() - offset);

  return scheduledUtc;
}

/**
 * Calculate the scheduled date from a specific date and time
 * @param dateStr - Date in "YYYY-MM-DD" format from Slack datepicker
 * @param timeStr - Time in "HH:MM" format from Slack timepicker
 * @param timezone - User's timezone
 * @returns Date object representing the correct UTC moment
 */
function calculateScheduledDateTime(
  dateStr: string,
  timeStr: string,
  timezone: string
): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);

  // Create a date object for the target time, treating it as UTC first
  const asIfUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));

  // Get what this UTC time looks like in the user's timezone
  const utcInTzStr = asIfUtc.toLocaleString("en-US", { timeZone: timezone });
  const utcInTz = new Date(utcInTzStr);

  // Calculate the offset: how many ms ahead/behind is the timezone from UTC?
  const offset = utcInTz.getTime() - asIfUtc.getTime();

  // Apply the offset to get the actual UTC time
  const scheduledUtc = new Date(asIfUtc.getTime() - offset);

  return scheduledUtc;
}

/**
 * Format schedule date for display
 */
function formatScheduleDisplay(date: Date, timezone: string): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  };

  return date.toLocaleString("en-US", options);
}

/**
 * Handle approval of a cadence-generated draft
 */
async function handleApproveCadenceDraft(
  integration: { botToken: string; user: { id: string } },
  postId: string,
  channelId?: string,
  messageTs?: string
) {
  try {
    // Update the post status to indicate it's been approved
    await prisma.post.update({
      where: { id: postId },
      data: { status: "DRAFT" }, // Already a draft, but confirm it stays
    });

    // Update the Slack message to show it was approved
    if (channelId && messageTs) {
      await updateSlackMessage(
        integration.botToken,
        channelId,
        messageTs,
        {
          text: "Draft approved!",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "✅ *Draft approved and saved!*\n\nYou can view and schedule this draft in <https://teampost.vercel.app/posts|TeamPost>.",
              },
            },
          ],
        }
      );
    }
  } catch (error) {
    console.error("Error approving cadence draft:", error);
    if (channelId && messageTs) {
      await sendSlackMessage(
        integration.botToken,
        channelId,
        buildErrorMessage("Failed to approve draft. Please try again."),
        messageTs
      );
    }
  }
}

/**
 * Handle discarding a cadence-generated draft
 */
async function handleDiscardCadenceDraft(
  integration: { botToken: string },
  postId: string,
  channelId?: string,
  messageTs?: string
) {
  try {
    // Delete the post
    await prisma.post.delete({
      where: { id: postId },
    });

    // Update the Slack message to show it was discarded
    if (channelId && messageTs) {
      await updateSlackMessage(
        integration.botToken,
        channelId,
        messageTs,
        {
          text: "Draft discarded",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "🗑️ *Draft discarded.*\n\nNo worries, another draft will be generated on your next scheduled time.",
              },
            },
          ],
        }
      );
    }
  } catch (error) {
    console.error("Error discarding cadence draft:", error);
    if (channelId && messageTs) {
      await sendSlackMessage(
        integration.botToken,
        channelId,
        buildErrorMessage("Failed to discard draft. Please try again."),
        messageTs
      );
    }
  }
}
