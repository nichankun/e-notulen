import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation"; // Tambahan untuk proteksi
import { FileText } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { verifyAuthToken } from "@/lib/auth"; // Wajib panggil ini!

export default async function ArchivePage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  // 1. Proteksi Halaman Dasar
  if (!authToken) redirect("/");

  // 2. Bongkar JWT untuk mendapatkan Identitas Asli
  const payload = await verifyAuthToken(authToken);
  if (!payload || !payload.id) redirect("/");

  const userId = Number(payload.id);
  const role = (payload.role as string) || "pegawai";

  // Mencegah NaN merusak Database
  if (isNaN(userId)) redirect("/");

  // OPTIMASI: Fallback array kosong dengan Type-Safe Drizzle
  let allMeetings: (typeof meetings.$inferSelect)[] = [];

  try {
    // 3. Eksekusi Query berdasarkan Role dari JWT (Bukan dari Cookie mentah)
    if (role === "admin") {
      allMeetings = await db
        .select()
        .from(meetings)
        .orderBy(desc(meetings.date));
    } else {
      allMeetings = await db
        .select()
        .from(meetings)
        .where(eq(meetings.userId, userId)) // userId pasti angka valid sekarang
        .orderBy(desc(meetings.date));
    }
  } catch (error) {
    console.error("Gagal memuat data arsip:", error);
    // Jika database bermasalah, allMeetings tetap berupa array kosong []
    // sehingga <DataTable /> tidak akan error saat me-render data.
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="shrink-0 p-3 bg-yellow-100 text-yellow-600 rounded-xl border border-yellow-200/50 shadow-inner">
            <FileText className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Arsip Digital
              {role === "admin" && (
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 uppercase tracking-wider">
                  Admin
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              {role === "admin"
                ? "Kelola seluruh data notulen instansi"
                : "Riwayat notulen yang Anda buat"}
            </p>
          </div>
        </div>
      </div>

      {/* Komponen DataTable buatanmu yang super keren */}
      <DataTable columns={columns} data={allMeetings} />
    </div>
  );
}
