"use client";

import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FinishMeetingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: () => void;
  isRouting: boolean;
}

export function FinishMeetingDialog({
  isOpen,
  onOpenChange,
  onFinish,
  isRouting,
}: FinishMeetingDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      {/* PERBAIKAN 1: Menghapus bg-white dan border-gray-100 agar otomatis mendukung Dark Mode */}
      <AlertDialogContent className="rounded-2xl p-6 md:p-8 border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold text-foreground text-xl tracking-tight">
            Selesaikan Rapat?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-[15px] mt-2 leading-relaxed">
            Data absensi dan notulensi akan diarsipkan secara permanen. Anda
            tidak dapat mengubahnya lagi setelah sesi ini resmi ditutup.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-3 mt-6">
          <AlertDialogCancel
            disabled={isRouting}
            className="rounded-full h-11 px-6 font-medium"
          >
            Batal
          </AlertDialogCancel>
          {/* PERBAIKAN 3: Menggunakan bg-primary (warna tema) alih-alih biru kaku */}
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onFinish();
            }}
            className="bg-primary hover:opacity-90 text-primary-foreground rounded-full h-11 px-8 font-bold transition-all shadow-md"
            disabled={isRouting}
          >
            {isRouting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Memproses...
              </>
            ) : (
              "Ya, Selesaikan"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
