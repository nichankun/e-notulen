"use client";

import React, { useState, useEffect, use } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Save, Download, CheckCheck, Clock, User } from "lucide-react";
import { useRouter } from "next/navigation";

// Interface untuk menangkap ID dari URL
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LiveMeetingPage({ params }: PageProps) {
  // UNWRAP PARAMS: Wajib di Next.js 15/16 App Router
  const { id } = use(params);

  const [timer, setTimer] = useState(0);
  const [attendees, setAttendees] = useState<string[]>([]);
  const router = useRouter();

  // 1. Timer berjalan setiap detik
  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    return new Date(seconds * 1000).toISOString().substr(11, 8);
  };

  // 2. Simulasi Peserta Masuk (Agar terlihat hidup)
  useEffect(() => {
    const names = [
      "Budi Santoso",
      "Siti Aminah",
      "Rudi Hartono",
      "Dewi Sartika",
    ];
    const timeouts = names.map((name, index) =>
      setTimeout(
        () => {
          setAttendees((prev) => [name, ...prev]);
        },
        (index + 1) * 2500,
      ),
    );
    return () => timeouts.forEach(clearTimeout);
  }, []);

  const handleFinish = () => {
    if (confirm("Apakah Anda yakin ingin menyelesaikan rapat ini?")) {
      router.push("/dashboard/archive");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Status Live */}
      <div className="flex items-center justify-between bg-green-50 border border-green-200 p-4 rounded-xl text-green-800 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="font-bold tracking-tight">SESI RAPAT LIVE</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-sm font-medium bg-white/50 px-3 py-1 rounded-md">
          <Clock className="h-4 w-4" />
          {formatTime(timer)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: QR Code */}
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

            <Button
              variant="outline"
              className="w-full text-xs font-bold h-9 bg-slate-50 border-slate-200"
            >
              <Download className="mr-2 h-3 w-3" /> Unduh QR Code
            </Button>
          </Card>

          {/* List Peserta */}
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
                  <User className="h-8 w-8 mb-2 opacity-20" />
                  Belum ada peserta scan...
                </div>
              ) : (
                attendees.map((name, idx) => (
                  <div
                    key={idx}
                    className="px-5 py-3 border-b border-slate-50 flex items-center justify-between bg-blue-50/30 animate-in slide-in-from-left-2 duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                        {name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="text-sm font-bold text-slate-700">
                        {name}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Baru saja
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Kolom Kanan: Notulen */}
        <div className="lg:col-span-2 h-full">
          <Card className="h-full flex flex-col border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-800">
                  Notulensi Rapat
                </h3>
                <p className="text-xs text-slate-500">
                  Catat poin penting keputusan rapat secara realtime.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
              >
                <Save className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 p-6 bg-white flex flex-col min-h-125">
              <Textarea
                className="flex-1 w-full p-4 bg-slate-50 rounded-xl border-slate-200 focus-visible:ring-blue-200 resize-none font-mono text-sm leading-relaxed text-slate-700"
                placeholder="Mulai mengetik notulensi rapat di sini..."
              />

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-slate-600 text-xs font-bold h-8"
                  >
                    <Camera className="mr-2 h-3 w-3" /> Lampirkan Foto
                  </Button>
                  <span className="text-xs text-slate-400 italic">
                    Belum ada foto.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-end">
              <Button
                onClick={handleFinish}
                className="bg-green-600 hover:bg-green-700 text-white px-6 h-12 rounded-xl font-bold shadow-lg shadow-green-200 transition-all active:scale-95"
              >
                <CheckCheck className="mr-2 h-5 w-5" /> Finalisasi & Simpan
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
