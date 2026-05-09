"use client";

import { User, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type Attendee } from "@/db/database/schema";

interface MeetingAttendeesProps {
  attendees: Attendee[];
}

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

const getInitials = (name: string) => {
  if (!name) return "??";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

export function MeetingAttendees({ attendees }: MeetingAttendeesProps) {
  return (
    // Menggunakan max-h-[300px] agar bisa di-scroll jika kepanjangan, tapi menciut jika kosong
    <div className="flex flex-col max-h-75 overflow-y-auto bg-background">
      {attendees.length === 0 ? (
        // EMPTY STATE: Sangat minimalis
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center text-muted-foreground">
          <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center mb-2">
            <User className="h-5 w-5 opacity-40" />
          </div>
          <p className="text-xs font-medium">Belum ada peserta</p>
        </div>
      ) : (
        // LIST PESERTA: Padding lebih rapat (px-4 py-2.5)
        <div className="flex flex-col divide-y divide-border/40">
          {attendees.map((person) => {
            const scanTime = person.scannedAt
              ? timeFormatter.format(new Date(person.scannedAt))
              : "--:--";

            return (
              <div
                key={person.id}
                className="px-4 py-2.5 flex items-center justify-between hover:bg-muted/30 transition-colors animate-in fade-in duration-300"
              >
                <div className="flex items-center gap-2.5 overflow-hidden pr-3">
                  <Avatar className="h-8 w-8 border shadow-sm shrink-0">
                    <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-semibold">
                      {getInitials(person.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-medium text-foreground truncate">
                      {person.name}
                    </span>
                    {person.department && (
                      <span className="text-[10px] text-muted-foreground truncate">
                        {person.department}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-1 rounded border border-border/50">
                  <Clock className="w-3 h-3" />
                  <span>{scanTime}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
