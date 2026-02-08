"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Building2, CalendarDays } from "lucide-react"; // Icon gedung & kalender

export function Header() {
  const pathname = usePathname();

  // Helper Judul Halaman
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard Utama";
    if (pathname === "/dashboard/create") return "Buat Agenda Baru";
    if (pathname === "/dashboard/archive") return "Arsip Notulen";
    if (pathname.includes("/live")) return "Live Control Room";
    return "E-Notulen";
  };

  // Helper Tanggal (Format Indonesia Lengkap)
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
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-slate-500 hover:text-blue-600" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-slate-200" />

        {/* Judul Halaman (Besar & Jelas) */}
        <h1 className="text-sm font-bold text-slate-800 md:text-base tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* --- BAGIAN KANAN: Informasi Instansi (Statis) --- */}
      <div className="flex items-center gap-4">
        {/* Info 1: Tanggal Hari Ini (Hidden di Mobile) */}
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

        {/* Separator */}
        <div className="hidden md:block h-8 w-px bg-slate-100 mx-1"></div>

        {/* Info 2: Identitas Instansi (Bapenda) */}
        <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-blue-200 shadow-md">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col pr-1">
            <span className="text-xs font-bold text-slate-800 leading-none">
              BAPENDA
            </span>
            <span className="text-[10px] font-medium text-slate-500 leading-none mt-0.5">
              Prov. Sulawesi Tenggara
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
