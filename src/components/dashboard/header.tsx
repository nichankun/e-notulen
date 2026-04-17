"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Building2, CalendarDays } from "lucide-react";

// Formatter di luar untuk efisiensi
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
    // PERBAIKAN 1: Menggunakan bg-background/80 dan border-border agar senada dengan shadcn
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 md:px-6 backdrop-blur-md sticky top-0 z-40 justify-between">
      {/* KIRI: Judul Halaman & Menu Trigger */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        {/* PERBAIKAN 2: Hover color diganti ke primary */}
        <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-primary transition-colors" />
        <Separator orientation="vertical" className="h-4" />

        <h1 className="text-sm md:text-base font-bold text-foreground tracking-tight truncate">
          {getPageTitle()}
        </h1>
      </div>

      {/* KANAN: Tanggal & Identitas Instansi */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Tanggal (Hanya Desktop) */}
        <div className="hidden lg:flex items-center gap-3 text-right">
          <div className="flex flex-col items-end leading-none">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
              Hari Ini
            </span>
            <span className="text-xs md:text-[13px] font-bold text-foreground">
              {dateFormatter.format(new Date())}
            </span>
          </div>
          {/* PERBAIKAN 3: Menggunakan bg-muted agar lebih soft */}
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground border">
            <CalendarDays className="size-4" />
          </div>
        </div>

        {/* Separator Desktop */}
        <div className="hidden md:block h-6 w-px bg-border"></div>

        {/* Badge Instansi */}
        {/* PERBAIKAN 4: Menggunakan bg-muted/50 dan warna primary semantik */}
        <div className="flex items-center gap-2.5 bg-muted/50 pl-1.5 pr-4 py-1.5 rounded-full border border-border max-w-35 md:max-w-xs transition-colors hover:bg-muted">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm shrink-0">
            <Building2 className="size-4" />
          </div>
          <div className="flex flex-col overflow-hidden leading-tight">
            <span className="text-[10px] font-bold text-foreground uppercase truncate">
              {displayAgency}
            </span>
            <span className="text-[9px] font-bold text-primary tracking-widest uppercase truncate opacity-80">
              Prov. Sultra
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
