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


const PhotoIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
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

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Photo library state
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoDragActive, setPhotoDragActive] = useState(false);


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


  return (
    <>
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

            <Link href="/magic-drafts" className="card-hover">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-claude-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <SparklesIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-claude-text mb-1">Magic Drafts</h3>
                  <p className="text-sm text-claude-text-secondary">
                    Generate AI-powered posts from your content library.
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

        {/* Photos Section */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent-coral/10 text-accent-coral flex items-center justify-center">
              <PhotoIcon />
            </div>
            <div>
              <h2 className="font-semibold text-claude-text">Photo Library</h2>
              <p className="text-sm text-claude-text-secondary">Posts with photos perform <span className="font-medium text-accent-coral">2x better</span></p>
            </div>
          </div>

          {/* Photo grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {/* Upload button */}
            <label
              onDragEnter={handlePhotoDrag}
              onDragLeave={handlePhotoDrag}
              onDragOver={handlePhotoDrag}
              onDrop={handlePhotoDrop}
              className={`relative aspect-square border-2 border-dashed rounded-claude flex flex-col items-center justify-center cursor-pointer transition-colors ${
                photoDragActive
                  ? "border-accent-coral bg-accent-coral/10"
                  : "border-claude-border hover:border-claude-border-strong hover:bg-claude-bg-secondary"
              }`}
            >
              {photoUploading ? (
                <div className="animate-spin w-5 h-5 border-2 border-accent-coral border-t-transparent rounded-full" />
              ) : (
                <>
                  <PlusIcon />
                  <span className="text-xs text-claude-text-secondary mt-1">Add</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>

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
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))
            )}
          </div>

          {photos.length === 0 && !photosLoading && (
            <p className="text-center text-sm text-claude-text-tertiary mt-3">
              Upload photos now and they&apos;ll be ready to use when you create posts.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
