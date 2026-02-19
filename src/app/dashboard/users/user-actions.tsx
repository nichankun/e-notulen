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
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(json.message);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("Gagal update data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg"
          >
            <MoreHorizontal className="h-4 w-4 text-slate-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-40 rounded-xl shadow-xl border-slate-200"
        >
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
          <DropdownMenuItem
            onClick={() => setOpenDelete(true)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer font-medium"
          >
            <Trash className="mr-2 h-3.5 w-3.5" /> Hapus User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold">Edit Data Pegawai</DialogTitle>
            <DialogDescription>
              Kosongkan password jika tidak ingin menggantinya.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-slate-500">
                Nama Lengkap
              </Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={isProcessing}
                className="bg-slate-50 rounded-xl border-slate-200 h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-slate-500">
                  NIP
                </Label>
                <Input
                  value={formData.nip}
                  onChange={(e) =>
                    setFormData({ ...formData, nip: e.target.value })
                  }
                  disabled={isProcessing}
                  className="bg-slate-50 rounded-xl border-slate-200 h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-slate-500">
                  Instansi
                </Label>
                <Input
                  value={formData.agency}
                  onChange={(e) =>
                    setFormData({ ...formData, agency: e.target.value })
                  }
                  disabled={isProcessing}
                  className="bg-slate-50 rounded-xl border-slate-200 h-11"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-slate-500">
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData({ ...formData, role: val })}
                disabled={isProcessing}
              >
                <SelectTrigger className="bg-slate-50 rounded-xl border-slate-200 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pegawai">Staff Pegawai</SelectItem>
                  <SelectItem value="admin">Administrator IT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-slate-500">
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
                className="bg-slate-50 rounded-xl border-slate-200 h-11"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 font-bold rounded-xl h-12 shadow-lg shadow-blue-100"
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

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="bg-white rounded-2xl">
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
            <AlertDialogCancel
              disabled={isProcessing}
              className="rounded-xl border-slate-200"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
            >
              {isProcessing ? "Menghapus..." : "Ya, Hapus Permanen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
