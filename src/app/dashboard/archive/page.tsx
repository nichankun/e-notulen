import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { verifyAuthToken } from "@/lib/auth";

export default async function ArchivePage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  // 1. Proteksi Halaman Dasar
  if (!authToken) redirect("/");

  // 2. Bongkar JWT untuk mendapatkan Identitas Asli
  const payload = await verifyAuthToken(authToken);
  if (!payload || !payload.id) redirect("/");

  // PERBAIKAN: Gunakan String karena id sekarang adalah UUID
  const userId = String(payload.id);
  const role = (payload.role as string) || "pegawai";

  // Mencegah string kosong atau undefined merusak query
  if (!userId || userId === "undefined") redirect("/");

  // OPTIMASI: Fallback array kosong dengan Type-Safe Drizzle
  let allMeetings: (typeof meetings.$inferSelect)[] = [];

  try {
    // 3. Eksekusi Query berdasarkan Role dari JWT
    if (role === "admin") {
      // Admin menarik semua data rapat instansi
      allMeetings = await db
        .select()
        .from(meetings)
        .orderBy(desc(meetings.date));
    } else {
      // Pegawai hanya menarik data miliknya sendiri menggunakan UUID string
      allMeetings = await db
        .select()
        .from(meetings)
        .where(eq(meetings.userId, userId))
        .orderBy(desc(meetings.date));
    }
  } catch (error) {
    console.error("Gagal memuat data arsip:", error);
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-100">
        Gagal memuat data arsip. Silakan muat ulang halaman.
      </div>
    );
    // allMeetings tetap [] jika terjadi error database
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-0 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="shrink-0 p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <FileText className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
              Arsip Digital
              {role === "admin" && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                  Admin
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {role === "admin"
                ? "Kelola seluruh data notulen instansi"
                : "Riwayat notulen yang Anda buat"}
            </p>
          </div>
        </div>
      </div>

      {/* DataTable sekarang menerima data dengan ID format string (UUID) */}
      <DataTable columns={columns} data={allMeetings} />
    </div>
  );
}
