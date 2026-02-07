"use client";

import { useState, useEffect, RefObject, useCallback } from "react";
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

  const closeAutocomplete = useCallback(() => {
    setState((prev) => ({ ...prev, showAutocomplete: false }));
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleSelectionChange = () => {
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
