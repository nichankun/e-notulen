"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  ArrowRight,
  User,
  Lock,
  FileText,
  Eye,
  EyeOff,
  BookOpen,
  PlayCircle,
  HelpCircle,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// --- SCHEMA LOGIN ---
const loginSchema = z.object({
  nip: z
    .string()
    .min(5, "NIP terlalu pendek (minimal 5 karakter)")
    .regex(/^\d+$/, "NIP harus berupa angka"),
  password: z.string().min(1, "Password wajib diisi"),
});

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState("");
  const [progress, setProgress] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // State untuk Dialog Minta Akun
  const [requestName, setRequestName] = useState("");
  const [requestNip, setRequestNip] = useState("");
  const [requestBidang, setRequestBidang] = useState("");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      nip: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;
  const isLoading = isSubmitting || isPending;

  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      timeoutId = setTimeout(() => {
        setProgress(15);
      }, 0);

      timer = setInterval(() => {
        setProgress((prev) =>
          prev >= 92 ? prev : prev + Math.floor(Math.random() * 8) + 2,
        );
      }, 250);
    } else {
      timeoutId = setTimeout(() => {
        setProgress(0);
      }, 0);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading]);

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setGlobalError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (json.success) {
        setProgress(100);
        toast.success("Login Berhasil", {
          description: "Selamat datang di E-NOTULEN.",
        });

        startTransition(() => {
          router.push("/dashboard");
          router.refresh();
        });
      } else {
        setGlobalError(
          json.message || "Login gagal, periksa NIP dan Password.",
        );
      }
    } catch (err: unknown) {
      console.error(err);
      setGlobalError("Terjadi kesalahan jaringan, coba lagi nanti.");
    }
  };

  // FIX: Menggunakan React.FormEvent<HTMLFormElement> agar 100% Type-Safe dan tidak deprecated
  const handleRequestAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!requestName.trim() || !requestNip.trim() || !requestBidang.trim()) {
      toast.error("Form tidak lengkap", {
        description: "Harap isi semua kolom.",
      });
      return;
    }

    // GANTI NOMOR INI DENGAN NOMOR WA ADMIN (Format: 628...)
    const adminWhatsAppNumber = "6281283848569"; // Contoh format yang benar

    // Format Pesan menggunakan encodeURIComponent agar rapi di URL
    const textMessage = encodeURIComponent(
      `Halo Admin IT E-Notulen Bapenda Sultra,\n\nSaya ingin meminta dibuatkan akun akses untuk sistem E-Notulen. Berikut adalah data diri saya:\n\n*Nama Lengkap*: ${requestName}\n*NIP*: ${requestNip}\n*Unit Kerja/Bidang*: ${requestBidang}\n\nMohon bantuannya. Terima kasih.`,
    );

    // Buka WhatsApp di tab baru
    const waLink = `https://wa.me/${adminWhatsAppNumber}?text=${textMessage}`;
    window.open(waLink, "_blank");

    // Bersihkan state form
    setRequestName("");
    setRequestNip("");
    setRequestBidang("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-indigo-950 to-blue-900 p-4 font-sans selection:bg-blue-500 selection:text-white">
      <div className="bg-white rounded-[2.5rem] shadow-2xl flex max-w-5xl w-full overflow-hidden transition-all hover:shadow-blue-500/20 animate-in fade-in zoom-in-95 duration-700 relative">
        {isLoading && (
          <div className="absolute top-0 left-0 w-full z-50">
            <Progress
              value={progress}
              className="h-1.5 rounded-none bg-blue-100"
            />
          </div>
        )}

        {/* KIRI: Branding Section */}
        <div className="hidden md:flex w-5/12 bg-blue-600 items-center justify-center p-12 text-white flex-col relative overflow-hidden">
          <div
            className="absolute inset-0 bg-blue-700 opacity-20"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          ></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400 rounded-full blur-3xl opacity-30"></div>

          <div className="z-10 text-center relative">
            <div className="h-20 w-20 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/20">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-black mb-2 tracking-tight text-white">
              E-NOTULEN
            </h2>
            <p className="text-blue-100 font-medium opacity-80 leading-relaxed text-sm">
              Sistem Digitalisasi
              <br />
              Laporan & Absensi Rapat
            </p>
            <div className="mt-8 py-1.5 px-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-full inline-block text-[10px] font-black tracking-widest uppercase">
              Bapenda Prov. Sultra
            </div>
          </div>
        </div>

        {/* KANAN: Form Section */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-white relative">
          <div className="mb-10 flex items-start justify-between">
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                Login Pegawai
              </h3>
              <p className="text-slate-500 mt-2 text-sm md:text-base font-medium">
                Masukkan kredensial Anda untuk mengakses dashboard.
              </p>
            </div>

            {/* TOMBOL BANTUAN DROPDOWN */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-3 md:px-4 rounded-xl border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50 transition-all shrink-0 shadow-sm"
                >
                  <HelpCircle className="h-4 w-4 md:mr-2 text-blue-600" />
                  <span className="hidden md:inline font-bold">Panduan</span>
                  <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-72 rounded-2xl p-2 shadow-2xl border-slate-100 animate-in slide-in-from-top-2 text-left"
              >
                <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 pt-1 pb-2">
                  Pusat Bantuan
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />

                <DropdownMenuItem
                  asChild
                  className="rounded-xl p-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 group transition-colors"
                >
                  <Link
                    href="https://drive.google.com/file/d/11eawgLNMwFTX_IfgW4doaDxkbZZ-Fhxq/view?usp=drive_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 outline-none w-full"
                  >
                    <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors shrink-0 mt-0.5">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                        Buku Panduan PDF
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium leading-snug">
                        Baca tata cara penggunaan aplikasi secara lengkap.
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  asChild
                  className="rounded-xl p-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 group mt-1 transition-colors"
                >
                  <Link
                    href="https://youtube.com" // Ganti dengan link video tutorial Anda
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 outline-none w-full"
                  >
                    <div className="bg-red-50 p-2 rounded-lg group-hover:bg-red-100 transition-colors shrink-0 mt-0.5">
                      <PlayCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-slate-700 group-hover:text-red-600 transition-colors">
                        Video Tutorial
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium leading-snug">
                        Tonton langkah-langkah visual di YouTube.
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {globalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold animate-in slide-in-from-top-2 flex items-center gap-3">
              <span className="text-base">⚠️</span>
              <p>{globalError}</p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="nip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-bold ml-1 text-xs uppercase tracking-wider">
                      Nomor Induk Pegawai
                    </FormLabel>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-blue-500" />
                      <FormControl>
                        <Input
                          placeholder="19970209xxxxxx"
                          className="pl-12 py-6 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-semibold shadow-sm text-base"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-bold ml-1 text-xs uppercase tracking-wider">
                      Kata Sandi
                    </FormLabel>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-blue-500" />
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-12 pr-12 py-6 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-semibold shadow-sm text-base"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-7 rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-95 text-base mt-4"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    MEMVERIFIKASI AKSES...
                  </div>
                ) : (
                  <div className="flex items-center gap-2 tracking-widest uppercase">
                    MASUK SISTEM <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>
          </Form>

          {/* TOMBOL MINTA AKUN (DIALOG) */}
          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              Belum memiliki akun e-Notulen?
            </p>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="link"
                  className="text-blue-600 font-bold hover:text-blue-700 p-0 h-auto mt-1"
                >
                  Minta akses ke Administrator IT
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white rounded-[2rem] p-6 sm:p-8 outline-none">
                <DialogHeader className="mb-4">
                  <div className="mx-auto bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <DialogTitle className="text-center text-xl font-black text-slate-800">
                    Minta Pembuatan Akun
                  </DialogTitle>
                  <DialogDescription className="text-center text-slate-500 font-medium">
                    Isi data diri Anda di bawah. Sistem akan menyiapkan pesan
                    otomatis untuk dikirim ke WhatsApp Admin.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleRequestAccount} className="space-y-4">
                  <div className="space-y-1.5">
                    {/* Ganti FormLabel menjadi label biasa */}
                    <label className="text-xs font-bold text-slate-600 uppercase">
                      Nama Lengkap
                    </label>
                    <Input
                      placeholder="Contoh: Budi Santoso, S.Kom"
                      className="bg-slate-50 rounded-xl border-slate-200 h-11"
                      value={requestName}
                      onChange={(e) => setRequestName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    {/* Ganti FormLabel menjadi label biasa */}
                    <label className="text-xs font-bold text-slate-600 uppercase">
                      NIP Pegawai
                    </label>
                    <Input
                      placeholder="198XXXXXXXXXXXX"
                      className="bg-slate-50 rounded-xl border-slate-200 h-11"
                      value={requestNip}
                      onChange={(e) => setRequestNip(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    {/* Ganti FormLabel menjadi label biasa */}
                    <label className="text-xs font-bold text-slate-600 uppercase">
                      Unit Kerja / Bidang
                    </label>
                    <Input
                      placeholder="Contoh: Bidang Pajak Daerah"
                      className="bg-slate-50 rounded-xl border-slate-200 h-11"
                      value={requestBidang}
                      onChange={(e) => setRequestBidang(e.target.value)}
                      required
                    />
                  </div>

                  <DialogFooter className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-[#25D366] hover:bg-[#20b858] text-white font-bold h-12 rounded-xl shadow-lg shadow-green-200 transition-all text-base flex items-center gap-2"
                    >
                      Kirim via WhatsApp <ArrowRight className="h-4 w-4" />
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-12 flex items-center justify-center grayscale opacity-40">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
              &copy; {new Date().getFullYear()} Bapenda Prov. Sultra
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
