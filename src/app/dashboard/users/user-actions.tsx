"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash, Loader2 } from "lucide-react";
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
  AlertDialogAction,
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
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  // State untuk Form Edit
  const [formData, setFormData] = useState({
    name: user.name,
    nip: user.nip,
    agency: user.agency || "",
    role: user.role,
    password: "",
  });

  // --- FUNGSI HAPUS ---
  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?id=${user.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("User berhasil dihapus");
        router.refresh();
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      console.error(err); // <--- FIX: Gunakan variable err agar tidak warning
      toast.error("Gagal menghapus user");
    } finally {
      setLoading(false);
      setOpenDelete(false);
    }
  };

  // --- FUNGSI EDIT ---
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, ...formData }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Data berhasil diperbarui");
        setOpenEdit(false);
        router.refresh();
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      console.error(err); // <--- FIX: Gunakan variable err agar tidak warning
      toast.error("Gagal update data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. DROPDOWN MENU */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            suppressHydrationWarning
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-slate-100"
          >
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4 text-slate-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-40 bg-white shadow-lg border-slate-200"
        >
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(user.nip)}
            className="cursor-pointer"
          >
            Salin NIP
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* Trigger Edit */}
          <DropdownMenuItem
            onClick={() => setOpenEdit(true)}
            className="cursor-pointer"
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit Data
          </DropdownMenuItem>

          {/* Trigger Delete */}
          <DropdownMenuItem
            onClick={() => setOpenDelete(true)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
          >
            <Trash className="mr-2 h-4 w-4" /> Hapus User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 2. DIALOG EDIT (MODAL) */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Edit Data Pegawai</DialogTitle>
            <DialogDescription>
              Ubah data pegawai di sini. Kosongkan password jika tidak ingin
              menggantinya.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Nama Lengkap</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>NIP</Label>
              <Input
                value={formData.nip}
                onChange={(e) =>
                  setFormData({ ...formData, nip: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Instansi</Label>
              <Input
                value={formData.agency}
                onChange={(e) =>
                  setFormData({ ...formData, agency: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData({ ...formData, role: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pegawai">Pegawai</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Password Baru (Opsional)</Label>
              <Input
                type="password"
                placeholder="Biarkan kosong jika tetap"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="bg-blue-600">
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. ALERT DELETE (KONFIRMASI) */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              User <b>{user.name}</b> akan dihapus permanen dari database.
              Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
