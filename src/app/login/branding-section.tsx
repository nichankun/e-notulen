"use client";

import { ClipboardList } from "lucide-react";

export function BrandingSection() {
  return (
    <div className="hidden lg:flex w-75 shrink-0 flex-col justify-between px-10 py-12 bg-primary">
      <div>
        <div className="flex items-center gap-3 mb-12">
          <div className="w-9 h-9 rounded-md flex items-center justify-center border border-primary-foreground/30">
            <ClipboardList className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium tracking-wide text-primary-foreground/90">
            Bapenda Prov. Sultra
          </span>
        </div>

        <h1 className="text-[2.6rem] font-medium leading-tight mb-4 text-primary-foreground">
          e-Notulen
        </h1>
        <p className="text-sm leading-relaxed text-primary-foreground/55">
          Digitalisasi laporan rapat dan absensi kehadiran pegawai secara
          terpadu.
        </p>
      </div>

      <p className="text-[11px] tracking-wide text-primary-foreground/30">
        © {new Date().getFullYear()} · Bapenda Provinsi Sulawesi Tenggara
      </p>
    </div>
  );
}
