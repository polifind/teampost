"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const ADMIN_EMAIL = "rohan.pavuluri@gmail.com";

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  domain: string | null;
  createdAt: string;
  _count: {
    members: number;
    notes: number;
  };
  members: Array<{
    email: string;
    user: { name: string | null } | null;
  }>;
}

// Icons
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function OrganizationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDescription, setNewOrgDescription] = useState("");
  const [newOrgDomain, setNewOrgDomain] = useState("");
  const [adminEmails, setAdminEmails] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      router.push("/dashboard");
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("/api/admin/organizations");
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data.organizations);
        }
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      fetchOrganizations();
    }
  }, [session]);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newOrgName.trim(),
          description: newOrgDescription.trim() || null,
          domain: newOrgDomain.trim().toLowerCase() || null,
          adminEmails: adminEmails
            .split(/[,\n]/)
            .map((e) => e.trim())
            .filter(Boolean),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrganizations((prev) => [data.organization, ...prev]);
        setShowCreateModal(false);
        setNewOrgName("");
        setNewOrgDescription("");
        setNewOrgDomain("");
        setAdminEmails("");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create organization");
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      alert("Failed to create organization");
    } finally {
      setCreating(false);
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
      {/* Create Organization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-claude-lg max-w-lg w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-claude-text">
                  Create Organization
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-claude-bg-tertiary rounded-claude"
                >
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={handleCreateOrganization}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-claude-text mb-1">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="Acme Corp"
                      className="input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-claude-text mb-1">
                      Description
                    </label>
                    <textarea
                      value={newOrgDescription}
                      onChange={(e) => setNewOrgDescription(e.target.value)}
                      placeholder="A brief description of the organization..."
                      className="input w-full h-20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-claude-text mb-1">
                      Email Domain (for auto-join)
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-claude-bg-secondary text-claude-text-secondary rounded-l-claude border border-r-0 border-claude-border">
                        @
                      </span>
                      <input
                        type="text"
                        value={newOrgDomain}
                        onChange={(e) => setNewOrgDomain(e.target.value.replace("@", ""))}
                        placeholder="company.com"
                        className="input w-full rounded-l-none"
                      />
                    </div>
                    <p className="text-xs text-claude-text-tertiary mt-1">
                      Users with this email domain will automatically join this organization.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-claude-text mb-1">
                      Admin Emails
                    </label>
                    <textarea
                      value={adminEmails}
                      onChange={(e) => setAdminEmails(e.target.value)}
                      placeholder="admin1@company.com, admin2@company.com"
                      className="input w-full h-20 resize-none"
                    />
                    <p className="text-xs text-claude-text-tertiary mt-1">
                      Separate multiple emails with commas or new lines. These users will be org admins.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newOrgName.trim()}
                    className="btn-primary"
                  >
                    {creating ? "Creating..." : "Create Organization"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 bg-claude-bg/80 backdrop-blur-md border-b border-claude-border z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo size="md" />
            </Link>
            <span className="px-2 py-1 bg-accent-coral text-white text-xs font-medium rounded">
              ADMIN
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/admin" className="text-sm text-claude-text-secondary hover:text-claude-text">
              Overview
            </Link>
            <Link href="/admin/organizations" className="text-sm text-accent-coral font-medium">
              Organizations
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-claude-text mb-2">
              Organizations
            </h1>
            <p className="text-claude-text-secondary">
              Manage company organizations and their members
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <PlusIcon />
            Create Organization
          </button>
        </div>

        {/* Organizations List */}
        {organizations.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-claude-bg-tertiary text-claude-text-tertiary flex items-center justify-center">
              <BuildingIcon />
            </div>
            <h3 className="text-lg font-semibold text-claude-text mb-2">
              No organizations yet
            </h3>
            <p className="text-claude-text-secondary mb-4">
              Create your first organization to start managing company teams.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <PlusIcon />
              Create Organization
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {organizations.map((org) => (
              <Link
                key={org.id}
                href={`/admin/organizations/${org.id}`}
                className="card-hover p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-claude-lg bg-accent-coral-light text-accent-coral flex items-center justify-center">
                      <BuildingIcon />
                    </div>
                    <div>
                      <h3 className="font-semibold text-claude-text">
                        {org.name}
                      </h3>
                      {org.description && (
                        <p className="text-sm text-claude-text-secondary line-clamp-1">
                          {org.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1 text-xs text-claude-text-tertiary">
                          <UsersIcon />
                          {org._count.members} members
                        </span>
                        <span className="flex items-center gap-1 text-xs text-claude-text-tertiary">
                          <DocumentIcon />
                          {org._count.notes} notes
                        </span>
                        {org.domain && (
                          <span className="px-2 py-0.5 bg-accent-coral/10 text-accent-coral text-xs rounded-full">
                            @{org.domain}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {org.members.length > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-claude-text-tertiary">Admins</p>
                        <p className="text-sm text-claude-text">
                          {org.members.map((m) => m.user?.name || m.email).join(", ")}
                        </p>
                      </div>
                    )}
                    <ArrowRightIcon />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
