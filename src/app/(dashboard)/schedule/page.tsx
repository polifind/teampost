"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

interface Post {
  id: string;
  content: string;
  weekNumber: number;
  status: "DRAFT" | "SCHEDULED" | "POSTED" | "FAILED";
  schedule?: {
    scheduledFor: string;
    status: string;
  };
}

interface ScheduleData {
  posts: Post[];
  linkedInConnected: boolean;
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

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIMES = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export default function SchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [selectedDay, setSelectedDay] = useState("Tuesday");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [startDate, setStartDate] = useState("");

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

  useEffect(() => {
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
        // Refresh data
        const postsResponse = await fetch("/api/posts");
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setData(postsData);
        }
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
                      </div>
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
    </div>
  );
}
