import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function ArchivePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_token")?.value;
  const role = cookieStore.get("user_role")?.value;

  let allMeetings;
  if (role === "admin") {
    allMeetings = await db.select().from(meetings).orderBy(desc(meetings.date));
  } else {
    allMeetings = await db
      .select()
      .from(meetings)
      .where(eq(meetings.userId, Number(userId)))
      .orderBy(desc(meetings.date));
  }

  return (
    <Card className="border-slate-200 shadow-sm animate-in fade-in duration-500">
      <CardHeader className="border-b border-slate-200 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-800">
              Arsip Digital {role !== "admin"}
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              {role === "admin"
                ? "Seluruh data notulen instansi"
                : "Notulen yang Anda buat dan kelola"}
            </p>
          </div>
        </div>
      </CardHeader>

      {/* MENGGUNAKAN DATA TABLE SHADCN */}
      <DataTable columns={columns} data={allMeetings} />
    </Card>
  );
}
