"use client";

import { useTransition } from "react";
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
  date: z
    .string()
    .min(1, "Tanggal dan waktu wajib diisi")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Format tanggal tidak valid",
    }),
  location: z.string().min(3, "Lokasi minimal 3 karakter"),
  leader: z.string().min(3, "Nama pimpinan minimal 3 karakter"),
});

export default function CreateMeetingPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
  const isLoading = isSubmitting || isPending;

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

        startTransition(() => {
          router.push(`/dashboard/live/${json.data.id}`);
        });
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
    // Dihapus 'font-sans'
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {/* Menggunakan text-primary dan bg-primary/10 */}
            <div className="px-2.5 py-1 bg-primary/10 rounded-full text-primary flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              <span className="font-bold text-[10px] uppercase tracking-wider">
                Sistem E-Notulen
              </span>
            </div>
          </div>
          {/* Teks menggunakan text-foreground */}
          <h2 className="text-2xl md:text-[2rem] font-bold text-foreground tracking-tight leading-none mt-3">
            Buat Agenda Baru
          </h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-[15px]">
            Silakan lengkapi informasi agenda rapat di bawah ini.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex flex-col items-start md:items-end gap-1.5 mt-2 md:mt-0">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Progress Pengisian
          </span>
          <div className="flex gap-1.5">
            {/* Menggunakan bg-primary dan bg-muted */}
            <div className="h-1.5 w-10 rounded-full bg-primary" />
            <div className="h-1.5 w-10 rounded-full bg-muted" />
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 md:space-y-8"
        >
          {/* FORM CARD: Otomatis diurus oleh <Card> shadcn */}
          <Card className="shadow-sm md:shadow-md overflow-hidden rounded-xl border">
            <CardContent className="p-5 md:p-8 space-y-6 md:space-y-7">
              {/* Field Judul */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-foreground font-semibold mb-2">
                      <FileText className="size-4 text-primary" />
                      Judul Rapat / Kegiatan
                    </FormLabel>
                    <FormControl>
                      {/* Class dihapus, biarkan komponen Input bawaan shadcn bekerja */}
                      <Input
                        placeholder="Misal: Evaluasi Pendapatan Daerah Bulanan"
                        disabled={isLoading}
                        className="h-12 text-base rounded-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Field Tanggal */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-foreground font-semibold mb-2">
                        <CalendarClock className="size-4 text-primary" />
                        Tanggal & Waktu
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          disabled={isLoading}
                          className="h-12 text-base rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Field Lokasi */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-foreground font-semibold mb-2">
                        <MapPin className="size-4 text-primary" />
                        Lokasi / Ruangan
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ruang Rapat Kepala Badan"
                          disabled={isLoading}
                          className="h-12 text-base rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
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
                    <FormLabel className="flex items-center gap-2 text-foreground font-semibold mb-2">
                      <User className="size-4 text-primary" />
                      Pimpinan Rapat
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan nama pimpinan..."
                        disabled={isLoading}
                        className="h-12 text-base rounded-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 pt-2">
            <Button
              variant="ghost"
              type="button"
              asChild
              // Menggunakan text-muted-foreground
              className={`w-full md:w-auto text-muted-foreground hover:text-foreground h-12 px-6 rounded-full font-medium ${
                isLoading ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 size-4" /> Kembali ke Dashboard
              </Link>
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              // Membiarkan button shadcn mengatur warna default-nya (yang merupakan warna primary)
              className="w-full md:w-auto h-12 md:h-14 px-8 rounded-full font-bold transition-all text-[15px] md:text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Sedang Menyiapkan Sesi...
                </>
              ) : (
                <>Buat & Buka Absensi</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
