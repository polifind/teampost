import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageData, sectionType } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Use Claude's vision capability to extract information from the LinkedIn screenshot
    const extractionPrompt = `You are analyzing a LinkedIn profile screenshot. Extract ALL relevant professional information from this image.

Please extract and organize the following (if visible):
- Name and headline/title
- Current company and role
- Previous work experience (company, role, duration)
- Education (school, degree, field)
- Skills and endorsements
- About/Summary section content
- Any achievements, certifications, or notable accomplishments
- Industry and location

Format your response as a structured summary that a ghostwriter could use to write personalized LinkedIn posts. Be thorough but concise. If certain information isn't visible in the screenshot, skip that section.

Return the extracted information in this format:
PROFESSIONAL SUMMARY:
[2-3 sentence overview]

CURRENT ROLE:
[Details]

EXPERIENCE:
[List of relevant experience]

EDUCATION:
[Details]

SKILLS & EXPERTISE:
[Key skills]

NOTABLE ACHIEVEMENTS:
[Any visible achievements]

TONE & STYLE OBSERVATIONS:
[Any observations about their professional brand/voice based on their profile]`;

    // Extract the base64 data (remove data URL prefix if present)
    const base64Data = imageData.includes("base64,")
      ? imageData.split("base64,")[1]
      : imageData;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5-20251101",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: base64Data,
              },
            },
            {
              type: "text",
              text: extractionPrompt,
            },
          ],
        },
      ],
    });

    const extractedContent =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Save the screenshot and extracted content to the database
    await prisma.linkedInScreenshot.create({
      data: {
        userId: session.user.id,
        imageData: base64Data.substring(0, 1000), // Store truncated version to save space
        sectionType: sectionType || "full_profile",
        extractedContent,
      },
    });

    // Update the user's aggregated LinkedIn profile context
    // Get all extracted content for this user
    const allScreenshots = await prisma.linkedInScreenshot.findMany({
      where: { userId: session.user.id },
      select: { extractedContent: true, sectionType: true },
    });

    // Combine all extracted content into a single profile context
    const combinedContext = allScreenshots
      .filter((s) => s.extractedContent)
      .map((s) => `[${s.sectionType}]\n${s.extractedContent}`)
      .join("\n\n---\n\n");

    // Generate a consolidated profile summary
    const summaryMessage = await anthropic.messages.create({
      model: "claude-opus-4-5-20251101",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `Based on the following extracted LinkedIn profile information, create a consolidated professional profile summary that a ghostwriter can use to write personalized LinkedIn posts. Focus on:
1. Their professional identity and expertise
2. Their career journey and key experiences
3. Their industry and domain knowledge
4. Their unique perspective or approach
5. Key themes they might write about

Information:
${combinedContext}

Create a concise but comprehensive profile (300-500 words) that captures their professional essence.`,
        },
      ],
    });

    const profileContext =
      summaryMessage.content[0].type === "text"
        ? summaryMessage.content[0].text
        : "";

    // Update user's profile context
    await prisma.user.update({
      where: { id: session.user.id },
      data: { linkedinProfileContext: profileContext },
    });

    return NextResponse.json({
      success: true,
      extractedContent,
      profileContext,
      message: "LinkedIn profile information extracted and saved successfully",
    });
  } catch (error) {
    console.error("Error processing LinkedIn screenshot:", error);
    return NextResponse.json(
      { error: "Failed to process screenshot" },
      { status: 500 }
    );
  }
}

// Get user's LinkedIn profile context
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        linkedinProfileContext: true,
        linkedinScreenshots: {
          select: {
            id: true,
            sectionType: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({
      profileContext: user?.linkedinProfileContext || null,
      screenshots: user?.linkedinScreenshots || [],
      hasProfile: !!user?.linkedinProfileContext,
    });
  } catch (error) {
    console.error("Error fetching profile context:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// Delete a screenshot
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const screenshotId = searchParams.get("id");

    if (!screenshotId) {
      return NextResponse.json(
        { error: "Screenshot ID is required" },
        { status: 400 }
      );
    }

    await prisma.linkedInScreenshot.delete({
      where: {
        id: screenshotId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting screenshot:", error);
    return NextResponse.json(
      { error: "Failed to delete screenshot" },
      { status: 500 }
    );
  }
}
