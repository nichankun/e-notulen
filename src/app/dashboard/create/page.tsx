"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import {
  Rocket,
  ArrowLeft,
  Loader2,
  FileText,
  CalendarClock,
  MapPin,
  User,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  title: z.string().min(5, "Judul rapat minimal 5 karakter"),
  date: z.string().refine((val) => val !== "", "Tanggal dan waktu wajib diisi"),
  location: z.string().min(3, "Lokasi minimal 3 karakter"),
  leader: z.string().min(3, "Nama pimpinan minimal 3 karakter"),
});

export default function CreateMeetingPage() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: "",
      location: "",
      leader: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (json.success) {
        toast.success("Agenda Berhasil Dibuat", {
          description: "Mengalihkan ke halaman absensi...",
          duration: 3000,
        });

        router.push(`/dashboard/live/${json.data.id}`);
      } else {
        toast.error("Gagal Membuat Rapat", {
          description: json.message || "Silakan coba lagi.",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Kesalahan Jaringan", {
        description: "Periksa koneksi internet Anda.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Sparkles className="size-5" />
            </div>
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">
              Sistem E-Notulen
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Buat Agenda Baru
          </h2>
          <p className="text-slate-500 mt-1">
            Silakan lengkapi informasi agenda rapat di bawah ini.
          </p>
        </div>

        {/* Custom Progress Indicator */}
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
            Progress Pengisian
          </span>
          <div className="flex gap-1">
            <div className="h-1.5 w-12 rounded-full bg-blue-600" />
            <div className="h-1.5 w-12 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden rounded-2xl">
            <CardContent className="p-6 md:p-10 space-y-6 bg-white">
              {/* Field Judul */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-slate-700 font-bold mb-2">
                      <FileText className="size-4 text-blue-500" />
                      Judul Rapat / Kegiatan
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Misal: Evaluasi Pendapatan Daerah Bulanan"
                        disabled={isSubmitting}
                        className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-base rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Field Tanggal */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-slate-700 font-bold mb-2">
                        <CalendarClock className="size-4 text-blue-500" />
                        Tanggal & Waktu
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          disabled={isSubmitting}
                          className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-base rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Field Lokasi */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-slate-700 font-bold mb-2">
                        <MapPin className="size-4 text-blue-500" />
                        Lokasi / Ruangan
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ruang Rapat Kepala Badan"
                          disabled={isSubmitting}
                          className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-base rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Field Pimpinan */}
              <FormField
                control={form.control}
                name="leader"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-slate-700 font-bold mb-2">
                      <User className="size-4 text-blue-500" />
                      Pimpinan Rapat
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan nama pimpinan..."
                        disabled={isSubmitting}
                        className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-base rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4">
            <Link href="/dashboard" className="w-full md:w-auto">
              <Button
                variant="ghost"
                type="button"
                disabled={isSubmitting}
                className="w-full md:w-auto text-slate-500 hover:text-slate-800 h-12 px-6"
              >
                <ArrowLeft className="mr-2 size-4" /> Kembali ke Dashboard
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 h-14 rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Sedang Menyiapkan Sesi...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 size-5" />
                  Buat & Buka Absensi
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
