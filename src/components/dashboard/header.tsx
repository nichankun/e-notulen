"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function Header() {
  const pathname = usePathname();

  // Helper untuk menentukan judul & subtitle berdasarkan route
  const getPageInfo = () => {
    if (pathname === "/dashboard") return "Dashboard Utama";
    if (pathname === "/dashboard/create") return "Buat Agenda Baru";
    if (pathname === "/dashboard/archive") return "Arsip Notulen";
    if (pathname.includes("/live")) return "Live Control Room";
    return "E-Notulen";
  };

  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sticky top-0 z-10 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      {/* 1. Kiri: Trigger Sidebar & Separator (Standar Dokumentasi Shadcn) */}
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 text-slate-500 hover:text-blue-600" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-slate-200" />
      </div>

      {/* 2. Tengah & Kanan: Konten Custom Aplikasi */}
      <div className="flex flex-1 items-center justify-between">
        {/* Judul Halaman */}
        <div className="flex flex-col">
          <h1 className="text-sm font-bold text-slate-800 md:text-base tracking-tight">
            {getPageInfo()}
          </h1>
          <p className="text-[10px] text-slate-500 hidden md:block font-medium">
            {currentDate}
          </p>
        </div>

        {/* Profil User (Sesuai Desain HTML Anda) */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block leading-tight">
            <p className="text-xs font-bold text-slate-800">Admin IT Bapenda</p>
            <div className="flex items-center justify-end gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              </span>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                Online
              </p>
            </div>
          </div>
          <div className="h-9 w-9 rounded-full bg-linear-to-tr from-blue-600 to-blue-800 text-white flex items-center justify-center font-bold shadow-md border-2 border-white text-xs">
            IT
          </div>
        </div>
      </div>
    </header>
  );
}
