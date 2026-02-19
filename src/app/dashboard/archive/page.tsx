import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { FileText } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function ArchivePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_token")?.value;
  const role = cookieStore.get("user_role")?.value;

  // OPTIMASI: Fallback array kosong & validasi userId sebelum query
  let allMeetings: (typeof meetings.$inferSelect)[] = [];

  if (role === "admin") {
    allMeetings = await db.select().from(meetings).orderBy(desc(meetings.date));
  } else if (userId) {
    allMeetings = await db
      .select()
      .from(meetings)
      .where(eq(meetings.userId, Number(userId)))
      .orderBy(desc(meetings.date));
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="shrink-0 p-3 bg-yellow-100 text-yellow-600 rounded-xl border border-yellow-200/50">
            <FileText className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Arsip Digital
              {role === "admin" && (
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  Admin
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {role === "admin"
                ? "Kelola seluruh data notulen instansi"
                : "Riwayat notulen yang Anda buat"}
            </p>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={allMeetings} />
    </div>
  );
}
