"use client";

import { Calendar } from "lucide-react";

interface MeetingHeaderProps {
  date?: string | Date | null;
}

// OPTIMASI: Formatter statis untuk performa render
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-green-50 border border-green-200 p-3 sm:p-4 rounded-xl text-green-800 shadow-sm transition-all">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="flex h-2.5 w-2.5 sm:h-3 sm:w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500"></span>
        </span>
        <span className="font-bold tracking-tight text-xs sm:text-sm">
          SESI RAPAT LIVE
        </span>
      </div>

      <div className="flex items-center justify-center sm:justify-start gap-2 font-mono text-xs sm:text-sm font-medium bg-white/60 px-3 py-1.5 sm:py-1 rounded-md w-full sm:w-auto border border-green-100 sm:border-0">
        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-700" />
        <span className="truncate">
          {date ? headerDateFormatter.format(new Date(date)) : "-"}
        </span>
      </div>
    </div>
  );
}
