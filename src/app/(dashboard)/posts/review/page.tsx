"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

interface Post {
  id: string;
  content: string;
  weekNumber: number;
  status: string;
  scheduledFor?: string;
}

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

function getNextTenMondays(): Date[] {
  const mondays: Date[] = [];
  const today = new Date();
  let current = new Date(today);

  // Find next Monday
  const daysUntilMonday = (8 - current.getDay()) % 7 || 7;
  current.setDate(current.getDate() + daysUntilMonday);

  // Set to 8:55 AM EST (13:55 UTC during standard time, 12:55 UTC during DST)
  // Using 13:55 UTC as a reasonable approximation
  current.setUTCHours(13, 55, 0, 0);

  for (let i = 0; i < 10; i++) {
    mondays.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }

  return mondays;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function ReviewPostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [approvedPosts, setApprovedPosts] = useState<Set<string>>(new Set());
  const [isScheduling, setIsScheduling] = useState(false);
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [regeneratingPost, setRegeneratingPost] = useState<string | null>(null);

  const scheduleDates = getNextTenMondays();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/posts/review");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/posts");
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
          // Auto-approve all posts initially
          setApprovedPosts(new Set(data.posts?.map((p: Post) => p.id) || []));
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    async function checkLinkedIn() {
      try {
        const response = await fetch("/api/linkedin/status");
        if (response.ok) {
          const data = await response.json();
          setLinkedInConnected(data.connected);
        }
      } catch (error) {
        console.error("Error checking LinkedIn status:", error);
      }
    }

    if (status === "authenticated") {
      fetchPosts();
      checkLinkedIn();
    }
  }, [status]);

  const handleEditPost = (post: Post) => {
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
      }
    } catch (error) {
      console.error("Error saving post:", error);
    } finally {
      setEditingPost(null);
      setEditContent("");
    }
  };

  const handleRegeneratePost = async (postId: string, weekNumber: number) => {
    setRegeneratingPost(postId);
    try {
      const response = await fetch(`/api/posts/${postId}/regenerate`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, content: data.content } : p))
        );
      }
    } catch (error) {
      console.error("Error regenerating post:", error);
    } finally {
      setRegeneratingPost(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setApprovedPosts((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const toggleApproval = (postId: string) => {
    setApprovedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleScheduleAll = async () => {
    if (!linkedInConnected) {
      router.push("/settings?connect=linkedin");
      return;
    }

    const approvedPostsList = posts.filter((p) => approvedPosts.has(p.id));
    if (approvedPostsList.length === 0) {
      alert("Please approve at least one post to schedule.");
      return;
    }

    setIsScheduling(true);

    try {
      const scheduleData = approvedPostsList.map((post, index) => ({
        postId: post.id,
        scheduledFor: scheduleDates[index].toISOString(),
      }));

      const response = await fetch("/api/schedule/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedules: scheduleData }),
      });

      if (response.ok) {
        router.push("/schedule?success=true");
      } else {
        throw new Error("Failed to schedule posts");
      }
    } catch (error) {
      console.error("Error scheduling posts:", error);
      alert("Failed to schedule posts. Please try again.");
    } finally {
      setIsScheduling(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-claude-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-coral border-t-transparent rounded-full" />
      </div>
    );
  }

  const approvedCount = approvedPosts.size;

  return (
    <div className="min-h-screen bg-claude-bg">
      {/* Header */}
      <header className="sticky top-0 bg-claude-bg/80 backdrop-blur-md border-b border-claude-border z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/onboarding" className="btn-ghost text-sm">
              <ArrowLeftIcon />
              Back
            </Link>
            <div className="h-6 w-px bg-claude-border" />
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo size="md" />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-claude-text-secondary">
              {approvedCount} of {posts.length} posts approved
            </span>
            <button
              onClick={handleScheduleAll}
              disabled={isScheduling || approvedCount === 0}
              className="btn-primary"
            >
              {isScheduling ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Scheduling...
                </>
              ) : linkedInConnected ? (
                <>
                  <CalendarIcon />
                  Schedule {approvedCount} Posts
                </>
              ) : (
                <>
                  <LinkedInIcon />
                  Connect LinkedIn to Schedule
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-claude-text mb-2">
            Review Your LinkedIn Posts
          </h1>
          <p className="text-claude-text-secondary">
            Review, edit, and approve your posts. They'll be scheduled for 8:55 AM EST every Monday for the next {posts.length} weeks.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-claude-text-secondary mb-4">
              No posts generated yet. Complete the voice questions first.
            </p>
            <Link href="/onboarding" className="btn-primary inline-flex">
              Start Recording
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {posts
              .sort((a, b) => a.weekNumber - b.weekNumber)
              .map((post, index) => {
                const isApproved = approvedPosts.has(post.id);
                const isEditing = editingPost === post.id;
                const scheduleDate = scheduleDates[index];

                return (
                  <div
                    key={post.id}
                    className={`card transition-all ${
                      isApproved ? "border-success/30 bg-success/5" : "border-claude-border"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Approval checkbox */}
                      <button
                        onClick={() => toggleApproval(post.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${
                          isApproved
                            ? "bg-success border-success text-white"
                            : "border-claude-border hover:border-success"
                        }`}
                      >
                        {isApproved && <CheckIcon />}
                      </button>

                      {/* Post content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-medium text-accent-coral">
                            Week {post.weekNumber}
                          </span>
                          <span className="text-xs text-claude-text-tertiary">
                            {formatDate(scheduleDate)} at 8:55 AM EST
                          </span>
                        </div>

                        {isEditing ? (
                          <div>
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full h-48 p-4 border border-claude-border rounded-claude text-sm text-claude-text resize-none focus:outline-none focus:ring-2 focus:ring-accent-coral"
                            />
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleSaveEdit(post.id)}
                                className="btn-primary text-sm"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => {
                                  setEditingPost(null);
                                  setEditContent("");
                                }}
                                className="btn-ghost text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap text-sm text-claude-text bg-white rounded-claude border border-claude-border p-4">
                            {post.content}
                          </div>
                        )}

                        {/* Actions */}
                        {!isEditing && (
                          <div className="flex items-center gap-3 mt-3">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="btn-ghost text-xs"
                            >
                              <EditIcon />
                              Edit
                            </button>
                            <button
                              onClick={() => handleRegeneratePost(post.id, post.weekNumber)}
                              disabled={regeneratingPost === post.id}
                              className="btn-ghost text-xs"
                            >
                              {regeneratingPost === post.id ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  Regenerating...
                                </>
                              ) : (
                                <>
                                  <RefreshIcon />
                                  Regenerate
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="btn-ghost text-xs text-error hover:bg-error/10"
                            >
                              <TrashIcon />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Bottom CTA */}
        {posts.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-block p-6 rounded-claude-lg bg-accent-coral-light border border-accent-coral/20">
              <h3 className="text-lg font-semibold text-claude-text mb-2">
                Ready to schedule?
              </h3>
              <p className="text-claude-text-secondary mb-4">
                {approvedCount} posts will be scheduled for 8:55 AM EST every Monday.
              </p>
              <button
                onClick={handleScheduleAll}
                disabled={isScheduling || approvedCount === 0}
                className="btn-primary"
              >
                {linkedInConnected ? (
                  <>
                    <CalendarIcon />
                    Schedule All Approved Posts
                  </>
                ) : (
                  <>
                    <LinkedInIcon />
                    Connect LinkedIn First
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
