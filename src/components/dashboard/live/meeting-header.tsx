"use client";

import { Calendar } from "lucide-react";

interface MeetingHeaderProps {
  date?: string | Date | null;
}

export function MeetingHeader({ date }: MeetingHeaderProps) {
  return (
    // 1. Flex-col di mobile (stack), Flex-row di desktop (sebelahan)
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-green-50 border border-green-200 p-3 sm:p-4 rounded-xl text-green-800 shadow-sm transition-all">
      {/* KIRI: Status Indicator */}
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="flex h-2.5 w-2.5 sm:h-3 sm:w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500"></span>
        </span>
        <span className="font-bold tracking-tight text-xs sm:text-sm">
          SESI RAPAT LIVE
        </span>
      </div>

      {/* KANAN: Tanggal (Full width di mobile agar rapi) */}
      <div className="flex items-center justify-center sm:justify-start gap-2 font-mono text-xs sm:text-sm font-medium bg-white/60 px-3 py-1.5 sm:py-1 rounded-md w-full sm:w-auto border border-green-100 sm:border-0">
        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-700" />
        <span className="truncate">
          {date
            ? new Date(date).toLocaleDateString("id-ID", {
                weekday: "short", // Tambah hari (Sen, Sel) biar jelas
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-"}
        </span>
      </div>
    </div>
  );
}
