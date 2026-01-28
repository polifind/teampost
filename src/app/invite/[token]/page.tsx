"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import Logo from "@/components/Logo";

interface InviteData {
  organization: {
    id: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
  };
  email: string;
  role: "ADMIN" | "MEMBER";
  invitedBy: {
    name: string | null;
    email: string;
  } | null;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = params.token as string;

  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [expired, setExpired] = useState(false);
  const [alreadyAccepted, setAlreadyAccepted] = useState(false);

  // Fetch invite details
  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/invite/${token}`);
        const data = await res.json();

        if (!res.ok) {
          if (data.expired) {
            setExpired(true);
          } else if (data.alreadyAccepted) {
            setAlreadyAccepted(true);
          }
          setError(data.error || "Failed to load invite");
          return;
        }

        setInviteData(data);
      } catch (err) {
        setError("Failed to load invite");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchInvite();
    }
  }, [token]);

  // Accept invite when user is logged in
  const handleAcceptInvite = async () => {
    if (!session) return;

    setAccepting(true);
    try {
      const res = await fetch(`/api/invite/${token}`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to accept invite");
        return;
      }

      // Redirect to dashboard with success message
      router.push("/dashboard?joined=" + encodeURIComponent(data.organization.name));
    } catch (err) {
      setError("Failed to accept invite");
    } finally {
      setAccepting(false);
    }
  };

  const handleSignIn = (provider: string) => {
    // Store the invite token to redirect back after auth
    signIn(provider, { callbackUrl: `/invite/${token}` });
  };

  // Get inviter display name
  const getInviterName = () => {
    if (!inviteData?.invitedBy) return "Someone";
    return inviteData.invitedBy.name || inviteData.invitedBy.email.split("@")[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-claude-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-coral border-t-transparent rounded-full" />
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-claude-bg flex flex-col">
        <header className="p-6">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <Logo size="md" />
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-claude-text mb-2">Invite Expired</h1>
            <p className="text-claude-text-secondary mb-6">
              This invite link has expired. Please ask the organization admin to send you a new invite.
            </p>
            <Link href="/" className="btn-primary inline-block">
              Go to Homepage
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (alreadyAccepted) {
    return (
      <div className="min-h-screen bg-claude-bg flex flex-col">
        <header className="p-6">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <Logo size="md" />
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-claude-text mb-2">Already Accepted</h1>
            <p className="text-claude-text-secondary mb-6">
              This invite has already been accepted. You can access your organization from your dashboard.
            </p>
            <Link href="/dashboard" className="btn-primary inline-block">
              Go to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="min-h-screen bg-claude-bg flex flex-col">
        <header className="p-6">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <Logo size="md" />
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-claude-text mb-2">Invite Not Found</h1>
            <p className="text-claude-text-secondary mb-6">
              {error || "This invite link is invalid or has been revoked."}
            </p>
            <Link href="/" className="btn-primary inline-block">
              Go to Homepage
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-claude-bg flex flex-col">
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Logo size="md" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Organization Logo */}
          {inviteData.organization.logoUrl && (
            <div className="flex justify-center mb-6">
              <img
                src={inviteData.organization.logoUrl}
                alt={inviteData.organization.name}
                className="w-20 h-20 rounded-2xl object-cover"
              />
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-claude-text mb-3">
              You&apos;ve been invited to join {inviteData.organization.name}
            </h1>
            <p className="text-claude-text-secondary">
              <span className="font-medium text-claude-text">{getInviterName()}</span> from{" "}
              <span className="font-medium text-claude-text">{inviteData.organization.name}</span>{" "}
              invited you to join their organization on TeamPost.
            </p>
          </div>

          {/* TeamPost Description Card */}
          <div className="card mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-coral to-accent-coral/80 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-claude-text">What is TeamPost?</h3>
                <p className="text-sm text-claude-text-secondary mt-1">
                  TeamPost helps professionals create and schedule authentic LinkedIn content.
                  Share your ideas through voice notes or chat, and we&apos;ll help you craft
                  engaging posts that sound like you. Your organization uses TeamPost to
                  coordinate team content and amplify your company&apos;s voice.
                </p>
              </div>
            </div>

            {inviteData.organization.description && (
              <div className="pt-4 border-t border-claude-border">
                <p className="text-sm text-claude-text-secondary">
                  <span className="font-medium text-claude-text">About {inviteData.organization.name}:</span>{" "}
                  {inviteData.organization.description}
                </p>
              </div>
            )}
          </div>

          {/* Role Badge */}
          <div className="flex justify-center mb-6">
            <span className="px-3 py-1 rounded-full text-sm bg-accent-coral/10 text-accent-coral">
              You&apos;ll join as {inviteData.role === "ADMIN" ? "an Admin" : "a Member"}
            </span>
          </div>

          {/* Action Section */}
          {status === "loading" ? (
            <div className="flex justify-center">
              <div className="animate-spin w-6 h-6 border-2 border-accent-coral border-t-transparent rounded-full" />
            </div>
          ) : session ? (
            <div className="space-y-4">
              <div className="p-4 rounded-claude bg-claude-bg-secondary text-center">
                <p className="text-sm text-claude-text-secondary mb-1">Signed in as</p>
                <p className="font-medium text-claude-text">{session.user?.email}</p>
              </div>
              <button
                onClick={handleAcceptInvite}
                disabled={accepting}
                className="w-full btn-primary"
              >
                {accepting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Accepting invite...
                  </span>
                ) : (
                  `Accept Invite & Join ${inviteData.organization.name}`
                )}
              </button>
              <p className="text-center text-sm text-claude-text-tertiary">
                Not you?{" "}
                <button
                  onClick={() => signIn(undefined, { callbackUrl: `/invite/${token}` })}
                  className="link"
                >
                  Sign in with a different account
                </button>
              </p>
            </div>
          ) : (
            <div className="card">
              <p className="text-center text-claude-text-secondary mb-4">
                Sign in or create an account to accept this invite
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => handleSignIn("google")}
                  className="w-full btn-secondary"
                  type="button"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
                <button
                  onClick={() => handleSignIn("linkedin")}
                  className="w-full btn-secondary"
                  type="button"
                >
                  <LinkedInIcon />
                  Continue with LinkedIn
                </button>
              </div>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-claude-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-claude-text-tertiary">
                    or
                  </span>
                </div>
              </div>
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
                className="w-full btn-secondary block text-center"
              >
                Sign in with Email
              </Link>
              <p className="text-center text-sm text-claude-text-tertiary mt-4">
                Don&apos;t have an account?{" "}
                <Link
                  href={`/signup?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
                  className="link"
                >
                  Sign up
                </Link>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
