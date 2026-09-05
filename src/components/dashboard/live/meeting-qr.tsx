"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MeetingQRCodeProps {
  meetingId: string;
  origin: string;
}

export function MeetingQRCode({ meetingId, origin }: MeetingQRCodeProps) {
  const canvasId = `qr-code-canvas-${meetingId}`;
  const [attendanceUrl, setAttendanceUrl] = useState("");

  useEffect(() => {
    let active = true;

    fetch(`/api/meetings/${meetingId}/attendance-token`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Gagal membuat token presensi");
        const result = await response.json();
        if (active && result.success && result.token && origin) {
          setAttendanceUrl(
            `${origin}/attend/${meetingId}?token=${encodeURIComponent(result.token)}`,
          );
        }
      })
      .catch(() => {
        if (active) setAttendanceUrl("");
      });

    return () => {
      active = false;
    };
  }, [meetingId, origin]);

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

        toast.success("QR Code Diunduh");
      } catch (error: unknown) {
        console.error("Gagal memproses QR:", error);
        toast.error("Gagal Mengunduh QR Code");
      }
    }
  };

  return (
    <div className="flex flex-col items-center text-center p-4">
      {/* BADGE ID RAPAT */}
      <div className="mb-4 px-2.5 py-1 bg-muted/50 rounded-md inline-flex items-center gap-1.5 border border-border/50 text-xs">
        <span className="text-muted-foreground">ID:</span>
        <span className="font-mono font-bold text-foreground tracking-wider">
          {meetingId}
        </span>
      </div>

      {/* CONTAINER QR CODE (Diperkecil sedikit) */}
      <div className="bg-white border rounded-xl shadow-sm mb-4 flex items-center justify-center min-h-40 min-w-40">
        {attendanceUrl ? (
          <QRCodeCanvas
            id={canvasId}
            value={attendanceUrl}
            size={140}
            fgColor="#0f172a"
            bgColor="#ffffff"
            level="H"
            marginSize={2}
            style={{ width: "140px", height: "140px" }}
          />
        ) : (
          <div className="h-35 w-35 bg-muted/30 animate-pulse rounded-lg flex items-center justify-center">
            <QrCode className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* TOMBOL DOWNLOAD (Dibuat Full Width & Small) */}
      <Button
        variant="outline"
        size="sm"
        onClick={downloadQRCode}
        disabled={!attendanceUrl}
        className="w-30 text-xs h-8"
      >
        <Download className="mr-1.5 h-3.5 w-3.5" />
        Unduh QR
      </Button>
    </div>
  );
}
