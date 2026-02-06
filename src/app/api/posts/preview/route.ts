import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { transcription, questionText, questionIndex } = await request.json();

    // If no transcription, return a helpful message
    if (!transcription) {
      return NextResponse.json(
        { error: "No transcription available. Please try recording again or use text input." },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      // Return a demo post for development
      return NextResponse.json({
        content: `The best career decision I ever made was saying "yes" to something that terrified me.

Three years ago, I was offered a role that felt way above my capabilities. Imposter syndrome hit hard.

I almost said no.

But I remembered something my mentor told me: "If you're not scared, you're not growing."

So I took the leap.

Day 1: Overwhelmed.
Week 1: Still overwhelmed.
Month 1: Starting to figure it out.

Now? I can't imagine having stayed comfortable.

The lesson: Growth lives on the other side of fear.

What opportunity are you too scared to take?`,
        questionIndex,
        isDemoContent: true,
      });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Get user's LinkedIn profile context if available
    let profileContext = "";
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { linkedinProfileContext: true },
      });
      if (user?.linkedinProfileContext) {
        profileContext = `
AUTHOR'S PROFESSIONAL BACKGROUND (use this to personalize the post):
${user.linkedinProfileContext}

---

`;
      }
    }

    const prompt = `You are a LinkedIn ghostwriter who writes viral, authentic posts. Generate ONE post based on this voice note.
${profileContext}
Question asked: "${questionText}"

Voice note transcription:
"${transcription}"

CRITICAL STYLE REQUIREMENTS - follow these exactly:

1. STRUCTURE: Use very short sentences. One thought per line. Many line breaks.
   Example:
   "I sat in the engineering building at Brown for 3 days.
   I didn't belong there. I wasn't an engineer.
   I couldn't build it alone. So I waited."

2. STORYTELLING: Tell a specific story with concrete details. Day 1. Day 2. Day 3. Numbers. Names. Places.

3. TENSION: Build tension. Show the struggle before the win.
   "No. No. Not interested. No. One guy laughed.
   15 engineers. 15 rejections.
   Then someone walked in."

4. PUNCHLINES: End sections with short, punchy lines that hit hard.
   "We just built it."
   "First. In. The. World."
   "What if I had?"

5. AUTHENTICITY: Write like it was spoken, not written. Casual. Direct. Real.
   - NO corporate jargon
   - NO hashtags
   - NO emojis
   - NO "I'm excited to announce"
   - NO generic advice

6. LENGTH: 150-300 words. Every word must earn its place.

7. ENDING: End with a single powerful line or question. Not a call to action.

The post should feel like it was written in 2 minutes by someone who just experienced something real.

Return ONLY the post content, nothing else.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const postContent =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({
      content: postContent.trim(),
      questionIndex,
    });
  } catch (error) {
    console.error("Error generating post preview:", error);
    return NextResponse.json(
      { error: "Failed to generate post preview" },
      { status: 500 }
    );
  }
}
