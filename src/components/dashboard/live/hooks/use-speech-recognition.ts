"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAudioVisualizer } from "./use-audio-visualizer";

interface UseSpeechRecognitionProps {
  onTranscript: (text: string) => void;
  onInterim?: (text: string) => void;
  onStop: () => void;
  onError: () => void;
  releaseWakeLock: () => void;
}

const MAX_AUDIO_BUFFER_BYTES = 1_000_000;
const MAX_SOCKET_BUFFERED_BYTES = 512_000;
const MAX_RECONNECT_ATTEMPTS = 5;

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
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const compressorNodeRef = useRef<DynamicsCompressorNode | null>(null);
  const silentOutputRef = useRef<GainNode | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const audioQueueBytesRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const allowReconnectRef = useRef(false);
  const isListeningRef = useRef(false);
  const isConnectingRef = useRef(false);
  const isStoppingRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const keepAliveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    allowReconnectRef.current = false;
    audioQueueRef.current = [];
    audioQueueBytesRef.current = 0;
    silentOutputRef.current?.disconnect();
    compressorNodeRef.current?.disconnect();
    gainNodeRef.current?.disconnect();
    filterNodeRef.current?.disconnect();
    workletNodeRef.current?.disconnect();
    void audioCtxRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
    }

    gainNodeRef.current = null;
    compressorNodeRef.current = null;
    filterNodeRef.current = null;
    silentOutputRef.current = null;
    workletNodeRef.current = null;
    audioCtxRef.current = null;
    streamRef.current = null;
    wsRef.current = null;
    startTimeRef.current = null;
    reconnectAttemptRef.current = 0;
    isStoppingRef.current = false;
    isListeningRef.current = false;
    isConnectingRef.current = false;
    stopVisualizer();
  }, [stopVisualizer]);

  const stop = useCallback((): Promise<void> => {
    if (!isListeningRef.current && !isConnectingRef.current) {
      return Promise.resolve();
    }

    isStoppingRef.current = true;
    isListeningRef.current = false;
    isConnectingRef.current = false;
    allowReconnectRef.current = false;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    const ws = wsRef.current;
    return new Promise<void>((resolve) => {
      const finish = () => {
        stopTimerRef.current = null;
        cleanup();
        releaseWakeLockRef.current();
        onStopRef.current();
        resolve();
      };

      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "CloseStream" }));
      }
      stopTimerRef.current = setTimeout(finish, 1200);
    });
  }, [cleanup]);

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

    isStoppingRef.current = false;
    allowReconnectRef.current = true;
    reconnectAttemptRef.current = 0;
    isConnectingRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: { ideal: 16000 },
          sampleSize: { ideal: 16 },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      if (!isMountedRef.current || isStoppingRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        cleanup();
        return false;
      }
      streamRef.current = stream;

      const audioCtx = new AudioContext({ latencyHint: "interactive" });
      audioCtxRef.current = audioCtx;
      await audioCtx.resume();
      await audioCtx.audioWorklet.addModule("/worklets/pcm-processor.js");
      if (!isMountedRef.current || isStoppingRef.current) {
        cleanup();
        return false;
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const highPass = audioCtx.createBiquadFilter();
      highPass.type = "highpass";
      highPass.frequency.value = 60;
      highPass.Q.value = 0.7;

      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 1.35;
      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.value = -28;
      compressor.knee.value = 18;
      compressor.ratio.value = 3;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      const targetSampleRate = Math.min(16000, audioCtx.sampleRate);
      const workletNode = new AudioWorkletNode(audioCtx, "pcm-processor", {
        processorOptions: { targetSampleRate, chunkMs: 40 },
      });
      const silentOutput = audioCtx.createGain();
      silentOutput.gain.value = 0;

      filterNodeRef.current = highPass;
      gainNodeRef.current = gainNode;
      compressorNodeRef.current = compressor;
      workletNodeRef.current = workletNode;
      silentOutputRef.current = silentOutput;

      source.connect(highPass);
      highPass.connect(gainNode);
      gainNode.connect(compressor);
      compressor.connect(workletNode);
      workletNode.connect(silentOutput);
      silentOutput.connect(audioCtx.destination);
      startVisualizer(source, audioCtx);
      // Timestamp dimulai saat mikrofon aktif, bukan saat handshake provider selesai.
      // Dengan ini audio yang sempat masuk buffer tetap memiliki bukti waktu yang benar.
      startTimeRef.current = Date.now();

      const params = new URLSearchParams({
        model: "nova-3",
        language: "id",
        encoding: "linear16",
        sample_rate: String(targetSampleRate),
        channels: "1",
        interim_results: "true",
        punctuate: "true",
        smart_format: "true",
        endpointing: "400",
        utterance_end_ms: "1000",
        filler_words: "false",
        vad_events: "true",
        diarize: "true",
      });
      ["BAPENDA", "APBD", "Sulawesi Tenggara"].forEach((term) =>
        params.append("keyterm", term),
      );

      const queueAudio = (data: ArrayBuffer) => {
        const chunk = data.slice(0);
        if (chunk.byteLength > MAX_AUDIO_BUFFER_BYTES) return;

        while (
          audioQueueBytesRef.current + chunk.byteLength > MAX_AUDIO_BUFFER_BYTES &&
          audioQueueRef.current.length > 0
        ) {
          const dropped = audioQueueRef.current.shift();
          audioQueueBytesRef.current -= dropped?.byteLength ?? 0;
        }
        audioQueueRef.current.push(chunk);
        audioQueueBytesRef.current += chunk.byteLength;
      };

      const flushAudio = (socket: WebSocket) => {
        while (
          socket.readyState === WebSocket.OPEN &&
          socket.bufferedAmount < MAX_SOCKET_BUFFERED_BYTES &&
          audioQueueRef.current.length > 0
        ) {
          const chunk = audioQueueRef.current.shift();
          if (!chunk) break;
          audioQueueBytesRef.current -= chunk.byteLength;
          try {
            socket.send(chunk);
          } catch {
            queueAudio(chunk);
            break;
          }
        }
      };

      const sendAudio = (socket: WebSocket, data: ArrayBuffer) => {
        if (
          socket.readyState !== WebSocket.OPEN ||
          socket.bufferedAmount >= MAX_SOCKET_BUFFERED_BYTES
        ) {
          queueAudio(data);
          return;
        }
        try {
          socket.send(data);
        } catch {
          queueAudio(data);
        }
      };

      const scheduleReconnect = () => {
        if (
          !allowReconnectRef.current ||
          !isMountedRef.current ||
          isStoppingRef.current ||
          reconnectTimerRef.current
        ) {
          return;
        }

        if (reconnectAttemptRef.current >= MAX_RECONNECT_ATTEMPTS) {
          isListeningRef.current = false;
          isConnectingRef.current = false;
          toast.error("Koneksi rekaman terputus. Silakan mulai rekaman baru.");
          cleanup();
          releaseWakeLockRef.current();
          onErrorRef.current();
          onStopRef.current();
          return;
        }

        const attempt = reconnectAttemptRef.current;
        reconnectAttemptRef.current += 1;
        const delay = Math.min(800 * 2 ** attempt, 8_000);
        isListeningRef.current = true;
        isConnectingRef.current = true;
        toast.warning("Koneksi terputus. Mencoba menyambung ulang...", {
          id: "deepgram-reconnect",
        });
        reconnectTimerRef.current = setTimeout(() => {
          reconnectTimerRef.current = null;
          void connectSocket();
        }, delay);
      };

      async function connectSocket() {
        if (
          !allowReconnectRef.current ||
          !isMountedRef.current ||
          isStoppingRef.current
        ) {
          return;
        }

        try {
          const tokenRes = await fetch("/api/deepgram-token", {
            cache: "no-store",
          });
          if (!tokenRes.ok) throw new Error("Gagal mengambil token");
          const tokenData: unknown = await tokenRes.json();
          const token =
            typeof tokenData === "object" &&
            tokenData !== null &&
            "token" in tokenData &&
            typeof tokenData.token === "string"
              ? tokenData.token
              : "";
          if (!token) throw new Error("Token kosong dari server");
          if (!allowReconnectRef.current || isStoppingRef.current) return;

          const socket = new WebSocket(
            `wss://api.deepgram.com/v1/listen?${params}`,
            ["bearer", token],
          );
          wsRef.current = socket;

          socket.onopen = () => {
            if (
              !isMountedRef.current ||
              wsRef.current !== socket ||
              isStoppingRef.current
            ) {
              socket.close();
              return;
            }

            isConnectingRef.current = false;
            isListeningRef.current = true;
            startTimeRef.current ??= Date.now();
            reconnectAttemptRef.current = 0;
            flushAudio(socket);

            if (keepAliveTimerRef.current) {
              clearInterval(keepAliveTimerRef.current);
            }
            keepAliveTimerRef.current = setInterval(() => {
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "KeepAlive" }));
              }
            }, 8_000);
          };

          socket.onmessage = (event) => {
            if (!isMountedRef.current) return;
            try {
              const data = JSON.parse(event.data as string);
              if (data.type === "Results") {
                const alt = data.channel?.alternatives?.[0];
                const transcript = alt?.transcript ?? "";
                if (!transcript) return;

                if (data.is_final) {
                  const firstWord = alt?.words?.find(
                    (word: { speaker?: unknown }) =>
                      typeof word.speaker === "number",
                  );
                  const speakerLabel =
                    typeof firstWord?.speaker === "number"
                      ? `Pembicara ${firstWord.speaker + 1}: `
                      : "";
                  onTranscriptRef.current(
                    `${getTimestamp()} ${speakerLabel}${transcript}\n`,
                  );
                  onInterimRef.current?.("");
                } else {
                  onInterimRef.current?.(transcript);
                }
              }

              if (data.type === "UtteranceEnd") {
                onInterimRef.current?.("");
              }
              if (data.type === "Error") {
                console.error("Deepgram stream error:", data);
              }
            } catch {
              // Ignore malformed provider events; the connection remains usable.
            }
          };

          socket.onerror = (event) => {
            console.error("WebSocket Error:", {
              event,
              readyState: socket.readyState,
              url: socket.url,
            });
          };

          socket.onclose = (event) => {
            if (wsRef.current !== socket) return;
            wsRef.current = null;
            if (keepAliveTimerRef.current) {
              clearInterval(keepAliveTimerRef.current);
              keepAliveTimerRef.current = null;
            }

            console.warn(
              `WebSocket Closed: code=${event.code} reason=${event.reason} wasClean=${event.wasClean}`,
            );
            if (
              allowReconnectRef.current &&
              isMountedRef.current &&
              !isStoppingRef.current
            ) {
              scheduleReconnect();
            }
          };
        } catch (error: unknown) {
          console.error("Gagal menghubungkan Deepgram:", error);
          scheduleReconnect();
        }
      }

      workletNode.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
        const socket = wsRef.current;
        if (socket?.readyState === WebSocket.OPEN) {
          sendAudio(socket, event.data);
        } else {
          queueAudio(event.data);
        }
      };

      // Token dibuat tepat sebelum handshake dan dibuat ulang setiap reconnect.
      void connectSocket();
      return true;
    } catch (error: unknown) {
      console.error("Gagal memulai rekaman:", error);
      isConnectingRef.current = false;
      cleanup();
      if (error instanceof DOMException && error.name === "NotAllowedError") {
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
