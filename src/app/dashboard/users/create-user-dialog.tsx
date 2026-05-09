"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
  agency: z.string().min(2, "Nama instansi wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["admin", "pegawai"]),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [createdUser, setCreatedUser] = useState<FormValues | null>(null);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nip: "",
      agency: "",
      password: "",
      role: "pegawai",
    },
  });

  const isLoading = form.formState.isSubmitting || isPending;

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("User berhasil ditambahkan");
        setCreatedUser(values);
        startTransition(() => router.refresh());
      } else {
        toast.error(result.message || "Gagal menambah user");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  const handleSendWhatsApp = () => {
    if (!createdUser) return;
    const text = encodeURIComponent(
      `Halo Bapak/Ibu *${createdUser.name}*,\n\nBerikut detail akun E-Notulen Anda:\n\n👤 *NIP*: ${createdUser.nip}\n🔑 *Password*: ${createdUser.password}\n\n_Harap simpan pesan ini._\n\n*Tim IT Bapenda Sultra*`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    closeDialog();
  };

  const closeDialog = () => {
    setOpen(false);
    setTimeout(() => {
      setCreatedUser(null);
      form.reset();
    }, 300);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) closeDialog();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah User
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {createdUser ? (
          <div className="py-4 space-y-4">
            <DialogHeader>
              <DialogTitle>Akun Berhasil Dibuat</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              NIP{" "}
              <span className="font-mono font-semibold text-foreground">
                {createdUser.nip}
              </span>{" "}
              telah terdaftar di sistem.
            </p>
            <div className="space-y-2 pt-2">
              <Button
                onClick={handleSendWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#20b858] text-white"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Kirim via WhatsApp
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={closeDialog}
              >
                Tutup
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Tambah Pegawai Baru</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 pt-2"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nama lengkap..."
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIP</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="199XXXXX"
                            disabled={isLoading}
                            {...field}
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
                        <FormLabel>Instansi</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Bapenda"
                            disabled={isLoading}
                            {...field}
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Min. 6 karakter"
                          disabled={isLoading}
                          className="font-mono"
                          {...field}
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
                      <FormLabel>Hak Akses</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pegawai">
                            Pegawai / Staff
                          </SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
