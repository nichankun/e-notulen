"use client";

import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MeetingHeaderProps {
  date?: string | Date | null;
}

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border shadow-sm p-4 rounded-xl">
      <div className="flex items-center gap-3">
        {/* Status Indicator Badge */}
        <Badge
          variant="outline"
          className="flex items-center gap-2.5 bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50 px-3 py-1 shadow-none"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="font-bold tracking-widest text-xs uppercase mt-px">
            Sesi Live
          </span>
        </Badge>
      </div>

      {/* Date Container */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50 w-fit">
        <Calendar className="h-4 w-4" />
        <span suppressHydrationWarning>
          {date
            ? headerDateFormatter.format(new Date(date))
            : "Belum ditentukan"}
        </span>
      </div>
    </div>
  );
}
