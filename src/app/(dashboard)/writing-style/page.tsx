"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { WritingStyleSelector } from "@/components/WritingStyleSelector";

interface Guideline {
  id: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

interface WritingSample {
  id: string;
  content: string;
  source: string;
  isActive: boolean;
  createdAt: string;
}

type WritingStyleSubTab = "style" | "guidelines" | "samples";

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

const PencilIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

function WritingStyleForm() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Sub-tab state
  const [activeSubTab, setActiveSubTab] = useState<WritingStyleSubTab>("style");
  const [message, setMessage] = useState("");

  // Guidelines state
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [guidelinesLoading, setGuidelinesLoading] = useState(true);
  const [newGuideline, setNewGuideline] = useState("");
  const [addingGuideline, setAddingGuideline] = useState(false);
  const [editingGuidelineId, setEditingGuidelineId] = useState<string | null>(null);
  const [editingGuidelineContent, setEditingGuidelineContent] = useState("");

  // Writing samples state
  const [writingSamples, setWritingSamples] = useState<WritingSample[]>([]);
  const [samplesLoading, setSamplesLoading] = useState(true);
  const [newSampleContent, setNewSampleContent] = useState("");
  const [newSampleSource, setNewSampleSource] = useState("");
  const [addingSample, setAddingSample] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/writing-style");
    }
  }, [status, router]);

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

  // Fetch writing samples
  useEffect(() => {
    const fetchWritingSamples = async () => {
      try {
        const response = await fetch("/api/personalization/writing-samples");
        if (response.ok) {
          const result = await response.json();
          setWritingSamples(result.samples || []);
        }
      } catch (error) {
        console.error("Failed to fetch writing samples:", error);
      } finally {
        setSamplesLoading(false);
      }
    };

    if (session?.user) {
      fetchWritingSamples();
    }
  }, [session]);

  // Writing style handler
  const handleWritingStyleSelected = () => {
    setMessage("Writing style saved!");
    setTimeout(() => setMessage(""), 3000);
  };

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

  // Writing samples handlers
  const handleAddSample = async () => {
    if (!newSampleContent.trim() || !newSampleSource.trim()) return;
    setAddingSample(true);
    try {
      const response = await fetch("/api/personalization/writing-samples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newSampleContent.trim(),
          source: newSampleSource.trim(),
        }),
      });
      if (response.ok) {
        const result = await response.json();
        setWritingSamples((prev) => [result.sample, ...prev]);
        setNewSampleContent("");
        setNewSampleSource("");
      } else {
        const result = await response.json();
        setMessage(result.error || "Failed to add sample");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to add writing sample:", error);
    } finally {
      setAddingSample(false);
    }
  };

  const handleDeleteSample = async (id: string) => {
    try {
      const response = await fetch("/api/personalization/writing-samples", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        setWritingSamples((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete writing sample:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-claude-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-coral border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-claude-text mb-4">Writing Style</h1>
        <p className="text-claude-text-secondary mb-6">
          Customize how TeamPost writes for you
        </p>

        {/* Sub-tab Navigation */}
        <div className="flex border-b border-claude-border mb-8">
          <button
            onClick={() => setActiveSubTab("style")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeSubTab === "style"
                ? "border-accent-coral text-accent-coral"
                : "border-transparent text-claude-text-secondary hover:text-claude-text"
            }`}
          >
            Style
          </button>
          <button
            onClick={() => setActiveSubTab("guidelines")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeSubTab === "guidelines"
                ? "border-accent-coral text-accent-coral"
                : "border-transparent text-claude-text-secondary hover:text-claude-text"
            }`}
          >
            Guidelines
          </button>
          <button
            onClick={() => setActiveSubTab("samples")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeSubTab === "samples"
                ? "border-accent-coral text-accent-coral"
                : "border-transparent text-claude-text-secondary hover:text-claude-text"
            }`}
          >
            Writing Samples
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-claude ${
            message.includes("saved") || message.includes("success")
              ? "bg-success/10 border border-success/20 text-success"
              : "bg-error/10 border border-error/20 text-error"
          }`}>
            {message}
          </div>
        )}

        {/* ===== STYLE TAB ===== */}
        {activeSubTab === "style" && (
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <PencilIcon />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-claude-text">Writing Style</h2>
                <p className="text-sm text-claude-text-secondary">
                  Choose how your posts sound. Take the quiz or pick manually.
                </p>
              </div>
            </div>

            <WritingStyleSelector
              onStyleSelected={handleWritingStyleSelected}
              mode="cards"
            />
          </div>
        )}

        {/* ===== GUIDELINES TAB ===== */}
        {activeSubTab === "guidelines" && (
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent-coral/10 text-accent-coral flex items-center justify-center">
                <SparklesIcon />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-claude-text">Ghostwriter Guidelines</h2>
                <p className="text-sm text-claude-text-secondary">
                  Running notes that apply to <strong>every</strong> post your ghostwriter creates.
                </p>
              </div>
            </div>

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
              <div className="py-4 text-center text-claude-text-tertiary">Loading...</div>
            ) : guidelines.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-claude-border rounded-claude">
                <p className="text-claude-text-tertiary text-sm">No guidelines yet</p>
                <p className="text-claude-text-tertiary text-xs mt-1">
                  Add rules like &quot;Never use emojis&quot; or &quot;Always mention my company name&quot;
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

        {/* ===== WRITING SAMPLES TAB ===== */}
        {activeSubTab === "samples" && (
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <DocumentTextIcon />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-claude-text">Writing Samples</h2>
                <p className="text-sm text-claude-text-secondary">
                  Paste examples of your past writing so TeamPost can learn your voice
                </p>
              </div>
            </div>

            {/* Add new sample form */}
            <div className="space-y-3 mb-6">
              <div>
                <label className="label">Source type</label>
                <select
                  value={newSampleSource}
                  onChange={(e) => setNewSampleSource(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Select source type...</option>
                  <option value="LinkedIn post">LinkedIn post</option>
                  <option value="Blog article">Blog article</option>
                  <option value="Newsletter">Newsletter</option>
                  <option value="Slack message">Slack message</option>
                  <option value="Tweet/X post">Tweet/X post</option>
                  <option value="Email">Email</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">Your writing</label>
                  <span className={`text-xs ${newSampleContent.length > 5000 ? "text-error" : "text-claude-text-tertiary"}`}>
                    {newSampleContent.length}/5,000
                  </span>
                </div>
                <textarea
                  value={newSampleContent}
                  onChange={(e) => setNewSampleContent(e.target.value)}
                  placeholder="Paste your writing here..."
                  rows={5}
                  maxLength={5000}
                  className="input w-full resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-claude-text-tertiary">
                  {writingSamples.length}/10 samples
                </span>
                <button
                  onClick={handleAddSample}
                  disabled={addingSample || !newSampleContent.trim() || !newSampleSource || writingSamples.length >= 10}
                  className="btn-primary"
                >
                  {addingSample ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PlusIcon />
                  )}
                  Add Sample
                </button>
              </div>
            </div>

            {/* Samples list */}
            {samplesLoading ? (
              <div className="py-4 text-center text-claude-text-tertiary">Loading...</div>
            ) : writingSamples.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-claude-border rounded-claude">
                <DocumentTextIcon />
                <p className="text-claude-text-tertiary text-sm mt-2">
                  No writing samples yet
                </p>
                <p className="text-claude-text-tertiary text-xs mt-1">
                  Add examples of your best writing to help TeamPost match your voice
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {writingSamples.map((sample) => (
                  <div key={sample.id} className="p-4 bg-claude-bg-secondary rounded-claude group relative">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block text-xs px-2 py-0.5 bg-accent-coral/10 text-accent-coral rounded-full font-medium">
                        {sample.source}
                      </span>
                      <span className="text-xs text-claude-text-tertiary">
                        {new Date(sample.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-claude-text line-clamp-4 whitespace-pre-wrap">
                      {sample.content}
                    </p>
                    <button
                      onClick={() => handleDeleteSample(sample.id)}
                      className="absolute top-3 right-3 p-1 text-claude-text-tertiary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </>
  );
}

export default function WritingStylePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-claude-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-coral border-t-transparent rounded-full" />
      </div>
    }>
      <WritingStyleForm />
    </Suspense>
  );
}
