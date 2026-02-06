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
      "Uses vivid, specific details (times, ages, places)",
      "Builds tension before the insight",
      "Ends with a memorable, earned takeaway",
      "Writes in short paragraphs with rhythm",
    ],
    exampleOpener: "Google sent me a cease and desist at 13 years old.\n\nI had 2.5M users for my previous app.\n\nAnd my parents had no idea.",
    promptGuidance: `Write in a narrative storytelling style:
- Open with a SPECIFIC, SHOCKING hook - a moment that makes readers stop scrolling
- Ground the story with concrete details: ages, times, numbers, places
- Build an emotional arc: setup → tension → turning point → resolution
- Show contrast (what people assumed vs. reality)
- Include a "scene" moment where readers can visualize what happened
- The insight/lesson must be EARNED through the story, not stated upfront
- Use short paragraphs (1-3 sentences each) to control pacing
- Vary sentence length for rhythm: long setup, short punch
- End with a universal truth that connects personal story to reader's life
- If listing lessons, make them flow FROM the story (e.g., "Limited screen time taught urgency")
- Callback to present day to show relevance ("Those constraints still drive how I work today")`,
    bestFor: ["Personal experiences", "Career pivots", "Origin stories", "Failures and comebacks"],
    avoids: ["Abstract advice without story", "Insights before the story earns them", "Generic openings"],
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
- Challenge conventional wisdom or reframe popular narratives
- If disagreeing with someone, propose your own alternative framework
- Explain WHY the old model existed before arguing against it
- Use numbered points or a clear framework structure when listing
- Keep individual points punchy - one idea per point
- Be opinionated - take a clear stance, don't hedge
- Include insider references your audience will recognize
- End with a punchy one-liner that crystallizes your point
- Lowercase and casual tone is okay if it feels authentic
- Parenthetical asides add personality (like this)`,
    bestFor: ["Industry insights", "Frameworks", "Contrarian takes", "Professional advice", "Reframing narratives"],
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

  builder: {
    id: "builder",
    name: "The Builder",
    description: "You share what you're building and the hard problems you're solving. Your posts showcase technical depth and mission-driven work.",
    characteristics: [
      "Leads with an intriguing problem or challenge",
      "Shows technical depth without being inaccessible",
      "Uses specific metrics and numbers",
      "Frames challenges as exciting, not complaints",
      "Attracts talent and customers through authenticity",
    ],
    exampleOpener: "How do you train AI to hear people that whisper to it?\n\nHere's our challenge: Millions of users whisper in open offices - speaking so quietly their coworkers can't hear them.\n\nTraditional voice AI completely fails here.",
    promptGuidance: `Write in a builder/founder style:
- Open with the PROBLEM or CHALLENGE you're solving - make it intriguing
- Show technical depth through specific details, not jargon
- Use concrete metrics: growth numbers, latency targets, scale challenges
- Frame each challenge as an exciting puzzle, not a complaint
- List multiple hard problems to show the depth of what you're tackling
- Include the "why it matters" - user impact, mission
- Appeal to identity: "We need people who see 'impossible' as 'not yet solved'"
- Short paragraphs with bold problem statements
- End with a clear call to action or invitation
- Sound like a founder who's genuinely excited about hard problems
- Avoid: generic "we're hiring" energy, oversimplifying challenges, humble bragging`,
    bestFor: ["Hiring posts", "Product updates", "Technical challenges", "Company building"],
    avoids: ["Generic job postings", "Humble bragging", "Oversimplified problems"],
  },

  curator: {
    id: "curator",
    name: "The Curator",
    description: "You aggregate insights, share valuable resources, and synthesize trends for your audience. Your posts are go-to sources for curated wisdom.",
    characteristics: [
      "Opens with a bold interpretation or framing",
      "Synthesizes insights from multiple sources",
      "Uses numbered lists of resources or takeaways",
      "Includes specific stats or social proof",
      "Provides clear value through curation",
    ],
    exampleOpener: "I asked 1,000 people: What's a tool you vibe-coded that you actually use regularly?\n\nThe response was overwhelming.\n\nHere are 50+ of my favorite examples and 5 key takeaways:",
    promptGuidance: `Write in a curator/synthesizer style:
- Open with a bold claim, interpretation, or the "why this matters" framing
- Reference credible sources or data (surveys, experts, trends you've noticed)
- Use numbered lists for resources, takeaways, or recommendations
- Include specific numbers for social proof (views, responses, results)
- Frame yourself as the helpful filter - you did the work so they don't have to
- Add your own interpretation layer - don't just list, provide insight
- Use arrows (→) and short paragraphs for scanability
- End with a clear call to action or resource link
- If promoting something, lead with genuine value first
- Sound like a trusted guide who curates the best of what's out there`,
    bestFor: ["Resource roundups", "Trend analysis", "Course/tool recommendations", "Community insights"],
    avoids: ["Pure self-promotion", "Lists without context", "Sharing without adding value"],
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
      { text: "Curate a list of resources or insights for others", style: "curator" },
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
      { text: "A curated list with my key takeaways", style: "curator" },
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
      { text: "Point them to the best resources I've found", style: "curator" },
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
      { text: "A great resource, tool, or content I want to share", style: "curator" },
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
