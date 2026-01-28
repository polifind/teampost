"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VoiceRecorder, { VoiceRecorderRef } from "@/components/VoiceRecorder";
import Logo from "@/components/Logo";
import { QUESTIONS, TOTAL_QUESTIONS, BATCH_SIZE } from "@/lib/questions";

interface AnswerData {
  questionIndex: number;
  content: string;
  isVoice: boolean;
  duration?: number;
  generatedPost?: string;
}

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const MicIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

const KeyboardIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5M3.75 6.75h16.5v10.5H3.75V6.75z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

const LightBulbIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const voiceRecorderRef = useRef<VoiceRecorderRef>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AnswerData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [showPostPreview, setShowPostPreview] = useState(false);
  const [currentPreview, setCurrentPreview] = useState<{ content: string; questionIndex: number } | null>(null);
  const [editingPost, setEditingPost] = useState<string | null>(null);

  // Input mode: 'voice' or 'text'
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState('');

  // Feedback mode for post regeneration
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [learnedPreferences, setLearnedPreferences] = useState<string[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/onboarding");
    }
  }, [status, router]);

  // Load existing posts on mount to show completion state
  useEffect(() => {
    const loadExistingPosts = async () => {
      if (status !== "authenticated") return;

      try {
        const response = await fetch("/api/posts");
        if (response.ok) {
          const data = await response.json();
          const posts = data.posts || [];

          // Convert existing posts to answers format
          const existingAnswers: AnswerData[] = posts
            .filter((post: { weekNumber: number; status: string }) =>
              post.weekNumber >= 1 && post.weekNumber <= 5 &&
              (post.status === "SCHEDULED" || post.status === "POSTED")
            )
            .map((post: { weekNumber: number; content: string }) => ({
              questionIndex: post.weekNumber - 1,
              content: "", // Original content not stored, but we have the generated post
              isVoice: false,
              generatedPost: post.content,
            }));

          if (existingAnswers.length > 0) {
            setAnswers(existingAnswers);

            // Find first unanswered question and navigate to it
            const answeredIndices = new Set(existingAnswers.map((a: AnswerData) => a.questionIndex));
            for (let i = 0; i < 5; i++) {
              if (!answeredIndices.has(i)) {
                setCurrentQuestion(i);
                break;
              }
            }
            // If all 5 are done, stay on question 0 (they can redo)
          }
        }
      } catch (error) {
        console.error("Failed to load existing posts:", error);
      }
    };

    loadExistingPosts();
  }, [status]);

  // Auto-stop recording and reset when changing questions
  const handleQuestionChange = (newIndex: number) => {
    if (voiceRecorderRef.current?.isRecording) {
      voiceRecorderRef.current.stopRecording();
    }
    // Reset the voice recorder for new question
    voiceRecorderRef.current?.reset();
    setCurrentQuestion(newIndex);
    setTextInput('');
  };

  // Skip current question and move to next
  const handleSkip = () => {
    if (voiceRecorderRef.current?.isRecording) {
      voiceRecorderRef.current.stopRecording();
    }
    voiceRecorderRef.current?.reset();
    setTextInput('');

    // Move to next question if not at end
    if (currentQuestion < batchEnd - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Move to a new batch of questions
  const handleNewBatch = () => {
    if (voiceRecorderRef.current?.isRecording) {
      voiceRecorderRef.current.stopRecording();
    }
    voiceRecorderRef.current?.reset();
    setTextInput('');

    // Move to next batch, or loop back to first batch
    const nextBatchStart = batchEnd < TOTAL_QUESTIONS ? batchEnd : 0;
    setCurrentQuestion(nextBatchStart);
  };

  // Handle voice recording completion
  const handleRecordingComplete = async (audioBlob: Blob, duration: number) => {
    setIsProcessing(true);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(",")[1]);
        };
        reader.readAsDataURL(audioBlob);
      });
      const audioBase64 = await base64Promise;

      // Save voice note and get transcription
      const response = await fetch("/api/voice/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionIndex: currentQuestion,
          questionText: QUESTIONS[currentQuestion].text,
          audioData: audioBase64,
          duration,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save voice note");
      }

      const data = await response.json();

      // Process the transcription to generate a post
      await generatePost(data.transcription, true, duration);
    } catch (error) {
      console.error("Error processing recording:", error);
      alert("Failed to process recording. Please try again.");
      setIsProcessing(false);
    }
  };

  // Handle text submission
  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;

    setIsProcessing(true);
    await generatePost(textInput, false);
  };

  // Generate post from content (voice transcription or text)
  const generatePost = async (content: string, isVoice: boolean, duration?: number) => {
    try {
      // Update local state with the answer
      const newAnswer: AnswerData = {
        questionIndex: currentQuestion,
        content,
        isVoice,
        duration,
      };

      setAnswers((prev) => {
        const filtered = prev.filter((a) => a.questionIndex !== currentQuestion);
        return [...filtered, newAnswer];
      });

      // Generate post preview
      setIsGeneratingPreview(true);
      setShowPostPreview(true);

      const previewResponse = await fetch("/api/posts/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcription: content,
          questionText: QUESTIONS[currentQuestion].text,
          questionIndex: currentQuestion,
        }),
      });

      if (previewResponse.ok) {
        const previewData = await previewResponse.json();
        setCurrentPreview({
          content: previewData.content,
          questionIndex: currentQuestion,
        });

        // Update answer with generated post
        setAnswers((prev) =>
          prev.map((a) =>
            a.questionIndex === currentQuestion
              ? { ...a, generatedPost: previewData.content }
              : a
          )
        );
      } else {
        throw new Error("Failed to generate post");
      }
    } catch (error) {
      console.error("Error generating post:", error);
      alert("Failed to generate post. Please try again.");
      setShowPostPreview(false);
    } finally {
      setIsProcessing(false);
      setIsGeneratingPreview(false);
    }
  };

  const handleSavePost = () => {
    if (editingPost !== null && currentPreview) {
      setAnswers((prev) =>
        prev.map((a) =>
          a.questionIndex === currentPreview.questionIndex
            ? { ...a, generatedPost: editingPost }
            : a
        )
      );
      setCurrentPreview({ ...currentPreview, content: editingPost });
    }
    setEditingPost(null);
  };

  const handleApproveAndContinue = async () => {
    // Save the post to the database
    if (currentPreview) {
      try {
        const currentAnswer = answers.find(a => a.questionIndex === currentPreview.questionIndex);
        const postContent = editingPost !== null ? editingPost : currentPreview.content;

        await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: postContent,
            weekNumber: currentPreview.questionIndex + 1,
            sourceNoteContent: currentAnswer?.content,
            autoSchedule: true,
          }),
        });
      } catch (error) {
        console.error("Error saving post:", error);
        // Continue anyway - the post is in local state
      }
    }

    setShowPostPreview(false);
    setCurrentPreview(null);
    setEditingPost(null);
    setTextInput('');

    // Reset the voice recorder for the next question
    voiceRecorderRef.current?.reset();

    // Check if this completes the batch
    const updatedAnswers = [...answers];
    const newCompletedInBatch = updatedAnswers.filter(
      a => a.questionIndex >= batchStart && a.questionIndex < batchEnd
    ).length;

    // Auto-advance to next question within the batch
    if (currentQuestion < batchEnd - 1) {
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
      }, 300);
    }
  };

  const handleFinishAndReview = () => {
    // Navigate to review/approve page
    router.push("/posts/review");
  };

  // Handle feedback and regenerate
  const handleFeedbackRegenerate = async () => {
    if (!feedbackText.trim() || !currentPreview) return;

    setIsRegenerating(true);
    setLearnedPreferences([]);

    try {
      const currentAnswer = answers.find(a => a.questionIndex === currentPreview.questionIndex);

      const response = await fetch("/api/posts/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPost: currentPreview.content,
          feedback: feedbackText,
          questionText: QUESTIONS[currentPreview.questionIndex].text,
          originalContent: currentAnswer?.content || '',
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update the preview with new content
        setCurrentPreview({
          ...currentPreview,
          content: data.content,
        });

        // Update the answer with the new generated post
        setAnswers((prev) =>
          prev.map((a) =>
            a.questionIndex === currentPreview.questionIndex
              ? { ...a, generatedPost: data.content }
              : a
          )
        );

        // Show learned preferences if any
        if (data.learnedPreferences && data.learnedPreferences.length > 0) {
          setLearnedPreferences(data.learnedPreferences.map((p: { preference: string }) => p.preference));
        }

        // Reset feedback state
        setFeedbackText('');
        setShowFeedbackInput(false);
      } else {
        throw new Error("Failed to regenerate");
      }
    } catch (error) {
      console.error("Error regenerating post:", error);
      alert("Failed to regenerate post. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  // Calculate batch information
  const currentBatch = Math.floor(currentQuestion / BATCH_SIZE);
  const batchStart = currentBatch * BATCH_SIZE;
  const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_QUESTIONS);
  const questionsInBatch = QUESTIONS.slice(batchStart, batchEnd);
  const currentQuestionInBatch = currentQuestion - batchStart;

  // Count completed in current batch
  const completedInBatch = answers.filter(
    a => a.questionIndex >= batchStart && a.questionIndex < batchEnd
  ).length;

  const completedCount = answers.length;
  const batchProgress = (completedInBatch / BATCH_SIZE) * 100;
  const isBatchComplete = completedInBatch >= BATCH_SIZE;

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-claude-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-coral border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-claude-bg">
      {/* Post Preview Modal */}
      {showPostPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-claude-bg rounded-claude-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-claude-text">
                  Your LinkedIn Post Preview
                </h2>
                <button
                  onClick={() => {
                    setShowPostPreview(false);
                    setCurrentPreview(null);
                    setEditingPost(null);
                  }}
                  className="p-2 hover:bg-claude-bg-tertiary rounded-claude"
                >
                  <CloseIcon />
                </button>
              </div>

              {isGeneratingPreview ? (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-accent-coral-light text-accent-coral">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>TeamPost is crafting your post...</span>
                  </div>
                </div>
              ) : currentPreview ? (
                <>
                  <div className="bg-white rounded-claude border border-claude-border p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-claude-bg-tertiary flex items-center justify-center">
                        <span className="text-sm font-medium text-claude-text">
                          {session?.user?.name?.[0] || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-claude-text text-sm">
                          {session?.user?.name || "Your Name"}
                        </p>
                        <p className="text-xs text-claude-text-tertiary">
                          Posting to LinkedIn
                        </p>
                      </div>
                    </div>

                    {editingPost !== null ? (
                      <textarea
                        value={editingPost}
                        onChange={(e) => setEditingPost(e.target.value)}
                        className="w-full h-64 p-3 border border-claude-border rounded-claude text-sm text-claude-text resize-none focus:outline-none focus:ring-2 focus:ring-accent-coral"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm text-claude-text">
                        {currentPreview.content}
                      </div>
                    )}
                  </div>

                  {/* Feedback Section */}
                  {showFeedbackInput ? (
                    <div className="mb-4 p-4 bg-claude-bg-tertiary rounded-claude">
                      <div className="flex items-center gap-2 mb-2">
                        <ChatBubbleIcon />
                        <span className="text-sm font-medium text-claude-text">Give Feedback</span>
                      </div>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="e.g., 'Make it shorter', 'Remove the part about X', 'Add more about Y', 'Make it more casual'..."
                        className="w-full h-24 p-3 border border-claude-border rounded-claude text-sm text-claude-text resize-none focus:outline-none focus:ring-2 focus:ring-accent-coral placeholder:text-claude-text-tertiary"
                        disabled={isRegenerating}
                      />
                      <div className="flex items-center justify-between mt-3">
                        <button
                          onClick={() => {
                            setShowFeedbackInput(false);
                            setFeedbackText('');
                          }}
                          className="text-sm text-claude-text-secondary hover:text-claude-text"
                          disabled={isRegenerating}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleFeedbackRegenerate}
                          disabled={!feedbackText.trim() || isRegenerating}
                          className="btn-primary text-sm disabled:opacity-50"
                        >
                          {isRegenerating ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Regenerating...
                            </span>
                          ) : (
                            <>
                              <RefreshIcon />
                              Regenerate
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Learned Preferences Notification */}
                  {learnedPreferences.length > 0 && (
                    <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-claude">
                      <div className="flex items-start gap-2">
                        <LightBulbIcon />
                        <div>
                          <p className="text-sm font-medium text-claude-text">Learned your preferences:</p>
                          <ul className="mt-1 text-sm text-claude-text-secondary">
                            {learnedPreferences.map((pref, i) => (
                              <li key={i}>• {pref}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (editingPost !== null) {
                              handleSavePost();
                            } else {
                              setEditingPost(currentPreview.content);
                            }
                          }}
                          className="btn-ghost text-sm"
                        >
                          <EditIcon />
                          {editingPost !== null ? "Save Changes" : "Edit Post"}
                        </button>

                        {!showFeedbackInput && editingPost === null && (
                          <button
                            onClick={() => setShowFeedbackInput(true)}
                            className="btn-ghost text-sm"
                          >
                            <ChatBubbleIcon />
                            Feedback & Regenerate
                          </button>
                        )}
                      </div>

                      <div className="flex gap-3">
                        {currentQuestion === batchEnd - 1 && completedInBatch >= BATCH_SIZE - 1 ? (
                          <button
                            onClick={handleFinishAndReview}
                            className="btn-primary"
                          >
                            <SparklesIcon />
                            Review Posts
                          </button>
                        ) : (
                          <button
                            onClick={handleApproveAndContinue}
                            className="btn-primary"
                          >
                            <CheckIcon />
                            Save to Schedule
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-claude-text-tertiary text-center">
                      This saves your draft to Scheduled Posts. Nothing will be posted until you review and publish.
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-claude-text-secondary">
                  Something went wrong. Please close and try again.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 bg-claude-bg/80 backdrop-blur-md border-b border-claude-border z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard">
            <Logo size="md" />
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-claude-text-secondary">
              {completedInBatch}/{BATCH_SIZE} in this batch
            </span>
            {isBatchComplete && (
              <button
                onClick={handleFinishAndReview}
                className="btn-primary text-sm"
              >
                <SparklesIcon />
                Review Posts
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-claude-bg-tertiary">
          <div
            className="h-full bg-accent-coral transition-all duration-500"
            style={{ width: `${batchProgress}%` }}
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Question progress dots - only show current batch */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {questionsInBatch.map((_, index) => {
            const actualIndex = batchStart + index;
            const isCompleted = answers.some((a) => a.questionIndex === actualIndex);
            const isCurrent = actualIndex === currentQuestion;

            return (
              <button
                key={actualIndex}
                onClick={() => handleQuestionChange(actualIndex)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? "bg-success"
                    : isCurrent
                    ? "bg-accent-coral scale-125"
                    : "bg-claude-border hover:bg-claude-border-strong"
                }`}
              />
            );
          })}
        </div>

        {/* Current question */}
        <div className="text-center mb-8">
          <span className="text-sm text-accent-coral font-medium">
            Question {currentQuestionInBatch + 1} of {BATCH_SIZE}
            {currentBatch > 0 && (
              <span className="text-claude-text-tertiary ml-2">
                (Set {currentBatch + 1})
              </span>
            )}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-claude-text mt-2 text-balance">
            {QUESTIONS[currentQuestion].text}
          </h1>
        </div>

        {/* Input mode toggle */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setInputMode('voice')}
            className={`flex items-center gap-2 px-4 py-2 rounded-claude text-sm font-medium transition-colors ${
              inputMode === 'voice'
                ? 'bg-accent-coral text-white'
                : 'bg-claude-bg-tertiary text-claude-text-secondary hover:bg-claude-border'
            }`}
          >
            <MicIcon />
            Voice
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-claude text-sm font-medium transition-colors ${
              inputMode === 'text'
                ? 'bg-accent-coral text-white'
                : 'bg-claude-bg-tertiary text-claude-text-secondary hover:bg-claude-border'
            }`}
          >
            <KeyboardIcon />
            Typing
          </button>
        </div>

        {/* Reassurance */}
        <p className="text-sm text-claude-text-tertiary text-center mb-4 max-w-md mx-auto">
          Just talk naturally. Ramble, go off on tangents, be yourself. The best posts come from real stories.
        </p>

        {/* Input area */}
        <div className="card max-w-lg mx-auto">
          {inputMode === 'voice' ? (
            <div>
              <VoiceRecorder
                ref={voiceRecorderRef}
                onRecordingComplete={handleRecordingComplete}
                disabled={isProcessing}
              />

              {isProcessing && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-coral-light text-accent-coral text-sm">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing your recording...
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your answer here... Share a story, experience, or thought."
                className="w-full h-48 p-4 border border-claude-border rounded-claude text-claude-text resize-none focus:outline-none focus:ring-2 focus:ring-accent-coral placeholder:text-claude-text-tertiary"
                disabled={isProcessing}
              />
              <button
                onClick={handleTextSubmit}
                disabled={!textInput.trim() || isProcessing}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating post...
                  </span>
                ) : (
                  <>
                    <SparklesIcon />
                    Create Draft
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 max-w-lg mx-auto">
          <button
            onClick={() => handleQuestionChange(Math.max(batchStart, currentQuestion - 1))}
            disabled={currentQuestion === batchStart}
            className="btn-ghost disabled:opacity-30"
          >
            <ArrowLeftIcon />
            Previous
          </button>

          <button
            onClick={handleSkip}
            disabled={currentQuestion === batchEnd - 1}
            className="btn-ghost text-claude-text-tertiary disabled:opacity-30"
          >
            Skip
            <ArrowRightIcon />
          </button>
        </div>

        {/* New batch option - only show on 5th question */}
        {currentQuestion === batchEnd - 1 && (
          <div className="mt-6 text-center">
            <button
              onClick={handleNewBatch}
              className="text-sm text-claude-text-tertiary hover:text-accent-coral"
            >
              Try different questions
            </button>
          </div>
        )}

        {/* Completed questions summary - only show current batch */}
        {completedInBatch > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CalendarIcon />
              <h2 className="text-lg font-semibold text-claude-text">
                Saved to Scheduled Posts
              </h2>
            </div>
            <p className="text-sm text-claude-text-tertiary text-center mb-4">
              These drafts will appear in your{" "}
              <Link href="/dashboard" className="text-accent-coral hover:underline">
                Scheduled Posts
              </Link>{" "}
              on the dashboard. Nothing posts until you publish
            </p>
            <div className="grid gap-3 max-w-lg mx-auto">
              {answers
                .filter(a => a.questionIndex >= batchStart && a.questionIndex < batchEnd)
                .sort((a, b) => a.questionIndex - b.questionIndex)
                .map((answer) => (
                  <div
                    key={answer.questionIndex}
                    className="flex items-center gap-3 p-3 rounded-claude bg-success/5 border border-success/20"
                  >
                    <div className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-claude-text truncate">
                        {QUESTIONS[answer.questionIndex].shortTitle}
                      </p>
                      <p className="text-xs text-claude-text-tertiary">
                        {answer.isVoice
                          ? `Voice - ${Math.floor((answer.duration || 0) / 60)}:${((answer.duration || 0) % 60).toString().padStart(2, "0")}`
                          : 'Text'
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {answer.generatedPost && (
                        <button
                          onClick={() => {
                            setCurrentPreview({
                              content: answer.generatedPost!,
                              questionIndex: answer.questionIndex,
                            });
                            setShowPostPreview(true);
                          }}
                          className="text-xs text-accent-coral hover:text-accent-coral-hover"
                        >
                          View Post
                        </button>
                      )}
                      <button
                        onClick={() => handleQuestionChange(answer.questionIndex)}
                        className="text-xs text-claude-text-tertiary hover:text-claude-text"
                      >
                        Redo
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Finish prompt - shows when batch is complete */}
        {isBatchComplete && (
          <div className="mt-12 text-center">
            <div className="inline-block p-6 rounded-claude-lg bg-success/10 border border-success/20">
              <div className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center mx-auto mb-4">
                <CheckIcon />
              </div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">
                Batch complete!
              </h3>
              <p className="text-claude-text-secondary mb-4">
                Review your {BATCH_SIZE} LinkedIn posts and schedule them.
              </p>
              <button
                onClick={handleFinishAndReview}
                className="btn-primary"
              >
                <SparklesIcon />
                Review & Schedule Posts
              </button>
              {batchEnd < TOTAL_QUESTIONS && (
                <button
                  onClick={() => setCurrentQuestion(batchEnd)}
                  className="btn-ghost mt-3 block mx-auto"
                >
                  Continue to next batch →
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
