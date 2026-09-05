// components/dashboard/live/recording-toolbar.tsx
import { Mic, Square, Sparkles, Loader2, RefreshCcw, SlidersHorizontal } from "lucide-react";
import React from "react";

interface RecordingToolbarProps {
  isListening: boolean;
  isBusy: boolean;
  isSummarizing: boolean;
  isMicrophoneTesting: boolean;
  hasTranscript: boolean;
  onToggleRecording: () => void;
  onSummarize: () => void;
  onReset: () => void;
  onTestMicrophone: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>; // ← tambah
}

export function RecordingToolbar({
  isListening,
  isBusy,
  isSummarizing,
  isMicrophoneTesting,
  hasTranscript,
  onToggleRecording,
  onSummarize,
  onReset,
  onTestMicrophone,
  canvasRef, // ← tambah
}: RecordingToolbarProps) {
  return (
    <div className="flex flex-col border-b">
      {/* Top label row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-medium text-foreground">Live Transcription</span>
        <button
          type="button"
          onClick={onTestMicrophone}
          disabled={isListening || isBusy || isMicrophoneTesting}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          title="Tes kualitas mikrofon"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {isMicrophoneTesting ? "Mengukur..." : "Tes mic"}
        </button>
        {/* Recording indicator dot */}
        {isListening && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Recording
          </span>
        )}
      </div>

      {/* Audio visualizer — tampil hanya saat isListening */}
      {isListening && (
        <div
          className="mx-4 mt-3 rounded-xl overflow-hidden"
          style={{
            background: "rgba(99,102,241,.06)",
            border: "1px solid rgba(99,102,241,.15)",
            height: "48px",
          }}
        >
          <canvas
            ref={canvasRef}
            width={600}
            height={48}
            className="w-full h-full"
          />
        </div>
      )}

      {/* Action buttons — Cancel / Stop / Pause style */}
      <div className="flex items-center justify-between px-8 py-4">
        {/* Reset / Cancel */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onReset}
            disabled={!hasTranscript || isListening || isBusy}
            className="w-12 h-12 rounded-full bg-muted flex items-center justify-center
                       disabled:opacity-30 hover:bg-muted/80 transition-colors active:scale-95"
            title="Hapus semua"
          >
            <RefreshCcw className="w-5 h-5 text-primary" />
          </button>
          <span className="text-[11px] text-muted-foreground">Reset</span>
        </div>

        {/* Stop / Start — center large button */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onToggleRecording}
            disabled={isBusy}
            className="w-14 h-14 rounded-full flex items-center justify-center
                       transition-all active:scale-95 bg-red-500 hover:bg-red-600"
          >
            {isListening ? (
              <Square className="w-5 h-5 fill-white text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </button>
          <span className="text-[11px] text-muted-foreground">
            {isBusy ? (isListening ? "Memproses" : "Menyiapkan") : isListening ? "Stop" : "Rekam"}
          </span>
        </div>

        {/* Summarize */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onSummarize}
            disabled={!hasTranscript || isListening || isSummarizing}
            className="w-12 h-12 rounded-full bg-muted flex items-center justify-center
                       disabled:opacity-30 hover:bg-muted/80 transition-colors active:scale-95"
            title="Rangkum dengan AI"
          >
            {isSummarizing ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-primary" />
            )}
          </button>
          <span className="text-[11px] text-muted-foreground">Rangkum</span>
        </div>
      </div>
    </div>
  );
}
