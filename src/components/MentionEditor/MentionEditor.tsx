"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import type { LinkedInContact } from "@/types";
import { useMentionDetection } from "./useMentionDetection";
import { MentionAutocomplete } from "./MentionAutocomplete";
import { insertMention } from "./mentionUtils";

interface MentionEditorProps {
  value: string;
  onChange: (value: string) => void;
  contacts: LinkedInContact[];
  selectedTags: LinkedInContact[];
  onTagsChange: (tags: LinkedInContact[]) => void;
  onAddContact?: (name: string) => Promise<LinkedInContact | null>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minHeight?: string;
}

export function MentionEditor({
  value,
  onChange,
  contacts,
  selectedTags,
  onTagsChange,
  onAddContact,
  placeholder = "Write your post...",
  className = "",
  disabled = false,
  minHeight = "200px",
}: MentionEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [addingContact, setAddingContact] = useState(false);

  // Store pending cursor position to apply after React re-render
  const pendingCursor = useRef<number | null>(null);

  // Undo/redo stack for controlled textarea (browser undo breaks with React controlled inputs)
  const undoStack = useRef<Array<{ value: string; cursor: number }>>([]);
  const redoStack = useRef<Array<{ value: string; cursor: number }>>([]);
  const isUndoRedo = useRef(false);

  // Apply pending cursor position after value prop updates the textarea
  useEffect(() => {
    if (pendingCursor.current !== null && textareaRef.current) {
      const pos = pendingCursor.current;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(pos, pos);
      pendingCursor.current = null;
    }
  }, [value]);

  const {
    showAutocomplete,
    query,
    position,
    startIndex,
    closeAutocomplete,
  } = useMentionDetection(textareaRef, value);

  // Handle input changes (user typing)
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isUndoRedo.current) {
      // Push current state to undo stack before applying the change
      undoStack.current.push({
        value,
        cursor: e.target.selectionStart,
      });
      // Cap undo stack at 100 entries
      if (undoStack.current.length > 100) undoStack.current.shift();
      // Clear redo stack on new input
      redoStack.current = [];
    }
    isUndoRedo.current = false;
    onChange(e.target.value);
  }, [onChange, value]);

  // Handle undo/redo keyboard shortcuts (Cmd+Z / Cmd+Shift+Z)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (!isMeta || e.key !== "z") return;

      e.preventDefault();

      if (e.shiftKey) {
        // Redo
        if (redoStack.current.length === 0) return;
        const redoEntry = redoStack.current.pop()!;
        undoStack.current.push({
          value,
          cursor: textarea.selectionStart,
        });
        isUndoRedo.current = true;
        pendingCursor.current = redoEntry.cursor;
        onChange(redoEntry.value);
      } else {
        // Undo
        if (undoStack.current.length === 0) return;
        const undoEntry = undoStack.current.pop()!;
        redoStack.current.push({
          value,
          cursor: textarea.selectionStart,
        });
        isUndoRedo.current = true;
        pendingCursor.current = undoEntry.cursor;
        onChange(undoEntry.value);
      }
    };

    textarea.addEventListener("keydown", handleKeyDown);
    return () => textarea.removeEventListener("keydown", handleKeyDown);
  }, [value, onChange]);

  // Handle selecting a contact from autocomplete
  const handleSelectContact = useCallback(
    (contact: LinkedInContact) => {
      if (!textareaRef.current) return;

      const cursorPos = textareaRef.current.selectionStart;
      const { newContent, newCursorPosition } = insertMention(
        value,
        contact.name,
        startIndex,
        cursorPos
      );

      // Set pending cursor so it applies after React re-renders with new value
      pendingCursor.current = newCursorPosition;
      onChange(newContent);

      // Add to selectedTags if not already present
      if (!selectedTags.find((t) => t.id === contact.id)) {
        onTagsChange([...selectedTags, contact]);
      }

      closeAutocomplete();
    },
    [value, startIndex, selectedTags, onChange, onTagsChange, closeAutocomplete]
  );

  // Handle adding a new contact
  const handleAddNew = useCallback(
    async (name: string) => {
      if (!name.trim()) {
        closeAutocomplete();
        return;
      }

      if (onAddContact) {
        // Capture current positions BEFORE awaiting, as state will reset during the modal
        const capturedStartIndex = startIndex;
        const capturedCursorPos = textareaRef.current?.selectionStart ?? 0;
        const capturedValue = value;

        setAddingContact(true);
        try {
          const newContact = await onAddContact(name.trim());
          if (newContact && textareaRef.current) {
            const { newContent, newCursorPosition } = insertMention(
              capturedValue,
              newContact.name,
              capturedStartIndex,
              capturedCursorPos
            );

            pendingCursor.current = newCursorPosition;
            onChange(newContent);

            if (!selectedTags.find((t) => t.id === newContact.id)) {
              onTagsChange([...selectedTags, newContact]);
            }

            closeAutocomplete();
          }
        } catch (error) {
          console.error("Failed to add contact:", error);
        } finally {
          setAddingContact(false);
        }
      } else {
        closeAutocomplete();
      }
    },
    [onAddContact, startIndex, value, selectedTags, onChange, onTagsChange, closeAutocomplete]
  );

  // Helper: check if @Name appears as a proper mention at a given position
  const isMentionAtBoundary = useCallback((lowerContent: string, originalContent: string, mentionStr: string, idx: number) => {
    if (idx > 0 && /\w/.test(originalContent[idx - 1])) return false;
    const afterIdx = idx + mentionStr.length;
    if (afterIdx < originalContent.length && /\w/.test(originalContent[afterIdx])) return false;
    return true;
  }, []);

  // Auto-detect mentions in content and sync with selectedTags (add new + prune stale)
  useEffect(() => {
    const lowerContent = value.toLowerCase();
    const matchedContacts = contacts.filter((c) => {
      const mentionStr = `@${c.name.toLowerCase()}`;
      const idx = lowerContent.indexOf(mentionStr);
      if (idx === -1) return false;
      return isMentionAtBoundary(lowerContent, value, mentionStr, idx);
    });

    const tagsToKeep = selectedTags.filter((t) => {
      const mentionStr = `@${t.name.toLowerCase()}`;
      const idx = lowerContent.indexOf(mentionStr);
      if (idx === -1) return false;
      return isMentionAtBoundary(lowerContent, value, mentionStr, idx);
    });
    const currentTagIds = new Set(selectedTags.map((t) => t.id));
    const newTags = matchedContacts.filter((c) => !currentTagIds.has(c.id));

    const updatedTags = [...tagsToKeep, ...newTags];

    if (updatedTags.length !== selectedTags.length || newTags.length > 0) {
      onTagsChange(updatedTags);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, contacts]);

  // Generate the highlighted overlay content
  const highlightedContent = useMemo(() => {
    if (!value) return null;

    if (selectedTags.length === 0) {
      return [{ text: value, isMention: false }];
    }

    const sortedTags = [...selectedTags].sort((a, b) => b.name.length - a.name.length);
    const escapedNames = sortedTags.map((t) =>
      t.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    const mentionRegex = new RegExp(`@(${escapedNames.join("|")})(?=\\s|$|[^\\w])`, "gi");

    const parts: Array<{ text: string; isMention: boolean }> = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(value)) !== null) {
      if (match.index > lastIndex) {
        const text = value.slice(lastIndex, match.index);
        parts.push({ text, isMention: false });
      }
      parts.push({
        text: match[0],
        isMention: true,
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < value.length) {
      const text = value.slice(lastIndex);
      parts.push({ text, isMention: false });
    }

    return parts;
  }, [value, selectedTags]);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea to fit content (up to maxHeight), then scroll
  const autoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const maxH = 400;
    const nextHeight = Math.min(scrollHeight, maxH);
    textarea.style.height = `${nextHeight}px`;
    // Enable scrolling only when content exceeds maxHeight
    textarea.style.overflowY = scrollHeight > maxH ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  useEffect(() => {
    autoResize();
  }, [autoResize]);

  const scrollTop = textareaRef.current?.scrollTop ?? 0;
  const scrollLeft = textareaRef.current?.scrollLeft ?? 0;
  const adjustedPosition = {
    top: Math.max(0, position.top - scrollTop),
    left: Math.max(0, position.left - scrollLeft),
  };

  // Sync overlay scroll position with textarea
  const handleScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Container for textarea and overlay */}
      <div className="relative" style={{ minHeight }}>
        {/* Highlight overlay - shows formatted text, scrolls in sync with textarea */}
        <div
          ref={overlayRef}
          className="absolute inset-0 p-3 text-sm leading-relaxed pointer-events-none whitespace-pre-wrap break-words overflow-hidden border border-transparent rounded-lg"
          aria-hidden="true"
        >
          {highlightedContent?.map((part, i) => {
            if (part.isMention) {
              const atSymbol = part.text.charAt(0);
              const name = part.text.slice(1);
              return (
                <span key={i}>
                  <span className="text-transparent">{atSymbol}</span>
                  <span className="font-semibold text-blue-600">{name}</span>
                </span>
              );
            }
            return <span key={i}>{part.text}</span>;
          })}
          {!value && (
            <span className="text-gray-400">{placeholder}</span>
          )}
          <span className="invisible">|</span>
        </div>

        {/* Textarea - controlled, transparent text, user types here */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onScroll={handleScroll}
          placeholder=""
          disabled={disabled || addingContact}
          className="w-full p-3 text-sm leading-relaxed bg-transparent border border-claude-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent-coral focus:border-transparent caret-gray-900 relative z-10"
          style={{
            minHeight,
            maxHeight: "400px",
            color: "transparent",
            caretColor: "#111827",
          }}
        />

        {/* Autocomplete dropdown */}
        {showAutocomplete && !addingContact && (
          <MentionAutocomplete
            query={query}
            position={adjustedPosition}
            contacts={contacts}
            onSelect={handleSelectContact}
            onAddNew={handleAddNew}
            onClose={closeAutocomplete}
          />
        )}
      </div>

      {/* Loading indicator when adding contact */}
      {addingContact && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-sm text-accent-coral">
            <div className="w-4 h-4 border-2 border-accent-coral border-t-transparent rounded-full animate-spin" />
            Adding contact...
          </div>
        </div>
      )}
    </div>
  );
}
