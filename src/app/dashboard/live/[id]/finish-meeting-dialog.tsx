"use client";

import { Loader2 } from "lucide-react";
import { TriangleAlert } from "lucide-react";
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
  verificationCount: number;
}

export function FinishMeetingDialog({
  isOpen,
  onOpenChange,
  onFinish,
  isRouting,
  verificationCount,
}: FinishMeetingDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl p-6 md:p-8 border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold text-foreground text-xl tracking-tight">
            Selesaikan Rapat?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-[15px] mt-2 leading-relaxed">
            Data absensi dan notulensi akan diarsipkan secara permanen. Anda
            tidak dapat mengubahnya lagi setelah sesi ini resmi ditutup.
          </AlertDialogDescription>
          {verificationCount > 0 && (
            <div className="mt-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p>
                Ada {verificationCount} item rangkuman yang perlu diverifikasi.
                Pastikan transkrip dan bukti waktunya sudah diperiksa sebelum mengesahkan notula.
              </p>
            </div>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-3 mt-6">
          <AlertDialogCancel
            disabled={isRouting}
            className="rounded-full h-11 px-6 font-medium"
          >
            Batal
          </AlertDialogCancel>
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
