import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      console.error("LinkedIn OAuth error:", error);
      return NextResponse.redirect(
        new URL("/settings?linkedin=error", request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/settings?linkedin=error&message=Missing parameters", request.url)
      );
    }

    // Decode state
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, "base64").toString());
    } catch {
      return NextResponse.redirect(
        new URL("/settings?linkedin=error&message=Invalid state", request.url)
      );
    }

    const { userId } = stateData;

    if (!userId) {
      return NextResponse.redirect(
        new URL("/settings?linkedin=error&message=Invalid user", request.url)
      );
    }

    // Exchange code for access token
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/linkedin/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL("/settings?linkedin=error&message=LinkedIn not configured", request.url)
      );
    }

    const tokenResponse = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange error:", errorData);
      return NextResponse.redirect(
        new URL("/settings?linkedin=error&message=Token exchange failed", request.url)
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, expires_in, refresh_token } = tokenData;

    // Get LinkedIn user info
    const userInfoResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    let linkedinUserId = null;
    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json();
      linkedinUserId = userInfo.sub;
    }

    // Calculate token expiry
    const tokenExpiry = new Date(Date.now() + expires_in * 1000);

    // Update user with LinkedIn tokens
    await prisma.user.update({
      where: { id: userId },
      data: {
        linkedinAccessToken: access_token,
        linkedinRefreshToken: refresh_token || null,
        linkedinTokenExpiry: tokenExpiry,
        linkedinUserId,
      },
    });

    return NextResponse.redirect(
      new URL("/settings?linkedin=connected", request.url)
    );
  } catch (error) {
    console.error("LinkedIn callback error:", error);
    return NextResponse.redirect(
      new URL("/settings?linkedin=error", request.url)
    );
  }
}
