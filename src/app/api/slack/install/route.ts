import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Slack OAuth scopes for bot functionality
const SLACK_SCOPES = [
  "chat:write",      // Send messages
  "im:history",      // Read DM history
  "im:write",        // Send DMs
  "users:read",      // Get user info
  "users:read.email" // Get user email for account matching
].join(",");

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      // Redirect to login with callback to this endpoint
      return NextResponse.redirect(
        new URL("/login?callbackUrl=/api/slack/install", process.env.NEXTAUTH_URL || "http://localhost:3000")
      );
    }

    const clientId = process.env.SLACK_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: "Slack integration not configured" },
        { status: 500 }
      );
    }

    // Create state parameter with user ID (for account linking after OAuth)
    const state = Buffer.from(JSON.stringify({
      userId: session.user.id,
      timestamp: Date.now()
    })).toString("base64url");

    // Build Slack OAuth URL
    const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/slack/callback`;
    const slackAuthUrl = new URL("https://slack.com/oauth/v2/authorize");
    slackAuthUrl.searchParams.set("client_id", clientId);
    slackAuthUrl.searchParams.set("scope", SLACK_SCOPES);
    slackAuthUrl.searchParams.set("redirect_uri", redirectUri);
    slackAuthUrl.searchParams.set("state", state);

    return NextResponse.redirect(slackAuthUrl.toString());
  } catch (error) {
    console.error("Slack install error:", error);
    return NextResponse.json(
      { error: "Failed to start Slack installation" },
      { status: 500 }
    );
  }
}
