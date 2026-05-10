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

  useEffect(() => {
    isMounted.current = true;
    const win = window as unknown as WindowWithSpeech;
    const SpeechRecognitionAPI =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true; // Lebih stabil untuk mobile agar tidak sering mati-nyala
    recognition.interimResults = true; // langsung deteksi saat bicara
    recognition.lang = "id-ID";

    let lastProcessedIndex = -1;
    let isRecognitionActive = false;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

    const startRecognition = () => {
      if (!isMounted.current || !isIntentionallyListening.current) return;
      try {
        recognition.start();
        isRecognitionActive = true;
      } catch {
        isRecognitionActive = false;
      }
    };

    const stopHeartbeat = () => {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
    };

    const startHeartbeat = () => {
      stopHeartbeat();
      heartbeatTimer = setInterval(() => {
        if (
          isIntentionallyListening.current &&
          isMounted.current &&
          !isRecognitionActive
        ) {
          startRecognition();
        }
        if (!isIntentionallyListening.current) stopHeartbeat();
      }, 2000);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscripts = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (i <= lastProcessedIndex) continue;
        const result = event.results[i];
        if (result?.isFinal) {
          finalTranscripts += result[0]?.transcript + " ";
          lastProcessedIndex = i;
        }
      }
      if (finalTranscripts) onTranscript(finalTranscripts);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      isRecognitionActive = false;

      // Error "no-speech" sangat sering terjadi di mobile jika hening sebentar.
      // Jangan hentikan proses jika hanya karena no-speech.
      if (event.error === "no-speech") return;

      if (event.error === "not-allowed") {
        isIntentionallyListening.current = false;
        stopHeartbeat();
        releaseWakeLock();
        onError();
        toast.error("Akses mikrofon ditolak.");
      } else if (event.error === "network") {
        toast.error("Koneksi internet terputus.");
      }
    };

    recognition.onend = () => {
      isRecognitionActive = false;
      lastProcessedIndex = -1;
      if (isIntentionallyListening.current && isMounted.current) {
        // Gunakan timeout lebih lama sedikit untuk mobile agar hardware mic sempat 'istirahat'
        setTimeout(startRecognition, 500);
      } else {
        stopHeartbeat();
        releaseWakeLock();
        onStop();
      }
    };

    recognitionRef.current = recognition;

    const ext = recognitionRef as unknown as {
      _start: () => void;
      _startHeartbeat: () => void;
      _stopHeartbeat: () => void;
    };
    ext._start = startRecognition;
    ext._startHeartbeat = startHeartbeat;
    ext._stopHeartbeat = stopHeartbeat;

    return () => {
      isMounted.current = false;
      stopHeartbeat();
      recognition.stop();
      releaseWakeLock();
    };
  }, [releaseWakeLock, onTranscript, onStop, onError]);

  const start = () => {
    if (!recognitionRef.current) {
      toast.error("Browser tidak mendukung perekaman suara");
      return false;
    }
    isIntentionallyListening.current = true;
    const ext = recognitionRef as unknown as {
      _start: () => void;
      _startHeartbeat: () => void;
    };
    ext._start?.();
    ext._startHeartbeat?.();
    return true;
  };

  const stop = () => {
    isIntentionallyListening.current = false;
    const ext = recognitionRef as unknown as { _stopHeartbeat: () => void };
    ext._stopHeartbeat?.();
    try {
      recognitionRef.current?.stop();
    } catch {}
  };

  return { start, stop };
}
