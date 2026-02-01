import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface SlackOAuthResponse {
  ok: boolean;
  error?: string;
  access_token?: string;
  token_type?: string;
  scope?: string;
  bot_user_id?: string;
  app_id?: string;
  team?: {
    id: string;
    name: string;
  };
  authed_user?: {
    id: string;
    access_token?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle user cancellation
    if (error) {
      console.error("Slack OAuth error:", error);
      return NextResponse.redirect(
        new URL("/settings?slack=error&message=" + encodeURIComponent(error), process.env.NEXTAUTH_URL || "http://localhost:3000")
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/settings?slack=error&message=missing_params", process.env.NEXTAUTH_URL || "http://localhost:3000")
      );
    }

    // Decode state to get user ID
    let stateData: { userId: string; timestamp: number };
    try {
      stateData = JSON.parse(Buffer.from(state, "base64url").toString());
    } catch {
      return NextResponse.redirect(
        new URL("/settings?slack=error&message=invalid_state", process.env.NEXTAUTH_URL || "http://localhost:3000")
      );
    }

    // Validate state timestamp (max 10 minutes old)
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      return NextResponse.redirect(
        new URL("/settings?slack=error&message=expired_state", process.env.NEXTAUTH_URL || "http://localhost:3000")
      );
    }

    // Exchange code for tokens
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/slack/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL("/settings?slack=error&message=not_configured", process.env.NEXTAUTH_URL || "http://localhost:3000")
      );
    }

    const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData: SlackOAuthResponse = await tokenResponse.json();

    if (!tokenData.ok || !tokenData.access_token || !tokenData.team || !tokenData.authed_user) {
      console.error("Slack token exchange failed:", tokenData);
      return NextResponse.redirect(
        new URL("/settings?slack=error&message=" + encodeURIComponent(tokenData.error || "token_exchange_failed"), process.env.NEXTAUTH_URL || "http://localhost:3000")
      );
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: stateData.userId },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/settings?slack=error&message=user_not_found", process.env.NEXTAUTH_URL || "http://localhost:3000")
      );
    }

    // Create or update Slack integration
    await prisma.slackIntegration.upsert({
      where: { userId: stateData.userId },
      create: {
        userId: stateData.userId,
        workspaceId: tokenData.team.id,
        teamName: tokenData.team.name,
        botToken: tokenData.access_token,
        botUserId: tokenData.bot_user_id || "",
        slackUserId: tokenData.authed_user.id,
      },
      update: {
        workspaceId: tokenData.team.id,
        teamName: tokenData.team.name,
        botToken: tokenData.access_token,
        botUserId: tokenData.bot_user_id || "",
        slackUserId: tokenData.authed_user.id,
        isActive: true,
      },
    });

    // Redirect to settings with success
    return NextResponse.redirect(
      new URL("/settings?slack=success", process.env.NEXTAUTH_URL || "http://localhost:3000")
    );
  } catch (error) {
    console.error("Slack callback error:", error);
    // Provide more specific error message for debugging
    const errorMessage = error instanceof Error ? error.message : "internal_error";
    const safeMessage = encodeURIComponent(errorMessage.substring(0, 100));
    return NextResponse.redirect(
      new URL(`/settings?slack=error&message=${safeMessage}`, process.env.NEXTAUTH_URL || "http://localhost:3000")
    );
  }
}
