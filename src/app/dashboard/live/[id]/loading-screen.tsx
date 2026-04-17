"use client";

import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LoadingScreenProps {
  progress: number;
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    // PERBAIKAN 1: Menghapus font-sans.
    // Menggunakan text-foreground agar warna teks adaptif terhadap tema.
    <div className="flex flex-col justify-center items-center h-[60vh] space-y-6 max-w-sm mx-auto p-4 text-center">
      {/* PERBAIKAN 2: Loader menggunakan warna primary tema Anda. 
          Ukuran sedikit diperbesar agar menjadi titik fokus. */}
      <div className="relative">
        <Loader2 className="animate-spin h-12 w-12 text-primary opacity-80" />
        <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full -z-10 animate-pulse" />
      </div>

      <div className="space-y-2">
        <p className="font-bold text-foreground tracking-tight">
          Menyiapkan Ruang Rapat...
        </p>
        <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">
          Sinkronisasi Data Sultra
        </p>
      </div>

      {/* PERBAIKAN 3: Menghapus override warna manual pada Progress. 
          Shadcn secara default sudah menggunakan warna primary untuk indikator bar. */}
      <div className="w-full space-y-1.5">
        <Progress value={progress} className="w-full h-1.5" />
        <p className="text-[10px] text-muted-foreground text-right font-mono font-bold">
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}
