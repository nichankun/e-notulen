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

// ─── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
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
      message: "Format: HH.MM (contoh: 09.00)",
    }),
  endTime: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{2}\.\d{2}$/.test(val), {
      message: "Format: HH.MM (contoh: 11.30)",
    }),
  secretary: z.string().optional(),
  recorder: z.string().optional(),
  leaderTitle: z.string().optional(),
  leaderRank: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-1">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary shrink-0">
        {number}
      </span>
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
    </div>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <FormLabel className="text-xs font-semibold text-foreground">
      {children}
      {required ? (
        <span className="text-destructive ml-0.5">*</span>
      ) : (
        <span className="text-muted-foreground/60 ml-1.5 font-normal text-[10px]">
          opsional
        </span>
      )}
    </FormLabel>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateMeetingForm() {
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

  const isLoading = form.formState.isSubmitting || isPending;

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
        startTransition(() => router.push(`/dashboard/live/${json.data.id}`));
      } else {
        toast.error(json.message || "Gagal membuat rapat");
      }
    } catch (error) {
      console.error(error);
      toast.error("Periksa koneksi internet Anda.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* SEKSI 1 — Informasi Utama */}
        <div className="space-y-4">
          <SectionLabel number="1" title="Informasi Utama" />

          {/* Judul */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FieldLabel required>Judul Rapat / Kegiatan</FieldLabel>
                <FormControl>
                  <Input
                    placeholder="Evaluasi Pendapatan Daerah Bulanan"
                    disabled={isLoading}
                    className="h-10 rounded-xl"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Tanggal + Lokasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel required>Tanggal & Waktu</FieldLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      disabled={isLoading}
                      className="h-10 rounded-xl"
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
                  <FieldLabel required>Lokasi / Ruangan</FieldLabel>
                  <FormControl>
                    <Input
                      placeholder="Ruang Rapat Kepala Badan"
                      disabled={isLoading}
                      className="h-10 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Nomor Surat */}
          <FormField
            control={form.control}
            name="invitationNumber"
            render={({ field }) => (
              <FormItem>
                <FieldLabel>Nomor Surat Undangan</FieldLabel>
                <FormControl>
                  <Input
                    placeholder="005/123/BAPENDA/2025"
                    disabled={isLoading}
                    className="h-10 rounded-xl"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Jam Mulai + Selesai */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel>Jam Mulai</FieldLabel>
                  <FormControl>
                    <Input
                      placeholder="09.00"
                      disabled={isLoading}
                      className="h-10 rounded-xl"
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
                  <FieldLabel>Jam Selesai</FieldLabel>
                  <FormControl>
                    <Input
                      placeholder="11.30"
                      disabled={isLoading}
                      className="h-10 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SEKSI 2 — Pimpinan & Petugas */}
        <div className="space-y-4">
          <SectionLabel number="2" title="Pimpinan & Petugas" />

          {/* Nama Pimpinan */}
          <FormField
            control={form.control}
            name="leader"
            render={({ field }) => (
              <FormItem>
                <FieldLabel required>Nama Pimpinan Rapat</FieldLabel>
                <FormControl>
                  <Input
                    placeholder="Nama pimpinan..."
                    disabled={isLoading}
                    className="h-10 rounded-xl"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Jabatan + Pangkat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="leaderTitle"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel>Jabatan</FieldLabel>
                  <FormControl>
                    <Input
                      placeholder="Kepala Badan"
                      disabled={isLoading}
                      className="h-10 rounded-xl"
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
                  <FieldLabel>Pangkat / Golongan</FieldLabel>
                  <FormControl>
                    <Input
                      placeholder="Pembina Utama Madya / IV-c"
                      disabled={isLoading}
                      className="h-10 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Sekretaris + Notulis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="secretary"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel>Sekretaris</FieldLabel>
                  <FormControl>
                    <Input
                      placeholder="Nama sekretaris..."
                      disabled={isLoading}
                      className="h-10 rounded-xl"
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
                  <FieldLabel>Pencatat / Notulis</FieldLabel>
                  <FormControl>
                    <Input
                      placeholder="Nama pencatat..."
                      disabled={isLoading}
                      className="h-10 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ── Action Buttons ──────────────────────────────────────────────── */}
        <div className="pt-2 border-t border-border">
          {/* Mobile */}
          <div className="sm:hidden space-y-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyiapkan...
                </>
              ) : (
                "Buat & Buka Absensi"
              )}
            </Button>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Dashboard
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden sm:flex items-center justify-between pt-4">
            <Button
              variant="ghost"
              type="button"
              disabled={isLoading}
              asChild
              className="text-muted-foreground"
            >
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading} className="px-8">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyiapkan...
                </>
              ) : (
                "Buat & Buka Absensi"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
