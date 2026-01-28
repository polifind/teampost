"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

interface Schedule {
  id: string;
  scheduledFor: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
}

interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  weekNumber: number;
  status: "DRAFT" | "SCHEDULED" | "POSTED" | "FAILED";
  createdAt: string;
  schedule?: Schedule | null;
  createdByAdmin?: {
    name: string | null;
    email: string;
  } | null;
}

interface LibraryPhoto {
  id: string;
  imageUrl: string;
  filename: string | null;
}

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const UndoIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIMES = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export default function PostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [newScheduledDate, setNewScheduledDate] = useState("");
  const [newScheduledTime, setNewScheduledTime] = useState("");
  const [updatingSchedule, setUpdatingSchedule] = useState<string | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<string | null>(null);
  const [regeneratePostId, setRegeneratePostId] = useState<string | null>(null);
  const [regenerateFeedback, setRegenerateFeedback] = useState("");
  const [previousVersions, setPreviousVersions] = useState<Record<string, string>>({});
  const [libraryPhotos, setLibraryPhotos] = useState<LibraryPhoto[]>([]);
  const [showPhotoLibraryFor, setShowPhotoLibraryFor] = useState<string | null>(null);
  const [deletingPost, setDeletingPost] = useState<string | null>(null);
  const [updatingImage, setUpdatingImage] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Bulk scheduling state
  const [showBulkSchedule, setShowBulkSchedule] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [selectedDay, setSelectedDay] = useState("Tuesday");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [startDate, setStartDate] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/posts");
    }
  }, [status, router]);

  useEffect(() => {
    // Set default start date to next week
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    setStartDate(nextWeek.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts");
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts);
          setLinkedInConnected(data.linkedInConnected);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
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

    if (session?.user) {
      fetchPosts();
      fetchLibraryPhotos();
    }
  }, [session]);

  const handleEdit = (post: Post) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  const handleSaveEdit = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, content: editContent } : p))
        );
        setEditingPost(null);
      }
    } catch (error) {
      console.error("Failed to save post:", error);
    }
  };

  const handleStartRegenerate = (postId: string) => {
    setRegeneratePostId(postId);
    setRegenerateFeedback("");
  };

  const handleCancelRegenerate = () => {
    setRegeneratePostId(null);
    setRegenerateFeedback("");
  };

  const handleRegenerate = async (postId: string) => {
    // Save the current content as previous version before regenerating
    const currentPost = posts.find(p => p.id === postId);
    if (currentPost) {
      setPreviousVersions(prev => ({
        ...prev,
        [postId]: currentPost.content,
      }));
    }

    setRegenerating(postId);
    try {
      const response = await fetch(`/api/posts/${postId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: regenerateFeedback }),
      });

      if (response.ok) {
        const data = await response.json();
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, content: data.content } : p))
        );
        setRegeneratePostId(null);
        setRegenerateFeedback("");
      }
    } catch (error) {
      console.error("Failed to regenerate post:", error);
      // Clear the previous version if regeneration failed
      setPreviousVersions(prev => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
    } finally {
      setRegenerating(null);
    }
  };

  const handleRevertToPrevious = async (postId: string) => {
    const previousContent = previousVersions[postId];
    if (!previousContent) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: previousContent }),
      });

      if (response.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, content: previousContent } : p))
        );
        // Clear the previous version after reverting
        setPreviousVersions(prev => {
          const next = { ...prev };
          delete next[postId];
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to revert post:", error);
    }
  };

  const handleCopy = async (post: Post) => {
    await navigator.clipboard.writeText(post.content);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectPhoto = async (postId: string, imageUrl: string) => {
    setUpdatingImage(postId);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (response.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, imageUrl } : p))
        );
        setShowPhotoLibraryFor(null);
      } else {
        const errorData = await response.json();
        console.error("Failed to update post image:", errorData);
        alert("Failed to attach photo. Please try again.");
      }
    } catch (error) {
      console.error("Failed to update post image:", error);
      alert("Failed to attach photo. Please try again.");
    } finally {
      setUpdatingImage(null);
    }
  };

  const handleRemoveImage = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: null }),
      });

      if (response.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, imageUrl: undefined } : p))
        );
      }
    } catch (error) {
      console.error("Failed to remove post image:", error);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, postId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Add to library photos
        setLibraryPhotos((prev) => [data.photo, ...prev]);
        // Attach to post
        await handleSelectPhoto(postId, data.photo.imageUrl);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to upload photo");
      }
    } catch (error) {
      console.error("Failed to upload photo:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
      // Reset the input
      e.target.value = "";
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) {
      return;
    }

    setDeletingPost(postId);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } else {
        alert("Failed to delete post");
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post");
    } finally {
      setDeletingPost(null);
    }
  };

  const handleEditSchedule = (post: Post) => {
    if (post.schedule) {
      const scheduledDate = new Date(post.schedule.scheduledFor);
      setNewScheduledDate(scheduledDate.toISOString().split("T")[0]);
      setNewScheduledTime(
        scheduledDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
      setEditingSchedule(post.schedule.id);
    }
  };

  const handleSaveSchedule = async (scheduleId: string) => {
    if (!newScheduledDate || !newScheduledTime) return;

    setUpdatingSchedule(scheduleId);
    try {
      const scheduledFor = new Date(`${newScheduledDate}T${newScheduledTime}:00`);

      const response = await fetch(`/api/schedule/${scheduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledFor: scheduledFor.toISOString() }),
      });

      if (response.ok) {
        const { schedule } = await response.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.schedule?.id === scheduleId
              ? { ...p, schedule: { ...p.schedule, scheduledFor: schedule.scheduledFor } }
              : p
          )
        );
        setEditingSchedule(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update schedule");
      }
    } catch (error) {
      console.error("Failed to update schedule:", error);
      alert("Failed to update schedule");
    } finally {
      setUpdatingSchedule(null);
    }
  };

  const handleBulkSchedule = async () => {
    if (!linkedInConnected) {
      alert("Please connect your LinkedIn account first.");
      return;
    }

    setScheduling(true);

    try {
      const response = await fetch("/api/schedule/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: selectedDay,
          time: selectedTime,
          startDate,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Refetch posts to get updated schedules
        const postsResponse = await fetch("/api/posts");
        if (postsResponse.ok) {
          const data = await postsResponse.json();
          setPosts(data.posts);
        }
        setShowBulkSchedule(false);
        alert(`Scheduled ${result.scheduledCount} posts successfully!`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to schedule posts");
      }
    } catch (error) {
      console.error("Failed to schedule:", error);
      alert("Failed to schedule posts. Please try again.");
    } finally {
      setScheduling(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to unschedule this post? It will be moved back to drafts.")) {
      return;
    }

    setDeletingSchedule(scheduleId);
    try {
      const response = await fetch(`/api/schedule/${scheduleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.schedule?.id === scheduleId
              ? { ...p, status: "DRAFT", schedule: null }
              : p
          )
        );
      } else {
        alert("Failed to delete schedule");
      }
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      alert("Failed to delete schedule");
    } finally {
      setDeletingSchedule(null);
    }
  };

  const formatScheduledTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status: Post["status"]) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-claude-bg-tertiary text-claude-text-secondary">
            Draft
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent-coral-light text-accent-coral">
            Scheduled
          </span>
        );
      case "POSTED":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-success/10 text-success">
            Posted
          </span>
        );
      case "FAILED":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-error/10 text-error">
            Failed
          </span>
        );
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
            <Link href="/posts" className="text-sm text-accent-coral font-medium">
              Posts
            </Link>
            <Link href="/settings" className="text-sm text-claude-text-secondary hover:text-claude-text">
              Settings
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-claude-text">Your LinkedIn Posts</h1>
            <p className="text-claude-text-secondary mt-1">
              {posts.length} posts • {posts.filter(p => p.status === "DRAFT").length} drafts • {posts.filter(p => p.status === "SCHEDULED").length} scheduled
            </p>
          </div>

          {posts.filter(p => p.status === "DRAFT").length > 0 && linkedInConnected && (
            <button
              onClick={() => setShowBulkSchedule(!showBulkSchedule)}
              className={showBulkSchedule ? "btn-secondary" : "btn-primary"}
            >
              <CalendarIcon />
              {showBulkSchedule ? "Cancel" : "Schedule All Drafts"}
            </button>
          )}
        </div>

        {/* Bulk Scheduling UI */}
        {showBulkSchedule && (
          <div className="card mb-8 border-accent-coral/20 bg-accent-coral/5">
            <h2 className="text-lg font-semibold text-claude-text mb-4">
              Schedule {posts.filter(p => p.status === "DRAFT").length} draft posts
            </h2>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="label">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Day of Week</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="input"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Time</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="input"
                >
                  {TIMES.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-sm text-claude-text-secondary mb-4">
              Your posts will be published every {selectedDay} at {selectedTime}, starting from {startDate}.
            </p>

            <button
              onClick={handleBulkSchedule}
              disabled={scheduling}
              className="btn-primary"
            >
              {scheduling ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Scheduling...
                </>
              ) : (
                <>
                  <CalendarIcon />
                  Schedule All Posts
                </>
              )}
            </button>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 rounded-full bg-claude-bg-tertiary flex items-center justify-center mx-auto mb-4">
              <LinkedInIcon />
            </div>
            <h2 className="text-xl font-semibold text-claude-text mb-2">
              No posts yet
            </h2>
            <p className="text-claude-text-secondary mb-6">
              Complete the onboarding to generate your first LinkedIn posts.
            </p>
            <Link href="/onboarding" className="btn-primary">
              Start Recording
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-coral text-white flex items-center justify-center font-bold">
                      {post.weekNumber}
                    </div>
                    <div>
                      <p className="font-medium text-claude-text">Week {post.weekNumber}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(post.status)}
                        {post.createdByAdmin && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                            From {post.createdByAdmin.name || "Admin"}
                          </span>
                        )}
                        {post.status === "SCHEDULED" && post.schedule && (
                          <span className="text-xs text-claude-text-secondary flex items-center gap-1">
                            <ClockIcon />
                            {formatScheduledTime(post.schedule.scheduledFor)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(post)}
                      className="p-2 rounded-claude text-claude-text-secondary hover:bg-claude-bg-tertiary hover:text-claude-text transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedId === post.id ? <CheckIcon /> : <CopyIcon />}
                    </button>
                    <button
                      onClick={() => handleStartRegenerate(post.id)}
                      disabled={regenerating === post.id}
                      className={`p-2 rounded-claude transition-colors disabled:opacity-50 ${
                        regeneratePostId === post.id
                          ? "bg-accent-coral/10 text-accent-coral"
                          : "text-claude-text-secondary hover:bg-claude-bg-tertiary hover:text-claude-text"
                      }`}
                      title="Regenerate post with feedback"
                    >
                      <RefreshIcon />
                    </button>
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-2 rounded-claude text-claude-text-secondary hover:bg-claude-bg-tertiary hover:text-claude-text transition-colors"
                      title="Edit post"
                    >
                      <EditIcon />
                    </button>
                    {previousVersions[post.id] && (
                      <button
                        onClick={() => handleRevertToPrevious(post.id)}
                        className="p-2 rounded-claude text-accent-coral bg-accent-coral/10 hover:bg-accent-coral/20 transition-colors"
                        title="Undo - revert to previous version"
                      >
                        <UndoIcon />
                      </button>
                    )}
                    {post.status === "DRAFT" && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingPost === post.id}
                        className="p-2 rounded-claude text-claude-text-secondary hover:bg-claude-bg-tertiary hover:text-error transition-colors disabled:opacity-50"
                        title="Delete post"
                      >
                        {deletingPost === post.id ? (
                          <div className="w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <TrashIcon />
                        )}
                      </button>
                    )}
                    {post.status === "SCHEDULED" && post.schedule && (
                      <>
                        <button
                          onClick={() => handleEditSchedule(post)}
                          className="p-2 rounded-claude text-claude-text-secondary hover:bg-claude-bg-tertiary hover:text-accent-coral transition-colors"
                          title="Edit scheduled time"
                        >
                          <CalendarIcon />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(post.schedule!.id)}
                          disabled={deletingSchedule === post.schedule.id}
                          className="p-2 rounded-claude text-claude-text-secondary hover:bg-claude-bg-tertiary hover:text-error transition-colors disabled:opacity-50"
                          title="Unschedule post"
                        >
                          {deletingSchedule === post.schedule.id ? (
                            <div className="w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <TrashIcon />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Regenerate with feedback UI */}
                {regeneratePostId === post.id && (
                  <div className="mb-4 p-4 bg-accent-coral/5 border border-accent-coral/20 rounded-claude">
                    <p className="text-sm font-medium text-claude-text mb-2">What would you like to improve?</p>
                    <p className="text-xs text-claude-text-secondary mb-3">
                      Your feedback will help improve this post and future posts
                    </p>
                    <textarea
                      value={regenerateFeedback}
                      onChange={(e) => setRegenerateFeedback(e.target.value)}
                      placeholder="e.g., Make it more conversational, add a stronger hook, shorter sentences..."
                      className="input text-sm min-h-[80px] resize-y mb-3"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRegenerate(post.id)}
                        disabled={regenerating === post.id || !regenerateFeedback.trim()}
                        className="btn-primary text-sm py-2"
                      >
                        {regenerating === post.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            TeamPost AI is rewriting...
                          </>
                        ) : (
                          <>
                            <RefreshIcon />
                            Regenerate with TeamPost AI
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelRegenerate}
                        className="btn-ghost text-sm py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Schedule editing UI */}
                {editingSchedule === post.schedule?.id && (
                  <div className="mb-4 p-4 bg-accent-coral/5 border border-accent-coral/20 rounded-claude">
                    <p className="text-sm font-medium text-claude-text mb-3">Edit Scheduled Time</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <input
                        type="date"
                        value={newScheduledDate}
                        onChange={(e) => setNewScheduledDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="input text-sm py-2"
                      />
                      <input
                        type="time"
                        value={newScheduledTime}
                        onChange={(e) => setNewScheduledTime(e.target.value)}
                        className="input text-sm py-2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveSchedule(post.schedule!.id)}
                          disabled={updatingSchedule === post.schedule?.id}
                          className="btn-primary text-sm py-2"
                        >
                          {updatingSchedule === post.schedule?.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </button>
                        <button
                          onClick={() => setEditingSchedule(null)}
                          className="btn-ghost text-sm py-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {editingPost === post.id ? (
                  <div className="space-y-4">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="input min-h-[200px] resize-y"
                      placeholder="Edit your post..."
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSaveEdit(post.id)}
                        className="btn-primary text-sm"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingPost(null)}
                        className="btn-ghost text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-claude-text whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                )}

                {/* Image section */}
                <div className="mt-4 pt-4 border-t border-claude-border">
                  {post.imageUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={post.imageUrl}
                        alt="Post image"
                        className="max-h-48 rounded-lg border border-claude-border"
                      />
                      {post.status !== "POSTED" && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button
                            onClick={() => setShowPhotoLibraryFor(post.id)}
                            className="p-1.5 bg-white/90 rounded-full text-claude-text-secondary hover:text-claude-text shadow-sm"
                            title="Change image"
                          >
                            <ImageIcon />
                          </button>
                          <button
                            onClick={() => handleRemoveImage(post.id)}
                            className="p-1.5 bg-white/90 rounded-full text-error hover:text-error/80 shadow-sm"
                            title="Remove image"
                          >
                            <XIcon />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : post.status !== "POSTED" && (
                    <button
                      onClick={() => setShowPhotoLibraryFor(post.id)}
                      className="flex items-center gap-2 text-sm text-accent-coral hover:underline"
                    >
                      <ImageIcon />
                      Add photo (posts with photos perform 2x better)
                    </button>
                  )}

                  {/* Photo library picker */}
                  {showPhotoLibraryFor === post.id && (
                    <div className="mt-3 p-4 bg-claude-bg-secondary rounded-claude border border-claude-border">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-claude-text">Select from your photo library</p>
                        <button
                          onClick={() => setShowPhotoLibraryFor(null)}
                          className="text-xs text-claude-text-tertiary hover:text-claude-text"
                        >
                          Cancel
                        </button>
                      </div>
                      {updatingImage === post.id || uploadingPhoto ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="flex items-center gap-2 text-sm text-accent-coral">
                            <div className="w-4 h-4 border-2 border-accent-coral border-t-transparent rounded-full animate-spin" />
                            {uploadingPhoto ? "Uploading..." : "Attaching photo..."}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {/* Upload button */}
                          <label className="aspect-square rounded border-2 border-dashed border-claude-border hover:border-accent-coral transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 bg-white">
                            <PlusIcon />
                            <span className="text-xs text-claude-text-tertiary">Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(e, post.id)}
                            />
                          </label>
                          {libraryPhotos.map((photo) => (
                            <button
                              key={photo.id}
                              onClick={() => handleSelectPhoto(post.id, photo.imageUrl)}
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
                      )}
                    </div>
                  )}
                </div>

                {regenerating === post.id && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-accent-coral">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    TeamPost AI is rewriting...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!linkedInConnected && posts.length > 0 && posts.some(p => p.status === "DRAFT") && (
          <div className="mt-8 p-6 rounded-claude-lg bg-[#0077B5]/5 border border-[#0077B5]/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0077B5] text-white flex items-center justify-center flex-shrink-0">
                <LinkedInIcon />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-claude-text mb-1">
                  Connect LinkedIn to schedule posts
                </h3>
                <p className="text-sm text-claude-text-secondary mb-4">
                  Link your LinkedIn account to automatically schedule and publish your posts.
                </p>
                <Link href="/settings" className="btn-secondary text-sm">
                  Connect LinkedIn
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
