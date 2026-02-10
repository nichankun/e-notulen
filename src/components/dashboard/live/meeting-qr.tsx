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
  const downloadQRCode = () => {
    const canvas = document.getElementById(
      "qr-code-canvas",
    ) as HTMLCanvasElement;

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
      } catch (error) {
        console.error(error);
        toast.error("Gagal Unduh", {
          description: "Terjadi kesalahan saat memproses gambar.",
        });
      }
    }
  };

  return (
    // PERBAIKAN DI SINI:
    // 1. Hapus 'h-full' agar tidak memanjang ke bawah memaksa memenuhi kolom.
    // 2. Gunakan 'h-fit' atau biarkan default agar tinggi menyesuaikan konten.
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
            id="qr-code-canvas"
            value={`${origin}/attend/${meetingId}`}
            size={160}
            fgColor="#1e293b"
            bgColor="#ffffff"
            level={"H"}
            includeMargin={true}
            // Style responsive: max-width dibatasi agar tidak terlalu besar di desktop
            style={{ width: "100%", height: "auto", maxWidth: "160px" }}
          />
        ) : (
          <div className="h-40 w-40 bg-slate-100 animate-pulse rounded-md" />
        )}
      </div>

      {/* Tombol Download */}
      <Button
        variant="outline"
        onClick={downloadQRCode}
        className="w-full text-xs font-bold h-10 bg-white border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-colors"
      >
        <Download className="mr-2 h-4 w-4" /> Simpan Gambar
      </Button>
    </Card>
  );
}
