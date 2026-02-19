"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteMeetingButton({ id }: { id: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Gabungan status loading API dan transisi refresh data
  const isDeleting = loading || isPending;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success("Arsip Berhasil Dihapus", {
          description: "Data dan dokumentasi fisik telah dibersihkan.",
        });

        // OPTIMASI: Refresh data secara halus tanpa freeze
        startTransition(() => {
          router.refresh();
          setOpen(false);
        });
      } else {
        toast.error("Gagal Menghapus", {
          description: json.message || "Terjadi kesalahan pada server.",
        });
      }
    } catch (error: unknown) {
      console.error("Delete Error:", error);
      toast.error("Kesalahan Jaringan", {
        description: "Pastikan koneksi internet Anda stabil.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-2xl bg-white">
        <AlertDialogHeader>
          <div className="mx-auto bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <AlertTriangle className="text-red-600 h-6 w-6" />
          </div>
          <AlertDialogTitle className="text-center font-bold">
            Hapus Arsip Permanen?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-slate-500">
            Tindakan ini tidak dapat dibatalkan. Seluruh data notulensi, daftar
            hadir, dan dokumentasi foto pada rapat ini akan dihapus dari server
            Bapenda.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2 mt-2">
          <AlertDialogCancel
            disabled={isDeleting}
            className="rounded-xl border-slate-200"
          >
            Batalkan
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Mencegah dialog menutup otomatis sebelum proses selesai
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Menghapus...
              </div>
            ) : (
              "Ya, Hapus Sekarang"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
