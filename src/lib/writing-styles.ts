/**
 * LinkedIn Writing Style Definitions
 *
 * These styles represent different archetypes of successful LinkedIn writers.
 * Each style has its own voice, structure, and approach to content.
 */

export interface WritingStyle {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  exampleOpener: string;
  promptGuidance: string;
  bestFor: string[];
  avoids: string[];
}

export const WRITING_STYLES: Record<string, WritingStyle> = {
  storyteller: {
    id: "storyteller",
    name: "The Storyteller",
    description: "You share experiences through compelling narratives. Your posts read like mini-stories with a beginning, middle, and end.",
    characteristics: [
      "Opens with a hook that draws readers in",
      "Uses vivid, specific details",
      "Builds tension before the insight",
      "Ends with a memorable takeaway",
      "Writes in flowing paragraphs",
    ],
    exampleOpener: "3 years ago, I got fired on a Tuesday.\n\nI remember sitting in my car in the parking lot, staring at a box of my stuff.\n\nWhat happened next changed everything...",
    promptGuidance: `Write in a narrative storytelling style:
- Open with a specific moment or scene that hooks the reader
- Use "I" statements and personal details
- Build tension through the middle - show the struggle
- Include sensory details and specific moments
- End with the insight or lesson, but make it earned through the story
- Write in flowing paragraphs, not bullet points
- Keep sentences varied in length for rhythm
- NO lists, NO numbered points - pure narrative`,
    bestFor: ["Personal experiences", "Career pivots", "Lessons learned", "Failures and comebacks"],
    avoids: ["Bullet points", "Generic advice", "Abstract concepts without story"],
  },

  thought_leader: {
    id: "thought_leader",
    name: "The Thought Leader",
    description: "You share frameworks, contrarian takes, and industry insights. Your posts make people think differently about their field.",
    characteristics: [
      "Opens with a bold or contrarian statement",
      "Uses numbered lists or frameworks",
      "Mixes one-liners with brief explanations",
      "Includes insider language and references",
      "Often self-deprecating or humble",
    ],
    exampleOpener: "Unpopular opinion: Most \"best practices\" are just popular mistakes.\n\nHere's what actually works (after 10 years of getting it wrong):",
    promptGuidance: `Write in a thought leader style:
- Open with a bold, contrarian, or surprising statement
- Use numbered points or a clear framework structure
- Keep individual points punchy - one idea per point
- Add brief explanations after key points (1-2 sentences max)
- Include insider references your audience will recognize
- Be opinionated - take a clear stance
- Use self-deprecating humor to stay relatable
- End with a thought-provoking question or call to reflection
- Parenthetical asides add personality (like this)`,
    bestFor: ["Industry insights", "Frameworks", "Contrarian takes", "Professional advice"],
    avoids: ["Vague platitudes", "Playing it safe", "Long-winded explanations"],
  },

  educator: {
    id: "educator",
    name: "The Educator",
    description: "You break down complex topics into digestible insights. Your posts teach something valuable in a clear, structured way.",
    characteristics: [
      "Clear structure with headers or numbers",
      "Step-by-step breakdowns",
      "Uses analogies and examples",
      "Actionable takeaways",
      "Accessible language",
    ],
    exampleOpener: "I spent 6 months studying how top performers negotiate.\n\nHere's the 5-step framework they all use:",
    promptGuidance: `Write in an educational style:
- Open by establishing credibility or the value of what you'll share
- Use clear numbered lists or step-by-step structure
- Break complex ideas into simple, digestible parts
- Include specific examples or analogies
- Make each point actionable when possible
- Use simple, accessible language - no jargon without explanation
- End with a clear summary or next step the reader can take
- Format for skimmability - people should get value even if they skim`,
    bestFor: ["How-to content", "Frameworks", "Industry knowledge", "Career advice"],
    avoids: ["Assuming knowledge", "Abstract without concrete", "Too much theory"],
  },

  conversational: {
    id: "conversational",
    name: "The Conversationalist",
    description: "You write like you talk - casual, relatable, and authentic. Your posts feel like a chat with a smart friend.",
    characteristics: [
      "Casual, approachable tone",
      "Short sentences and paragraphs",
      "Asks questions to engage readers",
      "Uses everyday language",
      "Feels spontaneous and unpolished (intentionally)",
    ],
    exampleOpener: "Can we talk about something?\n\nI've been thinking about this all week.\n\nWhy do we pretend to have it all figured out?",
    promptGuidance: `Write in a casual, conversational style:
- Write like you're texting a smart friend
- Use short sentences. Really short sometimes.
- Ask rhetorical questions to engage readers
- Start some sentences with "And" or "But" - it's okay
- Use contractions (don't, can't, won't)
- Include your genuine reactions and thoughts
- Break up paragraphs - lots of white space
- End with a question or invitation to discuss
- Feel free to use "you" directly to the reader
- It's okay to trail off with "..."`,
    bestFor: ["Hot takes", "Observations", "Relatable moments", "Starting discussions"],
    avoids: ["Formal language", "Long paragraphs", "Sounding like a press release"],
  },

  data_driven: {
    id: "data_driven",
    name: "The Analyst",
    description: "You back up insights with data, research, and evidence. Your posts are credible because they're grounded in facts.",
    characteristics: [
      "Leads with surprising statistics or data",
      "References research or studies",
      "Uses specific numbers and percentages",
      "Logical structure",
      "Draws conclusions from evidence",
    ],
    exampleOpener: "I analyzed 1,000 LinkedIn posts from top creators.\n\n87% of viral posts had one thing in common.\n\nHere's what the data revealed:",
    promptGuidance: `Write in a data-driven analytical style:
- Open with a surprising statistic or data point
- Reference specific numbers, percentages, or research
- Structure arguments logically - premise to conclusion
- Use phrases like "the data shows" or "research suggests"
- Include specific examples that illustrate the data
- Draw clear conclusions from the evidence presented
- Acknowledge limitations or nuances when relevant
- End with implications or what readers should do with this information
- IMPORTANT: Only cite data/numbers the user explicitly provides - never invent statistics`,
    bestFor: ["Industry trends", "Research insights", "Myth-busting", "Predictions"],
    avoids: ["Unsupported claims", "Vague generalizations", "Emotional arguments without evidence"],
  },

  minimalist: {
    id: "minimalist",
    name: "The Minimalist",
    description: "You say more with less. Your posts are punchy, memorable, and leave space for the reader to think.",
    characteristics: [
      "Very short posts (under 100 words often)",
      "One powerful idea per post",
      "Lots of white space",
      "Punchy one-liners",
      "No filler words",
    ],
    exampleOpener: "The best career advice I ever got:\n\n\"Stop asking for permission.\"\n\nThat's it.\n\nThat's the post.",
    promptGuidance: `Write in a minimalist style:
- Keep it SHORT - ideally under 100 words
- One idea per post. That's it.
- Use lots of line breaks and white space
- Every word must earn its place
- No filler phrases like "I think" or "In my opinion"
- Let the reader do some of the work
- Punchy endings that hit hard
- If you can cut a word, cut it
- Sometimes a single line is the whole post`,
    bestFor: ["Powerful quotes", "Simple truths", "Memorable moments", "Bold statements"],
    avoids: ["Explanations", "Context", "Multiple points", "Anything that dilutes the message"],
  },
};

