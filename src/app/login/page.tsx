"use client";

import { useState } from "react";
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
import { Loader2, ArrowRight, User, Lock, FileText } from "lucide-react";
import { toast } from "sonner";

// 1. Schema Validasi
const loginSchema = z.object({
  nip: z
    .string()
    .min(5, "NIP terlalu pendek (minimal 5 karakter)")
    .regex(/^\d+$/, "NIP harus berupa angka"),
  password: z.string().min(1, "Password wajib diisi"),
});

export default function LoginPage() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState("");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      nip: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

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
        toast.success("Login Berhasil", {
          description: "Mengalihkan ke dashboard...",
        });
        router.push("/dashboard");
        router.refresh();
      } else {
        setGlobalError(
          json.message || "Login gagal, periksa NIP dan Password.",
        );
        // Efek getar jika error (opsional jika pakai library animasi tambahan)
      }
    } catch (err) {
      console.error(err);
      setGlobalError("Terjadi kesalahan jaringan, coba lagi nanti.");
    }
  };

  return (
    // FIX: bg-gradient-to-br
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-900 via-indigo-900 to-slate-900 p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl flex max-w-5xl w-full overflow-hidden transition-all hover:shadow-blue-500/20 animate-in fade-in zoom-in-95 duration-500">
        {/* KOLOM KIRI (BRAND - DESKTOP ONLY) */}
        <div className="hidden md:flex w-5/12 bg-blue-600 items-center justify-center p-12 text-white flex-col relative overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 bg-blue-700 opacity-20"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          ></div>

          {/* Dekorasi Gradient Circle */}
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>

          <div className="z-10 text-center relative">
            <div className="h-24 w-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/20">
              <FileText className="h-12 w-12 text-white drop-shadow-md" />
            </div>
            <h2 className="text-4xl font-extrabold mb-3 tracking-tight">
              E-NOTULEN
            </h2>
            <p className="text-blue-100 font-medium text-lg leading-relaxed opacity-90">
              Sistem Terintegrasi
              <br />
              Absensi & Notulensi Digital
            </p>
            <div className="mt-10 py-2 px-6 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full inline-block text-xs font-bold tracking-widest uppercase shadow-sm">
              Bapenda Prov. Sultra
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (FORM LOGIN) */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 md:p-14 flex flex-col justify-center bg-white relative">
          {/* MOBILE BRANDING (Hanya muncul di HP) */}
          <div className="md:hidden text-center mb-8">
            <div className="inline-flex h-12 w-12 bg-blue-100 text-blue-600 rounded-xl items-center justify-center mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">E-NOTULEN</h2>
            <p className="text-xs font-bold text-blue-600 tracking-wider uppercase mt-1">
              Bapenda Prov. Sultra
            </p>
          </div>

          <div className="mb-8 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800">
              Selamat Datang
            </h3>
            <p className="text-slate-500 mt-2 text-sm md:text-base">
              Masuk menggunakan NIP untuk mengelola agenda.
            </p>
          </div>

          {/* Alert Error */}
          {globalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-in slide-in-from-top-2 flex items-start gap-3 shadow-sm">
              <span className="text-lg">⚠️</span>
              <p>{globalError}</p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Field NIP */}
              <FormField
                control={form.control}
                name="nip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      NIP / User ID
                    </FormLabel>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-blue-500" />
                      <FormControl>
                        <Input
                          placeholder="Masukkan NIP Anda"
                          className="pl-12 py-6 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-700 text-base shadow-sm"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="ml-1" />
                  </FormItem>
                )}
              />

              {/* Field Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      Kata Sandi
                    </FormLabel>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-blue-500" />
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-12 py-6 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-700 text-base shadow-sm"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="ml-1" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98] text-base mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memeriksa...
                  </>
                ) : (
                  <>
                    MASUK SISTEM <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-8 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Badan Pendapatan Daerah.
            <br className="md:hidden" /> All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
