export function LoginBrand() {
  return (
    <div
      className="login-brand flex-1 flex flex-col justify-between p-6 xl:p-10 bg-white"
      style={{
        borderRight:
          "1px solid color-mix(in oklch, var(--primary) 8%, transparent)",
      }}
    >
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6 xl:mb-8 login-anim-0">
          <div
            className="w-9 h-9 xl:w-10 xl:h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), color-mix(in oklch, var(--primary) 70%, white))",
              boxShadow:
                "0 4px 12px color-mix(in oklch, var(--primary) 35%, transparent)",
            }}
          >
            <svg
              width="16"
              height="16"
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
          className="login-hero-frame login-anim-1 w-full rounded-xl overflow-hidden mb-6"
          style={{
            border:
              "1px solid color-mix(in oklch, var(--primary) 12%, transparent)",
            boxShadow:
              "0 8px 32px color-mix(in oklch, var(--primary) 8%, transparent)",
          }}
        >
          <div
            className="flex items-center gap-1.5 px-3 py-2"
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
                background: "color-mix(in oklch, var(--primary) 10%, white)",
              }}
            >
              <span className="text-[9px]" style={{ color: "var(--primary)" }}>
                enotulen.go.id/dashboard
              </span>
            </div>
          </div>
          <div className="p-3 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="login-pulse-dot w-2 h-2 rounded-full inline-block"
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
            <p className="text-[12px] font-semibold text-[#1e1b4b] mb-2">
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
            <div className="flex gap-2 mt-2">
              {[
                { num: "24", lbl: "Peserta" },
                { num: "98%", lbl: "Akurasi" },
                { num: "12", lbl: "Agenda" },
              ].map((s) => (
                <div
                  key={s.lbl}
                  className="flex-1 rounded-lg p-2"
                  style={{
                    background: "color-mix(in oklch, var(--primary) 5%, white)",
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
                      color: "color-mix(in oklch, var(--primary) 50%, white)",
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
        <div className="login-anim-2">
          <h1
            className="login-headline text-[24px] xl:text-[28px] font-extrabold leading-tight mb-2"
            style={{ color: "#1e1b4b" }}
          >
            Notulensi rapat
            <br />
            <span style={{ color: "var(--primary)" }}>lebih cerdas.</span>
          </h1>
          <p className="login-tagline-desc text-[11px] xl:text-[12px] leading-relaxed text-gray-400 max-w-xs mb-3 xl:mb-4">
            Rekam, transkripsi, dan rangkum rapat secara otomatis dengan bantuan
            kecerdasan buatan.
          </p>
        </div>

        {/* Feature chips */}
        <div className="login-chips login-anim-3 flex flex-wrap gap-1.5 xl:gap-2">
          {["Transkripsi otomatis", "Rangkuman AI", "Absensi QR"].map((f) => (
            <div
              key={f}
              className="flex items-center gap-1.5 rounded-full px-2.5 xl:px-3 py-1 bg-white"
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
          ))}
        </div>
      </div>

      {/* Stats */}
      <div
        className="login-stats login-anim-4 flex items-center gap-4 xl:gap-6 pt-4 xl:pt-5"
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
          <div key={s.lbl} className="flex items-center gap-4 xl:gap-6">
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
              <p className="text-[17px] xl:text-[20px] font-extrabold text-[#1e1b4b]">
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
  );
}
