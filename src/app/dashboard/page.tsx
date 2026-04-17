import Link from "next/link";
import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { count, eq, and, avg } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/lib/auth";
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
  colorClass: string; // Diubah agar lebih semantik dengan shadcn
}

// Formatter bulan diletakkan di luar agar performa maksimal
const monthFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  if (!authToken) redirect("/");

  const payload = await verifyAuthToken(authToken);
  if (!payload?.id) redirect("/");

  const userId = String(payload.id);
  const role = (payload.role as string) || "pegawai";

  if (!userId || userId === "undefined") {
    console.error("Dashboard Error: Invalid User ID format");
    redirect("/");
  }

  const roleFilter = role === "admin" ? undefined : eq(meetings.userId, userId);

  try {
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

    const totalMeetings = totalResult[0]?.count ?? 0;
    const pendingMeetings = pendingResult[0]?.count ?? 0;
    const avgAttendance = Math.round(Number(avgResult[0]?.avg ?? 0));
    const currentMonth = monthFormatter.format(new Date());

    return (
      // Dihapus 'font-sans' karena sudah di-handle oleh body di globals.css
      <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* HEADER: Penanda Role */}
        {/* Menggunakan bg-card dan border border-border agar senada dengan shadcn */}
        <div className="flex items-center gap-3 bg-card border border-border text-card-foreground w-fit px-4 py-2.5 rounded-full shadow-sm">
          {role === "admin" ? (
            <>
              {/* Warna icon admin diset ke warna primary preset Anda */}
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                  Status Akses
                </span>
                <span className="text-sm font-semibold leading-none">
                  Administrator Instansi
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Warna pegawai bisa tetap hijau, atau disamakan text-primary */}
              <UserCircle className="h-5 w-5 text-emerald-500" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                  Status Akses
                </span>
                <span className="text-sm font-semibold leading-none">
                  Pegawai / Notulis
                </span>
              </div>
            </>
          )}
        </div>

        {/* KARTU STATISTIK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <StatCard
            title={
              role === "admin" ? "Total Kegiatan Instansi" : "Kegiatan Saya"
            }
            value={totalMeetings.toString()}
            desc={`Data ${currentMonth}`}
            icon={CalendarCheck}
            colorClass="text-primary bg-primary/10" // Menggunakan variabel opacity primary
          />
          <StatCard
            title="Rata-rata Peserta"
            value={`${avgAttendance} Orang`}
            desc={role === "admin" ? "Seluruh Rapat" : "Rapat Saya"}
            icon={Users}
            colorClass="text-emerald-600 bg-emerald-500/10"
          />
          <StatCard
            title="Belum Selesai"
            value={pendingMeetings.toString()}
            desc="Perlu Finalisasi"
            icon={FilePen}
            colorClass="text-orange-600 bg-orange-500/10"
          />
        </div>

        {/* BANNER CTA */}
        {/* Menggunakan bg-primary dari preset shadcn, bukan kode hex statis */}
        <div className="relative overflow-hidden bg-primary text-primary-foreground rounded-2xl p-6 md:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8 border border-primary">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-[60px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-48 w-48 rounded-full bg-white/5 blur-2xl pointer-events-none"></div>

          <div className="z-10 relative text-center md:text-left flex-1">
            <h3 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
              {role === "admin"
                ? "Pantau Aktivitas Rapat"
                : "Siap Memulai Rapat?"}
            </h3>
            {/* Menggunakan opacity 90% (text-primary-foreground/90) agar teks terbaca lembut */}
            <p className="text-primary-foreground/90 max-w-lg leading-relaxed text-sm md:text-[15px]">
              {role === "admin"
                ? "Anda memiliki akses penuh untuk mengelola seluruh data notulensi dan daftar hadir pegawai di lingkungan Instansi."
                : "Buat agenda baru sekarang, sistem akan menyiapkan QR Code absensi dan ruang catatan risalah digital secara otomatis."}
            </p>
          </div>

          <div className="z-10 relative shrink-0 w-full md:w-auto">
            <Link href="/dashboard/create" className="block w-full">
              {/* Cukup gunakan variant="secondary". Di shadcn, ini otomatis jadi tombol terang/putih di atas latar gelap/primary */}
              <Button
                size="lg"
                variant="secondary"
                className="w-full md:w-auto font-bold shadow-md h-12 md:h-14 px-8 rounded-full group text-[15px] md:text-base"
              >
                <Plus className="mr-2 h-5 w-5 stroke-[2.5px] group-hover:rotate-90 transition-transform" />
                {role === "admin" ? "Agenda Baru" : "Buat Agenda"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Gagal memuat statistik dashboard:", error);
    return (
      // Error state yang mengikuti standar warna shadcn
      <div className="p-8 text-center flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-xl bg-muted/50 m-4 md:m-6">
        <p className="font-semibold text-lg text-foreground mb-1">
          Gagal memuat data statistik
        </p>
        <p className="text-sm text-muted-foreground">
          Silakan muat ulang halaman atau periksa koneksi database Anda.
        </p>
      </div>
    );
  }
}

function StatCard({
  title,
  value,
  desc,
  icon: Icon,
  colorClass,
}: StatCardProps) {
  return (
    // Komponen <Card> bawaan shadcn otomatis mengatur warna bg, teks, dan border-nya sendiri. Kita cukup tambahkan efek hover.
    <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
      <CardContent className="p-5 md:p-6 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] md:text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 truncate">
            {title}
          </p>
          <h3 className="text-3xl md:text-[2rem] font-bold text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
            {value}
          </h3>

          <div className="flex items-center text-[11px] md:text-xs mt-3 font-medium px-2.5 py-1 rounded-full w-fit max-w-full bg-muted text-muted-foreground">
            <ArrowRight className="h-3 w-3 mr-1 -rotate-45 shrink-0" />
            <span className="truncate">{desc}</span>
          </div>
        </div>

        <div
          className={`shrink-0 h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center transition-all group-hover:scale-105 duration-300 ${colorClass}`}
        >
          <Icon className="h-6 w-6 md:h-7 md:w-7" />
        </div>
      </CardContent>
    </Card>
  );
}
