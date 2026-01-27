"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

interface DashboardData {
  postsCount: number;
  scheduledCount: number;
  postedCount: number;
  linkedInConnected: boolean;
  onboardingCompleted: boolean;
  hasLinkedInProfile: boolean;
}

interface Photo {
  id: string;
  imageUrl: string;
  filename: string | null;
  usageCount: number;
  createdAt: string;
}

interface Guideline {
  id: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

interface LibraryItem {
  id: string;
  type: "LINK" | "YOUTUBE" | "PDF" | "DOCX";
  sourceUrl: string | null;
  fileName: string | null;
  title: string | null;
  extractedSummary: string | null;
  processingStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  processingError: string | null;
  usageCount: number;
  createdAt: string;
}

// Icons
const MicIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const PhotoIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const UserCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

const PencilIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
  </svg>
);

const BookOpenIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

const VideoIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

type PersonalizationTab = "guidelines" | "library" | "photos";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Personalization section state
  const [activeTab, setActiveTab] = useState<PersonalizationTab>("guidelines");

  // Guidelines state
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [guidelinesLoading, setGuidelinesLoading] = useState(true);
  const [newGuideline, setNewGuideline] = useState("");
  const [addingGuideline, setAddingGuideline] = useState(false);
  const [editingGuidelineId, setEditingGuidelineId] = useState<string | null>(null);
  const [editingGuidelineContent, setEditingGuidelineContent] = useState("");

  // Library state
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [urlInput, setUrlInput] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [libraryDragActive, setLibraryDragActive] = useState(false);

  // Photo library state
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoDragActive, setPhotoDragActive] = useState(false);

  // LinkedIn profile upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchData();
    }
  }, [session]);

  // Fetch guidelines
  useEffect(() => {
    const fetchGuidelines = async () => {
      try {
        const response = await fetch("/api/personalization/guidelines");
        if (response.ok) {
          const result = await response.json();
          setGuidelines(result.guidelines || []);
        }
      } catch (error) {
        console.error("Failed to fetch guidelines:", error);
      } finally {
        setGuidelinesLoading(false);
      }
    };

    if (session?.user) {
      fetchGuidelines();
    }
  }, [session]);

  // Fetch library items
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const response = await fetch("/api/personalization/library");
        if (response.ok) {
          const result = await response.json();
          setLibraryItems(result.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch library:", error);
      } finally {
        setLibraryLoading(false);
      }
    };

    if (session?.user) {
      fetchLibrary();
    }
  }, [session]);

  // Fetch photos
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch("/api/photos");
        if (response.ok) {
          const result = await response.json();
          setPhotos(result.photos || []);
        }
      } catch (error) {
        console.error("Failed to fetch photos:", error);
      } finally {
        setPhotosLoading(false);
      }
    };

    if (session?.user) {
      fetchPhotos();
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-claude-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-coral border-t-transparent rounded-full" />
      </div>
    );
  }

  const firstName = session?.user?.name?.split(" ")[0] || "there";

  // Guidelines handlers
  const handleAddGuideline = async () => {
    if (!newGuideline.trim()) return;
    setAddingGuideline(true);
    try {
      const response = await fetch("/api/personalization/guidelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newGuideline.trim() }),
      });
      if (response.ok) {
        const result = await response.json();
        setGuidelines((prev) => [result.guideline, ...prev]);
        setNewGuideline("");
      }
    } catch (error) {
      console.error("Failed to add guideline:", error);
    } finally {
      setAddingGuideline(false);
    }
  };

  const handleUpdateGuideline = async (id: string) => {
    if (!editingGuidelineContent.trim()) return;
    try {
      const response = await fetch("/api/personalization/guidelines", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, content: editingGuidelineContent.trim() }),
      });
      if (response.ok) {
        const result = await response.json();
        setGuidelines((prev) =>
          prev.map((g) => (g.id === id ? result.guideline : g))
        );
        setEditingGuidelineId(null);
        setEditingGuidelineContent("");
      }
    } catch (error) {
      console.error("Failed to update guideline:", error);
    }
  };

  const handleDeleteGuideline = async (id: string) => {
    try {
      const response = await fetch("/api/personalization/guidelines", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        setGuidelines((prev) => prev.filter((g) => g.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete guideline:", error);
    }
  };

  // Library handlers
  const handleAddUrl = async () => {
    if (!urlInput.trim()) return;
    setAddingUrl(true);
    try {
      const response = await fetch("/api/personalization/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      if (response.ok) {
        const result = await response.json();
        setLibraryItems((prev) => [result.item, ...prev]);
        setUrlInput("");
      }
    } catch (error) {
      console.error("Failed to add URL:", error);
    } finally {
      setAddingUrl(false);
    }
  };

  const handleLibraryFileUpload = async (files: FileList) => {
    setUploadingFile(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch("/api/personalization/library", {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          const result = await response.json();
          setLibraryItems((prev) => [result.item, ...prev]);
        }
      } catch (error) {
        console.error("Failed to upload file:", error);
      }
    }
    setUploadingFile(false);
  };

  const handleDeleteLibraryItem = async (id: string) => {
    try {
      const response = await fetch("/api/personalization/library", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        setLibraryItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete library item:", error);
    }
  };

  const handleLibraryDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setLibraryDragActive(true);
    } else if (e.type === "dragleave") {
      setLibraryDragActive(false);
    }
  };

  const handleLibraryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLibraryDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleLibraryFileUpload(e.dataTransfer.files);
    }
  };

  // Photo handlers
  const handlePhotoUpload = async (files: FileList) => {
    if (files.length === 0) return;

    // Validate files on client side first
    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        alert(`"${file.name}" is not an image file. Skipping.`);
        continue;
      }
      if (file.size > maxSize) {
        alert(`"${file.name}" is too large (max 10MB). Skipping.`);
        continue;
      }
      if (file.size === 0) {
        alert(`"${file.name}" is empty. Skipping.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      return;
    }

    setPhotoUploading(true);
    const formData = new FormData();
    for (const file of validFiles) {
      formData.append("files", file);
    }

    try {
      const response = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        if (result.photos && result.photos.length > 0) {
          setPhotos((prev) => [...result.photos, ...prev]);
        }
        if (result.errors && result.errors.length > 0) {
          alert(`Some files had issues:\n${result.errors.join('\n')}`);
        }
      } else {
        const errorMsg = result.details
          ? result.details.join('\n')
          : result.error || "Upload failed";
        alert(`Upload failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Failed to upload photos:", error);
      alert("Failed to upload photos. Please check your connection and try again.");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePhotoDelete = async (photoId: string) => {
    try {
      const response = await fetch("/api/photos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      });
      if (response.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      }
    } catch (error) {
      console.error("Failed to delete photo:", error);
    }
  };

  const handlePhotoDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setPhotoDragActive(true);
    } else if (e.type === "dragleave") {
      setPhotoDragActive(false);
    }
  };

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handlePhotoUpload(e.dataTransfer.files);
    }
  };

  // LinkedIn profile handlers
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file (PNG, JPG, etc.)");
      return;
    }
    setUploading(true);
    setUploadError("");
    setUploadSuccess(false);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const imageData = await base64Promise;
      const response = await fetch("/api/profile/upload-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData, sectionType: "full_profile" }),
      });
      if (!response.ok) throw new Error("Failed to process screenshot");
      setUploadSuccess(true);
      const dashResponse = await fetch("/api/dashboard");
      if (dashResponse.ok) {
        const result = await dashResponse.json();
        setData(result);
      }
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to process screenshot. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const getLibraryTypeIcon = (type: string) => {
    switch (type) {
      case "YOUTUBE": return <VideoIcon />;
      case "PDF": case "DOCX": return <FileIcon />;
      default: return <LinkIcon />;
    }
  };

  const getProcessingBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">Ready</span>;
      case "PROCESSING":
        return <span className="px-2 py-0.5 bg-warning/10 text-warning text-xs rounded-full animate-pulse">Processing...</span>;
      case "FAILED":
        return <span className="px-2 py-0.5 bg-error/10 text-error text-xs rounded-full">Failed</span>;
      default:
        return <span className="px-2 py-0.5 bg-claude-bg-tertiary text-claude-text-tertiary text-xs rounded-full">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-claude-bg">
      {/* LinkedIn Profile Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-claude-lg max-w-lg w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-claude-text">
                  Upload LinkedIn Profile Screenshots
                </h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadError("");
                    setUploadSuccess(false);
                  }}
                  className="p-2 hover:bg-claude-bg-tertiary rounded-claude"
                >
                  <CloseIcon />
                </button>
              </div>
              <p className="text-sm text-claude-text-secondary mb-4">
                Upload screenshots of your LinkedIn profile to help your AI ghostwriter understand your professional background.
              </p>
              {uploadSuccess ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 text-success flex items-center justify-center">
                    <CheckIcon />
                  </div>
                  <p className="text-success font-medium">Profile information extracted!</p>
                </div>
              ) : (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-claude-lg p-8 text-center transition-colors ${
                    dragActive ? "border-accent-coral bg-accent-coral/5" : "border-claude-border hover:border-claude-border-strong"
                  }`}
                >
                  {uploading ? (
                    <div className="py-4">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-coral/10 flex items-center justify-center">
                        <div className="animate-spin w-6 h-6 border-2 border-accent-coral border-t-transparent rounded-full" />
                      </div>
                      <p className="text-claude-text font-medium">Analyzing your profile...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-claude-bg-tertiary text-claude-text-tertiary flex items-center justify-center">
                        <PhotoIcon />
                      </div>
                      <p className="text-claude-text font-medium mb-2">
                        Drag and drop your screenshot here
                      </p>
                      <label className="btn-secondary cursor-pointer">
                        <UploadIcon />
                        Choose File
                        <input type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
                      </label>
                    </>
                  )}
                </div>
              )}
              {uploadError && (
                <div className="mt-4 p-3 rounded-claude bg-error/10 text-error text-sm">
                  {uploadError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 bg-claude-bg/80 backdrop-blur-md border-b border-claude-border z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo size="md" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-accent-coral font-medium">Dashboard</Link>
            <Link href="/posts" className="text-sm text-claude-text-secondary hover:text-claude-text">Posts</Link>
            <Link href="/schedule" className="text-sm text-claude-text-secondary hover:text-claude-text">Schedule</Link>
            <Link href="/settings" className="text-sm text-claude-text-secondary hover:text-claude-text">Settings</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-claude-text mb-2">Welcome back, {firstName}</h1>
          <p className="text-claude-text-secondary">Here&apos;s an overview of your LinkedIn content pipeline.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-claude-lg bg-accent-coral-light text-accent-coral flex items-center justify-center">
                <DocumentIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-claude-text">{data?.postsCount || 0}</p>
                <p className="text-sm text-claude-text-secondary">Total Posts</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-claude-lg bg-warning-light text-warning flex items-center justify-center">
                <CalendarIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-claude-text">{data?.scheduledCount || 0}</p>
                <p className="text-sm text-claude-text-secondary">Scheduled</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-claude-lg bg-success-light text-success flex items-center justify-center">
                <CheckCircleIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-claude-text">{data?.postedCount || 0}</p>
                <p className="text-sm text-claude-text-secondary">Posted</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-claude-lg flex items-center justify-center ${
                data?.linkedInConnected ? "bg-[#0077B5]/10 text-[#0077B5]" : "bg-claude-bg-tertiary text-claude-text-tertiary"
              }`}>
                <LinkedInIcon />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-claude-text">
                  {data?.linkedInConnected ? "Connected" : "Not Connected"}
                </p>
                <p className="text-sm text-claude-text-secondary">LinkedIn</p>
              </div>
              {!data?.linkedInConnected && (
                <a href="/api/linkedin/auth" className="px-3 py-1.5 text-xs font-medium text-white bg-[#0077B5] hover:bg-[#006097] rounded-claude transition-colors">
                  Connect
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Primary CTA - Guided Posts */}
        {!data?.onboardingCompleted ? (
          <div className="card-hover p-8 bg-gradient-to-br from-accent-coral-light to-white border-accent-coral/20 mb-8">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-accent-coral text-white flex items-center justify-center flex-shrink-0">
                <DocumentIcon />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-claude-text mb-2">
                  Get Started with Guided Questions
                </h2>
                <p className="text-claude-text-secondary mb-4">
                  Answer 5 simple questions and we&apos;ll generate 5 LinkedIn posts for you. The easiest way to build your content pipeline.
                </p>
                <Link href="/onboarding" className="btn-primary">
                  Start Guided Mode
                  <ArrowRightIcon />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Link href="/posts" className="card-hover">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-claude-lg bg-accent-coral-light text-accent-coral flex items-center justify-center flex-shrink-0">
                  <DocumentIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-claude-text mb-1">View Your Posts</h3>
                  <p className="text-sm text-claude-text-secondary">
                    Review, edit, and manage your generated LinkedIn content.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/schedule" className="card-hover">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-claude-lg bg-warning-light text-warning flex items-center justify-center flex-shrink-0">
                  <CalendarIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-claude-text mb-1">Schedule Posts</h3>
                  <p className="text-sm text-claude-text-secondary">
                    Set up your posting schedule for the next 10 weeks.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/onboarding" className="card-hover">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-claude-lg bg-success-light text-success flex items-center justify-center flex-shrink-0">
                  <MicIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-claude-text mb-1">Record More</h3>
                  <p className="text-sm text-claude-text-secondary">
                    Add more voice notes to generate additional content.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Secondary CTA - Create Post */}
        <div className="card p-6 border-dashed mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-claude-lg bg-claude-bg-tertiary text-claude-text-secondary flex items-center justify-center flex-shrink-0">
              <MicIcon />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-claude-text mb-1">
                Or create a single post
              </h3>
              <p className="text-sm text-claude-text-secondary mb-3">
                Share a story, idea, or thought - type or record. We&apos;ll help you turn it into a LinkedIn post.
              </p>
              <Link href="/create" className="text-accent-coral text-sm font-medium hover:underline">
                Start writing →
              </Link>
            </div>
          </div>
        </div>

        {/* Unified Personalization Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-accent-coral/10 text-accent-coral flex items-center justify-center">
              <SparklesIcon />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-claude-text">Personalize Your Ghostwriter</h2>
              <p className="text-sm text-claude-text-secondary">Make your AI writer truly understand your voice</p>
            </div>
            {data?.hasLinkedInProfile && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="ml-auto text-sm text-[#0077B5] hover:underline flex items-center gap-1"
              >
                <UserCircleIcon />
                Update LinkedIn Profile
              </button>
            )}
          </div>

          {/* LinkedIn Profile Upload Card - shown if no profile context yet */}
          {!data?.hasLinkedInProfile && (
            <div className="p-4 mb-6 border border-[#0077B5]/30 bg-[#0077B5]/5 rounded-claude">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0077B5]/10 text-[#0077B5] flex items-center justify-center flex-shrink-0">
                  <UserCircleIcon />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-claude-text">Upload your LinkedIn profile</p>
                  <p className="text-xs text-claude-text-secondary">Help your ghostwriter understand your professional background</p>
                </div>
                <button onClick={() => setShowUploadModal(true)} className="btn-secondary text-sm">
                  <UploadIcon /> Upload
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-claude-border">
            <button
              onClick={() => setActiveTab("guidelines")}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === "guidelines"
                  ? "border-accent-coral text-accent-coral"
                  : "border-transparent text-claude-text-secondary hover:text-claude-text"
              }`}
            >
              <span className="flex items-center gap-2">
                <PencilIcon /> Guidelines
                {guidelines.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-accent-coral/10 text-accent-coral text-xs rounded-full">
                    {guidelines.length}
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === "library"
                  ? "border-accent-coral text-accent-coral"
                  : "border-transparent text-claude-text-secondary hover:text-claude-text"
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpenIcon /> My Library
                {libraryItems.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-accent-coral/10 text-accent-coral text-xs rounded-full">
                    {libraryItems.length}
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("photos")}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === "photos"
                  ? "border-accent-coral text-accent-coral"
                  : "border-transparent text-claude-text-secondary hover:text-claude-text"
              }`}
            >
              <span className="flex items-center gap-2">
                <PhotoIcon /> Photos
                {photos.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-accent-coral/10 text-accent-coral text-xs rounded-full">
                    {photos.length}
                  </span>
                )}
              </span>
            </button>
          </div>

          {/* Guidelines Tab Content */}
          {activeTab === "guidelines" && (
            <div>
              <p className="text-sm text-claude-text-secondary mb-4">
                Running notes that apply to <strong>every</strong> post your ghostwriter creates. These guidelines are always in context.
              </p>

              {/* Add new guideline */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newGuideline}
                  onChange={(e) => setNewGuideline(e.target.value)}
                  placeholder="e.g., Always mention I'm a founder at Acme Corp"
                  className="input flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAddGuideline()}
                />
                <button
                  onClick={handleAddGuideline}
                  disabled={addingGuideline || !newGuideline.trim()}
                  className="btn-primary"
                >
                  {addingGuideline ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PlusIcon />
                  )}
                  Add
                </button>
              </div>

              {/* Guidelines list */}
              {guidelinesLoading ? (
                <div className="py-8 text-center text-claude-text-tertiary">Loading...</div>
              ) : guidelines.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-claude-text-tertiary mb-2">No guidelines yet</p>
                  <p className="text-xs text-claude-text-tertiary">
                    Add guidelines like &quot;Don&apos;t use corporate jargon&quot; or &quot;Always include a personal story&quot;
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {guidelines.map((guideline) => (
                    <div key={guideline.id} className="flex items-start gap-3 p-3 bg-claude-bg-secondary rounded-claude group">
                      {editingGuidelineId === guideline.id ? (
                        <>
                          <input
                            type="text"
                            value={editingGuidelineContent}
                            onChange={(e) => setEditingGuidelineContent(e.target.value)}
                            className="input flex-1 text-sm"
                            autoFocus
                          />
                          <button onClick={() => handleUpdateGuideline(guideline.id)} className="btn-primary text-xs px-2 py-1">
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingGuidelineId(null);
                              setEditingGuidelineContent("");
                            }}
                            className="btn-ghost text-xs px-2 py-1"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="text-sm text-claude-text">{guideline.content}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingGuidelineId(guideline.id);
                                setEditingGuidelineContent(guideline.content);
                              }}
                              className="p-1 text-claude-text-tertiary hover:text-claude-text"
                            >
                              <PencilIcon />
                            </button>
                            <button
                              onClick={() => handleDeleteGuideline(guideline.id)}
                              className="p-1 text-claude-text-tertiary hover:text-error"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Library Tab Content */}
          {activeTab === "library" && (
            <div>
              <p className="text-sm text-claude-text-secondary mb-4">
                Upload your content - articles, YouTube videos, PDFs, documents. Your ghostwriter will use these to create <strong>Magic Drafts</strong>.
              </p>

              {/* Add URL */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste a URL (article, YouTube video, etc.)"
                  className="input flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
                />
                <button
                  onClick={handleAddUrl}
                  disabled={addingUrl || !urlInput.trim()}
                  className="btn-primary"
                >
                  {addingUrl ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PlusIcon />
                  )}
                  Add
                </button>
              </div>

              {/* File upload zone */}
              <div
                onDragEnter={handleLibraryDrag}
                onDragLeave={handleLibraryDrag}
                onDragOver={handleLibraryDrag}
                onDrop={handleLibraryDrop}
                className={`border-2 border-dashed rounded-claude p-4 text-center mb-4 transition-colors ${
                  libraryDragActive
                    ? "border-accent-coral bg-accent-coral/5"
                    : "border-claude-border hover:border-claude-border-strong"
                }`}
              >
                {uploadingFile ? (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <div className="w-4 h-4 border-2 border-accent-coral border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-claude-text-secondary">Uploading...</span>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <span className="text-sm text-claude-text-secondary">
                      Drag & drop PDF or DOCX files here, or <span className="text-accent-coral">browse</span>
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      multiple
                      onChange={(e) => e.target.files && handleLibraryFileUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Library items list */}
              {libraryLoading ? (
                <div className="py-8 text-center text-claude-text-tertiary">Loading...</div>
              ) : libraryItems.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-claude-text-tertiary mb-2">Your library is empty</p>
                  <p className="text-xs text-claude-text-tertiary">
                    Add links to articles about you, YouTube videos you&apos;ve been in, or upload documents like your book or presentations.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {libraryItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-claude-bg-secondary rounded-claude group">
                      <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                        item.type === "YOUTUBE" ? "bg-red-100 text-red-600" :
                        item.type === "PDF" ? "bg-orange-100 text-orange-600" :
                        item.type === "DOCX" ? "bg-blue-100 text-blue-600" :
                        "bg-claude-bg-tertiary text-claude-text-secondary"
                      }`}>
                        {getLibraryTypeIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-claude-text font-medium truncate">
                          {item.title || item.fileName || item.sourceUrl || "Untitled"}
                        </p>
                        {item.extractedSummary && (
                          <p className="text-xs text-claude-text-tertiary mt-1 line-clamp-2">
                            {item.extractedSummary}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {getProcessingBadge(item.processingStatus)}
                          {item.usageCount > 0 && (
                            <span className="text-xs text-claude-text-tertiary">Used {item.usageCount}x</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteLibraryItem(item.id)}
                        className="p-1 text-claude-text-tertiary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Photos Tab Content */}
          {activeTab === "photos" && (
            <div>
              <p className="text-sm text-claude-text-secondary mb-4">
                Posts with photos perform <span className="font-semibold text-accent-coral">2x better</span> on LinkedIn.
                Raw, authentic photos work best.
              </p>

              {/* Upload area and photos grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {/* Upload button/drop zone */}
                <div
                  onDragEnter={handlePhotoDrag}
                  onDragLeave={handlePhotoDrag}
                  onDragOver={handlePhotoDrag}
                  onDrop={handlePhotoDrop}
                  className={`aspect-square border-2 border-dashed rounded-claude flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    photoDragActive
                      ? "border-accent-coral bg-accent-coral/10"
                      : "border-claude-border hover:border-claude-border-strong hover:bg-claude-bg-secondary"
                  }`}
                >
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    {photoUploading ? (
                      <div className="animate-spin w-6 h-6 border-2 border-accent-coral border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <PlusIcon />
                        <span className="text-xs text-claude-text-secondary mt-1">Add photos</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Photos */}
                {photosLoading ? (
                  <div className="aspect-square bg-claude-bg-secondary rounded-claude animate-pulse" />
                ) : (
                  photos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-square">
                      <img
                        src={photo.imageUrl}
                        alt={photo.filename || "Photo"}
                        className="w-full h-full object-cover rounded-claude"
                      />
                      <button
                        onClick={() => handlePhotoDelete(photo.id)}
                        className="absolute top-1 right-1 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                      >
                        <TrashIcon />
                      </button>
                      {photo.usageCount > 0 && (
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-xs rounded">
                          Used {photo.usageCount}x
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {photos.length === 0 && !photosLoading && (
                <p className="text-center text-sm text-claude-text-tertiary mt-4">
                  Upload photos now and they&apos;ll be ready to use when you create posts.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
