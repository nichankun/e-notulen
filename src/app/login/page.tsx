import { CyberpunkCanvas } from "./cyberpunk-canvas";
import { LoginBrand } from "./login-brand";
import { LoginPanel } from "./login-panel";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden relative bg-primary">
      <CyberpunkCanvas />

      {/* Pulse rings */}
      <div
        className="login-cyber-ring"
        style={{ width: 700, height: 700, marginLeft: -350, marginTop: -350 }}
      />
      <div
        className="login-cyber-ring"
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
        className="login-cyber-ring"
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
      <div className="login-glitch-bar" style={{ top: "33%" }} />
      <div
        className="login-glitch-bar"
        style={{ top: "67%", animationDelay: "3s", animationDuration: "11s" }}
      />

      {/* Card */}
      <div
        className="login-card relative z-10 w-full max-w-195 xl:max-w-225 flex rounded-2xl overflow-hidden bg-card"
        style={{
          border: "1px solid rgba(255,255,255,.15)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,.05), 0 24px 80px rgba(0,0,0,.4), 0 0 60px color-mix(in oklch, var(--primary) 40%, transparent)",
        }}
      >
        <LoginBrand />
        <LoginPanel />
      </div>
    </div>
  );
}
