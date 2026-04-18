"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

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
  const [isPending, startTransition] = useTransition();
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
        setProgress((prev) =>
          prev >= 92 ? prev : prev + Math.floor(Math.random() * 8) + 2,
        );
      }, 250);
    } else {
      timeoutId = setTimeout(() => setProgress(0), 0);
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
      // PERBAIKAN: Gunakan variabel 'err' untuk mencetak log di console browser
      console.error("Terjadi masalah saat login:", err);
      setGlobalError("Terjadi kesalahan jaringan, coba lagi nanti.");
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed top-0 left-0 w-full z-50">
          <Progress value={progress} className="h-1.5 rounded-none" />
        </div>
      )}

      {globalError && (
        <div className="mb-6 p-3 bg-destructive/10 text-destructive rounded-xl text-sm flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="font-medium">{globalError}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nip"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Masukan NIP"
                    className="h-14 rounded-xl bg-muted/50 border-transparent focus-visible:ring-primary px-4 text-base font-medium"
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
                      className="h-14 rounded-xl bg-muted/50 border-transparent focus-visible:ring-primary px-4 text-base font-medium pr-12"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-primary hover:opacity-90 text-primary-foreground font-bold text-lg rounded-full transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                "Masuk"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
