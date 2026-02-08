"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, User, Lock, FileText } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const nip = formData.get("nip");
    const password = formData.get("password");

    try {
      // Panggil API Login yang kita buat
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nip, password }),
      });

      const json = await res.json();

      if (json.success) {
        // Redirect ke Dashboard
        router.push("/dashboard");
        router.refresh(); // Refresh agar middleware mengenali cookie baru
      } else {
        setError(json.message || "Login gagal");
      }
    } catch (err) {
      console.error(err); // FIX 1: Gunakan variable err untuk log
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-900 via-blue-800 to-slate-900 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl flex max-w-5xl w-full overflow-hidden transition-all duration-500 hover:shadow-blue-500/20 animate-in fade-in zoom-in-95">
        {/* FIX 2: Hapus duplikasi 'duration-500' di atas */}

        {/* Kolom Kiri (Brand / Logo) - Hidden di Mobile */}
        <div className="hidden md:flex w-5/12 bg-blue-600 items-center justify-center p-12 text-white flex-col relative overflow-hidden">
          {/* Pattern Background */}
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

        {/* Kolom Kanan (Form Login) */}
        <div className="w-full md:w-7/12 p-10 md:p-14 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-slate-800">Login Pegawai</h3>
            <p className="text-slate-500 mt-2">
              Masuk untuk mengelola agenda rapat dan absensi.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">
                NIP / User ID
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                <Input
                  name="nip"
                  type="text"
                  placeholder="199XXXXX"
                  required
                  className="pl-12 pr-4 py-6 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition font-medium text-slate-700 text-base"
                />
              </div>
            </div>

            <div>
              <Label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">
                Kata Sandi
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-12 pr-4 py-6 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition font-medium text-slate-700 text-base"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-xl transition shadow-lg shadow-blue-200 transform active:scale-95 text-base"
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                  MASUK SISTEM <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            &copy; 2026 Badan Pendapatan Daerah. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
