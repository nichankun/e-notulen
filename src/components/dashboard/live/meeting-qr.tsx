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
  const canvasId = `qr-code-canvas-${meetingId}`;

  const downloadQRCode = () => {
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
    // PERBAIKAN 1: Menggunakan bg-card dan border standar shadcn
    <Card className="p-5 sm:p-6 text-center border shadow-sm flex flex-col items-center justify-center h-fit bg-card">
      {/* Header Kecil */}
      <div className="mb-4 space-y-2 w-full">
        <h4 className="font-bold text-foreground flex items-center justify-center gap-2 text-sm sm:text-base">
          {/* Ikon menggunakan warna primary tema Anda */}
          <QrCode className="h-4 w-4 text-primary" />
          Scan Absensi
        </h4>
        {/* Badge ID Rapat: Menggunakan bg-muted agar lebih soft */}
        <div className="text-[10px] sm:text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full font-mono inline-block border border-border">
          ID: <span className="font-bold text-foreground">{meetingId}</span>
        </div>
      </div>

      {/* Container QR Code */}
      {/* QR Code tetap butuh latar putih agar mudah di-scan kamera, 
          tapi pembungkusnya kita sesuaikan dengan border shadcn */}
      <div className="bg-white p-4 border border-border rounded-2xl shadow-inner mb-6 transition-all duration-300">
        {origin ? (
          <QRCodeCanvas
            id={canvasId}
            value={`${origin}/attend/${meetingId}`}
            size={160}
            fgColor="#0f172a" // Slate-900: Warna sangat gelap untuk kontras maksimal saat scan
            bgColor="#ffffff"
            level={"H"}
            includeMargin={false}
            style={{ width: "100%", height: "auto", maxWidth: "160px" }}
          />
        ) : (
          <div className="h-40 w-40 bg-muted animate-pulse rounded-xl flex items-center justify-center">
            <QrCode className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Tombol Download */}
      <Button
        variant="outline"
        onClick={downloadQRCode}
        disabled={!origin}
        // PERBAIKAN 2: Membersihkan class manual, mengandalkan standar Button shadcn
        className="w-full text-xs font-bold h-10 transition-all rounded-xl"
      >
        <Download className="mr-2 h-4 w-4" /> Simpan Gambar
      </Button>
    </Card>
  );
}
