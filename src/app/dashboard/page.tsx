import Link from "next/link";
import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { count, eq, and, avg } from "drizzle-orm"; // PERBAIKAN: Import avg dari drizzle-orm
import { cookies } from "next/headers";
import { redirect } from "next/navigation"; // TAMBAHAN: untuk proteksi redirect
import { verifyAuthToken } from "@/lib/auth"; // TAMBAHAN: Import fungsi utility JWT kita
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
  // 1. Ambil Token dari Cookie
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  if (!authToken) redirect("/");

  // 2. Ekstrak Data dari JWT (Mencegah error NaN dan spoofing Role)
  const payload = await verifyAuthToken(authToken);
  if (!payload || !payload.id) redirect("/");

  const userId = Number(payload.id);
  const role = (payload.role as string) || "pegawai";

  // Pastikan ID benar-benar angka yang valid sebelum menembak database
  if (isNaN(userId)) {
    console.error("Dashboard Error: Invalid User ID format");
    redirect("/");
  }

  // 3. Tentukan Filter Berdasarkan Role (Sudah memakai camelCase sesuai schema)
  const roleFilter = role === "admin" ? undefined : eq(meetings.userId, userId);

  try {
    // 4. Fetching Data secara Paralel
    const [totalResult, pendingResult, avgResult] = await Promise.all([
      db.select({ count: count() }).from(meetings).where(roleFilter),
      db
        .select({ count: count() })
        .from(meetings)
        .where(and(eq(meetings.status, "live"), roleFilter)),

      // PERBAIKAN: Menggunakan fungsi avg() bawaan Drizzle, bukan raw sql
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
      <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-6 font-sans">
        {/* HEADER: Penanda Role */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 w-fit px-4 py-2.5 rounded-full shadow-sm">
          {role === "admin" ? (
            <>
              <ShieldCheck className="h-5 w-5 text-[#0866ff]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide leading-none mb-0.5">
                  Status Akses
                </span>
                <span className="text-sm font-semibold text-gray-900 leading-none">
                  Administrator Instansi
                </span>
              </div>
            </>
          ) : (
            <>
              <UserCircle className="h-5 w-5 text-[#25D366]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide leading-none mb-0.5">
                  Status Akses
                </span>
                <span className="text-sm font-semibold text-gray-900 leading-none">
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
            color="bg-blue-50 text-[#0866ff]"
            trend="text-[#25D366]"
          />
          <StatCard
            title="Rata-rata Peserta"
            value={`${avgAttendance} Orang`}
            desc={role === "admin" ? "Seluruh Rapat" : "Rapat Saya"}
            icon={Users}
            color="bg-emerald-50 text-emerald-600"
            trend="text-gray-500"
          />
          <StatCard
            title="Belum Selesai"
            value={pendingMeetings.toString()}
            desc="Perlu Finalisasi"
            icon={FilePen}
            color="bg-orange-50 text-orange-600"
            trend="text-orange-600 font-semibold"
          />
        </div>

        {/* BANNER CTA */}
        <div className="relative overflow-hidden bg-[#0866ff] rounded-2xl p-6 md:p-10 text-white shadow-[0_8px_24px_rgba(8,102,255,0.2)] flex flex-col md:flex-row items-center justify-between gap-8 border border-[#0866ff]">
          {/* Dekorasi Halus */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-10 blur-[60px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-48 w-48 rounded-full bg-white opacity-5 blur-2xl pointer-events-none"></div>

          <div className="z-10 relative text-center md:text-left flex-1">
            <h3 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
              {role === "admin"
                ? "Pantau Aktivitas Rapat"
                : "Siap Memulai Rapat?"}
            </h3>
            <p className="text-blue-100 max-w-lg leading-relaxed text-sm md:text-[15px]">
              {role === "admin"
                ? "Anda memiliki akses penuh untuk mengelola seluruh data notulensi dan daftar hadir pegawai di lingkungan Instansi."
                : "Buat agenda baru sekarang, sistem akan menyiapkan QR Code absensi dan ruang catatan risalah digital secara otomatis."}
            </p>
          </div>

          <div className="z-10 relative shrink-0 w-full md:w-auto">
            <Link href="/dashboard/create" className="block w-full">
              <Button
                size="lg"
                className="w-full md:w-auto bg-white text-[#0866ff] hover:bg-gray-50 border-0 font-bold shadow-md h-12 md:h-14 px-8 rounded-full transition-colors group text-[15px] md:text-base"
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
    // Menangkap error jika tabel kosong atau koneksi database terputus
    console.error("Gagal memuat statistik dashboard:", error);
    return (
      <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-64 border border-dashed border-gray-300 rounded-xl bg-white m-4 md:m-6">
        <p className="font-semibold text-lg text-gray-900 mb-1">
          Gagal memuat data statistik
        </p>
        <p className="text-sm">
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
  color,
  trend,
}: StatCardProps) {
  return (
    <Card className="border-gray-100/50 shadow-sm md:shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group rounded-xl bg-white">
      <CardContent className="p-5 md:p-6 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] md:text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1.5 truncate">
            {title}
          </p>
          <h3 className="text-3xl md:text-[2rem] font-bold text-gray-900 tracking-tight group-hover:text-[#0866ff] transition-colors truncate">
            {value}
          </h3>

          <div
            className={`flex items-center text-[11px] md:text-xs mt-3 font-medium px-2.5 py-1 rounded-full w-fit max-w-full ${
              trend.includes("green")
                ? "bg-[#25D366]/10 text-[#20b858]"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {trend.includes("green") && (
              <ArrowRight className="h-3 w-3 mr-1 -rotate-45 shrink-0" />
            )}
            <span className="truncate">{desc}</span>
          </div>
        </div>

        {/* Ikon Stat - Dibikin bulat / full-rounded mengikuti gaya FB yang lembut */}
        <div
          className={`shrink-0 h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center transition-all group-hover:scale-105 duration-300 ${color}`}
        >
          <Icon className="h-6 w-6 md:h-7 md:w-7" />
        </div>
      </CardContent>
    </Card>
  );
}
