/**
 * Get the caret (cursor) coordinates within a textarea
 * Uses a hidden mirror div technique to calculate position
 */
export function getCaretCoordinates(
  textarea: HTMLTextAreaElement,
  position: number
): { top: number; left: number } {
  const mirror = document.createElement("div");
  const style = getComputedStyle(textarea);

  // Copy styles from textarea to mirror
  mirror.style.cssText = `
    position: absolute;
    visibility: hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    font-family: ${style.fontFamily};
    font-size: ${style.fontSize};
    font-weight: ${style.fontWeight};
    line-height: ${style.lineHeight};
    letter-spacing: ${style.letterSpacing};
    padding: ${style.padding};
    border: ${style.border};
    box-sizing: ${style.boxSizing};
    width: ${textarea.clientWidth}px;
  `;

  // Get text before the caret position
  const textBeforeCaret = textarea.value.substring(0, position);

  // Create a span to mark the caret position
  const span = document.createElement("span");
  span.textContent = "|"; // Use a visible character to get position

  // Set the mirror content
  mirror.textContent = textBeforeCaret;
  mirror.appendChild(span);

  document.body.appendChild(mirror);

  const coords = {
    top: span.offsetTop - textarea.scrollTop,
    left: span.offsetLeft,
  };

  document.body.removeChild(mirror);

  return coords;
}

/**
 * Parse content to find all @mentions
 * Returns array of { name, start, end } for each mention
 */
export function parseMentions(
  content: string
): Array<{ name: string; start: number; end: number }> {
  const mentions: Array<{ name: string; start: number; end: number }> = [];
  // Match @followed by word characters and spaces (for multi-word names)
  // But stop at punctuation or newlines
  const regex = /@([\w][\w\s]*[\w]|[\w]+)/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    mentions.push({
      name: match[1],
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return mentions;
}

/**
 * Check if a mention query is currently being typed
 * Returns the query string after @ if active, null otherwise
 */
export function getActiveMentionQuery(
  content: string,
  cursorPosition: number
): { query: string; startIndex: number } | null {
  const textBeforeCursor = content.slice(0, cursorPosition);

  // Look for @ that starts a mention (not preceded by word character)
  // Match @ followed by optional word characters (the partial query)
  const match = textBeforeCursor.match(/(?:^|[^\w])@([\w]*)$/);

  if (match) {
    const query = match[1];
    const atIndex = textBeforeCursor.lastIndexOf("@");
    return { query, startIndex: atIndex };
  }

  return null;
}

/**
 * Insert a mention at the given position, replacing the partial query
 */
export function insertMention(
  content: string,
  mentionName: string,
  startIndex: number,
  cursorPosition: number
): { newContent: string; newCursorPosition: number } {
  const beforeMention = content.slice(0, startIndex);
  const afterCursor = content.slice(cursorPosition);

  // Insert @Name followed by a space
  const mentionText = `@${mentionName} `;
  const newContent = beforeMention + mentionText + afterCursor;
  const newCursorPosition = startIndex + mentionText.length;

  return { newContent, newCursorPosition };
}
