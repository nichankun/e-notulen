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
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md sticky top-0 z-40 justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="-ml-2 text-slate-500 hover:text-blue-600 transition-colors" />
        <Separator orientation="vertical" className="h-4 bg-slate-200" />
        <h1 className="text-sm font-black text-slate-800 md:text-base tracking-tight truncate uppercase">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden lg:flex items-center gap-2 text-right">
          <div className="flex flex-col items-end leading-none">
            <span className="text-[9px] uppercase font-black text-slate-400">
              Hari Ini
            </span>
            <span className="text-[11px] font-bold text-slate-600 mt-1">
              {dateFormatter.format(new Date())}
            </span>
          </div>
          <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
            <CalendarDays className="size-4" />
          </div>
        </div>

        <div className="hidden md:block h-6 w-px bg-slate-100"></div>

        <div className="flex items-center gap-2 bg-slate-50 pl-1 pr-4 py-1 rounded-full border border-slate-200 max-w-35 md:max-w-xs transition-all hover:bg-white">
          <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Building2 className="size-3.5" />
          </div>
          <div className="flex flex-col overflow-hidden leading-tight">
            <span className="text-[10px] font-black text-slate-800 uppercase truncate">
              {displayAgency}
            </span>
            <span className="text-[8px] font-bold text-blue-500 tracking-tighter uppercase truncate">
              Prov. Sultra
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
