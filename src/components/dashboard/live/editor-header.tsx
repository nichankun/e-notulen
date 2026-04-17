import { Loader2, CheckCheck, CloudOff } from "lucide-react";

interface EditorHeaderProps {
  title?: string;
  leader?: string;
  saveStatus: "idle" | "saving" | "saved" | "error";
}

export function EditorHeader({ title, leader, saveStatus }: EditorHeaderProps) {
  return (
    <div className="px-6 py-5 border-b bg-muted/30 flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4 shrink-0">
      <div className="min-w-0 space-y-1">
        <h3 className="font-semibold text-xl text-foreground tracking-tight line-clamp-1">
          {title || "Judul Rapat"}
        </h3>
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          Pimpinan: <span className="text-foreground">{leader || "-"}</span>
        </p>
      </div>

      {/* Container indikator menggunakan bg-background dan border agar terlihat seperti pill/badge modern */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border shadow-sm text-sm font-medium transition-all duration-300">
        {saveStatus === "saving" && (
          // PERBAIKAN 1: Menggunakan text-primary ketimbang biru statis agar selaras dengan tema loading aplikasi
          <div className="flex items-center gap-2 text-primary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Menyimpan...</span>
          </div>
        )}
        {saveStatus === "saved" && (
          // PERBAIKAN 2: Menggunakan emerald-500. Angka 500 adalah "sweet spot" di Tailwind yang terlihat jelas di mode terang maupun gelap. (600 kadang terlalu gelap di dark mode)
          <div className="flex items-center gap-2 text-emerald-500">
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Tersimpan</span>
          </div>
        )}
        {saveStatus === "error" && (
          // Ini sudah sempurna! Menggunakan text-destructive bawaan shadcn.
          <div className="flex items-center gap-2 text-destructive animate-pulse">
            <CloudOff className="h-3.5 w-3.5" />
            <span>Gagal Simpan</span>
          </div>
        )}
        {saveStatus === "idle" && (
          // Ini juga sudah sempurna. Sangat subtle/kalem.
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            <span>Standby</span>
          </div>
        )}
      </div>
    </div>
  );
}
