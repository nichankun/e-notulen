import Link from "next/link";
import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { count, eq, sql } from "drizzle-orm";
import {
  CalendarCheck,
  Users,
  FilePen,
  Plus,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 1. Interface (Tetap)
interface StatCardProps {
  title: string;
  value: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  trend: string;
}

export default async function DashboardPage() {
  // 2. Fetching Data (Logika Tetap Sama)
  const [totalResult, pendingResult, avgResult] = await Promise.all([
    db.select({ count: count() }).from(meetings),
    db
      .select({ count: count() })
      .from(meetings)
      .where(eq(meetings.status, "live")),
    db
      .select({ avg: sql<string | null>`AVG(${meetings.attendanceCount})` })
      .from(meetings),
  ]);

  const totalMeetings = totalResult[0]?.count ?? 0;
  const pendingMeetings = pendingResult[0]?.count ?? 0;
  const avgAttendance = Math.round(Number(avgResult[0]?.avg ?? 0));

  const currentMonth = new Date().toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    // UPDATE: Padding p-4 di mobile agar tidak mepet layar, md:p-0 di desktop
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-0">
      {/* BAGIAN HEADER STATISTIK */}
      {/* UPDATE: Gap-4 di mobile (lebih rapat), Gap-6 di desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          title="Total Kegiatan"
          value={totalMeetings.toString()}
          desc={`Bulan ${currentMonth}`}
          icon={CalendarCheck}
          color="bg-blue-50 text-blue-600"
          trend="text-green-600"
        />
        <StatCard
          title="Rata-rata Peserta"
          value={`${avgAttendance} Orang`}
          desc="Per Kegiatan"
          icon={Users}
          color="bg-emerald-50 text-emerald-600"
          trend="text-slate-500"
        />
        <StatCard
          title="Menunggu Finalisasi"
          value={pendingMeetings.toString()}
          desc="Status Live / Aktif"
          icon={FilePen}
          color="bg-amber-50 text-amber-600"
          trend="text-amber-600 font-bold"
        />
      </div>

      {/* BANNER CTA (Call to Action) */}
      {/* UPDATE: Flex-col (menumpuk) di mobile, Row di desktop. */}
      {/* UPDATE: Gunakan bg-gradient-to-r (standar Tailwind) menggantikan bg-linear-to-r */}
      <div className="relative overflow-hidden bg-linear-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-blue-100 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
        {/* Dekorasi Background (Pointer events none agar tidak mengganggu klik) */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 w-32 rounded-full bg-blue-400 opacity-10 blur-2xl pointer-events-none"></div>

        {/* UPDATE: Text center di mobile, Left di desktop */}
        <div className="z-10 relative text-center md:text-left">
          <h3 className="text-xl md:text-2xl font-bold mb-2 tracking-tight">
            Mulai Rapat Baru?
          </h3>
          <p className="text-blue-100 max-w-lg leading-relaxed text-sm md:text-base">
            Buat agenda rapat, generate QR Code absensi otomatis, dan catat
            notulen secara real-time untuk efisiensi kerja Bapenda.
          </p>
        </div>

        {/* UPDATE: Button full width di mobile */}
        <div className="z-10 relative shrink-0 w-full md:w-auto">
          <Link href="/dashboard/create" className="block w-full">
            <Button
              size="lg"
              className="w-full md:w-auto bg-white text-blue-800 hover:bg-blue-50 border-0 font-bold shadow-lg h-12 px-8 rounded-xl transition-transform active:scale-95"
            >
              <Plus className="mr-2 h-5 w-5 stroke-[3px]" /> Buat Agenda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// 4. Komponen StatCard (Diperbaiki untuk Mobile)
function StatCard({
  title,
  value,
  desc,
  icon: Icon,
  color,
  trend,
}: StatCardProps) {
  return (
    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group">
      {/* UPDATE: p-5 di mobile, p-6 desktop. Flex start agar ikon tetap di atas jika teks panjang */}
      <CardContent className="p-5 md:p-6 flex items-start justify-between gap-4">
        {/* UPDATE: min-w-0 PENTING agar truncate berfungsi di dalam Flexbox */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] md:text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 truncate">
            {title}
          </p>
          {/* Text size responsif */}
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors truncate">
            {value}
          </h3>

          <div
            className={`flex items-center text-[10px] md:text-xs mt-3 font-semibold px-2 py-1 rounded-full w-fit max-w-full ${
              trend.includes("green") ? "bg-green-100/50" : "bg-slate-100"
            }`}
          >
            {trend.includes("green") && (
              <ArrowRight className="h-3 w-3 mr-1 -rotate-45 shrink-0" />
            )}
            <span className={`truncate ${trend}`}>{desc}</span>
          </div>
        </div>

        {/* UPDATE: Shrink-0 agar ikon tidak gepeng/mengecil di layar sempit */}
        <div
          className={`shrink-0 h-12 w-12 md:h-14 md:w-14 rounded-2xl flex items-center justify-center text-xl shadow-inner transition-transform group-hover:scale-110 duration-300 ${color}`}
        >
          <Icon className="h-6 w-6 md:h-7 md:w-7" />
        </div>
      </CardContent>
    </Card>
  );
}
