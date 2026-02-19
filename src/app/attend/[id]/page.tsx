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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Loader2,
  User,
  ShieldCheck,
  Users,
  Eraser,
  Hash,
  Building2,
} from "lucide-react";

const ROLE_OPTIONS = ["pimpinan", "pejabat", "peserta"] as const;

const formSchema = z.object({
  name: z.string().min(3, "Nama lengkap wajib diisi"),
  nip: z.string().min(5, "NIP wajib diisi"),
  department: z.string().min(3, "Bidang/Unit wajib diisi"),
  role: z.enum(ROLE_OPTIONS, { message: "Pilih peran/urutan" }),
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
  const [meetingValid, setMeetingValid] = useState<boolean | null>(null);

  // Default width untuk server-side rendering / first load
  const [canvasWidth, setCanvasWidth] = useState(500);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nip: "",
      department: "",
      role: "peserta",
      signature: "",
    },
  });

  // OPTIMASI: Debounce resize untuk performa Mobile (saat HP rotasi layar)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (containerRef.current) {
          setCanvasWidth(containerRef.current.offsetWidth);
        }
      }, 100); // Tunggu 100ms setelah resize berhenti
    };

    handleResize(); // Panggil sekali saat mount

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // OPTIMASI: Fetch aman dengan AbortController & penanganan Error Type-Safe
  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/meetings/${id}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        setMeetingValid(json.success && json.data?.status === "live");
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Gagal memverifikasi rapat:", err);
          setMeetingValid(false);
        }
      });

    return () => controller.abort();
  }, [id]);

  // OPTIMASI: Pastikan kanvas tidak kosong sebelum mengambil datanya
  const onSigEnd = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      form.setValue(
        "signature",
        sigCanvas.current.getTrimmedCanvas().toDataURL("image/png"),
        { shouldValidate: true }, // Langsung validasi agar error merah hilang
      );
    }
  };

  // OPTIMASI: Fungsi hapus yang benar-benar mereset nilai form
  const handleClearSignature = () => {
    sigCanvas.current?.clear();
    form.setValue("signature", "");
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError("");
    try {
      // Fingerprint sederhana (Aman di dalam Try-Catch)
      const fingerprint = `${navigator.userAgent}-${window.screen.width}x${window.screen.height}`;
      const generatedDeviceId = btoa(fingerprint);

      const res = await fetch(`/api/meetings/${id}/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, deviceId: generatedDeviceId }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(true);
      } else {
        setError(json.message || "Gagal melakukan absensi");
      }
    } catch (err: unknown) {
      // Bebas dari any
      console.error("Submit Error:", err);
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    }
  };

  // --- RENDERING TAMPILAN ---

  if (meetingValid === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-bold animate-pulse uppercase">
        Memverifikasi Agenda...
      </div>
    );
  }

  if (meetingValid === false) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 p-4">
        <Card className="max-w-md w-full p-10 text-center rounded-[2.5rem] shadow-2xl bg-white border-0">
          <ShieldCheck className="mx-auto h-20 w-20 text-red-500 mb-4" />
          <h2 className="text-2xl font-black uppercase text-slate-800">
            Akses Ditutup
          </h2>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            Agenda rapat Bapenda belum dimulai atau sudah selesai.
          </p>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-blue-50 p-4 text-slate-900">
        <Card className="max-w-md w-full text-center p-10 shadow-2xl rounded-[2.5rem] bg-white border-0 animate-in zoom-in-95 duration-500">
          <CheckCircle2 className="mx-auto h-20 w-20 text-green-500 mb-4 scale-110" />
          <h2 className="text-2xl font-black uppercase text-slate-800">
            Berhasil Absen!
          </h2>
          <p className="text-slate-500 mt-2 italic text-sm">
            Terima kasih <strong>{form.getValues("name")}</strong>, kehadiran
            Anda telah tercatat dalam sistem.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-8 w-full h-14 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 uppercase tracking-widest transition-all active:scale-95"
          >
            Selesai
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-indigo-900 flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 rounded-[2.5rem] overflow-hidden text-slate-900 animate-in slide-in-from-bottom-8 duration-700">
        <CardHeader className="text-center pt-10 pb-4">
          <div className="mx-auto bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg shadow-blue-300">
            <Users className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tighter">
            Daftar Hadir Digital
          </CardTitle>
          <p className="text-[10px] font-black text-blue-600 tracking-[0.2em] uppercase mt-1">
            Bapenda Prov. Sultra
          </p>
        </CardHeader>

        <CardContent className="px-6 md:px-10 pb-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs rounded-2xl font-black border border-red-100 uppercase animate-in slide-in-from-top-2 flex items-center gap-2">
              <span>⚠️</span> {error}
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
                    <FormLabel
                      htmlFor="name-input"
                      className="font-black text-[10px] uppercase ml-1 tracking-widest text-slate-700"
                    >
                      Nama Lengkap & Gelar
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          id="name-input"
                          placeholder="Dr. H. Nama Lengkap, M.Si"
                          className="pl-11 h-12 rounded-2xl border-slate-200 font-bold bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                          disabled={form.formState.isSubmitting}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NIP */}
                <FormField
                  control={form.control}
                  name="nip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        htmlFor="nip-input"
                        className="font-black text-[10px] uppercase ml-1 tracking-widest text-slate-700"
                      >
                        NIP / NIK
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors md:hidden" />
                          <Input
                            id="nip-input"
                            placeholder="19xxxx..."
                            className="h-12 rounded-2xl font-bold border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-sm md:pl-4 pl-11"
                            disabled={form.formState.isSubmitting}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />

                {/* UNIT KERJA */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        htmlFor="dept-input"
                        className="font-black text-[10px] uppercase ml-1 tracking-widest text-slate-700"
                      >
                        Bidang / Unit
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors md:hidden" />
                          <Input
                            id="dept-input"
                            placeholder="Nama Bidang"
                            className="h-12 rounded-2xl font-bold border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-sm md:pl-4 pl-11"
                            disabled={form.formState.isSubmitting}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
              </div>

              {/* PERAN */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="role-select"
                      className="text-blue-700 font-black text-[10px] uppercase ml-1 tracking-widest flex items-center gap-1 mt-2"
                    >
                      <ShieldCheck className="h-3 w-3" /> Prioritas Urutan Cetak
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={form.formState.isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger
                          id="role-select"
                          className="h-14 rounded-2xl border-blue-100 font-black text-blue-900 bg-blue-50/50 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                        >
                          <SelectValue placeholder="Pilih Urutan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl shadow-2xl border-slate-100 bg-white">
                        <SelectItem
                          value="pimpinan"
                          className="py-3 font-bold text-slate-800 focus:bg-blue-50 focus:text-blue-700 cursor-pointer"
                        >
                          1: Pimpinan Rapat / Kepala Daerah
                        </SelectItem>
                        <SelectItem
                          value="pejabat"
                          className="py-3 font-bold text-slate-800 focus:bg-blue-50 focus:text-blue-700 cursor-pointer"
                        >
                          2: Pejabat Struktural / Pemateri
                        </SelectItem>
                        <SelectItem
                          value="peserta"
                          className="py-3 font-bold text-slate-800 focus:bg-blue-50 focus:text-blue-700 cursor-pointer"
                        >
                          3: Peserta Umum / Staff
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />

              {/* TANDA TANGAN */}
              <FormField
                control={form.control}
                name="signature"
                render={() => (
                  <FormItem className="mt-6">
                    <div className="flex justify-between items-center mb-1">
                      <FormLabel
                        htmlFor="sig-canvas"
                        className="font-black text-[10px] uppercase ml-1 tracking-widest text-slate-700"
                      >
                        Tanda Tangan Digital
                      </FormLabel>
                      <button
                        type="button" // Cegah button submit form
                        onClick={handleClearSignature}
                        disabled={form.formState.isSubmitting}
                        className="text-[9px] text-red-500 cursor-pointer font-black border border-red-100 px-3 py-1 rounded-full uppercase hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center"
                      >
                        <Eraser className="h-3 w-3 mr-1" /> Hapus
                      </button>
                    </div>
                    <FormControl>
                      <div
                        ref={containerRef}
                        className="border-2 rounded-[1.5rem] bg-slate-50 focus-within:bg-white border-slate-200 overflow-hidden shadow-inner relative focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-400 transition-all"
                      >
                        <SignatureCanvas
                          ref={sigCanvas}
                          penColor="#0f172a"
                          canvasProps={{
                            id: "sig-canvas",
                            width: canvasWidth,
                            height: 200,
                            className: "cursor-crosshair block w-full h-full",
                            style: { touchAction: "none" }, // Mencegah scrolling HP saat tanda tangan
                            tabIndex: -1,
                          }}
                          onEnd={onSigEnd}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full h-14 md:h-16 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl shadow-xl shadow-blue-200/50 uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" /> MEMPROSES...
                  </>
                ) : (
                  "Kirim Kehadiran"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="absolute bottom-6 text-white/30 text-[9px] font-black uppercase tracking-[0.3em] pointer-events-none">
        Digital Presence System &bull; Bapenda Sultra
      </div>
    </div>
  );
}
