import { User, Clock } from "lucide-react";
import { type Attendee } from "@/db/database/schema";

export function AttendanceList({ attendees }: { attendees: Attendee[] }) {
  return (
    <div className="bg-card rounded-[2rem] border shadow-xl overflow-hidden flex flex-col h-100 md:h-full">
      <div className="px-6 py-4 border-b bg-muted/30">
        <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
          Papan Kehadiran
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-muted-foreground/10">
        {attendees.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 italic text-sm">
            <User className="size-10 mb-2 opacity-20" />
            <p>Belum ada yang absen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attendees.map((person, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/50 animate-in slide-in-from-right-4 duration-500"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {person.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate leading-none">
                      {person.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate mt-1 uppercase tracking-tighter">
                      {person.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-background px-2 py-1 rounded-lg border shrink-0">
                  <Clock className="size-3" />
                  {person.scannedAt
                    ? new Date(person.scannedAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--:--"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
