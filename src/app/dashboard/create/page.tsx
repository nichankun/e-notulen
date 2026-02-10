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
import { Rocket, ArrowLeft, Loader2 } from "lucide-react";
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
    // Wrapper utama: p-4 mobile, p-0 desktop. Max-w-3xl agar form tidak terlalu lebar.
    <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-300 p-4 md:p-0">
      {/* HEADER SECTION (Tanpa CardHeader) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Detail Agenda Rapat
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Isi informasi lengkap kegiatan rapat atau pertemuan.
          </p>
        </div>

        {/* Badge Langkah */}
        <span className="w-fit text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-bold uppercase tracking-wide">
          Langkah 1 dari 2
        </span>
      </div>

      {/* FORM SECTION (Langsung Form) */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Field Judul */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-semibold text-sm">
                  Judul Rapat / Kegiatan
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: Rapat Evaluasi PAD Triwulan I"
                    disabled={isSubmitting}
                    className="h-10 md:h-12 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-all text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Grid Layout untuk Tanggal & Lokasi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Field Tanggal */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-sm">
                    Tanggal & Waktu
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      disabled={isSubmitting}
                      className="h-10 md:h-12 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-all text-base"
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
                  <FormLabel className="text-slate-700 font-semibold text-sm">
                    Lokasi / Ruangan
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ruang Rapat Utama..."
                      disabled={isSubmitting}
                      className="h-10 md:h-12 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-all text-base"
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
                <FormLabel className="text-slate-700 font-semibold text-sm">
                  Pimpinan Rapat
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nama Pejabat..."
                    disabled={isSubmitting}
                    className="h-10 md:h-12 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-all text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* FOOTER ACTION BUTTONS */}
          <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-3 md:gap-4 pt-6 mt-8 border-t border-slate-200">
            <Link href="/dashboard" className="w-full md:w-auto">
              <Button
                variant="outline"
                type="button"
                disabled={isSubmitting}
                className="w-full md:w-auto text-slate-600 hover:text-slate-800 h-10 md:h-12 border-slate-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Batal
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 h-10 md:h-12 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Buat & Buka Sesi
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
