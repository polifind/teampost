"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ContentInput from "@/components/ContentInput";
import Logo from "@/components/Logo";
import SubscriptionPaywall from "@/components/SubscriptionPaywall";
import LinkedInTagPicker from "@/components/LinkedInTagPicker";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface DraftPost {
  content: string;
  imageUrl?: string;
  isApproved: boolean;
}

interface SavedConversation {
  id: string;
  title: string;
  draftContent: string | null;
  updatedAt: string;
}

interface LibraryPhoto {
  id: string;
  imageUrl: string;
  filename: string | null;
  usageCount: number;
}

interface LibraryItem {
  id: string;
  type: "LINK" | "YOUTUBE" | "PDF" | "DOCX";
  title: string | null;
  sourceUrl: string | null;
  fileName: string | null;
  extractedSummary: string | null;
  processingStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
}

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

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const UndoIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const WandIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const BookOpenIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

const VideoIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

// Helper to get next Monday at 8:55 AM
const getNextMonday = (): Date => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 7 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(8, 55, 0, 0);
  return nextMonday;
};

// Animated loading indicator component
const ThinkingIndicator = () => {
  const [dots, setDots] = useState("");
  const [message, setMessage] = useState("TeamPost AI is thinking");

  const messages = [
    "TeamPost AI is thinking",
    "Crafting your story",
    "Finding the right words",
    "Polishing the message",
    "Almost there",
  ];

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    const messageInterval = setInterval(() => {
      setMessage((prev) => {
        const currentIndex = messages.indexOf(prev);
        return messages[(currentIndex + 1) % messages.length];
      });
    }, 3000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="flex justify-start">
      <div className="bg-claude-bg-secondary rounded-claude-lg p-4 max-w-[80%]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-accent-coral rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-accent-coral rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-accent-coral rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-claude-text-secondary text-sm">
            {message}{dots}
          </span>
        </div>
      </div>
    </div>
  );
};

