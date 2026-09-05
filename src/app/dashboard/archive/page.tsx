import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, FileEdit } from "lucide-react";

type Meeting = typeof meetings.$inferSelect;

async function fetchMeetings(role: string, userId: string): Promise<Meeting[]> {
  return db
    .select()
    .from(meetings)
    .where(role === "admin" ? undefined : eq(meetings.userId, userId))
    .orderBy(desc(meetings.date));
}

export default async function ArchivePage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/");

  const userId = user.id;
  const role = user.role;

  let allMeetings: Meeting[] = [];
  let fetchError = false;

  try {
    allMeetings = await fetchMeetings(role, userId);
  } catch (error) {
    console.error("Gagal memuat data arsip:", error);
    fetchError = true;
  }

  if (fetchError) {
    return (
      <div className="p-8 text-center bg-destructive/10 text-destructive rounded-xl border border-destructive/20 m-4 md:m-0">
        <p className="font-semibold">Gagal memuat data arsip</p>
        <p className="text-sm opacity-90">Silakan muat ulang halaman.</p>
      </div>
    );
  }

  const done = allMeetings.filter((m) => m.status === "archived");
  const live = allMeetings.filter((m) => m.status === "live");
  const draft = allMeetings.filter((m) => m.status === "draft");
  const ongoing = [...live, ...draft];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
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

      {/* Tabs */}
      <Tabs defaultValue="done">
        <TabsList className="h-10 rounded-xl p-1 bg-muted">
          {/* Tab Selesai */}
          <TabsTrigger
            value="done"
            className="rounded-lg gap-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Selesai
            {done.length > 0 && (
              <span className="ml-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {done.length}
              </span>
            )}
          </TabsTrigger>

          {/* Tab Berlangsung */}
          <TabsTrigger
            value="ongoing"
            className="rounded-lg gap-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Clock className="h-3.5 w-3.5 text-primary" />
            Berlangsung
            {ongoing.length > 0 && (
              <span className="ml-1 bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {ongoing.length}
              </span>
            )}
          </TabsTrigger>

          {/* Tab Draft */}
          {draft.length > 0 && (
            <TabsTrigger
              value="draft"
              className="rounded-lg gap-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <FileEdit className="h-3.5 w-3.5 text-muted-foreground" />
              Draft
              <span className="ml-1 bg-muted text-muted-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {draft.length}
              </span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="done" className="mt-4">
          {done.length > 0 ? (
            <DataTable columns={columns} data={done} />
          ) : (
            <Empty label="Belum ada notulen yang selesai" />
          )}
        </TabsContent>

        <TabsContent value="ongoing" className="mt-4">
          {ongoing.length > 0 ? (
            <DataTable columns={columns} data={ongoing} />
          ) : (
            <Empty label="Tidak ada rapat berlangsung" />
          )}
        </TabsContent>

        <TabsContent value="draft" className="mt-4">
          {draft.length > 0 ? (
            <DataTable columns={columns} data={draft} />
          ) : (
            <Empty label="Tidak ada draft" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed rounded-xl">
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
