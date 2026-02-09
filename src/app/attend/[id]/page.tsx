"use client";

import { useState, useRef, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import SignatureCanvas from "react-signature-canvas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Eraser,
  Building2,
  User,
  Hash,
} from "lucide-react";

// 1. Schema Validasi dengan Zod
const formSchema = z.object({
  name: z.string().min(3, "Nama lengkap wajib diisi (min 3 huruf)"),
  nip: z.string().min(5, "NIP wajib diisi"),
  department: z.string().min(3, "Bidang atau Instansi wajib diisi"),
  signature: z.string().min(1, "Tanda tangan wajib diisi"),
});

export default function AttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params); // Next.js 15 params unwrapping
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Ref untuk Signature Canvas
  const sigCanvas = useRef<SignatureCanvas>(null);

  // 2. Setup Form dengan React Hook Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nip: "",
      department: "",
      signature: "",
    },
  });

  // Fungsi Clear Tanda Tangan
  const clearSignature = () => {
    sigCanvas.current?.clear();
    form.setValue("signature", ""); // Reset value di form
  };

  // Fungsi saat user selesai tanda tangan (onEnd)
  const onSigEnd = () => {
    if (sigCanvas.current) {
      // Konversi gambar ke Base64 String
      const dataURL = sigCanvas.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      form.setValue("signature", dataURL);
      form.clearErrors("signature"); // Hapus error jika ada
    }
  };

  // 3. Handle Submit
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError("");

    try {
      const res = await fetch(`/api/meetings/${id}/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(true);
      } else {
        setError(json.message || "Gagal melakukan absensi");
      }
    } catch (err) {
      console.error("Attendance Error:", err);
      setError("Terjadi kesalahan jaringan");
    }
  };

  // --- TAMPILAN SUKSES ---
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
        <Card className="w-full max-w-md text-center p-8 shadow-lg border-green-100">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300 delay-150">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Absensi Berhasil!
          </h2>
          <p className="text-slate-500 mb-6">
            Terima kasih <strong>{form.getValues("name")}</strong>,<br />
            Kehadiran Anda telah tercatat beserta tanda tangan digital.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Kembali ke Form
          </Button>
        </Card>
      </div>
    );
  }

  // --- TAMPILAN FORM ---
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto bg-blue-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-blue-600 shadow-inner">
            <FileText className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Daftar Hadir Digital
          </CardTitle>
          <p className="text-sm text-slate-500">
            Lengkapi data diri dan tanda tangan di bawah ini.
          </p>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl font-medium flex items-center gap-2 border border-red-100">
              ⚠️ {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* NAMA LENGKAP */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600 font-semibold">
                      Nama Lengkap
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Nama Lengkap beserta Gelar"
                          className="pl-9 bg-slate-50 h-11"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* GRID: NIP & INSTANSI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold">
                        NIP / NIK
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Nomor Induk"
                            className="pl-9 bg-slate-50 h-11"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold">
                        Bidang / Instansi
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Unit Kerja"
                            className="pl-9 bg-slate-50 h-11"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* TANDA TANGAN */}
              <FormField
                control={form.control}
                name="signature"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-slate-600 font-semibold flex justify-between items-center">
                      <span>Tanda Tangan</span>
                      <span
                        onClick={clearSignature}
                        className="text-xs text-red-500 cursor-pointer hover:underline flex items-center gap-1"
                      >
                        <Eraser className="h-3 w-3" /> Hapus / Ulangi
                      </span>
                    </FormLabel>
                    <FormControl>
                      <div
                        className={`border-2 rounded-xl overflow-hidden bg-white ${form.formState.errors.signature ? "border-red-500" : "border-slate-200 focus-within:border-blue-500 transition-colors"}`}
                      >
                        <SignatureCanvas
                          ref={sigCanvas}
                          penColor="black"
                          canvasProps={{
                            className: "w-full h-40 cursor-crosshair",
                          }}
                          onEnd={onSigEnd}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-[10px] text-slate-400">
                      *Goreskan tanda tangan Anda pada kotak di atas.
                    </p>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full h-12 bg-blue-700 hover:bg-blue-800 font-bold text-base shadow-lg shadow-blue-200 mt-2"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Kirim Absensi"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
