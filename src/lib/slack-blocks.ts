/**
 * Slack Block Kit message builders for TeamPost bot
 */

interface SlackBlock {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface SlackMessage {
  text: string;
  blocks: SlackBlock[];
}

interface ScheduleModal {
  type: "modal";
  callback_id: string;
  private_metadata: string;
  title: { type: "plain_text"; text: string };
  submit: { type: "plain_text"; text: string };
  close: { type: "plain_text"; text: string };
  blocks: SlackBlock[];
}

interface FeedbackModal {
  type: "modal";
  callback_id: string;
  private_metadata: string;
  title: { type: "plain_text"; text: string };
  submit: { type: "plain_text"; text: string };
  close: { type: "plain_text"; text: string };
  blocks: SlackBlock[];
}

export interface ParsedSchedule {
  dayOfWeek: string | null;
  time: string | null;
  timezone: string | null;
}

/**
 * Build draft preview message with action buttons
 * If a schedule was parsed from the message, show it and offer one-click approval
 */
export function buildDraftMessage(
  draftId: string,
  content: string,
  parsedSchedule?: ParsedSchedule | null
): SlackMessage {
  // Format schedule info if available
  let scheduleText = "";
  const hasSchedule = parsedSchedule?.dayOfWeek || parsedSchedule?.time;

  if (hasSchedule) {
    const parts = [];
    if (parsedSchedule?.dayOfWeek) {
      parts.push(parsedSchedule.dayOfWeek.charAt(0).toUpperCase() + parsedSchedule.dayOfWeek.slice(1));
    }
    if (parsedSchedule?.time) {
      // Convert 24h to 12h format
      const [hours, minutes] = parsedSchedule.time.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      parts.push(`${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`);
    }
    if (parsedSchedule?.timezone) {
      parts.push(parsedSchedule.timezone.toUpperCase());
    }
    scheduleText = `\n📅 *Will be scheduled for: ${parts.join(" ")}*`;
  }

  const approveButtonText = hasSchedule ? "✅ Approve & Schedule" : "✅ Save as Draft";

  return {
    text: "Here's your LinkedIn post draft!",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Here's your LinkedIn post draft:*${scheduleText}`,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: content,
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
            text: `📝 Draft ID: \`${draftId.slice(-6)}\` | Generated just now`,
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
              text: approveButtonText,
              emoji: true,
            },
            style: "primary",
            action_id: "approve_post",
            value: draftId,
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "🔄 Regenerate",
              emoji: true,
            },
            action_id: "regenerate_post",
            value: draftId,
          },
        ],
      },
    ],
  };
}

/**
 * Build schedule modal with day/time picker
 */
export function buildScheduleModal(
  draftId: string,
  userTimezone: string = "America/New_York"
): ScheduleModal {
  // Generate time options (every 30 minutes)
  const timeOptions = [];
  for (let hour = 6; hour <= 21; hour++) {
    for (const minute of [0, 30]) {
      const h = hour.toString().padStart(2, "0");
      const m = minute.toString().padStart(2, "0");
      const period = hour < 12 ? "AM" : "PM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      timeOptions.push({
        text: {
          type: "plain_text" as const,
          text: `${displayHour}:${m} ${period}`,
        },
        value: `${h}:${m}`,
      });
    }
  }

  return {
    type: "modal",
    callback_id: "schedule_post",
    private_metadata: JSON.stringify({ draftId }),
    title: {
      type: "plain_text",
      text: "Schedule Post",
    },
    submit: {
      type: "plain_text",
      text: "Schedule",
    },
    close: {
      type: "plain_text",
      text: "Cancel",
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Choose when to publish this post to LinkedIn:",
        },
      },
      {
        type: "input",
        block_id: "schedule_type",
        element: {
          type: "radio_buttons",
          action_id: "schedule_type_select",
          initial_option: {
            text: { type: "plain_text", text: "Save as draft (schedule later)" },
            value: "draft",
          },
          options: [
            {
              text: { type: "plain_text", text: "Save as draft (schedule later)" },
              value: "draft",
            },
            {
              text: { type: "plain_text", text: "Schedule for a specific time" },
              value: "scheduled",
            },
          ],
        },
        label: {
          type: "plain_text",
          text: "Schedule Type",
        },
      },
      {
        type: "input",
        block_id: "schedule_day",
        optional: true,
        element: {
          type: "static_select",
          action_id: "day_select",
          placeholder: {
            type: "plain_text",
            text: "Select a day",
          },
          options: [
            { text: { type: "plain_text", text: "Monday" }, value: "monday" },
            { text: { type: "plain_text", text: "Tuesday" }, value: "tuesday" },
            { text: { type: "plain_text", text: "Wednesday" }, value: "wednesday" },
            { text: { type: "plain_text", text: "Thursday" }, value: "thursday" },
            { text: { type: "plain_text", text: "Friday" }, value: "friday" },
            { text: { type: "plain_text", text: "Saturday" }, value: "saturday" },
            { text: { type: "plain_text", text: "Sunday" }, value: "sunday" },
          ],
        },
        label: {
          type: "plain_text",
          text: "Day of Week",
        },
      },
      {
        type: "input",
        block_id: "schedule_time",
        optional: true,
        element: {
          type: "static_select",
          action_id: "time_select",
          placeholder: {
            type: "plain_text",
            text: "Select a time",
          },
          options: timeOptions,
        },
        label: {
          type: "plain_text",
          text: "Time",
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `🕐 Times shown in your timezone: *${userTimezone}*`,
          },
        ],
      },
    ],
  };
}

