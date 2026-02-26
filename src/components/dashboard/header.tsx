"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Building2, CalendarDays } from "lucide-react";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function Header({ userAgency }: { userAgency?: string }) {
  const pathname = usePathname();
  const displayAgency = userAgency || "BAPENDA";

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard Utama";
    if (pathname === "/dashboard/create") return "Buat Agenda Baru";
    if (pathname === "/dashboard/archive") return "Arsip Notulen";
    if (pathname === "/dashboard/users") return "Manajemen Users";
    if (pathname.includes("/live")) return "Live Control Room";
    if (pathname.includes("/result")) return "Hasil Laporan";
    return "E-Notulen";
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white/90 px-4 md:px-6 backdrop-blur-md sticky top-0 z-40 justify-between font-sans">
      {/* KIRI: Judul Halaman & Menu Trigger */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <SidebarTrigger className="-ml-2 text-gray-500 hover:text-[#0866ff] transition-colors" />
        <Separator orientation="vertical" className="h-4 bg-gray-300" />
        {/* Menghapus uppercase dan font-black agar lebih profesional & rapi */}
        <h1 className="text-[15px] md:text-base font-bold text-gray-900 tracking-tight truncate">
          {getPageTitle()}
        </h1>
      </div>

      {/* KANAN: Tanggal & Identitas Instansi */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Tanggal (Hanya Desktop) */}
        <div className="hidden lg:flex items-center gap-3 text-right">
          <div className="flex flex-col items-end leading-none">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              Hari Ini
            </span>
            <span className="text-xs md:text-[13px] font-bold text-gray-700">
              {dateFormatter.format(new Date())}
            </span>
          </div>
          <div className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
            <CalendarDays className="size-4.5" />
          </div>
        </div>

        {/* Separator Desktop */}
        <div className="hidden md:block h-6 w-px bg-gray-200"></div>

        {/* Badge Instansi */}
        <div className="flex items-center gap-2.5 bg-gray-50 pl-1.5 pr-4 py-1.5 rounded-full border border-gray-200 max-w-35 md:max-w-xs transition-colors hover:bg-gray-100">
          <div className="h-8 w-8 rounded-full bg-[#0866ff] text-white flex items-center justify-center shadow-sm shrink-0">
            <Building2 className="size-4" />
          </div>
          <div className="flex flex-col overflow-hidden leading-tight">
            <span className="text-[11px] font-bold text-gray-900 uppercase truncate">
              {displayAgency}
            </span>
            <span className="text-[9px] font-semibold text-[#0866ff] tracking-wide uppercase truncate">
              Prov. Sultra
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
