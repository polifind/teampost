"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import type { LinkedInContact } from "@/types";

interface MentionAutocompleteProps {
  query: string;
  position: { top: number; left: number };
  contacts: LinkedInContact[];
  onSelect: (contact: LinkedInContact) => void;
  onAddNew: (name: string) => void;
  onClose: () => void;
}

const PersonIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    />
  </svg>
);

const CompanyIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export function MentionAutocomplete({
  query,
  position,
  contacts,
  onSelect,
  onAddNew,
  onClose,
}: MentionAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter contacts based on query
  const filteredContacts = useMemo(() => {
    if (!query) return contacts.slice(0, 5);
    const lowerQuery = query.toLowerCase();
    return contacts
      .filter((c) => c.name.toLowerCase().includes(lowerQuery))
      .slice(0, 5);
  }, [contacts, query]);

  // Total items including "Add new" option
  const totalItems = filteredContacts.length + 1;

  // Reset selected index when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredContacts.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % totalItems);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
          break;
        case "Enter":
        case "Tab":
          e.preventDefault();
          if (selectedIndex < filteredContacts.length) {
            onSelect(filteredContacts[selectedIndex]);
          } else {
            onAddNew(query);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, filteredContacts, query, onSelect, onAddNew, onClose, totalItems]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 w-64 bg-white border border-claude-border rounded-lg shadow-lg overflow-hidden"
      style={{
        top: position.top + 24, // Below the @ symbol
        left: Math.max(0, position.left - 8), // Slight offset to align with text
      }}
    >
      {/* Contact list */}
      {filteredContacts.length > 0 ? (
        <div className="max-h-48 overflow-y-auto">
          {filteredContacts.map((contact, index) => (
            <button
              key={contact.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect(contact);
              }}
              className={`w-full p-2 text-left flex items-center gap-2 transition-colors ${
                index === selectedIndex
                  ? "bg-accent-coral/10 text-accent-coral"
                  : "hover:bg-claude-bg-secondary"
              }`}
            >
              {/* Contact avatar or icon */}
              {contact.profileImageUrl ? (
                <img
                  src={contact.profileImageUrl}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-claude-bg-tertiary flex items-center justify-center text-claude-text-tertiary">
                  {contact.type === "COMPANY" ? <CompanyIcon /> : <PersonIcon />}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-claude-text truncate">
                  {contact.name}
                </p>
                {contact.headline && (
                  <p className="text-xs text-claude-text-tertiary truncate">
                    {contact.headline}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-3 text-sm text-claude-text-tertiary text-center">
          No contacts found for "{query}"
        </div>
      )}

      {/* Add new contact option */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAddNew(query);
        }}
        className={`w-full p-3 text-left border-t border-claude-border flex items-center gap-2 transition-colors cursor-pointer ${
          selectedIndex === filteredContacts.length
            ? "bg-accent-coral/10 text-accent-coral"
            : "hover:bg-claude-bg-secondary text-accent-coral"
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-accent-coral/10 flex items-center justify-center flex-shrink-0">
          <PlusIcon />
        </div>
        <span className="text-sm font-medium">
          Add New Contact
        </span>
      </button>
    </div>
  );
}
