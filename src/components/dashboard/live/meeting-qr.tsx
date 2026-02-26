"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface MeetingQRCodeProps {
  meetingId: string;
  origin: string;
}

export function MeetingQRCode({ meetingId, origin }: MeetingQRCodeProps) {
  // ID Dinamis agar tidak terjadi konflik jika ada banyak QR Code di satu halaman
  const canvasId = `qr-code-canvas-${meetingId}`;

  const downloadQRCode = () => {
    // Cari elemen berdasarkan ID yang spesifik untuk rapat ini
    const canvas = document.getElementById(
      canvasId,
    ) as HTMLCanvasElement | null;

    if (canvas) {
      try {
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `absensi-rapat-${meetingId}.png`;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        toast.success("QR Code Diunduh", {
          description: "Gambar QR telah disimpan ke perangkat Anda.",
        });
      } catch (error: unknown) {
        // TYPE-SAFE: Tangkap error tanpa menggunakan 'any'
        console.error("Gagal memproses kanvas QR:", error);
        toast.error("Gagal Mengunduh", {
          description: "Terjadi kesalahan sistem saat menyimpan gambar.",
        });
      }
    } else {
      toast.error("QR Code Belum Siap", {
        description: "Tunggu hingga gambar selesai dimuat.",
      });
    }
  };

  return (
    <Card className="p-5 sm:p-6 text-center border-slate-200 shadow-sm flex flex-col items-center justify-center h-fit bg-white">
      {/* Header Kecil */}
      <div className="mb-4 space-y-1 w-full">
        <h4 className="font-bold text-slate-800 flex items-center justify-center gap-2 text-sm sm:text-base">
          <QrCode className="h-4 w-4 text-blue-600" />
          Scan Absensi
        </h4>
        <div className="text-[10px] sm:text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-mono inline-block border border-slate-200">
          ID: <span className="font-bold text-slate-700">{meetingId}</span>
        </div>
      </div>

      {/* Container QR Code */}
      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-inner mb-5">
        {origin ? (
          <QRCodeCanvas
            id={canvasId} // Gunakan ID Dinamis di sini
            value={`${origin}/attend/${meetingId}`}
            size={160}
            fgColor="#1e293b"
            bgColor="#ffffff"
            level={"H"} // Level High sangat bagus untuk URL pendek agar mudah di-scan dari jauh
            includeMargin={true}
            style={{ width: "100%", height: "auto", maxWidth: "160px" }}
          />
        ) : (
          <div className="h-40 w-40 bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">
            <QrCode className="h-10 w-10 text-slate-300 opacity-50" />
          </div>
        )}
      </div>

      {/* Tombol Download */}
      <Button
        variant="outline"
        onClick={downloadQRCode}
        // Matikan tombol jika origin belum ada (mencegah klik saat loading)
        disabled={!origin}
        className="w-full text-xs font-bold h-10 bg-white border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="mr-2 h-4 w-4" /> Simpan Gambar
      </Button>
    </Card>
  );
}
