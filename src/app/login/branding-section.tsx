"use client";

import { ClipboardList } from "lucide-react";

export function BrandingSection() {
  return (
    <div className="hidden lg:flex w-full max-w-120 xl:max-w-140 shrink-0 flex-col justify-between px-12 py-14 bg-primary relative overflow-hidden">
      {/* Dekorasi Lingkaran Subtle */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-foreground/10 border border-primary-foreground/20 backdrop-blur-sm">
            <ClipboardList className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-primary-foreground/90">
            Bapenda Prov. Sultra
          </span>
        </div>

        <h1 className="text-4xl xl:text-5xl font-bold leading-[1.1] mb-6 text-primary-foreground tracking-tight">
          Notulensi rapat <br />
          <span className="text-primary-foreground/70">lebih cerdas.</span>
        </h1>
        <p className="text-base leading-relaxed text-primary-foreground/70 max-w-sm">
          Digitalisasi laporan rapat dan absensi kehadiran pegawai secara terpadu, cepat, dan akurat.
        </p>

        {/* Grid Statistik Sederhana */}
        <div className="grid grid-cols-2 gap-6 mt-12 pt-10 border-t border-primary-foreground/10">
          <div>
            <p className="text-2xl font-bold text-primary-foreground mb-1">98%</p>
            <p className="text-xs font-medium text-primary-foreground/60 uppercase tracking-wider">Akurasi AI</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-foreground mb-1">256-bit</p>
            <p className="text-xs font-medium text-primary-foreground/60 uppercase tracking-wider">Keamanan</p>
          </div>
        </div>
      </div>

      <p className="text-xs font-medium tracking-wide text-primary-foreground/50 relative z-10">
        © {new Date().getFullYear()} · Bapenda Provinsi Sulawesi Tenggara
      </p>
    </div>
  );
}