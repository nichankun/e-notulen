"use client";

import { useState, useEffect, use } from "react";
import { type Attendee } from "@/db/database/schema";
import { AttendanceForm } from "./attendance-form";
import { AttendanceList } from "./attendance-list";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchAttendees = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}/attendees`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) setAttendees(json.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data peserta:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendees();
    const interval = setInterval(fetchAttendees, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-sm w-full text-center space-y-4 animate-in fade-in duration-500">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Presensi Berhasil
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Data Anda telah tercatat dalam riwayat rapat.
            </p>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="text-sm text-primary hover:underline"
          >
            Absen ulang / revisi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="text-center pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
            Badan Pendapatan Daerah Prov. Sulawesi Tenggara
          </p>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Presensi Digital
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {attendees.length} peserta telah hadir
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start pb-10">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <AttendanceForm
              onSubmit={async (values) => {
                try {
                  const fingerprint = `${navigator.userAgent}-${window.screen.width}x${window.screen.height}`;
                  const res = await fetch(`/api/meetings/${id}/attendees`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...values,
                      deviceId: btoa(fingerprint),
                    }),
                  });
                  const json = await res.json();
                  if (json.success) {
                    setSuccess(true);
                    toast.success("Presensi berhasil dicatat");
                  } else {
                    toast.error(json.message);
                  }
                } catch {
                  toast.error("Pastikan internet Anda stabil.");
                }
              }}
            />
          </div>
          <div className="lg:col-span-2 order-1 lg:order-2 lg:sticky lg:top-8">
            <AttendanceList attendees={attendees} />
          </div>
        </div>
      </div>
    </div>
  );
}
