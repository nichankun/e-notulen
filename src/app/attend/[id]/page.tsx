"use client";

import { useState, useRef, use, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ShieldCheck,
  Eraser,
  Users,
  Fingerprint,
  Sparkles,
} from "lucide-react";

const ROLE_OPTIONS = ["pimpinan", "pejabat", "peserta"] as const;

// PERBAIKAN: NIP dihapus dari schema agar pengisian lebih cepat
const formSchema = z.object({
  name: z.string().min(3, "Nama lengkap wajib diisi"),
  department: z.string().min(3, "Bidang/Unit wajib diisi"),
  role: z.enum(ROLE_OPTIONS, { message: "Pilih peran/urutan" }),
  signature: z.string().min(1, "Tanda tangan wajib diisi"),
});

type AttendanceFormValues = z.infer<typeof formSchema>;

export default function AttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [success, setSuccess] = useState(false);
  const [meetingValid, setMeetingValid] = useState<boolean | null>(null);
  const [attendeeCount, setAttendeeCount] = useState(0);

  const [canvasWidth, setCanvasWidth] = useState(500);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      department: "",
      role: "peserta",
      signature: "",
    },
    mode: "onChange",
  });

  // 1. Resizing Canvas
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (containerRef.current) {
          setCanvasWidth(containerRef.current.offsetWidth);
        }
      }, 100);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // 2. Verifikasi Rapat & Polling Jumlah Peserta (Engagement)
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}`);
        const json = await res.json();
        setMeetingValid(json.success && json.data?.status === "live");
      } catch {
        setMeetingValid(false);
      }
    };

    const fetchCount = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}/attendees`);
        const json = await res.json();
        if (json.success) setAttendeeCount(json.data.length);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
    fetchCount();

    // Polling jumlah peserta setiap 5 detik agar interaktif
    const interval = setInterval(fetchCount, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const onSigEnd = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      form.setValue(
        "signature",
        sigCanvas.current.getTrimmedCanvas().toDataURL("image/png"),
        { shouldValidate: true },
      );
    }
  };

  const handleClearSignature = () => {
    sigCanvas.current?.clear();
    form.setValue("signature", "", { shouldValidate: true });
  };

  const onSubmit = async (values: AttendanceFormValues) => {
    try {
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
        toast.error("Absensi Gagal", { description: json.message });
      }
    } catch (err: unknown) {
      console.error("Submit Error:", err);
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  if (meetingValid === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Menghubungkan ke Server...
        </p>
      </div>
    );
  }

  if (meetingValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="max-w-md w-full p-10 text-center rounded-3xl shadow-xl bg-card border">
          <ShieldCheck className="mx-auto h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold text-foreground">Sesi Ditutup</h2>
          <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
            Mohon maaf, agenda rapat ini belum dimulai atau akses absensi telah
            ditutup oleh admin.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="max-w-md w-full text-center p-10 shadow-2xl rounded-3xl bg-card border animate-in zoom-in-95 duration-500">
          <div className="relative inline-block mb-6">
            <CheckCircle2 className="h-24 w-24 text-emerald-500" />
            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-amber-400 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-foreground">
            Absensi Berhasil!
          </h2>
          <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">
            Terima kasih{" "}
            <strong className="text-foreground">
              {form.getValues("name")}
            </strong>
            ,<br />
            kehadiran Anda telah divalidasi oleh sistem e-Notulen.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-10 w-full h-14 rounded-full font-bold text-lg shadow-lg hover:scale-[1.02] transition-all"
          >
            Selesai
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center p-4 sm:p-8">
      {/* HEADER SECTION */}
      <div className="w-full max-w-125 text-center mb-8 mt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary mb-4">
          <Fingerprint className="size-4" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Presensi Digital
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tighter mb-2">
          e-Notulen
        </h1>
        <p className="text-muted-foreground font-medium italic">
          Sistem Administrasi Bapenda Prov. Sultra
        </p>
      </div>

      {/* ENGAGEMENT COUNTER (Agar orang tertarik) */}
      <div className="w-full max-w-125 mb-6 flex items-center justify-center gap-4 bg-background/60 backdrop-blur-md py-3 px-6 rounded-2xl border shadow-sm animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center"
            >
              <Users className="size-3 text-muted-foreground" />
            </div>
          ))}
        </div>
        <p className="text-sm font-semibold text-foreground">
          <span className="text-primary animate-pulse font-black">
            {attendeeCount}
          </span>{" "}
          Peserta telah hadir
        </p>
      </div>

      {/* FORM CARD */}
      <div className="w-full max-w-125 bg-card rounded-[2.5rem] shadow-2xl border p-6 md:p-10 mb-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest ml-1">
                    Nama Lengkap & Gelar
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Input nama lengkap Anda..."
                      className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary text-base px-6 font-medium"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] ml-1" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest ml-1">
                      Bidang / Unit Kerja
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Bidang Pendapatan"
                        className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary text-base px-6 font-medium"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] ml-1" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest ml-1">
                    Peran dalam Rapat
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={form.formState.isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none focus:ring-2 focus:ring-primary text-base px-6 font-medium">
                        <SelectValue placeholder="Pilih Peran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem
                        value="pimpinan"
                        className="py-3 rounded-xl cursor-pointer"
                      >
                        Pimpinan Rapat
                      </SelectItem>
                      <SelectItem
                        value="pejabat"
                        className="py-3 rounded-xl cursor-pointer"
                      >
                        Pejabat Struktural
                      </SelectItem>
                      <SelectItem
                        value="peserta"
                        className="py-3 rounded-xl cursor-pointer"
                      >
                        Peserta / Staff
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="signature"
              render={() => (
                <FormItem className="pt-2">
                  <div className="flex justify-between items-end mb-2 px-1">
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                      Tanda Tangan Digital
                    </FormLabel>
                    <button
                      type="button"
                      onClick={handleClearSignature}
                      disabled={form.formState.isSubmitting}
                      className="text-[11px] text-destructive font-bold flex items-center gap-1 hover:opacity-70 transition-opacity"
                    >
                      <Eraser className="h-3 w-3" /> ULANGI
                    </button>
                  </div>
                  <FormControl>
                    <div
                      ref={containerRef}
                      className="w-full border-2 border-dashed border-muted-foreground/20 rounded-[2rem] bg-muted/20 overflow-hidden focus-within:border-primary/40 transition-all shadow-inner"
                    >
                      <SignatureCanvas
                        ref={sigCanvas}
                        penColor="#000000"
                        canvasProps={{
                          id: "sig-canvas",
                          width: canvasWidth,
                          height: 220,
                          className: "cursor-crosshair block w-full",
                          style: { touchAction: "none" },
                        }}
                        onEnd={onSigEnd}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] ml-1" />
                </FormItem>
              )}
            />

            <div className="pt-6">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full h-16 bg-primary hover:opacity-90 text-primary-foreground font-black text-xl rounded-full shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                  <>
                    Kirim Absensi <CheckCircle2 className="size-6" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="mb-10 text-center opacity-40">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Bapenda Prov. Sultra &bull; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
