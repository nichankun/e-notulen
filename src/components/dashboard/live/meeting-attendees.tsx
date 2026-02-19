"use client";

import { User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Attendee } from "@/db/database/schema";

interface MeetingAttendeesProps {
  attendees: Attendee[];
}

// OPTIMASI: Pindahkan formatter ke luar agar tidak membebani memori saat polling real-time
const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

export function MeetingAttendees({ attendees }: MeetingAttendeesProps) {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col h-75 lg:h-100">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm flex justify-between items-center shrink-0">
        <h4 className="font-bold text-sm text-slate-700">Peserta Masuk</h4>
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
        >
          {attendees.length} Orang
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-0 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200">
        {attendees.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs italic">
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
              <User className="h-6 w-6 opacity-30" />
            </div>
            <p>Belum ada peserta scan...</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {attendees.map((person) => (
              <div
                key={person.id}
                className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors animate-in slide-in-from-left-2 duration-300"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 h-9 w-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {person.name
                      ? person.name.substring(0, 2).toUpperCase()
                      : "??"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate max-w-35 sm:max-w-50">
                      {person.name}
                    </p>
                    {person.department && (
                      <p className="text-[10px] text-slate-500 truncate max-w-35">
                        {person.department}
                      </p>
                    )}
                  </div>
                </div>

                <span className="shrink-0 text-[10px] font-mono font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                  {timeFormatter.format(new Date(person.scannedAt!))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
