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
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  title: z.string().min(5, "Judul rapat minimal 5 karakter"),
  date: z
    .string()
    .min(1, "Tanggal wajib diisi")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Format tanggal tidak valid",
    }),
  location: z.string().min(3, "Lokasi minimal 3 karakter"),
  leader: z.string().min(3, "Nama pimpinan minimal 3 karakter"),
  invitationNumber: z.string().optional(),
  startTime: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{2}\.\d{2}$/.test(val), {
      message: "Format waktu: HH.MM (contoh: 09.00)",
    }),
  endTime: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{2}\.\d{2}$/.test(val), {
      message: "Format waktu: HH.MM (contoh: 11.30)",
    }),
  secretary: z.string().optional(),
  recorder: z.string().optional(),
  leaderTitle: z.string().optional(),
  leaderRank: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function SectionLabel({ title }: { title: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground pt-2">
      {title}
    </p>
  );
}

export default function CreateMeetingPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: "",
      location: "",
      leader: "",
      invitationNumber: "",
      startTime: "",
      endTime: "",
      secretary: "",
      recorder: "",
      leaderTitle: "",
      leaderRank: "",
    },
  });

  const { isSubmitting } = form.formState;
  const isLoading = isSubmitting || isPending;

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (json.success) {
        toast.success("Agenda berhasil dibuat");
        startTransition(() => {
          router.push(`/dashboard/live/${json.data.id}`);
        });
      } else {
        toast.error(json.message || "Gagal membuat rapat");
      }
    } catch (error) {
      console.error(error);
      toast.error("Periksa koneksi internet Anda.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-0 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="border-b pb-5 mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
          E-Notulen
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Buat Agenda Baru
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* ── INFORMASI UTAMA ── */}
          <SectionLabel title="Informasi Utama" />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul Rapat / Kegiatan</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Evaluasi Pendapatan Daerah Bulanan"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi / Ruangan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ruang Rapat Kepala Badan"
                      disabled={isLoading}
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
            name="invitationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nomor Surat Undangan{" "}
                  <span className="text-muted-foreground font-normal">
                    (opsional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="005/123/BAPENDA/2025"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Waktu Mulai{" "}
                    <span className="text-muted-foreground font-normal">
                      (opsional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="09.00"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Waktu Selesai{" "}
                    <span className="text-muted-foreground font-normal">
                      (opsional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="11.30"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* ── PIMPINAN & PETUGAS ── */}
          <SectionLabel title="Pimpinan & Petugas" />

          <FormField
            control={form.control}
            name="leader"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Pimpinan Rapat</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nama pimpinan..."
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="leaderTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Jabatan{" "}
                    <span className="text-muted-foreground font-normal">
                      (opsional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Kepala Badan"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="leaderRank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pangkat / Golongan{" "}
                    <span className="text-muted-foreground font-normal">
                      (opsional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Pembina Utama Madya / IV-c"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="secretary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Sekretaris{" "}
                    <span className="text-muted-foreground font-normal">
                      (opsional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nama sekretaris..."
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recorder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pencatat / Notulis{" "}
                    <span className="text-muted-foreground font-normal">
                      (opsional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nama pencatat..."
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-3 pt-6 border-t mt-4">
            <Button
              variant="ghost"
              type="button"
              asChild
              className={`w-full md:w-auto text-muted-foreground ${
                isLoading ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 size-4" />
                Kembali
              </Link>
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Menyiapkan...
                </>
              ) : (
                "Buat & Buka Absensi"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
