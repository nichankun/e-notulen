import { User, Clock, FileSignature } from "lucide-react";
import { type Attendee } from "@/db/database/schema";
import Image from "next/image";
export function AttendanceList({ attendees }: { attendees: Attendee[] }) {
  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-[2rem] border shadow-xl overflow-hidden flex flex-col h-125 lg:h-full">
      <div className="px-6 py-5 border-b bg-muted/20 flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-widest text-foreground flex items-center gap-2">
          <FileSignature className="size-4 text-primary" />
          Papan Kehadiran
        </h3>
        <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-1 rounded-md font-bold">
          LIVE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-muted-foreground/20">
        {attendees.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 italic text-sm">
            <User className="size-12 mb-3 opacity-20" />
            <p>Papan masih kosong</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attendees.map((person, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-background border shadow-sm animate-in slide-in-from-right-4 duration-500 hover:border-primary/40 transition-colors"
              >
                {/* Info Kiri: Avatar & Nama */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-sm shrink-0 border border-primary/20">
                    {person.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate leading-tight text-foreground">
                      {person.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded-sm truncate max-w-25">
                        {person.department}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Kanan: Tanda Tangan & Waktu */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {person.signature ? (
                    <div className="relative h-6 w-12 bg-white rounded flex items-center justify-center border border-muted/50 overflow-hidden mix-blend-multiply dark:mix-blend-screen">
                      <Image
                        src={person.signature}
                        alt="Paraf"
                        fill
                        sizes="48px"
                        className="object-contain opacity-80"
                      />
                    </div>
                  ) : (
                    <div className="h-6 w-12 bg-muted/30 rounded border border-dashed border-muted flex items-center justify-center text-[8px] text-muted-foreground">
                      No TT
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
                    <Clock className="size-2.5" />
                    {person.scannedAt
                      ? new Date(person.scannedAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
