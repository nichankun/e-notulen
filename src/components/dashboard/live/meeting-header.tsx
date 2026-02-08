"use client";

import { Calendar } from "lucide-react";

interface MeetingHeaderProps {
  date?: string | Date | null;
}

export function MeetingHeader({ date }: MeetingHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-green-50 border border-green-200 p-4 rounded-xl text-green-800 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span className="font-bold tracking-tight">SESI RAPAT LIVE</span>
      </div>

      <div className="flex items-center gap-2 font-mono text-sm font-medium bg-white/50 px-3 py-1 rounded-md">
        <Calendar className="h-4 w-4" />
        {date
          ? new Date(date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-"}
      </div>
    </div>
  );
}
