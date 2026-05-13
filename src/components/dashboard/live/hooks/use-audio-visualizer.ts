import { useRef, useCallback } from "react";

export function useAudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const start = useCallback((stream: MediaStream, audioCtx: AudioContext) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvasCtx = canvas.getContext("2d")!;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const W = canvas.width;
      const H = canvas.height;
      canvasCtx.clearRect(0, 0, W, H);

      const barCount = 40;
      const barWidth = (W / barCount) * 0.6;
      const gap = (W / barCount) * 0.4;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] ?? 0;
        const percent = value / 255;
        const barHeight = Math.max(3, percent * H * 0.85);
        const x = i * (barWidth + gap) + gap / 2;
        const y = (H - barHeight) / 2;

        const grad = canvasCtx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, `rgba(129,140,248,${0.4 + percent * 0.6})`);
        grad.addColorStop(1, `rgba(99,102,241,${0.6 + percent * 0.4})`);

        canvasCtx.fillStyle = grad;
        canvasCtx.beginPath();
        canvasCtx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
        canvasCtx.fill();
      }
    };

    draw();
  }, []);

  const stop = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    analyserRef.current?.disconnect();
    analyserRef.current = null;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  return { canvasRef, start, stop };
}
