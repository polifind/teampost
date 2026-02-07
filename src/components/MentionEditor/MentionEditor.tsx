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

  // Build list of mention names for display indicator
  const mentionNames = useMemo(() => {
    if (selectedTags.length === 0) return [];
    return selectedTags.map((t) => t.name);
  }, [selectedTags]);

  const scrollTop = textareaRef.current?.scrollTop ?? 0;
  const scrollLeft = textareaRef.current?.scrollLeft ?? 0;
  const adjustedPosition = {
    top: Math.max(0, position.top - scrollTop),
    left: Math.max(0, position.left - scrollLeft),
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Simple textarea - no overlay, just a real textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled || addingContact}
        className="w-full p-3 text-sm leading-relaxed border border-claude-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent-coral focus:border-transparent caret-gray-900"
        style={{
          minHeight,
          maxHeight: "400px",
        }}
      />

      {/* Show tagged contacts as chips below the textarea */}
      {mentionNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full"
            >
              @{tag.name}
            </span>
          ))}
        </div>
      )}

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
