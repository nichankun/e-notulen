import { type Attendee } from "@/db/database/schema";
import Image from "next/image";

export function AttendanceList({ attendees }: { attendees: Attendee[] }) {
  return (
    <div className="border rounded-xl bg-card overflow-hidden flex flex-col h-125 lg:h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Papan Kehadiran</p>
        <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
          LIVE
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {attendees.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Belum ada peserta
          </div>
        ) : (
          attendees.map((person, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg border bg-background animate-in fade-in duration-300"
            >
              {/* Kiri */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                  {person.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {person.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {person.department}
                  </p>
                </div>
              </div>

              {/* Kanan */}
              <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                {person.signature ? (
                  <div className="relative h-6 w-12 bg-white rounded border overflow-hidden">
                    <Image
                      src={person.signature}
                      alt="TTD"
                      fill
                      sizes="48px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-6 w-12 rounded border border-dashed flex items-center justify-center text-[9px] text-muted-foreground">
                    -
                  </div>
                )}
                <p className="text-[10px] font-mono text-muted-foreground">
                  {person.scannedAt
                    ? new Date(person.scannedAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--:--"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
