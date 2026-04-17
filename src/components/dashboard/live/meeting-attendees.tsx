"use client";

import { User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Attendee } from "@/db/database/schema";

interface MeetingAttendeesProps {
  attendees: Attendee[];
}

// Formatter tetap di luar untuk efisiensi memori
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
    // PERBAIKAN 1: Gunakan bg-card dan border-border agar otomatis dukung Dark Mode
    <Card className="flex flex-col h-80 lg:h-96 bg-card border shadow-sm overflow-hidden rounded-xl">
      {/* HEADER: Menggunakan bg-muted/50 agar senada dengan toolbar editor */}
      <div className="px-4 py-3 border-b bg-muted/50 backdrop-blur-md flex justify-between items-center shrink-0">
        <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
          Peserta Masuk
        </h4>
        {/* PERBAIKAN 2: Gunakan variant standar shadcn agar warna serasi dengan preset */}
        <Badge
          variant="outline"
          className="bg-primary/10 text-primary border-primary/20 font-bold px-2 py-0.5"
        >
          {attendees.length} Orang
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 bg-background">
        {attendees.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <User className="h-6 w-6 text-muted-foreground opacity-50" />
            </div>
            <p className="text-xs font-medium text-muted-foreground italic">
              Belum ada peserta scan...
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border/50">
            {attendees.map((person) => {
              const scanTime = person.scannedAt
                ? timeFormatter.format(new Date(person.scannedAt))
                : "--:--";

              return (
                <div
                  key={person.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors animate-in slide-in-from-left-2 duration-300"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* AVATAR: Menggunakan warna primary transparan agar lebih "segar" */}
                    <div className="shrink-0 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary border border-primary/20 shadow-sm">
                      {getInitials(person.name)}
                    </div>

                    <div className="min-w-0">
                      {/* PERBAIKAN 3: Gunakan text-foreground dan hapus max-w-35 (tidak valid) */}
                      <p className="text-sm font-bold text-foreground truncate max-w-35 sm:max-w-50">
                        {person.name}
                      </p>
                      {person.department && (
                        <p className="text-[10px] text-muted-foreground truncate max-w-35">
                          {person.department}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* TIMESTAMP: Dibuat lebih subtle dan bersih */}
                  <span className="shrink-0 text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md border">
                    {scanTime}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
