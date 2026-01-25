"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const ADMIN_EMAIL = "rohan.pavuluri@gmail.com";

interface AdminStats {
  overview: {
    totalUsers: number;
    totalPosts: number;
    totalScheduled: number;
    totalPosted: number;
    totalVoiceNotes: number;
    linkedInConnectedCount: number;
    onboardingCompletedCount: number;
    usersWithPosts: number;
    avgPostsPerUser: string;
  };
  engagement: {
    totalLikes: number;
    totalComments: number;
    totalShares: number;
  };
  charts: {
    usersByDay: Array<{ date: string; count: number }>;
    postsByDay: Array<{ date: string; count: number }>;
  };
  postsByStatus: Record<string, number>;
  topUsers: Array<{
    id: string;
    email: string;
    name: string | null;
    _count: { posts: number };
  }>;
  recentUsers: Array<{
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    onboardingCompleted: boolean;
    hasLinkedIn: boolean;
    _count: { posts: number; voiceNotes: number };
  }>;
  recentPosts: Array<{
    id: string;
    contentPreview: string;
    status: string;
    createdAt: string;
    user: { email: string; name: string | null };
  }>;
}

// Icons
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const MicIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

// Simple bar chart component
function SimpleBarChart({
  data,
  label,
  color = "bg-accent-coral"
}: {
  data: Array<{ date: string; count: number }>;
  label: string;
  color?: string;
}) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  // Fill in missing days
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const existing = data.find(d => d.date.split('T')[0] === dateStr);
    last30Days.push({
      date: dateStr,
      count: existing?.count || 0,
      dayLabel: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    });
  }

  const total = last30Days.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-claude-text">{label}</h3>
        <span className="text-2xl font-bold text-claude-text">{total}</span>
      </div>
      <p className="text-sm text-claude-text-secondary mb-4">Last 30 days</p>
      <div className="flex items-end gap-0.5 h-24">
        {last30Days.map((d, i) => (
          <div
            key={i}
            className="flex-1 group relative"
            title={`${d.dayLabel}: ${d.count}`}
          >
            <div
              className={`${color} rounded-t transition-all hover:opacity-80`}
              style={{
                height: `${Math.max((d.count / maxCount) * 100, d.count > 0 ? 8 : 2)}%`,
                minHeight: d.count > 0 ? '4px' : '1px'
              }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-claude-text text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {d.dayLabel}: {d.count}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-claude-text-tertiary">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.email !== ADMIN_EMAIL) {
      router.push("/dashboard");
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/dashboard");
            return;
          }
          throw new Error("Failed to fetch stats");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError("Failed to load admin stats");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email === ADMIN_EMAIL) {
      fetchStats();
    }
  }, [session, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-claude-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-coral border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-claude-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-error mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-claude-bg">
      {/* Header */}
      <header className="sticky top-0 bg-claude-bg/80 backdrop-blur-md border-b border-claude-border z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo size="md" />
            </Link>
            <span className="px-2 py-1 bg-accent-coral text-white text-xs font-medium rounded">
              ADMIN
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-claude-text-secondary hover:text-claude-text">
              Dashboard
            </Link>
            <Link href="/admin" className="text-sm text-accent-coral font-medium">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-claude-text mb-2">
            Admin Dashboard
          </h1>
          <p className="text-claude-text-secondary">
            TeamPost platform overview and analytics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-claude bg-blue-100 text-blue-600 flex items-center justify-center">
                <UsersIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-claude-text">{stats.overview.totalUsers}</p>
                <p className="text-xs text-claude-text-secondary">Total Users</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-claude bg-accent-coral-light text-accent-coral flex items-center justify-center">
                <DocumentIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-claude-text">{stats.overview.totalPosts}</p>
                <p className="text-xs text-claude-text-secondary">Total Posts</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-claude bg-purple-100 text-purple-600 flex items-center justify-center">
                <MicIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-claude-text">{stats.overview.totalVoiceNotes}</p>
                <p className="text-xs text-claude-text-secondary">Voice Notes</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-claude bg-warning-light text-warning flex items-center justify-center">
                <CalendarIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-claude-text">{stats.overview.totalScheduled}</p>
                <p className="text-xs text-claude-text-secondary">Scheduled</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-claude bg-success-light text-success flex items-center justify-center">
                <CheckCircleIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-claude-text">{stats.overview.totalPosted}</p>
                <p className="text-xs text-claude-text-secondary">Posted</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-claude bg-[#0077B5]/10 text-[#0077B5] flex items-center justify-center">
                <LinkedInIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-claude-text">{stats.overview.linkedInConnectedCount}</p>
                <p className="text-xs text-claude-text-secondary">LinkedIn Connected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <SimpleBarChart
            data={stats.charts.usersByDay}
            label="New Users"
            color="bg-blue-500"
          />
          <SimpleBarChart
            data={stats.charts.postsByDay}
            label="Posts Created"
            color="bg-accent-coral"
          />
        </div>

        {/* Conversion & Engagement Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Funnel Stats */}
          <div className="card">
            <h3 className="font-semibold text-claude-text mb-4 flex items-center gap-2">
              <ChartIcon />
              User Funnel
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-claude-text-secondary">Signed Up</span>
                <span className="font-medium">{stats.overview.totalUsers}</span>
              </div>
              <div className="w-full bg-claude-bg-tertiary rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }} />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-claude-text-secondary">Completed Onboarding</span>
                <span className="font-medium">{stats.overview.onboardingCompletedCount}</span>
              </div>
              <div className="w-full bg-claude-bg-tertiary rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${stats.overview.totalUsers > 0 ? (stats.overview.onboardingCompletedCount / stats.overview.totalUsers) * 100 : 0}%` }}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-claude-text-secondary">Created Posts</span>
                <span className="font-medium">{stats.overview.usersWithPosts}</span>
              </div>
              <div className="w-full bg-claude-bg-tertiary rounded-full h-2">
                <div
                  className="bg-accent-coral h-2 rounded-full"
                  style={{ width: `${stats.overview.totalUsers > 0 ? (stats.overview.usersWithPosts / stats.overview.totalUsers) * 100 : 0}%` }}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-claude-text-secondary">Connected LinkedIn</span>
                <span className="font-medium">{stats.overview.linkedInConnectedCount}</span>
              </div>
              <div className="w-full bg-claude-bg-tertiary rounded-full h-2">
                <div
                  className="bg-[#0077B5] h-2 rounded-full"
                  style={{ width: `${stats.overview.totalUsers > 0 ? (stats.overview.linkedInConnectedCount / stats.overview.totalUsers) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Post Status Breakdown */}
          <div className="card">
            <h3 className="font-semibold text-claude-text mb-4">Post Status Breakdown</h3>
            <div className="space-y-3">
              {[
                { status: 'DRAFT', label: 'Drafts', color: 'bg-gray-400' },
                { status: 'SCHEDULED', label: 'Scheduled', color: 'bg-warning' },
                { status: 'POSTED', label: 'Posted', color: 'bg-success' },
                { status: 'FAILED', label: 'Failed', color: 'bg-error' },
              ].map(({ status, label, color }) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-sm text-claude-text-secondary">{label}</span>
                  </div>
                  <span className="font-medium">{stats.postsByStatus[status] || 0}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-claude-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-claude-text-secondary">Avg Posts/User</span>
                <span className="font-medium">{stats.overview.avgPostsPerUser}</span>
              </div>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="card">
            <h3 className="font-semibold text-claude-text mb-4">LinkedIn Engagement</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-claude bg-red-100 text-red-500 flex items-center justify-center">
                  <HeartIcon />
                </div>
                <div>
                  <p className="text-xl font-bold text-claude-text">{stats.engagement.totalLikes}</p>
                  <p className="text-xs text-claude-text-secondary">Total Likes</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-claude bg-blue-100 text-blue-500 flex items-center justify-center">
                  <ChatIcon />
                </div>
                <div>
                  <p className="text-xl font-bold text-claude-text">{stats.engagement.totalComments}</p>
                  <p className="text-xs text-claude-text-secondary">Total Comments</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-claude bg-green-100 text-green-500 flex items-center justify-center">
                  <ShareIcon />
                </div>
                <div>
                  <p className="text-xl font-bold text-claude-text">{stats.engagement.totalShares}</p>
                  <p className="text-xs text-claude-text-secondary">Total Shares</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="card">
            <h3 className="font-semibold text-claude-text mb-4">Recent Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-claude-border">
                    <th className="text-left py-2 text-claude-text-secondary font-medium">User</th>
                    <th className="text-left py-2 text-claude-text-secondary font-medium">Posts</th>
                    <th className="text-left py-2 text-claude-text-secondary font-medium">Status</th>
                    <th className="text-left py-2 text-claude-text-secondary font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-claude-border last:border-0">
                      <td className="py-2">
                        <div>
                          <p className="font-medium text-claude-text">{user.name || 'No name'}</p>
                          <p className="text-xs text-claude-text-tertiary">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-2 text-claude-text">{user._count.posts}</td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          {user.onboardingCompleted && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs rounded">
                              Onboarded
                            </span>
                          )}
                          {user.hasLinkedIn && (
                            <span className="px-1.5 py-0.5 bg-[#0077B5]/10 text-[#0077B5] text-xs rounded">
                              LinkedIn
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 text-claude-text-secondary text-xs">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="card">
            <h3 className="font-semibold text-claude-text mb-4">Recent Posts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-claude-border">
                    <th className="text-left py-2 text-claude-text-secondary font-medium">Preview</th>
                    <th className="text-left py-2 text-claude-text-secondary font-medium">User</th>
                    <th className="text-left py-2 text-claude-text-secondary font-medium">Status</th>
                    <th className="text-left py-2 text-claude-text-secondary font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPosts.map((post) => (
                    <tr key={post.id} className="border-b border-claude-border last:border-0">
                      <td className="py-2 max-w-[200px]">
                        <p className="text-claude-text truncate">{post.contentPreview}</p>
                      </td>
                      <td className="py-2 text-claude-text-secondary text-xs">
                        {post.user.name || post.user.email}
                      </td>
                      <td className="py-2">
                        <span className={`px-1.5 py-0.5 text-xs rounded ${
                          post.status === 'POSTED' ? 'bg-success-light text-success' :
                          post.status === 'SCHEDULED' ? 'bg-warning-light text-warning' :
                          post.status === 'FAILED' ? 'bg-error/10 text-error' :
                          'bg-claude-bg-tertiary text-claude-text-secondary'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="py-2 text-claude-text-secondary text-xs">
                        {formatDate(post.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Users */}
        <div className="mt-6">
          <div className="card">
            <h3 className="font-semibold text-claude-text mb-4">Top Users by Post Count</h3>
            <div className="flex gap-4 flex-wrap">
              {stats.topUsers.map((user, i) => (
                <div key={user.id} className="flex items-center gap-3 p-3 bg-claude-bg-secondary rounded-claude">
                  <span className="text-lg font-bold text-claude-text-tertiary">#{i + 1}</span>
                  <div>
                    <p className="font-medium text-claude-text">{user.name || user.email}</p>
                    <p className="text-sm text-claude-text-secondary">{user._count.posts} posts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
