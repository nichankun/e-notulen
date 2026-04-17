"use client";

import { Loader2, CheckCheck, CloudOff } from "lucide-react";

interface MobileSaveStatusProps {
  saveStatus: "idle" | "saving" | "saved" | "error";
}

export function MobileSaveStatus({ saveStatus }: MobileSaveStatusProps) {
  return (
    // PERBAIKAN 1: Menggunakan bg-background dan border-border agar adaptif terhadap Dark Mode.
    // Shadow diubah menjadi shadow-sm standar shadcn.
    <div className="flex lg:hidden items-center gap-2 px-3 py-1.5 rounded-full bg-background border shadow-sm transition-all duration-300">
      {saveStatus === "saving" && (
        // PERBAIKAN 2: Menggunakan text-primary alih-alih biru statis.
        <Loader2 className="h-3 w-3 animate-spin text-primary" />
      )}

      {saveStatus === "saved" && (
        // PERBAIKAN 3: Menggunakan emerald-500 (sweet spot untuk keterbacaan di Light/Dark mode).
        <CheckCheck className="h-3 w-3 text-emerald-500" />
      )}

      {saveStatus === "error" && (
        // Menggunakan text-destructive untuk konsistensi error sistem.
        <CloudOff className="h-3 w-3 text-destructive animate-pulse" />
      )}

      {/* PERBAIKAN 4: Tipografi dipertajam dengan tracking-widest dan text-muted-foreground */}
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
        {saveStatus === "saving"
          ? "Menyimpan..."
          : saveStatus === "saved"
            ? "Tersimpan"
            : "Sesi Aktif"}
      </span>
    </div>
  );
}
