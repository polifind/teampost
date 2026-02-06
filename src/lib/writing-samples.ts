/**
 * Format writing samples for inclusion in AI prompts.
 * Limits to 5 samples, truncated to ~500 chars each.
 */
export function formatWritingSamplesForPrompt(
  samples: Array<{ content: string; source: string }>
): string {
  if (!samples || samples.length === 0) {
    return "";
  }

  const limitedSamples = samples.slice(0, 5);

  const formattedSamples = limitedSamples
    .map((s, i) => {
      const truncated =
        s.content.length > 500
          ? s.content.substring(0, 500) + "..."
          : s.content;
      return `SAMPLE ${i + 1} (${s.source}):\n${truncated}`;
    })
    .join("\n\n");

  return `
**USER'S WRITING SAMPLES (study these to match their voice and style):**
${formattedSamples}

Use these samples to understand and replicate the user's:
- Sentence structure and rhythm
- Word choices and vocabulary
- Tone and personality
- How they open and close pieces
- Their natural voice
`;
}
