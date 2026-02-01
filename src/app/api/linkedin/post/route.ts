import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { LinkedInContact } from "@/types";

interface MentionAttribute {
  length: number;
  start: number;
  value: {
    "com.linkedin.common.MemberAttributedEntity"?: {
      member: string; // urn:li:person:xxx
    };
    "com.linkedin.common.CompanyAttributedEntity"?: {
      company: string; // urn:li:organization:xxx
    };
  };
}

// Build content with mentions for LinkedIn API
// Finds inline mentions in the format @CompanyName or @PersonName and creates proper LinkedIn attributes
function buildContentWithMentions(
  content: string,
  taggedContacts: LinkedInContact[]
): { text: string; attributes: MentionAttribute[] } {
  // If no tags or no URNs available, return plain content
  const contactsWithUrns = taggedContacts.filter((c) => c.linkedinUrn);
  if (contactsWithUrns.length === 0) {
    return { text: content, attributes: [] };
  }

  // Find all inline mentions in the content and build attributes
  const attributes: MentionAttribute[] = [];

  for (const contact of contactsWithUrns) {
    // Look for the mention in the content (with @ prefix)
    const mentionStr = `@${contact.name}`;
    let searchPos = 0;

    while (true) {
      const mentionPos = content.indexOf(mentionStr, searchPos);
      if (mentionPos === -1) break;

      const attr: MentionAttribute = {
        start: mentionPos,
        length: mentionStr.length,
        value: {},
      };

      if (contact.type === "PERSON") {
        attr.value["com.linkedin.common.MemberAttributedEntity"] = {
          member: contact.linkedinUrn!,
        };
      } else {
        attr.value["com.linkedin.common.CompanyAttributedEntity"] = {
          company: contact.linkedinUrn!,
        };
      }

      attributes.push(attr);
      searchPos = mentionPos + mentionStr.length;
    }

    // Also check for the name without @ (for cases like "I joined Speechify")
    // and if found with no @, we won't create a mention attribute as user didn't explicitly tag
  }

  // Sort attributes by start position (LinkedIn requires this)
  attributes.sort((a, b) => a.start - b.start);

  return { text: content, attributes };
}

// Post to LinkedIn using Share API
async function postToLinkedIn(
  accessToken: string,
  linkedinUserId: string,
  content: string,
  taggedContacts: LinkedInContact[] = []
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const { text, attributes } = buildContentWithMentions(content, taggedContacts);

    const shareCommentary: { text: string; attributes?: MentionAttribute[] } = { text };
    if (attributes.length > 0) {
      shareCommentary.attributes = attributes;
    }

    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:person:${linkedinUserId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary,
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("LinkedIn post error:", errorData);
      return {
        success: false,
        error: errorData.message || "Failed to post to LinkedIn",
      };
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.id,
    };
  } catch (error) {
    console.error("LinkedIn API error:", error);
    return {
      success: false,
      error: "Failed to connect to LinkedIn",
    };
  }
}

// Manual post endpoint
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    // Get user's LinkedIn credentials
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        linkedinAccessToken: true,
        linkedinUserId: true,
        linkedinTokenExpiry: true,
      },
    });

    if (!user?.linkedinAccessToken || !user?.linkedinUserId) {
      return NextResponse.json(
        { error: "LinkedIn not connected" },
        { status: 400 }
      );
    }

    // Check token expiry
    if (user.linkedinTokenExpiry && new Date() > user.linkedinTokenExpiry) {
      return NextResponse.json(
        { error: "LinkedIn token expired. Please reconnect your account." },
        { status: 400 }
      );
    }

    // Get the post
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        userId: session.user.id,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get tagged contacts if any
    let taggedContacts: LinkedInContact[] = [];
    if (post.taggedContactIds) {
      try {
        const contactIds = JSON.parse(post.taggedContactIds) as string[];
        if (contactIds.length > 0) {
          const contacts = await prisma.linkedInContact.findMany({
            where: {
              id: { in: contactIds },
              userId: session.user.id,
            },
            select: {
              id: true,
              type: true,
              linkedinUrl: true,
              linkedinUrn: true,
              name: true,
            },
          });
          taggedContacts = contacts as LinkedInContact[];

          // Update usage count for tagged contacts
          await prisma.linkedInContact.updateMany({
            where: { id: { in: contactIds } },
            data: {
              usageCount: { increment: 1 },
              lastUsedAt: new Date(),
            },
          });
        }
      } catch (e) {
        console.error("Failed to parse tagged contacts:", e);
      }
    }

    // Post to LinkedIn
    const result = await postToLinkedIn(
      user.linkedinAccessToken,
      user.linkedinUserId,
      post.content,
      taggedContacts
    );

    if (!result.success) {
      // Update post status to failed
      await prisma.post.update({
        where: { id: postId },
        data: { status: "FAILED" },
      });

      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Update post status
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: "POSTED",
        linkedinPostId: result.postId,
      },
    });

    // Update schedule if exists
    await prisma.schedule.updateMany({
      where: { postId },
      data: {
        status: "COMPLETED",
        postedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Posted to LinkedIn successfully",
      linkedinPostId: result.postId,
    });
  } catch (error) {
    console.error("Post to LinkedIn error:", error);
    return NextResponse.json(
      { error: "Failed to post to LinkedIn" },
      { status: 500 }
    );
  }
}
