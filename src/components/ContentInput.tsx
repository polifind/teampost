"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";

export interface ContentInputRef {
  stopRecording: () => void;
  isRecording: boolean;
}

interface ContentInputProps {
  onSubmit: (content: string, isVoice: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

const MicIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

const StopIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const ContentInput = forwardRef<ContentInputRef, ContentInputProps>(
  ({ onSubmit, placeholder = "Type or record your thoughts...", disabled, autoFocus }, ref) => {
    const [mode, setMode] = useState<"text" | "voice">("text");
    const [text, setText] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);
    const [isTranscribing, setIsTranscribing] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      stopRecording: () => {
        if (isRecording) {
          stopRecording();
        }
      },
      isRecording,
    }));

    useEffect(() => {
      if (autoFocus && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, [autoFocus]);

    useEffect(() => {
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, []);

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Set up audio analysis
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        // Start visualizing
        const updateLevel = () => {
          if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioLevel(average / 255);
          }
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();

        // Set up recording
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }

          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          await transcribeAndSubmit(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);

        // Start timer
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } catch (error) {
        console.error("Error starting recording:", error);
        alert("Could not access microphone. Please check permissions.");
      }
    };

    const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setAudioLevel(0);
      }
    };

    const transcribeAndSubmit = async (audioBlob: Blob) => {
      setIsTranscribing(true);
      try {
        // Convert to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64.split(",")[1]);
          };
          reader.readAsDataURL(audioBlob);
        });
        const audioBase64 = await base64Promise;

        // Transcribe
        const response = await fetch("/api/voice/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioData: audioBase64 }),
        });

        if (!response.ok) {
          throw new Error("Transcription failed");
        }

        const data = await response.json();
        onSubmit(data.transcription, true);
      } catch (error) {
        console.error("Transcription error:", error);
        alert("Failed to transcribe audio. Please try again.");
      } finally {
        setIsTranscribing(false);
      }
    };

    const handleTextSubmit = () => {
      if (text.trim()) {
        onSubmit(text.trim(), false);
        setText("");
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleTextSubmit();
      }
    };

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
      <div className="relative">
        {/* Recording overlay */}
        {isRecording && (
          <div className="absolute inset-0 bg-accent-coral/5 rounded-claude border-2 border-accent-coral flex items-center justify-center z-10">
            <div className="text-center">
              {/* Audio visualization */}
              <div className="flex items-center justify-center gap-1 mb-3 h-12">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-accent-coral rounded-full transition-all duration-75"
                    style={{
                      height: `${Math.max(4, audioLevel * 48 * (0.5 + Math.random() * 0.5))}px`,
                    }}
                  />
                ))}
              </div>
              <p className="text-lg font-mono text-accent-coral mb-2">
                {formatTime(recordingTime)}
              </p>
              <button
                onClick={stopRecording}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-coral text-white rounded-full hover:bg-accent-coral-hover transition-colors"
              >
                <StopIcon />
                Stop Recording
              </button>
            </div>
          </div>
        )}

        {/* Transcribing overlay */}
        {isTranscribing && (
          <div className="absolute inset-0 bg-claude-bg/90 rounded-claude flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-accent-coral border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-claude-text-secondary">Transcribing...</p>
            </div>
          </div>
        )}

        {/* Main input area */}
        <div className={`relative ${isRecording || isTranscribing ? "opacity-0" : ""}`}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isRecording || isTranscribing}
            rows={3}
            className="w-full p-4 pr-24 border border-claude-border rounded-claude resize-none focus:outline-none focus:ring-2 focus:ring-accent-coral text-claude-text placeholder:text-claude-text-tertiary"
          />

          {/* Action buttons */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button
              onClick={startRecording}
              disabled={disabled || isTranscribing}
              className="p-2 rounded-full bg-claude-bg-secondary hover:bg-claude-bg-tertiary text-claude-text-secondary hover:text-accent-coral transition-colors disabled:opacity-50"
              title="Record voice"
            >
              <MicIcon />
            </button>

            {text.trim() && (
              <button
                onClick={handleTextSubmit}
                disabled={disabled}
                className="p-2 rounded-full bg-accent-coral text-white hover:bg-accent-coral-hover transition-colors disabled:opacity-50"
                title="Send"
              >
                <SendIcon />
              </button>
            )}
          </div>
        </div>

        {/* Helper text */}
        <p className="text-xs text-claude-text-tertiary mt-2">
          Press Enter to send, Shift+Enter for new line, or click the mic to record
        </p>
      </div>
    );
  }
);

ContentInput.displayName = "ContentInput";

export default ContentInput;
