// components/dashboard/live/recording-toolbar.tsx
import { Button } from "@/components/ui/button";
import { Mic, Square, Sparkles, Loader2, RefreshCcw } from "lucide-react";

interface RecordingToolbarProps {
  isListening: boolean;
  isSummarizing: boolean;
  hasTranscript: boolean;
  onToggleRecording: () => void;
  onSummarize: () => void;
  onReset: () => void;
}

export function RecordingToolbar({
  isListening,
  isSummarizing,
  hasTranscript,
  onToggleRecording,
  onSummarize,
  onReset,
}: RecordingToolbarProps) {
  return (
    <div className="px-3 py-2 border-b flex items-center gap-1.5 overflow-hidden">
      <Button
        onClick={onToggleRecording}
        size="sm"
        variant={isListening ? "destructive" : "default"}
        className={`h-8 gap-1.5 rounded-md transition-all shrink-0 ${
          isListening ? "animate-pulse ring-2 ring-destructive/20" : ""
        }`}
      >
        {isListening ? (
          <Square className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Mic className="w-3.5 h-3.5" />
        )}
        <span className="text-xs">{isListening ? "Berhenti" : "Rekam"}</span>
      </Button>

      {hasTranscript && !isListening && (
        <Button
          onClick={onSummarize}
          disabled={isSummarizing}
          size="sm"
          className="h-8 gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-all shrink-0"
        >
          {isSummarizing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span className="text-xs">Rangkum</span>
        </Button>
      )}

      {hasTranscript && (
        <Button
          onClick={onReset}
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive transition-colors"
          title="Hapus semua"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
        </Button>
      )}

      {isListening && (
        <div className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md min-w-0">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <p className="text-xs text-muted-foreground font-medium truncate">
            Jangan tutup
          </p>
        </div>
      )}
    </div>
  );
}
