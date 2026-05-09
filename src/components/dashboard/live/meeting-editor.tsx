"use client";

import { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

import { EditorHeader } from "./editor-header";
import { EditorFooter } from "./editor-footer";
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
}

type ActiveTab = "transcript" | "summary";

export function MeetingEditor({
  id,
  title,
  leader,
  content,
  setContent,
  onFinish,
  isSaving,
  saveStatus,
}: MeetingEditorProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [rawTranscript, setRawTranscript] = useState<string>(
    () => localStorage.getItem(`transcript-${id}`) ?? "",
  );
  const [summaryHtml, setSummaryHtml] = useState("");
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

  const { start, stop } = useSpeechRecognition({
    onTranscript: handleTranscript,
    onStop: handleStop,
    onError: handleError,
    releaseWakeLock,
  });

  // Simpan transkrip ke localStorage
  useEffect(() => {
    if (rawTranscript) {
      localStorage.setItem(`transcript-${id}`, rawTranscript);
    } else {
      localStorage.removeItem(`transcript-${id}`);
    }
  }, [rawTranscript, id]);

  // Re-acquire wake lock jika tab kembali aktif
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

  const toggleRecording = () => {
    if (isListening) {
      stop();
      releaseWakeLock();
      setIsListening(false);
      toast.info("Perekaman dihentikan");
    } else {
      const started = start();
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
    <Card className="h-full flex flex-col bg-background border shadow-md overflow-hidden flex-1 rounded-xl">
      <EditorHeader title={title} leader={leader} saveStatus={saveStatus} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <RecordingToolbar
          isListening={isListening}
          isSummarizing={isSummarizing}
          hasTranscript={!!rawTranscript}
          onToggleRecording={toggleRecording}
          onSummarize={generateSummary}
          onReset={handleReset}
        />

        <EditorCanvas
          activeTab={activeTab}
          rawTranscript={rawTranscript}
          summaryHtml={summaryHtml}
          isListening={isListening}
          onTranscriptChange={setRawTranscript}
          onTabChange={setActiveTab}
        />

        <div className="hidden">
          <EditorContent editor={editor} />
        </div>
      </div>

      <EditorFooter
        isSaving={isSaving}
        isUploading={false}
        onFinish={onFinish}
      />
    </Card>
  );
}
