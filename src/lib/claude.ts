import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface VoiceNoteInput {
  questionIndex: number;
  questionText: string;
  transcription: string;
}

export async function generateLinkedInPosts(
  voiceNotes: VoiceNoteInput[],
  userName?: string
): Promise<string[]> {
  const transcriptionsText = voiceNotes
    .map(
      (vn, index) =>
        `**Question ${index + 1}:** ${vn.questionText}\n**Response:** ${vn.transcription}`
    )
    .join("\n\n---\n\n");

  const prompt = `You are a LinkedIn ghostwriter who writes viral, authentic posts. Transform these voice notes into ${voiceNotes.length} LinkedIn posts.

**CRITICAL STYLE REQUIREMENTS - follow these exactly:**

1. STRUCTURE: Use very short sentences. One thought per line. Many line breaks.
   Example:
   "I sat in the engineering building at Brown for 3 days.
   I didn't belong there. I wasn't an engineer.
   I couldn't build it alone. So I waited."

2. STORYTELLING: Tell specific stories with concrete details. Day 1. Day 2. Day 3. Numbers. Names. Places.
   - Set the scene with a specific moment
   - Build tension through the struggle
   - Show the turning point
   - Land the insight

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
   - NO generic advice or platitudes
   - NO "Here's what I learned"

6. LENGTH: 150-300 words per post. Every word must earn its place.

7. ENDING: End with a single powerful line or question. Not a generic call to action.

The posts should feel like they were written in 2 minutes by someone who just experienced something real.

**Voice Note Transcriptions:**

${transcriptionsText}

**Output Format:**
Return exactly ${voiceNotes.length} posts, separated by "---POST---". No commentary. Just the posts.`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Extract text content
  const responseText = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  // Split posts
  const posts = responseText
    .split("---POST---")
    .map((post) => post.trim())
    .filter((post) => post.length > 0);

  return posts;
}

export async function regeneratePost(
  originalPost: string,
  feedback?: string
): Promise<string> {
  const prompt = `You are a LinkedIn ghostwriter. Rewrite this post with a completely different angle while keeping the core story.

**Original Post:**
${originalPost}

${feedback ? `**User Feedback:** ${feedback}` : "**Request:** Try a different hook, different structure, different angle. Same story, fresh take."}

**CRITICAL STYLE REQUIREMENTS:**
- Very short sentences. One thought per line. Many line breaks.
- Tell the story with specific details: numbers, names, places, days
- Build tension before the payoff
- End with a punchy line or question
- NO corporate jargon, NO hashtags, NO emojis
- NO "I'm excited to announce" or generic advice
- 150-300 words
- Write like it was spoken in 2 minutes

Generate a new version:`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const responseText = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  return responseText.trim();
}
