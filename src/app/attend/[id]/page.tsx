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

  useEffect(() => {
    fetch(`/api/meetings/${id}`)
      .then((res) => res.json())
      .then((json) =>
        setMeetingValid(json.success && json.data.status === "live"),
      )
      .catch(() => setMeetingValid(false));
  }, [id]);

  const onSigEnd = () => {
    if (sigCanvas.current) {
      form.setValue(
        "signature",
        sigCanvas.current.getTrimmedCanvas().toDataURL("image/png"),
      );
      form.clearErrors("signature");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError("");

    // PERBAIKAN: Generate Fingerprint di sini, bukan di useEffect
    // Ini menghindari error setState synchronously
    const fingerprint = `${navigator.userAgent}-${window.screen.width}x${window.screen.height}`;
    const generatedDeviceId = btoa(fingerprint);

    try {
      const res = await fetch(`/api/meetings/${id}/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Kirim generatedDeviceId langsung ke body
        body: JSON.stringify({ ...values, deviceId: generatedDeviceId }),
      });

      const json = await res.json();

      if (json.success) {
        setSuccess(true);
      } else {
        setError(json.message || "Gagal melakukan absensi");
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    }
  };

  if (meetingValid === null)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-bold animate-pulse">
        Memverifikasi Agenda...
      </div>
    );

  if (meetingValid === false)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 p-4">
        <Card className="max-w-md p-10 text-center rounded-[2.5rem] shadow-2xl">
          <ShieldCheck className="mx-auto h-20 w-20 text-red-500 mb-4" />
          <h2 className="text-2xl font-black uppercase text-slate-800">
            Akses Ditutup
          </h2>
          <p className="text-slate-500 text-sm mt-3">
            Agenda rapat Bapenda belum dimulai atau sudah selesai.
          </p>
        </Card>
      </div>
    );

  if (success)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full text-center p-10 shadow-2xl rounded-[2.5rem] bg-white">
          <CheckCircle2 className="mx-auto h-20 w-20 text-green-500 mb-4" />
          <h2 className="text-2xl font-black uppercase text-slate-800">
            Berhasil Absen!
          </h2>
          <p className="text-slate-500 mt-2 italic text-sm">
            Terima kasih {form.getValues("name")}, data kehadiran Anda telah
            masuk.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-8 w-full h-12 rounded-2xl font-bold bg-slate-900"
          >
            Kembali
          </Button>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="text-center pt-10 pb-4">
          <div className="mx-auto bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg">
            <Users className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tighter">
            Daftar Hadir Digital
          </CardTitle>
          <p className="text-[10px] font-black text-blue-600 tracking-[0.2em] uppercase">
            Bapenda Prov. Sultra
          </p>
        </CardHeader>
        <CardContent className="px-6 md:px-10 pb-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs rounded-2xl font-black border border-red-100 uppercase">
              ⚠️ {error}
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-[10px] uppercase ml-1">
                      Nama Lengkap
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          className="pl-11 h-12 rounded-2xl border-slate-200 font-bold"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[10px] uppercase ml-1">
                        NIP/NIK
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="h-12 rounded-2xl font-bold"
                          {...field}
                        />
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
                      <FormLabel className="font-black text-[10px] uppercase ml-1">
                        Bidang/Unit
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="h-12 rounded-2xl font-bold"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-700 font-black text-[10px] uppercase ml-1 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Prioritas Urutan
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl border-blue-100 font-black text-blue-900 bg-blue-50/50">
                          <SelectValue placeholder="Pilih Urutan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl shadow-2xl border-slate-100">
                        <SelectItem value="pimpinan" className="py-3 font-bold">
                          1: Pimpinan
                        </SelectItem>
                        <SelectItem value="pejabat" className="py-3 font-bold">
                          2: Pejabat
                        </SelectItem>
                        <SelectItem value="peserta" className="py-3 font-bold">
                          3: Peserta
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="signature"
                render={() => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1">
                      <FormLabel className="font-black text-[10px] uppercase ml-1">
                        Tanda Tangan
                      </FormLabel>
                      <span
                        onClick={() => sigCanvas.current?.clear()}
                        className="text-[9px] text-red-500 cursor-pointer font-black border border-red-100 px-3 py-1 rounded-full uppercase"
                      >
                        <Eraser className="h-3 w-3 inline mr-1" /> Hapus
                      </span>
                    </div>
                    <FormControl>
                      <div
                        ref={containerRef}
                        className="border-2 rounded-[1.5rem] bg-white border-slate-200 overflow-hidden"
                      >
                        <SignatureCanvas
                          ref={sigCanvas}
                          penColor="#0f172a"
                          canvasProps={{
                            height: 160,
                            className: "w-full cursor-crosshair",
                          }}
                          onEnd={onSigEnd}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl shadow-xl shadow-blue-200 uppercase tracking-widest"
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Kirim Kehadiran"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="absolute bottom-6 text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">
        Digital Presence System &bull; Bapenda Sultra
      </div>
    </div>
  );
}
