"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAudioCaptureConstraints,
  type AudioCaptureProfileId,
} from "../audio-capture-profile";

export type MicrophoneTestStatus =
  | "idle"
  | "testing"
  | "passed"
  | "too_quiet"
  | "too_loud"
  | "failed";

export interface MicrophoneTestState {
  status: MicrophoneTestStatus;
  levelPercent: number;
  peakPercent: number;
  averageDb: number | null;
  captureSettings: MicrophoneCaptureSettings | null;
  message: string;
}

export interface MicrophoneCaptureSettings {
  sampleRate: number | null;
  channelCount: number | null;
  autoGainControl: boolean | null;
  noiseSuppression: boolean | null;
  echoCancellation: boolean | null;
}

const INITIAL_STATE: MicrophoneTestState = {
  status: "idle",
  levelPercent: 0,
  peakPercent: 0,
  averageDb: null,
  captureSettings: null,
  message: "Tes suara akan berlangsung selama 3 detik.",
};

function readCaptureSettings(
  track: MediaStreamTrack,
): MicrophoneCaptureSettings {
  const settings = track.getSettings();
  return {
    sampleRate: settings.sampleRate ?? null,
    channelCount: settings.channelCount ?? null,
    autoGainControl: settings.autoGainControl ?? null,
    noiseSuppression: settings.noiseSuppression ?? null,
    echoCancellation: settings.echoCancellation ?? null,
  };
}

export function useMicrophoneTest(profile: AudioCaptureProfileId) {
  const [state, setState] = useState<MicrophoneTestState>(INITIAL_STATE);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const runTest = useCallback(async () => {
    if (!mountedRef.current || state.status === "testing") return;

    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let animationFrame = 0;

    setState({
      ...INITIAL_STATE,
      status: "testing",
      message: "Bicaralah dengan volume normal selama 3 detik.",
    });

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: getAudioCaptureConstraints(profile),
      });
      const captureSettings = readCaptureSettings(stream.getAudioTracks()[0]);
      audioContext = new AudioContext({ latencyHint: "interactive" });
      await audioContext.resume();

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.65;
      source.connect(analyser);

      const samples = new Float32Array(analyser.fftSize);
      const startedAt = performance.now();
      let sumDb = 0;
      let sampleCount = 0;
      let maxPeak = 0;

      await new Promise<void>((resolve) => {
        const measure = () => {
          analyser.getFloatTimeDomainData(samples);
          let sumSquares = 0;
          let peak = 0;

          for (const sample of samples) {
            sumSquares += sample * sample;
            peak = Math.max(peak, Math.abs(sample));
          }

          const rms = Math.sqrt(sumSquares / samples.length);
          const db = 20 * Math.log10(Math.max(rms, 0.00001));
          sumDb += db;
          sampleCount += 1;
          maxPeak = Math.max(maxPeak, peak);

          if (mountedRef.current) {
            setState((previous) => ({
              ...previous,
              levelPercent: Math.min(100, Math.max(0, ((db + 60) / 60) * 100)),
              peakPercent: Math.min(100, Math.round(peak * 100)),
              averageDb: Math.round(db),
            }));
          }

          if (performance.now() - startedAt >= 3000) {
            resolve();
          } else {
            animationFrame = requestAnimationFrame(measure);
          }
        };

        animationFrame = requestAnimationFrame(measure);
      });

      const averageDb = sampleCount > 0 ? sumDb / sampleCount : -60;
      const peakPercent = Math.round(maxPeak * 100);
      const result: MicrophoneTestState = {
        status:
          averageDb < -42
            ? "too_quiet"
            : averageDb > -8 || maxPeak > 0.98
              ? "too_loud"
              : "passed",
        levelPercent: Math.min(100, Math.max(0, ((averageDb + 60) / 60) * 100)),
        peakPercent,
        averageDb: Math.round(averageDb),
        captureSettings,
        message:
          averageDb < -42
            ? "Suara terlalu pelan. Dekatkan mikrofon atau naikkan volume input."
            : averageDb > -8 || maxPeak > 0.98
              ? "Suara terlalu keras dan berisiko pecah. Jauhkan mikrofon atau turunkan volume input."
              : "Mikrofon siap. Level suara berada pada rentang yang baik.",
      };

      if (mountedRef.current) setState(result);
    } catch (error: unknown) {
      if (mountedRef.current) {
        setState({
          ...INITIAL_STATE,
          status: "failed",
          message:
            error instanceof DOMException && error.name === "NotAllowedError"
              ? "Akses mikrofon ditolak. Izinkan mikrofon di browser lalu coba lagi."
              : "Tes mikrofon gagal. Pastikan perangkat input tersedia dan tidak sedang dikunci aplikasi lain.",
        });
      }
    } finally {
      cancelAnimationFrame(animationFrame);
      stream?.getTracks().forEach((track) => track.stop());
      await audioContext?.close().catch(() => undefined);
    }
  }, [profile, state.status]);

  return { state, runTest };
}
