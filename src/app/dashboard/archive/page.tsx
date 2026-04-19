import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { verifyAuthToken } from "@/lib/auth";

export default async function ArchivePage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  if (!authToken) redirect("/");

  const payload = await verifyAuthToken(authToken);
  if (!payload?.id) redirect("/");

  const userId = String(payload.id);
  const role = (payload.role as string) || "pegawai";

  if (!userId || userId === "undefined") redirect("/");

  let allMeetings: (typeof meetings.$inferSelect)[] = [];

  try {
    if (role === "admin") {
      allMeetings = await db
        .select()
        .from(meetings)
        .orderBy(desc(meetings.date));
    } else {
      allMeetings = await db
        .select()
        .from(meetings)
        .where(eq(meetings.userId, userId))
        .orderBy(desc(meetings.date));
    }
  } catch (error) {
    console.error("Gagal memuat data arsip:", error);
    return (
      // PERBAIKAN UI 1: Error state menggunakan variabel 'destructive' shadcn
      <div className="p-8 text-center bg-destructive/10 text-destructive rounded-xl border border-destructive/20 m-4 md:m-0">
        <p className="font-semibold">Gagal memuat data arsip</p>
        <p className="text-sm opacity-90">Silakan muat ulang halaman.</p>
      </div>
    );
  }

  return (
    // PERBAIKAN UI 2: Menghapus 'font-sans' (sudah di-handle globals.css)
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          {/* PERBAIKAN UI 3: Ikon menggunakan warna primary + opacity */}

          <div>
            {/* PERBAIKAN UI 4: text-gray-900 diubah ke text-foreground */}
            <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              Arsip Digital
              {role === "admin" && (
                // Label admin disesuaikan warnanya dengan tema utama (primary)
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
                  Admin
                </span>
              )}
            </h2>
            {/* PERBAIKAN UI 5: text-gray-500 diubah ke text-muted-foreground */}
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              {role === "admin"
                ? "Kelola seluruh data notulen instansi"
                : "Riwayat notulen yang Anda buat"}
            </p>
          </div>
        </div>
      </div>

      {/* DataTable dibiarkan utuh karena logikanya sudah terpisah dengan baik */}
      <DataTable columns={columns} data={allMeetings} />
    </div>
  );
}
