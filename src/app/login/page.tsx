"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
  Eye,
  EyeOff,
  BookOpen,
  PlayCircle,
  HelpCircle,
  ChevronDown,
  Heart,
  Image as ImageIcon,
  Clock,
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

  // State untuk Dialog Lupa Password
  const [forgotName, setForgotName] = useState("");
  const [forgotNip, setForgotNip] = useState("");

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

  // FUNGSI: Minta Akun via WA
  const handleRequestAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!requestName.trim() || !requestNip.trim() || !requestBidang.trim()) {
      toast.error("Form tidak lengkap", {
        description: "Harap isi semua kolom.",
      });
      return;
    }

    const adminWhatsAppNumber = "6281283848569";
    const textMessage = encodeURIComponent(
      `Halo Admin IT E-Notulen Bapenda Sultra,\n\nSaya ingin meminta dibuatkan akun akses untuk sistem E-Notulen. Berikut adalah data diri saya:\n\n*Nama Lengkap*: ${requestName}\n*NIP*: ${requestNip}\n*Unit Kerja/Bidang*: ${requestBidang}\n\nMohon bantuannya. Terima kasih.`,
    );

    window.open(
      `https://wa.me/${adminWhatsAppNumber}?text=${textMessage}`,
      "_blank",
    );

    setRequestName("");
    setRequestNip("");
    setRequestBidang("");
  };

  // FUNGSI: Lupa Password via WA
  const handleForgotPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!forgotName.trim() || !forgotNip.trim()) {
      toast.error("Form tidak lengkap", {
        description: "Harap isi Nama dan NIP Anda.",
      });
      return;
    }

    const adminWhatsAppNumber = "6281283848569";
    const textMessage = encodeURIComponent(
      `Halo Admin IT E-Notulen Bapenda Sultra,\n\nSaya lupa password untuk akun E-Notulen saya dan ingin meminta reset password. Berikut data diri saya:\n\n*Nama Lengkap*: ${forgotName}\n*NIP*: ${forgotNip}\n\nMohon dibantu untuk mereset kata sandi saya. Terima kasih.`,
    );

    window.open(
      `https://wa.me/${adminWhatsAppNumber}?text=${textMessage}`,
      "_blank",
    );

    setForgotName("");
    setForgotNip("");
  };

  return (
    // PERUBAHAN: Background diganti ke off-white/gray khas gaya sosmed (#f0f2f5) agar card putih lebih menonjol di mobile
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4 sm:p-8 font-sans">
      {isLoading && (
        <div className="fixed top-0 left-0 w-full z-50">
          <Progress
            value={progress}
            className="h-1 rounded-none bg-blue-100 [&>div]:bg-blue-600"
          />
        </div>
      )}

      <div className="max-w-245 w-full flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 pb-10 md:pb-0">
        {/* KIRI: Branding Section */}
        {/* PERUBAHAN: Di mobile (md ke bawah), text akan di-center. Di desktop, text rata kiri */}
        <div className="w-full md:w-125 flex flex-col items-center md:items-start text-center md:text-left mt-8 md:mt-0">
          <h1 className="text-5xl md:text-[3.5rem] font-black md:font-bold text-[#0866ff] tracking-tighter md:tracking-tight mb-3 md:mb-5">
            e-Notulen
          </h1>

          <h2 className="text-xl sm:text-2xl md:text-[2rem] leading-snug md:leading-[1.2] font-medium md:font-semibold text-gray-900 mb-6 md:mb-10 max-w-100 md:max-w-none px-4 md:px-0">
            Digitalisasi <br className="hidden md:block" />
            laporan dan <br className="hidden md:block" />
            <span className="text-[#0866ff] md:text-gray-900">
              absensi rapat.
            </span>
          </h2>

          {/* Collage Ilustrasi (Tetap disembunyikan di Mobile) */}
          <div className="relative h-72 w-full hidden md:block">
            {/* Card 1 - Back */}
            <div className="absolute top-4 left-0 w-56 h-48 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm rotate-[-8deg] p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-300"></div>
                <div className="w-24 h-3 rounded-full bg-slate-300"></div>
              </div>
              <div className="w-full h-24 bg-slate-200 rounded-xl mt-2 flex items-center justify-center">
                <ImageIcon className="text-slate-400 h-8 w-8" />
              </div>
            </div>

            {/* Card 2 - Main (Overlap) */}
            <div className="absolute top-0 left-24 w-60 h-64 bg-linear-to-tr from-blue-50 to-indigo-50 rounded-2xl border border-white shadow-xl rotate-[4deg] p-3 flex flex-col z-10">
              <div className="flex items-center justify-between px-1 mb-2">
                <div className="w-16 h-1 rounded-full bg-blue-200"></div>
                <div className="flex items-center gap-1 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" /> 09:00
                </div>
              </div>
              <div className="flex-1 bg-blue-200/50 rounded-xl mb-2 overflow-hidden relative">
                <Image
                  src="/rapat.png"
                  alt="Meeting Placeholder"
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-cover mix-blend-multiply "
                  priority
                />
              </div>
              <div className="flex justify-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-white bg-blue-400 -mr-3 z-20"></div>
                <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-400 z-10"></div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-36 left-12 w-12 h-12 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center z-20">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            </div>
            <div className="absolute top-10 right-16 text-4xl z-0 opacity-80 animate-bounce">
              📅
            </div>
          </div>
        </div>

        {/* KANAN: Form Section */}
        <div className="w-full md:w-100 flex flex-col items-center">
          <div className="w-full max-w-100">
            {/* Form Container */}
            <div className="bg-white rounded-xl shadow-md md:shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100/50 p-5 sm:p-6">
              {/* Masuk E-Notulen text disembunyikan di desktop, muncul di mobile untuk konteks */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Masuk Ke Akun Anda
              </h3>

              {globalError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                  <span className="font-bold">⚠️</span>
                  <p>{globalError}</p>
                </div>
              )}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-3 md:space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="nip"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Masukan NIP"
                            className="h-12 md:h-13 rounded-md border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Kata Sandi"
                              className="h-12 md:h-13 rounded-md border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base pr-10"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 md:h-12.5 bg-[#0866ff] hover:bg-[#1877f2] text-white font-bold text-[17px] md:text-lg rounded-full mt-2 transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Masuk"
                    )}
                  </Button>
                </form>
              </Form>

              {/* LUPA KATA SANDI (DIALOG) */}
              <div className="text-center mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-[#0866ff] hover:underline text-sm md:text-[15px] font-medium transition-all">
                      Lupa kata sandi?
                    </button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] sm:max-w-md bg-white rounded-2xl p-5 md:p-6">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">
                        Lupa Kata Sandi
                      </DialogTitle>
                      <DialogDescription>
                        Masukkan Nama dan NIP Anda untuk mereset kata sandi via
                        WhatsApp Admin.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={handleForgotPassword}
                      className="space-y-4 pt-2"
                    >
                      <Input
                        placeholder="Nama Lengkap"
                        value={forgotName}
                        onChange={(e) => setForgotName(e.target.value)}
                        required
                        className="h-12"
                      />
                      <Input
                        placeholder="NIP Pegawai"
                        value={forgotNip}
                        onChange={(e) => setForgotNip(e.target.value)}
                        required
                        className="h-12"
                      />
                      <DialogFooter>
                        <Button
                          type="submit"
                          className="w-full h-12 bg-[#25D366] hover:bg-[#20b858] font-bold text-white flex gap-2 rounded-xl"
                        >
                          Hubungi Admin WA <ArrowRight className="h-4 w-4" />
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="border-b border-gray-200 w-full my-5 md:my-6"></div>

              {/* MINTA AKUN BARU (DIALOG) */}
              <div className="flex justify-center pb-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-12 px-6 border-gray-300 text-[#0866ff] font-bold text-[15px] md:text-[16px] rounded-full hover:bg-gray-50 transition-colors"
                    >
                      Buat akun baru
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] sm:max-w-md bg-white rounded-2xl p-5 md:p-6">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">
                        Minta Pembuatan Akun
                      </DialogTitle>
                      <DialogDescription>
                        Isi data diri Anda di bawah. Pesan otomatis akan
                        disiapkan untuk Admin.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={handleRequestAccount}
                      className="space-y-4 pt-2"
                    >
                      <Input
                        placeholder="Nama Lengkap"
                        value={requestName}
                        onChange={(e) => setRequestName(e.target.value)}
                        required
                        className="h-12"
                      />
                      <Input
                        placeholder="NIP Pegawai"
                        value={requestNip}
                        onChange={(e) => setRequestNip(e.target.value)}
                        required
                        className="h-12"
                      />
                      <Input
                        placeholder="Unit Kerja / Bidang"
                        value={requestBidang}
                        onChange={(e) => setRequestBidang(e.target.value)}
                        required
                        className="h-12"
                      />
                      <DialogFooter>
                        <Button
                          type="submit"
                          className="w-full h-12 bg-[#25D366] hover:bg-[#20b858] font-bold text-white flex gap-2 rounded-xl"
                        >
                          Kirim via WhatsApp <ArrowRight className="h-4 w-4" />
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Bapenda Sultra Branding & Help (Dipindahkan ke bawah untuk semua device) */}
            <div className="mt-8 md:mt-6 flex flex-col items-center gap-3">
              <HelpDropdown />
              <p className="text-[13px] md:text-sm text-gray-500">
                <span className="font-bold">Bapenda Prov. Sultra</span> &copy;{" "}
                {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen helper agar kode dropdown bantuan tidak diulang
function HelpDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-sm text-gray-500 hover:text-gray-900 hover:bg-transparent h-8 px-2"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Pusat Bantuan
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="w-64 bg-white rounded-xl shadow-xl border-gray-100/50"
      >
        <DropdownMenuLabel className="text-xs text-gray-400">
          Pusat Bantuan
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer py-2.5">
          <Link
            href="https://drive.google.com/file/d/11eawgLNMwFTX_IfgW4doaDxkbZZ-Fhxq/view?usp=drive_link"
            target="_blank"
            className="flex gap-3"
          >
            <BookOpen className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">
                Buku Panduan PDF
              </span>
              <span className="text-[10px] text-gray-500">
                Baca tata cara penggunaan aplikasi.
              </span>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer py-2.5">
          <Link
            href="https://youtube.com"
            target="_blank"
            className="flex gap-3"
          >
            <PlayCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">Video Tutorial</span>
              <span className="text-[10px] text-gray-500">
                Tonton langkah visual di YouTube.
              </span>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
