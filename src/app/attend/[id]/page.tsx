"use client";

import { useState, useEffect, use } from "react";
import { type Attendee } from "@/db/database/schema";
import { AttendanceForm } from "./attendance-form";
import { AttendanceList } from "./attendance-list";
import { Loader2, CheckCircle2 } from "lucide-react";
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
        if (res.status === 403) {
          toast.error("Sesi Rapat telah ditutup.");
          return;
        }
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-sm w-full text-center space-y-5 animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Presensi Berhasil
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Data Anda telah tercatat dalam riwayat rapat. Silakan tutup
              halaman ini.
            </p>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors mt-4"
          >
            Absen ulang / revisi data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="text-center pt-4 md:pt-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">
            Badan Pendapatan Daerah Prov. Sultra
          </p>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Presensi Digital
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-2 bg-muted inline-block px-3 py-1 rounded-full">
            {attendees.length} peserta telah hadir
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start pb-10">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <AttendanceForm
              onSubmit={async (values) => {
                try {
                  // Generate Unique Device ID menggunakan localStorage
                  let deviceId = localStorage.getItem("bapenda_device_id");
                  if (!deviceId) {
                    deviceId = crypto.randomUUID
                      ? crypto.randomUUID()
                      : `device-${Date.now()}-${Math.random().toString(36).substring(2)}`;
                    localStorage.setItem("bapenda_device_id", deviceId);
                  }

                  const res = await fetch(`/api/meetings/${id}/attendees`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...values,
                      deviceId: deviceId,
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
