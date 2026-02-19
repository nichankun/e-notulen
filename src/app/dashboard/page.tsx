import Link from "next/link";
import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { count, eq, sql, and } from "drizzle-orm";
import { cookies } from "next/headers"; // Tambahan untuk cek role
import {
  CalendarCheck,
  Users,
  FilePen,
  Plus,
  ArrowRight,
  ShieldCheck,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StatCardProps {
  title: string;
  value: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  trend: string;
}

// Formatter bulan diletakkan di luar agar performa maksimal
const monthFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});

export default async function DashboardPage() {
  // 1. Ambil Identitas dari Cookie
  const cookieStore = await cookies();
  const role = cookieStore.get("user_role")?.value || "pegawai";
  const userId = cookieStore.get("auth_token")?.value;

  // 2. Tentukan Filter Berdasarkan Role
  // Jika admin, filter dikosongkan (ambil semua). Jika pegawai, filter berdasarkan userId.
  const roleFilter =
    role === "admin" ? undefined : eq(meetings.userId, Number(userId));

  // 3. Fetching Data secara Paralel (Disesuaikan dengan Filter Role)
  const [totalResult, pendingResult, avgResult] = await Promise.all([
    db.select({ count: count() }).from(meetings).where(roleFilter),
    db
      .select({ count: count() })
      .from(meetings)
      .where(and(eq(meetings.status, "live"), roleFilter)),
    db
      .select({ avg: sql<string | null>`AVG(${meetings.attendanceCount})` })
      .from(meetings)
      .where(roleFilter),
  ]);

  const totalMeetings = totalResult[0]?.count ?? 0;
  const pendingMeetings = pendingResult[0]?.count ?? 0;
  const avgAttendance = Math.round(Number(avgResult[0]?.avg ?? 0));
  const currentMonth = monthFormatter.format(new Date());

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-0">
      {/* HEADER: Penanda Role */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 w-fit px-4 py-2 rounded-2xl shadow-sm">
        {role === "admin" ? (
          <>
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Status Akses
              </span>
              <span className="text-sm font-bold text-slate-700">
                Administrator Instansi
              </span>
            </div>
          </>
        ) : (
          <>
            <UserCircle className="h-5 w-5 text-emerald-600" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Status Akses
              </span>
              <span className="text-sm font-bold text-slate-700">
                Pegawai / Notulis
              </span>
            </div>
          </>
        )}
      </div>

      {/* KARTU STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          title={role === "admin" ? "Total Kegiatan Instansi" : "Kegiatan Saya"}
          value={totalMeetings.toString()}
          desc={`Data ${currentMonth}`}
          icon={CalendarCheck}
          color="bg-blue-50 text-blue-600"
          trend="text-green-600"
        />
        <StatCard
          title="Rata-rata Peserta"
          value={`${avgAttendance} Orang`}
          desc={role === "admin" ? "Seluruh Rapat" : "Rapat Saya"}
          icon={Users}
          color="bg-emerald-50 text-emerald-600"
          trend="text-slate-500"
        />
        <StatCard
          title="Belum Selesai"
          value={pendingMeetings.toString()}
          desc="Perlu Finalisasi"
          icon={FilePen}
          color="bg-amber-50 text-amber-600"
          trend="text-amber-600 font-bold"
        />
      </div>

      {/* BANNER CTA (Disesuaikan Pesannya Berdasarkan Role) */}
      <div className="relative overflow-hidden bg-linear-to-br from-slate-900 via-blue-900 to-indigo-950 rounded-[2rem] p-6 md:p-10 text-white shadow-2xl shadow-blue-900/20 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-blue-500 opacity-10 blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-60 w-60 rounded-full bg-indigo-500 opacity-10 blur-[60px] pointer-events-none"></div>

        <div className="z-10 relative text-center md:text-left">
          <h3 className="text-2xl md:text-3xl font-black mb-3 tracking-tight">
            {role === "admin"
              ? "Pantau Aktivitas Rapat"
              : "Siap Memulai Rapat?"}
          </h3>
          <p className="text-blue-100/80 max-w-lg leading-relaxed text-sm md:text-base font-medium">
            {role === "admin"
              ? "Anda memiliki akses penuh untuk mengelola seluruh data notulensi dan daftar hadir pegawai di lingkungan Bapenda Prov. Sultra."
              : "Buat agenda baru sekarang, sistem akan menyiapkan QR Code absensi dan ruang catatan risalah digital secara otomatis."}
          </p>
        </div>

        <div className="z-10 relative shrink-0 w-full md:w-auto">
          <Link href="/dashboard/create" className="block w-full">
            <Button
              size="lg"
              className="w-full md:w-auto bg-white text-blue-900 hover:bg-blue-50 border-0 font-black shadow-xl h-14 px-10 rounded-2xl transition-all active:scale-95 group"
            >
              <Plus className="mr-2 h-5 w-5 stroke-[3px] group-hover:rotate-90 transition-transform" />
              {role === "admin" ? "Agenda Baru" : "Buat Agenda"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  desc,
  icon: Icon,
  color,
  trend,
}: StatCardProps) {
  return (
    <Card className="border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group rounded-[2rem] bg-white">
      <CardContent className="p-6 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-slate-400 font-black mb-2 truncate">
            {title}
          </p>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors truncate">
            {value}
          </h3>

          <div
            className={`flex items-center text-[10px] md:text-xs mt-4 font-bold px-3 py-1 rounded-full w-fit max-w-full ${
              trend.includes("green")
                ? "bg-green-50 text-green-600"
                : "bg-slate-50 text-slate-500"
            }`}
          >
            {trend.includes("green") && (
              <ArrowRight className="h-3 w-3 mr-1.5 -rotate-45 shrink-0" />
            )}
            <span className="truncate">{desc}</span>
          </div>
        </div>

        <div
          className={`shrink-0 h-14 w-14 md:h-16 md:w-16 rounded-2xl flex items-center justify-center shadow-inner transition-all group-hover:rotate-6 duration-300 ${color}`}
        >
          <Icon className="h-7 w-7 md:h-8 md:w-8" />
        </div>
      </CardContent>
    </Card>
  );
}