/**
 * Build feedback modal for regeneration
 */
export function buildFeedbackModal(draftId: string): FeedbackModal {
  return {
    type: "modal",
    callback_id: "regenerate_with_feedback",
    private_metadata: JSON.stringify({ draftId }),
    title: {
      type: "plain_text",
      text: "Regenerate Post",
    },
    submit: {
      type: "plain_text",
      text: "Regenerate",
    },
    close: {
      type: "plain_text",
      text: "Cancel",
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Tell me what you'd like to change and I'll create a new version:",
        },
      },
      {
        type: "input",
        block_id: "feedback_input",
        element: {
          type: "plain_text_input",
          action_id: "feedback_text",
          multiline: true,
          placeholder: {
            type: "plain_text",
            text: "e.g., Make it shorter, add more storytelling, change the hook...",
          },
        },
        label: {
          type: "plain_text",
          text: "Your Feedback",
        },
      },
    ],
  };
}

/**
 * Build confirmation message after post is saved/scheduled
 */
export function buildConfirmationMessage(
  postId: string,
  isScheduled: boolean,
  scheduledFor?: string
): SlackMessage {
  const dashboardUrl = `${process.env.NEXTAUTH_URL || "https://teampost.vercel.app"}/posts`;

  let statusText: string;
  if (isScheduled && scheduledFor) {
    statusText = `✅ *Post scheduled for ${scheduledFor}*`;
  } else {
    statusText = "✅ *Post saved as draft*";
  }

  return {
    text: isScheduled ? "Post scheduled!" : "Post saved!",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: statusText,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `View and manage your posts on the <${dashboardUrl}|TeamPost dashboard>.`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Post ID: \`${postId.slice(-6)}\``,
          },
        ],
      },
    ],
  };
}

/**
 * Build generating message (shown while AI is working)
 */
export function buildGeneratingMessage(): SlackMessage {
  return {
    text: "Generating your LinkedIn post...",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "✨ *Generating your LinkedIn post...*\n\nThis usually takes 5-10 seconds.",
        },
      },
    ],
  };
}

/**
 * Build error message
 */
export function buildErrorMessage(message: string): SlackMessage {
  return {
    text: `Error: ${message}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `❌ *Something went wrong*\n\n${message}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Please try again or visit the TeamPost dashboard if the issue persists.",
        },
      },
    ],
  };
}

/**
 * Build welcome message for new DM
 */
export function buildWelcomeMessage(): SlackMessage {
  return {
    text: "Welcome to TeamPost!",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "👋 *Welcome to TeamPost!*\n\nI help you create LinkedIn posts from your ideas.\n\nJust send me a message with:\n• Bullet points or rough ideas\n• A story you want to share\n• Key points from a meeting or conversation\n• Photos to include with your post\n\nInclude scheduling like \"Monday at 9am EST\" and I'll schedule it automatically!",
        },
      },
    ],
  };
}

/**
 * Build photo added confirmation message
 */
export function buildPhotoAddedMessage(imageUrl: string, attachedToDraft: boolean): SlackMessage {
  const statusText = attachedToDraft
    ? "📷 *Photo attached to your draft!*\n\nThe photo will be included when you approve the post."
    : "📷 *Photo saved to your library!*\n\nIt's been added to your TeamPost photo library and is ready to use with any post.";

  return {
    text: attachedToDraft ? "Photo attached to draft!" : "Photo saved to library!",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: statusText,
        },
      },
      {
        type: "image",
        image_url: imageUrl,
        alt_text: "Uploaded photo",
      },
    ],
  };
}
