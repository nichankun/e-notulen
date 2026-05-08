"use client";

import { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Square, Sparkles, Loader2, RefreshCcw } from "lucide-react";

import { EditorHeader } from "./editor-header";
import { PhotoDocumentation } from "./photo-documentation";
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
  photos: string[];
  setPhotos: (val: string[]) => void;
  onFinish: () => void;
  isSaving: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
}

export function MeetingEditor({
  title,
  leader,
  content,
  setContent,
  photos = [],
  setPhotos,
  onFinish,
  isSaving,
  saveStatus,
}: MeetingEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Voice & AI States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [rawTranscript, setRawTranscript] = useState<string>("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Ref untuk melacak apakah user SECARA SENGAJA ingin mikrofon menyala
  const isIntentionallyListening = useRef<boolean>(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editorProps: {
      attributes: {
        class:
          "max-w-none focus:outline-none min-h-[300px] p-6 bg-transparent text-foreground [&_h3]:text-lg [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1",
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Inisialisasi Web Speech API
  useEffect(() => {
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
        // Jangan tampilkan pesan error jika cuma karena keheningan (no-speech)
        if (event.error !== "no-speech") {
          console.error("Speech Recognition Error:", event.error);
        }

        if (event.error === "not-allowed") {
          isIntentionallyListening.current = false; // Paksa berhenti niat merekam
          setIsListening(false);
          toast.error(
            "Akses mikrofon ditolak. Pastikan URL menggunakan HTTPS dan izin mikrofon diberikan.",
          );
        } else if (event.error === "network") {
          toast.error("Koneksi internet terputus, perekaman suara gagal.");
        }
      };

      // Logika Auto-Restart jika mati karena diam
      recognition.onend = () => {
        // Jika mikrofon mati TAPI user belum menekan tombol stop, NYALAKAN LAGI!
        if (isIntentionallyListening.current) {
          try {
            recognition.start();
          } catch (err) {
            console.error("Gagal auto-restart mikrofon:", err);
            setIsListening(false);
          }
        } else {
          // Benar-benar berhenti karena user menekan tombol
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Browser ini tidak mendukung fitur perekaman suara");
      return;
    }

    if (isListening || isIntentionallyListening.current) {
      isIntentionallyListening.current = false;
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Error stopping recognition", err);
      }
      setIsListening(false);
      toast.info("Perekaman dihentikan");
    } else {
      isIntentionallyListening.current = true;
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success("Mulai merekam suara... Sistem akan terus mendengarkan.");
      } catch (err) {
        const error = err as Error;
        if (error.name === "InvalidStateError") {
          setIsListening(true);
          toast.info("Mikrofon sebenarnya sudah berjalan");
        } else {
          console.error("Gagal memulai mikrofon:", err);
          toast.error("Gagal menyalakan mikrofon.");
          isIntentionallyListening.current = false;
        }
      }
    }
  };

  const resetTranscript = () => {
    setRawTranscript("");
    editor?.commands.setContent("");
    toast.info("Transkrip direset");
  };

  const generateSummary = async () => {
    if (!rawTranscript.trim()) {
      toast.error("Belum ada suara yang direkam!");
      return;
    }

    setIsSummarizing(true);
    toast.loading("AI sedang menganalisis dan merangkum rapat...", {
      id: "ai-loading",
    });

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawTranscript }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Terjadi kesalahan pada API AI");
      }

      editor?.commands.setContent(result.data);

      toast.success("Notulen berhasil dirangkum secara cerdas!", {
        id: "ai-loading",
      });
      // PERBAIKAN: Mengganti (error: any) menjadi (error: unknown)
    } catch (error: unknown) {
      console.error("AI Summarization Error:", error);
      // PERBAIKAN: Memastikan error adalah objek Error sebelum mengambil pesannya
      const errorMessage =
        error instanceof Error ? error.message : "Gagal melakukan rangkuman AI";

      toast.error(errorMessage, {
        id: "ai-loading",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newPhotoUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const options = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);

        const fileExt = file.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

        const { error } = await supabase.storage
          .from("notulen")
          .upload(fileName, compressedFile);
        if (error) throw error;

        const { data } = supabase.storage
          .from("notulen")
          .getPublicUrl(fileName);
        if (data.publicUrl) newPhotoUrls.push(data.publicUrl);
      }
      setPhotos([...photos, ...newPhotoUrls]);
      toast.success("Foto berhasil diunggah");
      // PERBAIKAN: Menambahkan `unknown` pada blok catch
    } catch (error: unknown) {
      console.error("Error uploading photo:", error);
      toast.error("Gagal mengunggah foto");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!editor) return null;

  return (
    <Card className="h-full flex flex-col bg-card border shadow-md overflow-hidden flex-1">
      <EditorHeader title={title} leader={leader} saveStatus={saveStatus} />

      <div className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6 flex flex-col gap-6">
        <div className="bg-background rounded-xl border p-6 flex flex-col items-center justify-center text-center gap-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              Perekam Notulen Otomatis
            </h3>
            <p className="text-sm text-muted-foreground">
              Tekan tombol rekam dan biarkan sistem mendengarkan diskusi.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              onClick={toggleRecording}
              size="lg"
              variant={isListening ? "destructive" : "default"}
              className={`rounded-full h-16 px-8 gap-3 text-base shadow-lg transition-all ${
                isListening ? "animate-pulse" : ""
              }`}
            >
              {isListening ? (
                <>
                  <Square className="w-5 h-5 fill-current" />
                  Hentikan Rekaman
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Mulai Rekam Suara
                </>
              )}
            </Button>

            {rawTranscript && !isListening && (
              <Button
                onClick={generateSummary}
                disabled={isSummarizing}
                size="lg"
                className="rounded-full h-16 px-8 gap-3 text-base shadow-lg bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                {isSummarizing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                Rangkum dengan AI
              </Button>
            )}

            {rawTranscript && (
              <Button
                onClick={resetTranscript}
                variant="outline"
                size="icon"
                className="h-16 w-16 rounded-full"
                title="Reset Transkrip"
              >
                <RefreshCcw className="w-5 h-5 text-muted-foreground" />
              </Button>
            )}
          </div>

          {(rawTranscript || isListening) && (
            <div className="w-full text-left mt-4 p-4 bg-muted/30 rounded-lg border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Transkrip Langsung:
              </span>
              <p className="text-sm leading-relaxed text-foreground/80 min-h-15">
                {rawTranscript || (
                  <span className="italic text-muted-foreground">
                    Mendengarkan...
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {!editor.isEmpty && (
          <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-muted/30 px-4 py-3 border-b flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Hasil Rangkuman AI
              </span>
            </div>
            <EditorContent editor={editor} />
          </div>
        )}

        <PhotoDocumentation
          photos={photos}
          isUploading={isUploading}
          fileInputRef={fileInputRef}
          onUpload={handlePhotoUpload}
          onRemove={(index) => {
            const newPhotos = [...photos];
            newPhotos.splice(index, 1);
            setPhotos(newPhotos);
          }}
        />
      </div>

      <EditorFooter
        isSaving={isSaving}
        isUploading={isUploading}
        onFinish={onFinish}
      />
    </Card>
  );
}
