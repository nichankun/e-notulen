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
        className="-ml-4 hover:bg-transparent font-bold"
      >
        Identitas Pegawai
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),

    cell: ({ row }) => (
      <div className="flex flex-col min-w-0 max-w-64">
        <span
          className="font-bold text-slate-900 capitalize text-sm md:text-base truncate"
          title={row.getValue("name")}
        >
          {row.getValue("name")}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Fingerprint className="h-3 w-3 text-blue-400 shrink-0" />
          <span className="text-[10px] font-mono text-slate-500 tracking-tighter">
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
        <div className="flex items-center gap-2 text-slate-600 min-w-45">
          <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
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
          <Badge
            variant="outline"
            className={
              isAdmin
                ? "bg-blue-50 text-blue-700 border-blue-200 shadow-none gap-1.5 px-2.5 py-1"
                : "bg-slate-50 text-slate-600 border-slate-200 shadow-none gap-1.5 px-2.5 py-1"
            }
          >
            {isAdmin ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5" />
                Administrator
              </>
            ) : (
              <>
                <UserCircle className="h-3.5 w-3.5" />
                Staff Pegawai
              </>
            )}
          </Badge>
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
