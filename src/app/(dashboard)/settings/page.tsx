"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { TIMEZONES, DEFAULT_TIMEZONE } from "@/lib/timezones";

interface OrganizationMembership {
  id: string;
  name: string;
  role: "ADMIN" | "MEMBER";
}

interface SlackIntegration {
  id: string;
  teamName: string | null;
  isActive: boolean;
}

interface UserSettings {
  name: string;
  email: string;
  timezone: string;
  linkedInConnected: boolean;
  linkedInUserId?: string;
  organizations: OrganizationMembership[];
  slackIntegration?: SlackIntegration | null;
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

const SlackIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
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

  // Timezone state
  const [userTimezone, setUserTimezone] = useState<string>(DEFAULT_TIMEZONE);
  const [savingTimezone, setSavingTimezone] = useState(false);

  // Check for LinkedIn/Slack connection status from URL params
  useEffect(() => {
    const linkedinStatus = searchParams.get("linkedin");
    const slackStatus = searchParams.get("slack");

    if (linkedinStatus === "connected") {
      setMessage("LinkedIn connected successfully!");
      router.replace("/settings");
    } else if (linkedinStatus === "error") {
      setMessage("Failed to connect LinkedIn. Please try again.");
    }

    if (slackStatus === "success") {
      setMessage("Slack connected successfully! You can now DM the TeamPost bot.");
      router.replace("/settings");
    } else if (slackStatus === "error") {
      const errorMessage = searchParams.get("message");
      setMessage(`Failed to connect Slack: ${errorMessage || "Please try again."}`);
      router.replace("/settings");
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
          setUserTimezone(data.timezone || DEFAULT_TIMEZONE);
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

  const handleTimezoneChange = async (newTimezone: string) => {
    setSavingTimezone(true);
    setUserTimezone(newTimezone);
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone: newTimezone }),
      });
      if (response.ok) {
        setMessage("Timezone saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to save timezone:", error);
    } finally {
      setSavingTimezone(false);
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
    <>
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

        {/* Slack Integration */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#4A154B] text-white flex items-center justify-center">
              <SlackIcon />
            </div>
            <h2 className="text-lg font-semibold text-claude-text">Slack Integration</h2>
          </div>

          {settings?.slackIntegration?.isActive ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-success">
                <CheckIcon />
                <span className="font-medium">Connected to {settings.slackIntegration.teamName || "Slack"}</span>
              </div>
              <p className="text-sm text-claude-text-secondary">
                DM the TeamPost bot in Slack to create LinkedIn posts. Just send your ideas and include a schedule like &quot;Monday at 9am EST&quot;.
              </p>
              <button
                onClick={async () => {
                  if (!confirm("Are you sure you want to disconnect Slack?")) return;
                  try {
                    const response = await fetch("/api/slack/disconnect", { method: "POST" });
                    if (response.ok) {
                      setSettings((prev) => prev ? { ...prev, slackIntegration: null } : null);
                      setMessage("Slack disconnected.");
                    }
                  } catch (error) {
                    console.error("Failed to disconnect Slack:", error);
                  }
                }}
                className="btn-ghost text-error hover:bg-error/10"
              >
                Disconnect Slack
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-claude-text-secondary">
                Connect Slack to create LinkedIn posts from anywhere. Just DM the TeamPost bot with your ideas.
              </p>
              <a
                href="/api/slack/install"
                className="btn-primary bg-[#4A154B] hover:bg-[#3d1140] inline-flex items-center gap-2"
              >
                <SlackIcon />
                Add to Slack
              </a>
            </div>
          )}
        </div>

        {/* Timezone Settings */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <GlobeIcon />
            </div>
            <h2 className="text-lg font-semibold text-claude-text">Timezone</h2>
          </div>

          <p className="text-sm text-claude-text-secondary mb-4">
            Set your timezone for accurate scheduling. All scheduled posts will use this timezone.
          </p>

          <div className="relative">
            <select
              value={userTimezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              disabled={savingTimezone}
              className="input w-full appearance-none pr-10"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {savingTimezone ? (
                <div className="w-4 h-4 border-2 border-accent-coral border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-claude-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>
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
    </>
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
