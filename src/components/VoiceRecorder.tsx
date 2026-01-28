"use client";

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  disabled?: boolean;
}

export interface VoiceRecorderRef {
  stopRecording: () => void;
  reset: () => void;
  isRecording: boolean;
}

const MicIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

const StopIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const VoiceRecorder = forwardRef<VoiceRecorderRef, VoiceRecorderProps>(
  ({ onRecordingComplete, disabled }, ref) => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [visualizerData, setVisualizerData] = useState<number[]>(new Array(30).fill(8));

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);
    const durationRef = useRef(0);

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      }
    };

    const reset = () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioBlob(null);
      setAudioUrl(null);
      setDuration(0);
      setIsPlaying(false);
      setIsRecording(false);
      setVisualizerData(new Array(30).fill(8));
    };

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      stopRecording,
      reset,
      isRecording,
    }));

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Set up audio context for visualization
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
        });

        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
          setAudioBlob(blob);
          setAudioUrl(URL.createObjectURL(blob));
        };

        mediaRecorder.start(100);
        setIsRecording(true);
        setDuration(0);
        durationRef.current = 0;
        setAudioBlob(null);
        setAudioUrl(null);

        // Start timer
        timerRef.current = setInterval(() => {
          durationRef.current += 1;
          setDuration(durationRef.current);
        }, 1000);

        // Start visualization
        const updateVisualizer = () => {
          if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            const normalized = Array.from(dataArray.slice(0, 30)).map(
              (v) => Math.max(8, (v / 255) * 40)
            );
            setVisualizerData(normalized);
          }
          animationRef.current = requestAnimationFrame(updateVisualizer);
        };
        updateVisualizer();
      } catch (error) {
        console.error("Error accessing microphone:", error);
        alert("Unable to access microphone. Please ensure you have granted microphone permissions.");
      }
    };

    const discardRecording = () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioBlob(null);
      setAudioUrl(null);
      setDuration(0);
      setVisualizerData(new Array(30).fill(8));
    };

    const togglePlayback = () => {
      if (!audioRef.current || !audioUrl) return;

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    };

    const handleSubmit = () => {
      if (audioBlob) {
        onRecordingComplete(audioBlob, duration);
      }
    };

    useEffect(() => {
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };
    }, [audioUrl]);

    return (
      <div className="flex flex-col items-center gap-6">
        {/* Visualizer */}
        <div className="w-full h-16 bg-claude-bg-tertiary rounded-claude-lg flex items-center justify-center px-4 gap-1 overflow-hidden">
          {visualizerData.map((height, index) => (
            <div
              key={index}
              className={`w-1.5 rounded-full transition-all duration-75 ${
                isRecording ? "bg-accent-coral" : audioBlob ? "bg-success" : "bg-claude-border-strong"
              }`}
              style={{ height: `${height}px` }}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-3xl font-mono text-claude-text">
          {formatTime(duration)}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {!audioBlob ? (
            // Recording controls
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={disabled}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                isRecording
                  ? "bg-error text-white recording-pulse"
                  : "bg-accent-coral text-white hover:bg-accent-coral-hover"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRecording ? <StopIcon /> : <MicIcon />}
            </button>
          ) : (
            // Playback controls
            <>
              <button
                onClick={discardRecording}
                className="w-12 h-12 rounded-full bg-claude-bg-tertiary text-claude-text-secondary hover:bg-error/10 hover:text-error flex items-center justify-center transition-colors"
              >
                <TrashIcon />
              </button>

              <button
                onClick={togglePlayback}
                className="w-16 h-16 rounded-full bg-claude-bg-tertiary text-claude-text hover:bg-claude-border flex items-center justify-center transition-colors"
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>

              <button
                onClick={handleSubmit}
                disabled={disabled}
                className="px-6 py-3 rounded-claude bg-accent-coral text-white font-medium hover:bg-accent-coral-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Draft
              </button>
            </>
          )}
        </div>

        {/* Hidden audio element for playback */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}

        {/* Instructions */}
        <p className="text-sm text-claude-text-tertiary text-center max-w-sm">
          {isRecording
            ? "Click the stop button when you're done speaking"
            : audioBlob
            ? "Listen to your recording, then click 'Create Draft' to generate a draft (won't post yet)"
            : "Click the microphone to start recording your answer"}
        </p>
      </div>
    );
  }
);

VoiceRecorder.displayName = "VoiceRecorder";

export default VoiceRecorder;
