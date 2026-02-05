"use client";

import { useRef, useState, useCallback, useEffect } from "react";
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
  // Track the internal value for uncontrolled behavior
  const [internalValue, setInternalValue] = useState(value);

  // Sync internal value when prop changes from outside
  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value);
      if (textareaRef.current && textareaRef.current.value !== value) {
        textareaRef.current.value = value;
      }
    }
  }, [value]);

  const {
    showAutocomplete,
    query,
    position,
    startIndex,
    closeAutocomplete,
  } = useMentionDetection(textareaRef, internalValue);

  // Handle input changes
  const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const newValue = target.value;
    setInternalValue(newValue);
    onChange(newValue);
  }, [onChange]);

  // Handle selecting a contact from autocomplete
  const handleSelectContact = useCallback(
    (contact: LinkedInContact) => {
      if (!textareaRef.current) return;

      const cursorPos = textareaRef.current.selectionStart;
      const { newContent, newCursorPosition } = insertMention(
        internalValue,
        contact.name,
        startIndex,
        cursorPos
      );

      setInternalValue(newContent);
      onChange(newContent);

      // Add to selectedTags if not already present
      if (!selectedTags.find((t) => t.id === contact.id)) {
        onTagsChange([...selectedTags, contact]);
      }

      closeAutocomplete();

      // Restore focus and cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.value = newContent;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    },
    [internalValue, startIndex, selectedTags, onChange, onTagsChange, closeAutocomplete]
  );

  // Handle adding a new contact
  const handleAddNew = useCallback(
    async (name: string) => {
      if (!name.trim()) {
        closeAutocomplete();
        return;
      }

      if (onAddContact) {
        setAddingContact(true);
        try {
          const newContact = await onAddContact(name.trim());
          if (newContact) {
            handleSelectContact(newContact);
          }
        } catch (error) {
          console.error("Failed to add contact:", error);
        } finally {
          setAddingContact(false);
        }
      } else {
        // Just close if no handler provided
        closeAutocomplete();
      }
    },
    [onAddContact, handleSelectContact, closeAutocomplete]
  );

  // Auto-detect mentions in content and sync with selectedTags
  useEffect(() => {
    // Find all @mentions in content
    const mentionRegex = /@([\w][\w\s]*[\w]|[\w]+)/g;
    const mentionsInContent = new Set<string>();
    let match;
    while ((match = mentionRegex.exec(internalValue)) !== null) {
      mentionsInContent.add(match[1].toLowerCase());
    }

    // Find contacts that match mentions in content
    const matchedContacts = contacts.filter((c) =>
      mentionsInContent.has(c.name.toLowerCase())
    );

    // If there are new matches not in selectedTags, add them
    const currentTagIds = new Set(selectedTags.map((t) => t.id));
    const newTags = matchedContacts.filter((c) => !currentTagIds.has(c.id));

    if (newTags.length > 0) {
      onTagsChange([...selectedTags, ...newTags]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalValue, contacts]); // Intentionally not including selectedTags/onTagsChange to avoid loops

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Container for textarea and overlay */}
      <div className="relative" style={{ minHeight }}>
        {/* Textarea - using defaultValue for uncontrolled behavior */}
        <textarea
          ref={textareaRef}
          defaultValue={value}
          onInput={handleInput}
          placeholder={placeholder}
          disabled={disabled || addingContact}
          className="w-full h-full p-3 text-sm leading-relaxed bg-white border border-claude-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent-coral focus:border-transparent text-gray-900"
          style={{
            minHeight,
          }}
        />

        {/* Autocomplete dropdown */}
        {showAutocomplete && !addingContact && (
          <MentionAutocomplete
            query={query}
            position={position}
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
