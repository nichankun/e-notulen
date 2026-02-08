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
  // Kolom NIP
  {
    accessorKey: "nip",
    header: "NIP",
  },
  // Kolom Nama (Bisa disortir)
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Lengkap
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  // Kolom Email
  {
    accessorKey: "email",
    header: "Email",
  },
  // Kolom Role (Pakai Badge)
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant={role === "admin" ? "default" : "secondary"}>
          {role === "admin" ? "Administrator" : "Pegawai"}
        </Badge>
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
        <div
          className={`text-xs font-medium ${
            status === "active" ? "text-green-600" : "text-red-600"
          }`}
        >
          {status === "active" ? "Aktif" : "Non-Aktif"}
        </div>
      );
    },
  },
  // Kolom Aksi (Dropdown)
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Buka menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.nip)}
            >
              Salin NIP
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit Pengguna</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Hapus Pengguna
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
