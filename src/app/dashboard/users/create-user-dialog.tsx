"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Save } from "lucide-react";
import { toast } from "sonner";
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

const formSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  nip: z.string().min(5, "NIP wajib diisi (min 5)"),
  agency: z.string().min(2, "Nama Instansi wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["admin", "pegawai"]),
});

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nip: "",
      agency: "",
      password: "",
      role: "pegawai",
    },
  });

  const { isSubmitting } = form.formState;
  const isLoading = isSubmitting || isPending;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || "User berhasil ditambahkan");
        form.reset();
        setOpen(false);
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(result.message || "Gagal menambah user");
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all font-bold rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> Tambah User Baru
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md w-[95vw] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-bold">Tambah Pegawai Baru</DialogTitle>
          <DialogDescription>
            Masukkan data pegawai baru beserta instansinya.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Nama Lengkap
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Input nama lengkap..."
                      {...field}
                      disabled={isLoading}
                      className="bg-slate-50 rounded-xl h-11 border-slate-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                      NIP / Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="199XXXXX"
                        {...field}
                        disabled={isLoading}
                        className="bg-slate-50 rounded-xl h-11 border-slate-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="agency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Instansi
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bapenda"
                        {...field}
                        disabled={isLoading}
                        className="bg-slate-50 rounded-xl h-11 border-slate-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••"
                      {...field}
                      disabled={isLoading}
                      className="bg-slate-50 rounded-xl h-11 border-slate-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Hak Akses (Role)
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-50 rounded-xl h-11 border-slate-200 font-medium">
                        <SelectValue placeholder="Pilih Role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pegawai">Pegawai / Staff</SelectItem>
                      <SelectItem value="admin">Administrator IT</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 font-bold h-12 rounded-xl shadow-lg shadow-blue-100 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Simpan Data Pegawai
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
