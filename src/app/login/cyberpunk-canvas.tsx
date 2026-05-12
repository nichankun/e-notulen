"use client";

import { useEffect, useRef } from "react";

export function CyberpunkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;

    const c1 = "rgba(255,255,255,";
    const c2 = "rgba(200,190,255,";

    let W = 0,
      H = 0;
    let animId: number;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
    }
    interface Hexagon {
      x: number;
      y: number;
      size: number;
      alpha: number;
      pulse: number;
      speed: number;
    }
    interface Stream {
      x: number;
      y: number;
      speed: number;
      trail: { y: number; char: string }[];
      maxLen: number;
      alpha: number;
    }

    let particles: Particle[] = [];
    let hexagons: Hexagon[] = [];
    let streams: Stream[] = [];

    const CHARS = "01アイウエカキクサシスタチデノハヒフヘホ".split("");

    function resize() {
      W = cv!.offsetWidth;
      H = cv!.offsetHeight;
      cv!.width = W;
      cv!.height = H;
      initHexagons();
    }

    function initParticles() {
      particles = Array.from({ length: 55 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.5 + 0.15,
      }));
    }

    function initHexagons() {
      hexagons = [];
      const size = 36;
      const rows = Math.ceil(H / (size * 1.73)) + 2;
      const cols = Math.ceil(W / (size * 2)) + 2;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          hexagons.push({
            x: c * size * 2 + (r % 2) * size,
            y: r * size * 1.73,
            size,
            alpha: Math.random() * 0.1 + 0.03,
            pulse: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.008 + 0.003,
          });
    }

    function initStreams() {
      streams = Array.from({ length: 14 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        speed: Math.random() * 1.4 + 0.7,
        trail: [],
        maxLen: Math.floor(Math.random() * 8) + 4,
        alpha: Math.random() * 0.22 + 0.08,
      }));
    }

    function drawHex(x: number, y: number, size: number, alpha: number) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        const px = x + size * Math.cos(a);
        const py = y + size * Math.sin(a);
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.strokeStyle = c1 + alpha + ")";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      hexagons.forEach((h) => {
        h.pulse += h.speed;
        drawHex(h.x, h.y, h.size, h.alpha * (0.5 + 0.5 * Math.sin(h.pulse)));
      });

      streams.forEach((s) => {
        s.y += s.speed;
        if (s.y > H + 100) {
          s.y = -50;
          s.x = Math.random() * W;
        }
        s.trail.unshift({
          y: s.y,
          char: CHARS[Math.floor(Math.random() * CHARS.length)],
        });
        if (s.trail.length > s.maxLen) s.trail.pop();
        ctx.font = "10px monospace";
        s.trail.forEach((pt, i) => {
          ctx.fillStyle =
            (i === 0 ? c1 : c2) + s.alpha * (1 - i / s.maxLen) + ")";
          ctx.fillText(pt.char, s.x, pt.y);
        });
      });

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = c1 + p.alpha + ")";
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particles[i].x;
          const dy = particles[j].y - particles[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = c2 + 0.18 * (1 - dist / 90) + ")";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      const scanY = ((Date.now() / 12) % (H + 40)) - 20;
      const grad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(0.5, "rgba(255,255,255,0.025)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 30, W, 60);

      animId = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    initStreams();
    draw();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
