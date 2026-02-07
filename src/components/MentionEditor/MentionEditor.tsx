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
  // Track internal value for uncontrolled textarea
  const [internalValue, setInternalValue] = useState(value);
  // Flag to prevent external sync from overwriting internal changes
  const isInternalChange = useRef(false);

  // Sync from parent prop → textarea (only when parent changes value externally)
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (textareaRef.current && textareaRef.current.value !== value) {
      textareaRef.current.value = value;
    }
    setInternalValue(value);
  }, [value]);

  const {
    showAutocomplete,
    query,
    position,
    startIndex,
    closeAutocomplete,
  } = useMentionDetection(textareaRef, internalValue);

  // Handle native input events (user typing)
  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const newValue = textarea.value;
    setInternalValue(newValue);
    isInternalChange.current = true;
    onChange(newValue);
    // Auto-resize
    textarea.style.height = "auto";
    const scrollH = textarea.scrollHeight;
    const maxH = 400;
    textarea.style.height = `${Math.min(scrollH, maxH)}px`;
    textarea.style.overflowY = scrollH > maxH ? "auto" : "hidden";
  }, [onChange]);

  // Handle selecting a contact from autocomplete
  const handleSelectContact = useCallback(
    (contact: LinkedInContact) => {
      if (!textareaRef.current) return;

      const cursorPos = textareaRef.current.selectionStart;
      const currentValue = textareaRef.current.value;
      const { newContent, newCursorPosition } = insertMention(
        currentValue,
        contact.name,
        startIndex,
        cursorPos
      );

      // Update the DOM directly (uncontrolled)
      textareaRef.current.value = newContent;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);

      setInternalValue(newContent);
      isInternalChange.current = true;
      onChange(newContent);

      // Add to selectedTags if not already present
      if (!selectedTags.find((t) => t.id === contact.id)) {
        onTagsChange([...selectedTags, contact]);
      }

      closeAutocomplete();
    },
    [startIndex, selectedTags, onChange, onTagsChange, closeAutocomplete]
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
        const capturedValue = textareaRef.current?.value ?? "";

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

            textareaRef.current.value = newContent;
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);

            setInternalValue(newContent);
            isInternalChange.current = true;
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
    [onAddContact, startIndex, selectedTags, onChange, onTagsChange, closeAutocomplete]
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
    const lowerContent = internalValue.toLowerCase();
    const matchedContacts = contacts.filter((c) => {
      const mentionStr = `@${c.name.toLowerCase()}`;
      const idx = lowerContent.indexOf(mentionStr);
      if (idx === -1) return false;
      return isMentionAtBoundary(lowerContent, internalValue, mentionStr, idx);
    });

    const tagsToKeep = selectedTags.filter((t) => {
      const mentionStr = `@${t.name.toLowerCase()}`;
      const idx = lowerContent.indexOf(mentionStr);
      if (idx === -1) return false;
      return isMentionAtBoundary(lowerContent, internalValue, mentionStr, idx);
    });
    const currentTagIds = new Set(selectedTags.map((t) => t.id));
    const newTags = matchedContacts.filter((c) => !currentTagIds.has(c.id));

    const updatedTags = [...tagsToKeep, ...newTags];

    if (updatedTags.length !== selectedTags.length || newTags.length > 0) {
      onTagsChange(updatedTags);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalValue, contacts]);

  // Build list of mention names for display indicator
  const mentionNames = useMemo(() => {
    if (selectedTags.length === 0) return [];
    return selectedTags.map((t) => t.name);
  }, [selectedTags]);

  // Auto-resize on mount and when value changes externally
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const scrollH = textarea.scrollHeight;
    const maxH = 400;
    textarea.style.height = `${Math.min(scrollH, maxH)}px`;
    textarea.style.overflowY = scrollH > maxH ? "auto" : "hidden";
  }, [value]);

  const scrollTop = textareaRef.current?.scrollTop ?? 0;
  const scrollLeft = textareaRef.current?.scrollLeft ?? 0;
  const adjustedPosition = {
    top: Math.max(0, position.top - scrollTop),
    left: Math.max(0, position.left - scrollLeft),
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Uncontrolled textarea — browser manages input natively */}
      <textarea
        ref={textareaRef}
        defaultValue={value}
        onInput={handleInput}
        placeholder={placeholder}
        disabled={disabled || addingContact}
        className="w-full p-3 text-sm leading-relaxed border border-claude-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent-coral focus:border-transparent caret-gray-900"
        style={{
          minHeight,
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