export const STYLE_QUIZ_QUESTIONS = [
  {
    id: "q1",
    question: "When you share a professional win, you typically...",
    options: [
      { text: "Tell the whole story - the struggle, the breakthrough, the lesson", style: "storyteller" },
      { text: "Share the framework or approach that made it possible", style: "thought_leader" },
      { text: "Break down the steps so others can replicate it", style: "educator" },
      { text: "Keep it casual - a quick reflection and move on", style: "conversational" },
      { text: "Share the numbers and what they mean", style: "data_driven" },
      { text: "One punchy line that captures the moment", style: "minimalist" },
    ],
  },
  {
    id: "q2",
    question: "Your ideal post length is...",
    options: [
      { text: "Long enough to tell a complete story (200-400 words)", style: "storyteller" },
      { text: "A numbered list with 5-10 insights", style: "thought_leader" },
      { text: "However long it takes to explain clearly", style: "educator" },
      { text: "Short paragraphs, lots of white space", style: "conversational" },
      { text: "Depends on how much data I need to share", style: "data_driven" },
      { text: "As short as possible - under 100 words ideally", style: "minimalist" },
    ],
  },
  {
    id: "q3",
    question: "When giving advice, you prefer to...",
    options: [
      { text: "Share a personal story that illustrates the point", style: "storyteller" },
      { text: "Challenge conventional wisdom with a fresh take", style: "thought_leader" },
      { text: "Provide a clear, actionable framework", style: "educator" },
      { text: "Have a genuine conversation about it", style: "conversational" },
      { text: "Back it up with research or data", style: "data_driven" },
      { text: "Distill it to one unforgettable line", style: "minimalist" },
    ],
  },
  {
    id: "q4",
    question: "Your posts are usually inspired by...",
    options: [
      { text: "Something that happened to me recently", style: "storyteller" },
      { text: "A pattern or insight I've noticed in my industry", style: "thought_leader" },
      { text: "Something I learned that others should know", style: "educator" },
      { text: "A thought I can't stop thinking about", style: "conversational" },
      { text: "Interesting data or research I came across", style: "data_driven" },
      { text: "A truth that needs to be said simply", style: "minimalist" },
    ],
  },
];

/**
 * Calculate the user's primary writing style based on quiz answers
 */
export function calculateStyleFromQuiz(answers: Record<string, string>): {
  primaryStyle: string;
  scores: Record<string, number>;
} {
  const scores: Record<string, number> = {};

  for (const styleId of Object.keys(WRITING_STYLES)) {
    scores[styleId] = 0;
  }

  for (const answer of Object.values(answers)) {
    if (scores[answer] !== undefined) {
      scores[answer]++;
    }
  }

  const primaryStyle = Object.entries(scores).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0];

  return { primaryStyle, scores };
}

/**
 * Get the prompt guidance for a specific writing style
 */
export function getStylePromptGuidance(styleId: string): string {
  const style = WRITING_STYLES[styleId];
  if (!style) {
    return WRITING_STYLES.conversational.promptGuidance;
  }
  return style.promptGuidance;
}

/**
 * Format writing style for AI prompt context
 */
export function formatStyleForPrompt(styleId: string): string {
  const style = WRITING_STYLES[styleId];
  if (!style) {
    return "";
  }

  return `**USER'S WRITING STYLE: ${style.name.toUpperCase()}**
${style.promptGuidance}

This style works best for: ${style.bestFor.join(", ")}
This style avoids: ${style.avoids.join(", ")}`;
}
