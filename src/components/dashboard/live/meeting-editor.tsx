"use client";

import { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Square, Sparkles, Loader2, RefreshCcw } from "lucide-react";

import { EditorHeader } from "./editor-header";
import { EditorFooter } from "./editor-footer";

// --- DEKLARASI TIPE SPEECH RECOGNITION ---
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
    | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
}
interface WindowWithSpeech extends Window {
  SpeechRecognition?: { new (): SpeechRecognition };
  webkitSpeechRecognition?: { new (): SpeechRecognition };
}
// ------------------------------------------------------------

interface MeetingEditorProps {
  title?: string;
  leader?: string;
  content: string;
  setContent: (val: string) => void;
  onFinish: () => void;
  isSaving: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
}

export function MeetingEditor({
  title,
  leader,
  content,
  setContent,
  onFinish,
  isSaving,
  saveStatus,
}: MeetingEditorProps) {
  const isMounted = useRef<boolean>(true);

  // Voice & AI States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [rawTranscript, setRawTranscript] = useState<string>("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isIntentionallyListening = useRef<boolean>(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editorProps: {
      attributes: {
        class:
          "max-w-none focus:outline-none min-h-[500px] p-6 md:p-10 bg-transparent text-foreground prose prose-sm md:prose-base dark:prose-invert [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1.5",
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Inisialisasi Web Speech API
  useEffect(() => {
    isMounted.current = true;
    const win = window as unknown as WindowWithSpeech;
    const SpeechRecognitionAPI =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "id-ID";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscripts = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result && result.isFinal) {
            finalTranscripts += result[0]?.transcript + " ";
          }
        }
        if (finalTranscripts) {
          setRawTranscript((prev) => prev + finalTranscripts);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "not-allowed") {
          isIntentionallyListening.current = false;
          setIsListening(false);
          toast.error("Akses mikrofon ditolak.");
        } else if (event.error === "network") {
          toast.error("Koneksi internet terputus.");
        }
      };

      recognition.onend = () => {
        if (isIntentionallyListening.current && isMounted.current) {
          try {
            recognition.start();
          } catch {
            // Perbaikan: Menghapus variabel 'err' yang tidak digunakan
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      isMounted.current = false;
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Browser tidak mendukung perekaman suara");
      return;
    }

    if (isListening || isIntentionallyListening.current) {
      isIntentionallyListening.current = false;
      try {
        recognitionRef.current.stop();
      } catch {
        // Perbaikan: Menghapus variabel 'e' yang tidak digunakan
      }
      setIsListening(false);
      toast.info("Perekaman dihentikan");
    } else {
      isIntentionallyListening.current = true;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name === "InvalidStateError") {
          setIsListening(true);
        } else {
          toast.error("Gagal menyalakan mikrofon.");
          isIntentionallyListening.current = false;
        }
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

  if (!editor) return null;

  return (
    <Card className="h-full flex flex-col bg-background border shadow-md overflow-hidden flex-1 rounded-xl">
      <EditorHeader title={title} leader={leader} saveStatus={saveStatus} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* ========================================= */}
        {/* AI & VOICE TOOLBAR - SIMPEL & MINIMALIS */}
        {/* ========================================= */}
        <div className="px-4 py-2 bg-muted/30 border-b flex flex-wrap items-center gap-2 sticky top-0 z-10 backdrop-blur-md">
          <Button
            onClick={toggleRecording}
            size="sm"
            variant={isListening ? "destructive" : "secondary"}
            className={`h-8 gap-2 rounded-md transition-all ${isListening ? "animate-pulse ring-2 ring-destructive/20" : ""}`}
          >
            {isListening ? (
              <Square className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Mic className="w-3.5 h-3.5" />
            )}
            {isListening ? "Berhenti" : "Rekam Suara"}
          </Button>

          {rawTranscript && !isListening && (
            <Button
              onClick={generateSummary}
              disabled={isSummarizing}
              size="sm"
              className="h-8 gap-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
            >
              {isSummarizing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Rangkum AI
            </Button>
          )}

          {rawTranscript && (
            <Button
              onClick={() => {
                setRawTranscript("");
                editor.commands.setContent("");
              }}
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-destructive transition-colors"
              title="Hapus Transkrip"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
            </Button>
          )}

          {/* Transkrip Teks Berjalan */}
          {(isListening || rawTranscript) && (
            <div className="ml-auto flex items-center gap-2 max-w-[40%] sm:max-w-[50%] px-3 py-1 bg-background rounded-md border shadow-sm">
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${isListening ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}
              />
              <p className="text-xs text-muted-foreground truncate font-medium">
                {rawTranscript || "Mendengarkan..."}
              </p>
            </div>
          )}
        </div>
        {/* ========================================= */}

        {/* EDITOR AREA */}
        <div
          className="flex-1 bg-background cursor-text"
          onClick={() => editor.commands.focus()}
        >
          <EditorContent editor={editor} className="min-h-full" />
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
