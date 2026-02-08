"use client";

import { User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Attendee } from "@/db/database/schema";

interface MeetingAttendeesProps {
  attendees: Attendee[];
}

export function MeetingAttendees({ attendees }: MeetingAttendeesProps) {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-100">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h4 className="font-bold text-sm text-slate-700">Peserta Masuk</h4>
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-700 hover:bg-blue-100"
        >
          {attendees.length} Orang
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto">
        {attendees.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs italic flex flex-col items-center">
            <User className="h-8 w-8 mb-2 opacity-20" /> Belum ada peserta
            scan...
          </div>
        ) : (
          attendees.map((person) => (
            <div
              key={person.id}
              className="px-5 py-3 border-b border-slate-50 flex items-center justify-between bg-blue-50/30 animate-in slide-in-from-left-2 duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  {person.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-sm font-bold text-slate-700">
                  {person.name}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(person.scannedAt!).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
