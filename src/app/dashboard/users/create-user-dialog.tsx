"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  Plus,
  Save,
  CheckCircle2,
  MessageCircle,
  Send,
} from "lucide-react";
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

  // State untuk menyimpan data yang baru saja berhasil dibuat
  const [createdUser, setCreatedUser] = useState<z.infer<
    typeof formSchema
  > | null>(null);

  // Form tetap kosong di awal sesuai permintaan Anda
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

        // Simpan data untuk WA, TAPI jangan tutup dialognya dulu
        setCreatedUser(values);

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

  // --- FUNGSI MENGIRIM KREDENSIAL VIA WA ---
  const handleSendWhatsApp = () => {
    if (!createdUser) return;

    const textMessage = encodeURIComponent(
      `Halo Bapak/Ibu *${createdUser.name}*,\n\nPermintaan akses Anda untuk sistem E-Notulen Bapenda Prov. Sultra telah kami proses. Berikut adalah detail akun Anda:\n\n👤 *NIP (Username)*: ${createdUser.nip}\n🔑 *Password*: ${createdUser.password}\n\nSilakan login melalui tautan berikut:\n🔗 [Link Website E-Notulen Anda]\n\n_Catatan: Harap simpan pesan ini baik-baik._\n\nTerima kasih,\n*Tim IT Bapenda Sultra*`,
    );

    // Membuka WA tanpa nomor tujuan (Admin pilih sendiri chat-nya)
    window.open(`https://wa.me/?text=${textMessage}`, "_blank");

    // Tutup dialog dan kembalikan form ke kondisi semula (kosong)
    setOpen(false);
    setCreatedUser(null);
    form.reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          // Bersihkan data WA jika admin menekan 'Esc' atau klik area luar
          setTimeout(() => {
            setCreatedUser(null);
            form.reset();
          }, 300);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all font-bold rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> Tambah User Baru
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md w-[95vw] rounded-2xl p-6">
        {/* CONDITIONAL RENDERING: Cek apakah user sudah berhasil dibuat */}
        {createdUser ? (
          /* TAMPILAN JIKA SUKSES -> MUNCUL TOMBOL WA */
          <div className="flex flex-col items-center text-center py-4 animate-in zoom-in-95 duration-500">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">
              Akun Berhasil Dibuat!
            </h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Akun untuk NIP{" "}
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1 rounded">
                {createdUser.nip}
              </span>{" "}
              telah terdaftar di sistem.
            </p>

            <Button
              onClick={handleSendWhatsApp}
              className="w-full h-12 bg-[#25D366] hover:bg-[#20b858] text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all text-base flex items-center justify-center"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Kirim Kredensial via WA
              <Send className="ml-2 h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              className="mt-3 text-slate-400 font-bold hover:text-slate-600 w-full"
              onClick={() => {
                setOpen(false);
                setCreatedUser(null);
                form.reset();
              }}
            >
              Tutup Tanpa Mengirim
            </Button>
          </div>
        ) : (
          /* TAMPILAN DEFAULT -> FORM INPUT (KOSONG DI AWAL) */
          <>
            <DialogHeader>
              <DialogTitle className="font-bold">
                Tambah Pegawai Baru
              </DialogTitle>
              <DialogDescription>
                Masukkan data pegawai baru beserta instansinya.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                        {/* UPDATE KECIL: Diubah jadi type="text" agar admin bisa melihat apa yang dia ketik */}
                        <Input
                          type="text"
                          placeholder="••••••"
                          {...field}
                          disabled={isLoading}
                          className="bg-slate-50 rounded-xl h-11 border-slate-200 font-mono"
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
                        <SelectContent className="rounded-xl">
                          <SelectItem value="pegawai">
                            Pegawai / Staff
                          </SelectItem>
                          <SelectItem value="admin">
                            Administrator IT
                          </SelectItem>
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
                    className="w-full bg-blue-600 hover:bg-blue-700 font-bold h-12 rounded-xl shadow-lg shadow-blue-100 transition-all text-white"
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
