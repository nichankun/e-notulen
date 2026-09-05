import Link from "next/link";
import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { count, eq, and, avg } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
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
  colorClass: string;
}

const monthFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Makassar",
  month: "long",
  year: "numeric",
});

// Fetch stats terpisah dari komponen — lebih mudah di-test dan di-maintain
async function fetchStats(userId: string, role: string) {
  const roleFilter = role === "admin" ? undefined : eq(meetings.userId, userId);

  const [totalResult, pendingResult, avgResult] = await Promise.all([
    db.select({ count: count() }).from(meetings).where(roleFilter),
    db
      .select({ count: count() })
      .from(meetings)
      .where(and(eq(meetings.status, "live"), roleFilter)),
    db
      .select({ avg: avg(meetings.attendanceCount) })
      .from(meetings)
      .where(roleFilter),
  ]);

  return {
    total: totalResult[0]?.count ?? 0,
    pending: pendingResult[0]?.count ?? 0,
    avgAttendance: Math.round(Number(avgResult[0]?.avg ?? 0)),
  };
}

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/");

  const userId = user.id;
  const role = user.role;

  let stats = { total: 0, pending: 0, avgAttendance: 0 };
  let fetchError = false;

  try {
    stats = await fetchStats(userId, role);
  } catch (error) {
    console.error("Gagal memuat statistik dashboard:", error);
    fetchError = true;
  }

  if (fetchError) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-64 border border-dashed rounded-xl bg-muted/50">
        <p className="font-semibold text-foreground mb-1">Gagal memuat data</p>
        <p className="text-sm text-muted-foreground">
          Muat ulang halaman atau periksa koneksi database.
        </p>
      </div>
    );
  }

  const currentMonth = monthFormatter.format(new Date());
  const isAdmin = role === "admin";

  const statCards = [
    {
      title: isAdmin ? "Total Kegiatan Instansi" : "Kegiatan Saya",
      value: stats.total.toString(),
      desc: `Data ${currentMonth}`,
      icon: CalendarCheck,
      colorClass: "text-primary bg-primary/10",
    },
    {
      title: "Rata-rata Peserta",
      value: `${stats.avgAttendance} Orang`,
      desc: isAdmin ? "Seluruh Rapat" : "Rapat Saya",
      icon: Users,
      colorClass: "text-emerald-600 bg-emerald-500/10",
    },
    {
      title: "Belum Selesai",
      value: stats.pending.toString(),
      desc: "Perlu Finalisasi",
      icon: FilePen,
      colorClass: "text-orange-600 bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-card border text-card-foreground w-fit px-3 py-2 rounded-full">
          {isAdmin ? (
            <>
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Administrator</span>
            </>
          ) : (
            <>
              <UserCircle className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium">Pegawai / Notulis</span>
            </>
          )}
        </div>

        <Link href="/dashboard/create">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Buat Agenda</span>
            <span className="sm:hidden">Buat</span>
          </Button>
        </Link>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {statCards.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  desc,
  icon: Icon,
  colorClass,
}: StatCardProps) {
  return (
    <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
      <CardContent className="p-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1 truncate">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
            {value}
          </h3>
          <div className="flex items-center gap-1 text-[11px] mt-2 px-2 py-0.5 rounded-full w-fit bg-muted text-muted-foreground">
            <ArrowRight className="h-3 w-3 -rotate-45 shrink-0" />
            <span className="truncate">{desc}</span>
          </div>
        </div>
        <div
          className={`shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${colorClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
