"use client";

import { QRCodeCanvas } from "qrcode.react"; // 1. Ganti import ke QRCodeCanvas
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MeetingQRCodeProps {
  meetingId: string;
  origin: string;
}

export function MeetingQRCode({ meetingId, origin }: MeetingQRCodeProps) {
  // 2. Fungsi untuk mengunduh QR Code
  const downloadQRCode = () => {
    // Cari elemen canvas berdasarkan ID
    const canvas = document.getElementById(
      "qr-code-canvas",
    ) as HTMLCanvasElement;

    if (canvas) {
      // Konversi canvas ke URL gambar (PNG)
      const pngUrl = canvas.toDataURL("image/png");

      // Buat elemen link <a> sementara untuk trigger download
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `absensi-rapat-${meetingId}.png`; // Nama file saat diunduh

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <Card className="p-6 text-center border-slate-200 shadow-sm">
      <h4 className="font-bold text-slate-800 mb-1">Scan Absensi</h4>
      <p className="text-xs text-slate-500 mb-4">
        ID Rapat: <span className="font-mono font-bold">{meetingId}</span>
      </p>

      <div className="bg-white p-4 border-2 border-dashed border-slate-300 rounded-xl inline-block mb-4 mx-auto">
        {origin ? (
          // 3. Gunakan QRCodeCanvas dan beri ID
          <QRCodeCanvas
            id="qr-code-canvas"
            value={`${origin}/attend/${meetingId}`}
            size={140}
            fgColor="#1e293b"
            level={"H"} // Tingkat koreksi error tinggi (agar tetap terbaca jelas)
            includeMargin={true}
          />
        ) : (
          <div className="h-35 w-35 bg-slate-100 animate-pulse rounded-md" />
        )}
      </div>

      <Button
        variant="outline"
        onClick={downloadQRCode} // 4. Pasang fungsi download disini
        className="w-full text-xs font-bold h-9 bg-slate-50 border-slate-200 mt-2 hover:bg-slate-100"
      >
        <Download className="mr-2 h-3 w-3" /> Unduh QR Code
      </Button>
    </Card>
  );
}
