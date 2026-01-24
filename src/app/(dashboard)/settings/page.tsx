"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

interface UserSettings {
  name: string;
  email: string;
  linkedInConnected: boolean;
  linkedInUserId?: string;
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

function SettingsForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

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
