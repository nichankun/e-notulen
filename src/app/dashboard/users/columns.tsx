"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Building2,
  Fingerprint,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "./user-actions";

// PERBAIKAN: Sinkronisasi tipe data dengan schema UUID dan Enum
export type User = {
  id: string; // HARUS string karena sekarang UUID
  name: string;
  nip: string;
  role: "admin" | "pegawai"; // Menyesuaikan dengan Enum role
  agency: string | null;
};

const formatNIP = (nip: string) => {
  return nip.replace(/(\d{8})(\d{6})(\d{1})(\d{3})/, "$1 $2 $3 $4");
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        // Dihapus hover:bg-transparent agar tombol header tetap punya efek interaktif bawaan shadcn
        className="-ml-4 font-bold"
      >
        Identitas Pegawai
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),

    cell: ({ row }) => (
      // max-w-64 diganti jadi max-w-[250px] agar valid di Tailwind
      <div className="flex flex-col min-w-0 max-w-62.5 md:max-w-75">
        <span
          // text-slate-900 diubah ke text-foreground
          className="font-bold text-foreground capitalize text-sm md:text-base truncate"
          title={row.getValue("name")}
        >
          {row.getValue("name")}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          {/* Ikon sidik jari menggunakan warna primary agar senada dengan tema aplikasi */}
          <Fingerprint className="h-3 w-3 text-primary/70 shrink-0" />
          <span className="text-[10px] font-mono text-muted-foreground tracking-tighter">
            NIP. {formatNIP(row.original.nip)}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "agency",
    header: "Instansi",
    cell: ({ row }) => {
      const agency = row.getValue("agency") as string;
      return (
        // min-w-45 diganti jadi min-w-[180px] agar valid
        <div className="flex items-center gap-2 text-muted-foreground min-w-45">
          {/* bg-slate-100 dan border-slate-200 diubah ke semantic colors shadcn */}
          <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <span className="uppercase text-[10px] font-bold tracking-tight leading-tight truncate">
            {agency || "Badan Pendapatan Daerah"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Hak Akses",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const isAdmin = role === "admin";

      return (
        <div className="whitespace-nowrap">
          {/* PERBAIKAN: Menggunakan varian Badge ketimbang manual class string */}
          {isAdmin ? (
            <Badge
              variant="outline"
              // Admin diberi warna utama (primary) tapi dengan background transparan agar elegan
              className="bg-primary/10 text-primary border-primary/20 gap-1.5 px-2.5 py-1"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Administrator
            </Badge>
          ) : (
            <Badge
              // Pegawai menggunakan varian secondary (warna kalem bawaan tema)
              variant="secondary"
              className="text-muted-foreground gap-1.5 px-2.5 py-1"
            >
              <UserCircle className="h-3.5 w-3.5" />
              Staff Pegawai
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Opsi</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end pr-2">
        <UserActions user={row.original} />
      </div>
    ),
  },
];
