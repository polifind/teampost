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
  status: "DRAFT" | "SCHEDULED" | "POSTED" | "FAILED";
  createdAt: string;
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

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/posts");
    }
  }, [status, router]);

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

    if (session?.user) {
      fetchPosts();
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

  const handleRegenerate = async (postId: string) => {
    setRegenerating(postId);
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
      console.error("Failed to regenerate post:", error);
    } finally {
      setRegenerating(null);
    }
  };

  const handleCopy = async (post: Post) => {
    await navigator.clipboard.writeText(post.content);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
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
            <Link href="/schedule" className="text-sm text-claude-text-secondary hover:text-claude-text">
              Schedule
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
              {posts.length} posts ready for scheduling
            </p>
          </div>

          {posts.length > 0 && (
            <Link href="/schedule" className="btn-primary">
              <CalendarIcon />
              Schedule Posts
            </Link>
          )}
        </div>

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
                      {getStatusBadge(post.status)}
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
                      onClick={() => handleRegenerate(post.id)}
                      disabled={regenerating === post.id}
                      className="p-2 rounded-claude text-claude-text-secondary hover:bg-claude-bg-tertiary hover:text-claude-text transition-colors disabled:opacity-50"
                      title="Regenerate post"
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
                  </div>
                </div>

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

                {regenerating === post.id && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-accent-coral">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Regenerating with AI...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!linkedInConnected && posts.length > 0 && (
          <div className="mt-8 p-6 rounded-claude-lg bg-[#0077B5]/5 border border-[#0077B5]/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0077B5] text-white flex items-center justify-center flex-shrink-0">
                <LinkedInIcon />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-claude-text mb-1">
                  Connect LinkedIn to auto-post
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
