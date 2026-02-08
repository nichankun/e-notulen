"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function CreateMeetingPage() {
  const [loading, setLoading] = useState(false); // Manual Loading State
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get("title"),
      date: formData.get("date"),
      location: formData.get("location"),
      leader: formData.get("leader"),
    };

    try {
      // HIT API (Bukan Server Action)
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        // Redirect manual jika sukses
        router.push(`/dashboard/live/${json.data.id}`);
      } else {
        alert(json.message || "Gagal membuat rapat.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-300">
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-8 py-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-800">
              Detail Agenda Rapat
            </CardTitle>
            <p className="text-slate-500 text-xs mt-1">
              Isi informasi lengkap kegiatan
            </p>
          </div>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold uppercase tracking-wide">
            Langkah 1 dari 2
          </span>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-sm">
                Judul Rapat / Kegiatan
              </Label>
              <Input
                className="h-12 text-base"
                placeholder="Contoh: Rapat Evaluasi PAD Triwulan I"
                required
                name="title"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold text-sm">
                  Tanggal & Waktu
                </Label>
                <Input
                  type="datetime-local"
                  className="h-11"
                  required
                  name="date"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold text-sm">
                  Lokasi / Ruangan
                </Label>
                <Input
                  className="h-11"
                  placeholder="Ruang Rapat Utama..."
                  name="location"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-sm">
                Pimpinan Rapat
              </Label>
              <Input
                className="h-11"
                placeholder="Nama Pejabat..."
                name="leader"
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100 mt-8">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  type="button"
                  disabled={loading}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Batal
                </Button>
              </Link>

              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all min-w-55"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-4 w-4" />
                    Buat & Buka Sesi Absensi
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
