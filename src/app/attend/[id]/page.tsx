"use client";

import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, User, FileText, Loader2 } from "lucide-react";

export default function AttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const nip = formData.get("nip") as string;

    try {
      const res = await fetch(`/api/meetings/${id}/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nip }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(true);
      } else {
        setError(json.message || "Gagal melakukan absensi");
      }
    } catch (err) {
      // PERBAIKAN: Gunakan variable 'err' untuk logging agar tidak error linting
      console.error("Attendance Error:", err);
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8 shadow-lg border-green-100">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Absensi Berhasil!
          </h2>
          <p className="text-slate-500">
            Terima kasih, kehadiran Anda telah tercatat di sistem.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-blue-600">
            <FileText className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-800">
            Presensi Rapat Digital
          </CardTitle>
          <p className="text-xs text-slate-500">
            Silakan isi data diri Anda untuk masuk.
          </p>
        </CardHeader>
        <CardContent className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 ml-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  name="name"
                  placeholder="Contoh: Budi Santoso"
                  required
                  className="pl-10 h-12 bg-slate-50 border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 ml-1">
                NIP (Opsional)
              </label>
              <Input
                name="nip"
                placeholder="199XXXXX"
                className="h-12 bg-slate-50 border-slate-200"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold text-base mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "KONFIRMASI KEHADIRAN"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
