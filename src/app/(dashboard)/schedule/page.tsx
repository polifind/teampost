"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  weekNumber: number;
  status: "DRAFT" | "SCHEDULED" | "POSTED" | "FAILED";
  schedule?: {
    id: string;
    scheduledFor: string;
    status: string;
  };
}

interface ScheduleData {
  posts: Post[];
  linkedInConnected: boolean;
}

interface EditingSchedule {
  scheduleId: string;
  postId: string;
  currentDate: string;
  currentTime: string;
  currentImageUrl?: string;
}

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
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

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIMES = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export default function SchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [selectedDay, setSelectedDay] = useState("Tuesday");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [startDate, setStartDate] = useState("");

  // State for editing a scheduled post
  const [editingSchedule, setEditingSchedule] = useState<EditingSchedule | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/schedule");
    }
  }, [status, router]);

  useEffect(() => {
    // Set default start date to next week
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    setStartDate(nextWeek.toISOString().split("T")[0]);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/posts");
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const handleSchedule = async () => {
    if (!data?.linkedInConnected) {
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
        await fetchData();
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

    setIsDeleting(scheduleId);

    try {
      const response = await fetch(`/api/schedule/${scheduleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete schedule");
      }
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      alert("Failed to delete schedule. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  const startEditingSchedule = (post: Post) => {
    if (!post.schedule) return;

    const scheduledDate = new Date(post.schedule.scheduledFor);
    const dateStr = scheduledDate.toISOString().split("T")[0];
    const timeStr = scheduledDate.toTimeString().slice(0, 5);

    setEditingSchedule({
      scheduleId: post.schedule.id,
      postId: post.id,
      currentDate: dateStr,
      currentTime: timeStr,
      currentImageUrl: post.imageUrl,
    });
    setEditDate(dateStr);
    setEditTime(timeStr);
    setPreviewImage(post.imageUrl || null);
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return;

    setIsUpdating(true);

    try {
      // Combine date and time into ISO string
      const scheduledFor = new Date(`${editDate}T${editTime}:00`).toISOString();

      const response = await fetch(`/api/schedule/${editingSchedule.scheduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledFor,
          imageUrl: previewImage,
        }),
      });

      if (response.ok) {
        await fetchData();
        setEditingSchedule(null);
        setPreviewImage(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update schedule");
      }
    } catch (error) {
      console.error("Failed to update schedule:", error);
      alert("Failed to update schedule. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
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

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const { imageUrl } = await response.json();
      setPreviewImage(imageUrl);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
  };

  const draftPosts = data?.posts.filter((p) => p.status === "DRAFT") || [];
  const scheduledPosts = data?.posts.filter((p) => p.status === "SCHEDULED") || [];
  const postedPosts = data?.posts.filter((p) => p.status === "POSTED") || [];

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
            <Link href="/schedule" className="text-sm text-accent-coral font-medium">
              Schedule
            </Link>
            <Link href="/settings" className="text-sm text-claude-text-secondary hover:text-claude-text">
              Settings
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-claude-text mb-2">Schedule Posts</h1>
          <p className="text-claude-text-secondary">
            Set up automatic posting to your LinkedIn profile.
          </p>
        </div>

        {!data?.linkedInConnected && (
          <div className="mb-8 p-6 rounded-claude-lg bg-[#0077B5]/5 border border-[#0077B5]/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0077B5] text-white flex items-center justify-center flex-shrink-0">
                <LinkedInIcon />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-claude-text mb-1">
                  Connect LinkedIn to schedule posts
                </h3>
                <p className="text-sm text-claude-text-secondary mb-4">
                  Link your LinkedIn account to automatically publish your posts on schedule.
                </p>
                <Link href="/settings" className="btn-primary text-sm">
                  Connect LinkedIn
                </Link>
              </div>
            </div>
          </div>
        )}

        {draftPosts.length > 0 && data?.linkedInConnected && (
          <div className="card mb-8">
            <h2 className="text-lg font-semibold text-claude-text mb-4">
              Schedule {draftPosts.length} posts
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
              onClick={handleSchedule}
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

        {/* Scheduled Posts */}
        {scheduledPosts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-claude-text mb-4">
              Upcoming Posts ({scheduledPosts.length})
            </h2>
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
                <div key={post.id} className="card">
                  {editingSchedule?.scheduleId === post.schedule?.id ? (
                    // Edit mode
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-claude-text">Edit Schedule</h3>
                        <button
                          onClick={() => {
                            setEditingSchedule(null);
                            setPreviewImage(null);
                          }}
                          className="text-claude-text-secondary hover:text-claude-text"
                        >
                          <XIcon />
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Date</label>
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="label">Time</label>
                          <input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="input"
                          />
                        </div>
                      </div>

                      {/* Image upload section */}
                      <div>
                        <label className="label">Post Image</label>
                        {previewImage ? (
                          <div className="relative inline-block">
                            <img
                              src={previewImage}
                              alt="Post preview"
                              className="max-h-40 rounded-lg border border-claude-border"
                            />
                            <button
                              onClick={handleRemoveImage}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/80"
                            >
                              <XIcon />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingImage}
                              className="btn-ghost text-sm"
                            >
                              {uploadingImage ? (
                                <>
                                  <div className="animate-spin w-4 h-4 border-2 border-accent-coral border-t-transparent rounded-full" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <ImageIcon />
                                  Add Image
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-claude-text line-clamp-2">
                        {post.content.substring(0, 150)}...
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateSchedule}
                          disabled={isUpdating}
                          className="btn-primary text-sm"
                        >
                          {isUpdating ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingSchedule(null);
                            setPreviewImage(null);
                          }}
                          className="btn-ghost text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent-coral-light text-accent-coral flex items-center justify-center font-bold flex-shrink-0">
                        {post.weekNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <ClockIcon />
                          <span className="text-sm text-claude-text-secondary">
                            {post.schedule?.scheduledFor
                              ? new Date(post.schedule.scheduledFor).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })
                              : "Not scheduled"}
                          </span>
                          {post.imageUrl && (
                            <span className="text-xs bg-claude-bg-tertiary text-claude-text-secondary px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ImageIcon />
                              Image
                            </span>
                          )}
                        </div>
                        {post.imageUrl && (
                          <div className="mb-2">
                            <img
                              src={post.imageUrl}
                              alt="Post image"
                              className="max-h-24 rounded-lg border border-claude-border"
                            />
                          </div>
                        )}
                        <p className="text-sm text-claude-text line-clamp-2">
                          {post.content.substring(0, 150)}...
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditingSchedule(post)}
                          className="p-2 text-claude-text-secondary hover:text-claude-text hover:bg-claude-bg-tertiary rounded-lg transition-colors"
                          title="Edit schedule"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => post.schedule && handleDeleteSchedule(post.schedule.id)}
                          disabled={isDeleting === post.schedule?.id}
                          className="p-2 text-claude-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete from schedule"
                        >
                          {isDeleting === post.schedule?.id ? (
                            <div className="animate-spin w-4 h-4 border-2 border-error border-t-transparent rounded-full" />
                          ) : (
                            <TrashIcon />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posted */}
        {postedPosts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-claude-text mb-4">
              Posted ({postedPosts.length})
            </h2>
            <div className="space-y-4">
              {postedPosts.map((post) => (
                <div key={post.id} className="card bg-success/5 border-success/20">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-success mb-1">
                        Week {post.weekNumber} - Posted
                      </p>
                      {post.imageUrl && (
                        <div className="mb-2">
                          <img
                            src={post.imageUrl}
                            alt="Post image"
                            className="max-h-24 rounded-lg border border-success/20"
                          />
                        </div>
                      )}
                      <p className="text-sm text-claude-text line-clamp-2">
                        {post.content.substring(0, 150)}...
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data?.posts.length === 0 && (
          <div className="card text-center py-12">
            <div className="w-16 h-16 rounded-full bg-claude-bg-tertiary flex items-center justify-center mx-auto mb-4">
              <CalendarIcon />
            </div>
            <h2 className="text-xl font-semibold text-claude-text mb-2">
              No posts to schedule
            </h2>
            <p className="text-claude-text-secondary mb-6">
              Generate some posts first, then come back to schedule them.
            </p>
            <Link href="/onboarding" className="btn-primary">
              Create Posts
            </Link>
          </div>
        )}
      </main>

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
