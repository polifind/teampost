"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ContentInput from "@/components/ContentInput";
import Logo from "@/components/Logo";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface DraftPost {
  content: string;
  isApproved: boolean;
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

export default function CreatePostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [draftPost, setDraftPost] = useState<DraftPost | null>(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [showScheduleSuccess, setShowScheduleSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/create");
    }
  }, [status, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0 && status === "authenticated") {
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
  }, [status, session, messages.length]);

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
      // Build conversation history for context
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

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // If a draft was generated, show it
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
          isApproved: false,
        });

        // Add message about regeneration
        const message: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Here's a fresh take on your post. What do you think?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, message]);
      }
    } catch (error) {
      console.error("Error regenerating:", error);
    } finally {
      setIsLoading(false);
    }
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

  const handleSchedulePost = async () => {
    if (!draftPost) return;

    setIsScheduling(true);
    try {
      // Save the post
      const saveResponse = await fetch("/api/posts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: draftPost.content,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save post");
      }

      const { postId } = await saveResponse.json();

      // Schedule for next available Monday at 8:55 AM EST
      const scheduleResponse = await fetch("/api/schedule/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (scheduleResponse.ok) {
        setShowScheduleSuccess(true);
        setDraftPost({ ...draftPost, isApproved: true });

        // Add success message
        const message: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Your post is scheduled! Want to create another one?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, message]);
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
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-claude-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-coral border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-claude-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-claude-bg/80 backdrop-blur-md border-b border-claude-border z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo size="md" />
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/posts" className="btn-ghost text-sm">
              My Posts
            </Link>
            <Link href="/schedule" className="btn-ghost text-sm">
              Schedule
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-4xl mx-auto w-full">
        {/* Main conversation area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
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

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-claude-bg-secondary rounded-claude-lg p-4">
                  <div className="flex items-center gap-2 text-claude-text-secondary">
                    <div className="animate-spin w-4 h-4 border-2 border-accent-coral border-t-transparent rounded-full" />
                    <span>Thinking...</span>
                  </div>
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
          <div className="w-96 border-l border-claude-border p-6 overflow-y-auto">
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
              </div>

              {/* Actions */}
              {!draftPost.isApproved && (
                <div className="space-y-2">
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
                      <button
                        onClick={handleSchedulePost}
                        disabled={isScheduling}
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
                    Your post will go live on the next available Monday at 8:55 AM EST.
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
  );
}
