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

// 1. Schema Validasi
const loginSchema = z.object({
  nip: z
    .string()
    .min(5, "NIP terlalu pendek (minimal 5 karakter)")
    .regex(/^\d+$/, "NIP harus berupa angka"), // Validasi angka
  password: z.string().min(1, "Password wajib diisi"),
});

export default function LoginPage() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState("");

  // 2. Setup Form
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      nip: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  // 3. Handler Submit
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setGlobalError(""); // Reset error global

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (json.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setGlobalError(
          json.message || "Login gagal, periksa NIP dan Password.",
        );
      }
    } catch (err) {
      console.error(err);
      setGlobalError("Terjadi kesalahan jaringan, coba lagi nanti.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-900 via-blue-800 to-slate-900 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl flex max-w-5xl w-full overflow-hidden transition-all hover:shadow-blue-500/20 animate-in fade-in zoom-in-95 duration-500">
        {/* Kolom Kiri (Brand) */}
        <div className="hidden md:flex w-5/12 bg-blue-600 items-center justify-center p-12 text-white flex-col relative overflow-hidden">
          <div
            className="absolute inset-0 bg-blue-700 opacity-20"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          <div className="z-10 text-center">
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-blue-600 text-3xl">
              <FileText className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold mb-2 tracking-tight">
              E-NOTULEN
            </h2>
            <p className="text-blue-100 font-light">
              Sistem Terintegrasi Absensi & Notulensi Digital
            </p>
            <div className="mt-8 py-2 px-4 bg-blue-700 rounded-lg inline-block text-xs font-semibold tracking-wider">
              BAPENDA PROV. SULTRA
            </div>
          </div>
        </div>

        {/* Kolom Kanan (Form) */}
        <div className="w-full md:w-7/12 p-10 md:p-14 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-slate-800">Login Pegawai</h3>
            <p className="text-slate-500 mt-2">
              Masuk untuk mengelola agenda rapat dan absensi.
            </p>
          </div>

          {/* Alert Error Global (Misal: Password Salah) */}
          {globalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium animate-in slide-in-from-top-2 flex items-center gap-2">
              ⚠️ {globalError}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Field NIP */}
              <FormField
                control={form.control}
                name="nip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-slate-700 text-sm font-semibold ml-1">
                      NIP / User ID
                    </FormLabel>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 text-slate-400 h-5 w-5 z-10" />
                      <FormControl>
                        <Input
                          placeholder="199XXXXX"
                          className="pl-12 pr-4 py-6 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition font-medium text-slate-700 text-base"
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
                    <FormLabel className="block text-slate-700 text-sm font-semibold ml-1">
                      Kata Sandi
                    </FormLabel>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 text-slate-400 h-5 w-5 z-10" />
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-12 pr-4 py-6 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition font-medium text-slate-700 text-base"
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-xl transition shadow-lg shadow-blue-200 transform active:scale-95 text-base mt-4"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    MASUK SISTEM <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-8 text-center text-xs text-slate-400">
            &copy; 2026 Badan Pendapatan Daerah. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
