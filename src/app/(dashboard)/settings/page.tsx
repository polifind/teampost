"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

interface OrganizationMembership {
  id: string;
  name: string;
  role: "ADMIN" | "MEMBER";
}

interface UserSettings {
  name: string;
  email: string;
  linkedInConnected: boolean;
  linkedInUserId?: string;
  organizations: OrganizationMembership[];
}

interface Guideline {
  id: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

interface LibraryItem {
  id: string;
  type: "LINK" | "YOUTUBE" | "PDF" | "DOCX";
  sourceUrl: string | null;
  fileName: string | null;
  title: string | null;
  extractedSummary: string | null;
  processingStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  processingError: string | null;
  usageCount: number;
  createdAt: string;
}

interface LinkedInScreenshot {
  id: string;
  sectionType: string;
  createdAt: string;
}

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

const PencilIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const BookOpenIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

const VideoIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const UserCircleIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PhotoIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

function SettingsForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  // Guidelines state
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [guidelinesLoading, setGuidelinesLoading] = useState(true);
  const [newGuideline, setNewGuideline] = useState("");
  const [addingGuideline, setAddingGuideline] = useState(false);
  const [editingGuidelineId, setEditingGuidelineId] = useState<string | null>(null);
  const [editingGuidelineContent, setEditingGuidelineContent] = useState("");

  // Library state
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [urlInput, setUrlInput] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [libraryDragActive, setLibraryDragActive] = useState(false);

  // LinkedIn screenshot state
  const [linkedInScreenshots, setLinkedInScreenshots] = useState<LinkedInScreenshot[]>([]);
  const [linkedInUploading, setLinkedInUploading] = useState(false);
  const [linkedInDragActive, setLinkedInDragActive] = useState(false);

  // Check for LinkedIn connection status from URL params
  useEffect(() => {
    const linkedinStatus = searchParams.get("linkedin");
    if (linkedinStatus === "connected") {
      setMessage("LinkedIn connected successfully!");
      // Clear the URL param
      router.replace("/settings");
    } else if (linkedinStatus === "error") {
      setMessage("Failed to connect LinkedIn. Please try again.");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/settings");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/user/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
          setName(data.name || "");
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchSettings();
    }
  }, [session]);

  // Fetch guidelines
  useEffect(() => {
    const fetchGuidelines = async () => {
      try {
        const response = await fetch("/api/personalization/guidelines");
        if (response.ok) {
          const result = await response.json();
          setGuidelines(result.guidelines || []);
        }
      } catch (error) {
        console.error("Failed to fetch guidelines:", error);
      } finally {
        setGuidelinesLoading(false);
      }
    };

    if (session?.user) {
      fetchGuidelines();
    }
  }, [session]);

  // Fetch library items
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const response = await fetch("/api/personalization/library");
        if (response.ok) {
          const result = await response.json();
          setLibraryItems(result.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch library:", error);
      } finally {
        setLibraryLoading(false);
      }
    };

