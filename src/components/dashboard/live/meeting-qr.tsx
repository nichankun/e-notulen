"use client";

import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MeetingQRCodeProps {
  meetingId: string;
  origin: string;
}

export function MeetingQRCode({ meetingId, origin }: MeetingQRCodeProps) {
  return (
    <Card className="p-6 text-center border-slate-200 shadow-sm">
      <h4 className="font-bold text-slate-800 mb-1">Scan Absensi</h4>
      <p className="text-xs text-slate-500 mb-4">
        ID Rapat: <span className="font-mono font-bold">{meetingId}</span>
      </p>

      <div className="bg-white p-4 border-2 border-dashed border-slate-300 rounded-xl inline-block mb-4 mx-auto">
        {origin ? (
          <QRCodeSVG
            value={`${origin}/attend/${meetingId}`}
            size={140}
            fgColor="#1e293b"
          />
        ) : (
          <div className="h-35 w-35 bg-slate-100 animate-pulse rounded-md" />
        )}
      </div>

      <Button
        variant="outline"
        className="w-full text-xs font-bold h-9 bg-slate-50 border-slate-200 mt-2"
      >
        <Download className="mr-2 h-3 w-3" /> Unduh QR Code
      </Button>
    </Card>
  );
}
