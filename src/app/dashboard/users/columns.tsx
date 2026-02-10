"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Definisi Tipe Data User
export type User = {
  id: string;
  name: string;
  nip: string;
  email: string;
  role: "admin" | "pegawai";
  status: "active" | "inactive";
};

export const columns: ColumnDef<User>[] = [
  // Kolom NIP (Font Mono agar angka sejajar)
  {
    accessorKey: "nip",
    header: "NIP",
    cell: ({ row }) => (
      <div className="font-mono text-xs md:text-sm text-slate-500 whitespace-nowrap">
        {row.getValue("nip")}
      </div>
    ),
  },
  // Kolom Nama (Lebar Minimum agar tidak gepeng di HP)
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 hover:bg-transparent"
        >
          Nama Lengkap
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      // min-w-[180px] memaksa tabel melebar dan memicu scroll horizontal di HP
      <div className="font-bold text-slate-800 min-w-45 whitespace-nowrap capitalize">
        {row.getValue("name")}
      </div>
    ),
  },
  // Kolom Email (Disembunyikan jika kosong, Lebar Minimum)
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-slate-600 min-w-37.5 whitespace-nowrap">
        {row.getValue("email") || "-"}
      </div>
    ),
  },
  // Kolom Role
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <div className="whitespace-nowrap">
          <Badge
            variant={role === "admin" ? "default" : "secondary"}
            className={
              role === "admin"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }
          >
            {role === "admin" ? "Administrator" : "Pegawai"}
          </Badge>
        </div>
      );
    },
  },
  // Kolom Status
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="whitespace-nowrap">
          <div
            className={`text-xs font-bold inline-flex items-center px-2 py-1 rounded-full border ${
              status === "active"
                ? "text-green-700 bg-green-50 border-green-200"
                : "text-red-700 bg-red-50 border-red-200"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full mr-2 ${status === "active" ? "bg-green-600" : "bg-red-600"}`}
            ></span>
            {status === "active" ? "Aktif" : "Non-Aktif"}
          </div>
        </div>
      );
    },
  },
  // Kolom Aksi
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-slate-100"
              >
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(user.nip);
                  // Opsional: Tambahkan toast di sini jika mau
                }}
                className="cursor-pointer"
              >
                Salin NIP
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                Edit Pengguna
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                Hapus Pengguna
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
