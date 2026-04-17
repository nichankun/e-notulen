"use client";

import { Calendar } from "lucide-react";

interface MeetingHeaderProps {
  date?: string | Date | null;
}

// Formatter statis tetap dipertahankan karena sudah sangat optimal
const headerDateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function MeetingHeader({ date }: MeetingHeaderProps) {
  return (
    // PERBAIKAN 1: Menggunakan bg-emerald-500/10 dan border-emerald-500/20.
    // Ini memberikan efek warna yang modern, transparan, dan aman untuk Dark Mode.
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-500/10 border border-emerald-500/20 p-3 sm:p-4 rounded-xl text-emerald-700 dark:text-emerald-400 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status Indicator: Ping Animation */}
        <span className="flex h-2.5 w-2.5 sm:h-3 sm:w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
        </span>

        {/* PERBAIKAN 2: Menggunakan tracking-widest agar teks uppercase terlihat lebih profesional */}
        <span className="font-bold tracking-widest text-[10px] sm:text-xs uppercase">
          Sesi Rapat Live
        </span>
      </div>

      {/* PERBAIKAN 3: Kontainer tanggal menggunakan bg-background/50 dengan backdrop blur 
          agar terlihat kontras dan premium di atas latar belakang emerald. */}
      <div className="flex items-center justify-center sm:justify-start gap-2 font-mono text-xs sm:text-sm font-medium bg-background/50 backdrop-blur-sm px-3 py-1.5 sm:py-1 rounded-lg w-full sm:w-auto border border-emerald-500/10">
        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
        <span className="truncate" suppressHydrationWarning>
          {date ? headerDateFormatter.format(new Date(date)) : "-"}
        </span>
      </div>
    </div>
  );
}
