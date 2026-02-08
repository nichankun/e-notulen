import Link from "next/link";
import { db } from "@/db"; // Pastikan path ini benar
import { meetings } from "@/db/database/schema"; // Pastikan path schema benar
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

// 1. Definisikan Interface untuk Props StatCard
interface StatCardProps {
  title: string;
  value: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  trend: string;
}

// 2. Ubah menjadi ASYNC Component untuk Data Fetching
export default async function DashboardPage() {
  // --- REAL DATA FETCHING START ---

  // Kita gunakan Promise.all agar query jalan paralel (lebih cepat)
  const [totalResult, pendingResult, avgResult] = await Promise.all([
    // Query 1: Total Kegiatan (Semua data)
    db.select({ count: count() }).from(meetings),

    // Query 2: Menunggu Finalisasi (Status = 'live')
    db
      .select({ count: count() })
      .from(meetings)
      .where(eq(meetings.status, "live")),

    // Query 3: Rata-rata Kehadiran (Average dari kolom attendanceCount)
    db
      .select({ avg: sql<number>`AVG(${meetings.attendanceCount})` })
      .from(meetings),
  ]);

  const totalMeetings = totalResult[0].count;
  const pendingMeetings = pendingResult[0].count;
  // Ambil rata-rata, bulatkan, jika null (belum ada data) set ke 0
  const avgAttendance = Math.round(avgResult[0].avg || 0);

  // Generate Nama Bulan & Tahun Sekarang secara Dinamis
  const currentMonth = new Date().toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  // --- REAL DATA FETCHING END ---

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: Total Kegiatan */}
        <StatCard
          title="Total Kegiatan"
          value={totalMeetings.toString()} // Data Real
          desc={`Bulan ${currentMonth}`} // Bulan Real
          icon={CalendarCheck}
          color="bg-blue-50 text-blue-600"
          trend="text-green-600"
        />

        {/* CARD 2: Rata-rata Kehadiran */}
        <StatCard
          title="Rata-rata Peserta"
          value={`${avgAttendance} Orang`} // Data Real
          desc="Per Kegiatan"
          icon={Users}
          color="bg-green-50 text-green-600"
          trend="text-slate-500"
        />

        {/* CARD 3: Menunggu Finalisasi */}
        <StatCard
          title="Menunggu Finalisasi"
          value={pendingMeetings.toString()} // Data Real
          desc="Status Live / Aktif"
          icon={FilePen}
          color="bg-orange-50 text-orange-600"
          trend="text-orange-600 font-bold"
        />
      </div>

      {/* Banner CTA */}
      <div className="relative overflow-hidden bg-linear-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl shadow-blue-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl"></div>

        <div className="z-10">
          <h3 className="text-2xl font-bold mb-2">Mulai Rapat Baru?</h3>
          <p className="text-blue-100 max-w-lg leading-relaxed">
            Buat agenda rapat, generate QR Code absensi otomatis, dan catat
            notulen secara real-time dalam satu sistem terintegrasi.
          </p>
        </div>

        <div className="z-10">
          <Link href="/dashboard/create">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 border-0 font-bold shadow-lg h-12 px-6 rounded-xl"
            >
              <Plus className="mr-2 h-5 w-5" /> Buat Agenda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// 3. Component StatCard (Tidak berubah, hanya menerima props dinamis)
function StatCard({
  title,
  value,
  desc,
  icon: Icon,
  color,
  trend,
}: StatCardProps) {
  return (
    <Card className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-6 flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
            {value}
          </h3>
          <div
            className={`flex items-center text-xs mt-2 font-medium ${trend}`}
          >
            {trend.includes("green") && (
              <ArrowRight className="h-3 w-3 mr-1 -rotate-45" />
            )}
            {desc}
          </div>
        </div>
        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl ${color}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}
