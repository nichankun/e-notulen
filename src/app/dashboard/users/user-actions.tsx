"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

export function UserActions({ user }: { user: User }) {
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
        startTransition(() => router.refresh());
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error("Gagal menghapus user");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nip)
      return toast.error("Nama dan NIP wajib diisi");
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, ...formData }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Data berhasil diperbarui");
        setOpenEdit(false);
        startTransition(() => router.refresh());
      } else {
        toast.error(json.message || "Gagal memperbarui data");
      }
    } catch {
      toast.error("Kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(user.nip)}
          >
            Salin NIP
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenDelete(true)}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* EDIT DIALOG */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Data Pegawai</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nama Lengkap</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={isProcessing}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>NIP</Label>
                <Input
                  value={formData.nip}
                  onChange={(e) =>
                    setFormData({ ...formData, nip: e.target.value })
                  }
                  disabled={isProcessing}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Instansi</Label>
                <Input
                  value={formData.agency}
                  onChange={(e) =>
                    setFormData({ ...formData, agency: e.target.value })
                  }
                  disabled={isProcessing}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(val) =>
                  setFormData({ ...formData, role: val as "admin" | "pegawai" })
                }
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pegawai">Staff Pegawai</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Password Baru{" "}
                <span className="text-muted-foreground font-normal">
                  (opsional)
                </span>
              </Label>
              <Input
                type="password"
                placeholder="Biarkan kosong jika tetap"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={isProcessing}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isProcessing} className="w-full">
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              <b>{user.name}</b> akan dihapus permanen dan tidak bisa
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isProcessing}
            >
              {isProcessing ? "Menghapus..." : "Hapus"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
