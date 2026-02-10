"use client";

import { useState, useRef, use, useEffect } from "react";
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

// 1. Schema Validasi
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
  const { id } = use(params);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // State untuk ukuran canvas agar responsif
  const [canvasWidth, setCanvasWidth] = useState(300);

  const sigCanvas = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nip: "",
      department: "",
      signature: "",
    },
  });

  // Effect untuk resize canvas saat layar berubah
  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.offsetWidth - 4); // -4 untuk border
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const clearSignature = () => {
    sigCanvas.current?.clear();
    form.setValue("signature", "");
  };

  const onSigEnd = () => {
    if (sigCanvas.current) {
      const dataURL = sigCanvas.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      form.setValue("signature", dataURL);
      form.clearErrors("signature");
    }
  };

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
        <Card className="w-full max-w-md text-center p-8 shadow-lg border-green-100 bg-white">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300 delay-150 shadow-inner">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Absensi Berhasil!
          </h2>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">
            Terima kasih <strong>{form.getValues("name")}</strong>,<br />
            Kehadiran Anda telah tercatat beserta tanda tangan digital.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full h-11 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            Kembali ke Form
          </Button>
        </Card>
      </div>
    );
  }

  // --- TAMPILAN FORM ---
  return (
    // Background gradient yang menarik
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 md:p-6">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 backdrop-blur-sm animate-in zoom-in-95 duration-500">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-blue-600 shadow-sm border border-blue-100">
            <FileText className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Daftar Hadir Digital
          </CardTitle>
          <p className="text-sm text-slate-500">
            Silakan lengkapi data diri Anda di bawah ini.
          </p>
        </CardHeader>

        <CardContent className="p-6 md:p-8 pt-2">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl font-medium flex items-center gap-2 border border-red-100 animate-in shake duration-300">
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
                    <FormLabel className="text-slate-700 font-semibold text-sm ml-1">
                      Nama Lengkap
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          placeholder="Nama Lengkap beserta Gelar"
                          className="pl-10 bg-slate-50 h-11 border-slate-200 focus:bg-white transition-all"
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
                      <FormLabel className="text-slate-700 font-semibold text-sm ml-1">
                        NIP / NIK
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Hash className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            placeholder="Nomor Induk"
                            className="pl-10 bg-slate-50 h-11 border-slate-200 focus:bg-white transition-all"
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
                      <FormLabel className="text-slate-700 font-semibold text-sm ml-1">
                        Bidang / Instansi
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            placeholder="Unit Kerja"
                            className="pl-10 bg-slate-50 h-11 border-slate-200 focus:bg-white transition-all"
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
                    <div className="flex justify-between items-center mb-1.5 ml-1">
                      <FormLabel className="text-slate-700 font-semibold text-sm">
                        Tanda Tangan
                      </FormLabel>
                      <span
                        onClick={clearSignature}
                        className="text-xs text-red-500 cursor-pointer hover:bg-red-50 px-2 py-1 rounded-md flex items-center gap-1 transition-colors font-medium"
                      >
                        <Eraser className="h-3 w-3" /> Ulangi
                      </span>
                    </div>
                    <FormControl>
                      {/* Wrapper div dengan ref untuk resize */}
                      <div
                        ref={containerRef}
                        className={`border-2 rounded-xl overflow-hidden bg-white shadow-inner relative ${
                          form.formState.errors.signature
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-slate-200 hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
                        }`}
                      >
                        {/* Grid Background untuk Canvas */}
                        <div
                          className="absolute inset-0 pointer-events-none opacity-[0.03]"
                          style={{
                            backgroundImage:
                              "radial-gradient(#000 1px, transparent 1px)",
                            backgroundSize: "10px 10px",
                          }}
                        ></div>

                        <SignatureCanvas
                          ref={sigCanvas}
                          penColor="#0f172a"
                          backgroundColor="rgba(255,255,255,0)" // Transparan agar grid terlihat
                          canvasProps={{
                            width: canvasWidth, // Gunakan state width
                            height: 160,
                            className: "cursor-crosshair block touch-none", // touch-none penting untuk mobile!
                          }}
                          onEnd={onSigEnd}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-[10px] text-slate-400 italic mt-1 ml-1">
                      *Silakan tanda tangan pada area di atas.
                    </p>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full h-12 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-200 rounded-xl transition-all active:scale-95 mt-4"
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

      {/* Footer copyright */}
      <div className="absolute bottom-4 text-slate-400 text-[10px] opacity-60">
        &copy; {new Date().getFullYear()} Bapenda Sultra Digital
      </div>
    </div>
  );
}
