import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/linkedin/callback`;

    if (!clientId) {
      return NextResponse.redirect(
        new URL("/settings?linkedin=error&message=LinkedIn not configured", request.url)
      );
    }

    // LinkedIn OAuth scopes for posting
    // w_member_social - allows posting to LinkedIn
    // openid, profile, email - basic profile info
    const scope = "openid profile email w_member_social";

    // Generate state parameter for security
    const state = Buffer.from(
      JSON.stringify({
        userId: session.user.id,
        timestamp: Date.now(),
      })
    ).toString("base64");

    const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("state", state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error("LinkedIn auth error:", error);
    return NextResponse.redirect(
      new URL("/settings?linkedin=error", request.url)
    );
  }
}
