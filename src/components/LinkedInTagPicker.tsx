"use client";

import { useState, useEffect, useRef } from "react";

interface LinkedInContact {
  id: string;
  type: "PERSON" | "COMPANY";
  linkedinUrl: string;
  linkedinUrn: string | null;
  name: string;
  headline: string | null;
  profileImageUrl: string | null;
  usageCount: number;
}

interface LinkedInTagPickerProps {
  selectedTags: LinkedInContact[];
  onTagsChange: (tags: LinkedInContact[]) => void;
  disabled?: boolean;
}

const PersonIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const XIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const AtSymbolIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" />
  </svg>
);

export default function LinkedInTagPicker({
  selectedTags,
  onTagsChange,
  disabled = false,
}: LinkedInTagPickerProps) {
  const [contacts, setContacts] = useState<LinkedInContact[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newContactUrl, setNewContactUrl] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newContactHeadline, setNewContactHeadline] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
        setShowAddForm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchContacts = async (search?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const response = await fetch(`/api/linkedin/contacts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContactUrl || !newContactName) return;

    setIsAdding(true);
    setAddError(null);

    try {
      const response = await fetch("/api/linkedin/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedinUrl: newContactUrl,
          name: newContactName,
          headline: newContactHeadline || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Contact already exists, select it
          const existingContact = data.contact;
          if (existingContact && !selectedTags.find((t) => t.id === existingContact.id)) {
            onTagsChange([...selectedTags, existingContact]);
          }
          setShowAddForm(false);
          resetAddForm();
        } else {
          setAddError(data.error || "Failed to add contact");
        }
        return;
      }

      // Add the new contact to selected tags
      onTagsChange([...selectedTags, data.contact]);
      setContacts((prev) => [data.contact, ...prev]);
      setShowAddForm(false);
      resetAddForm();
    } catch (error) {
      console.error("Failed to add contact:", error);
      setAddError("Failed to add contact. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const resetAddForm = () => {
    setNewContactUrl("");
    setNewContactName("");
    setNewContactHeadline("");
    setAddError(null);
  };

  const handleSelectContact = (contact: LinkedInContact) => {
    if (selectedTags.find((t) => t.id === contact.id)) {
      // Already selected, remove it
      onTagsChange(selectedTags.filter((t) => t.id !== contact.id));
    } else {
      // Add to selected
      onTagsChange([...selectedTags, contact]);
    }
  };

  const handleRemoveTag = (contactId: string) => {
    onTagsChange(selectedTags.filter((t) => t.id !== contactId));
  };

  const filteredContacts = searchQuery
    ? contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.headline && c.headline.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : contacts;

  // Contacts not yet selected
  const availableContacts = filteredContacts.filter(
    (c) => !selectedTags.find((t) => t.id === c.id)
  );

  return (
    <div ref={pickerRef} className="relative">
      {/* Selected tags display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm"
          >
            {tag.type === "PERSON" ? (
              <PersonIcon />
            ) : (
              <BuildingIcon />
            )}
            <span className="text-blue-700">{tag.name}</span>
            {!disabled && (
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 text-blue-400 hover:text-blue-600"
              >
                <XIcon />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Tag button */}
      {!disabled && (
        <button
          onClick={() => {
            setShowPicker(!showPicker);
            setShowAddForm(false);
          }}
          className="flex items-center gap-2 px-3 py-2 text-sm text-claude-text-secondary border border-claude-border rounded-claude hover:bg-claude-bg-secondary transition-colors"
        >
          <AtSymbolIcon />
          Tag People or Companies
        </button>
      )}

      {/* Picker dropdown */}
      {showPicker && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-claude-border rounded-claude-lg shadow-lg z-50">
          {showAddForm ? (
            // Add new contact form
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-claude-text">Add Contact</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-claude-text-tertiary hover:text-claude-text"
                >
                  <XIcon />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-claude-text-secondary mb-1">
                    LinkedIn URL *
                  </label>
                  <input
                    type="text"
                    value={newContactUrl}
                    onChange={(e) => setNewContactUrl(e.target.value)}
                    placeholder="linkedin.com/in/username or /company/name"
                    className="w-full px-3 py-2 text-sm border border-claude-border rounded-claude focus:outline-none focus:ring-2 focus:ring-accent-coral"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-claude-text-secondary mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="John Doe or Company Name"
                    className="w-full px-3 py-2 text-sm border border-claude-border rounded-claude focus:outline-none focus:ring-2 focus:ring-accent-coral"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-claude-text-secondary mb-1">
                    Headline (optional)
                  </label>
                  <input
                    type="text"
                    value={newContactHeadline}
                    onChange={(e) => setNewContactHeadline(e.target.value)}
                    placeholder="CEO at Company or Company tagline"
                    className="w-full px-3 py-2 text-sm border border-claude-border rounded-claude focus:outline-none focus:ring-2 focus:ring-accent-coral"
                  />
                </div>

                {addError && (
                  <p className="text-xs text-error">{addError}</p>
                )}

                <button
                  onClick={handleAddContact}
                  disabled={isAdding || !newContactUrl || !newContactName}
                  className="btn-primary w-full text-sm"
                >
                  {isAdding ? "Adding..." : "Add & Tag"}
                </button>
              </div>
            </div>
          ) : (
            // Contact list
            <>
              <div className="p-3 border-b border-claude-border">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    fetchContacts(e.target.value);
                  }}
                  placeholder="Search contacts..."
                  className="w-full px-3 py-2 text-sm border border-claude-border rounded-claude focus:outline-none focus:ring-2 focus:ring-accent-coral"
                />
              </div>

              <div className="max-h-64 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin w-5 h-5 border-2 border-accent-coral border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : availableContacts.length === 0 ? (
                  <div className="p-4 text-center text-sm text-claude-text-tertiary">
                    {searchQuery ? "No contacts found" : "No contacts yet"}
                  </div>
                ) : (
                  availableContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => handleSelectContact(contact)}
                      className="w-full p-3 flex items-start gap-3 hover:bg-claude-bg-secondary transition-colors text-left"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          contact.type === "PERSON"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {contact.type === "PERSON" ? <PersonIcon /> : <BuildingIcon />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-claude-text text-sm truncate">
                          {contact.name}
                        </p>
                        {contact.headline && (
                          <p className="text-xs text-claude-text-tertiary truncate">
                            {contact.headline}
                          </p>
                        )}
                        <span
                          className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded ${
                            contact.type === "PERSON"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-purple-50 text-purple-600"
                          }`}
                        >
                          {contact.type === "PERSON" ? "Person" : "Company"}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="p-3 border-t border-claude-border">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-accent-coral border border-accent-coral/30 rounded-claude hover:bg-accent-coral/5 transition-colors"
                >
                  <PlusIcon />
                  Add New Contact
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
