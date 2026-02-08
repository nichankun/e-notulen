"use client";

// 1. Hapus 'React' dan 'useRef' (Clean Import)
import { useState, useEffect, use } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Save,
  Download,
  CheckCheck,
  Clock,
  User,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type Meeting, type Attendee } from "@/db/database/schema";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LiveMeetingPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // State Data
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  // Input User
  const [notulen, setNotulen] = useState("");

  // UI State
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [timer, setTimer] = useState(0);

  // 1. FETCH DATA RAPAT & NOTULEN TERAKHIR
  useEffect(() => {
    const initData = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}`);
        const json = await res.json();
        if (json.success) {
          setMeetingData(json.data);
          setNotulen(json.data.content || "");
        } else {
          router.push("/dashboard");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, router]);

  // 2. REAL-TIME ATTENDANCE (Polling setiap 3 detik)
  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}/attendees`);
        const json = await res.json();
        if (json.success) {
          setAttendees(json.data);
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    };

    fetchAttendees();
    const interval = setInterval(fetchAttendees, 3000);
    return () => clearInterval(interval);
  }, [id]);

  // 3. Timer Logic
  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) =>
    new Date(seconds * 1000).toISOString().substr(11, 8);

  // FUNGSI 1: FINALISASI & SIMPAN KE DB
  const handleFinish = async () => {
    if (!confirm("Selesaikan rapat dan simpan notulen ke database?")) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: notulen,
          status: "completed",
        }),
      });

      if (res.ok) {
        router.push("/dashboard/archive");
        router.refresh();
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (e) {
      // 2. Gunakan 'e' untuk logging agar tidak error 'defined but never used'
      console.error("Error finalizing meeting:", e);
      alert("Error jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  // FUNGSI 2: TOMBOL SIMPAN SEMENTARA
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/meetings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ content: notulen }),
      });
    } catch (e) {
      console.error("Auto-save error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  // FUNGSI 3: SIMULASI SCAN QR
  const demoAddAttendee = async () => {
    const demoNames = [
      "Budi Santoso",
      "Siti Aminah",
      "Rudi Hartono",
      "Dewi Sartika",
      "Agus Setiawan",
    ];
    const randomName = demoNames[Math.floor(Math.random() * demoNames.length)];

    try {
      await fetch(`/api/meetings/${id}/attendees`, {
        method: "POST",
        body: JSON.stringify({ name: randomName, nip: "199XXXXX" }),
      });
    } catch (e) {
      console.error("Demo scan error:", e);
    }
  };

  if (loading)
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Status */}
      <div className="flex items-center justify-between bg-green-50 border border-green-200 p-4 rounded-xl text-green-800 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="font-bold tracking-tight">SESI RAPAT LIVE</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-sm font-medium bg-white/50 px-3 py-1 rounded-md">
          <Clock className="h-4 w-4" /> {formatTime(timer)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KIRI: Absensi */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 text-center border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-1">Scan Absensi</h4>
            <p className="text-xs text-slate-500 mb-4">
              ID Rapat: <span className="font-mono font-bold">{id}</span>
            </p>
            <div className="bg-white p-4 border-2 border-dashed border-slate-300 rounded-xl inline-block mb-4 mx-auto">
              <QRCodeSVG
                value={`https://bapenda.sultra.go.id/absen/${id}`}
                size={140}
                fgColor="#1e293b"
              />
            </div>

            {/* Tombol Demo */}
            <Button
              onClick={demoAddAttendee}
              variant="outline"
              size="sm"
              className="w-full text-xs font-bold border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              + Simulasi Scan Pegawai (Demo)
            </Button>

            {/* Tombol Unduh QR */}
            <Button
              variant="outline"
              className="w-full text-xs font-bold h-9 bg-slate-50 border-slate-200 mt-2"
            >
              <Download className="mr-2 h-3 w-3" /> Unduh QR Code
            </Button>
          </Card>

          <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-100">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h4 className="font-bold text-sm text-slate-700">
                Peserta Masuk
              </h4>
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
        </div>

        {/* KANAN: Notulen */}
        <div className="lg:col-span-2 h-full">
          <Card className="h-full flex flex-col border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-800">
                  {meetingData?.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Pimpinan: {meetingData?.leader}
                </p>
              </div>
              <Button
                onClick={handleSaveDraft}
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
              </Button>
            </div>

            <div className="flex-1 p-6 bg-white flex flex-col min-h-125">
              <Textarea
                className="flex-1 w-full p-4 bg-slate-50 rounded-xl border-slate-200 focus-visible:ring-blue-200 resize-none font-mono text-sm leading-relaxed text-slate-700"
                placeholder="Mulai mengetik notulensi rapat di sini..."
                value={notulen}
                onChange={(e) => setNotulen(e.target.value)}
              />
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-slate-600 text-xs font-bold h-8"
                >
                  <Camera className="mr-2 h-3 w-3" /> Lampirkan Foto
                </Button>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-end">
              <Button
                onClick={handleFinish}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white px-6 h-12 rounded-xl font-bold shadow-lg shadow-green-200 transition-all active:scale-95"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCheck className="mr-2 h-5 w-5" /> Finalisasi & Simpan
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
