"use client";

import { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { RecordingToolbar } from "./recording-toolbar";
import { EditorCanvas } from "./editor-canvas";
import { useWakeLock } from "./hooks/use-wake-lock";
import { useSpeechRecognition } from "./hooks/use-speech-recognition";

interface MeetingEditorProps {
  id: string;
  title?: string;
  leader?: string;
  content: string;
  setContent: (val: string) => void;
  onFinish: () => void;
  isSaving: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
  initialTranscript?: string;
  initialSummaryHtml?: string;
}

type ActiveTab = "transcript" | "summary";

export function MeetingEditor({
  id,
  title,
  leader,
  content,
  setContent,
  onFinish,
  saveStatus,
  initialTranscript = "",
  initialSummaryHtml = "",
}: MeetingEditorProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [rawTranscript, setRawTranscript] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`transcript-${id}`);
      if (saved) return saved;
    }
    return initialTranscript;
  });
  const [summaryHtml, setSummaryHtml] = useState(initialSummaryHtml);
  const [activeTab, setActiveTab] = useState<ActiveTab>("transcript");

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: { attributes: { class: "hidden" } },
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
    immediatelyRender: false,
  });

  const { requestWakeLock, releaseWakeLock } = useWakeLock();
  const handleStop = useCallback(() => setIsListening(false), []);
  const handleError = useCallback(() => setIsListening(false), []);
  const handleTranscript = useCallback(
    (text: string) => setRawTranscript((prev) => prev + text),
    [],
  );

  // ← destructure canvasRef
  const { start, stop, canvasRef } = useSpeechRecognition({
    onTranscript: handleTranscript,
    onStop: handleStop,
    onError: handleError,
    releaseWakeLock,
  });

  // Sync transcript ke localStorage
  useEffect(() => {
    if (rawTranscript) {
      localStorage.setItem(`transcript-${id}`, rawTranscript);
    } else {
      localStorage.removeItem(`transcript-${id}`);
    }
  }, [rawTranscript, id]);

  // Auto-save ke DB
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!content && !rawTranscript && !summaryHtml) return;
      try {
        await fetch(`/api/meetings/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            transcript: rawTranscript || undefined,
            summaryHtml: summaryHtml || undefined,
          }),
        });
      } catch (err) {
        console.error("Auto-save gagal:", err);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [content, rawTranscript, summaryHtml, id]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isListening) {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isListening, requestWakeLock]);

  // ← fix: start() adalah async, harus di-await
  const toggleRecording = async () => {
    if (isListening) {
      stop();
      releaseWakeLock();
      setIsListening(false);
      toast.info("Perekaman dihentikan");
    } else {
      const started = await start();
      if (started) {
        setIsListening(true);
        requestWakeLock();
      }
    }
  };

  const generateSummary = async () => {
    if (!rawTranscript.trim()) return;
    setIsSummarizing(true);
    const toastId = toast.loading("Merangkum dengan AI...");
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawTranscript }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      editor?.commands.setContent(result.data);
      setSummaryHtml(result.data);
      setActiveTab("summary");
      toast.success("Rangkuman berhasil dibuat!", { id: toastId });
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Gagal memproses AI",
        { id: toastId },
      );
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleReset = () => {
    setRawTranscript("");
    setSummaryHtml("");
    setActiveTab("transcript");
    editor?.commands.setContent("");
    localStorage.removeItem(`transcript-${id}`);
  };

  if (!editor) return null;

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden flex-1 relative min-h-0">
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0 z-20">
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          {title && (
            <p className="hidden lg:block text-sm font-semibold text-foreground truncate">
              {title}
            </p>
          )}
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest shrink-0">
              Pimpinan
            </p>
            <p className="text-[10px] font-semibold text-muted-foreground/70 truncate">
              {leader || "-"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex flex-col items-end gap-0.5">
            {saveStatus === "saving" && (
              <span className="text-[10px] text-primary animate-pulse font-medium">
                Menyimpan...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-[10px] text-emerald-500/60 font-medium">
                Otomatis Tersimpan
              </span>
            )}
          </div>

          <Button
            onClick={onFinish}
            variant="outline"
            size="sm"
            className="h-8 px-3 text-[11px] font-bold border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all active:scale-95"
          >
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
            SELESAI
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <EditorCanvas
            activeTab={activeTab}
            rawTranscript={rawTranscript}
            summaryHtml={summaryHtml}
            isListening={isListening}
            onTranscriptChange={setRawTranscript}
            onTabChange={setActiveTab}
          />
        </div>

        <div className="w-full bg-background border-t border-border p-4 shrink-0 fixed bottom-16 left-0 right-0 z-40 lg:relative lg:inset-auto lg:p-6 lg:border-t-0 lg:z-10">
          <RecordingToolbar
            isListening={isListening}
            isSummarizing={isSummarizing}
            hasTranscript={!!rawTranscript}
            onToggleRecording={toggleRecording}
            onSummarize={generateSummary}
            onReset={handleReset}
            canvasRef={canvasRef} // ← tambah
          />
        </div>

        <div className="hidden">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
