"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from "lucide-react";
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

const loginSchema = z.object({
  nip: z
    .string()
    .min(5, "NIP terlalu pendek (minimal 5 karakter)")
    .regex(/^\d+$/, "NIP harus berupa angka"),
  password: z.string().min(1, "Password wajib diisi"),
});

export function LoginForm() {
  const router = useRouter();
  const [isPending] = useTransition();
  const [globalError, setGlobalError] = useState("");
  const [progress, setProgress] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { nip: "", password: "" },
  });

  const isLoading = form.formState.isSubmitting || isPending;

  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;
    if (isLoading) {
      timeoutId = setTimeout(() => setProgress(15), 0);
      timer = setInterval(() => {
        setProgress((p) =>
          p >= 92 ? p : p + Math.floor(Math.random() * 8) + 2,
        );
      }, 250);
    } else {
      timeoutId = setTimeout(() => setProgress(0), 0);
    }
    return () => {
      clearInterval(timer);
      clearTimeout(timeoutId);
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
        window.location.assign("/dashboard");
      } else {
        setGlobalError(
          json.message || "Login gagal, periksa NIP dan Password.",
        );
      }
    } catch {
      setGlobalError("Terjadi kesalahan jaringan, coba lagi nanti.");
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed top-0 left-0 w-full z-50">
          <Progress value={progress} className="h-0.5 rounded-none" />
        </div>
      )}

      {globalError && (
        <div
          className="mb-4 p-2.5 rounded-lg text-[11px] flex items-center gap-2"
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          }}
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {globalError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="nip"
            render={({ field }) => (
              <FormItem>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">
                  NIP
                </label>
                <FormControl>
                  <Input
                    placeholder="Nomor Induk Pegawai"
                    className="h-9 text-[12px] bg-gray-50 border-gray-200 rounded-lg
                      focus-visible:ring-2 focus-visible:ring-indigo-500/20
                      focus-visible:border-indigo-400"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">
                  Kata sandi
                </label>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-9 text-[12px] pr-8 bg-gray-50 border-gray-200 rounded-lg
                        focus-visible:ring-2 focus-visible:ring-indigo-500/20
                        focus-visible:border-indigo-400"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400
                      hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                    aria-label="Tampilkan kata sandi"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="submit-shimmer w-full h-9 rounded-lg text-[12px] font-semibold
              gap-1.5 border-0 text-white mt-1 transition-all
              hover:-translate-y-px active:scale-[.98]"
            style={{
              background: "linear-gradient(135deg,#6366f1,#4f46e5)",
              boxShadow: "0 4px 14px rgba(99,102,241,.35)",
            }}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <span>Masuk</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}
