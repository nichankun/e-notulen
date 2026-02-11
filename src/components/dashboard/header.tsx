"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Building2, CalendarDays } from "lucide-react";

// Di real app, Anda bisa mengambil data user dari session/auth hook
// Contoh statis (bisa diganti dengan props atau fetch data user yang login)
const USER_AGENCY_FALLBACK = "BADAN PENDAPATAN DAERAH"; // Default jika data kosong

export function Header({ userAgency }: { userAgency?: string }) {
  const pathname = usePathname();

  // Gunakan prop instansi jika ada, jika tidak pakai fallback
  const displayAgency = userAgency || USER_AGENCY_FALLBACK;

  // Helper Judul Halaman
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard Utama";
    if (pathname === "/dashboard/create") return "Buat Agenda Baru";
    if (pathname === "/dashboard/archive") return "Arsip Notulen";
    if (pathname === "/dashboard/users") return "Manajemen Users";
    if (pathname.includes("/live")) return "Live Control Room";
    return "E-Notulen";
  };

  // Helper Tanggal
  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sticky top-0 z-10 justify-between">
      {/* --- BAGIAN KIRI: Navigasi & Judul --- */}
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="-ml-1 text-slate-500 hover:text-blue-600 shrink-0" />
        <Separator
          orientation="vertical"
          className="mr-2 h-4 bg-slate-200 shrink-0"
        />

        {/* Judul Halaman: Truncate di mobile biar tidak tabrakan sama kanan */}
        <h1 className="text-sm font-bold text-slate-800 md:text-base tracking-tight truncate">
          {getPageTitle()}
        </h1>
      </div>

      {/* --- BAGIAN KANAN: Informasi Instansi --- */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {/* Info 1: Tanggal (Hidden di Mobile) */}
        <div className="hidden md:flex items-center gap-2 text-right">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Hari Ini
            </span>
            <span className="text-xs font-medium text-slate-700">
              {dateStr}
            </span>
          </div>
          <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
            <CalendarDays className="h-4 w-4" />
          </div>
        </div>

        {/* Separator Desktop */}
        <div className="hidden md:block h-8 w-px bg-slate-100 mx-1"></div>

        {/* UPDATE: Identitas Instansi (Responsive Mobile) */}
        <div className="flex items-center gap-2 md:gap-3 bg-slate-50 pl-1 pr-3 py-1 rounded-full border border-slate-100 max-w-40 md:max-w-xs">
          {/* Icon Instansi */}
          <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-blue-200 shadow-md shrink-0">
            <Building2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </div>

          {/* Teks Instansi */}
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] md:text-xs font-bold text-slate-800 leading-tight uppercase truncate">
              {displayAgency}
            </span>
            <span className="text-[9px] md:text-[10px] font-medium text-slate-500 leading-none mt-0.5 truncate">
              Prov. Sulawesi Tenggara
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
