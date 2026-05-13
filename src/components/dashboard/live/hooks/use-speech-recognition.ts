import { useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAudioVisualizer } from "./use-audio-visualizer";

interface UseSpeechRecognitionProps {
  onTranscript: (text: string) => void;
  onInterim?: (text: string) => void;
  onStop: () => void;
  onError: () => void;
  releaseWakeLock: () => void;
}

export function useSpeechRecognition({
  onTranscript,
  onInterim,
  onStop,
  onError,
  releaseWakeLock,
}: UseSpeechRecognitionProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null); // ← tambah
  const isListeningRef = useRef(false);
  const isConnectingRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const keepAliveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopRef = useRef<() => void>(() => {});

  const onTranscriptRef = useRef(onTranscript);
  const onInterimRef = useRef(onInterim);
  const onStopRef = useRef(onStop);
  const onErrorRef = useRef(onError);
  const releaseWakeLockRef = useRef(releaseWakeLock);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);
  useEffect(() => {
    onInterimRef.current = onInterim;
  }, [onInterim]);
  useEffect(() => {
    onStopRef.current = onStop;
  }, [onStop]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  useEffect(() => {
    releaseWakeLockRef.current = releaseWakeLock;
  }, [releaseWakeLock]);

  const {
    canvasRef,
    start: startVisualizer,
    stop: stopVisualizer,
  } = useAudioVisualizer();

  const cleanup = useCallback(() => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
    gainNodeRef.current?.disconnect(); // ← tambah
    workletNodeRef.current?.disconnect();
    audioCtxRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
    }
    gainNodeRef.current = null; // ← tambah
    workletNodeRef.current = null;
    audioCtxRef.current = null;
    streamRef.current = null;
    wsRef.current = null;
    stopVisualizer();
  }, [stopVisualizer]);

  const stop = useCallback(() => {
    if (!isListeningRef.current && !isConnectingRef.current) return;
    isListeningRef.current = false;
    isConnectingRef.current = false;
    startTimeRef.current = null;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "CloseStream" }));
    }
    setTimeout(() => {
      cleanup();
      releaseWakeLockRef.current();
      onStopRef.current();
    }, 300);
  }, [cleanup]);

  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  const getTimestamp = () => {
    const elapsed = Math.floor(
      (Date.now() - (startTimeRef.current ?? Date.now())) / 1000,
    );
    const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const ss = String(elapsed % 60).padStart(2, "0");
    return `[${mm}:${ss}]`;
  };

  const start = useCallback(async () => {
    if (isListeningRef.current || isConnectingRef.current) return false;
    isConnectingRef.current = true;

    try {
      // 1. Ambil Token
      const tokenRes = await fetch("/api/deepgram-token");
      if (!tokenRes.ok) throw new Error("Gagal mengambil token");
      const { token } = await tokenRes.json();
      if (!token) throw new Error("Token kosong dari server");
      if (!isMountedRef.current) return false;

      // 2. Izin Mikrofon
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return false;
      }
      streamRef.current = stream;

      // 3. Parameter Deepgram
      const params = new URLSearchParams({
        model: "nova-3",
        language: "id",
        encoding: "linear16",
        sample_rate: "16000",
        channels: "1",
        interim_results: "true",
        punctuate: "true",
        smart_format: "true",
        endpointing: "300", // sedikit longgar agar suara pelan tidak terpotong
        utterance_end_ms: "1000",
        no_delay: "true",
        filler_words: "false",
        vad_events: "true", // aktifkan VAD events
      });

      // 4. Buka WebSocket
      const ws = new WebSocket(`wss://api.deepgram.com/v1/listen?${params}`, [
        "token",
        token,
      ]);
      wsRef.current = ws;

      ws.onopen = async () => {
        if (!isMountedRef.current || wsRef.current !== ws) {
          ws.close();
          return;
        }
        isConnectingRef.current = false;
        isListeningRef.current = true;
        startTimeRef.current = Date.now();

        // KeepAlive setiap 8 detik
        keepAliveTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "KeepAlive" }));
          }
        }, 8000);

        // 5. AudioContext + AudioWorklet
        const audioCtx = new AudioContext({ sampleRate: 16000 });
        audioCtxRef.current = audioCtx;
        await audioCtx.resume();

        startVisualizer(stream, audioCtx);
        await audioCtx.audioWorklet.addModule("/worklets/pcm-processor.js");

        const source = audioCtx.createMediaStreamSource(stream);

        // Gain node — amplifikasi suara jauh agar terdeteksi Deepgram VAD
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 3.5; // +11dB, angkat suara pelan tanpa distorsi
        gainNodeRef.current = gainNode;

        const workletNode = new AudioWorkletNode(audioCtx, "pcm-processor");
        workletNodeRef.current = workletNode;

        workletNode.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(e.data);
          }
        };

        // source → gain → worklet → Deepgram
        source.connect(gainNode);
        gainNode.connect(workletNode);
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const data = JSON.parse(event.data as string);

          if (data.type === "Results") {
            const alt = data.channel?.alternatives?.[0];
            const transcript = alt?.transcript ?? "";
            if (!transcript) return;

            if (data.is_final) {
              onTranscriptRef.current(`${getTimestamp()} ${transcript}\n`);
              onInterimRef.current?.("");
            } else {
              onInterimRef.current?.(transcript);
            }
          }

          if (data.type === "UtteranceEnd") {
            onInterimRef.current?.("");
          }
        } catch {
          // ignore parse error
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket Error:", err);
        if (!isMountedRef.current || wsRef.current !== ws) return;
        toast.error("Koneksi rekaman bermasalah.");
        stopRef.current();
        onErrorRef.current();
      };

      ws.onclose = (e) => {
        console.warn(
          `WebSocket Closed: code=${e.code} reason=${e.reason} wasClean=${e.wasClean}`,
        );
        isConnectingRef.current = false;
        if (isListeningRef.current && isMountedRef.current) {
          isListeningRef.current = false;
          stopRef.current();
        }
      };

      return true;
    } catch (err) {
      console.error("Gagal memulai rekaman:", err);
      isConnectingRef.current = false;
      cleanup();
      isListeningRef.current = false;

      if (err instanceof DOMException && err.name === "NotAllowedError") {
        toast.error("Akses mikrofon ditolak. Izinkan mikrofon di browser.");
      } else {
        toast.error("Gagal memulai rekaman.");
      }

      onErrorRef.current();
      return false;
    }
  }, [cleanup, startVisualizer]);

  return { start, stop, canvasRef };
}
