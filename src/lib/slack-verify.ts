import crypto from "crypto";

/**
 * Verify Slack request signature
 * Based on Slack's request signing documentation:
 * https://api.slack.com/authentication/verifying-requests-from-slack
 */
export function verifySlackRequest(
  body: string,
  timestamp: string | null,
  signature: string | null
): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;

  if (!signingSecret || !timestamp || !signature) {
    return false;
  }

  // Prevent replay attacks - reject requests older than 5 minutes
  const requestTimestamp = parseInt(timestamp, 10);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTimestamp - requestTimestamp) > 60 * 5) {
    console.error("Slack request timestamp too old");
    return false;
  }

  // Create signature base string
  const sigBasestring = `v0:${timestamp}:${body}`;

  // Compute expected signature
  const mySignature = `v0=${crypto
    .createHmac("sha256", signingSecret)
    .update(sigBasestring)
    .digest("hex")}`;

  // Use timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(mySignature),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}

/**
 * Parse Slack request body
 * Handles both JSON and URL-encoded formats
 */
export function parseSlackBody(body: string, contentType: string | null): unknown {
  if (contentType?.includes("application/json")) {
    return JSON.parse(body);
  }

  // URL-encoded (used by slash commands and some interactions)
  const params = new URLSearchParams(body);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });

  // Check if there's a payload field (used by interactions)
  if (result.payload) {
    return JSON.parse(result.payload);
  }

  return result;
}
