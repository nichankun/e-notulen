import { useRef, useEffect } from "react";
import { toast } from "sonner";

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

interface UseSpeechRecognitionProps {
  onTranscript: (text: string) => void;
  onStop: () => void;
  onError: () => void;
  releaseWakeLock: () => void;
}

export function useSpeechRecognition({
  onTranscript,
  onStop,
  onError,
  releaseWakeLock,
}: UseSpeechRecognitionProps) {
  const isMounted = useRef<boolean>(true);
  const isIntentionallyListening = useRef<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecognitionActive = useRef<boolean>(false);
  const isIOSRef = useRef<boolean>(
    typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent),
  );

  useEffect(() => {
    isMounted.current = true;
    const isIOS = isIOSRef.current;
    const win = window as unknown as WindowWithSpeech;
    const SpeechRecognitionAPI =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      if (isIOS) {
        toast.error("Gunakan Safari untuk fitur rekam suara di iPhone/iPad.");
      }
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false; // false lebih stabil di semua platform
    recognition.interimResults = false; // false agar tidak dobel
    recognition.lang = "id-ID";

    const restartDelay = isIOS ? 500 : 100;

    const startRecognition = () => {
      if (
        !isMounted.current ||
        !isIntentionallyListening.current ||
        isRecognitionActive.current
      )
        return;
      try {
        recognition.start();
        isRecognitionActive.current = true;
      } catch {
        isRecognitionActive.current = false;
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result?.isFinal) {
          const text = result[0]?.transcript.trim();
          if (text) onTranscript(text + " ");
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      isRecognitionActive.current = false;

      if (event.error === "no-speech") {
        if (isIntentionallyListening.current && isMounted.current) {
          setTimeout(startRecognition, restartDelay);
        }
        return;
      }

      if (event.error === "not-allowed") {
        isIntentionallyListening.current = false;
        releaseWakeLock();
        onError();
        toast.error(
          isIOS
            ? "Izinkan mikrofon di Settings → Safari → Microphone."
            : "Akses mikrofon ditolak.",
        );
        return;
      }

      if (event.error === "network") {
        toast.error("Koneksi internet terputus.");
      }
    };

    recognition.onend = () => {
      isRecognitionActive.current = false;
      if (isIntentionallyListening.current && isMounted.current) {
        setTimeout(startRecognition, restartDelay);
      } else {
        releaseWakeLock();
        onStop();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isMounted.current = false;
      isRecognitionActive.current = false;
      try {
        recognition.stop();
      } catch {}
      releaseWakeLock();
    };
  }, [releaseWakeLock, onTranscript, onStop, onError]);

  const start = () => {
    if (!recognitionRef.current) {
      toast.error(
        isIOSRef.current
          ? "Gunakan Safari untuk fitur rekam suara di iPhone/iPad."
          : "Browser tidak mendukung perekaman suara.",
      );
      return false;
    }
    isIntentionallyListening.current = true;
    // Panggil via recognition langsung, bukan start() manual
    if (!isRecognitionActive.current) {
      try {
        recognitionRef.current.start();
        isRecognitionActive.current = true;
      } catch {
        isRecognitionActive.current = false;
      }
    }
    return true;
  };

  const stop = () => {
    isIntentionallyListening.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {}
  };

  return { start, stop };
}
