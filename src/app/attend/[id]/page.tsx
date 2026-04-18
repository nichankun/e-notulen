"use client";

import { useState, useEffect, use } from "react";
import { type Attendee } from "@/db/database/schema";
import { AttendanceForm } from "./attendance-form";
import { AttendanceList } from "./attendance-list";
import { Fingerprint, Users, Loader2 } from "lucide-react";
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
    const fetchAttendees = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}/attendees`);
        const json = await res.json();
        if (json.success) setAttendees(json.data);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium italic">
          Menyiapkan Papan Presensi...
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-b from-muted/50 to-background">
        <div className="max-w-sm w-full text-center p-10 bg-card rounded-[2rem] border shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Fingerprint className="size-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black mb-2 text-foreground">
            Presensi Berhasil!
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Data Anda telah diamankan dan masuk ke dalam riwayat rapat.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="text-xs font-bold text-primary hover:underline bg-primary/10 px-4 py-2 rounded-full"
          >
            Absen Ulang / Revisi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-muted/50 via-background to-primary/5 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="text-center pt-4 md:pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary mb-4 border border-primary/20 shadow-sm">
            <Fingerprint className="size-3.5 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Sistem Presensi
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-2">
            e-<span className="text-primary">Notulen</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Badan Pendapatan Daerah Prov. Sulawesi Tenggara
          </p>

          {/* Real-time Counter Badge */}
          <div className="mt-6 inline-flex items-center gap-3 text-foreground font-bold bg-card/80 backdrop-blur-md shadow-lg py-2 px-6 rounded-full border border-border/50">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="size-6 rounded-full bg-muted border-2 border-background flex items-center justify-center z-10"
                >
                  <Users className="size-3 text-muted-foreground" />
                </div>
              ))}
            </div>
            <span className="text-sm">
              <span className="text-primary text-lg">{attendees.length}</span>{" "}
              Hadir
            </span>
          </div>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 items-start pb-10">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <AttendanceForm
              onSubmit={async (values) => {
                try {
                  const fingerprint = `${navigator.userAgent}-${window.screen.width}x${window.screen.height}`;
                  const generatedDeviceId = btoa(fingerprint);

                  const payloadData = {
                    ...values,
                    deviceId: generatedDeviceId,
                    nip: "-",
                  };

                  const res = await fetch(`/api/meetings/${id}/attendees`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payloadData),
                  });

                  const json = await res.json();

                  if (json.success) {
                    setSuccess(true);
                    toast.success("Presensi Berhasil", {
                      description: "Data berhasil divalidasi.",
                    });
                  } else {
                    toast.error("Gagal", { description: json.message });
                  }
                } catch (err) {
                  console.error("Submit Error:", err);
                  toast.error("Kesalahan Jaringan", {
                    description: "Pastikan internet Anda stabil.",
                  });
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
