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

interface GhostwriterGuideline {
  content: string;
}

interface WritingPreference {
  preference: string;
}

interface ParsedSchedule {
  dayOfWeek: string | null; // "monday", "tuesday", etc.
  time: string | null; // "08:55" 24h format
  timezone: string | null; // "EST", "PST", "America/New_York", etc.
}

/**
 * Parse scheduling information from natural language input
 * Examples: "Monday at 8:55am EST", "post this Tuesday 9am", "schedule for Friday at 2pm PST"
 */
export async function parseScheduleFromMessage(input: string): Promise<ParsedSchedule> {
  const prompt = `Extract scheduling information from this message. Look for day of week, time, and timezone.

Message: "${input}"

Return a JSON object with these fields:
- dayOfWeek: lowercase day name ("monday", "tuesday", etc.) or null if not specified
- time: 24-hour format time string ("08:55", "14:00", etc.) or null if not specified
- timezone: timezone abbreviation or IANA name ("EST", "PST", "America/New_York", etc.) or null if not specified

Only extract scheduling info that is EXPLICITLY mentioned. Do not guess or infer.

Return ONLY the JSON object, no other text.`;

  try {
    const message = await getAnthropicClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("Failed to parse schedule:", error);
  }

  return { dayOfWeek: null, time: null, timezone: null };
}

/**
 * Generate a LinkedIn post from bullet points/ideas sent via Slack
 */
export async function generateSlackPost(
  input: string,
  userName?: string,
  writingPreferences?: WritingPreference[],
  ghostwriterGuidelines?: GhostwriterGuideline[],
  linkedinProfileContext?: string
): Promise<string> {
  // Build context sections
  let contextSection = "";

  if (linkedinProfileContext) {
    contextSection += `\n**ABOUT THE USER:**\n${linkedinProfileContext}\n`;
  }

  if (ghostwriterGuidelines && ghostwriterGuidelines.length > 0) {
    const guidelines = ghostwriterGuidelines.map((g) => `- ${g.content}`).join("\n");
    contextSection += `\n**GHOSTWRITER GUIDELINES (follow these strictly):**\n${guidelines}\n`;
  }

  if (writingPreferences && writingPreferences.length > 0) {
    const preferences = writingPreferences.map((p) => `- ${p.preference}`).join("\n");
    contextSection += `\n**WRITING STYLE PREFERENCES (apply these):**\n${preferences}\n`;
  }

  const prompt = `You are a LinkedIn ghostwriter who writes viral, authentic posts. Transform these rough ideas/bullet points into a polished LinkedIn post.

**USER'S INPUT:**
${input}
${contextSection}
**MOST IMPORTANT RULE - NO HALLUCINATION:**
- ONLY use facts, details, numbers, names, places that the user EXPLICITLY mentioned
- DO NOT invent or fabricate ANY specific details (dates, dollar amounts, company names, statistics, etc.)
- If the user said something vague, keep it vague. Do not add specificity they didn't provide.
- This is critical: making up facts destroys trust and credibility

**STYLE REQUIREMENTS:**

1. STRUCTURE: Use very short sentences. One thought per line. Many line breaks.

2. STORYTELLING: If they shared a story, use ONLY the specific details they provided.
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

6. LENGTH: 150-300 words. Every word must earn its place.

7. ENDING: End with a single powerful line or question. Not a generic call to action.

The post should feel like it was written by${userName ? ` ${userName}` : " the user"} themselves.

**Output:**
Generate one LinkedIn post. No commentary. No explanation. Just the post content.`;

  const message = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
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

/**
 * Regenerate a post with user feedback (for Slack context)
 */
export async function regenerateSlackPost(
  originalPost: string,
  feedback: string,
  writingPreferences?: WritingPreference[]
): Promise<string> {
  let preferencesSection = "";
  if (writingPreferences && writingPreferences.length > 0) {
    const preferencesList = writingPreferences
      .map((p) => `- ${p.preference}`)
      .join("\n");
    preferencesSection = `\n**WRITING STYLE PREFERENCES (apply these):**\n${preferencesList}\n`;
  }

  const prompt = `You are a LinkedIn ghostwriter. Rewrite this post based on the user's feedback.

**Original Post:**
${originalPost}

**User Feedback:**
${feedback}
${preferencesSection}
**MOST IMPORTANT RULE - NO HALLUCINATION:**
- ONLY use facts, details, numbers, names, places that appear in the original post
- DO NOT invent or add ANY new specific details
- If the user asks for something more specific than the original, keep it general unless they provide the specifics

**STYLE REQUIREMENTS:**
- Very short sentences. One thought per line. Many line breaks.
- Build tension before the payoff
- End with a punchy line or question
- NO corporate jargon, NO hashtags, NO emojis
- 150-300 words
- Write like it was spoken

**Output:**
Generate the improved post. No commentary. No explanation. Just the post content.`;

  const message = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
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
