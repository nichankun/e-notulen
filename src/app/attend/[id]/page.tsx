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
  // 1. Ambil ID Rapat
  const { id } = use(params);

  // 2. State Utama
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // 3. Polling data peserta secara real-time
  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}/attendees`);
        const json = await res.json();
        if (json.success) {
          setAttendees(json.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data peserta:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();
    const interval = setInterval(fetchAttendees, 5000); // Update setiap 5 detik
    return () => clearInterval(interval);
  }, [id]);

  // Loading State saat pertama kali buka
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium italic">
          Menghubungkan ke Bapenda Sultra...
        </p>
      </div>
    );
  }

  // Tampilan Sukses setelah Absen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <div className="max-w-md w-full text-center p-10 bg-card rounded-[2.5rem] border shadow-2xl animate-in zoom-in-95">
          <h2 className="text-3xl font-black mb-2 text-primary">
            Terima Kasih!
          </h2>
          <p className="text-muted-foreground italic">
            Kehadiran Anda sudah tercatat di papan rincian.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-6 text-sm font-bold text-primary hover:underline"
          >
            Kembali ke Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary mb-4">
            <Fingerprint className="size-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Live Presensi Digital
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-primary">
            e-Notulen
          </h1>

          {/* Real-time Counter Badge */}
          <div className="mt-4 flex items-center justify-center gap-2 text-foreground font-bold bg-background/60 backdrop-blur shadow-sm py-2 px-6 rounded-full border w-fit mx-auto">
            <Users className="size-4 text-primary" />
            <span>{attendees.length} Peserta telah hadir</span>
          </div>
        </div>

        {/* DASHBOARD LAYOUT: Form di kiri, List di kanan */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <AttendanceForm
              onSubmit={async (values) => {
                try {
                  // Kita gunakan 'values' di sini untuk kirim ke database
                  const res = await fetch(`/api/meetings/${id}/attendees`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                  });

                  const json = await res.json();

                  if (json.success) {
                    setSuccess(true);
                    toast.success("Presensi berhasil dicatat!");
                  } else {
                    toast.error(json.message || "Gagal mencatat kehadiran");
                  }
                } catch (err) {
                  console.error("Submit Error:", err);
                  toast.error("Terjadi kesalahan jaringan.");
                }
              }}
            />
          </div>
          <div className="lg:col-span-2 order-1 lg:order-2">
            <AttendanceList attendees={attendees} />
          </div>
        </div>
      </div>
    </div>
  );
}
