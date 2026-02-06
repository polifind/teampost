import Anthropic from "@anthropic-ai/sdk";

// Lazy initialization to avoid build errors when ANTHROPIC_API_KEY is not set
let _anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _anthropic;
}

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

**MOST IMPORTANT RULE - NO HALLUCINATION:**
- ONLY use facts, details, numbers, names, places, and stories that the user EXPLICITLY mentioned in their voice notes
- DO NOT invent or fabricate ANY specific details (dates, dollar amounts, company names, statistics, locations, etc.)
- If the user said something vague, keep it vague. Do not add specificity they didn't provide.
- If you're unsure whether a detail was mentioned, DO NOT include it
- This is critical: making up facts destroys trust and credibility

**STYLE REQUIREMENTS:**

1. STRUCTURE: Use very short sentences. One thought per line. Many line breaks.

2. STORYTELLING: Use ONLY the specific details the user actually shared.
   - Set the scene with moments THEY described
   - Build tension through struggles THEY mentioned
   - Show turning points THEY experienced

3. TENSION: Build tension using their actual words and experiences.

4. PUNCHLINES: End sections with short, punchy lines that hit hard.

5. AUTHENTICITY: Write like it was spoken, not written. Casual. Direct. Real.
   - NO corporate jargon
   - NO hashtags
   - NO emojis
   - NO "I'm excited to announce"
   - NO generic advice or platitudes
   - NO "Here's what I learned"

6. LENGTH: 150-300 words per post. Every word must earn its place.

7. ENDING: End with a single powerful line or question. Not a generic call to action.

The posts should feel like they were written by the user themselves, using their actual experiences.

**Voice Note Transcriptions:**

${transcriptionsText}

**Output Format:**
Return exactly ${voiceNotes.length} posts, separated by "---POST---". No commentary. Just the posts.`;

  const message = await getAnthropicClient().messages.create({
    model: "claude-opus-4-5-20251101",
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

interface WritingPreference {
  preference: string;
}

export async function regeneratePost(
  originalPost: string,
  feedback?: string,
  writingPreferences?: WritingPreference[]
): Promise<string> {
  // Build writing preferences section
  let preferencesSection = "";
  if (writingPreferences && writingPreferences.length > 0) {
    const preferencesList = writingPreferences
      .map((p) => `- ${p.preference}`)
      .join("\n");
    preferencesSection = `

**USER'S PERSONAL WRITING PREFERENCES (VERY IMPORTANT - apply these):**
${preferencesList}
`;
  }

  const prompt = `You are a LinkedIn ghostwriter. Rewrite this post with a completely different angle while keeping the core story.

**Original Post:**
${originalPost}

${feedback ? `**User Feedback:** ${feedback}` : "**Request:** Try a different hook, different structure, different angle. Same story, fresh take."}
${preferencesSection}
**MOST IMPORTANT RULE - NO HALLUCINATION:**
- ONLY use facts, details, numbers, names, places that appear in the original post
- DO NOT invent or add ANY new specific details (dates, dollar amounts, statistics, etc.)
- If something is vague in the original, keep it vague
- Making up facts destroys trust and credibility

**STYLE REQUIREMENTS:**
- Very short sentences. One thought per line. Many line breaks.
- Use ONLY the details from the original post
- Build tension before the payoff
- End with a punchy line or question
- NO corporate jargon, NO hashtags, NO emojis
- NO "I'm excited to announce" or generic advice
- 150-300 words
- Write like it was spoken in 2 minutes

Generate a new version:`;

  const message = await getAnthropicClient().messages.create({
    model: "claude-opus-4-5-20251101",
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

interface EmployeeContext {
  name: string;
  linkedinProfileContext?: string;
  writingPreferences?: string[];
}

export async function generateBulkVariations(
  originalContent: string,
  employees: EmployeeContext[],
  variationContext?: string
): Promise<string[]> {
  const variations: string[] = [];

  for (const employee of employees) {
    const preferencesSection = employee.writingPreferences?.length
      ? `\n**THEIR WRITING STYLE PREFERENCES:**\n${employee.writingPreferences.map((p) => `- ${p}`).join("\n")}`
      : "";

    const profileSection = employee.linkedinProfileContext
      ? `\n**THEIR PROFESSIONAL BACKGROUND:**\n${employee.linkedinProfileContext}`
      : "";

    const prompt = `You are adapting a LinkedIn post for a different person while keeping the core message and structure.

**ORIGINAL POST:**
${originalContent}

**TARGET PERSON:**
Name: ${employee.name}${profileSection}${preferencesSection}

**VARIATION INSTRUCTIONS:**
${variationContext || "Create a personalized version that sounds authentic to this person while keeping the same core message and lesson."}

**CRITICAL RULES:**
1. Keep the EXACT same core message/lesson/insight
2. Keep the same general structure and flow
3. Adapt the specific examples and framing to fit their background (if provided)
4. Match their writing style if preferences are provided
5. DO NOT invent facts about the person - only use details explicitly provided
6. If no background is provided, just vary the phrasing while keeping the message
7. Maintain the same punchy, short-sentence LinkedIn format
8. NO hashtags, NO emojis, NO corporate jargon
9. 150-300 words

Generate the adapted post (just the post content, no commentary):`;

    const message = await getAnthropicClient().messages.create({
      model: "claude-opus-4-5-20251101",
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

    variations.push(responseText.trim());
  }

  return variations;
}
