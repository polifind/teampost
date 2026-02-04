"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

interface GeneratedDraft {
  id: string;
  content: string;
  sourcedFrom: { title: string }[];
  createdAt: Date;
}

// Icons
const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

const BookOpenIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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

const WandIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

export default function MagicDraftsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  // Magic Draft generation state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedDrafts, setGeneratedDrafts] = useState<GeneratedDraft[]>([]);

  // Message state
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/magic-drafts");
    }
  }, [status, router]);

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
        setMessage("URL added to your library!");
        setTimeout(() => setMessage(""), 3000);
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
    setMessage("Files uploaded to your library!");
    setTimeout(() => setMessage(""), 3000);
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

  // Magic Draft generation
  const handleGenerateDraft = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/posts/magic-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedLibraryItemIds: selectedItems.length > 0 ? selectedItems : undefined,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setGeneratedDrafts((prev) => [
          {
            id: Date.now().toString(),
            content: data.draft,
            sourcedFrom: data.sourcedFrom,
            createdAt: new Date(),
          },
          ...prev,
        ]);
        setShowGenerateModal(false);
        setSelectedItems([]);
        setMessage("Draft generated! You can save it to your posts.");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const error = await response.json();
        setMessage(error.error || "Failed to generate draft. Please try again.");
      }
    } catch (error) {
      console.error("Generation error:", error);
      setMessage("Failed to generate draft. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDraft = async (draft: GeneratedDraft) => {
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: draft.content,
          status: "DRAFT",
        }),
      });
      if (response.ok) {
        setGeneratedDrafts((prev) => prev.filter((d) => d.id !== draft.id));
        setMessage("Draft saved! View it in your Posts.");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
      setMessage("Failed to save draft. Please try again.");
    }
  };

  const getLibraryTypeIcon = (type: string) => {
    switch (type) {
      case "YOUTUBE": return <VideoIcon />;
      case "PDF": case "DOCX": return <FileIcon />;
      default: return <LinkIcon />;
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

  const completedItems = libraryItems.filter((item) => item.processingStatus === "COMPLETED");

  if (status === "loading" || libraryLoading) {
    return (
      <div className="min-h-screen bg-claude-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-coral border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-accent-coral/20 text-purple-600 flex items-center justify-center">
            <SparklesIcon />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-claude-text">Magic Drafts</h1>
            <p className="text-claude-text-secondary">Generate AI-powered posts from your content library</p>
          </div>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          disabled={completedItems.length === 0}
          className="btn-primary bg-gradient-to-r from-purple-500 to-accent-coral hover:from-purple-600 hover:to-accent-coral/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <WandIcon />
          Generate Draft
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-claude ${
          message.includes("success") || message.includes("saved") || message.includes("generated") || message.includes("added") || message.includes("uploaded") || message.includes("extracted")
            ? "bg-success/10 border border-success/20 text-success"
            : "bg-error/10 border border-error/20 text-error"
        }`}>
          {message}
        </div>
      )}

      {/* Generated Drafts */}
      {generatedDrafts.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-claude-text mb-4 flex items-center gap-2">
            <WandIcon />
            Generated Drafts ({generatedDrafts.length})
          </h2>
          <div className="space-y-4">
            {generatedDrafts.map((draft) => (
              <div key={draft.id} className="p-4 bg-claude-bg-secondary rounded-claude border border-claude-border">
                <p className="text-claude-text whitespace-pre-wrap line-clamp-4 mb-3">{draft.content}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-claude-text-tertiary">
                    Based on: {draft.sourcedFrom.map((s) => s.title).join(", ")}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGeneratedDrafts((prev) => prev.filter((d) => d.id !== draft.id))}
                      className="btn-ghost text-sm text-claude-text-tertiary hover:text-error"
                    >
                      Discard
                    </button>
                    <button
                      onClick={() => handleSaveDraft(draft)}
                      className="btn-primary text-sm"
                    >
                      Save to Posts
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Library Section */}
      <div className="card mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpenIcon />
          <h2 className="text-lg font-semibold text-claude-text">My Library</h2>
          <span className="text-sm text-claude-text-tertiary">({libraryItems.length} items)</span>
        </div>
        <p className="text-sm text-claude-text-secondary mb-6">
          Add your content - articles, YouTube videos, PDFs, documents. The AI will use these to create personalized drafts.
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
          className={`border-2 border-dashed rounded-claude p-4 text-center mb-6 transition-colors ${
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
                Screenshot your LinkedIn profile to help personalize your drafts
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
        {libraryItems.length === 0 ? (
          <div className="py-8 text-center">
            <BookOpenIcon />
            <p className="text-claude-text-tertiary text-sm mt-2">Your library is empty</p>
            <p className="text-claude-text-tertiary text-xs">Add URLs or upload files to get started</p>
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

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-claude-lg max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-claude-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500/20 to-accent-coral/20 text-purple-600 flex items-center justify-center">
                    <WandIcon />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-claude-text">Generate Magic Draft</h2>
                    <p className="text-sm text-claude-text-secondary">
                      Select sources for your post (optional)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="p-2 text-claude-text-tertiary hover:text-claude-text rounded-claude hover:bg-claude-bg-secondary"
                >
                  <XIcon />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {completedItems.length === 0 ? (
                <div className="text-center py-8 text-claude-text-tertiary">
                  <BookOpenIcon />
                  <p className="mt-2">No processed library items available</p>
                  <p className="text-sm mt-1">Add content to your library and wait for processing</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-claude-text-secondary mb-4">
                    {selectedItems.length === 0
                      ? "All your library content will be used to generate a draft. Or select specific items:"
                      : `${selectedItems.length} item(s) selected`}
                  </p>
                  <div className="space-y-2">
                    {completedItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedItems((prev) =>
                            prev.includes(item.id)
                              ? prev.filter((id) => id !== item.id)
                              : [...prev, item.id]
                          );
                        }}
                        className={`flex items-center gap-3 p-3 rounded-claude cursor-pointer transition-colors ${
                          selectedItems.includes(item.id)
                            ? "bg-purple-50 border border-purple-200"
                            : "bg-claude-bg-secondary hover:bg-claude-bg-tertiary border border-transparent"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                          selectedItems.includes(item.id)
                            ? "bg-purple-500 border-purple-500 text-white"
                            : "border-claude-border"
                        }`}>
                          {selectedItems.includes(item.id) && <CheckIcon />}
                        </div>
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
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-claude-border bg-claude-bg-secondary">
              <button
                onClick={handleGenerateDraft}
                disabled={generating || completedItems.length === 0}
                className="btn-primary w-full bg-gradient-to-r from-purple-500 to-accent-coral hover:from-purple-600 hover:to-accent-coral/90"
              >
                {generating ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    <WandIcon />
                    Generate Draft
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
