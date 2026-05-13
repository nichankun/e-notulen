import { useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAudioVisualizer } from "./use-audio-visualizer";

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
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isListeningRef = useRef(false);
  const isConnectingRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const keepAliveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopRef = useRef<() => void>(() => {});

  const onTranscriptRef = useRef(onTranscript);
  const onStopRef = useRef(onStop);
  const onErrorRef = useRef(onError);
  const releaseWakeLockRef = useRef(releaseWakeLock);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);
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
    processorRef.current?.disconnect();
    audioCtxRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
    }
    processorRef.current = null;
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
      if (!token) throw new Error("Token tidak valid atau kosong dari server");
      if (!isMountedRef.current) return false;

      // 2. Ambil Izin Mikrofon
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

      // 3. Konfigurasi Params
      const params = new URLSearchParams({
        language: "id",
        model: "nova-3",
        smart_format: "true",
        punctuate: "true",
        interim_results: "true",
        encoding: "linear16",
        sample_rate: "16000",
      });

      // 4. Buka WebSocket
      const ws = new WebSocket(
        `wss://api.deepgram.com/v1/listen?${params.toString()}`,
        ["token", token],
      );
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current || wsRef.current !== ws) {
          ws.close();
          return;
        }
        isConnectingRef.current = false;
        isListeningRef.current = true;
        startTimeRef.current = Date.now();

        // KeepAlive setiap 3 detik
        keepAliveTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "KeepAlive" }));
          }
        }, 3000);

        // 5. AudioContext — pakai satu instance untuk processor & visualizer
        const audioCtx = new AudioContext({ sampleRate: 16000 });
        audioCtxRef.current = audioCtx;

        // Start visualizer dengan audioCtx yang sama
        startVisualizer(stream, audioCtx);

        const source = audioCtx.createMediaStreamSource(stream);

        const processor = audioCtx.createScriptProcessor(1024, 1, 1);

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const float32 = e.inputBuffer.getChannelData(0);
          const int16 = new Int16Array(float32.length);
          for (let i = 0; i < float32.length; i++) {
            const s = Math.max(-1, Math.min(1, float32[i]));
            int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          ws.send(int16.buffer);
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);
        processorRef.current = processor;
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const data = JSON.parse(event.data as string);
          if (data.type === "Results") {
            const transcript =
              data.channel?.alternatives?.[0]?.transcript ?? "";
            if (transcript && data.is_final) {
              onTranscriptRef.current(`${getTimestamp()} ${transcript}\n`);
            }
          }
        } catch {}
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