// Progress indicator showing how close to draft
const DraftProgressIndicator = ({ userMessageCount }: { userMessageCount: number }) => {
  const stages = [
    { min: 0, label: "Share your story", hint: "Tell me what happened" },
    { min: 1, label: "Getting started", hint: "Add more details to make it engaging" },
    { min: 2, label: "Building context", hint: "What was the outcome or lesson?" },
    { min: 3, label: "Almost ready", hint: "One more detail and I can draft your post" },
    { min: 4, label: "Ready to draft!", hint: "I have enough to write your post" },
  ];

  const currentStageIndex = Math.min(userMessageCount, stages.length - 1);
  const progress = Math.min((userMessageCount / 4) * 100, 100);
  const currentStage = stages[currentStageIndex];

  if (userMessageCount >= 4) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-accent-coral/5 to-accent-coral/10 border border-accent-coral/20 rounded-claude-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-claude-text">{currentStage.label}</span>
        <span className="text-xs text-accent-coral font-medium">{Math.round(progress)}%</span>
      </div>

      <div className="h-2 bg-claude-bg-tertiary rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-accent-coral to-accent-coral/80 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-claude-text-secondary">
        {currentStage.hint}
      </p>

      <div className="flex items-center gap-2 mt-3">
        {[0, 1, 2, 3].map((stage) => (
          <div
            key={stage}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              stage < userMessageCount
                ? "bg-accent-coral"
                : stage === userMessageCount
                ? "bg-accent-coral/50 animate-pulse"
                : "bg-claude-bg-tertiary"
            }`}
          />
        ))}
        <SparklesIcon />
      </div>
    </div>
  );
};

export default function CreatePostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [draftPost, setDraftPost] = useState<DraftPost | null>(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [showScheduleSuccess, setShowScheduleSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<string>("");
  const [selectedScheduleTime, setSelectedScheduleTime] = useState<string>("08:55");

  // Conversation persistence state
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [showConversationsSidebar, setShowConversationsSidebar] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Subscription paywall state
  const [showPaywall, setShowPaywall] = useState(false);
  const [scheduledPostCount, setScheduledPostCount] = useState(0);

  // Photo library state
  const [libraryPhotos, setLibraryPhotos] = useState<LibraryPhoto[]>([]);
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false);
  const [photoDragActive, setPhotoDragActive] = useState(false);

  // Magic Draft state
  const [magicDraftAvailable, setMagicDraftAvailable] = useState(false);
  const [magicDraftCount, setMagicDraftCount] = useState(0);
  const [showMagicDraftModal, setShowMagicDraftModal] = useState(false);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [selectedLibraryItems, setSelectedLibraryItems] = useState<string[]>([]);
  const [generatingMagicDraft, setGeneratingMagicDraft] = useState(false);

  // Undo/revert state
  const [previousDraftContent, setPreviousDraftContent] = useState<string | null>(null);

  // LinkedIn tagging state
  const [selectedTags, setSelectedTags] = useState<LinkedInContact[]>([]);

  // Timezone state
  const [userTimezone, setUserTimezone] = useState<string>("America/New_York");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/create");
    }
  }, [status, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch saved conversations on mount
  useEffect(() => {
    if (session?.user) {
      fetchSavedConversations();
      fetchLibraryPhotos();
      checkMagicDraftAvailability();
      fetchUserTimezone();
    }
  }, [session]);

  const fetchUserTimezone = async () => {
    try {
      const response = await fetch("/api/user/settings");
      if (response.ok) {
        const data = await response.json();
        if (data.timezone) {
          setUserTimezone(data.timezone);
        } else {
          // Auto-detect from browser if not set
          const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          setUserTimezone(browserTimezone);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user timezone:", error);
      // Fallback to browser timezone
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimezone(browserTimezone);
    }
  };

  const handleTimezoneChange = async (newTimezone: string) => {
    setUserTimezone(newTimezone);
    try {
      await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone: newTimezone }),
      });
    } catch (error) {
      console.error("Failed to save timezone:", error);
    }
  };

  const checkMagicDraftAvailability = async () => {
    try {
      const response = await fetch("/api/posts/magic-draft");
      if (response.ok) {
        const data = await response.json();
        setMagicDraftAvailable(data.available);
        setMagicDraftCount(data.count || 0);
      }
    } catch (error) {
      console.error("Failed to check magic draft availability:", error);
    }
  };

  const fetchLibraryItems = async () => {
    try {
      const response = await fetch("/api/personalization/library");
      if (response.ok) {
        const data = await response.json();
        setLibraryItems(data.items.filter((i: LibraryItem) => i.processingStatus === "COMPLETED"));
      }
    } catch (error) {
      console.error("Failed to fetch library items:", error);
    }
  };

  const handleOpenMagicDraft = async () => {
    await fetchLibraryItems();
    setSelectedLibraryItems([]);
    setShowMagicDraftModal(true);
  };

  const handleGenerateMagicDraft = async () => {
    setGeneratingMagicDraft(true);
    try {
      const response = await fetch("/api/posts/magic-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemIds: selectedLibraryItems.length > 0 ? selectedLibraryItems : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDraftPost({
          content: data.draft,
          isApproved: false,
        });
        setShowMagicDraftModal(false);

        // Add a message about the magic draft
        const sourceNames = data.sourcedFrom.map((s: { title: string }) => s.title).join(", ");
        const message: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: `I've created a draft based on your library content${sourceNames ? ` (sourced from: ${sourceNames})` : ""}. Take a look and let me know if you'd like any changes!`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, message]);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to generate magic draft");
      }
    } catch (error) {
      console.error("Magic draft error:", error);
      alert("Failed to generate magic draft. Please try again.");
    } finally {
      setGeneratingMagicDraft(false);
    }
  };

  const toggleLibraryItemSelection = (id: string) => {
    setSelectedLibraryItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getLibraryItemIcon = (type: string) => {
    switch (type) {
      case "YOUTUBE":
        return <VideoIcon />;
      case "PDF":
      case "DOCX":
        return <DocumentIcon />;
      default:
        return <LinkIcon />;
    }
  };

  const fetchLibraryPhotos = async () => {
    try {
      const response = await fetch("/api/photos");
      if (response.ok) {
        const data = await response.json();
        setLibraryPhotos(data.photos || []);
      }
    } catch (error) {
      console.error("Failed to fetch photos:", error);
    }
  };

  const handleSelectLibraryPhoto = (photo: LibraryPhoto) => {
    if (draftPost) {
      setDraftPost({
        ...draftPost,
        imageUrl: photo.imageUrl,
      });
    }
    setShowPhotoLibrary(false);
  };

  // Initialize schedule date/time when draft is created
  useEffect(() => {
    if (draftPost && !selectedScheduleDate) {
      const nextMonday = getNextMonday();
      setSelectedScheduleDate(nextMonday.toISOString().split("T")[0]);
      setSelectedScheduleTime("08:55");
    }
  }, [draftPost, selectedScheduleDate]);

  const fetchSavedConversations = async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setSavedConversations(data.conversations);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

  // Auto-save conversation when messages change
  const saveConversation = useCallback(async (
    msgs: Message[],
    draft: DraftPost | null,
    convId: string | null
  ) => {
    // Only save if there are user messages
    const userMessages = msgs.filter(m => m.role === "user");
    if (userMessages.length === 0) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: convId,
          messages: msgs.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          })),
          draftContent: draft?.content,
          draftImageUrl: draft?.imageUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConversationId(data.conversation.id);
        fetchSavedConversations();
      }
    } catch (error) {
      console.error("Failed to save conversation:", error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Debounced auto-save
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Only auto-save if there are user messages and not approved
    const userMessages = messages.filter(m => m.role === "user");
    if (userMessages.length > 0 && !draftPost?.isApproved) {
      saveTimeoutRef.current = setTimeout(() => {
        saveConversation(messages, draftPost, conversationId);
      }, 2000); // Save after 2 seconds of inactivity
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [messages, draftPost, conversationId, saveConversation]);

  // Load a saved conversation
  const loadConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (response.ok) {
        const data = await response.json();
        const conv = data.conversation;

        // Restore messages
        const restoredMessages: Message[] = conv.messages.map((m: { role: string; content: string; timestamp: string }, i: number) => ({
          id: `restored-${i}`,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.timestamp),
        }));

        setMessages(restoredMessages);
        setConversationId(conv.id);

        // Restore draft if exists
        if (conv.draftContent) {
          setDraftPost({
            content: conv.draftContent,
            imageUrl: conv.draftImageUrl || undefined,
            isApproved: false,
          });
        } else {
          setDraftPost(null);
        }

        setShowScheduleSuccess(false);
        setScheduledTime(null);
        setPreviousDraftContent(null);
        setSelectedTags([]);
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  // Delete a conversation
  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSavedConversations(prev => prev.filter(c => c.id !== id));
        if (conversationId === id) {
          handleStartNew();
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0 && status === "authenticated" && !conversationId) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hey${session?.user?.name ? ` ${session.user.name.split(" ")[0]}` : ""}! I'm your LinkedIn ghostwriter.

What's on your mind? Share a story, an idea, or something that happened recently that you want to turn into a post.

You can type or record a voice note - whatever feels more natural.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [status, session, messages.length, conversationId]);

  const handleSubmit = async (content: string, isVoice: boolean) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/conversation/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationHistory,
          hasDraft: !!draftPost,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (data.draft) {
        setDraftPost({
          content: data.draft,
          isApproved: false,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateDraft = async () => {
    if (!draftPost) return;

    // Save current content before regenerating for undo functionality
    setPreviousDraftContent(draftPost.content);

    setIsLoading(true);
    try {
      const response = await fetch("/api/conversation/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentDraft: draftPost.content,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDraftPost({
          content: data.draft,
          imageUrl: draftPost.imageUrl,
          isApproved: false,
        });

        const message: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Here's a fresh take on your post. What do you think?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, message]);
      } else {
        // Clear previous version if regeneration failed
        setPreviousDraftContent(null);
      }
    } catch (error) {
      console.error("Error regenerating:", error);
      // Clear previous version if regeneration failed
      setPreviousDraftContent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevertToPrevious = () => {
    if (!previousDraftContent || !draftPost) return;

    setDraftPost({
      ...draftPost,
      content: previousDraftContent,
    });

    // Clear the previous version after reverting
    setPreviousDraftContent(null);

    const message: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "I've restored the previous version of your draft.",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleSaveEdit = () => {
    if (draftPost && editedContent.trim()) {
      setDraftPost({
        ...draftPost,
        content: editedContent.trim(),
      });
    }
    setIsEditingDraft(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPEG, PNG, GIF, or WebP)");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("Image is too large. Maximum size is 10MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size === 0) {
      alert("The selected file appears to be empty. Please try another image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload image");
      }

      if (!result.imageUrl) {
        throw new Error("No image URL returned from upload");
      }

      if (draftPost) {
        setDraftPost({
          ...draftPost,
          imageUrl: result.imageUrl,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      const message = error instanceof Error ? error.message : "Failed to upload image";
      alert(`Upload failed: ${message}`);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    if (draftPost) {
      setDraftPost({
        ...draftPost,
        imageUrl: undefined,
      });
    }
  };

  const uploadPhotoFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("Image is too large. Maximum size is 10MB.");
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload image");
      }

      if (!result.imageUrl) {
        throw new Error("No image URL returned from upload");
      }

      if (draftPost) {
        setDraftPost({
          ...draftPost,
          imageUrl: result.imageUrl,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      const message = error instanceof Error ? error.message : "Failed to upload image";
      alert(`Upload failed: ${message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePhotoDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setPhotoDragActive(true);
    } else if (e.type === "dragleave") {
      setPhotoDragActive(false);
    }
  };

  const handlePhotoDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadPhotoFile(e.dataTransfer.files[0]);
    }
  };

  const handleSchedulePost = async () => {
    if (!draftPost || !selectedScheduleDate || !selectedScheduleTime) return;

    setIsScheduling(true);
    try {
      const saveResponse = await fetch("/api/posts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: draftPost.content,
          imageUrl: draftPost.imageUrl,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          taggedContacts: selectedTags.map((t) => t.id),
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save post");
      }

      const { postId } = await saveResponse.json();

      // Use the user-selected date/time
      const scheduledFor = new Date(`${selectedScheduleDate}T${selectedScheduleTime}:00`);

      const scheduleResponse = await fetch("/api/schedule/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          scheduledFor: scheduledFor.toISOString(),
          imageUrl: draftPost.imageUrl,
        }),
      });

      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json();
        setScheduledTime(scheduleData.scheduledFor || scheduledFor.toISOString());
        setShowScheduleSuccess(true);
        setDraftPost({ ...draftPost, isApproved: true });

        // Mark conversation as completed
        if (conversationId) {
          await fetch(`/api/conversations/${conversationId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "COMPLETED" }),
          });
          fetchSavedConversations();
        }

        const message: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Your post is scheduled! Want to create another one?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, message]);
      } else if (scheduleResponse.status === 402) {
        // Subscription required
        const errorData = await scheduleResponse.json();
        setScheduledPostCount(errorData.scheduledPostCount || 10);
        setShowPaywall(true);
      } else {
        throw new Error("Failed to schedule post");
      }
    } catch (error) {
      console.error("Error scheduling:", error);
      alert("Failed to schedule post. Please try again.");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleStartNew = () => {
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content: "Let's create another post! What do you want to talk about?",
        timestamp: new Date(),
      },
    ]);
    setDraftPost(null);
    setShowScheduleSuccess(false);
    setScheduledTime(null);
    setConversationId(null);
    setPreviousDraftContent(null);
    setSelectedTags([]);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-claude-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-coral border-t-transparent rounded-full" />
      </div>
    );
  }

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-claude-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-claude-bg/80 backdrop-blur-md border-b border-claude-border z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo size="md" />
          </Link>

          <div className="flex items-center gap-3">
            {isSaving && (
              <span className="text-xs text-claude-text-tertiary flex items-center gap-1">
                <div className="w-2 h-2 bg-accent-coral rounded-full animate-pulse" />
                Saving...
              </span>
            )}
            <Link href="/posts" className="btn-ghost text-sm">
              My Posts
            </Link>
            <Link href="/schedule" className="btn-ghost text-sm">
              Schedule
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Conversations sidebar */}
        <div
          className={`${
            showConversationsSidebar ? "w-64" : "w-0"
          } border-r border-claude-border bg-claude-bg-secondary transition-all duration-300 overflow-hidden flex-shrink-0`}
        >
          <div className="w-64 h-full flex flex-col">
            <div className="p-4 border-b border-claude-border space-y-2">
              <button
                onClick={handleStartNew}
                className="btn-primary w-full text-sm"
              >
                <PlusIcon />
                New Post
              </button>

              {magicDraftAvailable && (
                <button
                  onClick={handleOpenMagicDraft}
                  className="w-full text-sm px-4 py-2.5 rounded-claude font-medium transition-colors flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500/10 to-accent-coral/10 text-purple-600 border border-purple-500/20 hover:from-purple-500/20 hover:to-accent-coral/20"
                >
                  <WandIcon />
                  Magic Draft
                  <span className="text-xs bg-purple-500/20 px-1.5 py-0.5 rounded-full">
                    {magicDraftCount}
                  </span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {savedConversations.length > 0 ? (
                <div className="p-2">
                  <p className="text-xs text-claude-text-tertiary px-2 py-1 font-medium uppercase tracking-wide">
                    In Progress
                  </p>
                  {savedConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => loadConversation(conv.id)}
                      className={`group p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                        conversationId === conv.id
                          ? "bg-accent-coral/10 border border-accent-coral/20"
                          : "hover:bg-claude-bg-tertiary"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-claude-text truncate font-medium">
                            {conv.title}
                          </p>
                          <p className="text-xs text-claude-text-tertiary mt-0.5">
                            {formatTimeAgo(conv.updatedAt)}
                          </p>
                          {conv.draftContent && (
                            <div className="flex items-center gap-1 mt-1">
                              <SparklesIcon />
                              <span className="text-xs text-accent-coral">Draft ready</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => deleteConversation(conv.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-claude-text-tertiary hover:text-error transition-all"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <ChatBubbleIcon />
                  <p className="text-sm text-claude-text-tertiary mt-2">
                    No conversations yet
                  </p>
                  <p className="text-xs text-claude-text-tertiary mt-1">
                    Start chatting to create a post
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toggle sidebar button */}
        <button
          onClick={() => setShowConversationsSidebar(!showConversationsSidebar)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-claude-bg-secondary border border-claude-border rounded-r-lg p-1 hover:bg-claude-bg-tertiary transition-colors"
          style={{ left: showConversationsSidebar ? "256px" : "0" }}
        >
          {showConversationsSidebar ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </button>

        {/* Main content */}
        <div className="flex-1 flex max-w-4xl mx-auto w-full">
          {/* Main conversation area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Progress indicator - show when no draft yet */}
              {!draftPost && (
                <DraftProgressIndicator
                  userMessageCount={messages.filter((m) => m.role === "user").length}
                />
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-claude-lg p-4 ${
                      message.role === "user"
                        ? "bg-accent-coral text-white"
                        : "bg-claude-bg-secondary text-claude-text"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && <ThinkingIndicator />}

              {/* Draft ready indicator - shows inline when draft exists */}
              {draftPost && !draftPost.isApproved && (
                <div className="bg-gradient-to-r from-accent-coral/10 to-accent-coral/5 border border-accent-coral/30 rounded-claude-lg p-4 my-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-coral/20 flex items-center justify-center flex-shrink-0">
                      <SparklesIcon />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-claude-text">Your draft is ready!</p>
                      <p className="text-sm text-claude-text-secondary">
                        Check the preview panel on the right to review, edit, or schedule your post.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        // Scroll to top of draft panel on mobile or highlight it
                        const draftPanel = document.querySelector('[data-draft-panel]');
                        if (draftPanel) {
                          draftPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className="btn-primary text-sm px-4 py-2 flex-shrink-0"
                    >
                      View Draft
                    </button>
                  </div>

                  {/* Inline draft preview for quick view */}
                  <div className="mt-4 p-3 bg-white rounded-claude border border-claude-border">
                    <p className="text-xs text-claude-text-tertiary mb-2 font-medium">PREVIEW</p>
                    <p className="text-sm text-claude-text line-clamp-4 whitespace-pre-wrap">
                      {draftPost.content}
                    </p>
                    {draftPost.content.length > 200 && (
                      <p className="text-xs text-accent-coral mt-2">...see full draft in panel</p>
                    )}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-6 border-t border-claude-border">
              <ContentInput
                onSubmit={handleSubmit}
                disabled={isLoading}
                placeholder={
                  draftPost
                    ? "Tell me what to change, or say 'looks good' to approve..."
                    : "Share your idea, story, or thought..."
                }
                autoFocus
              />
            </div>
          </div>

          {/* Draft preview sidebar */}
          {draftPost && (
            <div data-draft-panel className="w-96 border-l border-claude-border p-6 overflow-y-auto">
              <div className="sticky top-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-claude-text flex items-center gap-2">
                    <SparklesIcon />
                    Your Draft
                  </h2>
                  {draftPost.isApproved && (
                    <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
                      Scheduled
                    </span>
                  )}
                </div>

                {/* LinkedIn-style preview */}
                <div className="bg-white rounded-claude border border-claude-border p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-claude-bg-tertiary flex items-center justify-center">
                      <span className="text-sm font-medium text-claude-text">
                        {session?.user?.name?.[0] || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-claude-text text-sm">
                        {session?.user?.name || "Your Name"}
                      </p>
                      <p className="text-xs text-claude-text-tertiary">
                        Draft for LinkedIn
                      </p>
                    </div>
                  </div>

                  {isEditingDraft ? (
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full h-64 p-2 border border-claude-border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-coral"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-sm text-claude-text">
                      {draftPost.content}
                    </div>
                  )}

                  {/* LinkedIn tagging section */}
                  {!isEditingDraft && !draftPost.isApproved && (
                    <div className="mt-4 pt-4 border-t border-claude-border">
                      <LinkedInTagPicker
                        selectedTags={selectedTags}
                        onTagsChange={setSelectedTags}
                        disabled={draftPost.isApproved}
                      />
                    </div>
                  )}

                  {/* Image preview/upload section */}
                  {!isEditingDraft && (
                    <div className="mt-4">
                      {draftPost.imageUrl ? (
                        <div className="relative">
                          <img
                            src={draftPost.imageUrl}
                            alt="Post image"
                            className="w-full rounded-lg border border-claude-border"
                          />
                          {!draftPost.isApproved && (
                            <button
                              onClick={handleRemoveImage}
                              className="absolute top-2 right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/80"
                            >
                              <XIcon />
                            </button>
                          )}
                        </div>
                      ) : !draftPost.isApproved && (
                        <div
                          onDragEnter={handlePhotoDrag}
                          onDragLeave={handlePhotoDrag}
                          onDragOver={handlePhotoDrag}
                          onDrop={handlePhotoDrop}
                          className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                            photoDragActive
                              ? "border-accent-coral bg-accent-coral/10"
                              : "border-accent-coral/30 bg-accent-coral/5"
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />

                          {photoDragActive ? (
                            <div className="flex items-center justify-center py-4">
                              <p className="text-accent-coral font-medium">Drop your photo here</p>
                            </div>
                          ) : showPhotoLibrary ? (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-claude-text">Your Photo Library</p>
                                <button
                                  onClick={() => setShowPhotoLibrary(false)}
                                  className="text-xs text-claude-text-tertiary hover:text-claude-text"
                                >
                                  Cancel
                                </button>
                              </div>

                              {libraryPhotos.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                  {libraryPhotos.map((photo) => (
                                    <button
                                      key={photo.id}
                                      onClick={() => handleSelectLibraryPhoto(photo)}
                                      className="aspect-square rounded overflow-hidden border-2 border-transparent hover:border-accent-coral transition-colors"
                                    >
                                      <img
                                        src={photo.imageUrl}
                                        alt={photo.filename || "Photo"}
                                        className="w-full h-full object-cover"
                                      />
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-claude-text-tertiary text-center py-4">
                                  No photos in your library yet. Upload some from your dashboard.
                                </p>
                              )}

                              <div className="mt-3 pt-3 border-t border-claude-border">
                                <button
                                  onClick={() => fileInputRef.current?.click()}
                                  className="text-xs text-accent-coral hover:underline"
                                >
                                  Or upload a new photo
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              {uploadingImage ? (
                                <div className="flex items-center justify-center gap-2 text-claude-text-secondary py-2">
                                  <div className="animate-spin w-4 h-4 border-2 border-accent-coral border-t-transparent rounded-full" />
                                  Uploading...
                                </div>
                              ) : (
                                <>
                                  <p className="text-xs text-claude-text-secondary mb-2">
                                    Posts with photos perform <span className="font-semibold text-accent-coral">2x better</span>
                                  </p>
                                  <div className="flex gap-2 justify-center">
                                    {libraryPhotos.length > 0 && (
                                      <button
                                        onClick={() => setShowPhotoLibrary(true)}
                                        className="px-3 py-1.5 text-xs font-medium text-accent-coral bg-white border border-accent-coral/30 rounded-claude hover:bg-accent-coral/5 transition-colors"
                                      >
                                        From Library ({libraryPhotos.length})
                                      </button>
                                    )}
                                    <button
                                      onClick={() => fileInputRef.current?.click()}
                                      className="px-3 py-1.5 text-xs font-medium text-white bg-accent-coral rounded-claude hover:bg-accent-coral/90 transition-colors flex items-center gap-1"
                                    >
                                      <ImageIcon />
                                      Upload Photo
                                    </button>
                                  </div>
                                  <p className="text-xs text-claude-text-tertiary mt-2">
                                    Raw, authentic photos work best. You can also drag & drop.
                                  </p>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!draftPost.isApproved && (
                  <div className="space-y-3">
                    {isEditingDraft ? (
                      <div className="flex gap-2">
                        <button onClick={handleSaveEdit} className="btn-primary flex-1 text-sm">
                          Save Changes
                        </button>
                        <button
                          onClick={() => setIsEditingDraft(false)}
                          className="btn-ghost text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Schedule date/time picker */}
                        <div className="p-3 bg-claude-bg-secondary rounded-claude border border-claude-border">
                          <p className="text-xs font-medium text-claude-text mb-2 flex items-center gap-1">
                            <CalendarIcon />
                            Schedule for
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={selectedScheduleDate}
                              onChange={(e) => setSelectedScheduleDate(e.target.value)}
                              min={new Date().toISOString().split("T")[0]}
                              className="flex-1 px-3 py-2 text-sm border border-claude-border rounded-claude bg-white focus:outline-none focus:ring-2 focus:ring-accent-coral"
                            />
                            <input
                              type="time"
                              value={selectedScheduleTime}
                              onChange={(e) => setSelectedScheduleTime(e.target.value)}
                              className="min-w-[120px] px-3 py-2 text-sm border border-claude-border rounded-claude bg-white focus:outline-none focus:ring-2 focus:ring-accent-coral"
                            />
                          </div>
                          <select
                            value={userTimezone}
                            onChange={(e) => handleTimezoneChange(e.target.value)}
                            className="w-full mt-2 px-3 py-2 text-sm border border-claude-border rounded-claude bg-white focus:outline-none focus:ring-2 focus:ring-accent-coral"
                          >
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="America/Chicago">Central Time (CT)</option>
                            <option value="America/Denver">Mountain Time (MT)</option>
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            <option value="America/Anchorage">Alaska Time (AKT)</option>
                            <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                            <option value="Europe/London">London (GMT)</option>
                            <option value="Europe/Paris">Paris (CET)</option>
                            <option value="Asia/Tokyo">Tokyo (JST)</option>
                            <option value="Asia/Shanghai">Shanghai (CST)</option>
                            <option value="Australia/Sydney">Sydney (AEST)</option>
                          </select>
                        </div>

                        <button
                          onClick={handleSchedulePost}
                          disabled={isScheduling || !selectedScheduleDate || !selectedScheduleTime}
                          className="btn-primary w-full"
                        >
                          {isScheduling ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                              Scheduling...
                            </>
                          ) : (
                            <>
                              <CalendarIcon />
                              Approve & Schedule
                            </>
                          )}
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setIsEditingDraft(true);
                              setEditedContent(draftPost.content);
                            }}
                            className="btn-ghost flex-1 text-sm"
                          >
                            <EditIcon />
                            Edit
                          </button>
                          <button
                            onClick={handleRegenerateDraft}
                            disabled={isLoading}
                            className="btn-ghost flex-1 text-sm"
                          >
                            <RefreshIcon />
                            New Version
                          </button>
                        </div>

                        {/* Undo button - shows after regeneration */}
                        {previousDraftContent && (
                          <button
                            onClick={handleRevertToPrevious}
                            className="w-full text-sm px-4 py-2.5 rounded-claude font-medium transition-colors flex items-center justify-center gap-2 bg-accent-coral/10 text-accent-coral border border-accent-coral/20 hover:bg-accent-coral/20"
                          >
                            <UndoIcon />
                            Undo - Restore Previous Version
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Success state */}
                {showScheduleSuccess && (
                  <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-claude">
                    <div className="flex items-center gap-2 text-success mb-2">
                      <CheckIcon />
                      <span className="font-medium">Post Scheduled!</span>
                    </div>
                    <p className="text-sm text-claude-text-secondary mb-3">
                      {scheduledTime ? (
                        <>
                          Your post will go live on{" "}
                          {new Date(scheduledTime).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                          .
                        </>
                      ) : (
                        "Your post will go live on the next available Monday at 8:55 AM EST."
                      )}
                    </p>
                    <button onClick={handleStartNew} className="btn-primary w-full text-sm">
                      <PlusIcon />
                      Create Another Post
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Subscription Paywall */}
      {showPaywall && (
        <SubscriptionPaywall
          scheduledPostCount={scheduledPostCount}
          onClose={() => setShowPaywall(false)}
        />
      )}

      {/* Magic Draft Modal */}
      {showMagicDraftModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-claude-lg max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-claude-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500/20 to-accent-coral/20 flex items-center justify-center">
                    <WandIcon />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-claude-text">Magic Draft</h2>
                    <p className="text-sm text-claude-text-secondary">
                      Generate a post from your library
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMagicDraftModal(false)}
                  className="p-2 text-claude-text-tertiary hover:text-claude-text rounded-claude hover:bg-claude-bg-secondary"
                >
                  <XIcon />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {libraryItems.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpenIcon />
                  <p className="text-claude-text-secondary mt-2">No library items available</p>
                  <p className="text-sm text-claude-text-tertiary mt-1">
                    Add content to your library from the dashboard to use Magic Draft
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-claude-text-secondary mb-4">
                    Select specific items to draw from, or leave unselected for a random mix:
                  </p>
                  <div className="space-y-2">
                    {libraryItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleLibraryItemSelection(item.id)}
                        className={`w-full p-3 rounded-claude border text-left transition-all ${
                          selectedLibraryItems.includes(item.id)
                            ? "border-purple-500 bg-purple-500/5"
                            : "border-claude-border hover:border-claude-border-hover"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              selectedLibraryItems.includes(item.id)
                                ? "bg-purple-500 text-white"
                                : "bg-claude-bg-tertiary text-claude-text-secondary"
                            }`}
                          >
                            {getLibraryItemIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-claude-text text-sm truncate">
                              {item.title || item.fileName || item.sourceUrl || "Untitled"}
                            </p>
                            {item.extractedSummary && (
                              <p className="text-xs text-claude-text-tertiary mt-1 line-clamp-2">
                                {item.extractedSummary}
                              </p>
                            )}
                            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-claude-bg-secondary text-claude-text-tertiary">
                              {item.type}
                            </span>
                          </div>
                          {selectedLibraryItems.includes(item.id) && (
                            <CheckIcon />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-claude-border bg-claude-bg-secondary">
              <button
                onClick={handleGenerateMagicDraft}
                disabled={generatingMagicDraft || libraryItems.length === 0}
                className="btn-primary w-full"
              >
                {generatingMagicDraft ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    <WandIcon />
                    {selectedLibraryItems.length > 0
                      ? `Generate from ${selectedLibraryItems.length} item${selectedLibraryItems.length > 1 ? "s" : ""}`
                      : "Generate Random Draft"}
                  </>
                )}
              </button>
              {selectedLibraryItems.length === 0 && libraryItems.length > 0 && (
                <p className="text-xs text-claude-text-tertiary text-center mt-2">
                  Will randomly select from your {libraryItems.length} library items
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
