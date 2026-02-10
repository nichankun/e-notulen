"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Save } from "lucide-react";
import { toast } from "sonner"; // Menggunakan Sonner
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 1. Schema Validasi
const formSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  nip: z.string().min(5, "NIP wajib diisi (min 5)"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["admin", "pegawai"]),
});

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  // 2. Setup Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nip: "",
      password: "",
      role: "pegawai",
    },
  });

  // 3. Handle Submit
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsPending(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || "User berhasil ditambahkan");
        setOpen(false);
        form.reset();
        router.refresh(); // Refresh data tabel tanpa reload page
      } else {
        toast.error(result.message || "Gagal menambah user");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* UPDATE: w-full di mobile, w-auto di desktop */}
        <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition-all">
          <Plus className="mr-2 h-4 w-4" /> Tambah User Baru
        </Button>
      </DialogTrigger>

      {/* Dialog Content */}
      <DialogContent className="sm:max-w-md w-[95vw] rounded-xl">
        <DialogHeader>
          <DialogTitle>Tambah Pegawai Baru</DialogTitle>
          <DialogDescription>
            Masukkan data pegawai baru. NIP digunakan sebagai ID login.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Field Nama */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nama Lengkap"
                      {...field}
                      className="bg-slate-50 border-slate-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field NIP */}
            <FormField
              control={form.control}
              name="nip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIP / Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="199XXXXX"
                      {...field}
                      className="bg-slate-50 border-slate-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••"
                      {...field}
                      className="bg-slate-50 border-slate-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role (Jabatan)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Pilih Role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pegawai">Pegawai / Staff</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              {/* Tombol Simpan: Full width di mobile */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Simpan Data
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