    if (session?.user) {
      fetchLibrary();
    }
  }, [session]);

  // Fetch LinkedIn screenshots
  useEffect(() => {
    const fetchLinkedInProfile = async () => {
      try {
        const response = await fetch("/api/profile/upload-linkedin");
        if (response.ok) {
          const result = await response.json();
          setLinkedInScreenshots(result.screenshots || []);
        }
      } catch (error) {
        console.error("Failed to fetch LinkedIn profile:", error);
      }
    };

    if (session?.user) {
      fetchLinkedInProfile();
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        setMessage("Settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleConnectLinkedIn = () => {
    // Redirect to LinkedIn OAuth
    window.location.href = "/api/linkedin/auth";
  };

  const handleDisconnectLinkedIn = async () => {
    if (!confirm("Are you sure you want to disconnect LinkedIn?")) return;

    try {
      const response = await fetch("/api/linkedin/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        setSettings((prev) => prev ? { ...prev, linkedInConnected: false } : null);
        setMessage("LinkedIn disconnected.");
      }
    } catch (error) {
      console.error("Failed to disconnect LinkedIn:", error);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  // Guidelines handlers
  const handleAddGuideline = async () => {
    if (!newGuideline.trim()) return;
    setAddingGuideline(true);
    try {
      const response = await fetch("/api/personalization/guidelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newGuideline.trim() }),
      });
      if (response.ok) {
        const result = await response.json();
        setGuidelines((prev) => [result.guideline, ...prev]);
        setNewGuideline("");
      }
    } catch (error) {
      console.error("Failed to add guideline:", error);
    } finally {
      setAddingGuideline(false);
    }
  };

  const handleUpdateGuideline = async (id: string) => {
    if (!editingGuidelineContent.trim()) return;
    try {
      const response = await fetch("/api/personalization/guidelines", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, content: editingGuidelineContent.trim() }),
      });
      if (response.ok) {
        const result = await response.json();
        setGuidelines((prev) =>
          prev.map((g) => (g.id === id ? result.guideline : g))
        );
        setEditingGuidelineId(null);
        setEditingGuidelineContent("");
      }
    } catch (error) {
      console.error("Failed to update guideline:", error);
    }
  };

  const handleDeleteGuideline = async (id: string) => {
    try {
      const response = await fetch("/api/personalization/guidelines", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        setGuidelines((prev) => prev.filter((g) => g.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete guideline:", error);
    }
  };

  // Library handlers
  const handleAddUrl = async () => {
    if (!urlInput.trim()) return;
    setAddingUrl(true);
    try {
      const response = await fetch("/api/personalization/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      if (response.ok) {
        const result = await response.json();
        setLibraryItems((prev) => [result.item, ...prev]);
        setUrlInput("");
      }
    } catch (error) {
      console.error("Failed to add URL:", error);
    } finally {
      setAddingUrl(false);
    }
  };

  const handleLibraryFileUpload = async (files: FileList) => {
    setUploadingFile(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch("/api/personalization/library", {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          const result = await response.json();
          setLibraryItems((prev) => [result.item, ...prev]);
        }
      } catch (error) {
        console.error("Failed to upload file:", error);
      }
    }
    setUploadingFile(false);
  };

  const handleDeleteLibraryItem = async (id: string) => {
    try {
      const response = await fetch("/api/personalization/library", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        setLibraryItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete library item:", error);
    }
  };

  const handleLibraryDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setLibraryDragActive(true);
    } else if (e.type === "dragleave") {
      setLibraryDragActive(false);
    }
  };

  const handleLibraryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLibraryDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleLibraryFileUpload(e.dataTransfer.files);
    }
  };

  const getLibraryTypeIcon = (type: string) => {
    switch (type) {
      case "YOUTUBE": return <VideoIcon />;
      case "PDF": case "DOCX": return <FileIcon />;
      default: return <LinkIcon />;
    }
  };

  // LinkedIn screenshot handlers
  const handleLinkedInScreenshotUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage("Please upload an image file (PNG, JPG, etc.)");
      return;
    }

    setLinkedInUploading(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const imageData = await base64Promise;

      const response = await fetch("/api/profile/upload-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData, sectionType: "full_profile" }),
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh the screenshots list
        const profileRes = await fetch("/api/profile/upload-linkedin");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setLinkedInScreenshots(profileData.screenshots || []);
        }
        setMessage("LinkedIn profile information extracted!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to process screenshot. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Failed to process screenshot. Please try again.");
    } finally {
      setLinkedInUploading(false);
    }
  };

  const handleLinkedInDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setLinkedInDragActive(true);
    } else if (e.type === "dragleave") {
      setLinkedInDragActive(false);
    }
  };

  const handleLinkedInDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLinkedInDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLinkedInScreenshotUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDeleteLinkedInScreenshot = async (id: string) => {
    try {
      const response = await fetch(`/api/profile/upload-linkedin?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setLinkedInScreenshots((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete screenshot:", error);
    }
  };

  const getProcessingBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">Ready</span>;
      case "PROCESSING":
        return <span className="px-2 py-0.5 bg-warning/10 text-warning text-xs rounded-full animate-pulse">Processing...</span>;
      case "FAILED":
        return <span className="px-2 py-0.5 bg-error/10 text-error text-xs rounded-full">Failed</span>;
      default:
        return <span className="px-2 py-0.5 bg-claude-bg-tertiary text-claude-text-tertiary text-xs rounded-full">Pending</span>;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-claude-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-coral border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-claude-bg">
      {/* Header */}
      <header className="sticky top-0 bg-claude-bg/80 backdrop-blur-md border-b border-claude-border z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo size="md" />
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-claude-text-secondary hover:text-claude-text">
              Dashboard
            </Link>
            <Link href="/posts" className="text-sm text-claude-text-secondary hover:text-claude-text">
              Posts
            </Link>
            <Link href="/schedule" className="text-sm text-claude-text-secondary hover:text-claude-text">
              Schedule
            </Link>
            <Link href="/settings" className="text-sm text-accent-coral font-medium">
              Settings
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-claude-text mb-8">Settings</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-claude ${
            message.includes("success") || message.includes("connected")
              ? "bg-success/10 border border-success/20 text-success"
              : "bg-error/10 border border-error/20 text-error"
          }`}>
            {message}
          </div>
        )}

        {/* Profile Section */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-claude-bg-tertiary flex items-center justify-center">
              <UserIcon />
            </div>
            <h2 className="text-lg font-semibold text-claude-text">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={settings?.email || ""}
                disabled
                className="input bg-claude-bg-tertiary cursor-not-allowed"
              />
              <p className="text-xs text-claude-text-tertiary mt-1">
                Email cannot be changed
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* LinkedIn Integration */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#0077B5] text-white flex items-center justify-center">
              <LinkedInIcon />
            </div>
            <h2 className="text-lg font-semibold text-claude-text">LinkedIn Integration</h2>
          </div>

          {settings?.linkedInConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-success">
                <CheckIcon />
                <span className="font-medium">Connected</span>
              </div>
              <p className="text-sm text-claude-text-secondary">
                Your LinkedIn account is connected. Posts will be published automatically according to your schedule.
              </p>
              <button
                onClick={handleDisconnectLinkedIn}
                className="btn-ghost text-error hover:bg-error/10"
              >
                Disconnect LinkedIn
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-claude-text-secondary">
                Connect your LinkedIn account to automatically publish your scheduled posts.
              </p>
              <button
                onClick={handleConnectLinkedIn}
                className="btn-primary bg-[#0077B5] hover:bg-[#006699]"
              >
                <LinkedInIcon />
                Connect LinkedIn
              </button>
            </div>
          )}
        </div>

        {/* Organization & Account Level Section */}
        {settings?.organizations && settings.organizations.length > 0 && (
          <div className="card mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent-coral/10 text-accent-coral flex items-center justify-center">
                <BuildingIcon />
              </div>
              <h2 className="text-lg font-semibold text-claude-text">Organization & Account Level</h2>
            </div>

            <div className="space-y-4">
              {settings.organizations.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-4 bg-claude-bg-secondary rounded-claude">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-claude bg-white border border-claude-border flex items-center justify-center">
                      <BuildingIcon />
                    </div>
                    <div>
                      <p className="font-medium text-claude-text">{org.name}</p>
                      <p className="text-sm text-claude-text-secondary">Organization</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {org.role === "ADMIN" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-coral text-white text-sm font-medium rounded-full">
                        <ShieldIcon />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-claude-bg-tertiary text-claude-text text-sm font-medium rounded-full">
                        <UserIcon />
                        Member
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-claude-text-tertiary mt-4">
              {settings.organizations.some((org) => org.role === "ADMIN")
                ? "As an Admin, you can manage members, create organization notes, and schedule posts for team members."
                : "As a Member, you can view organization notes and have posts scheduled on your behalf by admins."}
            </p>
          </div>
        )}

        {/* Ghostwriter Personalization */}
        <div id="personalization" className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-accent-coral/10 text-accent-coral flex items-center justify-center">
              <SparklesIcon />
            </div>
            <h2 className="text-lg font-semibold text-claude-text">Ghostwriter Personalization</h2>
          </div>

          {/* Guidelines Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <PencilIcon />
              <h3 className="font-medium text-claude-text">Guidelines</h3>
            </div>
            <p className="text-sm text-claude-text-secondary mb-4">
              Running notes that apply to <strong>every</strong> post your ghostwriter creates.
            </p>

            {/* Add new guideline */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newGuideline}
                onChange={(e) => setNewGuideline(e.target.value)}
                placeholder="e.g., Always mention I'm a founder at Acme Corp"
                className="input flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleAddGuideline()}
              />
              <button
                onClick={handleAddGuideline}
                disabled={addingGuideline || !newGuideline.trim()}
                className="btn-primary"
              >
                {addingGuideline ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <PlusIcon />
                )}
                Add
              </button>
            </div>

            {/* Guidelines list */}
            {guidelinesLoading ? (
              <div className="py-4 text-center text-claude-text-tertiary">Loading...</div>
            ) : guidelines.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-claude-text-tertiary text-sm">No guidelines yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {guidelines.map((guideline) => (
                  <div key={guideline.id} className="flex items-start gap-3 p-3 bg-claude-bg-secondary rounded-claude group">
                    {editingGuidelineId === guideline.id ? (
                      <>
                        <input
                          type="text"
                          value={editingGuidelineContent}
                          onChange={(e) => setEditingGuidelineContent(e.target.value)}
                          className="input flex-1 text-sm"
                          autoFocus
                        />
                        <button onClick={() => handleUpdateGuideline(guideline.id)} className="btn-primary text-xs px-2 py-1">
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingGuidelineId(null);
                            setEditingGuidelineContent("");
                          }}
                          className="btn-ghost text-xs px-2 py-1"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="text-sm text-claude-text">{guideline.content}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingGuidelineId(guideline.id);
                              setEditingGuidelineContent(guideline.content);
                            }}
                            className="p-1 text-claude-text-tertiary hover:text-claude-text"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            onClick={() => handleDeleteGuideline(guideline.id)}
                            className="p-1 text-claude-text-tertiary hover:text-error"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Library Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpenIcon />
              <h3 className="font-medium text-claude-text">My Library</h3>
            </div>
            <p className="text-sm text-claude-text-secondary mb-4">
              Upload your content - articles, YouTube videos, PDFs, resume, documents. Your ghostwriter will use these to create <strong>Magic Drafts</strong>.
            </p>

            {/* Add URL */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste a URL (article, YouTube video, etc.)"
                className="input flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
              />
              <button
                onClick={handleAddUrl}
                disabled={addingUrl || !urlInput.trim()}
                className="btn-primary"
              >
                {addingUrl ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <PlusIcon />
                )}
                Add
              </button>
            </div>

            {/* File upload zone */}
            <div
              onDragEnter={handleLibraryDrag}
              onDragLeave={handleLibraryDrag}
              onDragOver={handleLibraryDrag}
              onDrop={handleLibraryDrop}
              className={`border-2 border-dashed rounded-claude p-4 text-center mb-4 transition-colors ${
                libraryDragActive
                  ? "border-accent-coral bg-accent-coral/5"
                  : "border-claude-border hover:border-claude-border-strong"
              }`}
            >
              {uploadingFile ? (
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="w-4 h-4 border-2 border-accent-coral border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-claude-text-secondary">Uploading...</span>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <span className="text-sm text-claude-text-secondary">
                    Drag & drop PDF, resume, or DOCX files here, or <span className="text-accent-coral">browse</span>
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    multiple
                    onChange={(e) => e.target.files && handleLibraryFileUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* LinkedIn screenshot upload */}
            <div
              onDragEnter={handleLinkedInDrag}
              onDragLeave={handleLinkedInDrag}
              onDragOver={handleLinkedInDrag}
              onDrop={handleLinkedInDrop}
              className={`border-2 border-dashed rounded-claude p-4 text-center mb-4 transition-colors ${
                linkedInDragActive
                  ? "border-[#0077B5] bg-[#0077B5]/5"
                  : "border-claude-border hover:border-claude-border-strong"
              }`}
            >
              {linkedInUploading ? (
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="w-4 h-4 border-2 border-[#0077B5] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-claude-text-secondary">Analyzing your LinkedIn profile...</span>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <UserCircleIcon />
                    <span className="text-sm text-claude-text-secondary">
                      Upload LinkedIn profile screenshot, or <span className="text-[#0077B5]">browse</span>
                    </span>
                  </div>
                  <span className="text-xs text-claude-text-tertiary">
                    Screenshot your LinkedIn profile to help your ghostwriter understand your background
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleLinkedInScreenshotUpload(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* LinkedIn screenshots list */}
            {linkedInScreenshots.length > 0 && (
              <div className="space-y-2 mb-4">
                {linkedInScreenshots.map((screenshot) => (
                  <div key={screenshot.id} className="flex items-center gap-3 p-3 bg-claude-bg-secondary rounded-claude group">
                    <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-[#0077B5]/10 text-[#0077B5]">
                      <UserCircleIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-claude-text font-medium">LinkedIn Profile Screenshot</p>
                      <p className="text-xs text-claude-text-tertiary">
                        Uploaded {new Date(screenshot.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">Ready</span>
                    <button
                      onClick={() => handleDeleteLinkedInScreenshot(screenshot.id)}
                      className="p-1 text-claude-text-tertiary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Library items list */}
            {libraryLoading ? (
              <div className="py-4 text-center text-claude-text-tertiary">Loading...</div>
            ) : libraryItems.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-claude-text-tertiary text-sm">Your library is empty</p>
              </div>
            ) : (
              <div className="space-y-2">
                {libraryItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-claude-bg-secondary rounded-claude group">
                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                      item.type === "YOUTUBE" ? "bg-red-100 text-red-600" :
                      item.type === "PDF" ? "bg-orange-100 text-orange-600" :
                      item.type === "DOCX" ? "bg-blue-100 text-blue-600" :
                      "bg-claude-bg-tertiary text-claude-text-secondary"
                    }`}>
                      {getLibraryTypeIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-claude-text font-medium truncate">
                        {item.title || item.fileName || item.sourceUrl || "Untitled"}
                      </p>
                      {item.extractedSummary && (
                        <p className="text-xs text-claude-text-tertiary mt-1 line-clamp-2">
                          {item.extractedSummary}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {getProcessingBadge(item.processingStatus)}
                        {item.usageCount > 0 && (
                          <span className="text-xs text-claude-text-tertiary">Used {item.usageCount}x</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteLibraryItem(item.id)}
                      className="p-1 text-claude-text-tertiary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Account Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-claude-text mb-6">Account</h2>
          <button
            onClick={handleLogout}
            className="btn-ghost text-claude-text-secondary hover:text-error hover:bg-error/10"
          >
            <LogoutIcon />
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-claude-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-coral border-t-transparent rounded-full" />
      </div>
    }>
      <SettingsForm />
    </Suspense>
  );
}
