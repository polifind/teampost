"use client";

import { useState, useEffect, useRef, RefObject, useCallback } from "react";
import { getCaretCoordinates, getActiveMentionQuery } from "./mentionUtils";

interface MentionDetectionState {
  showAutocomplete: boolean;
  query: string;
  position: { top: number; left: number };
  startIndex: number;
}

interface UseMentionDetectionReturn extends MentionDetectionState {
  closeAutocomplete: () => void;
}

export function useMentionDetection(
  textareaRef: RefObject<HTMLTextAreaElement>,
  value: string
): UseMentionDetectionReturn {
  const [state, setState] = useState<MentionDetectionState>({
    showAutocomplete: false,
    query: "",
    position: { top: 0, left: 0 },
    startIndex: -1,
  });

  // Suppress re-detection briefly after closing autocomplete (e.g. after Enter selection)
  // Without this, the keyup event fires before React re-renders and re-opens the dropdown
  const suppressUntilRef = useRef<number>(0);

  const closeAutocomplete = useCallback(() => {
    suppressUntilRef.current = Date.now() + 150;
    setState((prev) => ({ ...prev, showAutocomplete: false }));
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleSelectionChange = () => {
      // Skip detection if recently suppressed (e.g. right after selecting a mention)
      if (Date.now() < suppressUntilRef.current) return;

      const cursorPos = textarea.selectionStart;
      // Use textarea.value directly instead of React state to avoid stale closures
      const currentValue = textarea.value;
      const mentionQuery = getActiveMentionQuery(currentValue, cursorPos);

      if (mentionQuery) {
        const position = getCaretCoordinates(textarea, mentionQuery.startIndex);
        setState({
          showAutocomplete: true,
          query: mentionQuery.query,
          position,
          startIndex: mentionQuery.startIndex,
        });
      } else {
        setState((prev) => ({
          ...prev,
          showAutocomplete: false,
          query: "",
          startIndex: -1,
        }));
      }
    };

    // Check on input changes
    textarea.addEventListener("input", handleSelectionChange);
    // Check on cursor movement (click, arrow keys)
    textarea.addEventListener("click", handleSelectionChange);
    textarea.addEventListener("keyup", handleSelectionChange);

    return () => {
      textarea.removeEventListener("input", handleSelectionChange);
      textarea.removeEventListener("click", handleSelectionChange);
      textarea.removeEventListener("keyup", handleSelectionChange);
    };
  }, [textareaRef, value]);

  return {
    ...state,
    closeAutocomplete,
  };
}
