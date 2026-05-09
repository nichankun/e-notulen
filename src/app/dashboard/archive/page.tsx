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
      <div className="p-8 text-center bg-destructive/10 text-destructive rounded-xl border border-destructive/20 m-4 md:m-0">
        <p className="font-semibold">Gagal memuat data arsip</p>
        <p className="text-sm opacity-90">Silakan muat ulang halaman.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-0 space-y-8 animate-in fade-in duration-500">
      {/* HEADER — minimalis, tanpa ikon dekoratif */}
      <div className="flex items-end justify-between border-b pb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
            {role === "admin" ? "Semua Data · Admin" : "Riwayat Notulen"}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Arsip Digital
          </h1>
        </div>

        <p className="text-sm text-muted-foreground font-medium pb-0.5">
          {allMeetings.length} notulen
        </p>
      </div>

      {/* TABEL */}
      <DataTable columns={columns} data={allMeetings} />
    </div>
  );
}
