"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "./columns";

interface UserActionsProps {
  user: User;
}

export function UserActions({ user }: UserActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name,
    nip: user.nip,
    agency: user.agency || "",
    role: user.role,
    password: "",
  });

  const isProcessing = loading || isPending;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?id=${user.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("User berhasil dihapus");
        setOpenDelete(false);
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(json.message);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("Gagal menghapus user");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.nip) {
      return toast.error("Nama dan NIP wajib diisi!");
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, ...formData }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success("Data berhasil diperbarui");
        setOpenEdit(false);
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(json.message || "Gagal memperbarui data");
      }
    } catch {
      toast.error("Kesalahan Jaringan: Cek koneksi server Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* PERBAIKAN: Menghapus text-slate-500 dan hover manual, mengandalkan variant="ghost" */}
          <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 rounded-xl">
          <DropdownMenuLabel>Aksi Pegawai</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(user.nip)}
            className="cursor-pointer font-medium"
          >
            Salin NIP
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setOpenEdit(true)}
            className="cursor-pointer font-medium"
          >
            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Data
          </DropdownMenuItem>
          {/* PERBAIKAN: Menggunakan semantik warna peringatan (destructive) shadcn */}
          <DropdownMenuItem
            onClick={() => setOpenDelete(true)}
            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer font-medium"
          >
            <Trash className="mr-2 h-3.5 w-3.5" /> Hapus User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* FORM EDIT DIALOG */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        {/* PERBAIKAN: Menghapus bg-white agar mendukung Dark Mode otomatis */}
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold">Edit Data Pegawai</DialogTitle>
            <DialogDescription>
              Kosongkan password jika tidak ingin menggantinya.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Nama Lengkap
              </Label>
              {/* PERBAIKAN: Menghapus bg-slate-50 dan membiarkan border standar */}
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={isProcessing}
                className="bg-background rounded-xl h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">
                  NIP
                </Label>
                <Input
                  value={formData.nip}
                  onChange={(e) =>
                    setFormData({ ...formData, nip: e.target.value })
                  }
                  disabled={isProcessing}
                  className="bg-background rounded-xl h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">
                  Instansi
                </Label>
                <Input
                  value={formData.agency}
                  onChange={(e) =>
                    setFormData({ ...formData, agency: e.target.value })
                  }
                  disabled={isProcessing}
                  className="bg-background rounded-xl h-11"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(val) =>
                  setFormData({ ...formData, role: val as "admin" | "pegawai" })
                }
                disabled={isProcessing}
              >
                <SelectTrigger className="bg-background rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pegawai">Staff Pegawai</SelectItem>
                  <SelectItem value="admin">Administrator IT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Password Baru (Opsional)
              </Label>
              <Input
                type="password"
                placeholder="Biarkan kosong jika tetap"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={isProcessing}
                className="bg-background rounded-xl h-11"
              />
            </div>
            <DialogFooter className="pt-4">
              {/* PERBAIKAN: Menggunakan default variant dari Button */}
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full font-bold rounded-xl h-12 transition-all"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ALERT DELETE DIALOG */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">
              Hapus Pengguna?
            </AlertDialogTitle>
            <AlertDialogDescription>
              User <b>{user.name}</b> akan dihapus permanen. Tindakan ini tidak
              bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* PERBAIKAN: Menghapus border manual, biarkan bawaan shadcn */}
            <AlertDialogCancel disabled={isProcessing} className="rounded-xl">
              Batal
            </AlertDialogCancel>

            {/* PERBAIKAN: Menggunakan variant="destructive" untuk tombol bahaya */}
            <Button
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isProcessing}
              className="rounded-xl font-bold"
            >
              {isProcessing ? "Menghapus..." : "Ya, Hapus Permanen"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
