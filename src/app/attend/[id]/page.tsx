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
import { CheckCircle2, Loader2, ShieldCheck, Eraser } from "lucide-react";

const ROLE_OPTIONS = ["pimpinan", "pejabat", "peserta"] as const;

const formSchema = z.object({
  name: z.string().min(3, "Nama lengkap wajib diisi"),
  nip: z.string().min(5, "NIP wajib diisi"),
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

  const [canvasWidth, setCanvasWidth] = useState(500);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nip: "",
      department: "",
      role: "peserta",
      signature: "",
    },
    mode: "onChange",
  });

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
      toast.error("Terjadi kesalahan jaringan", {
        description: "Pastikan koneksi internet Anda stabil dan coba lagi.",
      });
    }
  };

  // --- STATE 1: LOADING ---
  if (meetingValid === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f2f5] font-sans">
        <Loader2 className="h-10 w-10 animate-spin text-[#0866ff] mb-4" />
        <p className="text-gray-500 font-medium">Memverifikasi Agenda...</p>
      </div>
    );
  }

  // --- STATE 2: INVALID/CLOSED ---
  if (meetingValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4 font-sans">
        <div className="max-w-md w-full p-8 text-center rounded-xl shadow-md bg-white border border-gray-100">
          <ShieldCheck className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Akses Ditutup</h2>
          <p className="text-gray-500 text-[15px] mt-2">
            Agenda rapat belum dimulai atau sudah selesai.
          </p>
        </div>
      </div>
    );
  }

  // --- STATE 3: SUCCESS ---
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4 font-sans">
        <div className="max-w-md w-full text-center p-8 shadow-md rounded-xl bg-white border border-gray-100 animate-in zoom-in-95 duration-500">
          <CheckCircle2 className="mx-auto h-20 w-20 text-[#25D366] mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Berhasil Absen!</h2>
          <p className="text-gray-500 mt-2 text-[15px]">
            Terima kasih{" "}
            <strong className="text-gray-900">{form.getValues("name")}</strong>,
            kehadiran Anda telah tercatat dalam sistem.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-8 w-full h-12 rounded-full font-bold bg-[#0866ff] text-white hover:bg-[#1877f2] transition-colors text-lg"
          >
            Selesai
          </Button>
        </div>
      </div>
    );
  }

  // --- STATE 4: MAIN FORM ---
  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      {/* HEADER SECTION (Gaya FB Centered) */}
      <div className="w-full max-w-125 text-center mb-6 mt-4 md:mt-0">
        <h1 className="text-4xl md:text-[2.5rem] font-bold text-[#0866ff] tracking-tight mb-2">
          e-Notulen
        </h1>
        <h2 className="text-lg md:text-xl font-medium text-gray-800">
          Daftar Hadir Digital
        </h2>
      </div>

      {/* FORM CARD */}
      <div className="w-full max-w-125 bg-white rounded-xl shadow-md md:shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100/50 p-5 md:p-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 md:space-y-5"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    Nama Lengkap & Gelar
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Dr. H. Budi Santoso, M.Si"
                      className="h-12 md:h-13 rounded-md border-gray-300 focus:border-[#0866ff] focus:ring-1 focus:ring-[#0866ff] text-base px-4"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <FormField
                control={form.control}
                name="nip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      NIP / NIK
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="19xxxxxxxxxxxx"
                        className="h-12 md:h-13 rounded-md border-gray-300 focus:border-[#0866ff] focus:ring-1 focus:ring-[#0866ff] text-base px-4"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      Bidang / Unit
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama Bidang/Unit"
                        className="h-12 md:h-13 rounded-md border-gray-300 focus:border-[#0866ff] focus:ring-1 focus:ring-[#0866ff] text-base px-4"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    Peran / Urutan Cetak
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={form.formState.isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 md:h-13 rounded-md border-gray-300 focus:border-[#0866ff] focus:ring-1 focus:ring-[#0866ff] text-base px-4">
                        <SelectValue placeholder="Pilih Urutan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-gray-200 bg-white shadow-lg">
                      <SelectItem
                        value="pimpinan"
                        className="py-2.5 cursor-pointer"
                      >
                        1: Pimpinan Rapat / Kepala Daerah
                      </SelectItem>
                      <SelectItem
                        value="pejabat"
                        className="py-2.5 cursor-pointer"
                      >
                        2: Pejabat Struktural / Pemateri
                      </SelectItem>
                      <SelectItem
                        value="peserta"
                        className="py-2.5 cursor-pointer"
                      >
                        3: Peserta Umum / Staff
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="signature"
              render={() => (
                <FormItem className="pt-2">
                  <div className="flex justify-between items-end mb-2">
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      Tanda Tangan Digital
                    </FormLabel>
                    <button
                      type="button"
                      onClick={handleClearSignature}
                      disabled={form.formState.isSubmitting}
                      className="text-[13px] text-[#0866ff] font-medium hover:underline disabled:opacity-50 flex items-center gap-1 focus:outline-none"
                    >
                      <Eraser className="h-3.5 w-3.5" /> Hapus
                    </button>
                  </div>
                  <FormControl>
                    <div
                      ref={containerRef}
                      className="w-full border border-gray-300 rounded-md bg-white overflow-hidden focus-within:border-[#0866ff] focus-within:ring-1 focus-within:ring-[#0866ff] transition-all"
                    >
                      <SignatureCanvas
                        ref={sigCanvas}
                        penColor="#111827" // gray-900
                        canvasProps={{
                          id: "sig-canvas",
                          width: canvasWidth,
                          height: 200,
                          className:
                            "cursor-crosshair block w-full bg-[#f9fafb]", // gray-50 bg for canvas
                          style: { touchAction: "none" },
                          tabIndex: -1,
                        }}
                        onEnd={onSigEnd}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full h-12 md:h-12.5 bg-[#0866ff] hover:bg-[#1877f2] text-white font-bold text-[17px] md:text-lg rounded-full transition-colors flex items-center justify-center gap-2"
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  "Kirim Kehadiran"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* FOOTER TEXT */}
      <div className="mt-8 text-center text-gray-500 text-[13px] md:text-sm">
        <p>
          <span className="font-bold">Bapenda Prov. Sultra</span> &copy;{" "}
          {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
