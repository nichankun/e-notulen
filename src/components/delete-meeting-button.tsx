"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteMeetingButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

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
        {/* PERBAIKAN 1: Menggunakan text-muted-foreground. 
            Hover menggunakan destructive (merah) transparan agar elegan. */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors rounded-lg"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </AlertDialogTrigger>

      {/* PERBAIKAN 2: Menghapus bg-white dan border-slate agar otomatis adaptif tema */}
      <AlertDialogContent className="rounded-2xl border-border">
        <AlertDialogHeader>
          {/* PERBAIKAN 3: Ikon peringatan menggunakan bg-destructive/10 agar senada dengan UI modern shadcn */}
          <div className="mx-auto bg-destructive/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-destructive h-6 w-6" />
          </div>
          <AlertDialogTitle className="text-center font-bold text-foreground">
            Hapus Arsip Permanen?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground">
            Tindakan ini tidak dapat dibatalkan. Seluruh data notulensi, daftar
            hadir, dan dokumentasi foto pada rapat ini akan dihapus dari server.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:justify-center gap-2 mt-4">
          <AlertDialogCancel
            disabled={isDeleting}
            className="rounded-xl border-border"
          >
            Batalkan
          </AlertDialogCancel>

          {/* PERBAIKAN 4: Menggunakan variant="destructive" bawaan shadcn. 
              Menghapus bayangan merah kaku (shadow-red-200) yang merusak dark mode. */}
          <Button
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="rounded-xl font-bold px-6"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Menghapus...
              </div>
            ) : (
              "Ya, Hapus Sekarang"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
