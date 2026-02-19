"use client";

import { useState, useEffect, useTransition } from "react";
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
  Loader2,
  ArrowRight,
  User,
  Lock,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  nip: z
    .string()
    .min(5, "NIP terlalu pendek (minimal 5 karakter)")
    .regex(/^\d+$/, "NIP harus berupa angka"), // Catatan: ini akan memblokir "199XXXXX" di sisi client
  password: z.string().min(1, "Password wajib diisi"),
});

export default function LoginPage() {
  const router = useRouter();
  // OPTIMASI: Gunakan useTransition agar UI tidak freeze saat pindah route
  const [isPending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState("");
  const [progress, setProgress] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      nip: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  // Kombinasi isSubmitting form dan isPending routing
  const isLoading = isSubmitting || isPending;

  // OPTIMASI: Prefetch dashboard saat komponen di-mount agar perpindahan instan
  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      // Dibungkus setTimeout agar asynchronous dan menghindari cascading renders
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
    } catch (err) {
      console.error(err);
      setGlobalError("Terjadi kesalahan jaringan, coba lagi nanti.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-indigo-950 to-blue-900 p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl flex max-w-5xl w-full overflow-hidden transition-all hover:shadow-blue-500/10 animate-in fade-in zoom-in-95 duration-500 relative">
        {isLoading && (
          <div className="absolute top-0 left-0 w-full z-50">
            <Progress
              value={progress}
              className="h-1.5 rounded-none bg-blue-100"
            />
          </div>
        )}

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

        <div className="w-full md:w-7/12 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-white relative">
          <div className="mb-10 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
              Login Pegawai
            </h3>
            <p className="text-slate-500 mt-2 text-sm md:text-base font-medium">
              Masukkan kredensial Anda untuk mengakses dashboard.
            </p>
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
                          className="pl-12 py-6 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-semibold shadow-sm"
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
                          className="pl-12 pr-12 py-6 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-semibold shadow-sm"
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-7 rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-[0.98] text-base mt-4"
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

          <div className="mt-12 flex items-center justify-center gap-4 grayscale opacity-40">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
              &copy; {new Date().getFullYear()} Bapenda Prov. Sultra
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
