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

const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard Utama",
  "/dashboard/create": "Buat Agenda Baru",
  "/dashboard/archive": "Arsip Notulen",
  "/dashboard/users": "Manajemen Users",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.includes("/live")) return "Live Control Room";
  if (pathname.includes("/result")) return "Hasil Laporan";
  return "E-Notulen";
}

export function Header({ userAgency }: { userAgency?: string }) {
  const pathname = usePathname();
  const displayAgency = userAgency || "BAPENDA";
  const today = new Date();

  return (
    <header className="flex h-14 shrink-0 items-center border-b bg-background/80 px-4 backdrop-blur-md sticky top-0 z-40 justify-between gap-2">
      {/* KIRI */}
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-primary transition-colors" />
        <Separator orientation="vertical" className="h-4" />
        <h1 className="text-sm font-semibold text-foreground tracking-tight truncate">
          {getPageTitle(pathname)}
        </h1>
      </div>

      {/* KANAN */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Tanggal — versi panjang di desktop, pendek di mobile */}
        <div className="flex items-center gap-2">
          <CalendarDays className="size-3.5 text-muted-foreground shrink-0" />
          <span className="hidden md:block text-xs text-muted-foreground">
            {dateFormatter.format(today)}
          </span>
          <span className="md:hidden text-xs text-muted-foreground">
            {shortDateFormatter.format(today)}
          </span>
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Badge Instansi */}
        <div className="flex items-center gap-1.5 bg-muted/50 pl-1 pr-3 py-1 rounded-full border border-border hover:bg-muted transition-colors">
          <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <Building2 className="size-3" />
          </div>
          <div className="flex flex-col overflow-hidden leading-tight">
            <span className="text-[10px] font-semibold text-foreground uppercase truncate max-w-24">
              {displayAgency}
            </span>
            {/* Label bawah hanya di desktop */}
            <span className="hidden md:block text-[9px] font-bold text-primary tracking-widest uppercase opacity-80">
              Prov. Sultra
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
