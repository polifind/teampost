"use client";

import { useMemo } from "react";
import type { LinkedInContact } from "@/types";

interface MentionHighlightOverlayProps {
  content: string;
  selectedTags: LinkedInContact[];
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders an overlay div that mirrors the textarea content
 * with highlighted @mentions shown in blue
 */
export function MentionHighlightOverlay({
  content,
  selectedTags,
  className = "",
  style,
}: MentionHighlightOverlayProps) {
  const highlightedContent = useMemo(() => {
    if (!content) return null;

    // Create a set of contact names for quick lookup (case-insensitive)
    const mentionNames = new Set(
      selectedTags.map((t) => t.name.toLowerCase())
    );

    // Split content by @mentions while preserving the @ symbol
    // This regex captures @followed by word characters and optional spaces for multi-word names
    const parts: Array<{ text: string; isMention: boolean }> = [];
    let lastIndex = 0;
    const regex = /@([\w][\w\s]*[\w]|[\w]+)/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({
          text: content.slice(lastIndex, match.index),
          isMention: false,
        });
      }

      // Check if this mention is in selectedTags
      const mentionName = match[1];
      const isTagged = mentionNames.has(mentionName.toLowerCase());

      parts.push({
        text: match[0], // Include the @ symbol
        isMention: isTagged,
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last match
    if (lastIndex < content.length) {
      parts.push({
        text: content.slice(lastIndex),
        isMention: false,
      });
    }

    // Render the parts
    return parts.map((part, i) => {
      if (part.isMention) {
        return (
          <span key={i} className="text-blue-600 font-medium">
            {part.text}
          </span>
        );
      }
      return <span key={i}>{part.text}</span>;
    });
  }, [content, selectedTags]);

  return (
    <div
      className={`pointer-events-none whitespace-pre-wrap break-words overflow-hidden ${className}`}
      style={style}
      aria-hidden="true"
    >
      {highlightedContent}
      {/* Add a trailing character to ensure same height as textarea */}
      <span className="invisible">|</span>
    </div>
  );
}
