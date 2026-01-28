"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const ADMIN_EMAIL = "rohan.pavuluri@gmail.com";

interface Member {
  id: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  userId: string | null;
  joinedAt: string | null;
  inviteStatus: "PENDING" | "ACCEPTED" | "EXPIRED" | null;
  invitedAt: string | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    onboardingCompleted: boolean;
    linkedinAccessToken: string | null;
    _count: { posts: number };
  } | null;
}

interface Note {
  id: string;
  title: string;
  content: string;
  weekStart: string | null;
  isPinned: boolean;
  createdAt: string;
  createdBy: {
    name: string | null;
    email: string;
  };
}

interface AdminPost {
  id: string;
  content: string;
  imageUrl: string | null;
  status: "DRAFT" | "SCHEDULED" | "POSTED" | "FAILED";
  bulkDraftGroupId: string | null;
  bulkDraftStatus: "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    linkedinAccessToken: string | null;
  };
  createdByAdmin: {
    id: string;
    name: string | null;
    email: string;
  };
  schedule: {
    id: string;
    scheduledFor: string;
    status: string;
  } | null;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  members: Member[];
  notes: Note[];
}

// Icons
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PinIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const EnvelopeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);

const UserPlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
  </svg>
);

export default function OrganizationDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"members" | "notes" | "posts">("members");

  // Posts state
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postFilter, setPostFilter] = useState<string>("all");

  // Member form
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [addingMember, setAddingMember] = useState(false);

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [inviteSendEmail, setInviteSendEmail] = useState(false);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  // Note form
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteWeekStart, setNoteWeekStart] = useState("");
  const [notePinned, setNotePinned] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  // Post creation form
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postScheduleDate, setPostScheduleDate] = useState("");
  const [postScheduleTime, setPostScheduleTime] = useState("08:55");
  const [creatingPost, setCreatingPost] = useState(false);
  const [lastCreatedPost, setLastCreatedPost] = useState<AdminPost | null>(null);

  // Bulk variations form
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkTargetMemberIds, setBulkTargetMemberIds] = useState<string[]>([]);
  const [bulkVariationContext, setBulkVariationContext] = useState("");
  const [generatingBulk, setGeneratingBulk] = useState(false);

  // Bulk approval state
  const [pendingApprovals, setPendingApprovals] = useState<AdminPost[]>([]);
  const [bulkGroupId, setBulkGroupId] = useState<string | null>(null);
  const [showBulkApproval, setShowBulkApproval] = useState(false);
  const [bulkScheduleDate, setBulkScheduleDate] = useState("");
  const [bulkScheduleTime, setBulkScheduleTime] = useState("08:55");
  const [approvingBulk, setApprovingBulk] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

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
    const fetchOrganization = async () => {
      try {
        const response = await fetch(`/api/admin/organizations/${orgId}`);
        if (response.ok) {
          const data = await response.json();
          setOrganization(data.organization);
        } else {
          router.push("/admin/organizations");
        }
      } catch (error) {
        console.error("Failed to fetch organization:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && orgId) {
      fetchOrganization();
    }
  }, [session, orgId, router]);

  // Fetch posts when posts tab is active
  useEffect(() => {
    const fetchPosts = async () => {
      if (activeTab !== "posts" || !orgId) return;

      setPostsLoading(true);
      try {
        let url = `/api/admin/organizations/${orgId}/posts`;
        if (postFilter === "pending") {
          url += "?bulkDraftStatus=PENDING_APPROVAL";
        } else if (postFilter === "scheduled") {
          url += "?status=SCHEDULED";
        } else if (postFilter === "posted") {
          url += "?status=POSTED";
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [activeTab, orgId, postFilter]);

  // Helper to get next Monday
  const getNextMonday = (): Date => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 7 : 8 - dayOfWeek;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(8, 55, 0, 0);
    return nextMonday;
  };

  // Initialize schedule date when modal opens
  useEffect(() => {
    if (showCreatePost && !postScheduleDate) {
      const nextMonday = getNextMonday();
      setPostScheduleDate(nextMonday.toISOString().split("T")[0]);
    }
  }, [showCreatePost, postScheduleDate]);

  useEffect(() => {
    if (showBulkApproval && !bulkScheduleDate) {
      const nextMonday = getNextMonday();
      setBulkScheduleDate(nextMonday.toISOString().split("T")[0]);
    }
  }, [showBulkApproval, bulkScheduleDate]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setAddingMember(true);
    try {
      const response = await fetch(`/api/admin/organizations/${orgId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newMemberEmail.trim(),
          role: newMemberRole,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrganization((prev) =>
          prev ? { ...prev, members: [...prev.members, data.member] } : null
        );
        setShowAddMember(false);
        setNewMemberEmail("");
        setNewMemberRole("MEMBER");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add member");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const response = await fetch(`/api/admin/organizations/${orgId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });

      if (response.ok) {
        setOrganization((prev) =>
          prev ? { ...prev, members: prev.members.filter((m) => m.id !== memberId) } : null
        );
      }
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleToggleRole = async (memberId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "MEMBER" : "ADMIN";

    try {
      const response = await fetch(`/api/admin/organizations/${orgId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role: newRole }),
      });

      if (response.ok) {
        setOrganization((prev) =>
          prev
            ? {
                ...prev,
                members: prev.members.map((m) =>
                  m.id === memberId ? { ...m, role: newRole as "ADMIN" | "MEMBER" } : m
                ),
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error updating member:", error);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setCreatingInvite(true);
    setGeneratedInviteUrl(null);
    try {
      const response = await fetch(`/api/admin/organizations/${orgId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
          sendEmail: inviteSendEmail,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedInviteUrl(data.inviteUrl);

        // Refresh organization to show new pending member
        const orgResponse = await fetch(`/api/admin/organizations/${orgId}`);
        if (orgResponse.ok) {
          const orgData = await orgResponse.json();
          setOrganization(orgData.organization);
        }
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create invite");
      }
    } catch (error) {
      console.error("Error creating invite:", error);
      alert("Failed to create invite");
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleCopyInviteLink = async () => {
    if (generatedInviteUrl) {
      await navigator.clipboard.writeText(generatedInviteUrl);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    }
  };

  const resetInviteModal = () => {
    setShowInviteModal(false);
    setInviteEmail("");
    setInviteRole("MEMBER");
    setInviteSendEmail(false);
    setGeneratedInviteUrl(null);
    setInviteCopied(false);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    setAddingNote(true);
    try {
      const response = await fetch(`/api/admin/organizations/${orgId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noteTitle.trim(),
          content: noteContent.trim(),
          weekStart: noteWeekStart || null,
          isPinned: notePinned,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrganization((prev) =>
          prev ? { ...prev, notes: [data.note, ...prev.notes] } : null
        );
        setShowAddNote(false);
        setNoteTitle("");
        setNoteContent("");
        setNoteWeekStart("");
        setNotePinned(false);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create note");
      }
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Failed to create note");
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await fetch(`/api/admin/organizations/${orgId}/notes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });

      if (response.ok) {
        setOrganization((prev) =>
          prev ? { ...prev, notes: prev.notes.filter((n) => n.id !== noteId) } : null
        );
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Post handlers
  const handleCreatePost = async (e: React.FormEvent, schedule: boolean = false) => {
    e.preventDefault();
    if (!selectedMemberId || !postContent.trim()) return;

    setCreatingPost(true);
    try {
      const body: any = {
        targetMemberId: selectedMemberId,
        content: postContent.trim(),
      };

      if (schedule && postScheduleDate) {
        const scheduledDate = new Date(`${postScheduleDate}T${postScheduleTime}:00`);
        body.scheduledFor = scheduledDate.toISOString();
      }

      const response = await fetch(`/api/admin/organizations/${orgId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        setPosts((prev) => [data.post, ...prev]);
        setLastCreatedPost(data.post);
        setShowCreatePost(false);
        setPostContent("");
        setSelectedMemberId("");
        setPostScheduleDate("");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    } finally {
      setCreatingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/admin/organizations/${orgId}/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleGenerateBulkVariations = async () => {
    if (!lastCreatedPost || bulkTargetMemberIds.length === 0) return;

    setGeneratingBulk(true);
    try {
      const response = await fetch(`/api/admin/organizations/${orgId}/posts/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceContent: lastCreatedPost.content,
          targetMemberIds: bulkTargetMemberIds,
          variationContext: bulkVariationContext || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPendingApprovals(data.posts);
        setBulkGroupId(data.bulkDraftGroupId);
        setShowBulkModal(false);
        setShowBulkApproval(true);
        setBulkTargetMemberIds([]);
        setBulkVariationContext("");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to generate variations");
      }
    } catch (error) {
      console.error("Error generating variations:", error);
      alert("Failed to generate variations");
    } finally {
      setGeneratingBulk(false);
    }
  };

  const handleApprovePost = async (postId: string, approved: boolean) => {
    if (!bulkGroupId) return;

    try {
      const body: any = {
        approvals: [{
          postId,
          approved,
          content: editingPostId === postId ? editingContent : undefined,
        }],
      };

      // If approving and schedule date is set, include it
      if (approved && bulkScheduleDate) {
        const scheduledDate = new Date(`${bulkScheduleDate}T${bulkScheduleTime}:00`);
        body.approvals[0].scheduledFor = scheduledDate.toISOString();
      }

      const response = await fetch(`/api/admin/organizations/${orgId}/posts/bulk/${bulkGroupId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        setPendingApprovals(data.remainingPosts.filter((p: AdminPost) => p.bulkDraftStatus === "PENDING_APPROVAL"));

        // Add approved posts to main list
        const approvedPosts = data.remainingPosts.filter((p: AdminPost) => p.bulkDraftStatus === "APPROVED");
        setPosts((prev) => [...approvedPosts, ...prev.filter((p) => !approvedPosts.some((ap: AdminPost) => ap.id === p.id))]);

        setEditingPostId(null);
        setEditingContent("");

        if (data.remainingPosts.filter((p: AdminPost) => p.bulkDraftStatus === "PENDING_APPROVAL").length === 0) {
          setShowBulkApproval(false);
          setBulkGroupId(null);
        }
      }
    } catch (error) {
      console.error("Error approving post:", error);
    }
  };

  const handleApproveAll = async () => {
    if (!bulkGroupId || pendingApprovals.length === 0) return;

    setApprovingBulk(true);
    try {
      const scheduledDate = bulkScheduleDate ? new Date(`${bulkScheduleDate}T${bulkScheduleTime}:00`).toISOString() : undefined;

      const approvals = pendingApprovals.map((p) => ({
        postId: p.id,
        approved: true,
        scheduledFor: scheduledDate,
      }));

      const response = await fetch(`/api/admin/organizations/${orgId}/posts/bulk/${bulkGroupId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvals }),
      });

      if (response.ok) {
        const data = await response.json();
        setPendingApprovals([]);
        setShowBulkApproval(false);
        setBulkGroupId(null);

        // Add all approved posts to main list
        const approvedPosts = data.remainingPosts.filter((p: AdminPost) => p.bulkDraftStatus === "APPROVED");
        setPosts((prev) => [...approvedPosts, ...prev.filter((p) => !approvedPosts.some((ap: AdminPost) => ap.id === p.id))]);
      }
    } catch (error) {
      console.error("Error approving all:", error);
    } finally {
      setApprovingBulk(false);
    }
  };

  const eligibleMembers = organization?.members.filter(
    (m) => m.userId && m.user && m.user.linkedinAccessToken
  ) || [];

  const handleTogglePin = async (noteId: string, currentPinned: boolean) => {
    try {
      const response = await fetch(`/api/admin/organizations/${orgId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, isPinned: !currentPinned }),
      });

      if (response.ok) {
        setOrganization((prev) =>
          prev
            ? {
                ...prev,
                notes: prev.notes.map((n) =>
                  n.id === noteId ? { ...n, isPinned: !currentPinned } : n
                ),
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-claude-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-coral border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!organization) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-claude-bg">
      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-claude-lg max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-claude-text">Add Member</h2>
                <button onClick={() => setShowAddMember(false)} className="p-2 hover:bg-claude-bg-tertiary rounded-claude">
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={handleAddMember}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-claude-text mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="employee@company.com"
                      className="input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-claude-text mb-1">
                      Role
                    </label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value as "ADMIN" | "MEMBER")}
                      className="input w-full"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <p className="text-xs text-claude-text-tertiary mt-1">
                      Admins can manage members and create organization-wide notes.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setShowAddMember(false)} className="btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" disabled={addingMember || !newMemberEmail.trim()} className="btn-primary">
                    {addingMember ? "Adding..." : "Add Member"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-claude-lg max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-coral/10 rounded-full flex items-center justify-center">
                    <UserPlusIcon />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-claude-text">Invite to {organization?.name}</h2>
                    <p className="text-sm text-claude-text-secondary">Send an invitation link</p>
                  </div>
                </div>
                <button onClick={resetInviteModal} className="p-2 hover:bg-claude-bg-tertiary rounded-claude">
                  <CloseIcon />
                </button>
              </div>

              {!generatedInviteUrl ? (
                <form onSubmit={handleCreateInvite}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-claude-text mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="employee@company.com"
                        className="input w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-claude-text mb-1">
                        Role
                      </label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "MEMBER")}
                        className="input w-full"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <p className="text-xs text-claude-text-tertiary mt-1">
                        Admins can manage members and create organization-wide notes.
                      </p>
                    </div>

                    <label className="flex items-center gap-3 p-3 border border-claude-border rounded-claude cursor-pointer hover:bg-claude-bg-secondary">
                      <input
                        type="checkbox"
                        checked={inviteSendEmail}
                        onChange={(e) => setInviteSendEmail(e.target.checked)}
                        className="w-4 h-4 rounded border-claude-border text-accent-coral focus:ring-accent-coral"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-claude-text flex items-center gap-2">
                          <EnvelopeIcon />
                          Send invitation email
                        </p>
                        <p className="text-xs text-claude-text-tertiary">
                          We&apos;ll email the invite link to this person
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={resetInviteModal} className="btn-ghost">
                      Cancel
                    </button>
                    <button type="submit" disabled={creatingInvite || !inviteEmail.trim()} className="btn-primary">
                      {creatingInvite ? "Creating..." : "Generate Invite Link"}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="p-4 bg-success/5 border border-success/20 rounded-claude mb-4">
                    <div className="flex items-center gap-2 text-success mb-2">
                      <CheckIcon />
                      <span className="font-medium">Invite Created!</span>
                    </div>
                    <p className="text-sm text-claude-text-secondary">
                      {inviteSendEmail
                        ? `An invitation email has been sent to ${inviteEmail}.`
                        : `Share this link with ${inviteEmail} to invite them.`}
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-claude-text mb-2">
                      Invite Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={generatedInviteUrl}
                        readOnly
                        className="input flex-1 text-sm bg-claude-bg-secondary"
                      />
                      <button
                        onClick={handleCopyInviteLink}
                        className={`btn-secondary px-3 ${inviteCopied ? "text-success" : ""}`}
                      >
                        {inviteCopied ? <CheckIcon /> : <CopyIcon />}
                      </button>
                    </div>
                    <p className="text-xs text-claude-text-tertiary mt-2">
                      This link expires in 7 days.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button onClick={resetInviteModal} className="btn-primary">
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-claude-lg max-w-lg w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-claude-text">Create Organization Note</h2>
                <button onClick={() => setShowAddNote(false)} className="p-2 hover:bg-claude-bg-tertiary rounded-claude">
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={handleAddNote}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-claude-text mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder={`${organization.name}-Wide Notes for Week of...`}
                      className="input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-claude-text mb-1">
                      Week Starting (optional)
                    </label>
                    <input
                      type="date"
                      value={noteWeekStart}
                      onChange={(e) => setNoteWeekStart(e.target.value)}
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-claude-text mb-1">
                      Content *
                    </label>
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Share guidance, topics, or suggestions for what employees should post about this week..."
                      className="input w-full h-40 resize-none"
                      required
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notePinned}
                      onChange={(e) => setNotePinned(e.target.checked)}
                      className="w-4 h-4 rounded border-claude-border text-accent-coral focus:ring-accent-coral"
                    />
                    <span className="text-sm text-claude-text">Pin this note to the top</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setShowAddNote(false)} className="btn-ghost">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingNote || !noteTitle.trim() || !noteContent.trim()}
                    className="btn-primary"
                  >
                    {addingNote ? "Creating..." : "Create Note"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-claude-lg max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-claude-text">Create Post for Employee</h2>
                <button onClick={() => setShowCreatePost(false)} className="p-2 hover:bg-claude-bg-tertiary rounded-claude">
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={(e) => handleCreatePost(e, true)}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-claude-text mb-1">
                      Select Employee *
                    </label>
                    <select
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="input w-full"
                      required
                    >
                      <option value="">Choose an employee...</option>
                      {eligibleMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.user?.name || member.email} {member.user?.linkedinAccessToken ? "(LinkedIn Connected)" : ""}
                        </option>
                      ))}
                    </select>
                    {eligibleMembers.length === 0 && (
                      <p className="text-xs text-warning mt-1">
                        No eligible employees. Employees must sign up and connect their LinkedIn account.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-claude-text mb-1">
                      Post Content *
                    </label>
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Write the LinkedIn post content..."
                      className="input w-full h-48 resize-none"
                      required
                    />
                    <p className="text-xs text-claude-text-tertiary mt-1 text-right">
                      {postContent.length} characters
                    </p>
                  </div>

                  <div className="p-3 bg-claude-bg-secondary rounded-claude border border-claude-border">
                    <p className="text-xs font-medium text-claude-text mb-2 flex items-center gap-1">
                      <CalendarIcon />
                      Schedule for
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={postScheduleDate}
                        onChange={(e) => setPostScheduleDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="flex-1 px-3 py-2 text-sm border border-claude-border rounded-claude bg-white focus:outline-none focus:ring-2 focus:ring-accent-coral"
                      />
                      <input
                        type="time"
                        value={postScheduleTime}
                        onChange={(e) => setPostScheduleTime(e.target.value)}
                        className="min-w-[120px] px-3 py-2 text-sm border border-claude-border rounded-claude bg-white focus:outline-none focus:ring-2 focus:ring-accent-coral"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-3 mt-6">
                  <button
                    type="button"
                    onClick={(e) => handleCreatePost(e, false)}
                    disabled={creatingPost || !selectedMemberId || !postContent.trim()}
                    className="btn-ghost"
                  >
                    Save as Draft
                  </button>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowCreatePost(false)} className="btn-ghost">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingPost || !selectedMemberId || !postContent.trim()}
                      className="btn-primary"
                    >
                      {creatingPost ? "Creating..." : "Create & Schedule"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal with Bulk Option */}
      {lastCreatedPost && !showBulkModal && !showBulkApproval && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-claude-lg max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckIcon />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-claude-text">Post Created</h2>
                  <p className="text-sm text-claude-text-secondary">
                    For {lastCreatedPost.user.name || lastCreatedPost.user.email}
                  </p>
                </div>
              </div>

              <div className="bg-claude-bg-secondary rounded-claude p-3 mb-4 max-h-32 overflow-y-auto">
                <p className="text-sm text-claude-text whitespace-pre-wrap line-clamp-4">
                  {lastCreatedPost.content}
                </p>
              </div>

              <p className="text-sm text-claude-text-secondary mb-4">
                Want to create similar posts for other team members?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setLastCreatedPost(null)}
                  className="btn-ghost"
                >
                  Done
                </button>
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <UsersIcon />
                  Create for Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Variation Modal */}
      {showBulkModal && lastCreatedPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-claude-lg max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-claude-text">Create Variations for Team</h2>
                <button
                  onClick={() => {
                    setShowBulkModal(false);
                    setLastCreatedPost(null);
                  }}
                  className="p-2 hover:bg-claude-bg-tertiary rounded-claude"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-claude-text mb-2">Original Post:</p>
                <div className="bg-claude-bg-secondary rounded-claude p-3 max-h-32 overflow-y-auto">
                  <p className="text-sm text-claude-text whitespace-pre-wrap">
                    {lastCreatedPost.content}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-claude-text mb-2">
                  Select Team Members
                </label>
                <div className="border border-claude-border rounded-claude max-h-48 overflow-y-auto">
                  {eligibleMembers
                    .filter((m) => m.id !== organization.members.find((om) => om.userId === lastCreatedPost.user.id)?.id)
                    .map((member) => (
                      <label
                        key={member.id}
                        className="flex items-center gap-3 p-3 hover:bg-claude-bg-secondary cursor-pointer border-b border-claude-border last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={bulkTargetMemberIds.includes(member.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkTargetMemberIds((prev) => [...prev, member.id]);
                            } else {
                              setBulkTargetMemberIds((prev) => prev.filter((id) => id !== member.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-claude-border text-accent-coral focus:ring-accent-coral"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-claude-text">
                            {member.user?.name || member.email}
                          </p>
                          <p className="text-xs text-claude-text-tertiary">{member.email}</p>
                        </div>
                        {member.user?.linkedinAccessToken && (
                          <span className="text-[#0077B5]">
                            <LinkedInIcon />
                          </span>
                        )}
                      </label>
                    ))}
                </div>
                {bulkTargetMemberIds.length > 0 && (
                  <p className="text-xs text-claude-text-tertiary mt-1">
                    {bulkTargetMemberIds.length} member{bulkTargetMemberIds.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-claude-text mb-1">
                  Variation Instructions (optional)
                </label>
                <textarea
                  value={bulkVariationContext}
                  onChange={(e) => setBulkVariationContext(e.target.value)}
                  placeholder="E.g., 'Personalize based on their role' or 'Keep the same message but vary the opening hook'"
                  className="input w-full h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowBulkModal(false);
                    setLastCreatedPost(null);
                  }}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateBulkVariations}
                  disabled={generatingBulk || bulkTargetMemberIds.length === 0}
                  className="btn-primary flex items-center gap-2"
                >
                  {generatingBulk ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon />
                      Generate Variations
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Approval Panel */}
      {showBulkApproval && pendingApprovals.length > 0 && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-claude-lg max-w-4xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-claude-text">Review Variations</h2>
                  <p className="text-sm text-claude-text-secondary">
                    {pendingApprovals.length} variation{pendingApprovals.length !== 1 ? "s" : ""} pending approval
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowBulkApproval(false);
                    setBulkGroupId(null);
                    setPendingApprovals([]);
                    setLastCreatedPost(null);
                  }}
                  className="p-2 hover:bg-claude-bg-tertiary rounded-claude"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Schedule all setting */}
              <div className="p-3 bg-claude-bg-secondary rounded-claude border border-claude-border mb-4">
                <p className="text-xs font-medium text-claude-text mb-2 flex items-center gap-1">
                  <CalendarIcon />
                  Schedule all for
                </p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={bulkScheduleDate}
                    onChange={(e) => setBulkScheduleDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="flex-1 px-3 py-2 text-sm border border-claude-border rounded-claude bg-white focus:outline-none focus:ring-2 focus:ring-accent-coral"
                  />
                  <input
                    type="time"
                    value={bulkScheduleTime}
                    onChange={(e) => setBulkScheduleTime(e.target.value)}
                    className="min-w-[120px] px-3 py-2 text-sm border border-claude-border rounded-claude bg-white focus:outline-none focus:ring-2 focus:ring-accent-coral"
                  />
                </div>
              </div>

              {/* Pending approvals list */}
              <div className="space-y-4 mb-4">
                {pendingApprovals.map((post) => (
                  <div key={post.id} className="border border-claude-border rounded-claude p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-claude-bg-tertiary rounded-full flex items-center justify-center">
                          {post.user.image ? (
                            <img src={post.user.image} alt="" className="w-8 h-8 rounded-full" />
                          ) : (
                            <span className="text-xs font-medium">
                              {(post.user.name || post.user.email)[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-claude-text">
                            {post.user.name || post.user.email}
                          </p>
                          <p className="text-xs text-claude-text-tertiary">{post.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (editingPostId === post.id) {
                              setEditingPostId(null);
                              setEditingContent("");
                            } else {
                              setEditingPostId(post.id);
                              setEditingContent(post.content);
                            }
                          }}
                          className="p-1.5 text-claude-text-secondary hover:text-claude-text hover:bg-claude-bg-tertiary rounded"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleApprovePost(post.id, false)}
                          className="px-3 py-1 text-xs text-error hover:bg-error/10 rounded"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprovePost(post.id, true)}
                          className="px-3 py-1 text-xs bg-success text-white rounded hover:bg-success/90"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                    {editingPostId === post.id ? (
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="input w-full h-32 resize-none"
                      />
                    ) : (
                      <div className="bg-claude-bg-secondary rounded-claude p-3 max-h-40 overflow-y-auto">
                        <p className="text-sm text-claude-text whitespace-pre-wrap">{post.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowBulkApproval(false);
                    setBulkGroupId(null);
                    setPendingApprovals([]);
                    setLastCreatedPost(null);
                  }}
                  className="btn-ghost"
                >
                  Cancel All
                </button>
                <button
                  onClick={handleApproveAll}
                  disabled={approvingBulk}
                  className="btn-primary"
                >
                  {approvingBulk ? "Approving..." : `Approve & Schedule All (${pendingApprovals.length})`}
                </button>
              </div>
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
        {/* Back link & Title */}
        <div className="mb-8">
          <Link
            href="/admin/organizations"
            className="inline-flex items-center gap-2 text-sm text-claude-text-secondary hover:text-claude-text mb-4"
          >
            <ArrowLeftIcon />
            Back to Organizations
          </Link>
          <h1 className="text-3xl font-bold text-claude-text">{organization.name}</h1>
          {organization.description && (
            <p className="text-claude-text-secondary mt-1">{organization.description}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-claude-border mb-6">
          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "members"
                ? "text-accent-coral border-accent-coral"
                : "text-claude-text-secondary border-transparent hover:text-claude-text"
            }`}
          >
            Members ({organization.members.length})
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "posts"
                ? "text-accent-coral border-accent-coral"
                : "text-claude-text-secondary border-transparent hover:text-claude-text"
            }`}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "notes"
                ? "text-accent-coral border-accent-coral"
                : "text-claude-text-secondary border-transparent hover:text-claude-text"
            }`}
          >
            Notes ({organization.notes.length})
          </button>
        </div>

        {/* Members Tab */}
        {activeTab === "members" && (
          <div>
            <div className="flex justify-end gap-3 mb-4">
              <button onClick={() => setShowInviteModal(true)} className="btn-secondary">
                <UserPlusIcon />
                Invite Member
              </button>
              <button onClick={() => setShowAddMember(true)} className="btn-primary">
                <PlusIcon />
                Add Member
              </button>
            </div>

            {organization.members.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-claude-text-secondary">No members yet. Add your first member above.</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-claude-bg-secondary">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-claude-text-secondary">
                        Member
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-claude-text-secondary">
                        Role
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-claude-text-secondary">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-claude-text-secondary">
                        Posts
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-claude-text-secondary">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-claude-border">
                    {organization.members.map((member) => (
                      <tr key={member.id} className="hover:bg-claude-bg-secondary/50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-claude-text">
                              {member.user?.name || "Not signed up"}
                            </p>
                            <p className="text-sm text-claude-text-secondary">{member.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              member.role === "ADMIN"
                                ? "bg-accent-coral-light text-accent-coral"
                                : "bg-claude-bg-tertiary text-claude-text-secondary"
                            }`}
                          >
                            {member.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {member.inviteStatus === "ACCEPTED" || member.user ? (
                              <>
                                <span className="flex items-center gap-1 text-xs text-success">
                                  <CheckIcon />
                                  Joined
                                </span>
                                {member.user?.linkedinAccessToken && (
                                  <span className="text-[#0077B5]">
                                    <LinkedInIcon />
                                  </span>
                                )}
                              </>
                            ) : member.inviteStatus === "PENDING" ? (
                              <span className="flex items-center gap-1 text-xs text-warning">
                                <EnvelopeIcon />
                                Invite pending
                              </span>
                            ) : member.inviteStatus === "EXPIRED" ? (
                              <span className="text-xs text-error">Invite expired</span>
                            ) : (
                              <span className="text-xs text-claude-text-tertiary">Not invited</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-claude-text">
                          {member.user?._count.posts || 0}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleToggleRole(member.id, member.role)}
                              className="text-xs text-claude-text-secondary hover:text-claude-text"
                            >
                              Make {member.role === "ADMIN" ? "Member" : "Admin"}
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-1 text-error hover:bg-error/10 rounded"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <select
                  value={postFilter}
                  onChange={(e) => setPostFilter(e.target.value)}
                  className="input text-sm"
                >
                  <option value="all">All Posts</option>
                  <option value="pending">Pending Approval</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="posted">Posted</option>
                </select>
              </div>
              <button
                onClick={() => setShowCreatePost(true)}
                className="btn-primary"
                disabled={eligibleMembers.length === 0}
              >
                <PlusIcon />
                Create Post for Employee
              </button>
            </div>

            {eligibleMembers.length === 0 && (
              <div className="card p-6 mb-4 bg-warning/5 border-warning/20">
                <p className="text-sm text-warning">
                  No employees are ready for posting. Employees must sign up and connect their LinkedIn account first.
                </p>
              </div>
            )}

            {postsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-accent-coral border-t-transparent rounded-full" />
              </div>
            ) : posts.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-claude-text-secondary">
                  No posts yet. Create posts for your employees to schedule on their behalf.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="card p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-claude-bg-tertiary rounded-full flex items-center justify-center overflow-hidden">
                          {post.user.image ? (
                            <img src={post.user.image} alt="" className="w-10 h-10 object-cover" />
                          ) : (
                            <span className="text-sm font-medium">
                              {(post.user.name || post.user.email)[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-claude-text">
                            {post.user.name || post.user.email}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-claude-text-tertiary">
                            <span>Created by {post.createdByAdmin.name || post.createdByAdmin.email}</span>
                            <span>·</span>
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.bulkDraftStatus === "PENDING_APPROVAL" && (
                          <span className="px-2 py-1 text-xs bg-warning/10 text-warning rounded">
                            Pending Approval
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            post.status === "SCHEDULED"
                              ? "bg-accent-coral-light text-accent-coral"
                              : post.status === "POSTED"
                              ? "bg-success/10 text-success"
                              : post.status === "FAILED"
                              ? "bg-error/10 text-error"
                              : "bg-claude-bg-tertiary text-claude-text-secondary"
                          }`}
                        >
                          {post.status}
                        </span>
                        {post.status !== "POSTED" && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 text-error hover:bg-error/10 rounded"
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 bg-claude-bg-secondary rounded-claude p-3">
                      <p className="text-sm text-claude-text whitespace-pre-wrap line-clamp-4">
                        {post.content}
                      </p>
                    </div>

                    {post.schedule && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-claude-text-tertiary">
                        <CalendarIcon />
                        <span>
                          Scheduled for{" "}
                          {new Date(post.schedule.scheduledFor).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowAddNote(true)} className="btn-primary">
                <PlusIcon />
                Create Note
              </button>
            </div>

            {organization.notes.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-claude-text-secondary">
                  No notes yet. Create organization-wide guidance for your employees.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {organization.notes
                  .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                  .map((note) => (
                    <div
                      key={note.id}
                      className={`card p-6 ${note.isPinned ? "border-accent-coral/30 bg-accent-coral/5" : ""}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            {note.isPinned && (
                              <span className="text-accent-coral">
                                <PinIcon />
                              </span>
                            )}
                            <h3 className="font-semibold text-claude-text">{note.title}</h3>
                          </div>
                          <p className="text-xs text-claude-text-tertiary mt-1">
                            By {note.createdBy.name || note.createdBy.email} on {formatDate(note.createdAt)}
                            {note.weekStart && ` - Week of ${formatDate(note.weekStart)}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePin(note.id, note.isPinned)}
                            className={`p-1.5 rounded hover:bg-claude-bg-tertiary ${
                              note.isPinned ? "text-accent-coral" : "text-claude-text-tertiary"
                            }`}
                            title={note.isPinned ? "Unpin" : "Pin"}
                          >
                            <PinIcon />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1.5 text-error hover:bg-error/10 rounded"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                      <div className="prose prose-sm max-w-none text-claude-text-secondary whitespace-pre-wrap">
                        {note.content}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
