"use client";

import { useEffect, useRef } from "react";
import { LoginForm } from "./login-form";
import { ForgotPasswordDialog, RequestAccountDialog } from "./auth-dialogs";

function CyberpunkCanvas() {
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
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          hexagons.push({
            x: c * size * 2 + (r % 2) * size,
            y: r * size * 1.73,
            size,
            alpha: Math.random() * 0.1 + 0.03,
            pulse: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.008 + 0.003,
          });
        }
      }
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
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
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
        const a = h.alpha * (0.5 + 0.5 * Math.sin(h.pulse));
        drawHex(h.x, h.y, h.size, a);
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
          const a = s.alpha * (1 - i / s.maxLen);
          ctx.fillStyle = (i === 0 ? c1 : c2) + a + ")";
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

      // Scanline sweep
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

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden relative bg-primary">
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        @keyframes fadeslide {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%,100% { opacity: .5; }
          50%     { opacity: 1; }
        }
        @keyframes flicker {
          0%,100% { opacity:1; }
          92% { opacity:1; } 93% { opacity:.92; } 94% { opacity:1; }
          97% { opacity:.95; } 98% { opacity:1; }
        }
        @keyframes pulse-ring {
          0%,100% { transform:translate(-50%,-50%) scale(1); opacity:.12; }
          50%     { transform:translate(-50%,-50%) scale(1.06); opacity:.2; }
        }
        @keyframes glitch-anim {
          0%,70%,100% { clip-path: inset(0 0 99% 0); }
          10%  { clip-path: inset(25% 0 60% 0); }
          20%  { clip-path: inset(70% 0 15% 0); }
          30%  { clip-path: inset(45% 0 40% 0); }
          40%  { clip-path: inset(10% 0 82% 0); }
          50%  { clip-path: inset(85% 0 5% 0); }
          60%  { clip-path: inset(55% 0 30% 0); }
        }

        .anim-0 { animation: fadeslide .5s ease both; }
        .anim-1 { animation: fadeslide .5s .1s ease both; opacity:0; }
        .anim-2 { animation: fadeslide .5s .2s ease both; opacity:0; }
        .anim-3 { animation: fadeslide .5s .3s ease both; opacity:0; }
        .anim-4 { animation: fadeslide .5s .4s ease both; opacity:0; }

        .pulse-dot { animation: pulse-dot 2s ease infinite; }

        .submit-shimmer { position: relative; overflow: hidden; }
        .submit-shimmer::after {
          content: '';
          position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
          animation: shimmer 2.5s ease infinite;
        }

        .cyber-ring {
          position: fixed;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.07);
          top: 50%; left: 50%;
          pointer-events: none;
          animation: pulse-ring 4s ease-in-out infinite;
        }

        .login-card { animation: flicker 10s ease infinite; }

        .glitch-bar {
          position: fixed; left: 0; right: 0; pointer-events: none;
          background: rgba(255,255,255,.05);
          height: 3px;
          animation: glitch-anim 8s steps(1) infinite;
        }

        @media (max-width: 768px) {
          .login-card { flex-direction: column !important; }
          .login-brand {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,.1) !important;
            padding: 24px 20px 20px !important;
          }
          .login-hero-frame { display: none !important; }
          .login-tagline-desc { display: none !important; }
          .login-chips { display: none !important; }
          .login-stats { display: none !important; }
          .login-headline { font-size: 22px !important; }
          .login-form-panel { width: 100% !important; padding: 20px !important; }
        }
      `}</style>

      {/* Cyberpunk canvas */}
      <CyberpunkCanvas />

      {/* Pulse rings */}
      <div
        className="cyber-ring"
        style={{ width: 700, height: 700, marginLeft: -350, marginTop: -350 }}
      />
      <div
        className="cyber-ring"
        style={{
          width: 480,
          height: 480,
          marginLeft: -240,
          marginTop: -240,
          animationDelay: ".8s",
          animationDuration: "5s",
        }}
      />
      <div
        className="cyber-ring"
        style={{
          width: 260,
          height: 260,
          marginLeft: -130,
          marginTop: -130,
          animationDelay: "1.6s",
          animationDuration: "3.5s",
        }}
      />

      {/* Glitch bars */}
      <div className="glitch-bar" style={{ top: "33%" }} />
      <div
        className="glitch-bar"
        style={{ top: "67%", animationDelay: "3s", animationDuration: "11s" }}
      />

      {/* Card */}
      <div
        className="login-card relative z-10 w-full max-w-225 flex rounded-2xl overflow-hidden bg-card"
        style={{
          border: "1px solid rgba(255,255,255,.15)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,.05), 0 24px 80px rgba(0,0,0,.4), 0 0 60px color-mix(in oklch, var(--primary) 40%, transparent)",
        }}
      >
        {/* ── BRANDING (kiri) ── */}
        <div
          className="login-brand flex-1 flex flex-col justify-between p-10 bg-white"
          style={{
            borderRight:
              "1px solid color-mix(in oklch, var(--primary) 8%, transparent)",
          }}
        >
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 anim-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), color-mix(in oklch, var(--primary) 70%, white))",
                  boxShadow:
                    "0 4px 12px color-mix(in oklch, var(--primary) 35%, transparent)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#1e1b4b] tracking-wide">
                  E-NOTULEN
                </p>
                <p
                  className="text-[10px] tracking-widest uppercase"
                  style={{
                    color: "color-mix(in oklch, var(--primary) 60%, white)",
                  }}
                >
                  Sistem Rapat Digital
                </p>
              </div>
            </div>

            {/* Hero frame */}
            <div
              className="login-hero-frame anim-1 w-full rounded-xl overflow-hidden mb-8"
              style={{
                border:
                  "1px solid color-mix(in oklch, var(--primary) 12%, transparent)",
                boxShadow:
                  "0 8px 32px color-mix(in oklch, var(--primary) 8%, transparent)",
              }}
            >
              <div
                className="flex items-center gap-1.5 px-3 py-2.5"
                style={{
                  background: "color-mix(in oklch, var(--primary) 4%, white)",
                  borderBottom:
                    "1px solid color-mix(in oklch, var(--primary) 8%, transparent)",
                }}
              >
                <span className="w-2 h-2 rounded-full bg-red-300" />
                <span className="w-2 h-2 rounded-full bg-yellow-300" />
                <span className="w-2 h-2 rounded-full bg-green-300" />
                <div
                  className="flex-1 mx-2 h-4 rounded-full flex items-center px-2"
                  style={{
                    background:
                      "color-mix(in oklch, var(--primary) 10%, white)",
                  }}
                >
                  <span
                    className="text-[9px]"
                    style={{ color: "var(--primary)" }}
                  >
                    enotulen.go.id/dashboard
                  </span>
                </div>
              </div>
              <div className="p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="pulse-dot w-2 h-2 rounded-full inline-block"
                      style={{ background: "#10b981" }}
                    />
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: "#047857" }}
                    >
                      Rapat berlangsung
                    </span>
                  </div>
                  <span className="text-[9px] text-gray-400">
                    Senin, 12 Mei 2026
                  </span>
                </div>
                <p className="text-[12px] font-semibold text-[#1e1b4b] mb-3">
                  Rapat Koordinasi Bulanan
                </p>
                {["w-full", "w-4/5", "w-full", "w-3/5"].map((cls, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full mb-1.5 ${cls}`}
                    style={{
                      background:
                        i % 2 === 0
                          ? "color-mix(in oklch, var(--primary) 15%, white)"
                          : "color-mix(in oklch, var(--primary) 10%, white)",
                    }}
                  />
                ))}
                <div className="flex gap-2 mt-3">
                  {[
                    { num: "24", lbl: "Peserta" },
                    { num: "98%", lbl: "Akurasi" },
                    { num: "12", lbl: "Agenda" },
                  ].map((s) => (
                    <div
                      key={s.lbl}
                      className="flex-1 rounded-lg p-2"
                      style={{
                        background:
                          "color-mix(in oklch, var(--primary) 5%, white)",
                        border:
                          "1px solid color-mix(in oklch, var(--primary) 10%, transparent)",
                      }}
                    >
                      <p
                        className="text-[13px] font-bold"
                        style={{ color: "var(--primary)" }}
                      >
                        {s.num}
                      </p>
                      <p
                        className="text-[8px] uppercase tracking-wide"
                        style={{
                          color:
                            "color-mix(in oklch, var(--primary) 50%, white)",
                        }}
                      >
                        {s.lbl}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div className="anim-2">
              <h1
                className="login-headline text-[28px] font-extrabold leading-tight mb-2"
                style={{ color: "#1e1b4b" }}
              >
                Notulensi rapat
                <br />
                <span style={{ color: "var(--primary)" }}>lebih cerdas.</span>
              </h1>
              <p className="login-tagline-desc text-[12px] leading-relaxed text-gray-400 max-w-xs mb-4">
                Rekam, transkripsi, dan rangkum rapat secara otomatis dengan
                bantuan kecerdasan buatan.
              </p>
            </div>

            {/* Feature chips */}
            <div className="login-chips anim-3 flex flex-wrap gap-2">
              {["Transkripsi otomatis", "Rangkuman AI", "Absensi QR"].map(
                (f) => (
                  <div
                    key={f}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-white"
                    style={{
                      border:
                        "1px solid color-mix(in oklch, var(--primary) 20%, transparent)",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--primary)", opacity: 0.6 }}
                    />
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: "var(--primary)" }}
                    >
                      {f}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Stats */}
          <div
            className="login-stats anim-4 flex items-center gap-6 pt-5"
            style={{
              borderTop:
                "1px solid color-mix(in oklch, var(--primary) 8%, transparent)",
            }}
          >
            {[
              { num: "98%", lbl: "Akurasi AI" },
              { num: "3×", lbl: "Lebih cepat" },
              { num: "256-bit", lbl: "Enkripsi" },
            ].map((s, i) => (
              <div key={s.lbl} className="flex items-center gap-6">
                {i > 0 && (
                  <div
                    className="w-px h-8"
                    style={{
                      background:
                        "color-mix(in oklch, var(--primary) 10%, transparent)",
                    }}
                  />
                )}
                <div>
                  <p className="text-[20px] font-extrabold text-[#1e1b4b]">
                    {s.num}
                  </p>
                  <p className="text-[9px] uppercase tracking-wide text-gray-400 mt-0.5">
                    {s.lbl}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FORM (kanan) ── */}
        <div className="login-form-panel w-72.5 shrink-0 bg-card flex flex-col justify-center px-7 py-8">
          <div className="flex items-center gap-2 mb-5">
            <div
              className="h-px flex-1"
              style={{ background: "rgba(255,255,255,.1)" }}
            />
            <span
              className="text-[10px] uppercase tracking-widest whitespace-nowrap"
              style={{ color: "rgba(255,255,255,.4)" }}
            >
              Portal masuk
            </span>
            <div
              className="h-px flex-1"
              style={{ background: "rgba(255,255,255,.1)" }}
            />
          </div>

          <h2 className="text-[15px] font-bold mb-1 text-card-foreground">
            Masuk ke akun Anda
          </h2>
          <p className="text-[11px] mb-5 leading-relaxed text-muted-foreground">
            Gunakan NIP dan kata sandi yang telah diberikan oleh Admin IT.
          </p>

          <LoginForm />

          <div className="text-center mt-3">
            <ForgotPasswordDialog />
          </div>

          <div className="flex items-center gap-2 my-4">
            <div
              className="h-px flex-1"
              style={{ background: "rgba(255,255,255,.08)" }}
            />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              atau
            </span>
            <div
              className="h-px flex-1"
              style={{ background: "rgba(255,255,255,.08)" }}
            />
          </div>

          <RequestAccountDialog />
        </div>
      </div>
    </div>
  );
}
