import { type Attendee } from "@/db/database/schema";
import Image from "next/image";

export function AttendanceList({ attendees }: { attendees: Attendee[] }) {
  return (
    // Mengganti h-125 (tidak valid) menjadi h-[500px]
    <div className="border border-border rounded-xl bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col h-125 lg:h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30">
        <p className="text-sm font-bold text-foreground">Papan Kehadiran</p>
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full tracking-widest">
          LIVE
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-muted">
        {attendees.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm font-medium text-muted-foreground">
            Belum ada peserta
          </div>
        ) : (
          attendees.map((person, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl border border-border bg-background animate-in fade-in duration-300"
            >
              {/* Kiri */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {person.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {person.name}
                  </p>
                  <p className="text-[11px] font-medium text-muted-foreground truncate">
                    {person.department}
                  </p>
                </div>
              </div>

              {/* Kanan */}
              <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                {person.signature ? (
                  // Background putih dipaksa agar PNG TTD (yang hitam) selalu terlihat
                  <div className="relative h-7 w-14 bg-white rounded border border-border overflow-hidden">
                    <Image
                      src={person.signature}
                      alt="TTD"
                      fill
                      sizes="56px"
                      className="object-contain p-0.5"
                    />
                  </div>
                ) : (
                  <div className="h-7 w-14 rounded border border-dashed border-border flex items-center justify-center text-[9px] text-muted-foreground">
                    -
                  </div>
                )}
                <p className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
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
