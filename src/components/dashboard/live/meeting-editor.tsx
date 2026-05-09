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

type ActiveTab = "transcript" | "summary";

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

  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [rawTranscript, setRawTranscript] = useState<string>("");
  const [summaryHtml, setSummaryHtml] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("transcript");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isIntentionallyListening = useRef<boolean>(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editorProps: {
      attributes: { class: "hidden" },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    immediatelyRender: false,
  });

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
        // silent
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
      setSummaryHtml(result.data);
      setActiveTab("summary"); // otomatis pindah ke tab rangkuman
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
  };

  if (!editor) return null;

  return (
    <Card className="h-full flex flex-col bg-background border shadow-md overflow-hidden flex-1 rounded-xl">
      <EditorHeader title={title} leader={leader} saveStatus={saveStatus} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOOLBAR */}
        <div className="px-4 py-2 border-b flex items-center gap-2">
          <Button
            onClick={toggleRecording}
            size="sm"
            variant={isListening ? "destructive" : "secondary"}
            className={`h-8 gap-2 rounded-md transition-all ${
              isListening ? "animate-pulse ring-2 ring-destructive/20" : ""
            }`}
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
              className="h-8 gap-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
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
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-destructive transition-colors"
              title="Hapus semua"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
            </Button>
          )}

          {isListening && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              <p className="text-xs text-muted-foreground font-medium">
                Mendengarkan...
              </p>
            </div>
          )}
        </div>

        {/* TABS — hanya tampil jika sudah ada rangkuman */}
        {summaryHtml && (
          <div className="flex border-b px-4 gap-0">
            <button
              onClick={() => setActiveTab("transcript")}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "transcript"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Transkrip
            </button>
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "summary"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Rangkuman AI
            </button>
          </div>
        )}

        {/* CANVAS TRANSKRIP */}
        {activeTab === "transcript" && (
          <div className="flex-1 overflow-hidden px-6 py-5">
            {rawTranscript ? (
              <textarea
                value={rawTranscript}
                onChange={(e) => setRawTranscript(e.target.value)}
                disabled={isListening}
                className={`w-full h-full min-h-100 max-h-full text-sm leading-relaxed bg-transparent border-none outline-none resize-none text-foreground overflow-y-auto ${
                  isListening ? "cursor-not-allowed opacity-60" : ""
                }`}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Tekan <strong className="text-foreground">Rekam Suara</strong>{" "}
                untuk mulai mencatat...
              </p>
            )}
          </div>
        )}

        {/* CANVAS RANGKUMAN */}
        {activeTab === "summary" && summaryHtml && (
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-foreground [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: summaryHtml }}
            />
          </div>
        )}

        {/* Hidden editor */}
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
